const keystone = require('keystone');
const Types = keystone.Field.Types;
const { generateId } = require('../../utils/generateId');
const { TEACHER_ROLE_OPTIONS } = require('../../utils/constants');

/**
 * Teacher Model
 * =============
 */

const Teacher = new keystone.List('Teacher', {
	autokey: { from: 'name', path: 'slug', unique: true, sortable: true }
});

Teacher.defaultColumns = 'name, priority';

Teacher.add(
	{
		user: { type: Types.Relationship, ref: 'User' },
		name: { type: String, required: true },
		teacherId: { type: String, noedit: true },
		priority: { type: Types.Number },
		avatar: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true,
			note: '头像大小最大200kb, width x height: 200px x 200px'
		},
		role: {
			type: Types.Select,
			options: Object.values(TEACHER_ROLE_OPTIONS),
			default: TEACHER_ROLE_OPTIONS.INSTRUCTOR
		},
		title: { type: String, note: 'Job Title' },
		city: { type: Types.Relationship, ref: 'City', many: true },
		resume: { type: Types.Relationship, ref: 'Resource' },
		displayCompany: { type: Boolean, note: '是否显示企业logo' },
		preCompany: {
			type: Types.Relationship,
			ref: 'Company',
			many: true,
			dependsOn: { displayCompany: true }
		},
		displayUniversity: { type: Boolean, note: '是否显示University logo' },
		university: {
			type: Types.Relationship,
			ref: 'University',
			many: true,
			dependsOn: { displayUniversity: true }
		},
		linkedinUrl: { type: Types.Url },
		introduction: { type: Types.Textarea },
		isApproval: { type: Boolean, initial: false } // After application of being teacher is approval, it can display in the website
	},
	'Company Information',
	{
		companyName: { type: String }
	},
	'Areas of Interest',
	{
		interest: { type: Types.TextArray, label: 'Interest' }
	},
	'For Training',
	{
		training: { type: Types.Relationship, ref: 'Training', many: true }
	},
	'For Career Coaching',
	{
		service: { type: Types.Relationship, ref: 'Service', many: true }
	},
	'Optional',
	{
		highlights: { type: Types.TextArray, label: '亮点' },
		techSkills: {
			type: Types.Relationship,
			ref: 'TechnologyStack',
			label: 'Technology Skills',
			many: true
		},
		experience: {
			type: Types.Relationship,
			ref: 'Experience',
			many: true
		}
	},
	'================ 以下为英文内容 ================',
	{
		name_en: { type: String },
		title_en: { type: String, note: 'Job Title in English' },
		introduction_en: { type: Types.Textarea },
	},
	'Areas of Interest',
	{
		interest_en: { type: Types.TextArray, label: 'Interest in English' }
	},
	'Optional',
	{
		highlights_en: { type: Types.TextArray, label: '亮点_英文' }
	},
);

Teacher.schema.pre('save', function(next) {
	if (!this.teacherId) {
		this.teacherId = 'T' + generateId();
	}
	next();
});

Teacher.defaultColumns =
	'name, title, city|20%, training|20%, service|20%, isApproval';

Teacher.register();
