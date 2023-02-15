export const temphandleJobCountInit = async (
	jobSelection,
	companyModel,
	company,
	res,
	logger
) => {
	await jobSelection.model
		.find({ company: company._doc._id })
		.exec((err, job) => {
			if (err) return res.apiError('database error', err);
			if (job) {
				companyModel.model
					.updateOne(
						{ _id: company._doc._id },
						{
							$set: {
								jobCount: job.length
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

export const temphandleInterviewsCountInit = async (
	interviewsSelection,
	companyModel,
	company,
	res,
	logger
) => {
	await interviewsSelection.model
		.find({ company: company._doc._id })
		.exec((err, interview) => {
			if (err) return res.apiError('database error', err);
			if (interview) {
				companyModel.model
					.updateOne(
						{ _id: company._doc._id },
						{
							$set: {
								interviewsCount: interview.length
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
