const keystone = require('keystone');
const Types = keystone.Field.Types;
/**
 * CourseTechnologyStackCollection Model
 * ==================
 */

const CourseTechnologyStackCollection = new keystone.List(
	'CourseTechnologyStackCollection',
	{
		autokey: { from: 'name', path: 'key', unique: true }
	}
);

CourseTechnologyStackCollection.add({
	name: { type: String, required: true },
	name_en: { type: String },
	TechnologyStack: {
		type: Types.Relationship,
		ref: 'TechnologyStack',
		many: true
	}
});

CourseTechnologyStackCollection.register();
