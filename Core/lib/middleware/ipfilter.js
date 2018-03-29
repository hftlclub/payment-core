const app = require('../../app');
const util = require('util');

module.exports = {
	IPFilter:IPFilter,
	LocalFilter:LocalFilter
};

const {errorResponse} = require('../responseHandler');
const ip_filter = require('ip-filter');

/**
 * blocks all requests which are not originating from localhost / 127.0.0.1 / ::1
 */
function LocalFilter(request, response, next){
	let ip = getIPV4(request);
	
	if(ip !== 'localhost' && ip !== '127.0.0.1' && ip !== '::1'){
		response.locals.log = response.locals.log || {label:'localfilter'};
		response.locals.error = util.format(app.strings['general']['localfilter'], ip);
		return errorResponse(response);
	}
	
	return next();
}

/**
 * blocks all requests from not accepted ip-ranges
 * Todo: IPV6
 */
function IPFilter(request, response, next){
	
	let ip = getIPV4(request);
	
	if(!ip_filter(ip, app.cache.ipFilter, {})){
		response.locals.log = response.locals.log || {label:'ipfilter'};
		response.locals.error = util.format(app.strings['general']['ipfilter'], ip);
		return errorResponse(response);
	}
	
	return next();
}

/**
 *
 * @param request
 * @returns {*|string}
 */
function getIPV4(request){
	let ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
	
	if(ip.substr(0, 7) === "::ffff:"){
		ip = ip.substr(7)
	}
	
	return ip;
}