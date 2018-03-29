const winston = require('winston');
const {combine, timestamp, printf} = winston.format;
const app = require('../../app');

const transport = require('./transports');

/**
 * format for exceptions...
 * winstonInfo = response object
 * todo refactor and merge with responseLoger
 */
const exceptionErrorFormat = printf((winstonInfo) =>{
	
	
	//shortcut to locals
	const info = winstonInfo.locals;
	
	//timestamp
	let str = `${winstonInfo.timestamp} - `;
	
	//if critical, stringify error and end further processing
	if(winstonInfo.criticalData){
		str += `[critical] - `;
		try{
			str += JSON.stringify(winstonInfo.criticalData);
		}catch(error){
			str += error.message;
		}
		return str;
	}
	
	//error|info
	str += '[exception] - ';
	
	//if label from module was not set, only use exception label
	if(!info.log.label){
		str += `[${info.log.exceptionLabel}] - `;
	}else{
		if(info.log.exceptionLabel){
			str += `[${info.log.exceptionLabel}] - [${info.log.label}] - `;
		}else{
			str += `[${info.log.label}] - `;
		}
	}
	
	//payment|deposit|...
	if(info.log.type){
		str += `[${info.log.type}] - `;
	}
	
	//add route information
	str += app.getIPstring(winstonInfo.req);
	
	//specific values of interest (used card uid, transmitted credit value etc.)
	if(info.log.data){
		if(typeof info.log.data === 'string'){
			str += ' - ';
			str += info.log.data;
		}else{
			if(Object.keys(info.log.data).length){
				str += ' - ';
				//attach terminalID to log.data
				if(info.terminalID){
					info.log.data.terminal = info.terminalID;
				}
				
				//attach data properties
				try{
					str += JSON.stringify(info.log.data);
				}catch(exception){
					str += exception.message
				}
			}
		}
	}
	
	//error, status=false
	if(info.log && info.log.exception){
		if(typeof info.log.exception === 'string'){
			str += ' - ';
			str += info.log.exception;
		}else{
			try{
				//str += JSON.stringify(info.log.exception.message);
				str += ' - ';
				if(info.log.exception['sqlMessage']){
					str += info.log.exception['sqlMessage'];
				}else{
					str += info.log.exception['message'];
				}
				//str += JSON.stringify(info.log.exception.stack)
			}catch(exception){
				str += exception.message
			}
		}
	}
	
	return str;
});

/**
 * for Database and Node exceptions & other process errors
 * @type {*|DerivedLogger}
 */
const exception_logger = winston.createLogger({
	format:combine(
		timestamp(),
		exceptionErrorFormat
	),
	transports:[
		transport.exception,
		transport.error,
		transport.total,
		new winston.transports.Console()
	]
});

module.exports = {
	exception_logger:exception_logger
};