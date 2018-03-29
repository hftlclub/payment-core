process.stdin.resume();

const path = require('path');
const fs = require('fs');
const {spawn} = require('child_process');

//change dir for dotenv
if(process.cwd().split(path.sep).pop() === 'tests'){
	process.chdir('../');
}

require('dotenv').config();

if(!process.env['NODE_ENV'] || process.env['NODE_ENV'].toUpperCase() !== 'DEVELOPMENT'){
	console.error('NODE_ENV not set to development, aborting tests');
	process.exit(1000);
}

const Mocha = require('mocha');
const mocha = new Mocha();
const testFileDir = path.join(process.cwd(), '/tests/mocha');
const request = require('request-promise-native');

/**
 * DateFormater
 * @returns {string}
 */
function d(){
	return new Date(Date.now()).toLocaleString();
}

// ------------------------------------------------------------------
// API Server

let coreServer;

function killServer(){
	if(coreServer){
		try{
			coreServer.kill('SIGTERM');
		}catch(error){
			console.error(error);
		}
	}
}

process.on('exit', function(){
	killServer();
	process.exit(0);
});

process.on('SIGINT', function(){
	process.stderr.write(d() + "\t" + "SIGINT");
	killServer();
	process.exit(1);
});

process.on('SIGTERM', function(){
	process.stderr.write(d() + "\t" + "SIGTERM");
	killServer();
	process.exit(1);
});

/**
 *
 * @returns {Promise<any>}
 */
async function checkIfServerIsRunning(){
	try{
		//try / route .. will return error(404) if not set, see else below
		await request.get(`http://${process.env.HOST}:${process.env.PORT}/`);
		console.log(d() + "\t" + 'Server is already running, skipping log cleaning');
	}catch(error){
		//no statuscode = server not running
		if(!error.statusCode){
			process.stdout.write(d() + "\t" + 'Server not running, trying to Start...\n');
			try{
				await cleanUpLogs();
				return await startServer();
			}catch(fatal){
				console.error(d() + "\t" + fatal);
				process.exit(1);
			}
		}else{
			//Server running...
			console.log(d() + "\t" + 'Server is already running, skipping log cleaning');
		}
	}
}

/**
 *
 * @returns {Promise<any>}
 */
async function startServer(){
	return new Promise((resolve, reject) =>{
		
		const timer = setTimeout(() =>{
			reject('core server took too long to be ready, aborting...')
		}, 10000);
		
		coreServer = spawn('node', ['./index.js']);
		
		coreServer.stdout.on('data', (data) =>{
			if(data.toString().match(new RegExp(/Core running(.*)/, 'i'))){
				//process.stdout.write(d() + "\t" + data.toString());
				clearTimeout(timer);
				return resolve(true);
			}else{
				//process.stdout.write(d() + "\t" + data.toString());
			}
		});
		
		coreServer.stderr.on('data', (data) =>{
			//process.stderr.write(d() + "\t" + data.toString());
		});
	})
}

// ------------------------------------------------------------------
// Database

/**
 *
 * @returns {Promise<any>}
 */
async function reinstallDatabase(){
	
	return new Promise((resolve) =>{
		
		const reinstallDB = spawn('node', ['./install/reinstall.js']);
		
		reinstallDB.stdout.on('data', (data) =>{
			process.stdout.write(d() + "\t" + data);
		});
		reinstallDB.stderr.on('data', (data) =>{
			process.stderr.write(d() + "\t" + data);
		});
		
		reinstallDB.on('exit', (code) =>{
			if(code !== 0){
				process.exit(1);
			}else{
				resolve(code);
			}
		});
	})
}

// ------------------------------------------------------------------
// Logs
// .. are only cleaned if the server was not running (else perm exception...)

/**
 *
 * @returns {Promise<any>}
 */
async function cleanUpLogs(){
	return new Promise((resolve, reject) =>{
		
		try{
			const logDir = './logs';
			const files = fs.readdirSync(logDir);
			for(const file of files){
				fs.unlinkSync(path.join(logDir, file));
			}
			console.log(d() + "\t" + "Cleaned Logs");
			resolve(true);
		}catch(error){
			reject(error);
		}
	})
}

// ------------------------------------------------------------------
// start testrunner

/**
 *
 * @returns {Promise<any>}
 */
async function runTests(){
	//mocha ./tests/mocha/*.js
	return new Promise((resolve =>{
		const testFiles = fs.readdirSync(testFileDir);
		const files = testFiles.filter((file) =>{
			return file.substr(-3) === '.js';
		});
		for(const file of files){
			mocha.addFile(path.join(testFileDir, file));
		}
		const runner = mocha.run(code =>{});
		runner.on('end', () =>{
			resolve(true);
		})
	}))
}

// ------------------------------------------------------------------
// start Testrun

(async () =>{
	try{
		await reinstallDatabase();
		await checkIfServerIsRunning();
		await runTests();
		setTimeout(() =>{
			console.log("-----------------------------------");
			console.log("finished testrun..");
			process.exit(0);
		});
	}catch(error){
		console.error(error);
		process.exit(1);
	}
})();

