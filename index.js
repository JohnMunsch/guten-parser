const fs = require('fs');
const async = require('async');
const _ = require('lodash');
const bunyan = require('bunyan');
const wordcount = require('word-count');

const txtParser = require('./lib/txt-parser.js');
const rdfParser = require('./lib/rdf-parser.js');




var log = bunyan.createLogger({
name: 'gutenParser',
streams: [
  {
    level: 'info',
    path: './logs/guten-parser.log',  // log ERROR and above to a file
    type: 'rotating-file',
    count: 3,
    period: '1d'
  },
  {
    level: 'error',
    path: './logs/guten-parser-error.log',  // log ERROR and above to a file
    stream: process.stdout,
    type: 'rotating-file',
    count: 3,
    period: '1d'
  }
]});

var basePath = './books/';
var jsonBasePath = './json/';

log.info( 'hello' );



var rdfPath = function(basePath,item){
	return basePath+item+'/pg'+item+'.rdf';
}
var txtPath = function(basePath,item){
	return basePath+item+'/pg'+item+'.txt.utf8';
}

var item = 30;
//txtParser.clean('./books/'+item+'/pg'+item+'.txt.utf8', function(err, data){console.log(data)});

var errors = [];


var getData = function(item, callback){
	async.parallel({
		    metadata: function(cb){
		    	rdfParser.getMeta(rdfPath(basePath, item), cb);
		    },
		    text: function(cb){
		    	txtParser.clean(txtPath(basePath, item), cb);
		    }
	},
	function(err, result) {
	    return callback(err, result);
	});

}

var saveFile = function(item, callback){
	async.auto({
	  writeData: function(cb, results){

  	  	var json = item.metadata;	//flatten a bit
  	  	json.wordcount = (item.text.length >= 1 ? wordcount(item.text) : 0);	
  		json.book = item.text;


	  	var ws =  fs.createWriteStream(jsonBasePath+'pg'+json.id+'.json','utf8');

	  	ws.on('end', function() {
			cb;
		});



		log.info({PARSED:{ title: json.title,  id : json.id, count : json.wordcount} }, 'file parsed');
		if(json.wordcount <= 400){log.error({ title: json.title,  id : json.id, count : json.wordcount }), 'TEXT TOO SHORT' };
		if(json.title == undefined){log.error({ title: undefined,  id : json.id }), 'NO TITLE'};

	  	ws.write(JSON.stringify(json, null, 4));

		ws.on('error', function (err) {
	    	cb(err, json.id);
	  	});
	
	  }
	}, callback);
}

var generateFile = function(item, callback){
	async.waterfall([
		function(callback) { callback(null, item)},
		getData,
		saveFile
	],callback);
}



var parseDirectory = function(basePath){

	async.waterfall([
		async.apply(fs.readdir, basePath),
		function(dirs, callback){
			async.filter(dirs, function(dir, callback) {

				fs.access(rdfPath(basePath, dir), function(err) {
					fs.access(txtPath(basePath, dir), function(err) {
					    callback(!err);
					});
				});
		  
			}, function(results, err){
				callback(err, results);
			});
		},
		function(dirs, callback){
			async.every(dirs, function(item, cb) {
			  generateFile(item, cb);
			}, function(err, result){
			    callback(err, result);
			});
		}
	], function (err, result) {
		console.log(result);
		console.log(errors);
	});

}

parseDirectory(basePath);


