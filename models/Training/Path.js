const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Career Path Model
 * =============
 */

const Path = new keystone.List('Path', {
	autokey: {
		from: 'name',
		path: 'slug',
		unique: true,
		sortable: true
	}
});

Path.add({
	name: { type: String },
	englishTitle: { type: String },
	pathId: { type: String },
	description: { type: Types.Textarea },
	training: { type: Types.Relationship, ref: 'Training', many: true }
});

Path.defaultColumns = 'name, training';

Path.register();
