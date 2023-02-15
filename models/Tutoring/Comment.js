import { logger } from '../../utils/logger';
import { isEqual, isUndefined } from 'lodash';
const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Comment Model
 * ============
 */

const Comment = new keystone.List('Comment', {
	autokey: { from: 'title', path: 'key', unique: true }
});

Comment.add(
	{
		content: {
			type: String,
			label: 'Comment评论内容',
			initial: true,
			require: true
		},
		from: {
			type: Types.Relationship,
			ref: 'User',
			label: '写Comment的用户',
			initial: true,
			require: true
		},
		to: {
			type: Types.Relationship,
			ref: 'User',
			label: '被Comment的用户',
			initial: true
		},
		comment: {
			type: Types.Relationship,
			ref: 'Comment',
			label: '父级评论',
			note: '一级评论此处为空',
			initial: true
		},
		response: {
			type: Types.Relationship,
			ref: 'Response',
			label: '答案',
			initial: true
		},
		isVerified: { type: Boolean, label: '是否审核成功', initial: true },
		isFeatured: { type: Boolean, label: '是否为精选评论', initial: true },
		createdAt: { type: Date, default: Date.now, label: '发布于' }
	},
	{
		jobInterview: {
			type: Types.Relationship,
			ref: 'JobInterview',
			label: '面试经验'
		}
	}
);

//hooks
Comment.schema.pre('save', async function(next) {
	//prevent more than two featured comment in same response - in keystone
	if (this.isFeatured) {
		const comments = await Comment.model.find({
			response: this.response,
			isFeatured: true
		});
		if (comments.length >= 2) {
			if (
				isUndefined(
					comments.find(comment => isEqual(comment._id, this._id))
				)
			) {
				logger.error({
					error: 'FEATURED_COMMENTS_OVER_LIMIT',
					message:
						'Featured reply for this comment have reached limit.'
				});
				return next(
					new Error(
						'Featured comments for this response have reached limit.'
					)
				);
			}
		}
	}
	next();
});

Comment.defaultSort = '-createdAt';
Comment.defaultColumns =
	'content|35%, isFeatured|5%, isVerified|20%, from|10%, to|10%';

Comment.register();
