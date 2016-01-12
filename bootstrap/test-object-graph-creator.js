/*
 * This script tests out object creation based on a dot expression (Usage 1)
 */
var objectGraphCreator = require('../src/json-to-markup/objectGraphCreator');

// // 'table.$1tr.td.@colspan': 2
// var expr = 'table.$1tr.td.@colspan';
// var obj = {};

// objectGraphCreator.create(expr, obj);
// console.log('obj = ' + JSON.stringify(obj, undefined, 2));


// var obj2 = {
// 	'table.$1tr.td.@colspan': 2,
// 	mole: {
// 		x: 4
// 	}
// };

var obj2 = {
	'table.tr.td': 'Hello World!',
	'foo.bar': 'Bye World!',
	molecule: {
		'@id': 'funmole',
		atomicWeight: 2,
		name: 'Helium',
		type: {
			'Period': 1,
			'state': 'gas',
			'volatility': 'stable'
		},
		$1uses: {
			'balloons': true,
			'bouncyHouses': false
		},
		'@class': 'some-class',
		$0uses: ['Industrial', 'Marketing']
	},
};

for (var key in obj2) {
	console.log('key => ' + key);
}

console.log('Before | obj2 = ' + JSON.stringify(obj2, undefined, 2));
var result = objectGraphCreator.expand(obj2);
console.log('After | obj2 = ' + JSON.stringify(obj2, undefined, 2));
console.log('After | result = ' + JSON.stringify(result, undefined, 2));
