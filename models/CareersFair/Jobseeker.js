const keystone = require('keystone');
const Types = keystone.Field.Types;
import { logger } from '../../utils/logger';
import generateMailParams from '../../utils/generateMailParams';
const { sqs } = require('../../utils/aws');
import { EMAIL_SERVICE_TYPE } from '../../utils/constants';

/**
 * Careers Fair JobSeeker Model
 * =============
 */
const JobSeeker = new keystone.List('JobSeeker', {
	autokey: { from: 'name', path: 'key', unique: true }
});

JobSeeker.add({
	name: { type: String, required: true },
	prefix: { type: String },
	visa: { type: String },
	email: { type: Types.Email },
	mobile: { type: String },
	wechat: { type: String },
	university: { type: String },
	careerDirection: { type: String },
	jobType: { type: String },
	consent: { type: String },
	moreMessage: { type: String },
	resumeFileName: { type: String },
	resumeFileURL: { type: String },
	createdAt: { type: Date, default: Date.now },
	complete: { type: Boolean, default: false }
});

JobSeeker.schema.post('save', function() {
	if (this.complete) {
		this.sendNotificationEmail();
	}
});

JobSeeker.schema.methods.sendNotificationEmail = function() {
	const mailParams = generateMailParams(
		EMAIL_SERVICE_TYPE.CAREER_FAIR_REGISTRY,
		this.email,
		'job-seeker.js',
		`"name": "${this.name}"`,
		'Job Seeker Notification'
	);
	sqs.sendMessage(mailParams, function(err, data) {
		if (err) {
			logger.error(err);
		} else {
			logger.info(data);
		}
	});
};

JobSeeker.defaultSort = '-createdAt';
JobSeeker.defaultColumns = 'name, email, wechat, mobile, createdAt';
JobSeeker.register();
