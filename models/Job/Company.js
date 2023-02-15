const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Company Model
 * =============
 */

const Company = new keystone.List('Company', {
	autokey: {
		from: 'name',
		path: 'slug',
		unique: true,
		sortable: true
	}
});

Company.add(
	{
		meta: {
			title: { type: String },
			englishTitle: { type: String },
			keywords: { type: String },
			englishKeywords: { type: String },
			description: {
				type: String,
				note: 'For SEO'
			},
			englishDescription: { type: String }
		}
	},
	'Basic Info',
	{
		name: { type: String, required: true },
		chName: { type: String, label: '公司中文名' },
		description: { type: Types.Textarea },
		englishDescription: { type: Types.Textarea },
		status: {
			type: Types.Select,
			options: '已上市, Startup, 已获融资, 本地公司, 跨国公司',
			default: '本地公司'
		},
		abn: { type: String, label: 'ABN' },
		staffAmount: { type: String, note: '员工数量' },
		industry: { type: String },
		specialities: { type: String },
		website: { type: String },
		brandStory: { type: Types.Textarea, label: '品牌故事' },
		isPending: {
			type: Types.Boolean,
			default: false,
			label: '是否待审核'
		},
		isPromotion: {
			type: Types.Boolean,
			default: false,
			label: '是否推广'
		},
		isFeatured: {
			type: Types.Boolean,
			default: false,
			label: '是否精选'
		},
		scrapingResource: {
			type: Types.Select,
			options: 'lever, others'
		},
		slogan: { type: String, label: '主标语' },
		subSlogan: { type: String, label: '副标语' },
		sponsorPageview: {
			type: Number,
			format: '0',
			label: '赞助商页面访问量',
			default: 0
		}
	},
	'Location',
	{
		country: { type: String },
		city: { type: Types.Relationship, ref: 'City', many: true },
		location: { type: Types.Relationship, ref: 'City' },
		officeAddress: { type: String },
		branchAddress: { type: Types.Textarea, label: '商家地址' }
	},
	'Contact, Social media',
	{
		phone: { type: String, label: '电话' },
		wechatQRcode: {
			type: Types.CloudinaryImage,
			label: '微信账号二维码',
			autoCleanup: true,
			select: true
		},
		redQRcode: {
			type: Types.CloudinaryImage,
			label: '小红书账号二维码',
			autoCleanup: true,
			select: true
		},
		red: {
			type: String,
			label: '小红书账号ID',
			note: '此账号ID需从小红书用户页面URL中获取，而非“小红书号”'
		}
	},
	'Image',
	{
		logo: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true,
			note: '图片尺寸宽度200'
		},
		secondaryLogo: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true,
			note: '长方形logo图片。比如，作为三级赞助商时使用'
		},
		backgroundImg: {
			type: Types.CloudinaryImage,
			note: 'Width:900px, height:500px',
			label: '公司背景图',
			autoCleanup: true,
			select: true
		},
		publicityPhoto: {
			type: Types.CloudinaryImages,
			autoCleanup: true,
			select: true,
			label: '品牌宣传(多张)'
		}
	},
	'Job',
	{
		jobCount: { type: Number, default: 0 },
		interviewsCount: { type: Number, default: 0 },
		jobGroupImg: {
			type: Types.CloudinaryImage,
			label: '内推群二维码',
			autoCleanup: true,
			select: true,
			note: '图片尺寸宽度200'
		}
	}
);

Company.relationship({ ref: 'Job', refPath: 'company', path: 'job' });

Company.relationship({ ref: 'JobInterview', refPath: 'company' });

Company.relationship({ ref: 'Note', refPath: 'company' });

Company.relationship({ ref: 'User', refPath: 'referrerCompanies' });

Company.register();
