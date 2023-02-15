import {
	PAY_METHOD,
} from '../../utils/constants';

const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Transaction Model
 * =============
 */

const Transaction = new keystone.List('Transaction', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

Transaction.add(
	'Basic Information',
	{
		name: { type: String, required: true, default: 'Transaction' },
		user: { type: Types.Relationship, ref: 'User' },
		orders: { type: Types.Relationship, ref: 'Order', many: true },
		paymentAmount: { type: Number },
		paymentMethod: {
			type: Types.Select,
			options: Object.values(PAY_METHOD),
			label: '付款方式'
		},
		domainName: {
			type: String, note: 'domain name of client site'
		},
		createdAt: { type: Date, default: Date.now }
	},
	'Stripe Transaction Information',
	{
		sessionId: { type: String, dependsOn: { paymentMethod: PAY_METHOD.STRIPE } },
		paymentIntent: { type: String, dependsOn: { paymentMethod: PAY_METHOD.STRIPE } },
		paymentStatus: {
			type: Types.Select,
			options: 'paid, unpaid',
			default: 'unpaid',
			dependsOn: { paymentMethod: PAY_METHOD.STRIPE }
		}
	},
	'Apple Pay Transaction Information', // Obtain from Apply Pay JS API via front-end
	{
		merchantSessionId: { type: String, dependsOn: { paymentMethod: PAY_METHOD.APPLE_PAY } },
		transactionId: { type: String, dependsOn: { paymentMethod: PAY_METHOD.APPLE_PAY } }, // transactionId can be obtained after the payment is completed
		applePayPayment: {
			displayName: { type: String }, // The display name of card of user
			network: { type: String }, // e.g. MasterCard
			type: { type: String }, // e.g. credit
		}
	},
);
Transaction.defaultColumns =
	'name, user, paymentMethod, paymentAmount, createdAt';

Transaction.register();
