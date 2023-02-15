// Handle Answer Count on Interview Question
export const handleInitialAnswersCount = async (
	interviewQuestionSelectionModel,
	interviewQuestionModel,
	interviewQuestion,
	res,
	logger
) => {
	await interviewQuestionSelectionModel.model
		.updateOne({
			_id: interviewQuestion._doc._id
		})
		.exec((err, count) => {
			if (err && res) res.apiError('database error', err);
			interviewQuestionModel
				.updateOne(
					{
						_id: interviewQuestion._doc._id
					},
					{
						$set: { answerCount: count }
					}
				)
				.exec(err => {
					if (err) {
						if (res) res.apiError('database error', err);
						if (logger) logger.error(err);
					}
				});
		});
};

/// Handle Answer Count +1/-1 on a Interview Question
export const handleOneAnswerCount = async (
	interviewQuestionModel,
	interviewQuestion,
	res,
	logger,
	isActive,
	id
) => {
	await interviewQuestionModel.model
		.updateOne(
			{
				_id: interviewQuestion._doc._id
			},
			isActive
				? { $inc: { answerCount: 1 }, $push: { answers: id } }
				: { $inc: { answerCount: -1 }, $pullAll: { answers: [id] } }
		)
		.exec(err => {
			if (err) {
				if (res) res.apiError('database error', err);
				if (logger) logger.error(err);
			}
		});
};

// Handle Initial Interview QuestionCount on User
export const handleInitialQuestionsCount = async (
	userSelectionModel,
	userModel,
	poster,
	res,
	logger
) => {
	await userSelectionModel.model
		.find({
			poster: poster._doc._id
		})
		.exec((err, count) => {
			if (err && res) res.apiError('database error', err);
			userModel
				.updateOne(
					{
						_id: poster._doc._id
					},
					{
						$set: { interviewQuestionsCount: count }
					}
				)
				.exec(err => {
					if (err) {
						if (res) res.apiError('database error', err);
						if (logger) logger.error(err);
					}
				});
		});
};

// Handle Interview QuestionCount +1/-1 on User
export const handleOneQuestionCount = async (
	userModel,
	user,
	res,
	logger,
	isActive
) => {
	await userModel.model
		.updateOne(
			{ _id: user._doc._id },
			{
				$inc: isActive
					? { interviewQuestionsCount: 1 }
					: { interviewQuestionsCount: -1 }
			}
		)
		.exec(err => {
			if (err) {
				if (res) res.apiError('database error', err);
				if (logger) logger.error(err);
			}
		});
};
