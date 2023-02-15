const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Resume Template Model
 * =============
 */

const ResumeTemplate = new keystone.List('ResumeTemplate', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

ResumeTemplate.add({
	name: {
		type: String,
		required: true,
		note: '模板js文件本身的名字'
	},
	officialName: {
		type: String,
		note: '在网站上对外显示的模板名称'
	},
	sample: {
		type: Types.CloudinaryImage,
		autoCleanup: true,
		select: true
	},
	industry: { type: String, default: 'Featured', required: true },
	price: { type: Number },
	description: { type: String },
	moduleOrder: {
		type: String,
		default:
			'["personalSummary", "education", "professionalExperience", "skills"]'
	}
});

ResumeTemplate.defaultColumns = 'name';

ResumeTemplate.register();
