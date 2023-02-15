const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * @description return config object for rating select (0-5 point) for storing integer, rather than string
 */

export default {
	numeric: true,
	type: Types.Select,
	options: [
		{ value: 1, label: '1' },
		{ value: 2, label: '2' },
		{ value: 3, label: '3' },
		{ value: 4, label: '4' },
		{ value: 5, label: '5' }
	]
};
