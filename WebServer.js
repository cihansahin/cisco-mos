var path = require('path');

// Tom's test comment 

module.exports = WebServer;

function WebServer( expressApp ) {
	expressApp.use( 'public' , expressApp.static(path.join(__dirname, '/public'))); //  "public" off of current is root
}




