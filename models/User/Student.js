const keystone = require('keystone');
const { Date } = require('keystone/lib/fieldTypes');
const Types = keystone.Field.Types;
const { generateId } = require('../../utils/generateId');

/**
 * Student Model
 * =============
 */

const Student = new keystone.List('Student', {
	autokey: { from: 'name', path: 'slug', unique: true, sortable: true }
});

Student.add(
	{
		user: { type: Types.Relationship, ref: 'User', noedit: true },
		name: { type: String, required: true },
		studentId: { type: String, noedit: true },
		state: {
			type: Types.Select,
			options: 'graduated, study, working',
			default: 'study'
		}
	},
	'Plurasight Authorization',
	{
		canAccessPlurasight: { type: Boolean },
		startDate: { type: Date },
		periodDays: { type: Number },
		endDate: { type: Date }
	},
	'Student Management',
	{
		// Only managed by admin and opreation
		note: { type: Types.Textarea },
		// 是否付全款
		isFullyPaid: { type: Boolean, label: '是否付完全款', default: true },
		isVerified: { type: Boolean }
	}
);

Student.schema.pre('save', function(next) {
	if (!this.studentId) {
		this.studentId = 'S' + generateId();
	}
	next();
});

Student.relationship({
	ref: 'Scheduling',
	refPath: 'student',
	path: 'scheduling'
});
Student.relationship({ ref: 'Quota', refPath: 'student', path: 'quota' });
Student.relationship({ ref: 'Order', refPath: 'student', path: 'order' });

Student.defaultColumns =
	'name, studentId, university|20%, program|20%, workshop|20%';

Student.register();
