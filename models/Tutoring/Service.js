const keystone = require('keystone');
const { TRAINING_LEVEL } = require('../../utils/constants');
const Types = keystone.Field.Types;

/**
 * Tutor Model
 * =============
 */

const Service = new keystone.List('Service', {
	autokey: {
		from: 'name',
		path: 'slug',
		unique: true,
		sortable: true
	}
});

//  Tutor.defaultColumns

Service.add(
	{
		name: { type: String, required: true },
		meta: {
			title: { type: String },
			description: { type: Types.Textarea },
			keywords: { type: String }
		}
	},
	'Basic Information (Required)',
	{
		title: { type: String },
		chName: { type: String, label: '求职服务中文名' },
		slogan: { type: String },
		type: {
			type: Types.Select,
			options: 'Tutoring, Career',
			default: 'Career'
		},
		level: {
			type: Types.Select,
			options: Object.values(TRAINING_LEVEL),
			default: TRAINING_LEVEL.ENTRY,
			label: '课程难度'
		},
		cardDescription: {
			type: Types.Textarea,
			initial: true
		},
		state: {
			type: Types.Select,
			options: 'draft, published, archived',
			default: 'published',
			index: true
		},
		shortDescription: {
			type: Types.Html,
			wysiwyg: true,
			height: 100,
			note: '页面简短描述'
		},
		packageIntroduction: { type: Types.Html, wysiwyg: true, height: 100 },
		city: { type: Types.Relationship, ref: 'City', many: true },
		period: { type: String, ref: '服务时长' }
	},
	'Price',
	{
		price: { type: Number },
		promotionPrice: { type: Number },
		cardPrice: { type: String },
		priceHint: { type: String, label: '价格描述' }
	},
	'For Career Coaching',
	{
		targetCountry: {
			type: Types.Select,
			options: 'Australia, China',
			default: 'Australia',
			label: '面向哪里就业',
			dependsOn: { type: 'Career' }
		},
		careerServiceType: {
			type: Types.Select,
			options: 'Instructor, Package, Single, Internship',
			default: 'Instructor',
			label: '求职就业服务类型',
			note: 'Instructor为导师全包服务，Package为套餐，Single为单项服务',
			dependsOn: { type: 'Career' }
		},
		careerPath: {
			type: Types.Relationship,
			ref: 'CareerPath',
			label: '求职就业职业类型',
			dependsOn: { type: 'Career' }
		},
		thumbnail: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			note: 'Career服务封面',
			dependsOn: { type: 'Career' }
		},
		thumbNailAlt: { type: String, dependsOn: { type: 'Career' } },
		serviceFeature: {
			type: Types.Html,
			wysiwyg: true,
			height: 250,
			dependsOn: { type: 'Career' }
		},
		serviceScopeTitle: {
			type: String,
			label: '适合人群标题',
			dependsOn: { type: 'Career' }
		},
		serviceScope: {
			type: Types.Textarea,
			label: '适合人群',
			dependsOn: { type: 'Career' }
		}
	},
	'For Tutoring',
	{
		scheduling: {
			type: Types.Html,
			wysiwyg: true,
			height: 100,
			label: '课程安排',
			dependsOn: { type: 'Tutoring' }
		}
	},
	'Extended Information (Optional)',
	{
		cities: { type: String },
		icon: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true
		},
		longDescription: { type: Types.Html, wysiwyg: true, height: 400 },
		promotion: { type: Types.Html, wysiwyg: true, height: 100 }
	}
);

Service.defaultColumns = 'name, type, state, title, careerPath';

Service.relationship({ ref: 'Tutor', refPath: 'service', path: 'tutor' });
Service.relationship({ ref: 'Teacher', refPath: 'service', path: 'teacher' });

Service.register();
