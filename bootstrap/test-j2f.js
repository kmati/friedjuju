/*
 * This script tests the invocation of functions that are bound to objects within an object graph.
 */
var j2f = require('../src/json-to-function/j2f.js');

// this is the root object that will be traversed
var rootObj = {
	people: [
		{
			name: new String('Kuria Kano'),
			age: 23,
			address: { street: '7 Sky Way', city: new String('Arnor') }
		},
		{
			name: new String('Milton Keynes'),
			age: 29,
			address: { street: '17 Biltmore Lane', city: new String('Numenor') }
		},
		{
			name: new String('Sauron Stepchild'),
			age: 25,
			address: { street: '44 Dark Alley', city: new String('Mordor') }
		}
	]
};

console.log('Mapping to do trivial handling:')
console.log('-------------------------------');
// ---------
// NOTE: You can use whichever permutation of the mapping that you want. The result is the same!
// ---------

// Permutation 1:
// this is the array of mappings between expressions (that describe objects to match on) and functions
// var mapping = [
// 	{ 'people.name': function (obj) { console.log('Handling the name | obj = ' + obj); } },
// 	{ 'people.address.city': function (obj) { console.log('Handling the city | obj = ' + obj); } },
// 	{ 'people.name': function (obj) { console.log('Handling the name in a different way | obj = ' + obj); } }
// ];

// Permutation 2:
// this is the array of mappings between expressions (that describe objects to match on) and functions
// var mapping = [
//     {
//         'people.name': function (obj) { console.log('Handling the name | obj = ' + obj); },
//         'people.address.city': function (obj) { console.log('Handling the city | obj = ' + obj); }
//     },
//     { 'people.name': function (obj) { console.log('Handling the name in a different way | obj = ' + obj); } }
// ];

// Permutation 3:
// this is the array of mappings between expressions (that describe objects to match on) and functions
// var mapping = [
//     {
//         'people.name': [
//             function (obj) { console.log('Handling the name | obj = ' + obj); },
//             function (obj) { console.log('Handling the name in a different way | obj = ' + obj); }
//         ]
//     },
//     { 'people.address.city': function (obj) { console.log('Handling the city | obj = ' + obj); } }
// ];

// Permutation 4:
// this is the object that describes the mappings between expressions (that describe objects to match on) and functions
var mapping = {
    'people.name': [
        function (obj) { console.log('Handling the name | obj = ' + obj); },
        function (obj) { console.log('Handling the name in a different way | obj = ' + obj); }
    ],
    'people.address.city': function (obj) { console.log('Handling the city | obj = ' + obj); }
};

// this is the invocation to perform the traversal
j2f.traverse(rootObj, mapping);


console.log();
console.log('Mapping to do counting:')
console.log('-----------------------');
// Let's count addresses
var countAddresses = 0;
var counterMap = {
	'people.address': function (obj) { countAddresses++; }
};
j2f.traverse(rootObj, counterMap);
console.log('We found ' + countAddresses + ' addresses');


console.log();
console.log('Mapping to do some printing:')
console.log('----------------------------');
// Let's print the hierarchy
var printMap = {
	// Match all objects with a name property
	'*[name]': function (person) {
		console.log('Person info:');
		for (var key in person) {
			if (key !== 'address') {
				console.log('==> ' + key + ': ' + person[key]);
			}
		}
	},

	// Match all address objects which are children of the top-level
	'?.address': function (address) {
		console.log('==> Address:');
		for (var key in address) {
			console.log('\t ' + key + ': ' + address[key]);
		}
		console.log();
	}
};
j2f.traverse(rootObj, printMap);


console.log();
console.log('Mapping to do some printing with a single mapping function:')
console.log('-----------------------------------------------------------');
// Let's print the hierarchy
var printMap = {
	// Match all address objects which are children of the top-level
	// Notice that the second argument to the handling function is the parent object of the first object,
	// i.e. the first argument is address and the second argument is person (because person contains the address).
	'?.address': function (address, person) {
		console.log('Person info:');
		for (var key in person) {
			if (key !== 'address') {
				console.log('==> ' + key + ': ' + person[key]);
			}
		}
		console.log('==> Address:');
		for (var key in address) {
			console.log('\t ' + key + ': ' + address[key]);
		}
		console.log();
	}
};
j2f.traverse(rootObj, printMap);


console.log();
console.log('Computing sales using the context object:')
console.log('-----------------------------------------');
var salesData = {
	sales: [
		{ customer: { accountNo: 1234, name: 'Joe Smith' }, ytd: 129500 },
		{ customer: { accountNo: 3742, name: 'Farina Pasta' }, ytd: 130000 },
		{ customer: { accountNo: 2848, name: 'Chima Mango' }, ytd: 106000 },
		{ customer: { accountNo: 5949, name: 'Hortense Skyne' }, ytd: 120000 },
		{ customer: { accountNo: 2626, name: 'Wanda Mo' }, ytd: 95000 },
	]
};
var salesMap = {
	// match the elements in the sales array
	'sales[*]': function (salesObj, parentObj, priorObj, ctxt) {
		if (typeof ctxt.totalSales === 'undefined') {
			ctxt.totalSales = 0;
		}
		ctxt.totalSales += salesObj.ytd;
	}
};

var salesResult = j2f.traverse(salesData, salesMap);
console.log('Sales data result = ',salesResult);
