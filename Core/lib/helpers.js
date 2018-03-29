module.exports = (app) =>{
	
	/**
	 * gets request information for logger
	 * @param request
	 * @returns {string}
	 */
	app.getIPstring = function(request){
		let str = `${request.res.statusCode} - ${request.method} - `;
		//str += `${info.request.protocol} - ${info.request.method} - `;
		//str += info.request.get('host') + ' -
		str += `${request.originalUrl} - `;
		
		const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
		
		//ipv6 localhost windows cancer
		if(ip.substr(0, 7) === "::ffff:"){
			str += ip.substr(7)
		}else{
			str += ip;
		}
		
		return str;
	};
	
	// -------------------------------------------------------------------------
	// manual delay helper for testing
	
	const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
	
	async function delay(time){
		await timeout(time)
	}
	
	app.delay = delay;
	
	// -------------------------------------------------------------------------
	//Dateformater, copied from old projects, used by template (MySQL Datetime to GermanTime-Format)
	
	Date.prototype.leadingZero = function(val){
		return (val < 10) ? '0' + val : val;
	};
	
	Date.prototype.date = function(dateSep, interSep, timeSep){
		dateSep = dateSep || '.';
		interSep = interSep || ' - ';
		timeSep = timeSep || ':';
		return this.leadingZero(this.getDate()) + dateSep +
			this.leadingZero(this.getMonth()) + dateSep +
			this.getFullYear() + interSep +
			this.leadingZero(this.getHours()) + timeSep +
			this.leadingZero(this.getMinutes()) + timeSep +
			this.leadingZero(this.getSeconds())
	};
	
	Date.prototype.toCMPDTime = function(sep){
		sep = sep || ':';
		return this.leadingZero(this.getHours()) + sep +
			this.leadingZero(this.getMinutes()) + sep +
			this.leadingZero(this.getSeconds());
	};
	
	Date.prototype.toCMPDate = function(sep){
		sep = sep || '.';
		return this.leadingZero(this.getDate()) + sep +
			this.leadingZero(1 + this.getMonth()) + sep +
			this.getFullYear();
	};
	
	//called from templates
	Date.prototype.toCMPDateTime = function(dateSep, spacer, timesep){
		return this.toCMPDate(dateSep) + (spacer || ' - ') + this.toCMPDTime(timesep);
	};
	
};