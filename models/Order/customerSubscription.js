const keystone = require('keystone');
const { stripe } = require('../../config/stripe-config');
const { SUBSCRIPTION_PRODUCT_STATUS } = require('../../utils/constants');
const Types = keystone.Field.Types;


/**
 * Customer Subscription Model
 * =============
 */

const CustomerSubscription = new keystone.List('CustomerSubscription', {
	autokey: { from: 'company', path: 'slug', unique: true }
});

CustomerSubscription.add(
	'Customer Subscription Info',
	{
		user: { type: Types.Relationship, ref: 'User', initial: true, required: true, noedit: true },
		company: { type: Types.Relationship, ref: 'Company', initial: true, required: true, noedit: true },
		subscription: { type: Types.Relationship, ref: 'Subscription', initial: true, filters: { status: SUBSCRIPTION_PRODUCT_STATUS.ACTIVE.value } },
		isActive: { type: Boolean, default: false },
		startDate: { type: Date },
		endDate: { type: Date },
		subscriptionOfNextBillingCycle: { type: Types.Relationship, ref: 'Subscription', filters: { status: SUBSCRIPTION_PRODUCT_STATUS.ACTIVE.value } }
	},
	'Payment Platform Info Reference',
	{
		platformCustomerId: { type: String, noedit: true },
		platformSubscriptionId: { type: String, noedit: true },
	},
	'Billing Info',
	{
		billingInfo: {
			companyName: { type: String },
			billingEmail: { type: String },
			addressLine1: { type: String },
			addressLine2: { type: String },
			cityName: { type: String },
			zip: { type: Number },
			state: { type: String },
			countryName: { type: String }
		}
	}
);

/**
 * This hook handles the auto updating of subscription at Stripe when the related content is modified at JRKeystone
 */
CustomerSubscription.schema.pre('save', async function (next) {
	const subInfo = this._doc;
	const platformSubId = subInfo.platformSubscriptionId;
	// having such two params means the incoming api call is an update call instead of a creation call
	if (platformSubId && subInfo.platformCustomerId) {
		const newNextSubPlan = subInfo.subscriptionOfNextBillingCycle;
		const nextSubPlan = (await keystone.list('CustomerSubscription').model.findById(subInfo._id)).subscriptionOfNextBillingCycle;
		if (newNextSubPlan !== nextSubPlan) {
			const newPriceId = (await keystone.list('Subscription').model.findById(newNextSubPlan)).priceId;
			const subscriptionItemId = (await stripe.subscriptions.retrieve(platformSubId)).items.data[0].id;
			await stripe.subscriptions.update(platformSubId, {
				proration_behavior: 'create_prorations',
				items: [{
					id: subscriptionItemId,
					price: newPriceId,
				}]
			});
		}
	}
	next();
});

CustomerSubscription.defaultColumns =
	'company, subscription, isActive, user, startDate, endDate';

CustomerSubscription.register();
