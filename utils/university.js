export const getWorkshopsDetails = workshops => {
	return workshops.map(workshop => {
		return {
			key: workshop.key,
			name: workshop.name,
			cardDescription: workshop.cardDescription,
			startDate: workshop.startDate,
			endDate: workshop.endDate
		};
	});
};

export const getCacheKey = universitySlug => {
	return name => {
		return name + '_' + universitySlug;
	};
};

export const sortedReviews = arr => {
	return [...arr].reverse();
};
