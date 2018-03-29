const winston = require('winston');
require('winston-daily-rotate-file');

const datePattern = 'YYYY-MM-DD';

const transport_TOTAL = new (winston.transports.DailyRotateFile)({
	/*Filename to be used to log to. This filename can include the %DATE% placeholder which will include the formatted datePattern at that point in the filename. (default: 'winston.log.%DATE%)*/
	filename:'./logs/total-%DATE%.log',
	
	/* A string representing the moment.js date format to be used for rotating. The meta characters used in this string will dictate the frequency of the file rotation. For example, if your datePattern is simply 'HH' you will end up with 24 log files that are picked up and appended to every day. (default 'YYYY-MM-DD')*/
	datePattern:datePattern,
	
	/* boolean to define whether or not to gzip archived log files. (default 'false')*/
	zippedArchive:true,
	
	/*Write directly to a custom stream and bypass the rotation capabilities. (default: null)*/
	stream:null,
	
	/*Maximum size of the file after which it will rotate. This can be a number of bytes, or units of kb, mb, and gb. If using the units, add 'k', 'm', or 'g' as the suffix. The units need to  directly follow the number. (default: null) */
	maxSize:'20m',
	
	/* Maximum number of logs to keep. If not set, no logs will be removed. This can be a number of files or number of days. If using days, add 'd' as the suffix. (default: null)*/
	maxFiles:'14d',
});

const transport_ERROR = new (winston.transports.DailyRotateFile)({
	filename:'./logs/error-%DATE%.log',
	datePattern:datePattern,
	zippedArchive:true,
	stream:null,
	maxSize:'20m',
	maxFiles:'14d',
	level:'error'
});

const transport_TRANSACTION = new (winston.transports.DailyRotateFile)({
	filename:'./logs/transaction-%DATE%.log',
	datePattern:datePattern,
	zippedArchive:true,
	stream:null,
	maxSize:'20m',
	maxFiles:'14d',
	level:'info'
});

const transport_TERMINAL = new (winston.transports.DailyRotateFile)({
	filename:'./logs/terminal-%DATE%.log',
	datePattern:datePattern,
	zippedArchive:true,
	stream:null,
	maxSize:'20m',
	maxFiles:'14d',
	level:'info'
});

const transport_USER = new (winston.transports.DailyRotateFile)({
	filename:'./logs/user-%DATE%.log',
	datePattern:datePattern,
	zippedArchive:true,
	stream:null,
	maxSize:'20m',
	maxFiles:'14d',
	level:'info'
});

const transport_CARD = new (winston.transports.DailyRotateFile)({
	filename:'./logs/card-%DATE%.log',
	datePattern:datePattern,
	zippedArchive:true,
	stream:null,
	maxSize:'20m',
	maxFiles:'14d',
	level:'info'
});

const transport_EXCEPTION = new (winston.transports.DailyRotateFile)({
	filename:'./logs/exception-%DATE%.log',
	datePattern:datePattern,
	zippedArchive:true,
	stream:null,
	maxSize:'20m',
	maxFiles:'14d',
	level:'error'
});

const transport_EMAIL = new (winston.transports.DailyRotateFile)({
	filename:'./logs/email-%DATE%.log',
	datePattern:datePattern,
	zippedArchive:true,
	stream:null,
	maxSize:'20m',
	maxFiles:'14d',
	level:'info'
});

module.exports = {
	error:transport_ERROR,
	total:transport_TOTAL,
	transaction:transport_TRANSACTION,
	terminal:transport_TERMINAL,
	user:transport_USER,
	card:transport_CARD,
	exception:transport_EXCEPTION,
	email:transport_EMAIL
};