//used by email tests

const MailDev = require('maildev');
const maildev = new MailDev({
	smtp:1025,
	ip:'localhost',
	'incoming-user':'admin',
	'incoming-pass':'12345',
	'disable-web ':true,
	silent:true
	
});

maildev.listen();

maildev.on('new', function(email){
	//console.log(email.headers);
});


module.exports = maildev;

