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


var countAddresses = 0;
var counterMap = {
	'people.address': function (obj) { countAddresses++; }
};
j2f.traverse(rootObj, counterMap);
console.log('We found ' + countAddresses + ' addresses');
