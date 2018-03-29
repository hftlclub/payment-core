(async () =>{
	
	// code that should be executed before core-server is started
	// [ ... ]
	
	const Core = require('./Core/index');
	await Core.start();
	
	// code that should be executed after core-server is up and running
	// [ ... ]
	
})();