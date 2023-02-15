// Handle Initialize Job Count on a company
export const handleInitialJobCount = async (
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
								jobCount: companySelections.length
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

// Handle Job Count puls 1 on a company
export const handleOneJobCountIncrease = async (
	companyModel,
	company,
	res,
	logger
) => {
	await companyModel.model
		.updateOne({ _id: company._doc._id }, { $inc: { jobCount: 1 } })
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

// Handle Job Count minus 1 on a company
export const handleOneJobCountDecrease = async (
	companyModel,
	company,
	res,
	logger
) => {
	await companyModel.model
		.updateOne({ _id: company._doc._id }, { $inc: { jobCount: -1 } })
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
