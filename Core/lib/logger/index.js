const util = require('util');
const {exception_logger} = require('./exceptionLogger');
const {log404} = require('./accessLogger');

const logger = require('./responseLogger');

/**
 * main log function, logs according to set response.locals.log values
 * @param response {Object} express Response
 */
function log(response){
	
	if(!response.locals.log){
		response.locals.log.exception = 'missing response locals.log entry';
		return exception_logger.error({}, response);
	}
	
	if(!response.locals.log.label){
		response.locals.log.exception = 'missing response locals.log.label entry';
		return exception_logger.error({}, response);
	}
	
	try{
		
		//get and use matching logger for label if exists
		const l = response.locals.log.label + '_logger';
		if(logger.hasOwnProperty(l)){
			
			const log = logger[l];
			
			//error logging
			if(response.locals.error){
				return log.error({}, response);
			}
			
			//exceptions
			if(response.locals.log.exception){
				return exception_logger.error({}, response);
			}
			
			return log.info({}, response);
		}
		
		//use exception logger
		response.locals.log.exception = 'UNKNOWN LOGGING LABEL';
		return exception_logger.error({}, response);
		
		
	}catch(error){
		response.locals.log.exception = error;
		exception_logger.error({}, response);
	}
}

/**
 * log critical error and end process
 * @param error
 * @returns {*}
 */
function log_critcal(error){
	exception_logger.error({}, {criticalData:error});
	console.error(util.inspect(error));
	process.exit(1000);
}

module.exports = {
	log:log,
	log404:log404,
	critical:log_critcal
};