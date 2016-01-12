var ep = require('../src/expression-parser/ep.js');

// Expressions that work:
// table
// table.$29tr.@class
// x[@class=far]
// x[@class=far][0]
// x[@class=far][0].car
// x[@class=far][0].$4car


var tokenTable = ep.parseExtended('*.*.foo[@bar]');
//var tokenTable = ep.parseExtended('table[@class=some-class][0].$1tr');
//var tokenTable = ep.parseExtended('x[@class=far][0].$4car');
console.log('tokenTable = ' + JSON.stringify(tokenTable, undefined, 2));
