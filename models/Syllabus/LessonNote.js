const keystone = require('keystone');
const { logger } = require('../../utils/logger');
import { POST_STATUS } from '../../utils/constants';
import { isEmpty } from 'lodash';
const Types = keystone.Field.Types;

/**
 * LessonNote Model
 * ============
 */

const LessonNote = new keystone.List('LessonNote');

LessonNote.add({
	content: {
		type: Types.Html,
		wysiwyg: true,
		label: '课程随堂笔记',
		required: true,
		initial: true
	},
	user: {
		type: Types.Relationship,
		ref: 'User',
		label: '用户',
		required: true,
		initial: true
	},
	lesson: {
		type: Types.Relationship,
		ref: 'Lesson',
		label: '课程',
		required: true,
		initial: true
	},
	program: {
		type: Types.Relationship,
		ref: 'Program',
		label: '技能培训班'
	},
	materials: {
		type: Types.Relationship,
		ref: 'Material',
		label: '随堂笔记文档资料',
		many: true
	},
	createdAt: { type: Date, default: Date.now, label: '创建于' },
	isFeatured: {
		type: Boolean,
		initial: false,
		label: '是否选为精选笔记'
	},
	state: {
		type: Types.Select,
		options: Object.values(POST_STATUS),
		default: POST_STATUS.PUBLISHED,
		index: true
	}
});

LessonNote.schema.pre('save', async function(next) {
	//prevent duplicate lesson note to be created in keystone
	const lessonNote = await LessonNote.model.find({
		user: this.user,
		lesson: this.lesson
	});
	if (!isEmpty(lessonNote) && this.isNew) {
		logger.error({
			error: 'LESSONNOTE_HAS_EXISTED',
			message: 'Lesson note for this user and course has existed.'
		});
		return next(
			new Error('Lesson note for this user and course has existed.')
		);
	}
	next();
});

LessonNote.defaultSort = '-createdAt';
LessonNote.defaultColumns = 'content, user, lesson';

LessonNote.register();
