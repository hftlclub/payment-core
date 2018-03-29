const Logger = require('./logger');
const mysql = require('promise-mysql2');

class DB {
	
	/**
	 * pool is directly accessed by other scripts
	 */
	constructor(){
		this.pool = null;
	}
	
	/**
	 * create database pool
	 * @returns {Promise<void>}
	 */
	async setup_db(){
		try{
			//create test connection to check database data and access
			const con = await this.createSingleConnection();
			con.end();
			
			//create a pool for all further connections
			this.pool = await mysql.createPool({
				host:process.env.DB_HOST,
				port:process.env.DB_PORT,
				user:process.env.DB_USER,
				password:process.env.DB_PASS,
				database:process.env.DB_DATABASE,
				connectionLimit:10
			});
		}catch(error){
			//ciritcal will terminate process
			Logger.critical(error);
		}
	}
	
	/**
	 * was used by old testdatascript
	 * @returns {Promise<any>}
	 */
	async createSingleConnection(){
		let connection_err;
		const connection = await mysql.createConnection({
			host:process.env.DB_HOST,
			port:process.env.DB_PORT,
			user:process.env.DB_USER,
			password:process.env.DB_PASS,
			database:process.env.DB_DATABASE,
		}).catch(error =>{ connection_err = error});
		
		if(connection_err){
			Logger.critical(`Database Connection Error: ${connection_err.message}`);
		}
		
		if(connection.connection.state !== "authenticated"){
			Logger.critical(`Database connection Error: state=${connection.connection.state}`);
		}
		
		return connection;
	}
	
}

/**
 * each require gets the same instance (singleton)
 * @type {DB}
 */
const db = new DB();
module.exports = db;