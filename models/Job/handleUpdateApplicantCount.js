/**
 * Helper function used to initial User.applicationCount field
 */
export const handleInitialApplicationCount = async (
	jobApplicationModel,
	userModel,
	referral,
	res,
	logger
) => {
	await jobApplicationModel
		.count({ referral: referral._doc._id })
		.exec((err, count) => {
			if (err && res) return res.apiError('database error', err);
			userModel
				.updateOne(
					{ _id: referral._doc._id },
					{
						$set: {
							applicationCount: count
						}
					}
				)
				.exec(err => {
					if (err) {
						if (res) {
							return res.apiError('database error', err);
						}
						if (logger) {
							logger.error('err');
						}
					}
				});
		});
};

/**
 * Helper function to initialize or update User.applicationCount field
 * when there is an update in JobApplication model.
 * @param {number} amount - normally 1 or -1
 */
export const updateApplicationCount = async (
	amount,
	applicationModel,
	userModel,
	referral,
	res,
	logger
) => {
	userModel.findById(referral).exec((err, referral) => {
		if (err) {
			return logger.error(err);
		}
		if (
			!referral._doc.applicationCount &&
			referral._doc.applicationCount !== 0
		) {
			handleInitialApplicationCount(
				applicationModel,
				userModel,
				referral,
				res,
				logger
			);
		} else {
			userModel
				.updateOne(
					{ _id: referral._doc._id },
					{ $inc: { applicationCount: amount } }
				)
				.exec(err => {
					if (err) {
						if (res) {
							return res.apiError('database error', err);
						}
						if (logger) {
							logger.error(err);
						}
					}
				});
		}
	});
};
