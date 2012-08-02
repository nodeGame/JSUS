#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander'),
    os = require('os'),
    util = require('util'),
    exec = require('child_process').exec,
    pkg = require('../package.json'),
    version = pkg.version;



var build = require('./build.jsus.js').build;

program
	.version(version)
  
program  
	.command('build')
	.description('Creates a custom build of JSUS.js')
	.option('-o, --output <file>')
	.action(function(){
		build(arguments);
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