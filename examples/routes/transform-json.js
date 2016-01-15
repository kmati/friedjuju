/*
 * The transform-json web service API.
 */
var httpUtils = require('../http-utils.js');
var j2j = require('../../src/json-to-json/j2j.js');

var handlers = {
	// Binds the routes handled inside this module to the Express app
	// app	: The Express app
	bindRoutes: function (app) {
	    app.post('/transform-json', this.post);
	},

	// http://localhost:2019/transform-json
	// Request body: A JSON object that looks like:
	// - fromToExpressions: An array whose elements are objects with 2 properties ('from' and 'to')
	//						- from: The expression to query from the source object
	//						- to: The expression to write to in the target object
	// - sourceObj: The source object to query from (i.e. the JSON you want to transform)
	// - initialTargetObj: The initial target object to write to. It may have existing properties that you wish to retain.
	// 		Please note that the 'to' expressions may cause properties in the initial target to be overwritten in the resulting target object.
	/*
	An example Request body:
	{
		"fromToExpressions": [
			{ "from": "firstName", "to": "fname" },
			{ "from": "address.street", "to": "st." },
			{ "from": "address.city", "to": "city" }
		],

		"sourceObj": {
			"firstName": "Joe",
			"lastName": "Chen",
			"age": 34,
			"address": {
				"street": "10 Anywhere Road",
				"city": "Rivendell",
				"country": "Nowhere"
			}
		},

		"initialTargetObj": { "x": 88, "fname": "XXX" }
	}

	Please note that 'x' will be preserved in the result, while 'fname' will be overwritten.
	*/
	"post": function (req, res) {
		try {
			var result = j2j.transform(req.body.fromToExpressions, req.body.sourceObj, req.body.initialTargetObj);
			httpUtils.writeHead200(res);
			res.end(JSON.stringify(result));
		} catch (e) {
			console.error(e);
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
