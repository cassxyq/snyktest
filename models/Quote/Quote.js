const keystone = require('keystone');
const dayjs = require('dayjs');
import axios from 'axios';
import { logger } from '../../utils/logger';
import { LAMBDA_URL } from '../../utils/urls';
const Types = keystone.Field.Types;
const quoteTerms = require('../../templates/terms/quoteTerms');
const salesMail = process.env.MAIL_OF_SALES;
const salesOfMelbourne = process.env.MAIL_OF_MELBOURNE;
const salesOfSydney = process.env.MAIL_OF_SYDNEY;
import generateMailParams from '../../utils/generateMailParams';
const { sqs } = require('../../utils/aws');
import { EMAIL_SERVICE_TYPE } from '../../utils/constants';

/**
 * Quote Model
 * =============
 */

const Quote = new keystone.List('Quote', {
	autokey: { from: 'city', path: 'key', unique: true }
});

Quote.add(
	{
		name: { type: String },
		email: { type: Types.Email },
		mobile: { type: String },
		weChat: { type: String },
		country: { type: String, default: 'Australia', note: '用户所居住国家' },
		city: { type: String, required: true, default: 'Brisbane' },
		courseType: { type: String },
		university: { type: String },
		targetCourses: { type: String },
		courseServiceType: { type: String },
		signatureDataURL: { type: String },
		termsConfirm: { type: Boolean, default: false },
		complete: { type: Boolean, default: false },
		sendEmail: { type: Boolean, default: false },
		createdAt: { type: Date, default: Date.now }
	},
	'Sales Admin',
	{
		leadStatus: {
			type: Types.Select,
			options:
				'Open, Connected, In Progress,Done, Unqualified, Bad Timing, Paid',
			label: '销售状态'
		},
		followedby: {
			type: Types.Relationship,
			ref: 'User',
			label: '联系人',
			many: true
		},
		comment: { type: Types.TextArray, label: '纪录' }
	}
);

Quote.schema.post('save', async function() {
	if (this.complete && !this.sendEmail) {
		this.sendNotificationEmailToCustomer();
		this.sendNotificationEmailToSales();
		await keystone
			.list('Quote')
			.model.findOneAndUpdate(
				{ _id: this._id },
				{ $set: { sendEmail: true } },
				{ new: true }
			)
			.exec();
	}
});

Quote.schema.methods.sendNotificationEmailToCustomer = async function() {
	// Gmail Account: jracademybne@gmail.com
	// Gmail Password: jracademybne2018
	//Please go to Google OAuth 2.0 Playground for the new refreshToken and accessToken
	const mailParams = generateMailParams(
		EMAIL_SERVICE_TYPE.QUOTE_TO_CUSTOMER,
		this.email,
		'pending-notification-email.js',
		`{
			"name":"${this.name}", 
			"course":"${this.targetCourses}"
		}`,
		'Customer Quote Notification'
	);

	if (this.signatureDataUrl) {
		const terms = quoteTerms(
			this.name,
			this.signatureDataURL,
			dayjs().format('DD/MM/YYYY')
		);
		const payload = {
			content: terms,
			pageSize: 'A4'
		};

		const termsPdfContent = (
			await axios.post(LAMBDA_URL.CREATE_PDF, payload)
		).data;
		const termsBuffer = Buffer.from(termsPdfContent, 'base64');

		const paramsWithAtt = {
			...mailParams,
			MessageAttributes: {
				...mailParams.MessageAttributes,
				attachment: {
					DataType: 'String',
					StringValue: termsBuffer.toString('base64')
				}
			}
		};

		sqs.sendMessage(paramsWithAtt, function(err, data) {
			if (err) {
				logger.error(err);
			} else {
				logger.info(data);
			}
		});
	}
};

Quote.schema.methods.sendNotificationEmailToSales = function() {
	const mailList = [salesMail];

	if (this.city === 'Melbourne') {
		mailList.push(salesOfMelbourne);
	}
	if (this.city === 'Sydney') {
		mailList.push(salesOfSydney);
	}

	const content = `\\n课程类别：${this.courseType} \\n课程名称：${this.targetCourses}`;
	const joinedMailList = mailList.join();

	const mailParams = generateMailParams(
		EMAIL_SERVICE_TYPE.QUOTE_TO_SALES,
		joinedMailList,
		'quote-to-sales.js',
		`{
			"name": "${this.name.full}",
			"weChat": "${this.weChat}",
			"phone": "${this.mobile}",
			"email": "${this.email}",
			"city": "${this.city}",
			"content": "${content}"
		}`,
		'Quote Notification for Sales'
	);

	return sqs.sendMessage(mailParams, function(err, data) {
		if (err) {
			logger.error(err);
		} else {
			logger.info(data);
		}
	});
};

Quote.defaultSort = '-createdAt';
Quote.defaultColumns =
	'name, email|10%, weChat, targetCourses, leadStatus|10%, country|7%, city|7%, complete, createdAt';
Quote.register();
