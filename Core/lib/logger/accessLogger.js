const util = require('util');
const winston = require('winston');
const {combine, timestamp, printf} = winston.format;

module.exports = {
	log404:log404
};

const transport = require('./transports');

const app = require('../../app');

// todo refactor and merge with responseLoger
const accessFormat = printf((info) =>{
	//timestamp
	let str = `${info.timestamp} - `;
	
	//error|info...
	str += `[${info.level}] - `;
	
	str += app.getIPstring(info.request);
	
	return str;
});

/**
 *
 * @type {*|DerivedLogger}
 */
const access_logger = winston.createLogger({
	format:combine(
		timestamp(),
		accessFormat
	),
	transports:[
		transport.error,
		transport.total,
	]
});

/**
 *
 * @param request
 * @returns {string|*}
 */
function log404(request){
	
	const msg = util.format(
		app.strings['general']['404'],
		request.method,
		request.protocol,
		request.get('host'),
		request.originalUrl
	);
	
	access_logger.error({}, {request:request});
	
	return msg;
}
