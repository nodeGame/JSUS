var util = require('util');
should = require('should'),
fs = require('fs'),
path = require('path');
JSUS = require('./../jsus').JSUS;


var fsTestDir = null,
randomNum = null,
randomSubDir = null,
copyDir = null;

describe('FS: ', function(){

    after(function(){
	if (copyDir) {
	    JSUS.cleanDir(copyDir);
	}
	if (fsTestDir) {
	    JSUS.rmdirSyncRecursive(fsTestDir);
	}
    });


    describe('#deleteIfExists()', function(){

	before(function(){
	    fsTestDir = __dirname + '/tmp_jsus_fs_test/';
	    if (!JSUS.existsSync(fsTestDir)) {
		fs.mkdirSync(fsTestDir, 0755);
	    }

	    randomNum = JSUS.randomInt(0, 1000000);
	    randomSubDir = fsTestDir + randomNum + "/";

	    fs.mkdirSync(randomSubDir, 0755);

	    fs.writeFileSync(randomSubDir + "file", "Hey there!");
	    fs.writeFileSync(randomSubDir + "file1.js", "Hey there!");
	    fs.writeFileSync(randomSubDir + "file2.js", "Hey there!");
	    fs.writeFileSync(randomSubDir + "file3.js", "Hey there!");
	    fs.writeFileSync(randomSubDir + "file.txt", "Hey there!");
	});

	it('should return TRUE when deleting existing files.', function() {
	    var result = JSUS.deleteIfExists(randomSubDir + "file3.js");
	    result.should.be.true;
	});

	it('should unlink existing file from file system.', function() {
	    JSUS.existsSync(randomSubDir + "file3.js").should.be.false;
	});

	it('should return FALSE when deleting not existing files.', function() {
	    var result = JSUS.deleteIfExists(randomSubDir + "file100.js");
	    result.should.be.false;
	});


    });

    describe('#copyFromDir()', function() {

	before(function() {
	    copyDir = fsTestDir + randomNum + "_copy/";
	    fs.mkdirSync(copyDir, 0755);
	});

	it('should return TRUE when no error occurs.', function(done) {
	    var result = JSUS.copyFromDir(randomSubDir, copyDir, '.js', function() {
                done();
            });
	    result.should.be.true;
	});


	it('should copy only .js files to destination.', function(done) {
	    fs.readdir(copyDir, function(err, files) {
		var filtered = files.filter(function(file) { return path.extname(file) ===  '.js'; });

		filtered.length.should.be.eql(2);
		files.length.should.be.eql(2);
                done();
	    });
	});

	it('should copy all files to destination.', function(done) {
	    var func = function(){
		fs.readdir(randomSubDir, function(err, files) {
		    files.length.should.be.eql(4);
                    done();
		});
	    };
	    JSUS.copyFromDir(randomSubDir, copyDir, undefined, func);
	});

    });

    describe('#cleanDir()', function(){
	it('should return TRUE when no error occurs.', function(done) {
	    var result = JSUS.cleanDir(randomSubDir, '.js', function() {
                done();
            });
	    result.should.be.true;
	});


	it('should unlink all .js files from the directory.', function(done) {
	    fs.readdir(randomSubDir, function(err, files) {
		var filtered = files.filter(function(file) { return path.extname(file) ===  '.js'; });
		filtered.length.should.be.eql(0);
                done();
	    });
	});

	it('should unlink all files from the directory.', function(done) {
	    var func = function() {
		fs.readdir(randomSubDir, function(err, files) {
		    files.length.should.be.eql(0);
                    done();
		});
	    };
	    JSUS.cleanDir(randomSubDir, null, func);
	});

    });
});
