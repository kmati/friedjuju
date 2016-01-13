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

	// http://localhost:2019/markupify?prettyPrint=true
	// http://localhost:2019/markupify?prettyPrint=false
	"post": function (req, res) {
		// Any JSONizeable object (please don't put in circular references!)
		var inputObj = req.body;

		try {
			j2m.prettyPrint = "true" ===req.query.prettyPrint;
			var result = j2m.execute(inputObj);
			httpUtils.writeHead200(res, {
	            "Content-Type": "text/html"
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
