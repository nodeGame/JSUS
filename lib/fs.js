/**
 * # FS
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Collection of static functions related to file system operations.
 *
 * @see http://nodejs.org/api/fs.html
 * @see https://github.com/ryanmcgrath/wrench-js
 * @see https://github.com/substack/node-resolve
 * ---
 */
(function(JSUS) {

    if (!JSUS.isNodeJS()){
        JSUS.log('Cannot load JSUS.FS outside of Node.JS.')
        return false;
    }

    var resolve = require('resolve'),
    path = require('path'),
    fs = require('fs'),
    wrench = require('wrench');


    function FS(){};

    /**
     * ## FS.resolveModuleDir
     *
     * Backward-compatible version of fs.existsSync
     */
    FS.existsSync = ('undefined' === typeof fs.existsSync) ?
        path.existsSync : fs.existsSync;


    /**
     * ## FS.resolveModuleDir
     *
     * Resolves the root directory of a module
     *
     * Npm does not install a dependency if the same module
     * is available in a parent folder. This method returns
     * the full path of the root directory of the specified
     * module as installed by npm.
     *
     * Trailing slash is added.
     *
     * @param {string} module The name of the module
     * @param {string} basedir Optional The basedir from which starting searching
     * @return {string} The path of the root directory of the module
     *
     * @see https://github.com/substack/node-resolve
     */
    FS.resolveModuleDir = function(module, basedir) {
        var str, stop;
        if (!module) return false;

        str = resolve.sync(module, {basedir: basedir || __dirname});
        stop = str.indexOf(module) + module.length;
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
     * @return {boolean} TRUE, if operation is succesfull
     *
     * @see FS.cleanDir
     */
    FS.deleteIfExists = function(file) {
        if (!FS.existsSync(file)) {
            return false;
        }
        var stats = fs.lstatSync(file);
        if (stats.isDirectory()) {
            fs.rmdir(file, function(err) {
                if (err) throw err;
            });
        }
        else {
            fs.unlink(file, function(err) {
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
     * The '.' (dot) must be included as part of the extension.
     *
     *
     * @param {string} dir The directory to clean
     * @param {string} ext Optional. If set, only files with this extension
     *   will be removed
     * @param {function} cb Optional. A callback function to call if
     *   no error is raised
     *
     * @return {boolean} TRUE, if the operation is successful
     *
     * @see FS.deleteIfExists
     */
    FS.cleanDir = function(dir, ext, cb) {
        var fileterFunc;
        if (!dir) {
            JSUS.log('You must specify a directory to clean.');
            return false;
        }
        if (ext) {
            filterFunc = function(file) {
                return path.extname(file) ===  ext;
            };
        }
        else {
            filterFunc = function(file) {
                return true;
            };
        }

        if (dir[dir.length] !== '/') dir = dir + '/';

        fs.readdir(dir, function(err, files) {
            if (err) {
                JSUS.log(err);
                return false;
            }

            files.filter(filterFunc)
                .forEach(function(file) {
                    JSUS.deleteIfExists(dir + file);
                });

            if (cb) return cb(null);

        });


        return true;
    };

    /**
     * ## FS.copyFromDir
     *
     * Copies all files from a source directory to a destination
     * directory.
     *
     * It is possible to specify an extension as second parameter (e.g. '.js').
     * In such case, only file with that extension will be copied.
     *
     * Warning! If an extension filter is not specified, and if subdirectories
     * are found, an error will occur.
     *
     * @param {string} dirIn The source directory
     * @param {string} dirOut The destination directory
     * @param {string} ext Optional. If set, only files with this extension
     *   will be copied
     * @param {function} cb Optional. A callback function to call if
     *   no error is raised
     *
     * @return {boolean} TRUE, if the operation is successful
     *
     * @see FS.copyFile
     */
    FS.copyFromDir = function(dirIn, dirOut, ext, cb) {
        if (!dirIn) {
            JSUS.log('You must specify a source directory');
            return false;
        }
        if (!dirOut) {
            JSUS.log('You must specify a destination directory');
            return false;
        }

        dirOut = path.resolve(dirOut) + '/';
        var i, dir, dirs = [dirIn, dirOut];
        for (i=0; i < 2; i++) {
            dir = dirs[i];
            if (!FS.existsSync(dir)) {
                console.log(dir + ' does not exist');
                return false;
            }

            var stats = fs.lstatSync(dir);
            if (!stats.isDirectory()) {
                console.log(dir + ' is not a directory');
                return false;
            }
        }

        fs.readdir(dirIn, function(err, files){
            if (err) {
                JSUS.log(err);
                throw new Error;
            }
            for (var i in files) {
                if (ext && path.extname(files[i]) !== ext) {
                    continue;
                }
                copyFile(dirIn + files[i], dirOut + files[i]);
            }

            if (cb) return cb(null);
        });

        return true;
    };

    /**
     * ## copyFile
     *
     * Copies a file into another path
     *
     * @param {string} srcFile The source file
     * @param {string} destFile The destination file
     * @param {function} cb Optional. If set, the callback will be executed
     *   upon success
     * @param {function} cb Optional. A callback function to call if
     *   no error is raised
     *
     * @return {boolean} TRUE, if the operation is successful
     *
     * @see https://github.com/jprichardson/node-fs-extra/blob/master/lib/copy.js
     */
    var copyFile = function(srcFile, destFile, cb) {
        var fdr, fdw;
        fdr = fs.createReadStream(srcFile);
        fdw = fs.createWriteStream(destFile);
        fdr.on('end', function() {
            if (cb) return cb(null);
        });
        return fdr.pipe(fdw);
    };

    /**
      *  ## wrench
      *
      * FS exposes the properties of the great package wrench for
      * performing recursive operations on directories
      *
      * @see https://github.com/ryanmcgrath/wrench-js
      */
    (function() {
        for (var w in wrench) {
            if (wrench.hasOwnProperty(w)) {
                FS[w] = wrench[w];
            }
        }
    })();

    JSUS.extend(FS);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);