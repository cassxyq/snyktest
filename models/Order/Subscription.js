import { stripe } from '../../config/stripe-config';
import {
	PLATFORMS,
	PROVIDER_TYPES,
	SUBSCRIPTION_APPLICATIONS,
	SUBSCRIPTION_PRODUCT_STATUS,
	SUBSCRIPTION_TYPES
} from '../../utils/constants';

const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Subscription Model
 * =============
 * Notes: due to the limitations of Stripe (to minimise the consequence of leaking the Stripe key)
   1. The Stripe APIs cannot execute the price and billing cycle update.
   2. Only the invalidation instead of the real deletion of the product can be executed through the Stripe APIs. 
      So, after deleting a product in the JRKeystone, the product is not activated and cannot accept new subscriptions, 
	  but it still can be found in the stripe’s “archived“ column.
   3. All operations can be executed in the Stripe dashboard.
   reference: https://stripe.com/docs/api/products/update?lang=node and https://stripe.com/docs/api/prices/update?lang=node
 */

const Subscription = new keystone.List('Subscription', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

Subscription.add({
	platform: {
		type: Types.Select,
		initial: true,
		options: Object.values(PLATFORMS)
	},
	application: {
		type: Types.Select,
		initial: true,
		options: Object.values(SUBSCRIPTION_APPLICATIONS),
	},
	provider: {
		type: Types.Select,
		initial: true,
		options: Object.values(PROVIDER_TYPES),
		noedit: true
	},
	priceId: { type: String, noedit: true },
	type: {
		type: Types.Select,
		initial: true,
		required: true,
		options: Object.values(SUBSCRIPTION_TYPES),
		default: SUBSCRIPTION_TYPES.MONTHLY.value,
		noedit: true
	},
	name: {
		type: String,
		initial: true,
		required: true
	},
	price: {
		type: Number,
		initial: true,
		require: true,
		noedit: true,
		dependsOn: { provider: PROVIDER_TYPES.STRIPE.value }
	},
	description: { type: String, initial: true, required: true, dependsOn: { provider: PROVIDER_TYPES.STRIPE.value } },
	status: {
		type: Types.Select,
		required: true,
		options: Object.values(SUBSCRIPTION_PRODUCT_STATUS),
		default: SUBSCRIPTION_PRODUCT_STATUS.ACTIVE.value
	},
	createdAt: { type: Date, default: Date.now },
	zhLabel: { type: String },
	engLabel: { type: String }
});


/**
 * This middleware handles the automatic creation and updating of a subscription product at stripe
 * 1. when creating a subscription product at the JRKeystone, create one at stripe automatically
 * 2. when updating a subscription product at the JRKeystone, update this one at stripe automatically
 */
Subscription.schema.pre('save', async function (next) {
	const productInfo = this._doc;
	const priceId = productInfo.priceId;
	if (productInfo.provider === PROVIDER_TYPES.STRIPE.value) {
		const type = productInfo.type;
		// the _doc of the query from JRKeystone contains all data (if exists) of an object
		// if the stripe price ID does not exist in the query from JRKeystone (there is no such a subscription product at stripe), 
		// that means the incoming query is a creation query from JRKeystone, then create a new subscription product at stripe before save it into our database
		if (!priceId) {
			const unit_amount = productInfo.price * 100;
			try {
				const product = await stripe.products.create({
					name: productInfo.name,
					description: productInfo.description
				});
				let price;
				switch (type) {
					case SUBSCRIPTION_TYPES.MONTHLY.value:
						price = await stripe.prices.create({
							unit_amount,
							currency: 'aud',
							recurring: {
								interval: 'month'
							},
							product: product.id
						});
						break;
					case SUBSCRIPTION_TYPES.ANNUALLY.value:
						price = await stripe.prices.create({
							unit_amount,
							currency: 'aud',
							recurring: {
								interval: 'year'
							},
							product: product.id
						});
						break;
					case SUBSCRIPTION_TYPES.QUARTERLY.value:
						price = await stripe.prices.create({
							unit_amount,
							currency: 'aud',
							recurring: { interval: 'month', interval_count: 3 },
							product: product.id
						});
						break;
					default:
						price = await stripe.prices.create({
							unit_amount,
							currency: 'aud',
							product: product.id
						});
				}
				await stripe.products.update(product.id, { default_price: price.id });
				this._doc.priceId = price.id;
			} catch (error) {
				throw new Error(error.message || 'Failed to create the product on stripe automatically.');
			}
		}
		// if the price ID exists in the query from JRKeystone (there is such a subscription product at stripe),
		// that means the incoming query is an updating query from JRKeystone, then update this subscription product at stripe before update it in our database
		if (priceId) {
			try {
				const productId = (await stripe.prices.retrieve(priceId)).product;
				const active =
				productInfo.status === SUBSCRIPTION_PRODUCT_STATUS.ACTIVE.value;
				await stripe.products.update(
					typeof productId === 'string' ? productId : null,
					{
						name: productInfo.name,
						description: productInfo.description,
						active
					}
				);
				await stripe.prices.update(priceId, { active });
			} catch (error) {
				throw new Error(error.message || 'Failed to update the product on stripe automatically.');
			}
		}
	}
	next();
});

/**
 * This middleware handles the synchronization of subscription product data saved in our database and Stripe
 * @param {this} price - the price object fetched from stripe
 */
const synchronise = async price => {
	let type;
	if (price.type === 'recurring') {
		const interval = price.recurring.interval;
		if (interval) {
			switch (interval) {
				case 'month':
					type =
						price.recurring.interval_count === 1
							? SUBSCRIPTION_TYPES.MONTHLY.value
							: SUBSCRIPTION_TYPES.QUARTERLY.value;
					break;
				default:
					type = SUBSCRIPTION_TYPES.ANNUALLY.value;
			}
		}
	} else {
		type = SUBSCRIPTION_TYPES.ONE_TIME.value;
	}
	const productId = typeof price.product === 'string' ? price.product : null;
	const stripeProduct = await stripe.products.retrieve(productId);
	await Subscription.model.updateOne(
		{ priceId: price.id },
		{
			provider: PROVIDER_TYPES.STRIPE.value,
			name: stripeProduct.name,
			description: stripeProduct.description,
			price: price.unit_amount / 100,
			status: stripeProduct.active
				? SUBSCRIPTION_PRODUCT_STATUS.ACTIVE.value
				: SUBSCRIPTION_PRODUCT_STATUS.INACTIVE.value,
			type
		}
	);
};

/**
 * This middleware handles the auto synchronization of database and Stripe
 * It can automatically synchronize subscription products saved in our database and Stripe
 */
Subscription.schema.pre('find', async function () {
	const Subscription = keystone.list('Subscription');
	try {
		const prices = await stripe.prices.list({ limit: 100 });
		for (const price of prices.data) {
			const savedProduct = await Subscription.model.findOne({
				priceId: price.id
			});
			if (savedProduct) {
				await synchronise(price);
			}
		}
	} catch (error) {
		throw new Error(error.message || 'Failed to synchronise the product from stripe automatically.');
	}
});

/**
 * This middleware handles the auto deletion of subscription product data saved in our database and Stripe
 * note: the real deletion of the product is not allowed through the strip api call, the only thing we can do through
 * an api call is to deactivate the product and the price object
 */
Subscription.schema.pre('remove', async function (next) {
	const productInfo = this._doc;
	const priceId = productInfo.priceId;
	try {
		if (priceId && productInfo.provider === PROVIDER_TYPES.STRIPE.value) {
			let productId = (await stripe.prices.retrieve(priceId)).product;
			productId = typeof productId === 'string' ? productId : '';
			await stripe.products.update(productId, { active: false });
			await stripe.prices.update(priceId, { active: false });
		}
	} catch (error) {
		throw new Error(error.message || 'Failed to remove the product on stripe automatically.');
	}
	next();
});

Subscription.defaultColumns =
	'name|20%, platform, application, provider, status, type, price';

Subscription.register();
