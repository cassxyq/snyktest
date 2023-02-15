import { URL_TOKEN_SECRET, CIPHER_IV } from '../config/auth-config';
const crypto = require('crypto');
const timespan = require('jsonwebtoken/lib/timespan');

export const encryption = (payload, expiresIn) => {
	const failure = err => {
		throw err;
	};
	const timestamp = Math.floor(Date.now() / 1000);
	payload.issueAt = timestamp;
	if (typeof payload === 'undefined') {
		return failure(new Error('payload is required'));
	}
	if (typeof expiresIn !== 'undefined' && typeof payload === 'object') {
		try {
			payload.expirationTime = timespan(expiresIn, timestamp);
		} catch (err) {
			return failure(err);
		}
	}
	const str = JSON.stringify(payload);
	const cipher = crypto.createCipheriv(
		'aes-256-cbc',
		URL_TOKEN_SECRET,
		CIPHER_IV
	);
	let encryptedString = cipher.update(str, 'utf8', 'hex');
	encryptedString += cipher.final('hex');
	return encryptedString;
};

export const decryption = encryptedString => {
	const decipher = crypto.createDecipheriv(
		'aes-256-cbc',
		URL_TOKEN_SECRET,
		CIPHER_IV
	);
	let decryptedString = decipher.update(encryptedString, 'hex', 'utf8');
	decryptedString += decipher.final('utf8');
	const payload = JSON.parse(decryptedString);
	return payload;
};
