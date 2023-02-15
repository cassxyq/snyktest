import { has, isArray, isPlainObject } from 'lodash';

/**
 * Use to detect fields which has EN counterparts and update its value with the value of EN counterpart
 * @param {object} data object data
 * @returns the updated data with empty value and filled with the chinese counterpart value
 */

const manipulateFieldValueByEnField = (data) => {
	const enKeyRegex = new RegExp('_en$', 'g');
	const dataEntries = Object.entries(data)
		.map(([key, value]) => {
			// Keep id or _id fields the same, i.e id is no need to converted
			if (key.match(new RegExp('id$', 'g'))) return [key, value];

			// manipulate value, for plan object or object array
			let fieldValue = value;
			if (isArray(value)) {
				fieldValue = value.map(item => isPlainObject(item) ?
					manipulateFieldValueByEnField(item) : item);
			} else if (isPlainObject(value)) {
				fieldValue = manipulateFieldValueByEnField(value);
			}

			// Store the value of EN field to the original CN field, so front-end can continue use the original field with EN value
			const enKey = `${key}_en`;
			const hasEnField = has(data, enKey);
			return hasEnField? [key, data[enKey] || fieldValue] : [key, fieldValue];
		})
		// filter out all EN field and make the data clean
		.filter(([key]) => !key.match(enKeyRegex));
	return Object.fromEntries(new Map(dataEntries));
};

/**
 * Use to filter out all EN fields in data
 * @param {object} data object data
 * @returns the updated data without any EN fields
 */

export const filterOutEnFields = (data) => {
	const enKeyRegex = new RegExp('_en$', 'g');
	const dataEntries = Object.entries(data)
		.map(([key, value]) => {
			// Keep id or _id fields the same
			if (key.match(new RegExp('id$', 'g'))) return [key, value];

			// manipulate value, for plan object or object array
			let fieldValue = value;
			if (isArray(value)) {
				fieldValue = value.map(item => isPlainObject(item) ?
					filterOutEnFields(item) : item);
			} else if (isPlainObject(value)) {
				fieldValue = filterOutEnFields(value);
			}

			return [key, fieldValue];
		})
		.filter(([key]) => !key.match(enKeyRegex));
	return Object.fromEntries(new Map(dataEntries));
};

export default manipulateFieldValueByEnField;