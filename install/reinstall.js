const fs = require('fs');
require('dotenv').config();
const db = require('../Core/lib/db');

if(!process.env['NODE_ENV'] || process.env['NODE_ENV'].toUpperCase() !== 'DEVELOPMENT'){
	const readline = require('readline');
	
	const rl = readline.createInterface({
		input:process.stdin,
		output:process.stdout
	});
	
	rl.question('ATTENTION:\nYour NODE_ENV is NOT set to development..\nreally drop/install DB-Tables? (y/n): ', (answer) =>{
		switch(answer){
			case 'y' :
				install();
				break;
			case 'n' :
				console.error('Aborting reinstall of Database-Tables');
				process.exit(500);
				break;
			default:
				console.error('Answer was neither "y" nor "n" -> aborting');
				process.exit(1000);
		}
		rl.close();
	});
}else{
	//NODE_ENV = development
	install();
}

async function install(){
//order matters!
	const tables = [
		"Users",
		"Cards",
		"Terminals",
		"Transactions",
		"TransactionMarks"
	];
	
	//reversed drop order
	const dropTables = (tables.slice()).reverse().join(',');
	
	//create connection from Core DB module
	const connection = await db.createSingleConnection()
	                           .catch(error =>{
		                           console.error(error);
		                           process.exit(1)
	                           });
	
	//used to stop further queries on error
	let stop = false;
	
	//drops all tables
	async function drop(){
		return new Promise(resolve =>{
			
			//language=MySQL
			const dropQuery = `DROP TABLE IF EXISTS ${dropTables}`;
			
			connection.query(`${dropQuery};`, (error) =>{
				if(error){
					console.error(error.sqlMessage);
					connection.end();
					process.exit(1);
				}
				console.log("Dropped all Tables");
				resolve(true);
			});
		})
	}
	
	//exit function (drops all tables aswell)
	async function exit(){
		await drop();
		connection.end();
		process.exit(1);
	}
	
	//execute sql script from SQL folder
	async function createTable(sqlFile){
		try{
			const query = fs.readFileSync(`./install/SQL/${sqlFile}.sql`, {encoding:"utf8"});
			
			return new Promise((resolve, reject) =>{
				if(stop){
					reject(0);
				}else{
					connection.query(query, async (error, results) =>{
						if(error){
							stop = true;
							reject(sqlFile + ": " + error.sqlMessage);
						}else{
							console.log("Created Table: " + sqlFile);
							resolve(results);
						}
					}).catch(async error =>{
						stop = true;
						console.error(error);
						await exit();
					});
				}
			})
			
		}catch(error){
			stop = true;
			console.error(error);
			await exit();
		}
	}
	
	//----------------------------------------------------------
	//reinstall process
	
	//clean up DB
	await drop();
	
	//wait til all tables were created
	try{
		Promise.all(tables.map(createTable))
		       .then(() =>{
			       console.log("Success: installed all tables");
			       connection.end();
			       process.exit(0); //script finished with success
		       });
	}catch(error){
		stop = true;
		console.error(error);
		await exit();
	}
}

