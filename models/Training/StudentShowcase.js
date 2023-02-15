const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Showcase Model
 * =============
 */

const Showcase = new keystone.List('Showcase', {
	autokey: { from: 'name', path: 'slug', unique: true, sortable: true }
});

Showcase.add({
	name: { type: String, required: true },
	image: { type: Types.CloudinaryImage },
	student: { type: Types.Relationship, ref: 'Student', many: true },
	location: {
		type: Types.Select,
		options: 'Sydney, Brisbane, Melbourne, Seatle, China',
		default: 'Sydney'
	},
	training: { type: Types.Relationship, ref: 'Training', many: true },
	university: {
		type: Types.Relationship,
		ref: 'University',
		required: false,
		initial: false
	},
	stack: { type: String },
	description: { type: Types.Textarea },
	url: { type: String }
});

Showcase.register();
