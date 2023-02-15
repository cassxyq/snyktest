import axios from 'axios';
import { LAMBDA_URL } from './urls';
import { EMAIL_CODE_VERIFICATION_STATUS } from './constants';
const nodemailer = require('nodemailer');
const { logger } = require('./logger');
const config = require('../config/auth-config');

exports.sendEmailSmtp = (mailOptions, callback) => {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		tls: true,
		auth: {
			user: config.GMAIL_AUTH_USER,
			pass: config.GMAIL_AUTH_PASS
		}
	});

	transporter.sendMail(mailOptions, (err, res) => {
		if (err) {
			logger.error(err);
			transporter.close();
			callback(err, null);
		} else {
			logger.info('Email Sent');
			transporter.close();
			callback(null, res);
		}
	});
};

export const verifyEmailCode = async (email, userCode) => {
	const currentDate = Date.now();
	const existingEmail = await axios.get(
		`${LAMBDA_URL.VERIFICATION_CODE}/${email}`
	);
	if (existingEmail.data) {
		if (currentDate > existingEmail.data.expireTime) {
			return EMAIL_CODE_VERIFICATION_STATUS.EXPIRED;
		}
		if (userCode !== existingEmail.data.verificationCode) {
			return EMAIL_CODE_VERIFICATION_STATUS.INVALID;
		}
		return EMAIL_CODE_VERIFICATION_STATUS.VALID;
	}
	return EMAIL_CODE_VERIFICATION_STATUS.FAILED;
};
