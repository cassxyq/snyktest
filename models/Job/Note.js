const keystone = require('keystone');
const Types = keystone.Field.Types;
const { POST_STATUS } = require('../../utils/constants');
const { NOTE_TYPE } = require('../../utils/constants');
const { NOTE_YEARS } = require('../../utils/constants');

/**
 * Note Model
 * ==================
 */

const Note = new keystone.List('Note', {
	map: { name: 'title' },
	autokey: { path: 'key', from: 'title', unique: true }
});

Note.add(
	{
		title: { type: String, required: true },
		company: {
			type: Types.Relationship,
			ref: 'Company'
		},
		tutor: {
			type: Types.Relationship,
			ref: 'Tutor'
		},
		type: {
			type: Types.Select,
			options: Object.values(NOTE_TYPE),
			note: '发布笔记类型(求职攻略/学习攻略)'
		},
		state: {
			type: Types.Select,
			options: Object.values(POST_STATUS),
			default: POST_STATUS.DRAFT,
			index: true,
			note: '发布状态(草稿/发布)'
		},
		publishedDate: {
			type: Types.Date,
			index: true,
			dependsOn: { state: POST_STATUS.PUBLISHED }
		}
	},
	'Top Note (学霸笔记)',
	{
		user: { type: Types.Relationship, ref: 'User', label: '发布人(必填)' },
		course: {
			type: Types.Relationship,
			ref: 'Course',
			label: '相关课程(必填)'
		},
		material: {
			type: Types.Relationship,
			ref: 'Material',
			note: '完整文件，收费'
		},
		resource: {
			type: Types.Relationship,
			ref: 'Resource',
			note: '预览文件，免费'
		},
		price: {
			type: Types.Select,
			options: '0, 9, 19, 29',
			numeric: true
		},
		year: {
			type: Types.Select,
			options: NOTE_YEARS
		},
		semester: {
			type: Types.Select,
			options: '1, 2, 3'
		},
		score: { type: String },
		wordCount: { type: Number },
		pageCount: { type: Number },
		description: { type: Types.Textarea, label: '笔记描述' },
		finishedAt: {
			type: String,
			label: '完成于',
			note: 'e.g. Semester 2, 2022'
		},
		isVerified: { type: Boolean, initial: false, label: '是否审核成功' },
		isFeatured: {
			type: Boolean,
			initial: false,
			label: '是否选为精选笔记'
		}
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
	},
	'Note Content',
	{
		content: {
			type: Types.Html,
			wysiwyg: true,
			height: 800,
			label: '正文'
		},
		createdAt: { type: Date, default: Date.now }
	}
);

Note.defaultSort = '-publishedDate';

Note.schema.virtual('content.full').get(function() {
	return this.content;
});

Note.schema.virtual('url').get(() => {
	return '/notes/' + this.key;
});

Note.defaultColumns = 'title, user, course, isVerified, isFeatured';

Note.register();
