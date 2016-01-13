/*
 * This script tests the expressionQuery module.
 */
var expressionQuery = require('../src/expression-matching/expressionQuery.js');

var obj = {
	people: [
		{ name: 'Joe', age: 23, address: { street: '1 Anyplace Lane', city: 'Boston', state: 'MA', country: 'USA' } },
		{ name: 'Sally', age: 24, address: { street: '10 Fire Ave', city: 'Providence', state: 'RI', country: 'USA' } },
		{ name: 'Harris', age: 17, address: { street: '55 Sure Way', city: 'London', country: 'England' } },
		{ name: 'Boris', age: 29, address: { street: '77 Wilson Road', city: 'Sydney', state: 'NSW', country: 'Australia' } },
		{ name: 'Naj', age: 32, address: { street: '35 Guru Street', city: 'San Francisco', state: 'CA', country: 'USA' } }
	],
	'$1desc': 'This is the 2nd description',
	'$0desc': 'This is the 1st description',
	counts: {
		people: 5
	}
};

//var expr = '*.name';
//var expr = 'people.name';
//var expr = '*';
//var expr = '?';
//var expr = '?.people';
//var expr = '?.name';
//var expr = '*.address';
//var expr = 'people[1]';
//var expr = '*.address[country=USA]';
//var expr = 'people.address[country=USA]';
//var expr = '*[country=USA]';
var expr = '$1desc';
var matches = expressionQuery.query(expr, obj);
console.log('expr = ' + expr);
console.log('matches = ',matches);
