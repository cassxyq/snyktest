// Handle Workshop Enrolled Student Count increase
export const handleWorkshopEnrolledStudentIncrease = async (
	workshopModel,
	workshopId,
	enrollmentModel,
	logger
) => {
	await workshopModel.model.findOne({ _id: workshopId }, async function(
		err,
		workshop
	) {
		if (err) return err;
		if (!workshop.enrolledStudentCount) {
			const initialEnrolledStudentCount = await enrollmentModel.model
				.find({ workshop: workshopId })
				.count();
			workshop.enrolledStudentCount = initialEnrolledStudentCount;
			await workshop.save(err => {
				if (err) logger.error(err);
			});
		} else {
			workshop.enrolledStudentCount++;
			await workshop.save(err => {
				if (err) logger.error(err);
			});
		}
	});
};

// Handle Workshop Enrolled Student Count minus 1
export const handleWorkshopEnrolledStudentDecrease = async (
	workshopModel,
	workshopId,
	logger
) => {
	await workshopModel.model.findOne({ _id: workshopId }, async function(
		err,
		workshop
	) {
		if (err) return err;
		if (workshop.enrolledStudentCount > 0) {
			workshop.enrolledStudentCount--;
			await workshop.save(err => {
				if (err) logger.error(err);
			});
		}
	});
};
