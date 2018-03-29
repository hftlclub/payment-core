const {GeneralRateLimier, TerminalRateLimier} = require('./rateLimiter');
const {IPFilter,LocalFilter} = require('./ipfilter');
const FormBody = require('./bodyData');
const {Login, Admin} = require('./auth');

module.exports = {
	APILimter:GeneralRateLimier,
	TerminalLimiter:TerminalRateLimier,
	IpFilter:IPFilter,
	LocalFilter:LocalFilter,
	FormBody:FormBody,
	Login:Login,
	Admin:Admin
};