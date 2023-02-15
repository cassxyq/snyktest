const keystone = require('keystone');
const Types = keystone.Field.Types;
const { logger } = require('../../utils/logger');
const { updateApplicationCount } = require('./handleUpdateApplicantCount');
const {
	TRIPLE_STATES,
	JOB_APPLICATION_STATUS,
	USER_SOURCE
} = require('../../utils/constants');
import generateMailParams from '../../utils/generateMailParams';
import { EMAIL_SERVICE_TYPE, isProd } from '../../utils/constants';
const { sqs } = require('../../utils/aws');
const { getCurrentUrlByEnv, getJobpinUrlByEnv } = require('../../utils/urls');
import { validateEmail } from '../../utils/validator';
import { isEmpty } from 'lodash';
import { encryption } from '../../utils/urlToken';

const BUCKET = isProd ? 'jracademy' : 'jrresource';
const login = isProd ? 'wechat' : 'login';
const BASE_URL = getCurrentUrlByEnv();
const JOBPIN_BASE_URL = getJobpinUrlByEnv();

/**
 * JobApplication Model
 * ==================
 */
const JobApplication = new keystone.List('JobApplication', {
	map: { name: 'title' },
	autokey: { path: 'key', from: 'title', unique: true }
});

JobApplication.add(
	{
		title: { type: String, required: true },
		company: { type: String },
		applicant: {
			type: Types.Relationship,
			ref: 'User'
		},
		referral: {
			type: Types.Relationship,
			ref: 'User',
			many: true
		},
		job: {
			type: Types.Relationship,
			ref: 'Job'
		},
		createdAt: { type: Date, default: Date.now },
		source: {
			type: Types.Select,
			options: Object.values(USER_SOURCE),
			default: USER_SOURCE.JR_ACADEMY,
			note: '用户申请的前端'
		},
		isArchived: { type: Boolean, default: false },
		isShow: { type: Boolean, default: true }
	},
	{
		files: {
			type: Types.Relationship,
			ref: 'Resource',
			note: '简历及其他资料',
			many: true
		},
		coverLetter: {
			type: Types.Relationship,
			ref: 'Resource',
			note: 'CoverLetter',
		},
		others: {
			name: { type: String },
			link: { type: String }
		},
		isVerified: {
			type: Types.Select,
			options: Object.values(TRIPLE_STATES),
			initial: true,
			default: TRIPLE_STATES.UNSET,
			label: '是否审核成功'
		},
		isDeclined: {
			type: Types.Select,
			options: Object.values(TRIPLE_STATES),
			initial: true,
			default: TRIPLE_STATES.UNSET,
			label: '是否拒绝'
		},
		status: {
			type: Types.Select,
			initial: true,
			options: Object.values(JOB_APPLICATION_STATUS),
			default: JOB_APPLICATION_STATUS.INBOX
		}
	},
	/**
	 * Fields for referrers to indicate the reason of a not verified job application.
	 * Normally, there is at least one tag in verifyTags, other fields are optional.
	 */
	{
		verifyTags: {
			type: Types.TextArray,
			dependsOn: { isVerified: TRIPLE_STATES.FALSE }
		},
		verifyDescription: {
			type: String,
			dependsOn: { isVerified: TRIPLE_STATES.FALSE }
		}
	}
);

JobApplication.schema.pre('save', async function(next) {
	this.wasNew = this.isNew;
	next();
});

JobApplication.schema.post('save', function() {
	if (this.referral) {
		this.referral.forEach(referral => {
			updateApplicationCount(
				1,
				keystone.list('JobApplication').model,
				keystone.list('User').model,
				referral,
				null,
				logger
			);
		});
	}
	if (this.job && this.applicant) {
		updateApplicationCount(
			1,
			keystone.list('JobApplication').model,
			keystone.list('Job').model,
			this.job,
			null,
			logger
		);
		if (this.wasNew) this.sendConfirmationEmail();
		setTimeout(() => {
			this.sendNotificationEmail();
		}, 15 * 1000);
	}
});

JobApplication.schema.methods.sendNotificationEmail = async function() {
	const JobApplication = keystone.list('JobApplication');
	const Resource = keystone.list('Resource');
	const User = keystone.list('User');
	const Job = keystone.list('Job');

	try {
		const application = await JobApplication.model
			.findById(this._id)
			.exec(err => {
				if (err) {
					logger.error(err);
				}
			});

		const fileList = await Resource.model.find({
			_id: {
				$in: [
					...application.files,
					...this.coverLetter ? [ this.coverLetter ] : []
				]
			}
		});

		const key = fileList.filter(file => file.key).map(file => file.key).join(',');

		const jobPosition = await Job.model
			.findById(this.job)
			.populate('company', 'name')
			.populate('author', ['name', 'email'])
			.exec(err => {
				if (err) {
					logger.error(err);
				}
			});

		const data = { id: jobPosition?.author?._id };
		const oneTimeToken = encryption({ ...data }, '1d');

		const jobApplicant = await User.model
			.findById(this.applicant)
			.exec(err => {
				if (err) {
					logger.error(err);
				}
			});

		const jobAuthorName = jobPosition?.author?.name?.first;

		// combine mailParams with attachment config
		const mailParamsWithAttachmentsConfig = (mailParams) => ({
			...mailParams,
			MessageAttributes: {
				...mailParams.MessageAttributes,
				bucket: {
					DataType: 'String',
					StringValue: BUCKET
				},
				key: {
					DataType: 'String',
					StringValue: key
				}
			}
		});

		// get mailParams for default job-application-notification by JR Academy
		const getEmailParamsForJobApplicationNotification = (email, name) => generateMailParams(
			EMAIL_SERVICE_TYPE.JOB_APPLICATION_NOTIFICATION,
			email,
			'job-application-notification.js',
			`{
				"tokenLink": "${BASE_URL}/job-management/?redirectTo=${login}",
				"positionLink":"${BASE_URL}/home/?tab=job&infoType=job&id=${this.job}",
				"title": "${this.title}",
				"name": "${name}",
				"company": "${this.company || jobPosition?.company?.name || 'the company'}",
				"firstName": "${jobApplicant.applicantDetail.firstName}",
				"lastName": "${jobApplicant.applicantDetail.lastName}",
				"email": "${jobApplicant.applicantDetail.email}",
				"phone": "${jobApplicant.applicantDetail.prefix} ${jobApplicant.applicantDetail.phoneNumber}"
			}`,
			'Job Application Notification'
		);

		// get mailParams for jobpin-job-application-notification by Jobpin
		const getEmailParamsForJobPinJobApplicationNotification = (email) => generateMailParams(
			EMAIL_SERVICE_TYPE.JOBPIN_JOB_APPLICATION_NOTIFICATION,
			email,
			'jobpin-job-application-notification.js',
			`{
				"title": "${application.title}",
				"applicantName": "${jobApplicant.name.first || ''} ${jobApplicant.name.last || ''}",
				"applicantEmail": "${jobApplicant.email}",
				"applicantPhone": "${jobApplicant.prefix ? `+${jobApplicant.prefix} ` : ''}${jobApplicant.phone}",
				"loginLink": "${JOBPIN_BASE_URL}/login?role=employer&redirectAsPath=/talent/jobs/job?id=${application.job}&token=${oneTimeToken}",
				"jobLink": "${JOBPIN_BASE_URL}/jobs/${application.job}"
			}`,
			'Jobpin Job Application Notification'
		);

		// mail params for notifying the job author
		let mailParams = {};
		switch(this.source) {
			case USER_SOURCE.JOBPIN:
				if (jobPosition?.author?.email) {
					mailParams = getEmailParamsForJobPinJobApplicationNotification(jobPosition.author.email);
				}
				// Send email to apply email if the apply email is different from the author email
				if (validateEmail(jobPosition.apply) && jobPosition.apply !== jobPosition?.author?.email) {
					const applyEmailParams = getEmailParamsForJobPinJobApplicationNotification(jobPosition.apply);
					sendEmail(key ? mailParamsWithAttachmentsConfig(applyEmailParams) : applyEmailParams);
				}
				break;
			default: {
				const jobAuthorEmail = jobPosition.apply;
				if (jobAuthorEmail && validateEmail(jobAuthorEmail)) {
					mailParams = getEmailParamsForJobApplicationNotification(jobAuthorEmail, jobAuthorName || 'Author');
				}
				break;
			}
		}
		if (isEmpty(mailParams)) return;

		sendEmail(key ? mailParamsWithAttachmentsConfig(mailParams) : mailParams);

		// Send email to referral
		const jobReferral = await User.model
			.findById(jobEnquiry?.referral[0])
			.exec(err => {
				if (err) {
					logger.error(err);
				}
			});

		if (jobReferral && jobReferral.email) {
			const jobReferralEmail = jobReferral.email;
			const jobReferralName = jobReferral.name.first;
			const mailParamsForReferral = getEmailParamsForJobApplicationNotification(jobReferralEmail, jobReferralName);
			sendEmail(key ? mailParamsWithAttachmentsConfig(mailParamsForReferral) : mailParamsForReferral);
		}
	} catch (err) {
		logger.error(err);
	}
};

JobApplication.schema.methods.sendConfirmationEmail = async function() {
	const Job = keystone.list('Job');
	const User = keystone.list('User');

	const jobPosition = !this.company && await Job.model
		.findById(this.job)
		.populate('company', 'name')
		.exec(err => {
			if (err) {
				logger.error(err);
			}
		});

	const jobApplicant = await User.model
		.findById(this.applicant)
		.exec(err => {
			if (err) {
				logger.error(err);
			}
		});

	let mailParams = {};
	switch(this.source) {
		case USER_SOURCE.JOBPIN:
			break;
		default: {
			if (jobApplicant.applicantDetail.email) {
				mailParams = generateMailParams(
					EMAIL_SERVICE_TYPE.JOB_APPLICATION_CONFIRMATION,
					jobApplicant.applicantDetail.email,
					'job-application-confirmation.js',
					`{
						"tokenLink": "${BASE_URL}/account/jobApplication/?redirectTo=${login}",
						"positionLink":"${BASE_URL}/home/?tab=job&infoType=job&id=${this.job}",
						"company":"${this.company || jobPosition?.company?.name}",
						"title": "${this.title}",
						"name": "${jobApplicant.applicantDetail.firstName}"
					}`,
					'Job Application Confirmation'
				);
			}
			break;
		}
	}
	if (isEmpty(mailParams)) return;

	return sendEmail(mailParams);
};

JobApplication.schema.post('remove delete', function() {
	if (this.referral) {
		this.referral.forEach(referral => {
			updateApplicationCount(
				-1,
				keystone.list('JobApplication').model,
				keystone.list('User').model,
				referral,
				null,
				logger
			);
		});
	}
	if (this.job) {
		updateApplicationCount(
			-1,
			keystone.list('JobApplication').model,
			keystone.list('Job').model,
			this.job,
			0,
			logger
		);
	}
});

const sendEmail = (mailParams) => {
	return sqs.sendMessage(mailParams, function(err, data) {
		if (err) {
			logger.error(err);
		} else {
			logger.info(data);
		}
	});
};

JobApplication.defaultSort = '-createdAt';

JobApplication.defaultColumns =
	'title, company, applicant, isVerified, isDeclined, isArchived';

JobApplication.register();
