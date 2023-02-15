const jwt = require('jsonwebtoken');

/**
 * @description return a token encoded by JWT
 * @param {object} payload data to be encoded
 * @param {string} secret secret or private key
 * @param {string} expiresIn expressed in seconds or a string describing a time span zeit/ms
 */

export const createToken = (payload, secret, expiresIn = '1d') => {
	return jwt.sign(payload, secret, { expiresIn });
};
