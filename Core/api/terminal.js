const util = require('util');
const validator = require('validator');

const app = require('../app');
const db = require('../lib/db');
const {FormBody, Login, Admin, APILimter} = require('../lib/middleware');

module.exports = {
	attach_routes:attach_router,
	exists:exists,
	restrict:TerminalOnly
};

const {errorResponse, okResponse} = require('../lib/responseHandler');

/**
 * attach terminal router (/terminal) to apiRouter (/api)
 * @param apiRouter
 */
function attach_router(apiRouter){
	
	const router = app.getNewRouter();
	
	router.get('/', [APILimter, FormBody, Login, Admin], get_overview);
	router.get('/:token', [APILimter, FormBody, Login, Admin], get_by_token);
	router.post('/', [APILimter, FormBody, Login, Admin], add_terminal);
	router.patch('/:id', [APILimter, FormBody, Login, Admin], update_terminal);
	apiRouter.use('/terminal', router);
}

/**
 * adds a new terminal to the database
 * @param request expects following x-www-form-urlencoded data: uid
 * @param response json: { status:Boolean, message:String }
 * @param next
 */
async function add_terminal(request, response, next){
	
	response.locals.log = {label:'terminal', type:'add', data:{}};
	
	if(!request.body.token){
		response.locals.error = app.strings['terminal']['invalid_token'];
		return next();
	}
	response.locals.log.data['token'] = request.body.token;
	
	if(!request.body.name){
		response.locals.error = app.strings['terminal']['invalid_name'];
		return next();
	}
	response.locals.log.data['name'] = request.body.name;
	
	try{
		//check if token is already in DB
		const term = await exists(request.body.token);
		
		if(term.status){
			response.locals.error = util.format(
				app.strings['terminal']['terminal_already_exists'],
				request.body.token
			);
			return next();
		}
		
		//add new Terminal
		//language=MySQL
		const query = 'INSERT INTO Terminals (Name,Token) VALUES (?,?)';
		await db.pool.query(query, [request.body.name, request.body.token]);
		
		response.locals.message = util.format(
			app.strings['terminal']['added_new_terminal'],
			request.body.name,
			request.body.token
		);
		
		return okResponse(response);
		
	}catch(error){
		response.locals.error = error;
		return next();
	}
}

/**
 * returns all terminals
 * @param request
 * @param response
 * @param next
 */
async function get_overview(request, response, next){
	
	response.locals.log = {label:'terminal', type:'overview'};
	
	try{
		//language=MySQL
		const query = 'SELECT * FROM Terminals';
		const [data] = await db.pool.query(query);
		response.locals.data = data;
		return okResponse(response);
	}catch(error){
		response.locals.error = error;
		return next();
	}
}

/**
 * get details for a specific terminal token
 * @param request
 * @param response
 * @param next
 */
async function get_by_token(request, response, next){
	
	response.locals.log = {label:'terminal', type:"details"};
	
	try{
		//check if terminal exists
		const terminal = await exists(request.params.token);
		if(!terminal.status){
			response.status(404);
			response.locals.error = terminal.message;
			return next();
		}
		response.locals.data = terminal.data;
		return okResponse(response);
		
	}catch(error){
		response.locals.error = error;
		return next();
	}
}

/**
 * updates terminal (by id)
 * @param request
 * @param response
 * @param next
 */
async function update_terminal(request, response, next){
	
	response.locals.log = {label:'terminal', type:'update', data:{}};
	
	//no update params transmitted
	if(!request.body.enabled && !request.body.name && !request.body.token){
		response.locals.error = util.format(
			app.strings['terminal']['missing_update_params'], ('name | enabled | token')
		);
		return next();
	}
	
	try{
		//check if terminal exists
		const terminal = await exists(request.params.id);
		if(!terminal.status){
			response.status(404);
			response.locals.error = terminal.message;
			return next();
		}
		
		let query = 'UPDATE Terminals SET ';
		let queryBuilder = [];
		let params = [];
		
		//optional token
		if(request.body.token){
			response.locals.log.data['Token'] = request.body.token;
			queryBuilder.push('Token=?');
			params.push(request.body.token);
		}
		
		//optional enabled
		if(request.body.enabled){
			response.locals.log.data['Enabled'] = request.body.enabled;
			queryBuilder.push('Enabled=?');
			params.push(validator.toBoolean(request.body.enabled));
		}
		
		//optional name
		if(request.body.name){
			response.locals.log.data['Name'] = request.body.name;
			queryBuilder.push('Name=?');
			params.push(request.body.name);
		}
		
		query += queryBuilder.join(',');
		query += ' WHERE ID=?';
		params.push(terminal.data['ID']);
		
		//updaten
		await db.pool.query(query, params);
		
		response.locals.message = util.format(
			app.strings['terminal']['updated_terminal'],
			terminal.data['ID']
		);
		
		return okResponse(response);
		
	}catch(error){
		response.locals.exception = error;
		return next();
	}
	
}

/**
 * checks if given terminal exists,
 * @param queryIdentiier {int|string} can be terminal.id oder terminal.token
 * @returns {Promise<*>} {status,message,data}
 */
async function exists(queryIdentiier){
	
	if(!queryIdentiier){
		return {status:false, message:app.strings['terminal']['invalid_token']};
	}
	
	try{
		let where = 'WHERE Token=?';
		if(validator.isInt(queryIdentiier)){
			queryIdentiier = parseInt(queryIdentiier);
			where = 'WHERE id=?'
		}
		
		//language=MySQL
		const query = `SELECT * FROM Terminals ${where}`;
		const [data] = await db.pool.query(query, queryIdentiier);
		
		if(data.length === 1){
			return {status:true, data:data[0]};
		}else{
			return {
				status:false,
				message:util.format(
					app.strings['terminal']['terminal_does_not_exist'],
					queryIdentiier
				)
			};
		}
		
	}catch(error){
		return {status:false, message:error};
	}
}

/**
 * terminal middleware, checks if "terminal" header is present and valid
 * will stop and terminate the rest of the route-handling if an invalid terminal token was transmitted
 * @param request
 * @param response
 * @param next
 */
async function TerminalOnly(request, response, next){
	
	//check for header
	if(!request.headers['terminal']){
		response.locals.log = response.locals.log || {label:'terminal'};
		response.locals.error = app.strings['terminal']['header_missing'];
		return errorResponse(response);
	}
	
	//check DB
	try{
		response.locals.log = response.locals.log || {label:'terminal'};
		const terminal = await exists(request.headers['terminal']);
		
		if(terminal.status){
			response.locals.terminalID = terminal.data['ID'];
			response.locals.terminalToken = request.headers['terminal'];
			next();
		}else{
			response.locals.error = terminal.message;
			return errorResponse(response);
		}
	}catch(error){
		response.locals.exception = error;
		return errorResponse(response);
	}
}