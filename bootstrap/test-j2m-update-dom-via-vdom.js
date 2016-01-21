/*
 * This script tests the ability of j2m to update changes to a view in a DOM element.
 */
//var j2m = require('../bin/release/j2m-0.0.1.js');
var j2m = require('../src/json-to-markup/j2m.js');

var obj = {
	table: {
		tr: [
			{ th: ["Species", "Sizes"] },
			{ td: ["Dog", "small"] },
			{ td: ["Catty", "small"], "$0td.@style": "color: red; background-color: #aad" },
			{ td: ["Gorilla", "large"] },
			{ td: ["Human", "large"] }
		]
	}
};

j2m.prettyPrint = true;

var result = j2m.execute(obj);
console.log('The result is:\n' + result);

// set the DOM element with the generated markup string
require('../src/vdom/document-shim.js');
var domElement = document.createElement('div');
document.body.appendChild(domElement);
domElement.innerHTML = result;
console.log('Before | domElement = ' + domElement.innerHTML);


// After this section we're testing the update to the DOM
var objNew = {
	table: {
		tr: [
			{ th: ["Species", "Sizes"] },
			{ td: ["Dog", "small to medium"] },
			{ td: ["Cat", "small"], "$0td.@style": "color: green; background-color: #aad" },
			{ td: ["Gorilla", "large"] }
		]
	}
};
j2m.updateDOM(objNew, domElement);
console.log('After | domElement = ' + domElement.innerHTML);
