/*
 * This script tests the transformation of JSON to JSON of a different structure.
 */
var j2j = require('../src/json-to-json/j2j.js');

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
console.log('Before | targetObj = ' + JSON.stringify(targetObj, undefined, 2));

var result = j2j.transform(fromToExpressions, sourceObj, targetObj);
console.log('After | targetObj = ' + JSON.stringify(targetObj, undefined, 2));
console.log('After | result = ' + JSON.stringify(result, undefined, 2));
