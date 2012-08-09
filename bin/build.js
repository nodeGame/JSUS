// # JSUS build script
 
// Export build
module.exports.build = buildIt;

// Dependencies
var	smoosh = require('smoosh'),
	fs = require('fs'),
    path = require('path'),
    pkg = require('../package.json'),
    J = require('../jsus.js').JSUS,
    version = pkg.version;



function buildIt(options) {
		
	var out = options.output || "jsus";
	
	if (path.extname(out) === '.js') {
		out = path.basename(out, '.js');
	}

	console.log('Building JSUS v.' + version + ' with:');
	
	// Defining variables	
	var rootDir = __dirname + '/../';
	var libDir = rootDir + 'lib/';
	var distDir =  rootDir + 'build/';
	
	var jsus_libs = {};
	var files = fs.readdirSync(libDir);
	for (var i in files) {
		if (path.extname(files[i]) === '.js') {
			var name = path.basename(files[i], '.js').toLowerCase();
			jsus_libs[name] = libDir + files[i];
		}
	}
	
	var files = [rootDir + 'jsus.js'];

	console.log('  - JSUS core');
	
	if (options.all) {
		files = files.concat(J.obj2Array(jsus_libs));
		console.log('  - JSUS lib: all available libs included');
	}
	else { 
		var selected = options.lib;
		for (var i in selected) {
			if (selected.hasOwnProperty(i)) {
				if (!('string' === typeof selected[i])) continue;
				var name = selected[i].toLowerCase();
				if (jsus_libs[name]) {
					files.push(jsus_libs[name]);
					console.log('  - JSUS lib: ' + selected[i]);
				}
				else {
					console.log('  - ERR: JSUS lib not found: ' + name);
				}
			}
		}
	}
	
	console.log("\n");
	
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
	    var smooshed = smoosh
	    	.config(config) // hand over configurations made above
	    	// .clean() // removes all files out of the nodegame folder
	    	.build(); // builds both uncompressed and compressed files
	        
    	if (options.analyse) {
    		smooshed.run() // runs jshint on full build
    		smooshed.analyze(); // analyzes everything
    	}

        console.log('JSUS build created');
	}
	
	run_it();
}