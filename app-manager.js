//PlatformApi.js

var express = require('express');
var app = express();
var path = require('path');

var httpServer = require('http').createServer(app);

app.configure(function () {

	/* WebServer can be used to host some of the application package files */
	app.use('/' , express.static(path.join(__dirname, '/public'))); 
 	app.use(function(req, res, next) {
		res.set({
			'Access-Control-Allow-Origin'  : '*',
			'Access-Control-Allow-Headers' : 'isxhr, x-requested-with, origin, content-type',
			'Access-Control-Allow-Methods' : 'GET, POST, OPTIONS',
			'Access-Control-Allow-Max-Age' : '1728000'
		});
		return next();
  	});

    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
	//app.use(express.bodyParser());
        app.use(express.json());
        app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(app.router);

});

var args =  process.argv.slice(2);

if (args.length < 1) {
	console.log("Usage: " + process.argv[0] + " " + process.argv[1] + " <port>");
	process.exit(1);
}

var port = args[0];

app.options("/*", function (req, res) {

	res.set({
  		'Access-Control-Allow-Origin'  : '*',
		'Access-Control-Allow-Headers' : 'isxhr, x-requested-with, origin, content-type',
		'Access-Control-Allow-Methods' : 'GET, POST, OPTIONS',
		'Access-Control-Allow-Max-Age' : '1728000'
	});

	res.send(200);
});

/* App Manager is used to manager all the running
	application instances via their controllers
	The controllers of the application instances will 
	connect with the app manager using socket.io */

var AppManager = require('./controller/AppManager');
var am = new AppManager(httpServer, app);
var DemoDriver = require('./controller/DemoDriver');
var dd = new DemoDriver(am);

am.init( function(errors) {
	
	if(errors) {
		console.log("APP MANAGER INITIALIZATION FAILED AT " + new Date());
		process.exit();
		return;
	}
	
	console.log("APP MANAGER INITIALIZATION AT " + new Date());
	httpServer.listen(port);
	am.startHeartbeat();
	dd.startHeartbeat();
});
