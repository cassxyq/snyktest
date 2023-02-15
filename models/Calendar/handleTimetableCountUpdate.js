import { COURSE_TIMETABLE_TYPE } from '../../utils/constants';

/**
 * Helper function used to initialise Course.countNumOfLecture, Course.countNumOfExam and Course.countNumOfAssignment fields
 */
export const initTimetableCount = async (
	courseTimetableModel,
	courseModel,
	res,
	logger
) => {
	const courses = await courseModel.find();
	for (const courseDoc of courses) {
		if (
			//when any of three fields (countNumOfLecture, countNumOfAssignment, and countNumOfExam) cannot be found in in any of the documents in keystone.list('Course).model.
			//when any of three fields (countNumOfLecture, countNumOfAssignment, and countNumOfExam) in any of the documents in keystone.list('Course).model is not a number.
			(!courseDoc._doc.countNumOfLecture &&
				courseDoc._doc.countNumOfLecture !== 0) ||
			(!courseDoc._doc.countNumOfAssignment &&
				courseDoc._doc.countNumOfAssignment !== 0) ||
			(!courseDoc._doc.countNumOfExam &&
				courseDoc._doc.countNumOfExam !== 0)
		) {
			courseTimetableModel
				.aggregate([
					{
						$match: { course: courseDoc._id }
					},
					{
						//Handle count number when no lecture/assignment/exam timetable
						$facet: {
							countLecture: [
								{
									$match: {
										type: COURSE_TIMETABLE_TYPE.LECTURE
									}
								},
								{ $count: 'countLecture' }
							],
							countAssignment: [
								{
									$match: {
										type: COURSE_TIMETABLE_TYPE.ASSIGNMENT
									}
								},
								{ $count: 'countAssignment' }
							],
							countExam: [
								{
									$match: { type: COURSE_TIMETABLE_TYPE.EXAM }
								},
								{ $count: 'countExam' }
							]
						}
					},
					{
						$project: {
							countLecture: {
								$arrayElemAt: ['$countLecture.countLecture', 0]
							},
							countAssignment: {
								$arrayElemAt: [
									'$countAssignment.countAssignment',
									0
								]
							},
							countExam: {
								$arrayElemAt: ['$countExam.countExam', 0]
							}
						}
					}
				])
				.exec((err, counts) => {
					if (!counts[0].countLecture) counts[0].countLecture = 0;
					if (!counts[0].countAssignment) {
						counts[0].countAssignment = 0;
					}
					if (!counts[0].countExam) counts[0].countExam = 0;
					courseModel
						.updateOne(
							{ _id: courseDoc._id },
							{
								$set: {
									countNumOfLecture: counts[0].countLecture,
									countNumOfAssignment:
										counts[0].countAssignment,
									countNumOfExam: counts[0].countExam
								}
							}
						)
						.exec(err => {
							if (err) {
								return res.status(400).json({ message: err });
							}
							if (logger) return logger.error('err');
						});
				});
		}
	}
};

/**
 * Helper function used to update Course.countNumOfLecture, Course.countNumOfExam and Course.countNumOfAssignment fields
 * when one timetable is added or deleted from CourseTimetable.
 * @param {number} count - normally 1 or -1
 */
export const updateTimetableCount = async (
	count,
	courseModel,
	courseId,
	type,
	res,
	logger
) => {
	switch (type) {
		case COURSE_TIMETABLE_TYPE.LECTURE:
			courseModel
				.updateOne(
					{ _id: courseId },
					{ $inc: { countNumOfLecture: count } }
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
			break;
		case COURSE_TIMETABLE_TYPE.ASSIGNMENT:
			courseModel
				.updateOne(
					{ _id: courseId },
					{ $inc: { countNumOfAssignment: count } }
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
			break;
		case COURSE_TIMETABLE_TYPE.EXAM:
			courseModel
				.findOneAndUpdate(
					{ _id: courseId },
					{ $inc: { countNumOfExam: count } }
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
			break;
		default:
			break;
	}
};
