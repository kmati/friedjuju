/**
 * Module dependencies.
 */

var express = require('express'),
    bodyParser = require('body-parser'),
    http = require('http'), 
    path = require('path'),
    fs = require('fs'),
    config = require('./examples-config.json');

var app;

process.on('uncaughtException', function (err) {
  console.error('[friedjuju - examples] Uncaught exception: ' + JSON.stringify(err, undefined, 2));
  console.log('[friedjuju - examples] Forced exit now!');
  process.exit(1);
});

process.on('exit', function(code) {
  console.log('[friedjuju - examples] About to exit with code:', code);
});

/******************/
/* Create the app */
/******************/

function createApp() {
    app = express();

    // all environments
    app.set('port', process.env.PORT || config.port);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    app.use(express.static(path.join(__dirname, 'public')));
    
    createRoutes();
}

/*************************/
/* Set up the Url Routes */
/*************************/
var httpUtils = require('./http-utils.js');

// This method inspects the *.js files inside the /routes folder and binds the route handlers
function createRoutes() {
	var routesDir = path.join(__dirname, 'routes');
	fs.readdir(routesDir, function (err, files) {
		for (var c = 0; c < files.length; c++) {
			var fileName = files[c];
			if (fileName.substr(fileName.length - 3) === '.js') {
				var filePath = path.join(routesDir, fileName);
				try {
					var item = require(filePath);
					if (item && typeof item.bindRoutes === 'function') {
						item.bindRoutes(app);
					}
				} catch (e) {
					console.error("[app.createRoutes | Error] Filename: ", fileName, " | Error = ", e);
				}
			}
		}
	});
}

createApp();

http.createServer(app).listen(
  app.get('port'), function(){
  	console.log('********************************************************************');
  	console.log('*                   Copyright (c) ' + new Date().getFullYear() + ' Kimanzi Mati                *');
    console.log('*                             MIT License                          *');
    console.log('*                                                                  *');
  	console.log('*                         friedjuju - examples                     *');
  	console.log('*                                                                  *');
  	console.log("*          A small app to showcase the use of friedjuju            *");
  	console.log('********************************************************************');
    console.log('friedjuju - examples server listening on port ' + app.get('port'));
    console.log();
});
