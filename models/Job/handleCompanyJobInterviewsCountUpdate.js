// Handle Initialize Interviews Count on a company
export const handleInitialInterviewsCount = async (
	companySelectionModel,
	companyModel,
	company,
	res,
	logger
) => {
	await companySelectionModel.model
		.find({ company: company._doc._id })
		.exec((err, companySelections) => {
			if (err) return res.apiError('database error', err);
			if (companySelections) {
				companyModel.model
					.updateOne(
						{ _id: company._doc._id },
						{
							$set: {
								interviewsCount: companySelections.length
							}
						}
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

// Handle Interviews Count puls 1 on a company
export const handleOneInterviewsCountIncrease = async (
	companyModel,
	company,
	res,
	logger
) => {
	await companyModel.model
		.updateOne({ _id: company._doc._id }, { $inc: { interviewsCount: 1 } })
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
};

// Handle Interviews Count minus 1 on a company
export const handleOneInterviewsCountDecrease = async (
	companyModel,
	company,
	res,
	logger
) => {
	await companyModel.model
		.updateOne({ _id: company._doc._id }, { $inc: { interviewsCount: -1 } })
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
};
