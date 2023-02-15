const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Assignment Model
 * =============
 */

const Assignment = new keystone.List('Assignment', {
	autokey: { from: 'name', path: 'slug', unique: true, sortable: true }
});
Assignment.defaultColumns = 'name, banners';

Assignment.add({
	name: { type: String, required: true, default: 'default' },
	title: { type: String, required: true, default: 'Assignment1' },
	lesson: { type: Types.Relationship, ref: 'Lesson' },
	dueDate: { type: Date, label: '截止日期' },
	mark: { type: Types.Number, label: '总分' },
	instruction: { type: Types.Textarea, label: '说明' },
	program: { type: Types.Relationship, ref: 'Program' },
	material: { type: Types.Relationship, ref: 'Material', many: true },
	createdAt: { type: Date, default: Date.now }
});

Assignment.register();
