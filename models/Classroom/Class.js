const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Classroom Class Model
 * =============
 */

const Class = new keystone.List('Class', {
	autokey: { from: 'name', path: 'slug', unique: true, sortable: true }
});
Class.defaultColumns = 'name, banners';

Class.add({
	name: { type: String, required: true, default: 'default' },
	title: { type: String },
	description: { type: Types.Textarea, label: '描述' },
	knowledge: { type: Types.TextArray, label: '课程知识点' },
	assignmentDifficulty: { type: Types.TextArray, label: '作业难点' },
	commenceDate: {
		type: Date,
		default: Date.now,
		label: '上课时间'
	},
	toBeDetermined: {
		type: Boolean,
		default: false,
		label: '开课时间待定'
	},
	availableTo: {
		type: Types.Select,
		options: '全体学生, VIP学生, 免费学生, 仅自己可见',
		label: '可见于'
	},
	tutor: { type: Types.Relationship, ref: 'Tutor' },
	duration: { type: Types.Number },
	material: {
		type: Types.Relationship,
		ref: 'Material',
		many: true
	}, // Only Enrolled User Read this attribute
	assignment: { type: Types.Relationship, ref: 'Assignment' },
	classroom: { type: Types.Relationship, ref: 'Classroom' },
	aliCloudVideo: {
		type: Types.Relationship,
		ref: 'AliCloudVideo',
		many: true
	}
});

Class.register();
