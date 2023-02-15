const keystone = require('keystone');
const Types = keystone.Field.Types;
const {
	TRAINING_TYPE,
	TRAINING_LEVEL,
	TRAINING_ARRANGEMENT_TAGS,
	TRAINING_LEVEL_EN
} = require('../../utils/constants');

/**
 * Training Course Model
 * =============
 */

const Training = new keystone.List('Training', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

Training.add(
	{
		courseCode: { type: String },
		name: { type: String, required: true }
	},
	'SEO For Google(Required)',
	{
		meta: {
			title: { type: String },
			keywords: { type: String },
			description: {
				type: Types.Textarea,
				note: 'Meta Description(140 words)'
			}
		}
	},
	'Course Basic Information',
	{
		title: { type: String },
		cardDescription: { type: String, label: '课程涵盖', note: '必填' },
		promoDescription: { type: String, label: '课程宣传标语', note: '必填' },
		prerequisitecourse: { type: String, label: '先修课程' },
		prerequisiteknowledge: { type: String, label: '先修知识' },
		timeLength: {
			type: String,
			label: '课程时长',
			note: '实习项目的时长单位为月'
		},
		teachingMethod: { type: Types.TextArray, label: '授课方式' },
		city: {
			type: Types.Relationship,
			ref: 'City',
			many: true,
			label: '开课城市'
		},
		level: {
			type: Types.Select,
			options: Object.values(TRAINING_LEVEL),
			default: TRAINING_LEVEL.ENTRY,
			label: '课程难度'
		},
		type: {
			type: Types.Select,
			options: Object.values(TRAINING_TYPE),
			default: TRAINING_TYPE.training,
			label: '课程授课类型'
		},
		courseObjective: { type: Types.Textarea, label: '课程目标' },
		CourseTechnologyStackCollection: {
			type: Types.Relationship,
			ref: 'CourseTechnologyStackCollection',
			many: true,
			label: '课程技术栈集合'
		},
		link: { type: Types.Relationship, ref: 'Link', many: true },
		technologyStack: {
			type: Types.Relationship,
			ref: 'TechnologyStack',
			many: true,
			label: '技术栈'
		},
		careerPaths: {
			type: Types.Relationship,
			ref: 'CareerPath',
			many: true,
			label: '就业方向'
		},
		correspondingJobLevel: { type: String, label: '对应岗位等级' }
	},
	'学费',
	{
		tuition: { type: String, label: '课程费用原价' },
		promoTuitionOffline: { type: Number, label: '线下早鸟价' },
		promoTuitionOnline: { type: Number, label: '线上早鸟价' },
		priceHint: { type: String, label: '价格描述' }
	},
	'Related',
	{
		project: { type: Types.Relationship, ref: 'Project', many: true }
	},
	'课程背景图',
	{
		thumbnail: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true
		},
		thumbNailAlt: { type: String }
	},
	'是否显示',
	{
		isShown: {
			type: Types.Boolean,
			default: true,
			label: '是否显示'
		}
	},
	'课程介绍',
	{
		description: {
			type: Types.Html,
			wysiwyg: true,
			height: 200,
			label: '课程详细介绍'
		},
		suitable: {
			type: Types.Textarea,
			label: '适合人群',
			note: '在输入框直接回车进行换行'
		},
		highlights: {
			type: Types.TextArray,
			label: '课程亮点',
			note:
				'使用||分行，第一行是图片有四种，分别是：actual-projects, answer-questions, interview-guidance, community-discussion，第二行是标题，后面的是内容。 eg. actual-projects||标题||描述||描述'
		},
		achievements: {
			type: Types.TextArray,
			label: '课程介绍视频右侧的成就',
			note:
				'最多三个, 每个成就的数字和表述要用||分开, 第一部分是数字, 第二部分是描述, 比如: 1000||学员获得相关工作机会'
		},
		features: {
			type: Types.TextArray,
			label: '你将获得',
			note:
				'必须有3个部分，每个部分标题和内容用||分开：标题||内容||内容||内容...'
		},
		courseIntroductionBanners: {
			type: Types.CloudinaryImages,
			autoCleanup: true,
			select: true,
			label: 'Marketing图片上传'
		}
	},
	'课程安排',
	{
		courseArrangementTags: {
			type: Types.TextArray,
			default: new Array(
				`${TRAINING_ARRANGEMENT_TAGS.COURSE_CONTENT}||24周||共计约300小时的课程不同阶段，逐步晋级，干货满满！`,
				`${TRAINING_ARRANGEMENT_TAGS.PROJECT}||3个||由浅到深，从零开始带你做项目丰富你的简历`,
				`${TRAINING_ARRANGEMENT_TAGS.LEARN_DIRECTION}||4类||报名全栈班，可学任何方向课程双倍价值，更加全面！`,
				`${TRAINING_ARRANGEMENT_TAGS.COURSE_DURATION}||无限期||一次报名，无限期学习时间免费视频回看，永不过期`
			),
			label: '课程安排顶部展示标签',
			note:
				'必填！最多四个, 且必须有至少[课程内容]和[课程有效期]; 每个标签的标题，内容和表述要用||分开: 标题||内容||描述',
			initial: true
		},
		modules: {
			type: Types.Relationship,
			ref: 'Module',
			many: true,
			label: '课程阶段'
		}
	},
	'免费学习资料描述',
	{
		collectResourceTexts: {
			type: Types.TextArray,
			label: '学习资料标题及内容描述',
			default: new Array(
				'Spring思维导图及技术图谱||帮助你在学习Java的过程中建立自己的知识体系',
				'大厂实践经验及面试攻略||一线互联网公司最新Java架构案例拆解及面试攻略'
			),
			note:
				'至少两份，最多四份，使用||分行，第一行是标题，后面的是内容。 eg. 标题||描述||描述',
			initial: true
		}
	},
	'Extended Information (Optional)',
	{
		priority: { type: Types.Number },
		featured: {
			type: Types.Select,
			options: 'default, homepage, recommend',
			default: 'default',
			label: '课程推荐位置'
		},
		courseLink: { type: Types.Url, label: 'FORBIDDEN INPUT' }
	},
	'================ 以下为英文内容 ================',
	'SEO For Google(Required) in English',
	{
		meta_en: {
			title: { type: String },
			keywords: { type: String },
			description: {
				type: Types.Textarea,
				note: 'Meta Description(140 words)'
			}
		}
	},
	'Course Basic Information in English',
	{
		title_en: { type: String },
		cardDescription_en: { type: String, label: '课程涵盖_英文', note: '必填' },
		promoDescription_en: { type: String, label: '课程宣传标语_英文', note: '必填' },
		prerequisitecourse_en: { type: String, label: '先修课程_英文' },
		prerequisiteknowledge_en: { type: String, label: '先修知识_英文' },
		timeLength_en: {
			type: String,
			label: '课程时长_英文',
			note: '实习项目的时长单位为月'
		},
		level_en: {
			type: Types.Select,
			options: Object.values(TRAINING_LEVEL_EN),
			label: '课程难度_英文'
		},
		teachingMethod_en: { type: Types.TextArray, label: '授课方式_英文' },
		courseObjective_en: { type: Types.Textarea, label: '课程目标_英文' },
		correspondingJobLevel_en: { type: String, label: '对应岗位等级_英文' }
	},
	'学费_英文',
	{
		priceHint_en: { type: String, label: '价格描述_英文' }
	},
	'课程背景图_英文',
	{
		thumbnail_en: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true
		},
		thumbNailAlt_en: { type: String }
	},
	'课程介绍_英文',
	{
		description_en: {
			type: Types.Html,
			wysiwyg: true,
			height: 200,
			label: '课程详细介绍_英文'
		},
		suitable_en: {
			type: Types.Textarea,
			label: '适合人群_英文',
			note: '在输入框直接回车进行换行'
		},
		highlights_en: {
			type: Types.TextArray,
			label: '课程亮点_英文',
			note:
				'使用||分行，第一行是图片有四种，分别是：actual-projects, answer-questions, interview-guidance, community-discussion，第二行是标题，后面的是内容。 eg. actual-projects||标题||描述||描述'
		},
		achievements_en: {
			type: Types.TextArray,
			label: '课程介绍视频右侧的成就_英文',
			note:
				'最多三个, 每个成就的数字和表述要用||分开, 第一部分是数字, 第二部分是描述, 比如: 1000||学员获得相关工作机会'
		},
		features_en: {
			type: Types.TextArray,
			label: '你将获得_英文',
			note:
				'必须有3个部分，每个部分标题和内容用||分开：标题||内容||内容||内容...'
		},
		courseIntroductionBanners_en: {
			type: Types.CloudinaryImages,
			autoCleanup: true,
			select: true,
			label: 'Marketing图片上传'
		}
	},
	'课程安排_英文',
	{
		courseArrangementTags_en: {
			type: Types.TextArray,
			label: '课程安排顶部展示标签_英文',
			note:
				'必填！最多四个, 且必须有至少[课程内容]和[课程有效期]; 每个标签的标题，内容和表述要用||分开: 标题||内容||描述'
		}
	},
	'免费学习资料描述_英文',
	{
		collectResourceTexts_en: {
			type: Types.TextArray,
			label: '学习资料标题及内容描述_英文',
			note:
				'至少两份，最多四份，使用||分行，第一行是标题，后面的是内容。 eg. 标题||描述||描述'
		}
	},
);

Training.relationship({ ref: 'Teacher', refPath: 'training', path: 'teacher' });
Training.relationship({
	ref: 'CareerPath',
	refPath: 'trainings',
	path: 'careerPath'
});

Training.defaultColumns = 'name, tuition|20%, city|20%, featured';

Training.register();
