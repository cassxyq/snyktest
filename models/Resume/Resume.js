const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Resume Model
 * =============
 */

const Resume = new keystone.List('Resume', {
	map: { name: 'title' },
	autokey: { from: 'title', path: 'slug', unique: true }
});

Resume.add(
	{
		title: { type: String, initial: true, required: true },
		user: { type: Types.Relationship, ref: 'User' }
	},
	'Personal Detail',
	{
		name: { type: String },
		phone: { type: String },
		email: { type: Types.Email },
		city: { type: String },
		personalWebsite: { type: String },
		wechat: { type: String },
		linkedinUrl: { type: String },
		githubUrl: { type: String },
		visa: { type: String },
		profilePhoto: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true,
			note: '照片大小最大2MB, width x height: 200px x 200px'
		}
	},
	'Other Sections',
	{
		education: { type: Types.Relationship, ref: 'Education', many: true },
		certification: { type: Types.Relationship, ref: 'Certification', many: true },
		professionalExperience: {
			type: Types.Relationship,
			ref: 'ProfessionalExperience',
			many: true
		},
		skills: { type: String },
		extracurricularActivity: {
			type: Types.Relationship,
			ref: 'ExtracurricularActivity',
			many: true
		},
		projectExperience: {
			type: Types.Relationship,
			ref: 'ProjectExperience',
			many: true
		},
		personalSummary: { type: Types.Relationship, ref: 'PersonalSummary' },
		hobbies: { type: Types.Relationship, ref: 'Hobbies' },
		referee: { type: Types.Relationship, ref: 'Referee' }
	},
	'Resume Setting',
	{
		moduleOrder: {
			type: String,
			default:
				'["personalSummary", "education", "professionalExperience", "skills"]'
		},
		moduleStyles: {
			type: String,
			default: ''
		},
		themeColor: { type: Types.Color, default: '#000000' },
		pageSize: { type: String, default: 'A4' },
		fontSize: { type: String, default: '10pt' },
		fontFamily: { type: String, default: 'Arial' },
		textAlign: { type: String, default: 'left' },
		lineHeight: { type: String, default: '18pt' },
		pageMargin: { type: String, default: '10' }
	},
	'Module Name',
	{
		educationName: {
			type: String,
			default: 'Education'
		},
		professionalExperienceName: {
			type: String,
			default: 'Professional Experience'
		},
		skillsName: {
			type: String,
			default: 'Skills'
		},
		extracurricularActivityName: {
			type: String,
			default: 'Extracurricular Activities'
		},
		projectExperienceName: {
			type: String,
			default: 'Project Experience'
		},
		personalSummaryName: {
			type: String,
			default: 'Personal Summary'
		},
		hobbiesName: {
			type: String,
			default: 'Hobbies'
		},
		refereeName: {
			type: String,
			default: 'Referee'
		},
		certificationName: {
			type: String,
			default: 'Certification'
		}
	}
);

Resume.defaultColumns = 'title, user';

Resume.register();
