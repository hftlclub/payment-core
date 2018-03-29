const util = require('util');
const app = require('../app');

module.exports = {
	RATE_LIMITER,
	IPFilter,
	Credit_Limits
};

/**
 * check SERVER_BEHIND_PROXY env var
 * = if behind reverse proxy enable trust proxy
 */
function RATE_LIMITER(){
	if((process.env.SERVER_BEHIND_PROXY).toUpperCase() === 'TRUE'){
		app.enable('trust proxy');
	}
}

/**
 * check that ipfilter gets valid iprange
 * todo validate ip .. problem: wildcards syntax for ipfilter module
 */
function IPFilter(){
	const allowed = process.env.ALLOWED_FILTER;
	const ips = allowed.split(',');
	
	app.cache = app.cache || {};
	app.cache.ipFilter = [];
	
	if(ips.length > 1){
		for(const ip of ips){
			app.cache.ipFilter.push(ip);
		}
	}else{
		app.cache.ipFilter.push(ips);
	}
}

/**
 * check that credit_limit is a valid number
 */
function Credit_Limits(){
	const CREDIT_LIMIT = parseInt(process.env.TRANSAKTION_CREDIT_LIMIT);
	if(typeof CREDIT_LIMIT !== 'number' || isNaN(CREDIT_LIMIT) || CREDIT_LIMIT <= 0){
		console.error(util.format(app.strings['general']['env_error'], process.env.TRANSAKTION_CREDIT_LIMIT));
		process.exit(1)
	}
	
}

