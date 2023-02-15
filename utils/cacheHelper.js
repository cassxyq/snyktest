const NodeCache = require('node-cache');

export const universityCache = new NodeCache({
	stdTTL: 86400,
	checkperiod: 14400
});
