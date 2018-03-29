const bodyParser = require('body-parser');

/**
 * Formular Daten die über FormBODY gesendet wurden parsen
 * parsed KEINE Multiparts! (FormData) --> neue MW erforderlich
 */
function FormularData(){
	return bodyParser.urlencoded({extended:false});
}

module.exports = FormularData();