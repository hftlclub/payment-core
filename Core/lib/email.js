const app = require('../app');
const db = require('./db');
const ejs = require('ejs');
const fs = require('fs');
const util = require('util');
const nodemailer = require('nodemailer');

module.exports = {
	attach_routes:attach_router
};

const {LocalFilter, IpFilter, Login, Admin, APILimter} = require('./middleware');
const {okResponse} = require('../lib/responseHandler');
const User = require('../api/user');

// ----------------------------------------------------------------------
// email template: https://github.com/leemunroe/responsive-html-email-template/blob/master/email.html
// load email template at startup

let template;

try{
	template = fs.readFileSync('./Core/lib/templates/email.ejs', 'utf-8');
}catch(error){
	console.error(error);
	process.exit(1);
}

// ----------------------------------------------------------------------
// init SMTP transporter

const MAIL_FROM = 'admin@test.local';

// nodemailer: https://nodemailer.com/about/
const transporter = nodemailer.createTransport({
	host:'localhost',
	port:1025,
	ignoreTLS:true
	/*secure:true,
	 auth:{
	 type:'login',
	 user:'admin',
	 pass:'12345'
	 },
	 tls:{
	 // do not fail on invalid certs
	 rejectUnauthorized:false
	 }*/
});

// ----------------------------------------------------------------------

/**
 * attach /email routes to appRouter (/)
 * @param appRouter
 */
function attach_router(appRouter){
	const router = app.getNewRouter();
	
	//preview all mails (AS JSON)
	router.get('/:timerange?', [IpFilter, APILimter, Login, Admin], previewNextMails);
	
	//preview mail for username
	router.get('/preview/:username/:timerange?/:html?', [IpFilter, APILimter, Login, Admin], previewNextMailForUser);
	
	//trigger send mail - can only be called from localhost!
	router.post('/:timerange?', [LocalFilter], triggerMailQueue);
	
	appRouter.use('/email', router);
}

// ----------------------------------------------------------------------

/**
 * display a preview of ALL emails for given timerange
 * @param request
 * @param response
 * @param next
 * @returns {Promise<*>}
 */
async function previewNextMails(request, response, next){
	response.locals.log = {label:'email', type:'preview'};
	try{
		const timeRange = parseTimeRange(request.params['timerange']);
		response.locals.data = await getLatestData(timeRange);
		return okResponse(response);
	}catch(error){
		response.locals.error = error;
		return next();
	}
}

/**
 * display a preview for a specific user for given timerange
 * response can be either as JSON (default) or as rendered E-Mail HTML-template (use /html param)
 * @param request
 * @param response
 * @param next
 * @returns {Promise<*>}
 */
async function previewNextMailForUser(request, response, next){
	response.locals.log = {label:'email', type:'userpreview'};
	
	try{
		const timeRange = parseTimeRange(request.params['timerange']);
		const user = await User.exists(request.params['username']);
		if(!user.status){
			response.locals.error = user.message;
			return next();
		}
		const data = await getLatestData(timeRange, request.params['username']);
		
		//add text
		if(data.length === 1){
			data[0].title = app.strings['email']['html_title'];
			data[0].subject = util.format(
				app.strings['email']['subject'],
				data[0]['user'],
				((timeRange + 's').toLowerCase() || '24 Hours')
			);
			
			//return html if param was set
			if(request.params['html']){
				response.locals.html = true;
				response.locals.data = parseEmail(data[0]);
				return okResponse(response);
			}
			
			response.locals.data = data[0];
		}else{
			//return empty json
			response.locals.data = data;
		}
		return okResponse(response);
		
	}catch(error){
		response.locals.error = error;
		return next();
	}
}

/**
 * send emails to all qualifying users for given timerange
 * @param request
 * @param response
 * @param next
 * @returns {*}
 */
async function triggerMailQueue(request, response, next){
	response.locals.log = {label:'email', type:'sendmail', data:[]};
	
	try{
		const timeRange = parseTimeRange(request.params['timerange']);
		const data = await getLatestData(timeRange);
		
		if(data.length !== 0){
			//for each user email
			for(const email of data){
				//set email heaer
				email.title = app.strings['email']['html_title'];
				email.subject = util.format(
					app.strings['email']['subject'],
					email.user,
					((timeRange + 's').toLowerCase() || '24 Hours')
				);
				//render email
				email.html = parseEmail(email);
				try{
					//send email
					const mailerInfo = await sendEmail(email);
					response.locals.log.data.push({
						messageId:mailerInfo.messageId,
						messageSize:mailerInfo.messageSize,
						response:mailerInfo.response,
						envelope:mailerInfo.envelope
					});
				}catch(error){
					//error e.g. SMTP Server not reachable
					response.locals.exception = error;
					return next();
				}
			}
		}
		return okResponse(response);
	}catch(error){
		if(error.stack){
			response.locals.exception = error;
		}else{
			response.locals.error = error;
		}
		return next();
	}
}

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------

/**
 * sends a new Mail for given email data
 * @param email
 * @returns {Promise<any>}
 */
async function sendEmail(email){
	return new Promise(((resolve, reject) =>{
		let options = {
			from:MAIL_FROM,
			to:email.email,
			subject:email.subject,
			html:email.html,
		};
		transporter.sendMail(options, (error, info) =>{
			if(error){
				return reject(error);
			}
			return resolve(info);
		})
	}))
}

// ----------------------------------------------------------------------

/**
 * renders email-template for given data
 * @param data
 * @returns {String} rendered HTML of Email
 */
function parseEmail(data){
	return ejs.render(
		template,
		{
			header:{
				title:data.title,
				subject:data.subject
			},
			email:data.email,
			data:data.data,
		}
	);
}

// ----------------------------------------------------------------------

/**
 * returns all transactions for given timerange
 * grouped by EMAIL->[CARDS]->[TRANSACTIONS]
 * @param timerange optional parame to specify valid transaction-date range, defaults to 24 HOUR
 * @param username optional param to only get data for a specific user
 * @returns {Promise<*>}
 */
async function getLatestData(timerange, username){
	
	if(!timerange){
		timerange = '24 HOUR';
	}
	
	let userWhere = '';
	if(username){
		userWhere = ' AND Cards.UserREF=? ';
	}else{
		username = '';
	}
	
	//language=MySQL
	const query = `
      SELECT
        Transactions.ID      AS T_ID,
        Transactions.Date    AS T_DATE,
        Transactions.CardREF AS CARD_UID,
        Transactions.Value   AS T_VAL,
        Transactions.Type    AS T_TYPE,
        Users.EMail          AS USER_EMAIL,
        Cards.UserREF		 AS USER_NAME,
        Terminals.Name       AS Term_Name
      FROM Transactions
        INNER JOIN Cards ON Transactions.CardREF = Cards.UID
        INNER JOIN Users ON Cards.UserREF = Users.Username
        LEFT JOIN Terminals ON Transactions.TerminalREF = Terminals.ID
      WHERE Transactions.Date >= now() - INTERVAL ${timerange}${userWhere}
      ORDER BY CARD_UID DESC, T_ID DESC`;
	
	const [data] = await db.pool.query(query, [username]);
	
	if(data.length === 0){
		return [];
	}
	
	return groupData(data);
}

// ----------------------------------------------------------------------

/**
 * parses URL timerange Parameter to correct MySQL Syntax
 * uses 24 HOUR as default
 * @param timeRange
 * @returns {string}
 */
function parseTimeRange(timeRange){
	
	//default, last 24 hours
	if(!timeRange){
		return '24 HOUR';
	}
	
	//custom time range
	const time = timeRange.match(new RegExp(/\d+/, 'g'));
	const format = timeRange.match(new RegExp(/\D+/, 'g'));
	
	if(!time || !format || time.length !== 1 || format.length !== 1){
		throw new Error(util.format(app.strings['email']['timerange_format_is_invalid'], timeRange));
	}
	
	const t = parseInt(time[0].trim());
	
	if(t <= 0){
		throw new Error(util.format(app.strings['email']['timerange_time_is_negative'], t));
	}
	
	const f = format[0].trim().toUpperCase();
	switch(f){
		case 'HOUR':
			break;
		case 'MINUTE':
			break;
		case 'DAY':
			break;
		case 'WEEK':
			break;
		case 'MONTH':
			break;
		case 'YEAR':
			break;
		default:
			throw new Error(util.format(app.strings['email']['timerange_value_is_invalid'], f));
	}
	
	return `${t} ${f}`;
	
}

// ----------------------------------------------------------------------

/**
 * group query data to EMAIL->[CARDS]->[TRANSACTIONS]
 * @param data
 * @returns {{}}
 */
function groupData(data){
	const emails = {};
	
	for(const transaction of data){
		
		//if email not exists, create object
		if(!emails[transaction['USER_EMAIL']]){
			emails[transaction['USER_EMAIL']] = {
				user:transaction['USER_NAME']
			};
		}
		
		//if card does not exist within email object, create object
		if(!emails[transaction['USER_EMAIL']][transaction['CARD_UID']]){
			emails[transaction['USER_EMAIL']][transaction['CARD_UID']] = {
				card:transaction['CARD_UID'],
				transactions:[]
			};
		}
		
		//assemble transaction data
		const tdata = {
			type:transaction['T_TYPE'],
			value:(transaction['T_VAL'] > 0 ? '+' + transaction['T_VAL'] : transaction['T_VAL']),
			date:transaction['T_DATE']
		};
		
		//only add terminal if exists
		if(transaction['Term_Name']){
			tdata.terminal = transaction['Term_Name'];
		}
		
		//push transaction
		emails[transaction['USER_EMAIL']][transaction['CARD_UID']]['transactions'].push(tdata);
	}
	
	/* format output to
	 [ {email,data->[{card,user,transactions->[{type,value,date,terminal},..]},..] },..
	 */
	return Object.keys(emails)
	             .map(k1 => new Object({
			             email:k1,
			             user:emails[k1]['user'],
			             data:
				             Object.keys(emails[k1])
				                   .map(k2 =>{
					                   if(k2 === "user"){
						                   delete emails[k1][k2];
						                   return;
					                   }
					                   return emails[k1][k2];
				                   })
				                   .filter(deleted => typeof deleted !== 'undefined'),
		             })
	             );
}

