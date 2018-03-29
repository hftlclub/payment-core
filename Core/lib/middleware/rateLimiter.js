const app = require('../../app');
const RateLimit = require('express-rate-limit');
const util = require('util');

module.exports = {
	TerminalRateLimier:TerminalRateLimier(),
	GeneralRateLimier:GeneralRateLimier()
};

const {errorResponse} = require('../responseHandler');

/**
 * Beschränkt die Zugriffe innerhalb eines Zeitraumes für eine IP für alle NICHT Terminal Routen
 * @see https://www.npmjs.com/package/express-rate-limit
 * @returns {function(req,res,next)|RateLimit}
 */
function GeneralRateLimier(){
	
	if((process.env.IP_RATE_LIMITERS_ACTIVE).toUpperCase() === 'FALSE'){
		return (req, res, next) =>{next()};
	}
	
	return new RateLimit({
		windowsMs:process.env.IP_RATE_GENERAL_TIME_LIMIT,
		max:process.env.IP_RATE_GENERAL_MAX_CONNECTIONS,
		delayMS:0,
		headers:true,
		handler:(req, response) =>{
			response.setHeader('Retry-After', Math.ceil(process.env.IP_RATE_TERMINAL_TIME_LIMIT / 1000));
			response.locals.log = response.locals.log || {label:'ratelimiter'};
			response.locals.error = app.strings['general']['api_rate_limit_reached'];
			return errorResponse(response);
		}
	});
}

/**
 * Beschränkt die Zugriffe innerhalb eines Zeitraumes für eine IP für alle Terminal Routen
 * @see https://www.npmjs.com/package/express-rate-limit
 * @returns {function(req,res,next)|RateLimit}
 */
function TerminalRateLimier(){
	
	if((process.env.IP_RATE_LIMITERS_ACTIVE).toUpperCase() === 'FALSE'){
		return (req, res, next) =>{next()};
	}
	
	return new RateLimit({
		windowsMs:process.env.IP_RATE_TERMINAL_TIME_LIMIT,
		max:process.env.IP_RATE_TERMINAL_MAX_CONNECTIONS,
		delayMS:0,
		headers:true,
		handler:(req, response) =>{
			response.setHeader('Retry-After', Math.ceil(process.env.IP_RATE_TERMINAL_TIME_LIMIT / 1000));
			response.locals.log = response.locals.log || {label:'ratelimiter'};
			response.locals.error = app.strings['general']['terminal_rate_limit_reached'];
			return errorResponse(response);
		}
	});
}