import { TRAINING_SORT_OPTIONS } from './constants';

export const validateNumber = (input, defaultNumber) => {
	if (!!Number(input) && Number.isInteger(+input) && +input > 0) {
		return +input;
	}
	return defaultNumber;
};

export const initialPagination = (page, pageSize) => {
	const newPage = validateNumber(page, 1);
	const newPageSize = validateNumber(pageSize, 10);
	const skip = (newPage - 1) * newPageSize;
	return { page: newPage, pageSize: newPageSize, skip };
};

export const getPaginationList = (rawPageList, currentPage, totalPage) => {
	switch (true) {
		case currentPage < 4:
			return rawPageList.slice(0, rawPageList.length - 2);
		case currentPage === 4:
			return rawPageList.slice(1, rawPageList.length - 1);
		case currentPage > 4 && currentPage < totalPage - 4:
			return rawPageList.slice(1, rawPageList.length - 1);
		case currentPage > totalPage - 3:
			return rawPageList.slice(2, rawPageList.length + 1);
		case currentPage === totalPage - 3:
			return rawPageList.slice(1, rawPageList.length - 1);
		case currentPage < totalPage - 3:
			return rawPageList.slice(1, rawPageList.length - 1);
		default:
			return rawPageList;
	}
};

/**
 * 手动对一个list的数据分页
 * @param {*} pList 被分页的对象
 * @param {*} page 当前页数
 * @param {*} perPage 每页的长度
 * @param {*} sortValue 排序方式
 */
export const simplePaginate = (pList, page, perPage, sortValue = null) => {
	const currentPage = parseInt(page);
	const start = (currentPage - 1) * perPage;
	const sortedList = sortValue ? pList.sort((a, b) => { return b.enrollmentAmount - a.enrollmentAmount }) : pList;
	const results = sortedList.slice(start, start + perPage);
	const totalPages = Math.ceil(pList.length / perPage);

	return {
		total: pList.length,
		currentPage: currentPage,
		previous: currentPage - 1,
		next: currentPage + 1,
		pages: [...Array(totalPages + 1).keys()].slice(1),
		totalPages: totalPages,
		results: results
	};
};
