const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Inquiry Model
 * =============
 */

const Inquiry = new keystone.List('Inquiry', {
	autokey: { from: 'content', path: 'slug', unique: true }
});

Inquiry.add({
	title: {
		type: String,
		label: '标题'
	},
	content: {
		type: String,
		required: true,
		initial: true,
		label: 'Inquiry'
	},
	user: {
		type: Types.Relationship,
		ref: 'User',
		required: true,
		initial: true,
		label: '用户'
	},
	university: {
		type: Types.Relationship,
		ref: 'University',
		initial: true,
		label: '大学'
	},
	course: {
		type: Types.Relationship,
		ref: 'Course',
		label: '课程'
	},
	training: {
		type: Types.Relationship,
		ref: 'Training',
		label: '培训课程'
	},
	program: {
		type: Types.Relationship,
		ref: 'Program',
		label: 'Program'
	},
	tags: {
		type: Types.TextArray,
		label: 'tags'
	},
	answerQuantity: { type: Number, label: '回答数量' },
	commentQuantity: { type: Number, label: '评论数量' },
	isFeatured: { type: Boolean, label: '是否为精选问题' },
	isVerified: { type: Boolean, label: '是否审核成功' },
	createdAt: { type: Date, default: Date.now, label: '发布于' }
});

Inquiry.defaultSort = '-createdAt';
Inquiry.defaultColumns = 'content, user';

Inquiry.register();
