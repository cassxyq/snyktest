const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * JobCategory Model
 * ==================
 */

const JobCategory = new keystone.List('JobCategory', {
	autokey: { from: 'name', path: 'key', unique: true }
});

JobCategory.add({
	name: { type: String, required: true, initial: true },
	zhLabel: { type: String, required: true, initial: true },
	engLabel: { type: String, required: true, initial: true },
	icon: { type: Types.CloudinaryImage, autoCleanup: true, select: true }
});

JobCategory.relationship({ ref: 'Post', refPath: 'categories' });
JobCategory.relationship({
	ref: 'JobInterviewQuestion',
	refPath: 'position'
});

JobCategory.defaultColumns = 'name, zhLabel, engLabel';

JobCategory.register();
