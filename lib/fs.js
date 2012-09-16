/**
 * # FS
 *  
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed
 * 
 * Collection of static functions related to the generation of 
 * pseudo-random numbers
 * 
 */


(function (JSUS) {

if (!JSUS.isNodeJS()){
	JSUS.log('Cannot load JSUS.FS outside of Node.JS.')
	return false;
}

var resolve = require('resolve'),
	path = require('path'),
	fs = require('fs');

function FS(){};

/**
 * ## FS.resolveModuleDir
 * 
 * Resolves the root directory of a module
 * 
 * Npm does not install a dependency if the same module
 * is available in a parent folder. This method returns
 * the full path of the root directory of the specified
 * module.
 * 
 * Trailing slash is added.
 * 
 * @param {string} module The name of the module
 * @return {string} The path of the root directory of the module
 * 
 */
FS.resolveModuleDir = function(module) {
	if (!module) return false;

	var str = resolve.sync(module);
	var stop = str.indexOf(module) + module.length;
	return str.substr(0, stop) + '/';
};

/**
 * ## FS.deleteIfExists
 * 
 * Deletes a file or directory
 * 
 * Returns false if the file does not exist.
 * 
 * @param {string} file The path to the file or directory
 * @return {boolean} TRUE, if operation was succesfull
 * 
 * @see FS.cleanDir
 */
FS.deleteIfExists = function(file) {
	file = file || filename;
	if (path.existsSync(file)) {
		return false;
	}
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
	return true;
		
};

/**
 * ## FS.cleanDir
 * 
 * Removes all files from a target directory
 * 
 * It is possible to specify an extension as second parameter.
 * In such case, only file with that extension will be removed.
 * 
 * @param {string} dir The directory to clean
 * @param {string} ext Optional. If set, only files with this extension will be removed
 * @return {boolean} TRUE, if the operation is successful
 * 
 * @see FS.deleteIfExists
 */
FS.cleanDir = function(dir, ext) {
	if (!dir) {
		JSUS.log('You must specify a directory to clean.');
		return false;
	}
	var filterFunc = (ext) ? function(file) { return path.extname(file) ===  ext; }
						   : function(file) { return true; };
	
	
	if (dir[dir.length] !== '/') dir = dir + '/';
	fs.readdir(dir, function(err, files) {
	    files.filter(filterFunc)
	         .forEach(function(file) { deleteIfExist(dir + file); });
	    
	    return true;
	});
};

/**
 * ## FS.copyFromDir
 * 
 * Copies all files from a source directory to a destination 
 * directory.
 * 
 * It is possible to specify an extension as second parameter.
 * In such case, only file with that extension will be copied.
 * 
 * @param {string} dirIn The source directory
 * @param {string} dirOut The destination directory
 * @param {string} ext Optional. If set, only files with this extension will be copied
 * @return {boolean} TRUE, if the operation is successful
 * 
 * @see FS.copyFile
 */
FS.copyFromDirectory = function(dirIn, dirOut, ext) {
	if (!dirIn) {
		JSUS.log('You must specify a source directory');
		return false;
	}
	if (!dirOut) {
		JSUS.log('You must specify a destination directory');
		return false;
	}
	
	fs.readdir(dirIn, function(err, files){
		if (err) {
			JSUS.log(err);
			throw new Error;
		}
		for (var i in files) {
			if (ext && path.extname(files[i]) === ext) {
				copyFile(dirIn + files[i], dirOut + files[i]);
			}
		}
	});
};

/**
 * ## FS.copyFile
 * 
 * Copies a file into another path
 * 
 * @param {string} srcFile The source file
 * @param {string} destFile The destination file
 * @param {function} cb Optional. If set, the callback will be executed upon success
 * @return {boolean} TRUE, if the operation is successful
 * 
 * @see https://github.com/jprichardson/node-fs-extra/blob/master/lib/copy.js
 */
var copyFile = function(srcFile, destFile, cb) {
	//console.log('from ' + srcFile + ' to ' + destFile);
    var fdr, fdw;
    fdr = fs.createReadStream(srcFile);
    fdw = fs.createWriteStream(destFile);
    fdr.on('end', function() {
    	if (cb) return cb(null);
    });
    return fdr.pipe(fdw);
};

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);