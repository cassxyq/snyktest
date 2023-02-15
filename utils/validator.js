export const validateTimeLengthParse = inputStr => {
	const str = String(inputStr);
	if (str.length > 100) {
		return false;
	}
	const match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
		str
	);
	if (!match) {
		return false;
	}
	const type = (match[2] || 'ms').toLowerCase();
	switch (type) {
		case 'years':
		case 'year':
		case 'yrs':
		case 'yr':
		case 'y':
		case 'weeks':
		case 'week':
		case 'w':
		case 'days':
		case 'day':
		case 'd':
		case 'hours':
		case 'hour':
		case 'hrs':
		case 'hr':
		case 'h':
		case 'minutes':
		case 'minute':
		case 'mins':
		case 'min':
		case 'm':
		case 'seconds':
		case 'second':
		case 'secs':
		case 'sec':
		case 's':
		case 'milliseconds':
		case 'millisecond':
		case 'msecs':
		case 'msec':
		case 'ms':
			return true;
		default:
			return false;
	}
};

export const validateEmail = email => {
	const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	const emailValidateResult = emailRegex.test(email);
	return emailValidateResult;
};
