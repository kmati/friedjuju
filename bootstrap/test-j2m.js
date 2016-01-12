var j2m = require('../bin/release/j2m-0.0.1.js');
//var j2m = require('../src/json-to-markup/j2m.js');

var obj = {
	'table.$1tr.td': 'Hello World!',
	'table.$0tr.td': 'Message:',
	'foo.bar': 'Bye World!',
	molecule: {
		'@id': 'funmole',
		atomicWeight: 2,
		name: 'Helium',
		'type.Period': 1,
		'type.state': 'gas',
		'type.volatility': 'stable',
		$1uses: {
			'balloons': true,
			'bouncyHouses': false
		},
		'@class': 'some-class',
		$0uses: ['Industrial', 'Marketing']
	},
	'math.pi': 3.14
};

j2m.prettyPrint = true;

var result = j2m.execute(obj);
console.log('The result is:\n' + result);