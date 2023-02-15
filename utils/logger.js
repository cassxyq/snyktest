const bunyan = require('bunyan');
const path = require('path');
const fs = require('fs');
const logs = './logs';
const geoip = require('geoip-lite');
const { isEmpty } = require('lodash');
const { SENSITIVE_INFO, OBJECT_SENSITIVE_INFO } = require('./constants');

if (!fs.existsSync(logs)) {
	fs.mkdirSync(logs);
}

exports.logger = bunyan.createLogger({
	name: 'jrkeystone',
	streams: [
		{
			type: 'rotating-file',
			level: 'info',
			path: path.join(__dirname, '../logs', 'jrkeystone.log'),
			period: '1d',
			count: 3
		}
	],
	serializers: bunyan.stdSerializers
});

exports.logError = (logger, req, err, statusCode) => {
	const { ip } = req;
	const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
	const geo = JSON.stringify(geoip.lookup(ip));
	let reqBody = JSON.stringify(req.body);
	const formErr = JSON.stringify(
		err.stack ? { stack: err.stack } : { message: err }
	);
	if (!isEmpty(req.body)) {
		SENSITIVE_INFO.map(field => {
			const re = new RegExp(`("${field}":.*?,?)(\\}?")`, 'g');
			reqBody = reqBody.replace(re, '$2');
		});
		OBJECT_SENSITIVE_INFO.map(field => {
			const re = new RegExp(
				`"${field}":(\\{|\\[)+.*?(\\}\\]|\\]|\\}),?`,
				'g'
			);
			reqBody = reqBody.replace(re, '');
		});
	} else {
		reqBody = '';
	}
	const log = logger.child(
		{
			err: formErr,
			ipAddress: ip,
			geo,
			requestUrl: fullUrl,
			statusCode,
			reqBody
		},
		true
	);
	log.info('Error');
};

exports.logInfo = (logger, req, res, statusCode) => {
	const { ip } = req;
	const { resBody, responseTime } = res;
	const geo = JSON.stringify(geoip.lookup(ip));
	let reqBody = JSON.stringify(req.body);
	const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
	if (!isEmpty(req.body)) {
		SENSITIVE_INFO.map(field => {
			const re = new RegExp(`("${field}":".*?",?)(\\}?"?)`, 'g');
			reqBody = reqBody.replace(re, '$2');
		});
		OBJECT_SENSITIVE_INFO.map(field => {
			const re = new RegExp(
				`"${field}":(\\{|\\[)+.*?(\\}\\]|\\]|\\}),?`,
				'g'
			);
			reqBody = reqBody.replace(re, '');
		});
	} else {
		reqBody = '';
	}
	const log = logger.child(
		{
			ipAddress: ip,
			responseTime,
			geo,
			requestUrl: fullUrl,
			reqBody,
			resBody,
			statusCode
		},
		true
	);
	log.info('Info');
};
