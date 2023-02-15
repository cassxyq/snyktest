export const getLocalArticlesDetails = articles => {
	return articles.map(article => {
		return {
			title: article.title,
			slug: article.slug,
			createdAt: new Date(article.createdAt)
		};
	});
};
