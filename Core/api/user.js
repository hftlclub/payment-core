const app = require('../app');
const validator = require('validator');
const db = require('../lib/db');
const util = require('util');
const {FormBody, Login, Admin, APILimter} = require('../lib/middleware');

module.exports = {
	attach_routes:attach_router,
	exists:exists
};

const {okResponse} = require('../lib/responseHandler');

/**
 * attach user router (/user) to apiRouter (/api)
 * @param apiRouter
 */
function attach_router(apiRouter){
	
	const router = app.getNewRouter();
	
	router.get('/', [APILimter, FormBody, Login, Admin], get_overview);
	router.get('/:username', [APILimter, FormBody, Login, Admin], get_by_name);
	router.post('/', [APILimter, FormBody, Login, Admin], add_user);
	router.patch('/:username', [APILimter, FormBody, Login, Admin], update_user);
	apiRouter.use('/user', router);
}

/**
 * returns all users
 * todo: limit
 * @param request
 * @param response
 * @param next
 * @returns {Promise<*>}
 */
async function get_overview(request, response, next){
	
	response.locals.log = {label:'user', type:'overview'};
	
	try{
		//language=MySQL
		const query = 'SELECT Username, EMail, Admin FROM Users';
		const [data] = await db.pool.query(query);
		
		response.locals.data = data;
		return okResponse(response);
		
	}catch(error){
		response.locals.exception = error;
		return next();
	}
}

/**
 * adds a new user to the database
 * @param request
 * @param response
 * @param next
 * @returns {Promise<*>}
 */
async function add_user(request, response, next){
	
	response.locals.log = {label:'user', type:'add', data:{}};
	
	const userdata = validate_user_data(request.body);
	
	if(!userdata.valid){
		response.locals.error = userdata.error;
		return next();
	}
	
	try{
		
		const user = await exists(userdata.username);
		if(user.data){
			response.locals.error = util.format(app.strings['user']['user_already_exists'], userdata.username);
			return next();
		}
		
		//language=MySQL
		const query = 'INSERT INTO Users (Username, Password, EMail, Admin) VALUES (?, ?, ?, ?)';
		const values = [userdata.username, userdata.password, userdata.email, userdata.admin];
		await db.pool.query(query, values);
		response.locals.message = util.format(
			app.strings['user']['added_new_user'],
			userdata.username,
			userdata.email
		);
		return okResponse(response);
	}catch(error){
		response.locals.exception = error;
		return next();
	}
	
}

/**
 * get user details for a specific name
 * @param request
 * @param response
 * @param next
 * @returns {Promise<*>}
 */
async function get_by_name(request, response, next){
	
	response.locals.log = {label:'user', type:'details', data:{}};
	
	try{
		const user = await exists(request.params.username);
		if(!user.status){
			response.status(404);
			response.locals.error = user.message;
			return next();
		}
		
		response.locals.data = user.data;
		return okResponse(response);
		
	}catch(error){
		response.locals.exception = error;
		return next();
	}
}

/**
 * Validtes User-Data which was sent from a HTML-Form
 * todo needs change according to hftl user-structure
 * @param data
 */
function validate_user_data(data){
	
	const user = {
		valid:true,
		username:"",
		password:"12345678", //disabled for testing
		email:"",
		admin:false,
		error:[]
	};
	
	//username
	if(data.username && validator.isLength(data.username, {min:2, max:255})){
		user.username = validator.stripLow(data.username);
		user.username = validator.escape(user.username);
		user.username = validator.trim(user.username);
	}else{
		user.valid = false;
		user.error.push({username:"Unsername length is not within allowed range (2-255)"});
	}
	
	//email
	if(data.email && validator.isLength(data.email, {min:6, max:100}) && validator.isEmail(data.email)){
		user.email = validator.stripLow(data.email);
		user.email = validator.escape(user.email);
		user.email = validator.trim(user.email);
	}else{
		user.valid = false;
		user.error.push({email:"Email is not valid / not withing allowed range (6-100)"});
	}
	
	//password
	/*if(data.password && validator.isLength(data.password,{min:8,max:255})){
	 user.password = data.password;
	 }else{
	 user.valid = false;
	 user.error.push({password:"Password length is not within allowed range (8-255)"});
	 }*/
	
	if(validator.isBoolean(data.admin)){
		user.admin = validator.toBoolean(data.admin);
	}else{
		user.valid = false;
		user.error.push({admin:"Admin value is an invalid boolean"});
	}
	
	return user;
}

/**
 * checks if given user exists
 * will return userdata if user exists
 * @param username
 * @returns {Promise<*>} {status,message,data}
 */
async function exists(username){
	
	if(!username){
		return {status:false, message:app.strings['user']['invalid_username']};
	}
	
	try{
		//language=MySQL
		const query = 'SELECT * FROM Users WHERE Username=?';
		const [data] = await db.pool.query(query, username);
		
		if(data.length === 1){
			return {status:true, data:data[0]};
		}else{
			return {
				status:false,
				message:util.format(
					app.strings['user']['user_does_not_exist'],
					username
				)
			};
		}
		
	}catch(error){
		return {status:false, message:error};
	}
}

/**
 * updates user by username
 * @param request
 * @param response
 * @param next
 */
async function update_user(request, response, next){
	
	response.locals.log = {label:'user', type:'update', data:{}};
	
	//no update params transmitted
	if(!request.body.email && !request.body.admin){
		response.locals.error = util.format(
			app.strings['user']['missing_update_params'], ('email | admin')
		);
		return next();
	}
	
	try{
		//check if user exists
		const user = await exists(request.params.username);
		if(!user.status){
			response.status(404);
			response.locals.error = user.message;
			return next();
		}
		
		let query = 'UPDATE Users SET ';
		let queryBuilder = [];
		let params = [];
		
		//optional admin
		if(request.body.admin){
			response.locals.log.data['Admin'] = request.body.admin;
			queryBuilder.push('Admin=?');
			params.push(validator.toBoolean(request.body.admin));
		}
		
		//optional email
		if(request.body.email){
			response.locals.log.data['EMail'] = request.body.email;
			queryBuilder.push('EMail=?');
			params.push(request.body.email);
		}
		
		query += queryBuilder.join(',');
		query += ' WHERE Username=?';
		params.push(user.data['Username']);
		
		//updaten
		await db.pool.query(query, params);
		
		response.locals.message = util.format(
			app.strings['user']['updated_user'],
			user.data['Username']
		);
		
		return okResponse(response);
		
	}catch(error){
		response.locals.exception = error;
		return next();
	}
	
}
