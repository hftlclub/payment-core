const app = require('../app');
const util = require('util');
const validator = require('validator');
const db = require('../lib/db');
const {FormBody, IpFilter, Login, Admin, TerminalLimiter, APILimter} = require('../lib/middleware');

module.exports = {
	attach_routes:attach_router,
	exists:exists,
	get_credits:get_credits
};

const User = require('./user');
const Terminal = require('./terminal');
const {okResponse} = require('../lib/responseHandler');

/**
 * attach card router (/card) to apiRouter (/api)
 * @returns {*}
 */
function attach_router(apiRouter){
	
	const router = app.getNewRouter();
	
	
	
	router.get('/:uid', [IpFilter, TerminalLimiter, Terminal.restrict], get_credits_for_card);
	
	
	
	router.post('/', [APILimter, FormBody, Login, Admin], add_card);
	
	
	
	
	//Terminal
	router.get('/:uid', [IpFilter, TerminalLimiter, Terminal.restrict], get_credits_for_card);
	
	
	
	router.get('/:uid/transactions', [IpFilter, TerminalLimiter, Terminal.restrict], get_transactions_for_card);
	
	//API
	router.get('/', [APILimter, Login, Admin], get_overview);
	router.post('/', [APILimter, FormBody, Login, Admin], add_card);
	router.patch('/:uid', [APILimter, FormBody, Login, Admin], update_card);
	
	apiRouter.use('/card', router);
}

/**
 * adds a new card to the database
 * @param request expects following x-www-form-urlencoded data: uid
 * @param response json: { status:Boolean, message:String }
 * @param next
 */
async function add_card(request, response, next){
	
	response.locals.log = {label:'card', type:'add'};
	
	//check param
	if(!request.body.uid){
		response.locals.error = app.strings['card']['invalid_uid_param'];
		return next();
	}
	
	try{
		
		//check for duplicate key
		const card = await exists(request.body.uid);
		if(card.status){
			response.locals.error = util.format(
				app.strings['card']['card_already_exists'],
				request.body.uid
			);
			return next();
		}
		response.locals.log.data = {uid:request.body.uid};
		
		//language=MySQL
		const query = 'INSERT INTO Cards (UID) VALUES (?)';
		await db.pool.query(query, [request.body.uid]);
		
		response.locals.message = util.format(
			app.strings['card']['added_new_card'],
			request.body.uid
		);
		
		return okResponse(response);
	}catch(error){
		response.locals.exception = error;
		return next();
	}
}

/**
 * returns all cards
 * todo limit
 * @param request
 * @param response
 * @param next
 */
async function get_overview(request, response, next){
	
	response.locals.log = {label:'card', type:'overview'};
	
	try{
		//language=MySQL
		const query = 'SELECT * FROM Cards ORDER BY UID DESC';
		const [data] = await db.pool.query(query);
		
		response.locals.data = data;
		return okResponse(response);
		
	}catch(error){
		response.locals.exception = error;
		return next();
	}
}

/**
 * returns credits for given card.uid
 * @param request
 * @param response
 * @param next
 */
async function get_credits_for_card(request, response, next){
	
	response.locals.log = {label:'card', type:'balance'};
	
	try{
		const credits = await get_credits(request.params.uid);
		if(!credits.status){
			if(credits.code){
				response.status(404);
			}
			response.locals.error = credits.message;
			return next();
		}
		
		response.locals.data = credits.data;
		return okResponse(response);
		
	}catch(error){
		response.locals.exception = error;
		return next();
	}
}

/**
 * internal function to get credits for a card.uid
 * @param UID
 * @returns {Promise<*>} {status, message, data}
 */
async function get_credits(UID){
	
	try{
		const card = await isValid(UID);
		if(!card.status){
			return card;
		}
		
		//language=MySQL
		const query = 'SELECT SUM(`Value`) AS `Credits` FROM Transactions WHERE CardREF=?';
		const [data] = await db.pool.query(query, [card.uid]);
		return {status:true, data:data[0]['Credits'] || 0};
	}catch(error){
		return {status:false, message:error}
	}
}

/**
 * updates a card
 * @param request
 * @param response
 * @param next
 */
async function update_card(request, response, next){
	
	response.locals.log = {label:'card', type:'update', data:{}};
	
	//userref=optional
	if(request.body.userref){
		const user = await User.exists(request.body.userref);
		if(!user.status){
			response.locals.error = user.message;
			return next();
		}
	}
	
	//both update params are optional, 0 params = abort
	if(!request.body.enabled && !request.body.userref){
		response.locals.error = util.format(app.strings['card']['missing_update_params'], ('userref | enabled'));
		return next();
	}
	
	try{
		
		const card = await exists(request.params.uid);
		
		if(!card.status){
			response.status(404);
			response.locals.error = card.message;
			return next();
		}
		
		let query = 'UPDATE Cards SET ';
		let queryBuilder = [];
		let params = [];
		
		//optional
		if(request.body.enabled){
			response.locals.log.data['Enabled'] = request.body.enabled;
			queryBuilder.push('Enabled=?');
			params.push(validator.toBoolean(request.body.enabled));
		}
		
		//optional
		if(request.body.userref){
			response.locals.log.data['UserREF'] = request.body.userref;
			queryBuilder.push('UserREF=?');
			params.push(request.body.userref);
		}
		
		query += queryBuilder.join(',');
		query += ' WHERE UID=?';
		params.push(request.params.uid);
		
		//updaten
		await db.pool.query(query, params);
		
		response.locals.message = util.format(
			app.strings['card']['updated_card'],
			request.params.uid
		);
		return okResponse(response);
		
	}catch(error){
		response.locals.exception = error;
		return next();
	}
}

/**
 * returns all transactions for a card
 * todo limit
 * @param request
 * @param response
 * @param next
 * @returns {Promise<void>}
 */
async function get_transactions_for_card(request, response, next){
	
	response.locals.log = {label:'card', type:'transactions'};
	
	try{
		
		const card = await isValid(request.params.uid);
		if(!card.status){
			if(card.code === 404){
				response.status(404);
			}
			response.locals.error = card.message;
			return next();
		}
		
		//language=MySQL
		const query = 'SELECT * FROM Transactions WHERE CardREF=? ORDER BY ID DESC';
		const [data] = await db.pool.query(query, [card.uid]);
		
		response.locals.data = data;
		return okResponse(response);
		
	}catch(error){
		response.locals.exception = error;
		return next();
	}
}

/**
 * checks if given card exists in database
 * returns card data if card exists
 * @param UID
 * @returns {Promise<*>} {status, message, data}
 */
async function exists(UID){
	
	if(!UID){
		return {status:false, message:app.strings['card']['invalid_uid_param']};
	}
	
	try{
		//language=MySQL
		const query = 'SELECT * FROM Cards WHERE UID=?';
		const [data] = await db.pool.query(query, UID);
		
		if(data.length === 1){
			return {status:true, data:data[0]};
		}else{
			return {
				status:false,
				message:util.format(app.strings['card']['card_does_not_exist'], UID),
				code:404
			};
		}
		
	}catch(error){
		return {status:false, message:error};
	}
}

/**
 * Checks if Card is Exists, is Enabled and has an assigned User
 * @param UID
 * @returns {status,message|{uid,nutzerid}}
 */
async function isValid(UID){
	
	const card = await exists(UID);
	
	if(!card.status){
		return card;
	}
	
	if(!card.data['UserREF']){
		return {
			status:false,
			message:util.format(
				app.strings['card']['card_has_no_user'],
				card.data['UID'])
		};
	}
	
	if(!card.data['Enabled']){
		return {
			status:false,
			message:util.format(
				app.strings['card']['card_is_not_activated'],
				card.data['UID']),
		};
	}
	
	return {status:true, uid:UID, userref:card.data['userref']};
}