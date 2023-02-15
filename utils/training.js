const { TRAINING_SORT_OPTIONS } = require('../utils/constants');
/**
 * set the value of the object's enrollmentAmount property
 * @param {array} trainings 
 * @param {object} enrollmentAmount 
 * @returns  the array with the objects
 */
export const setEnrollmentAmount = (trainings, enrollmentAmount) => {
	trainings.map((training) => {
		const enrollment = enrollmentAmount.find( item => item.itemId.toString() === training._id.toString());
		return training.enrollmentAmount = enrollment? enrollment.counts:0;
	});
	return trainings;
};

/**
 * sort the list according to sortValue
 * @param {string} sortValue 
 * @param {object} enrollmentAmount
 * @param {array} filteredList 
 * @returns  the sorted list
 */
export const sortList = (sortValue, enrollmentAmount, filteredList) => {
	switch (sortValue) {
		case TRAINING_SORT_OPTIONS.DEFAULT:
			return filteredList.sort((a, b) =>
				a.title.toUpperCase() > b.title.toUpperCase() ? 1 : -1
			);
		case TRAINING_SORT_OPTIONS.ENROLLMENT:
			return filteredList.sort((a, b) =>
				(enrollmentAmount[b._id] || 0) - (enrollmentAmount[a._id] || 0)
			);
		default:
			return filteredList;
	}
}

/**
 * restructure the array to an object
 * ```
 * enrollmentAmount([{counts: 10, itemId: "613c2fc99bdacaf02f8fa258"}, {counts: 8, itemId: "5be40fd17e13806e81399683"}])//=>
 * {613c2fc99bdacaf02f8fa258: 10，5be40fd17e13806e81399683：8}
 * ```
 * @param {array} enrollmentAmounts 
 * @returns the object with the itemId as the key, the counts as the value.
 */
export const enrollmentAmountObj = (enrollmentAmounts) => {
	const enrollmentAmount = {};
	if (enrollmentAmounts) {
		JSON.parse(enrollmentAmounts).map((item) => {
			enrollmentAmount[item.itemId.toString()] = item.counts;
		});
	}
	return enrollmentAmount;
}