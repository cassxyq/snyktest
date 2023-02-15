const keystone = require('keystone');
const Types = keystone.Field.Types;
import { logger } from '../../utils/logger';
import generateMailParams from '../../utils/generateMailParams';
const { sqs } = require('../../utils/aws');
import { EMAIL_SERVICE_TYPE } from '../../utils/constants';
/**
 * Meetup Enrollment Model
 * =============
 */
const MeetupEnrollment = new keystone.List('MeetupEnrollment', {
	autokey: { from: 'name', path: 'key', unique: true }
});

MeetupEnrollment.add({
	name: { type: String, required: true },
	email: { type: Types.Email },
	phone: { type: String },
	wechat: { type: String },
	university: { type: String },
	major: { type: String },
	degree: { type: String },
	channel: { type: String },
	payMethod: { type: String },
	createdAt: { type: Date, default: Date.now }
});
MeetupEnrollment.schema.pre('save', function(next) {
	this.wasNew = this.isNew;
	next();
});
MeetupEnrollment.schema.post('save', function() {
	if (this.wasNew) {
		this.sendNotificationEmail();
	}
});
MeetupEnrollment.schema.methods.sendNotificationEmail = function() {
	// Gmail Account: jracademybne@gmail.com
	// Gmail Password: jracademybne2018
	//Please go to Google OAuth 2.0 Playground for the new refreshToken and accessToken
	const mailParams = generateMailParams(
		EMAIL_SERVICE_TYPE.MEETUP_ENROLLMENT_NOTIFICATION,
		this.email,
		'meetup-enrollment-notification.js',
		`"name": "${this.name}"`,
		'Meetup Enrollment Notification'
	);
	sqs.sendMessage(mailParams, function(err, data) {
		if (err) {
			logger.error(err);
		} else {
			logger.info(data);
		}
	});
};

MeetupEnrollment.defaultSort = '-createdAt';
MeetupEnrollment.defaultColumns = 'name, email, wechat, phone, createdAt';
MeetupEnrollment.register();
