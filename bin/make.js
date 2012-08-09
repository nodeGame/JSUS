#!/usr/bin/env node

// # JSUS make script
 

/**
 * Module dependencies.
 */

var program = require('commander'),
    os = require('os'),
    util = require('util'),
    exec = require('child_process').exec,
    pkg = require('../package.json'),
    version = pkg.version;



var build = require('./build.js').build;

function list(val) {
	return val.split(',');
}

program
	.version(version);
  
program  
	.command('build [options]')
	.description('Creates a custom build of JSUS.js')
	.option('-l, --lib <items>', 'choose libraries to include', list)
	.option('-A, --analyse', 'analyse build')
	.option('-a, --all', 'full build of JSUS')
	.option('-o, --output <file>')
	.action(function(env, options){
		build(options);
	});
   
program
	.command('doc')
	.description('Build documentation files')
	.action(function(){
		console.log('Building documentation for JSUS v.' + version);
		// http://nodejs.org/api.html#_child_processes
		var root =  __dirname + '/../';
		var command = root + 'node_modules/.bin/docker -i ' + root + ' jsus.js lib/ -s true -o ' + root + 'docs/';
		var child = exec(command, function (error, stdout, stderr) {
			util.print(stdout);
			util.print(stderr);
			if (error !== null) {
				console.log('build error: ' + error);
			}
		});

	});

	
// Parsing options
program.parse(process.argv);