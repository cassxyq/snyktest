import ratingConfig from '../../utils/ratingConfig';
import { isEmpty } from 'lodash';
import {
	EMAIL_SERVICE_SQS_URL,
	EMAIL_SERVICE_TYPE
} from '../../utils/constants';
const truncate = require('truncate-html');
const keystone = require('keystone');
const Types = keystone.Field.Types;
const Company = keystone.list('Company');
const { logger } = require('../../utils/logger');

const {
	handleInitialInterviewsCount,
	handleOneInterviewsCountIncrease,
	handleOneInterviewsCountDecrease
} = require('../Job/handleCompanyJobInterviewsCountUpdate');
const { sqs } = require('../../utils/aws');

/**
 * JobInterview Model
 * ==================
 */

const JobInterview = new keystone.List('JobInterview', {
	map: { name: 'title' },
	autokey: { path: 'key', from: 'title', unique: true }
});

JobInterview.add(
	{
		meta: {
			title: { type: String },
			keywords: { type: String },
			description: {
				type: String,
				note: 'For SEO'
			}
		},
		title: { type: String, required: true },
		position: { type: String },
		company: { type: Types.Relationship, ref: 'Company' },
		companyName: { type: String },
		recruitmentType: {
			type: Types.Select,
			options: [
				{ value: 'off-campus', label: '社招' },
				{ value: 'on-campus', label: '校招' },
				{ value: 'management-trainee', label: '管培生' }
			],
			default: 'off-campus',
			label: '应聘渠道'
		},
		jobType: {
			type: Types.Select,
			options: 'Intern, Part-time, Full-time, Contract, Casual',
			default: 'Full-time',
			label: '工作性质'
		},
		type: { type: Types.TextArray, label: '面试类型' },
		content: {
			type: Types.Html,
			wysiwyg: true,
			height: 800,
			label: '面试经历详情'
		},
		wordCount: {
			type: Types.Number,
			label: '面试经历详情的字数统计'
		},
		materials: {
			type: Types.Relationship,
			ref: 'Material',
			many: true,
			label: '附件'
		},
		user: { type: Types.Relationship, ref: 'User' },
		isAnonymous: { type: Boolean, default: false, label: '是否匿名' },
		isVerified: { type: Boolean, label: '是否审核成功' },
		isDeclined: { type: Boolean, default: false, label: '已拒绝' },
		isArchived: {
			type: Boolean,
			default: false,
			label: '是否已经被删除，对用户不可见'
		},
		isRecommended: {
			type: Boolean,
			initial: false,
			label: '是否精选'
		},
		publishedDate: {
			type: Types.Date,
			index: true
		},
		InterviewQuestionCount: {
			type: Number,
			default: 0
		}
	},
	'Optional',
	{
		method: {
			type: String,
			label: '获取面试机会的方式'
		},
		status: {
			type: Types.Select,
			options: [
				{ value: 'accepted', label: '已获得' },
				{ value: 'pending', label: '等待中' },
				{ value: 'failed', label: '未获得' },
				{ value: 'rejected', label: '已拒绝' }
			],
			label: '是否获得Offer'
		},
		difficulty: { ...ratingConfig, label: '难易度' },
		tag: { type: Types.TextArray },
		rating: { ...ratingConfig, label: '体验评分' }
	}
);

JobInterview.schema.pre('save', async function(next) {
	const jobInterview = await JobInterview.model.findById(this._id);
	if (isEmpty(this.meta.title)) {
		this.meta.title = `${this.title} | 面试经验分享`;
		this.meta.keywords = `${this.title}, 面试经验分享, 面试, 面经`;
		this.meta.description = this.content
			? truncate(
				this.content,
				this.content.length * 0.15 < 50
					? this.content.length * 0.15
					: 100,
				{ stripTags: true }
			  )
			: `${this.title} | 面试经验分享`;
	}
	if (
		!isEmpty(jobInterview) &&
		!isEmpty(jobInterview._doc.company) &&
		this.company !== jobInterview._doc.company
	) {
		Company.model
			.findById(jobInterview._doc.company)
			.exec((err, company) => {
				handleOneInterviewsCountDecrease(
					Company,
					company,
					null,
					logger
				);
			});
	}

	this.shouldSendVerifiedEmail =
		this.isModified('isVerified') && this.isVerified;
	this.shouldSendDeclinedEmail =
		this.isModified('isDeclined') && this.isDeclined;

	next();
});

JobInterview.schema.methods.sendNotificationEmail = async function(status) {
	const User = keystone.list('User');
	const user = await User.model.findById(this.user).exec((err, item) => {
		if (err) {
			logger.error(err);
		}
	});
	const manageInterviewUrl =
		'https://learn.jiangren.com.au/home?tab=jobInterview#myInterviews';
	const mailParams = {
		DelaySeconds: 10,
		MessageAttributes: {
			template: {
				DataType: 'String',
				StringValue:
					status === 'verified'
						? EMAIL_SERVICE_TYPE.INTERVIEW_VERIFIED
						: EMAIL_SERVICE_TYPE.INTERVIEW_DECLINED
			},
			to: {
				DataType: 'String',
				StringValue: user.email
			},
			html: {
				DataType: 'String',
				StringValue:
					status === 'verified'
						? 'interview-verified.js'
						: 'interview-declined.js'
			},
			params: {
				DataType: 'String',
				StringValue: `{
					"tokenLink":"${manageInterviewUrl}",
					"title":"${this.title}",
					"name":"${user.name.first}"
				}`
			}
		},
		MessageBody: 'Job Interviews',
		QueueUrl: EMAIL_SERVICE_SQS_URL
	};
	sqs.sendMessage(mailParams, function(err, data) {
		if (err) {
			logger.error(err);
		} else {
			logger.info(data);
		}
	});
};
JobInterview.schema.post('save', function() {
	const jobInterview = keystone.list('JobInterview');
	if (this.company) {
		Company.model.findById(this.company).exec((err, company) => {
			if (err) return logger.error(err);
			if (company) {
				if (
					!company._doc.interviewsCount &&
					company._doc.interviewsCount !== 0
				) {
					handleInitialInterviewsCount(
						jobInterview,
						Company,
						company,
						null,
						logger
					);
				} else {
					handleOneInterviewsCountIncrease(
						Company,
						company,
						null,
						logger
					);
				}
			}
		});
	}
	if (this.shouldSendVerifiedEmail) {
		this.sendNotificationEmail('verified');
	}
	if (this.shouldSendDeclinedEmail) {
		this.sendNotificationEmail('declined');
	}
});

JobInterview.schema.post('remove', function() {
	const jobInterview = keystone.list('JobInterview');
	if (this.company) {
		Company.model.findById(this.company).exec((err, company) => {
			if (err) return logger.error(err);
			if (company) {
				if (
					!company._doc.interviewsCount &&
					company._doc.interviewsCount !== 0
				) {
					handleInitialInterviewsCount(
						jobInterview,
						Company,
						company,
						null,
						logger
					);
				} else {
					handleOneInterviewsCountDecrease(
						Company,
						company,
						null,
						logger
					);
				}
			}
		});
	}
});

JobInterview.defaultSort = '-publishedDate';
JobInterview.defaultColumns =
	'title|25%, company|10%, position|10%, recruitmentType|10%, jobType|10%, type|10%, publishedDate|10%, user|10%, isVerified|5%';
JobInterview.register();
