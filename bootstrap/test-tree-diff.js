var j2m = require('../src/json-to-markup/j2m.js');

var objOld = {
	table: {
		'@id': 'mytable',
		$0tr: {
			td: ['Col1', 'Col2']
		},
		$1tr: {
			td: ['Joe', 23]
		}
	}
};

var objNew = {
	table: {
		'@id': 'my-table',
		'@class': 'main-table',
		tr: {
			td: ['Col1']
		},
		$1tr: {
			td: ['Joe', 23]
		},
		$2tr: {
			td: ['Sally', 37]
		}
	}
};

var oldRootEle = j2m.generateElement(objOld);
var newRootEle = j2m.generateElement(objNew);

console.log('oldRootEle = ' + j2m.getMarkupFromElement(oldRootEle));
console.log('newRootEle = ' + j2m.getMarkupFromElement(newRootEle));


var treeDiff = require('../src/vdom/treeDiff.js');
var diffs = treeDiff.diff(oldRootEle, newRootEle);
console.log('diffs = ' + JSON.stringify(diffs, undefined, 2));

var domWriter = require('../src/vdom/domWriter.js');

var domElement = document.createElement('div');
domElement.innerHTML = j2m.getMarkupFromElement(oldRootEle);
console.log('Before | domElement = ' + domElement.innerHTML);

domWriter.writeDiffsToDOMElement(diffs, domElement);
console.log('After | domElement = ' + domElement.innerHTML);
