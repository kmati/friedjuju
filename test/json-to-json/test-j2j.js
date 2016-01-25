/*
 * The unit tests for the j2j
 */
var j2j = require('../../src/json-to-json/j2j.js');

module.exports = {
	test_j2j_Async: function (beforeExit, assert) {

		//var fromToExpressions = [];
		var fromToExpressions = [
			{ from: 'firstName', to: 'fname' },
			{ from: 'address.street', to: 'st.' },
			{ from: 'address.city', to: 'city' }
		];

		var sourceObj = {
			firstName: 'Joe',
			lastName: 'Chen',
			age: 34,
			address: {
				street: '10 Anywhere Road',
				city: 'Rivendell',
				country: 'Nowhere'
			}
		};

		var targetObj = { x: 88, fname: "XXX" };
		var result = j2j.transform(fromToExpressions, sourceObj, targetObj);

		var testables = {
			"x": 88,
			"fname": "Joe",
			"st": "10 Anywhere Road",
			"city": "Rivendell"
		};

		assert.eql(testables.x, 88, 'Wrong value; expected 88');
		assert.eql(testables.fname, 'Joe', 'Wrong value; expected Joe');
		assert.eql(testables.st, '10 Anywhere Road', 'Wrong value; expected 10 Anywhere Road');
		assert.eql(testables.city, 'Rivendell', 'Wrong value; expected Rivendell');

	    beforeExit(function() {
	    });
	}
};
