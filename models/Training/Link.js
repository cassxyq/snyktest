const keystone = require('keystone');
const Types = keystone.Field.Types;
const { LINK_TYPE } = require('../../utils/constants');

/**
 * Link Model
 * =============
 */

const Link = new keystone.List('Link', {
	autokey: { from: 'name', path: 'slug', unique: true, sortable: true }
});

Link.add({
	name: { type: String, required: true, default: 'default' },
	url: {
		type: String
	},
	description: { type: String },
	training: { type: Types.Relationship, ref: 'Training', many: true },
	workshop: { type: Types.Relationship, ref: 'Workshop', many: true },
	category: {
		type: Types.Select,
		options: Object.values(LINK_TYPE),
		default: LINK_TYPE.general
	}
});

Link.register();
