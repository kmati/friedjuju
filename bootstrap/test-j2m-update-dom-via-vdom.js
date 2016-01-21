/*
 * This script tests the ability of j2m to update changes to a view in a DOM element.
 */
//var j2m = require('../bin/release/j2m-0.0.1.js');
var j2m = require('../src/json-to-markup/j2m.js');

var obj = {
	"$1table.$0tr.th": ["Species", "Sizes"],
	"$1table.$1tr.td": ["Dog", "small"],
	"$1table.$2tr.td": ["Catty", "small"],
	"$1table.$3tr.td": ["Gorilla", "large"],
	"$1table.$4tr.td": ["Human", "large"],
	"$1table.$2tr.$0td.@style": "color: red; background-color: #aad"
};

j2m.prettyPrint = true;

var result = j2m.execute(obj);
console.log('The result is:\n' + result);

// set the DOM element with the generated markup string
require('../src/vdom/document-shim.js');
var domElement = document.createElement('div');
domElement.innerHTML = result;
console.log('Before | domElement = ' + domElement.innerHTML);


// After this section we're testing the update to the DOM
var objNew = {
	"$1table.$0tr.th": ["Species", "Sizes"],
	"$1table.$1tr.td": ["Dog", "small to medium"],
	"$1table.$2tr.td": ["Cat", "small"],
	"$1table.$3tr.td": ["Gorilla", "large"],
	"$1table.$2tr.$0td.@style": "color: green; background-color: #aad"
};
j2m.updateDOM(objNew, domElement);
console.log('After | domElement = ' + domElement.innerHTML);
