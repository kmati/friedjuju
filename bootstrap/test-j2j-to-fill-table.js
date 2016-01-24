/*
 * This script tests the transformation of JSON to JSON of a different structure.
 */
var j2j = require('../src/json-to-json/j2j.js');

var fromToExpressions = ['title', 'first_name', 'last_name', 'suffix'].map(function (item, index) {
	return { from: item, to: 'table.tr[' + index + '].td[1]' };
});

var sourceObj = {
	"title": "Mrs.",
	"first_name": "Gilda",
	"last_name": "Smythe",
	"suffix": "Jr.",
	"street": "1600 Massachusetts Street",
	"city": "Sydney",
	"state": "NSW",
	"country": "Australia"
};

var targetObj = {
	table: {
		tr: [
			{ td: ['Title'] },
			{ td: ['First Name'] },
			{ td: ['Last Name'] },
			{ td: ['Suffix'] }
		]
	}
};
console.log('Before | targetObj = ' + JSON.stringify(targetObj, undefined, 2));

var result = j2j.transform(fromToExpressions, sourceObj, targetObj);
console.log('After | targetObj = ' + JSON.stringify(targetObj, undefined, 2));
console.log('After | result = ' + JSON.stringify(result, undefined, 2));
