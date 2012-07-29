var	smoosh = require('smoosh'),
	fs = require('fs'),
    path = require('path'),
    pkg = require('../package.json'),
    J = require('../jsus.js').JSUS,
    version = pkg.version;


module.exports.build = buildIt;

function buildIt(options) {
	
//	console.log('oo')
//	console.log()
//	console.log('oo')
//dde
	
	var out = options[options.length-1].output || "jsus";
	
	if (path.extname(out) === '.js') {
		out = path.basename(out, '.js');
	}

	console.log('Building JSUS v.' + version + ' with:');
	
	// Defining variables
	
	var re = new RegExp('node_modules.+');
	
	var rootDir = __dirname + '/../';
	var libDir = rootDir + 'lib/'
	var distDir =  rootDir + 'build/';
	
	var jsus_libs = {};
	var files = fs.readdirSync(libDir);
	for (var i in files) {
		if (path.extname(files[i]) === '.js') {
			var name = path.basename(files[i], '.js').toLowerCase();
			jsus_libs[name] = libDir + files[i];
		}
	}
	
	var files = [];

	if (options.length === 1) {
		files = J.obj2Array(jsus_libs);
	}
	else { 
		var selected = options;
		for (var i in selected) {
			if (selected.hasOwnProperty(i)) {
				if (!('string' === typeof selected[i])) continue;
//				console.log(selected[i])
				var name = selected[i].toLowerCase();
				if (jsus_libs[name]) {
					files.push(jsus_libs[name]);
				}
			}
		}
	}
	

	
	console.log('Adding ' + files.length + ' files');
	
	// Configurations for file smooshing.
	var config = {
	    // VERSION : "0.0.1",
	    
	    // Use JSHINT to spot code irregularities.
	    JSHINT_OPTS: {
	        boss: true,
	        forin: true,
	        browser: true,
	    },
	    
	    JAVASCRIPT: {
	        DIST_DIR: '/' + distDir,
	    }
	};
	
	config.JAVASCRIPT[out] = files;
	
	var run_it = function(){
	    // Smooshing callback chain
	    // More information on how it behaves can be found in the smoosh Readme https://github.com/fat/smoosh
	    smoosh
	        .config(config) // hand over configurations made above
	        // .clean() // removes all files out of the nodegame folder
	        .run() // runs jshint on full build
	        .build() // builds both uncompressed and compressed files
	        .analyze(); // analyzes everything
	
	    console.log('JSUS build created');
	}
	
	run_it();
}