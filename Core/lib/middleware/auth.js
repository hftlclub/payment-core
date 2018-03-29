module.exports = {
	Login: Login,
	Admin: Admin
};

/**
 * Weitere Route nur eingeloggten Nutzer zugänglich
 * @param request
 * @param response
 * @param next
 */
function Login(request, response, next){
	next();
}

/**
 * Weitere Route nur Admins zugänglich
 * @param request
 * @param response
 * @param next
 */
function Admin(request, response, next){
	next();
}