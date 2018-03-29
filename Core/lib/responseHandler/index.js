const {errorResponse, attach_routes} = require('./errorResponse');
const {okResponse} = require('./okResponse');

module.exports = {
	errorResponse:errorResponse,
	okResponse:okResponse,
	attach_routes:attach_routes
};