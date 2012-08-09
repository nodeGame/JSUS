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
    pkg = require('../package.json'),
    version = pkg.version;



var build = require('./build.js').build;

var buildDir =  __dirname + '/../build/';

var deleteIfExist = function(file) {
	file = file || filename;
	if (path.existsSync(file)) {
		var stats = fs.lstatSync(file);
		if (stats.isDirectory()) {
			fs.rmdir(file, function (err) {
				if (err) throw err;  
			});
		}
		else {
			fs.unlink(file, function (err) {
				if (err) throw err;  
			});
		}
		
	}
};

var cleanBuildDir = function(dir, ext) {
	ext = ext || '.js';
	dir = dir || buildDir;
	if (dir[dir.length] !== '/') dir = dir + '/';
	fs.readdir(dir, function(err, files) {
	    files.filter(function(file) { return path.extname(file) ===  ext; })
	         .forEach(function(file) { deleteIfExist(dir + file); });
	    
	    console.log('Build directory cleaned');
	});
}

function list(val) {
	return val.split(',');
}

program
  .version(version);

program  
	.command('clean')
	.description('Removes all files from build folder')
	.action(function(){
		cleanBuildDir();
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