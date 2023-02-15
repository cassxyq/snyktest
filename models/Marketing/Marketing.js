const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Marketing Model
 * =============
 */

const Marketing = new keystone.List('Marketing', {
	autokey: { from: 'name', path: 'slug', unique: true, sortable: true }
});

Marketing.add(
	{
		name: { type: String, required: true },
		universityAlias: {
			type: String,
			note: '最9个字节包括汉字, 超出部分会被省略, eg:墨尔本皇家理工大学'
		},
		titleRegexString: { type: String },
		resultTitleRegexString: { type: String },
		bodyRegexString: { type: String },
		options: {
			type: Types.CloudinaryImages,
			note: '最多6个，用于设置锦鲤转盘上的6个大学'
		},
		marketingImage: { type: Types.CloudinaryImage },
		thumbnailImage: { type: Types.CloudinaryImage },
		thumbnailUrl: { type: String },
		type: {
			type: Types.Select,
			options: 'Counting, Certificate',
			default: 'Counting'
		},
		count: { type: Number, default: 0 }
	},
	'SEO For Google(Required)',
	{
		meta: {
			title: { type: String, initial: true },
			keywords: { type: String, initial: true, note: '用英文 逗号 隔开' },
			description: {
				type: Types.Textarea,
				note: '必须最少40个字，最多90个字 For SEO',
				initial: true,
				label: 'Meta Description'
			}
		}
	}
);

Marketing.defaultColumns = 'name, count';
Marketing.register();
