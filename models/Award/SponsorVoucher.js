import { SPONSOR_VOUCHER_TYPE } from '../../utils/constants';
const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * SponsorVoucher
 * ============
 */

const SponsorVoucher = new keystone.List('SponsorVoucher', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

SponsorVoucher.add(
	{
		name: { type: String, initial: true }
	},
	'Basic info',
	{
		company: { type: Types.Relationship, ref: 'Company', label: '公司' },
		type: {
			type: Types.Select,
			options: Object.values(SPONSOR_VOUCHER_TYPE),
			default: SPONSOR_VOUCHER_TYPE.DISCOUNT.value
		},
		discount: {
			type: Number,
			format: '0',
			label: '折扣',
			note: '比如八折，请填写20',
			dependsOn: { type: SPONSOR_VOUCHER_TYPE.DISCOUNT }
		},
		voucherValue: {
			type: Number,
			format: '0',
			label: '抵用券额度',
			dependsOn: { type: SPONSOR_VOUCHER_TYPE.VOUCHER }
		},
		description: { type: String, label: '说明' },
		expiryDate: { type: Types.Datetime, label: '有效期' },
		voucherImage: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true,
			label: '优惠券图片'
		},
		isInvalid: { type: Boolean, label: '停止发放', default: false }
	},
	'Award',
	{
		award: { type: Types.Relationship, ref: 'Award', label: '赞助活动' }
	}
);

SponsorVoucher.schema.pre('save', async function(next) {
	try {
		if (this.type === SPONSOR_VOUCHER_TYPE.VOUCHER.value) {
			this.discount = null;
		} else if (this.type === SPONSOR_VOUCHER_TYPE.DISCOUNT.value) {
			this.voucherValue = null;
		}
		next();
	} catch (err) {
		next(err);
	}
});

SponsorVoucher.defaultColumns =
	'name, type, discount, voucherValue, expiryDate, company, award, isInvalid';
SponsorVoucher.register();
