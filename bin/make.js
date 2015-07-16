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

var rootDir = path.resolve(__dirname, '..') + '/',
buildDir = rootDir + 'build/',
libDir = rootDir + 'lib/';

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
    .action(function() {
        var dockerDir, command, child;
        console.log('Building documentation for JSUS v.' + version);
        try {
            dockerDir = J.resolveModuleDir('docker', rootDir);
        }
        catch(e) {
            console.log('module Docker not found. Cannot build doc. ' +
                        'Do \'npm install docker\' to install it.');
            return false;
        }
        command = dockerDir + 'docker -i ' + rootDir +
            ' jsus.js lib/ -s true -o ' + rootDir + 'docs/ -u';
        child = exec(command, function (error, stdout, stderr) {
            if (stdout) console.log(stdout);
            if (stderr) console.log(stderr);
            if (error !== null) {
                console.log('build error: ' + error);
            }
        });

    });


program
    .command('sync <path>')
    .description('Sync the lib folder with the specified target ' +
                 'directory (must exists)')
    .action(function(path) {

        J.copyFromDir(libDir, path);

        console.log('Done.');

    });

// Parsing options
program.parse(process.argv);
