import { isEmpty } from 'lodash';

/**
 * Split a list of string that contains "||"
 *  eg. "a||b||c" ===> {title: "a", icon: "b", highlights: "c"}
 * @param {String[]} barList of string that needs to be splitted based on "||"
 * @param {String[]} keys of the object. eg. ["title", "icon", "highlights"]
 * @returns {Object[]} a list of splitted object.
 */
export function splitVerticalBarList(barList, keys) {
	const result = [];
	!isEmpty(barList) &&
		keys.length &&
		barList.map(item => {
			const splitted = item.split('||');
			const resultItem = {};
			keys.map((key, index) => {
				resultItem[key] = splitted[index] || 'unknown';
			});
			result.push(resultItem);
		});
	return result;
}
