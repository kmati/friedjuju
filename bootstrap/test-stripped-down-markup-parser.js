/*
 * This script tests the stripped down markup parser.
 */
var strippedDownMarkupParser = require('../src/vdom/strippedDownMarkupParser.js');

var rootEle = strippedDownMarkupParser.parse('<table class="my-tables" style="display: inline-table; color: red"><tr><td>Col1</td><td>Col2</td></tr></table>');
console.log('rootEle = ' + JSON.stringify(rootEle, undefined, 2));
