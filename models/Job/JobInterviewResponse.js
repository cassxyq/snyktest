const keystone = require('keystone');
const JobInterviewQuestion = keystone.list('JobInterviewQuestion');
const Types = keystone.Field.Types;
const {
	handleInitialAnswersCount,
	handleOneAnswerCount
} = require('./handleInterviewQuestionAnswerCount');
const { logger } = require('../../utils/logger');

/**
 * Job Interview Answer Model
 * ==================
 */

const JobInterviewResponse = new keystone.List('JobInterviewResponse');

JobInterviewResponse.add({
	question: {
		type: Types.Relationship,
		ref: 'JobInterviewQuestion',
		required: true,
		initial: true
	},
	answer: {
		type: String,
		required: true,
		initial: true
	},
	user: {
		type: Types.Relationship,
		ref: 'User',
		required: true,
		initial: true
	},
	answerWordCount: {
		type: Number,
		default: 0
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

JobInterviewResponse.schema.post('save', function() {
	const JobInterviewResponse = keystone.list('JobInterviewResponse');
	if (this.question) {
		JobInterviewQuestion.model
			.findById(this.question)
			.exec((err, question) => {
				if (err) logger.error(err);
				if (question) {
					if (
						!question._doc.answerCount &&
						question._doc.answerCount !== 0
					) {
						handleInitialAnswersCount(
							JobInterviewResponse,
							JobInterviewQuestion,
							question,
							null,
							logger
						);
					}
					handleOneAnswerCount(
						JobInterviewQuestion,
						question,
						null,
						logger,
						this.isActive,
						this._id
					);
				}
			});
	}
});

JobInterviewResponse.schema.post('remove', function() {
	const JobInterviewResponse = keystone.list('JobInterviewResponse');
	if (this.question) {
		JobInterviewQuestion.model
			.findById(this.question)
			.exec((err, question) => {
				if (err) logger.error(err);
				if (question) {
					if (
						!question._doc.answerCount &&
						question._doc.answerCount !== 0
					) {
						handleInitialAnswersCount(
							JobInterviewResponse,
							JobInterviewQuestion,
							question,
							null,
							logger
						);
					}
					handleOneAnswerCount(
						JobInterviewQuestion,
						question,
						null,
						logger,
						(this.isActive = false)
					);
				}
			});
	}
});

JobInterviewResponse.defaultColumns =
	'answer, publishedDate, latestUpdatedDate';

JobInterviewResponse.register();
