const keystone = require('keystone');
const { PROVIDER_TYPES } = require('../../utils/constants');
const Types = keystone.Field.Types;

/**
 * Subscription Order Model
 * =============
 */

const SubscriptionOrder = new keystone.List('SubscriptionOrder', {
	autokey: { from: 'platformSubscriptionId', path: 'slug', unique: true }
});

SubscriptionOrder.add(
	'Order Info',
	{
		user: { type: Types.Relationship, ref: 'User', noedit: true },
		amountSubtotal: { type: Number },
		amountTotal: { type: Number },
		amountPaid: { type: Number },
		currency: { type: String },
		created: { type: Date }
	},
	'Payment Platform Info Reference',
	{
		paymentPlatform: { type: Types.Select, options: Object.values(PROVIDER_TYPES), default: PROVIDER_TYPES.OTHER_PROVIDERS.value, noedit: true },
		platformInvoiceId: { type: String, noedit: true },
	}
);

SubscriptionOrder.defaultColumns = 'user, amountTotal, amountPaid, created';

SubscriptionOrder.register();