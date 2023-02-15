const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Response Model
 * ============
 */

const Response = new keystone.List('Response', {
	autokey: { from: 'title', path: 'key', unique: true }
});

Response.add({
	title: {
		type: String,
		label: '标题'
	},
	content: {
		type: String,
		wysiwyg: true,
		label: 'Response'
	},
	user: {
		type: Types.Relationship,
		ref: 'User',
		label: '用户'
	},
	inquiry: {
		type: Types.Relationship,
		ref: 'Inquiry',
		label: '问题'
	},
	answerQuantity: { type: Number, label: '回答数量' },
	commentQuantity: { type: Number, label: '评论数量' },
	isVerified: { type: Boolean, label: '是否审核成功' },
	isFeatured: { type: Boolean, label: '是否为精选评论' },
	createdAt: { type: Date, default: Date.now, label: '发布于' }
});

Response.defaultSort = '-createdAt';
Response.defaultColumns = 'content, user';

Response.register();
