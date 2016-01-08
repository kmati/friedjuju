var j2m = require('../bin/release/j2m-0.0.1.js');
//var j2m = require('../src/json-to-markup/j2m.js');
console.log('j2m = ',j2m);

var obj = {
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
			'bouncy houses': false
		},
		$0uses: ['Industrial', 'Marketing']
	}
};

var result = j2m.execute(obj);
console.log('The result is:\n' + result);