var GutenParser;
    
GutenParser = (function(){

    const fs = require('graceful-fs');
    const async = require('async');
    const _ = require('lodash');
    const bunyan = require('bunyan');
    const wordcount = require('word-count');

    const txtParser = require('./bin/txt-parser.js');
    const rdfParser = require('./bin/rdf-parser.js');

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
        count: 3,
        period: '1d'
      }
    ]});

    function getJson(item, callback){
        async.parallel({
                metadata: function(cb){
                    rdfParser.getMeta(item.rdf, cb);
                },
                text: function(cb){
                    txtParser.clean(item.txt, cb);
                },
                buildPath: function(cb){
                    if(item.buildPath){
                        cb(null, item.buildPath);
                    } else { 
                        cb(null, null);
                    }
                }
        },
        function(err, result) {
            return callback(err, result);
        });
    };

    function _flatten(result, callback){
        var json = {};
        json = result.metadata;   //flatten a bit
        json.text = (result.text.txt ? result.text.txt : '');
        json.textIndexes = {header: result.text.header, footer: result.text.footer};
        json.buildPath = result.buildPath;
        json.wordcount = (json.text.length >= 10 ? wordcount(json.text) : 0); // add worcount
        if(json.wordcount <= 400){log.error({ERROR:{ title:json.title, id:json.id, author:json.author, count:json.wordcount, msg:'TEXT TOO SHORT'}})};
        if(json.title == undefined){log.error({ERROR:{ title:undefined, author:json.author, id:json.id, msg:'NO TITLE'}})};
        callback(null, json);
    };

    function _saveFile(json, callback){
        var buildPath = json.buildPath;
        delete json[buildPath]; //cleanup
        fs.writeFile(buildPath, JSON.stringify(json, null, 4), 'utf8', (err) => {
            console.log('SUCCESSFUL WRITE TO FILE: '+json.id);
            log.info({PARSED:{ title:json.title, author:json.author, id:json.id, count:json.wordcount, msg:'SUCCESS'} });

            callback(err);
        });
    };

    var _processQ = async.queue(function (item, callback) {
        async.waterfall([
            function(callback) {callback(null, item)},
            getJson,
            _flatten,
            _saveFile
        ],callback);
    }, 5);


    function recursive(srcPath, buildPath, callback){

        var _path = function(buildPath, srcPath){
            var self = this;
            self.buildPath = buildPath;
            self.srcPath = srcPath;
            self.rdf = function(base,item){
                return base+item+'/pg'+item+'.rdf';
            };
            self.txt = function(base,item){
                return base+item+'/pg'+item+'.txt.utf8';
            };
            self.json = function(base,item,prefix){
                var pre = (prefix ? prefix : 'pg');
                return base+'/'+pre+item+'.json';
            };
            self.object = function(item, callback){
                var paths = {
                    txt : self.txt(self.srcPath, item),
                    rdf: self.rdf(self.srcPath, item),
                    buildPath: self.json(self.buildPath, item)
                };
                callback(null, paths);
            }
        };

        async.auto({
            getDirectories: function(callback){
                console.log('Getting Directories');
                fs.readdir(srcPath, callback);
            },
            fileCheck: ['getDirectories', function(callback, results){
                console.log('Checking Directories for files');
                var problems = [];
                var path = new _path();
                async.filter(results.getDirectories, function(item, cb) {
                    fs.access(path.rdf(srcPath, item), fs.R_OK, (err) => {
                        fs.access(path.txt(srcPath, item), fs.R_OK, (err) => {
                            cb(!err);
                        });
                    });
                }, function(result, err){
                    callback(err, result);
                });
            }],
            mapFiles: ['fileCheck', function(callback, results){
                var path = new _path(buildPath, srcPath);
                console.log('Mapping Paths');
                async.map(results.fileCheck, path.object, function(err, results){
                    callback(err, results);
                });
            }],
            processFiles: ['mapFiles', function(callback, results){
                console.log('Processing Files');
                async.each(results.mapFiles, _processQ.push, function(err){
                    callback(err);
                });
            }]
        }, function(err) {
            console.log(err);
            callback(err);
        });
    };


    return { 
        recursiveToFiles: recursive,
        item: _processQ.push,
        json: getJson
    };


})();



/*
*   Single file
*   var object = {
*    rdf: './books/45/pg45.rdf',
*    txt: './books/45/pg45.txt.utf8',
*    buildPath: './test/45.json'
*   }
*
*   GutenParser.item(object, function(err){
*       console.log(err);
*   });
*
*   Multi File
*
*   var srcPath = '/home/unsalted/data/gutenberg/cache/gutenberg.pglaf.org/mirrors/gutenberg/cache/epub/';
*   var buildPath = './json/';
*   
*   GutenParser.recursiveToFiles(srcPath, buildPath, function(err){
*       console.log(err);
*   });
*/
