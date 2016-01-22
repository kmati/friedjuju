/*
 * This script tests the stripped down markup parser.
 */
var strippedDownMarkupParser = require('../src/vdom/strippedDownMarkupParser.js');

//var rootEle = strippedDownMarkupParser.parse('<table class="my-tables" style="display: inline-table; color: red"><tr><td>Col1</td><td>Col2</td></tr></table>');
var rootEle = strippedDownMarkupParser.parse('<nop><LI><INPUT type="text" value="A"></INPUT></LI></nop>');
console.log('rootEle = ' + JSON.stringify(rootEle, undefined, 2));
