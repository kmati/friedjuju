var ep = require('../src/expression-parser/ep.js');

// Expressions that work:
// table
// table.$29tr.@class


//var tokenTable = ep.parseExtended('table[@class=some-class][0].$1tr');
var tokenTable = ep.parseExtended('x[@class=far]');
console.log('tokenTable = ' + JSON.stringify(tokenTable, undefined, 2));
