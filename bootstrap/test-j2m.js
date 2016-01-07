var j2m = require('../src/json-to-markup/j2m.js');

var obj = {
	molecule: {
		atomicWeight: 2,
		name: 'Helium',
		type: {
			'Period': 1,
			'state': 'gas',
			'volatility': 'stable'
		}
	}
};

var result = j2m.execute(obj);
console.log('The result is:\n' + result);