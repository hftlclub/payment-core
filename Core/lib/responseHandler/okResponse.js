const Logger = require('../logger');
module.exports = {
	okResponse:okResponse
};

/**
 * all successfull requests will call this function
 * @param response
 */
function okResponse(response){
	
	const resp = {
		status:true
	};
	
	//Success Message
	if(response.locals.message){
		resp.message = response.locals.message;
		response.locals.log['responseMessage'] = resp.message;
	}
	
	//Success Data (credits, id's et.c) -- typof check for numeric zero values
	if(response.locals.data || typeof response.locals.data === 'number'){
		resp.data = response.locals.data;
	}
	
	response.status(200);
	Logger.log(response);
	
	//html responses must be explicitly activated through setting html variable
	if(response.locals.html){
		return response.send(response.locals.data);
	}
	
	return response.json(resp);
}