#!/usr/bin/env node

// # JSUS make script
 

/**
 * Module dependencies.
 */

var program = require('commander'),
    os = require('os'),
    fs = require('fs'),
    util = require('util'),
    path = require('path'),
    exec = require('child_process').exec,
    J = require('../jsus.js').JSUS;

var pkg = require('../package.json'),
    version = pkg.version;


var build = require('./build.js').build;

var rootDir = path.resolve(__dirname, '..') + '/';
var buildDir = rootDir + 'build/';

function list(val) {
	return val.split(',');
}

program
  .version(version);

program  
	.command('clean')
	.description('Removes all files from build folder')
	.action(function(){
		J.cleanDir(buildDir);
});
  
program  
	.command('build [options]')
	.description('Creates a custom build of JSUS.js')
	.option('-l, --lib <items>', 'choose libraries to include', list)
	.option('-a, --all', 'full build of JSUS')
	.option('-A, --analyse', 'analyse build')
	.option('-C, --clean', 'clean build directory')
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
		var dockerDir = J.resolveModuleDir('docker');
		var command = dockerDir + 'docker -i ' + rootDir + ' jsus.js lib/ -s true -o ' + rootDir + 'docs/';
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