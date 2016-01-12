//var j2m = require('../bin/release/j2m-0.0.1.js');
var j2m = require('../src/json-to-markup/j2m.js');

var obj = {
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

j2m.prettyPrint = true;

var result = j2m.execute(obj);
console.log('The result is:\n' + result);