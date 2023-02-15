const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Experience Path Model
 * =============
 */

const Experience = new keystone.List('Experience', {
	autokey: {
		from: 'company',
		path: 'key',
		unique: true,
		sortable: true
	}
});

Experience.add({
	company: { type: String },
	position: { type: String },
	city: { type: Types.Relationship, ref: 'City', many: true },
	startDate: { type: Types.Date },
	endDate: { type: Types.Date },
	workTime: { type: String },
	description: { type: String }
});

Experience.relationship({
	ref: 'Teacher',
	refPath: 'experience',
	path: 'teacher'
});

Experience.register();
