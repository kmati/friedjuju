/*
 * This script is used to build all the buildable files.
 */
var child_process = require('child_process'),
	path = require('path');

function showUsage() {
	console.log('Usage:');
	console.log('node ' + process.argv[1] + ' -target {debug|release|all}');
}

if (process.argv.length < 2) {
	showUsage();
	return;
}

var target;
for (var c = 2; c < process.argv.length; c += 2) {
	var key = process.argv[c],
		val = process.argv[c + 1];
	if (key === '-target') {
		target = val.trim().toLowerCase();
	}
}

if (target !== 'release' && target !== 'debug' && target !== 'all') {
	showUsage();
	return;
}

console.log('*****************************************************');
console.log('*                                                   *');
console.log('*    build-all: The builder for j2m, j2j and j2f    *');
console.log('*           Copyright (c) 2016 Kimanzi Mati         *');
console.log('*                      MIT License                  *');
console.log('*                                                   *');
console.log('*****************************************************');

['./build-j2j.js', './build-j2m.js', './build-j2f.js'].forEach(function (modPath) {
	//modPath = path.join(__dirname, modPath);

	var proc = child_process.fork(modPath, ['-target', target], { cwd: __dirname });
	proc.on('close', function (code) {
		console.log(modPath + ' ended with code: ' + code);
	});
});
