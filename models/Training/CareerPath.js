const keystone = require('keystone');
import ratingConfig from '../../utils/ratingConfig';
const Types = keystone.Field.Types;

/**
 * Career Path Model
 * =============
 */

const CareerPath = new keystone.List('CareerPath', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

CareerPath.defaultColumns = 'name, chName, trainings, teachers';

CareerPath.add({
	name: { type: String, required: true },
	chName: { type: String },
	enName: { type: String },
	icon: {
		type: Types.CloudinaryImage,
		note: 'Small Size, 100w*100h png',
		autoCleanup: true
	},
	trainings: { type: Types.Relationship, ref: 'Training', many: true },
	learningPath: { type: Types.Relationship, ref: 'LearningPath' },
	teachers: { type: Types.Relationship, ref: 'Teacher', many: true },
	priority: {
		type: Types.Select,
		options: '0, 1, 2, 3',
		default: 3,
		label: '职业优先级',
		note: '决定该职业在官网职业专栏的顺序'
	},
	jobCategory: {
		type: Types.Relationship,
		ref: 'JobCategory',
		many: true,
		label: '关联职业分类'
	},
	subTitle: { type: String },
	difficulty: { ...ratingConfig, label: '难易度' },
	intensity: { ...ratingConfig, label: '工作强度' },
	salaryRange: { type: String, label: '薪资范围' },
	summary: { type: Types.Textarea, label: '职业综述' },
	careerPros: { type: Types.TextArray, label: '求职优点' },
	careerCons: { type: Types.TextArray, label: '求职缺点' },
	description: {
		type: Types.Html,
		wysiwyg: true,
		height: 200,
		label: '什么是该职业'
	},
	careerProsDetail: {
		type: Types.Html,
		wysiwyg: true,
		height: 200,
		label: '职业优点'
	},
	careerGroup: {
		type: Types.Html,
		wysiwyg: true,
		height: 200,
		label: '适合人群 必备技能'
	},
	careerSalary: {
		type: Types.Html,
		wysiwyg: true,
		height: 200,
		label: '薪酬工作时长'
	},
	preparation: {
		type: Types.Html,
		wysiwyg: true,
		height: 200,
		label: '如何做如何准备'
	},
	interview: {
		type: Types.Html,
		wysiwyg: true,
		height: 200,
		label: '面试考点解析'
	},
	postCategory: {
		type: Types.Relationship,
		ref: 'PostCategory',
		many: true,
		label: '关联文章分类'
	}
},
'================ 以下为英文内容 ================',
{
	subTitle_en: { type: String },
	salaryRange_en: { type: String, label: '薪资范围_英文' },
	summary_en: { type: Types.Textarea, label: '职业综述_英文' },
	careerPros_en: { type: Types.TextArray, label: '求职优点_英文' },
	careerCons_en: { type: Types.TextArray, label: '求职缺点_英文' },
	description_en: {
		type: Types.Html,
		wysiwyg: true,
		height: 200,
		label: '什么是该职业_英文'
	},
	careerProsDetail_en: {
		type: Types.Html,
		wysiwyg: true,
		height: 200,
		label: '职业优点_英文'
	},
	careerGroup_en: {
		type: Types.Html,
		wysiwyg: true,
		height: 200,
		label: '适合人群 必备技能_英文'
	},
	careerSalary_en: {
		type: Types.Html,
		wysiwyg: true,
		height: 200,
		label: '薪酬工作时长_英文'
	},
	preparation_en: {
		type: Types.Html,
		wysiwyg: true,
		height: 200,
		label: '如何做如何准备_英文'
	},
	interview_en: {
		type: Types.Html,
		wysiwyg: true,
		height: 200,
		label: '面试考点解析_英文'
	}
});

CareerPath.register();
