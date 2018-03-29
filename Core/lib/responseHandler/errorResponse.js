const Logger = require('../logger');

module.exports = {
	attach_routes:attach_routes,
	errorResponse:response
};

const app = require('../../app');

/**
 * attach 404 and 500 handler to application
 * @param router
 */
function attach_routes(router){
	// 404
	router.use('*', route_not_found);
	
	// 500 & others
	router.use(error_response);
}

/**
 *
 * @param request
 * @param response
 * @param next
 */
function route_not_found(request, response, next){
	
	//critical events
	if(response.locals['exception']){
		return next();
	}
	
	//unknown route
	if(!response.locals || !Object.keys(response.locals).length){
		response.status(404);
		const msg = Logger.log404(request);
		return response.json({status:false, message:msg});
	}
	
	//ressource or user does not exist
	if(response.statusCode === 404 && response.locals['error']){
		Logger.log(response);
		return response.json({status:false, message:response.locals.error});
	}
	
	//500
	return next();
}

/**
 * called from 500 handler or specific middleware
 * @param error (request object)
 * @param request, ignored
 */
function error_response(error, request){
	response(error.res);
}

/**
 * sink for most client error responses
 * @param response = error response object
 */
function response(response){
	
	response.status(500);
	
	//create logging object if not exist
	if(!response.locals.log){
		response.locals.log = {};
	}
	
	//common error response
	if(typeof response.locals.error === 'string'){
		Logger.log(response);
		return response.json({status:false, message:response.locals.error});
	}
	
	//if there were exceptions, set labels according to exception type
	if(response.locals.exception){
		//log database and node exceptions
		try{
			//Database Exception
			if(response.locals.exception['sqlMessage']){
				
				response.locals.log.exceptionLabel = 'database';
				response.locals.log.exception = response.locals.exception;
				Logger.log(response);
				
				return response.json({
					status:false,
					message:app.strings['database']['error'],
					debug:{
						message:response.locals.exception['sqlMessage'],
						stack:response.locals.exception['stack'],
					}
				});
			}else{
				//Node Exception
				response.locals.log.exceptionLabel = 'process';
				response.locals.log.exception = response.locals.exception;
				Logger.log(response);
				return response.json({
					status:false,
					message:app.strings['general']['error'],
					debug:{
						message:response.locals.exception['message'],
						stack:response.locals.exception['stack'],
					}
				});
			}
		}catch(ex){
			//log mysterious errors
			response.locals.log.exceptionLabel = 'unknown';
			response.locals.log.exception = ex;
			Logger.log(response);
			return response.json({status:false, message:'unhandled error type', debug:ex});
		}
	}else{
		//locals.error was not a string and locals.exception is also not set
		//should never happen
		Logger.log(response);
		return response.json({
			status:false,
			message:response.locals.error.message || response.locals.error || 'unknown error'
		});
	}
}