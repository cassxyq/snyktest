const keystone = require('keystone');
const Types = keystone.Field.Types;
const {
	handleInitialQuestionsCount,
	handleOneQuestionCount
} = require('./handleInterviewQuestionAnswerCount');
const { logger } = require('../../utils/logger');

/**
 * Job Interview Question Model
 * ==================
 */
const JobInterviewQuestion = new keystone.List('JobInterviewQuestion', {
	map: { name: 'question' },
	autokey: { path: 'key', from: 'question', unique: true }
});

JobInterviewQuestion.add({
	question: {
		type: String,
		required: true,
		initial: true,
		index: true,
		maxlength: 100
	},
	poster: {
		type: Types.Relationship,
		ref: 'User',
		required: true,
		initial: true
	},
	interviewCompany: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true
	},
	position: {
		type: Types.Relationship,
		ref: 'JobCategory',
		required: true,
		initial: true,
		index: true
	},
	answers: {
		type: Types.Relationship,
		ref: 'JobInterviewResponse',
		many: true
	},
	answerCount: {
		type: Number,
		default: 0
	},
	questionWordCount: {
		type: Number,
		default: 0
	},
	tag: {
		type: Types.TextArray,
		many: true
	},
	publishedDate: {
		type: Types.Datetime,
		default: Date.now,
		index: true
	},
	latestUpdatedDate: {
		type: Types.Datetime,
		default: Date.now,
		index: true
	},
	isActive: {
		type: Boolean,
		default: true
	}
});

JobInterviewQuestion.schema.post('save', function() {
	const JobInterviewQuestion = keystone.list('JobInterviewQuestion');
	const User = keystone.list('User');
	if (this.poster) {
		User.model.findById(this.poster).exec((err, poster) => {
			if (err) logger.error(err);
			if (poster) {
				if (
					!poster._doc.interviewQuestionsCount &&
					poster._doc.interviewQuestionsCount !== 0
				) {
					handleInitialQuestionsCount(
						JobInterviewQuestion,
						User,
						poster,
						null,
						logger
					);
				}
				handleOneQuestionCount(
					User,
					poster,
					null,
					logger,
					this.isActive
				);
			}
		});
	}
});
JobInterviewQuestion.schema.post('remove', function() {
	const JobInterviewQuestion = keystone.list('JobInterviewQuestion');
	const User = keystone.list('User');
	if (this.poster) {
		User.model.findById(this.poster).exec((err, poster) => {
			if (err) logger.error(err);
			if (poster) {
				if (
					!poster._doc.interviewQuestionsCount &&
					poster._doc.interviewQuestionsCount !== 0
				) {
					handleInitialQuestionsCount(
						JobInterviewQuestion,
						User,
						poster,
						null,
						logger
					);
				}
				handleOneQuestionCount(
					User,
					poster,
					null,
					logger,
					(this.isActive = false)
				);
			}
		});
	}
});

JobInterviewQuestion.relationship({
	ref: 'JobInterviewResponse',
	refPath: 'question'
});

JobInterviewQuestion.defaultColumns =
	'question, interviewCompany, publishedDate, latestUpdatedDate';

JobInterviewQuestion.register();
