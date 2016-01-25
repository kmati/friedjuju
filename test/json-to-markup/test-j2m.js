/*
 * The unit tests for the j2m
 */
var j2m = require('../../src/json-to-markup/j2m.js');

module.exports = {
	test_LI_elements_creation_Async: function (beforeExit, assert) {
		var obj = {
			foo: {
			  "@id": "listItemsSimple",
			  "LI": [
			    {
			      "$str": "a"
			    },
			    {
			      "$str": "s"
			    },
			    {
			      "$str": "s"
			    },
			    {
			      "$str": "x"
			    },
			    {
			      "$str": "y"
			    },
			    {
			      "$str": "z"
			    },
			    {},
			    {},
			    {},
			    "junk"
			  ]
			}
		};

		j2m.prettyPrint = false;

		var result = j2m.execute(obj);
		assert.eql(result, '<foo id="listItemsSimple">' +
		  '<LI>a</LI>' +
		  '<LI>s</LI>' +
		  '<LI>s</LI>' +
		  '<LI>x</LI>' +
		  '<LI>y</LI>' +
		  '<LI>z</LI>' +
		  '<LI></LI>' +
		  '<LI></LI>' +
		  '<LI></LI>' +
		  '<LI>junk</LI>' +
		'</foo>', 'result is malformed');

	    beforeExit(function() {
	    });
	}
};
