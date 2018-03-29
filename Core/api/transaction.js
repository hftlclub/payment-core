const validator = require('validator');
const db = require('../lib/db');
const util = require('util');
const {FormBody, IpFilter, Login, Admin, TerminalLimiter, APILimter} = require('../lib/middleware');

module.exports = {
	attach_routes:attach_router,
};

const app = require('../app');

const Card = require('./card');
const Terminal = require('./terminal');
const {okResponse} = require('../lib/responseHandler');

/**
 * attach transaction router (/transcation) to apiRouter (/api)
 * @param apiRouter
 */
function attach_router(apiRouter){
	
	const router = app.getNewRouter();
	
	//Payment
	router.post('/pay', [IpFilter, TerminalLimiter, FormBody, Terminal.restrict], pay);
	router.post('/deposit', [APILimter, FormBody, Login, Admin], deposit);
	router.post('/admin', [APILimter, FormBody, Login, Admin], modify);
	
	//Mark
	router.patch('/:id', [IpFilter, FormBody, Terminal.restrict], mark);
	router.patch('/mark/:id', [APILimter, Login, Admin], mark_set_solved);
	
	//Overviews and Data
	router.get('/', [APILimter, Login, Admin], get_overview);
	router.get('/marked/', [APILimter, Login, Admin], get_marked_overview);
	router.get('/total', [APILimter, Login, Admin], get_total_credits);
	router.get('/:id', [APILimter, Login, Admin], get_by_id);
	
	apiRouter.use('/transaction', router);
}

/**
 * deposit action from customs officer (new transaction with positive value)
 * @param request
 * @param response
 * @param next
 * @returns {Promise<void>}
 */
async function deposit(request, response, next){
	
	response.locals.log = {label:'transaction', type:'deposit', data:{}};
	
	try{
		
		//check if card is valid
		const card = await Card.exists(request.body['cardUID']);
		if(!card.status){
			response.locals.error = card.message;
			return next();
		}
		response.locals.log.data['card'] = request.body['cardUID'];
		
		//check if deposit value is within constraints
		const betrag = validate_credits(request.body['credits']);
		if(!betrag.valid){
			response.locals.error = betrag.message;
			return next();
		}
		response.locals.log.data['credits'] = request.body['credits'];
		
		//deposit always positive
		if(betrag.value <= 0 || betrag.value > validator.toInt(process.env.TRANSAKTION_CREDIT_LIMIT)){
			response.locals.error = util.format(app.strings['transaction']['invalid_credit_amount'],
				betrag.value, 50, validator.toInt(process.env.TRANSAKTION_CREDIT_LIMIT));
			return next();
		}
		
		//deposit
		//language=MySQL
		const query = 'INSERT INTO Transactions (Type, Value, CardREF) VALUES (?,?,?)';
		const values = ['Deposit', betrag.value, card.data['UID']];
		await db.pool.query(query, values);
		
		response.locals.message = util.format(
			app.strings['transaction']['added_credits'],
			betrag.value, card.data['UID']
		);
		return okResponse(response);
		
	}catch(error){
		response.locals.exception = error;
		return next();
	}
}

/**
 * admin action from admin (new transaction without any constraints)
 * @param request
 * @param response
 * @param next
 * @returns {Promise<*>}
 */
async function modify(request, response, next){
	
	response.locals.log = {label:'transaction', type:'admin', data:{}};
	
	try{
		
		//check if card is valid
		const card = await Card.exists(request.body['cardUID']);
		if(!card.status){
			response.locals.error = card.message;
			return next();
		}
		response.locals.log.data['card'] = request.body['cardUID'];
		
		//check if credits are set
		if(!request.body['credits'] || !validator.isInt(request.body['credits'])){
			response.locals.error = util.format(app.strings['transaction']['invalid_credit_param']);
			return next();
		}
		
		response.locals.log.data['credits'] = request.body['credits'];
		
		//language=MySQL
		const query = 'INSERT INTO Transactions (Type, Value, CardREF) VALUES (?,?,?)';
		const values = ['Admin', request.body['credits'], card.data['UID']];
		await db.pool.query(query, values);
		
		response.locals.message = util.format(
			app.strings['transaction']['added_credits'],
			request.body['credits'], card.data['UID']
		);
		return okResponse(response);
		
	}catch(error){
		response.locals.exception = error;
		return next();
	}
}

/**
 * payment action (new transaction with negative value)
 * can/should only be called from a terminal
 * @param request
 * @param response
 * @param next
 * @returns {Promise<void>}
 */
async function pay(request, response, next){
	
	response.locals.log = {label:'transaction', type:'payment', data:{}};
	
	//Bezahlen
	try{
		
		//check if card exists and get credits
		const card = await Card.get_credits(request.body['cardUID']);
		if(!card.status){
			response.locals.error = card.message;
			return next();
		}
		response.locals.log.data['card'] = request.body['cardUID'];
		
		//check if payment value is within constraints
		const credits = validate_credits(request.body['credits']);
		if(!credits.valid){
			response.locals.error = credits.message;
			return next();
		}
		response.locals.log.data['credits'] = request.body['credits'];
		
		//payment value must be negative
		if(credits.value >= 0 || credits.value < -validator.toInt(process.env.TRANSAKTION_CREDIT_LIMIT)){
			response.locals.error = util.format(
				app.strings['transaction']['invalid_credit_amount'],
				credits.value,
				-50,
				-validator.toInt(process.env.TRANSAKTION_CREDIT_LIMIT)
			);
			return next();
		}
		
		const Guthaben = card.data;
		const Betrag = credits.value;
		const neuesGuthaben = Guthaben + Betrag;
		
		//check if user has enough credits for this payment
		if(neuesGuthaben < 0){
			response.locals.error = util.format(
				app.strings['transaction']['not_enough_credits'],
				-neuesGuthaben
			);
			return next();
		}
		
		//do payment
		//language=MySQL
		const query = 'INSERT INTO Transactions (Type, Value, CardREF, TerminalREF) VALUES (?,?,?,?)';
		const values = ['Payment', credits.value, request.body['cardUID'], response.locals.terminalID];
		await db.pool.query(query, values);
		
		response.locals.data = neuesGuthaben;
		response.locals.message = util.format(
			app.strings['transaction']['payment'],
			-credits.value,
			request.body['cardUID'],
			response.locals.terminalID,
			neuesGuthaben
		);
		return okResponse(response);
		
	}catch(error){
		response.locals.exception = error;
		return next();
	}
}

/**
 * marks an transaction
 * @param request
 * @param response
 * @param next
 * @returns {Promise<void>}
 */
async function mark(request, response, next){
	
	response.locals.log = {label:'transaction', type:'mark', data:{}};
	
	try{
		//check if transaction exists
		const transaction = await exist(request.params.id);
		if(!transaction.status){
			response.status(404);
			response.locals.error = transaction.message;
			return next();
		}
		
		//language=MySQL
		const query = `INSERT INTO TransactionMarks (TREF) VALUES (?)
        ON DUPLICATE KEY UPDATE Solved = FALSE`;
		
		await db.pool.query(query, [request.params.id]);
		
		response.locals.message = util.format(
			app.strings['transaction']['mark_transaction'],
			request.params.id,
			response.locals.terminalID //from middleware
		);
		
		return okResponse(response);
		
	}catch(error){
		response.locals.exception = error;
		return next();
	}
}

/**
 * set an transaction-mark to solved (~ remove mark)
 * @param request
 * @param response
 * @param next
 * @returns {Promise<void>}
 */
async function mark_set_solved(request, response, next){
	
	response.locals.log = {label:'transaction', type:'mark_solve', data:{}};
	
	try{
		
		//param check..
		if(!request.params.id || !validator.isInt(request.params.id)){
			response.locals.error = app.strings['transaction']['invalid_id_param'];
			return next();
		}
		
		//check if mark exists
		//language=MySQL
		const markQuery = 'SELECT * FROM TransactionMarks WHERE ID=?';
		const [markData] = await db.pool.query(markQuery, [request.params.id]);
		
		if(markData.length !== 1){
			response.status(404);
			response.locals.error = util.format(
				app.strings['transaction']['transactionMark_does_not_exist'],
				request.params.id
			);
			return next();
		}
		
		//update mark to solved
		//language=MySQL
		const query = 'UPDATE TransactionMarks SET Solved=TRUE WHERE ID=?';
		await db.pool.query(query, [request.params.id]);
		
		response.locals.message = util.format(
			app.strings['transaction']['mark_updated_to_solved'],
			request.params.id,
			markData[0]['TREF']
		);
		return okResponse(response);
		
	}catch(error){
		response.locals.exception = error;
		return next();
	}
}

/**
 * get all transactions
 * todo: add a limiter
 * @param request
 * @param response
 * @param next
 */
async function get_overview(request, response, next){
	
	response.locals.log = {label:'transaction', type:'overview'};
	
	try{
		//language=MySQL
		const query = 'SELECT * FROM Transactions ORDER BY ID DESC';
		const [data] = await db.pool.query(query);
		response.locals.data = data;
		return okResponse(response);
	}catch(error){
		response.locals.exception = error;
		return next();
	}
}

/**
 * returns all marked transactions which are NOT solved
 * todo: add a limiter
 * @param request
 * @param response
 * @param next
 * @returns {Promise<void>}
 */
async function get_marked_overview(request, response, next){
	
	response.locals.log = {label:'transaction', type:"marked_overview"};
	
	try{
		//language=MySQL
		const query = `SELECT
                         TransactionMarks.ID      AS M_ID,
                         TransactionMarks.Date    AS M_Date,
                         TransactionMarks.TREF    AS M_TREF,
                         TransactionMarks.Solved  AS M_SOLVED,
                         Transactions.CardREF     AS T_CardREF,
                         Transactions.Value       AS T_Value,
                         Transactions.TerminalREF AS T_TerminalRef,
                         Transactions.Type        AS T_Type,
                         Transactions.Date        AS T_Date
                       FROM TransactionMarks
                         INNER JOIN Transactions ON Transactions.ID = TransactionMarks.TREF
                       WHERE Solved = FALSE
                       ORDER BY TransactionMarks.ID DESC`;
		const [data] = await db.pool.query(query);
		response.locals.data = data;
		return okResponse(response);
	}catch(error){
		response.locals.exception = error;
		return next();
	}
}

/**
 * validates credit value
 * @param creditVal Integer
 * @returns {Object}
 */
function validate_credits(creditVal){
	if(!creditVal){
		return {valid:false, message:app.strings['transaction']['invalid_credit_param']};
	}
	
	if(!validator.isInt(creditVal)){
		return {valid:false, message:util.format(app.strings['transaction']['credit_type_error'], creditVal)};
	}
	
	creditVal = validator.toInt(creditVal);
	
	if(creditVal % 50 !== 0){
		return {
			valid:false,
			message:util.format(app.strings['transaction']['credit_amount_not_divisible'], creditVal, 50)
		};
	}
	
	return {valid:true, value:creditVal};
}

/**
 * checks if transaction exists
 * returns transaction data with transaction exists
 * @param ID
 * @returns {status,message,data}
 */
async function exist(ID){
	
	if(!ID || !validator.isInt(ID)){
		return {status:false, message:app.strings['transaction']['invalid_id_param']};
	}
	
	try{
		//language=MySQL
		const query = 'SELECT * FROM Transactions WHERE ID=?';
		const [data] = await db.pool.query(query, ID);
		
		if(data.length === 1){
			return {status:true, data:data[0]};
		}else{
			return {
				status:false,
				message:util.format(
					app.strings['transaction']['transaction_does_not_exist'],
					ID
				)
			};
		}
		
	}catch(error){
		return {status:false, message:error};
	}
}

/**
 * returns total sum of all transaction values
 * @param request
 * @param response
 * @param next
 * @returns {Promise<void>}
 */
async function get_total_credits(request, response, next){
	
	response.locals.log = {label:'transaction', type:"totalcredits"};
	
	try{
		//language=MySQL
		const query = 'SELECT SUM(VALUE) AS "Credits" FROM Transactions';
		const [data] = await db.pool.query(query);
		
		response.locals.data = data[0]['Credits'] || 0;
		return okResponse(response);
		
	}catch(error){
		response.locals.exception = error;
		return next();
	}
}

/**
 * get details for a transaction
 * @param request
 * @param response
 * @param next
 * @returns {Promise<void>}
 */
async function get_by_id(request, response, next){
	response.locals.log = {label:'transaction', type:'details'};
	
	try{
		const transaction = await exist(request.params.id);
		
		if(!transaction.status){
			response.status(404);
			response.locals.error = transaction.message;
			return next();
		}
		
		response.locals.data = transaction.data;
		return okResponse(response);
		
	}catch(error){
		response.locals.exception = error;
		return next();
	}
}