/*
 * The markupify web service API.
 */
var httpUtils = require('../http-utils.js');
var j2m = require('../../src/json-to-markup/j2m.js');

var handlers = {
	// Binds the routes handled inside this module to the Express app
	// app	: The Express app
	bindRoutes: function (app) {
	    app.post('/markupify', this.post);
	},

	// The following request urls default to yield a response Content-Type of text/html:
	// http://localhost:2019/markupify?prettyPrint=true
	// http://localhost:2019/markupify?prettyPrint=false
	//
	// However, you can specify the Content-Type using the request argument called 'mime':
	//			e.g. http://localhost:2019/markupify?prettyPrint=true&mime=text/html
	//			e.g. http://localhost:2019/markupify?prettyPrint=true&mime=text/xml
	//			e.g. http://localhost:2019/markupify?prettyPrint=true&mime=image/svg+xml
	//
	// Request body: Any valid JSON
	// Response: Markup content as a string
	// Extra credit: We could parameterize the content string of the response in a request parameter,
	"post": function (req, res) {
		// Any JSONizeable object (please don't put in circular references!)
		var inputObj = req.body;

		var contentType = 'text/html';
		if (req.query.mime) {
			contentType = req.query.mime;
		}

		try {
			j2m.prettyPrint = "true" ===req.query.prettyPrint;
			var result = j2m.execute(inputObj);
			httpUtils.writeHead200(res, {
	            "Content-Type": contentType
	        });
			res.end(result);
		} catch (e) {
			httpUtils.writeHead500(res);
			res.end(JSON.stringify({
				"error" : e.toString()
			}));
		}
	}
};

for (var key in handlers) {
    exports[key] = handlers[key];
}
