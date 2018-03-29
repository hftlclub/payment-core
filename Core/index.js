//Core, Lib & Helpers
const fs = require('fs');
const path = require('path');
const db = require('./lib/db');
const app = require('./app');

module.exports = {
	start
};

/**
 * start setup in order
 * @returns {Promise<void>}
 */
async function start(){
	await validateStructure();
	await createDirs();
	await setup_strings();
	await setup_env();
	await setup_db();
	await setup_routes();
	await start_api_server();
}

/**
 * if Core was started from Core Dir, swap some stuff around
 * e.g. change working directory to upper level ...
 * @returns {Promise<void>}
 */
async function validateStructure(){
	if((process.cwd().split(path.sep).pop()).toLowerCase() === 'core'){
		process.chdir('../');
		console.error('NOTICE: API-Core should not be started from Core Directory (as Working Directory)')
	}
}

/**
 * creates required directories e.g. ./logs/
 * @returns {Promise<void>}
 */
async function createDirs(){
	const dir = path.join(process.cwd(), 'logs');
	try{
		if(!fs.existsSync(dir)){
			fs.mkdirSync(dir)
		}
	}catch(error){
		console.error(error);
		process.exit(1);
	}
}

/**
 * loads string template file
 * @returns {Promise<void>}
 */
async function setup_strings(){
	try{
		app.strings = JSON.parse(fs.readFileSync('./Core/lib/lang/en_strings.json', 'utf8'));
	}catch(error){
		console.error(error);
		process.exit(1);
	}
}

/**
 * check if required env vars are setup correctly
 * todo: complete env check for all env-variables
 * @returns {Promise<void>}
 */
async function setup_env(){
	//load env vars
	require('dotenv').config();
	const Env = require('./lib/env');
	Env.Credit_Limits();
	Env.IPFilter();
	Env.RATE_LIMITER();
}

/**
 * setup database connection
 * @returns {Promise<void>}
 */
async function setup_db(){
	await db.setup_db();
}

// ------------------------------------------------------------------

/**
 * attach API routes from each module to application router
 * @returns {Promise<void>}
 */
async function setup_routes(){
	
	//API Modules, requires must happen within this function (@ validateStructure working dir change)
	const API_Users = require('./api/user');
	const API_Cards = require('./api/card');
	const API_Terminals = require('./api/terminal');
	const API_Transcations = require('./api/transaction');
	const Lib_Email = require('./lib/email');
	const Lib_ResponseHandler = require('./lib/responseHandler');
	
	const appRouter = app.getNewRouter();
	
	//API attaches to ./api/
	const apiRouter = app.getNewRouter();
	API_Users.attach_routes(apiRouter);
	API_Cards.attach_routes(apiRouter);
	API_Terminals.attach_routes(apiRouter);
	API_Transcations.attach_routes(apiRouter);
	appRouter.use('/api', apiRouter);
	
	//Libs attach to ./<lib>/
	Lib_Email.attach_routes(appRouter);
	
	//General ./
	Lib_ResponseHandler.attach_routes(appRouter); //needs to be last router (error routes)
	app.use('/', appRouter);
}

// ------------------------------------------------------------------

/**
 * start HTTP Server
 * 'core running ...' stdout crucial for test runner script
 * @returns {Promise<any>}
 */
async function start_api_server(){
	return new Promise(resolve =>{
		app.listen(process.env.PORT, () =>{
			process.stdout.write(`core running @ http://${process.env.HOST}:${process.env.PORT}/\n`);
			return resolve(true)
		});
	})
}