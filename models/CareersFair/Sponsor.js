const keystone = require('keystone');
const Types = keystone.Field.Types;
import { logger } from '../../utils/logger';
import generateMailParams from '../../utils/generateMailParams';
const { sqs } = require('../../utils/aws');
import { EMAIL_SERVICE_TYPE } from '../../utils/constants';

/**
 * Careers Fair Sponsor Model
 * =============
 */

const Sponsor = new keystone.List('Sponsor', {
	autokey: { from: 'name', path: 'key', unique: true }
});

Sponsor.add({
	name: { type: String, required: true },
	address: { type: String },
	email: { type: Types.Email },
	mobile: { type: String },
	wechat: { type: String },
	cooperativeType: { type: String },
	companyProfile: { type: String },
	companyLogoName: { type: String },
	companyLogoURL: { type: Types.CloudinaryImage },
	otherInformationFileName: { type: String },
	otherInformationFileURL: { type: String },
	createdAt: { type: Date, default: Date.now },
	complete: { type: Boolean, default: false }
});

Sponsor.schema.post('save', function() {
	if (this.complete) {
		this.sendNotificationEmail();
	}
});

Sponsor.schema.methods.sendNotificationEmail = function() {
	// Gmail Account: jracademybne@gmail.com
	// Gmail Password: jracademybne2018
	// Please go to Google OAuth 2.0 Playground for the new refreshToken and accessToken
	const mailParams = generateMailParams(
		EMAIL_SERVICE_TYPE.CAREER_SPONSOR_NOTIFICATION,
		this.email,
		'career-sponsor-notification.js',
		`"name": "${this.name}"`,
		'Career Sponsor Notification'
	);
	sqs.sendMessage(mailParams, function(err, data) {
		if (err) {
			logger.error(err);
		} else {
			logger.info(data);
		}
	});
};

Sponsor.defaultSort = '-createdAt';
Sponsor.defaultColumns = 'name, email, wechat, phone, createdAt';
Sponsor.register();
