const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Syllabus Model
 * =============
 */

const Syllabus = new keystone.List('Syllabus', {
	autokey: { from: 'name', path: 'slug', unique: true, sortable: true }
});
Syllabus.defaultColumns = 'name, banners';

Syllabus.add({
	name: { type: String, required: true, default: 'default' },
	program: {
		type: Types.Relationship,
		ref: 'Program',
		required: true,
		initial: true
	},
	lesson: {
		type: Types.Relationship,
		ref: 'Lesson',
		many: true
	}
});

Syllabus.register();
