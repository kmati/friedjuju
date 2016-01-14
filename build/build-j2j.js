/*
 * This node.js script is used to build the j2j.
 */
var fs = require('fs'),
	path = require('path'),
	child_process = require('child_process'),
	uglifyjs = require('uglify-js');

var pkg = require('../package.json');
var version = pkg.version;

var utils = require('./utils.js');

function createBuilder() {
	// callback: void function (err)
	function copyReleaseToExamples(ctxt, callback) {
		var exampleBundlePath =  path.join(__dirname, '../examples/public/j2j-' + version + '.js');
		fs.readFile(ctxt.bundlePath, { encoding: 'utf8' }, function (err, content) {
			if (err) {
				callback(err);
				return;
			}

			fs.writeFile(exampleBundlePath, content, callback);
		});
	}

	// Uglifies a string
	// content: The string to uglify
	// Returns: The uglified string
	function uglifyString(content) {
		var ast = uglifyjs.parse(content);
		ast.figure_out_scope();
		var compressor = uglifyjs.Compressor();
		ast = ast.transform(compressor);
		ast.figure_out_scope();
		ast.compute_char_frequency();
		ast.mangle_names();
		return ast.print_to_string();
	}

	// callback: void function (err)
	function minify(ctxt, callback) {
		fs.readFile(ctxt.bundlePath, { encoding: 'utf8' }, function (err, content) {
			if (err) {
				callback(err);
				return;
			}

			var ugly = uglifyString(content);
			fs.writeFile(ctxt.bundlePath, ugly, callback);
		});
	}

	// Invoked at the end of combineSrc to add the module.exports line at the end of the browserified code.
	// This way we can simply use the browserified code in a node.js script.
	// callback: void function (err)
	function moduleExportationAddition(ctxt, callback) {
		fs.readFile(ctxt.bundlePath, { encoding: 'utf8' }, function (err, content) {
			if (err) {
				callback(err);
				return;
			}

			content += '\nif (typeof module !== \'undefined\') {' +
				'\n\t// node.js export (if we\'re using node.js)' +
				'\n\tmodule.exports = window.j2j;' +
			'\n}\n';
			fs.writeFile(ctxt.bundlePath, content, callback);
		});
	}

	// callback: void function (err)
	function combineSrc(ctxt, callback) {
		// Execute this command line:
		// browserify src/json-to-json/j2j.js -o {target directory}/j2j-{version}.js
		var bundlePath =  path.join(ctxt.binDir, 'j2j-' + version + '.js');

		var cmdLine = "browserify \"" + ctxt.srcMainPath + "\" -o \"" + bundlePath + "\"";
	    child_process.exec(cmdLine, function (error, output, stderr) {
	        if (error) {
	            callback(error);
	            return;
	        }

	        if (stderr) {
	        	callback(stderr);
	        	return;
	        }

	        ctxt.bundlePath = bundlePath;

	        moduleExportationAddition(ctxt, callback);
	    });
	}

	// callback: void function (err)
	function mkdirTarget(ctxt, callback) {
		try {
			utils.mkdirp(ctxt.binDir);
			ctxt.binDirCreated = true;
			callback();
		} catch (e) {
			callback(e);
		}
	}

	var buildServices = {
		debug: [
			mkdirTarget,
			combineSrc
		],

		release: [
			mkdirTarget,
			combineSrc,
			minify,
			copyReleaseToExamples
		]
	};

	function executeServices(target, services, callback) {
		var ctxt = {
			srcDir: path.join(__dirname, '../src/json-to-json'),
			binDir: path.join(__dirname, '..', 'bin', target)
		};
		ctxt.srcMainPath = path.join(ctxt.srcDir, 'j2j.js');
		
		var index = -1;
		function onDone(err) {
			if (err) {
				callback(err);
				return;
			}

			index++;
			if (index >= services.length) {
				console.log('Build output directory: ' + ctxt.binDir);
				callback();
				return;
			}

			var fnService = services[index];
			fnService(ctxt, onDone);
		}

		onDone();
	}

	return {
		build: function (target, callback) {
			console.log('Building target: ' + target);
			var services = buildServices[target];
			executeServices(target, services, callback);
		}
	};
}

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

console.log('****************************************');
console.log('*                                      *');
console.log('*    build-j2j: The builder for j2j    *');
console.log('*   Copyright (c) 2016 Kimanzi Mati    *');
console.log('*              MIT License             *');
console.log('*                                      *');
console.log('****************************************');

var builder = createBuilder();

function allDone(err) {
	if (err) {
		console.error(err);
	} else {
		//console.log('Build Completed');
	}
}

if (target === 'all') {
	builder.build('debug', function (err) {
		if (err) {
			allDone(err);
			return;
		}

		builder.build('release', allDone);
	});
} else {
	builder.build(target, allDone);
}

