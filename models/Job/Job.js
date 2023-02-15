const keystone = require('keystone');
const Types = keystone.Field.Types;
const Company = keystone.list('Company');
const truncate = require('truncate-html');
import { isEmpty } from 'lodash';
const { logger } = require('../../utils/logger');
const {
	handleInitialJobCount,
	handleOneJobCountIncrease,
	handleOneJobCountDecrease
} = require('../Job/handleRecommendJobCountUpdate');
import { JOB_VISA_TYPE, JOB_TYPE } from '../../utils/constants';

/**
 * Job Model
 * ==========
 */

const Job = new keystone.List('Job', {
	map: { name: 'title' },
	autokey: { path: 'key', from: 'title', unique: true }
});

Job.add({
	meta: {
		title: { type: String },
		keywords: { type: String },
		description: {
			type: String,
			note: 'For SEO'
		}
	},
	title: { type: String, initial: true, required: true, max: 55 },
	company: { type: Types.Relationship, ref: 'Company' },
	country: { type: String },
	city: { type: Types.Relationship, ref: 'City' },
	salary: { type: String, default: 'Competitive' },
	salaryRange: { type: String },
	jobRequiredExperience: {
		type: Types.Select,
		options: '毕业生, 1年以内经验, 1~3年经验, 3年以上经验, 无经验要求',
		default: '1~3年经验'
	},
	jobType: {
		type: Types.Select,
		options: Object.values(JOB_TYPE),
		default: JOB_TYPE.FULL_TIME
	},
	visa: {
		type: Types.Select,
		options: Object.values(JOB_VISA_TYPE),
		default: JOB_VISA_TYPE.WORKING_VISA
	},
	visaRequirement: {
		type: Types.TextArray,
		note: 'visa Requirement (Multiple Select)'
	},
	level: {
		type: Types.Select,
		options:
			'Intern, Graduate Program, Junior, Mid-Level, Senior, Tech-lead, Other',
		default: 'Mid-Level'
	},
	jobFeatures: {
		type: Types.Select,
		options: '工作内推, 仅限学员和tutor, 公司直聘, 猎头推荐',
		default: '工作内推',
		note:
			'工作内推是非公司官方发布，个人发布；公司直聘是公司发布招聘信息，比如匠人内部招聘选择公司直聘；仅限学员是仅限内部人员；猎头推荐是猎头代发在匠人平台'
	},
	jobRequiredDegree: {
		type: Types.Select,
		options: '本科以上, 硕士以上, PHD, 无背景要求',
		default: '无背景要求'
	},
	state: {
		type: Types.Select,
		options: 'draft, published',
		default: 'draft',
		index: true,
		note: '发布状态(草稿/发布)'
	},
	status: {
		type: Types.Select,
		options: 'Open, Close',
		default: 'Open',
		note: '开放职位/关闭职位'
	},
	author: {
		type: Types.Relationship,
		ref: 'User',
		index: true,
		initial: true
	},
	visibleSalary: {
		detailedSalary: { type: String },
		salaryVisibilityStatus: {
			type: Types.Select,
			options: 'Open, Hide',
			default: 'Open',
			note: '发布薪水状态(发布/隐藏)'
		}
	},
	detailedSalary: { type: String },
	salaryVisibilityStatus: {
		type: Types.Select,
		options: 'Open, Hide',
		default: 'Open',
		note: '发布薪水状态(发布/隐藏)'
	},
	anonymousUser: { type: String, default: 'Anonymous' },
	publishedDate: {
		type: Types.Date,
		index: true,
		dependsOn: { state: 'published' }
	},
	effictivePeriod: {
		type: Types.Number,
		default: 60,
		note: '有效期多少时间，比如30天'
	},
	deadline: {
		type: Types.Date,
		index: true,
		dependsOn: { state: 'published' }
	},
	briefDescription: {
		type: String,
		max: 120,
		note: '简单描述会出现在工作缩略描述里'
	},
	job: {
		description: { type: Types.Html, wysiwyg: true, height: 150 },
		requirement: { type: Types.Html, wysiwyg: true, height: 400 },
		company: { type: Types.Html, wysiwyg: true, height: 150 },
		companyName: { type: String },
		companyDescription: { type: String },
		address: { type: String }
	},
	applicationCount: { type: Number, default: 0 },
	referral: {
		referralName: { type: String },
		referralEmail: { type: String },
		referralPhone: { type: String },
		referralWechat: { type: String }
	},
	categories: { type: Types.Relationship, ref: 'JobCategory', many: true },
	apply: { type: String },
	applyMethod: { type: String },
	isFeatured: { type: Boolean, default: false },
	tag: { type: Types.TextArray }
});

Job.schema.pre('save', function(next) {
	this.effictivePeriod;
	this.publishedDate = this.publishedDate ? this.publishedDate : new Date();
	this.deadline = new Date();

	this.deadline.setDate(this.publishedDate.getDate() + this.effictivePeriod);
	next();
});

Job.schema.virtual('content.full').get(function() {
	return this.content.description || this.content.requirement;
});

Job.schema.virtual('url').get(() => {
	return '/jobs/' + this.key;
});

Job.schema.pre('save', async function(next) {
	const job = await Job.model.findById(this._id);
	let companyDetail = '';
	if (
		!isEmpty(job) &&
		!isEmpty(job._doc.company) &&
		this.company !== job._doc.company
	) {
		await Company.model.findById(job._doc.company).exec((err, company) => {
			handleOneJobCountDecrease(Company, company, null, logger);
			companyDetail = company._doc;
		});
	}
	if (isEmpty(this.meta.title) || this.isModified) {
		this.meta.title = `${this.title}${
			!isEmpty(companyDetail) && companyDetail !== ''
				? ` | ${companyDetail.name}`
				: ''
		}`;
		this.meta.keywords = `${this.title}${
			!isEmpty(companyDetail) && companyDetail !== ''
				? ` | ${companyDetail.name}`
				: ''
		}`;
		this.meta.description = this.job.description
			? truncate(
				`${this.title} ${this.job.description}`,
				(this.title.length + this.job.description.length) * 0.15 < 50
					? (this.title.length + this.job.description.length) * 0.15
					: 100,
				{ stripTags: true }
			  )
			: `${this.title}`;
	}
	next();
});

Job.schema.post('save', function() {
	const Job = keystone.list('Job');
	if (this.company) {
		Company.model.findById(this.company).exec((err, company) => {
			if (err) return logger.error(err);
			if (company) {
				if (!company._doc.jobCount && company._doc.jobCount !== 0) {
					handleInitialJobCount(Job, Company, company, null, logger);
				} else {
					handleOneJobCountIncrease(Company, company, null, logger);
				}
			}
		});
	}
});

Job.schema.post('remove', function() {
	const Job = keystone.list('Job');
	if (this.company) {
		Company.model.findById(this.company).exec((err, company) => {
			if (err) return logger.error(err);
			if (company) {
				if (!company._doc.jobCount && company._doc.jobCount !== 0) {
					handleInitialJobCount(Job, Company, company, null, logger);
				} else {
					handleOneJobCountDecrease(Company, company, null, logger);
				}
			}
		});
	}
});

Job.defaultSort = '-publishedDate';
Job.defaultColumns =
	'title|20%, company|12%, city|8%, state|8%, author|8%, categories|14%, visa|5%, publishedDate|13%, apply|5%';
Job.register();
