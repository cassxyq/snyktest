/**
 * @description return regex expression of search value
 * @param {string} searchValue search value
 */

export default searchValue => {
	const searchWords = searchValue
		.replace(/[^\w^\s^\u4e00-\u9fa5]/gi, ' ')
		.split(' ')
		.map(word => `(?=.*${word})`)
		.join('');
	return new RegExp(`^${searchWords}.*`, 'gi');
};
