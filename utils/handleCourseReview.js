// Calculate weighted average of the existing course pass rate
export const calculateExistingPassRates = reviewArr => {
	const existingPressures = [];
	reviewArr.map(item => existingPressures.push(item.pressure));
	const averagePassRate =
		Math.round(
			(existingPressures.reduce((a, b) => Number(a) + Number(b)) /
				(reviewArr.length * 5)) *
				100
		).toString() + '%';
	return averagePassRate;
};

// Calculate course pass rate when a new review is approved
export const handleAddNewReview = (course, pressure) => {
	const updatedTotal =
		(Number(course._doc.passingRate.slice(0, -1)) / 100) *
			course._doc.numberOfReviews *
			5 +
		Number(pressure);
	const updatedAverage =
		Math.round(
			(updatedTotal / ((course._doc.numberOfReviews + 1) * 5)) * 100
		).toString() + '%';
	return updatedAverage;
};

// Calculate course pass rate when a review is deleted
export const handleDeleteReview = (course, pressure) => {
	let updatedAverage = '';
	if (course._doc.numberOfReviews - 1 > 0) {
		const updatedTotal =
			(Number(course._doc.passingRate.slice(0, -1)) / 100) *
				course._doc.numberOfReviews *
				5 -
			Number(pressure);
		updatedAverage =
			Math.round(
				(updatedTotal / ((course._doc.numberOfReviews - 1) * 5)) * 100
			).toString() + '%';
	} else {
		updatedAverage = '';
	}
	return updatedAverage;
};
