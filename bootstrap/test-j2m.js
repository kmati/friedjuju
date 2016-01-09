//var j2m = require('../bin/release/j2m-0.0.1.js');
var j2m = require('../src/json-to-markup/j2m.js');

// var obj = {
// 	molecule: {
// 		'@id': 'funmole',
// 		atomicWeight: 2,
// 		name: 'Helium',
// 		type: {
// 			'Period': 1,
// 			'state': 'gas',
// 			'volatility': 'stable'
// 		},
// 		$1uses: {
// 			'balloons': true,
// 			'bouncy houses': false
// 		},
// 		$0uses: ['Industrial', 'Marketing']
// 	}
// };

var obj = {
	'one': 1,
	'zero': 0,
	'goo': 77,
	'foo': 'fant',
	'$3bar': '3',
	'baz': 'bant',

	'widgets': {
		'cars': 1000,
		'trains': 200
	},

	'$2bar': '2',
	'$1bar': '1'
};

j2m.prettyPrint = true;

var result = j2m.execute(obj);
console.log('The result is:\n' + result);