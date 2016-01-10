var ep = require('../src/expression-parser/ep.js');

// Expressions that work:
// table

var tokenTable = ep.parseExtended('table.$29tr.@class');
console.log('tokenTable = ' + JSON.stringify(tokenTable, undefined, 2));
