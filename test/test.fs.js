var util = require('util');
    should = require('should'),
    fs = require('fs'),
    path = require('path');
    JSUS = require('./../jsus').JSUS;
    
    
var randomDir = null,
	randomNum = null,
	copyDir = null;
	
describe('FS: ', function(){

	after(function(){
		JSUS.cleanDir(copyDir);
		JSUS.cleanDir(__dirname + '/tmp/');
	});
	

	describe('#deleteIfExists()', function(){
		randomNum = JSUS.randomInt(0, 10000);
		randomDir = __dirname + '/tmp/' + randomNum + "/";
		
		before(function(){
			fs.mkdir(randomDir, 0755, function() {
				fs.writeFile(randomDir + "file", "Hey there!", function(err) {
				    if (err) console.log(err);
				}); 
				fs.writeFile(randomDir + "file1.js", "Hey there!", function(err) {
					if (err) console.log(err);
				});
				fs.writeFile(randomDir + "file2.js", "Hey there!", function(err) {
					if (err) console.log(err);
				});
				fs.writeFile(randomDir + "file3.js", "Hey there!", function(err) {
					if (err) console.log(err);
				}); 
				fs.writeFile(randomDir + "file.txt", "Hey there!", function(err) {
					if (err) console.log(err);
				}); 
			});
			
		});
		
		it('should return TRUE when deleting existing files.', function() {
			var result = JSUS.deleteIfExists(randomDir + "file3.js");
			result.should.be.true;
		});	
		
		it('should unlink existing file from file system.', function() {
			path.existsSync(randomDir + "file3.js").should.be.false;
		});	
		
		it('should return FALSE when deleting not existing files.', function() {
			var result = JSUS.deleteIfExists(randomDir + "file100.js");
			result.should.be.false;
		});	
		
		
	});
    
	describe('#copyFromDir()', function() {
		copyDir = __dirname + '/tmp/' + randomNum + "_copy/";
		before(function() {
			fs.mkdir(copyDir, 0755, function(err) {
				if (err) JSUS.log(err);
			});
		});
		
		it('should return TRUE when no error occurs.', function() {
			var result = JSUS.copyFromDir(randomDir, copyDir, '.js');
			result.should.be.true;
		});	
		
		
		it('should copy only .js files to destination.', function() {
			fs.readdir(copyDir, function(err, files) {
			    var filtered = files.filter(function(file) { return path.extname(file) ===  '.js'; });
			    
			    filtered.length.should.be.eql(2);
			    files.length.should.be.eql(2);
			});
		});	
		
		it('should copy all files to destination.', function() {
			var func = function(){
				fs.readdir(randomDir, function(err, files) {
					files.length.should.be.eql(4);
				});
			};
			JSUS.copyFromDir(randomDir, copyDir, undefined, func);
		});	
		
	});
	
	describe('#cleanDir()', function(){
		it('should return TRUE when no error occurs.', function() {
			var result = JSUS.cleanDir(randomDir, '.js');
			result.should.be.true;
		});	
		
		
		it('should unlink all .js files from the directory.', function() {
			fs.readdir(randomDir, function(err, files) {
			    var filtered = files.filter(function(file) { return path.extname(file) ===  '.js'; });
			    
			    filtered.length.should.be.eql(0);
			});
		});	
		
		it('should unlink all files from the directory.', function() {
			var func = function(){
				fs.readdir(randomDir, function(err, files) {
					files.length.should.be.eql(0);
				});
			};
			JSUS.cleanDir(randomDir, null, func);
		});	
		
	});
});


