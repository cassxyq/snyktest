// Handle Initialize Enrolled Student Count on a course
export const handleInitialEnrolledStudentCount = async (
	courseSelectionModel,
	courseModel,
	course,
	res,
	logger
) => {
	await courseSelectionModel.model
		.find({ course: course._doc._id })
		.exec((err, courseSelections) => {
			if (err) return res.apiError('database error', err);
			if (courseSelections) {
				courseModel.model
					.updateOne(
						{ _id: course._doc._id },
						{
							$set: {
								enrolledStudentCount: courseSelections.length
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
// Handle Initialize Resource Count on a course
export const handleInitialResourceCount = async (
	resourceModel,
	courseModel,
	course,
	res,
	logger
) => {
	await resourceModel.model
		.find({ course: course._doc._id })
		.exec((err, resources) => {
			if (err) return res.apiError('database error', err);
			if (resources) {
				courseModel.model
					.updateOne(
						{ _id: course._doc._id },
						{ $set: { resourceCount: resources.length } }
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
// Handle Resource Count puls 1 on a course
export const handleOneResourceCountIncrease = async (
	courseModel,
	course,
	res,
	logger
) => {
	await courseModel.model
		.updateOne({ _id: course._doc._id }, { $inc: { resourceCount: 1 } })
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
// Handle Resource Count minus 1 on a course
export const handleOneResourceCountDecrease = async (
	courseModel,
	course,
	res,
	logger
) => {
	await courseModel.model
		.updateOne({ _id: course._doc._id }, { $inc: { resourceCount: -1 } })
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
// Handle Enrolled Student Count puls 1 on a course
export const handleOneEnrolledStudentCountIncrease = async (
	courseModel,
	course,
	res,
	logger
) => {
	await courseModel.model
		.updateOne(
			{ _id: course._doc._id },
			{ $inc: { enrolledStudentCount: 1 } }
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
};
// Handle Enrolled Student Count minus 1 on a course
export const handleOneEnrolledStudentCountDecrease = async (
	courseModel,
	course,
	res,
	logger
) => {
	await courseModel.model
		.updateOne(
			{ _id: course._doc._id },
			{ $inc: { enrolledStudentCount: -1 } }
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
};
// Handle Enrolled Student Count minus 1 on a list course
export const handleManyEnrolledStudentCountDecrease = async (
	courseModel,
	preCourse,
	res,
	logger
) => {
	await courseModel.model
		.updateMany(
			{ _id: { $in: preCourse } },
			{ $inc: { enrolledStudentCount: -1 } }
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
};
