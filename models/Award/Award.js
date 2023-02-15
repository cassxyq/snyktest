import { PAGEANT_TYPE } from '../../utils/constants';
const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Award
 * ============
 */

const Award = new keystone.List('Award', {
	map: { name: 'title' },
	autoKey: { from: 'title', path: 'slug', unique: true }
});

Award.add(
	{
		title: { type: String, initial: true, required: true },
		ordinalNumber: {
			type: Number,
			format: '0',
			label: '第几届',
			note: '比如第一届，请填写1',
			initial: true
		},
		university: {
			type: Types.Relationship,
			ref: 'University',
			initial: true
		},
		pageantType: {
			type: Types.Select,
			options: Object.values(PAGEANT_TYPE)
		},
		pageview: { type: Number, format: '0', label: '访问量', default: 0 },
		description: {
			type: Types.Textarea,
			label: '活动说明'
		},
		coverPhoto: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true,
			label: '分享转发活动的图片(max:500X400px, ratio: 5:4)'
		},
		customServiceName: { type: String, label: '客服名称' },
		customServiceQRCode: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true,
			label: '客服二维码(max:400X400px)'
		},
		instruction: {
			type: Types.Textarea,
			label: '参赛须知'
		},
		banner: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true,
			label: '牛圈广告图片'
		}
	},
	'Agenda',
	{
		startDate: { type: Types.Datetime, label: '活动开始时间/报名开始时间' },
		voteStartDate: { type: Types.Datetime, label: '评选开始时间' },
		endDate: { type: Types.Datetime, label: '活动结束时间' }
	},
	'Sponsor',
	{
		goldSponsor: {
			type: Types.Relationship,
			ref: 'Company',
			label: '一级赞助商'
		},
		silverSponsor: {
			type: Types.Relationship,
			ref: 'Company',
			many: true,
			label: '二级赞助商'
		},
		bronzeSponsor: {
			type: Types.Relationship,
			ref: 'Company',
			many: true,
			label: '三级赞助商'
		}
	}
);

Award.defaultColumns =
	'title, ordinalNumber, university, pageantType, pageview, startDate, goldSponsor';
Award.register();
