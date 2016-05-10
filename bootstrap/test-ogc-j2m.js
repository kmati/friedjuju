//var j2m = require('../bin/release/j2m-0.0.1.js');
var j2m = require('../src/json-to-markup/j2m.js');

var obj = {
	molecule: {
		'table.tr.td': 'Hello World!'
	}
};

var obj = {
	molecule: {
		table: {
			tr: {
				td: 'Hello World!'
			}
		}
	}
};
j2m.prettyPrint = true;

var result = j2m.execute(obj);
console.log('The result is:\n' + result);