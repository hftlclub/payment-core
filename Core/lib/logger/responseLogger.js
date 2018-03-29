const winston = require('winston');
require('winston-daily-rotate-file');
const {combine, timestamp, printf} = winston.format;
const app = require('../../app');

const transport = require('./transports');

/**
 * adds timestamp, level, label and type to log
 * @param info is the winston custom format parameter
 * @returns {string}
 */
function parseCommons(info){
	
	//timestamp
	let str = `${info.timestamp} - `;
	
	//error|info|...
	str += `[${info.level}] - `;
	
	//transaction|card|user...
	str += `[${info.locals.log.label}] - `;
	
	//payment|deposit|add|update...
	if(info.locals.log.type){
		str += `[${info.locals.log.type}] - `;
	}
	
	return str;
}

/**
 * add client response message from ./Core/lib/responseHandler/okReponse.js
 * @param locals
 * @returns {string}
 */
function parseResponseMessage(locals){
	let str = '';
	
	if(locals.log && locals.log.responseMessage){
		str += ' - ';
		str += locals.log.responseMessage;
	}
	
	return str;
}

/**
 * add error message from ./Core/lib/responseHandler/errorResponse.js
 * @param locals
 * @returns {string}
 */
function parseErrorMessage(locals){
	let str = '';
	if(locals.error){
		str += ' - ';
		if(typeof locals.error === 'string'){
			str += locals.error;
		}else{
			try{
				str += locals.error.message
			}catch(exception){
				str += exception.message
			}
		}
	}
	return str;
}

/**
 * add specific values of interest (used card uid, transmitted credit value etc.)
 * @param locals
 * @returns {string}
 */
function parseLogData(locals){
	let str = '';
	if(locals.log.data && Object.keys(locals.log.data).length){
		str += ' - ';
		if(typeof locals.log.data === 'string'){
			str += locals.log.data;
		}else{
			//attach terminalID to log.data if present
			if(locals.terminalID){
				locals.log.data.terminal = locals.terminalID;
			}
			try{
				str += JSON.stringify(locals.log.data);
			}catch(exception){
				str += exception.message
			}
		}
	}
	return str;
}

/**
 * format for parsing module responses | error logs
 * winstonInfo = response object + winston extras
 */
const responseMessageFormat = printf((info) =>{
	let str = parseCommons(info);
	str += app.getIPstring(info.req);
	str += parseErrorMessage(info.locals);
	str += parseLogData(info.locals);
	str += parseResponseMessage(info.locals);
	return str;
});

/**
 * emails have different log format
 */
const emailFormat = printf((info) =>{
	let str = parseCommons(info);
	str += app.getIPstring(info.req);
	str += parseErrorMessage(info.locals);
	str += parseLogData(info.locals);
	
	return str;
});

//-------------------------------------------------------------------------------------

/**
 * Logger for transaction events
 * @type {*|DerivedLogger}
 */
const transaction_logger = winston.createLogger({
	format:combine(
		timestamp(),
		responseMessageFormat
	),
	transports:[
		transport.transaction,
		transport.error,
		transport.total
	]
});

/**
 * Logger for terminal events
 * @type {*|DerivedLogger}
 */
const terminal_logger = winston.createLogger({
	format:combine(
		timestamp(),
		responseMessageFormat
	),
	transports:[
		transport.terminal,
		transport.error,
		transport.total
	]
});

/**
 * Logger for user events
 * @type {*|DerivedLogger}
 */
const user_logger = winston.createLogger({
	format:combine(
		timestamp(),
		responseMessageFormat
	),
	transports:[
		transport.user,
		transport.error,
		transport.total
	]
});

/**
 * Logger for card events
 * @type {*|DerivedLogger}
 */
const card_logger = winston.createLogger({
	format:combine(
		timestamp(),
		responseMessageFormat
	),
	transports:[
		transport.card,
		transport.error,
		transport.total
	]
});

/**
 * Logger for email events
 * @type {*|DerivedLogger}
 */
const email_logger = winston.createLogger({
	format:combine(
		timestamp(),
		emailFormat
	),
	transports:[
		transport.email,
		transport.error,
		transport.total
	]
});

module.exports = {
	terminal_logger:terminal_logger,
	transaction_logger:transaction_logger,
	user_logger:user_logger,
	card_logger:card_logger,
	email_logger:email_logger
};