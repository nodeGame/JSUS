#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander'),
    os = require('os')
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
	  //console.log(arguments[arguments.length-1])
	  build(arguments);
	});
   
//program
//	.command('build-doc')
//	.description('Build documentation files')
//	.action(function(){
//	  //console.log(arguments[arguments.length-1])
//	  //build(arguments);
//	});

	
// Parsing options
program.parse(process.argv);