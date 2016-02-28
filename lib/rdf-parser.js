var RdfParser;


RdfParser = (function(){


	function getMeta(src, callback){


		const fs = require('fs');
		const parseString = require('xml2js').parseString;


		//Read file - execute
		fs.readFile(src, 'utf8', function(err, file) {

			_parseRecord(file, callback);	//cb(err, response)

		});



		_parseRecord = function(record, callback) {
		    var response = {
		        id: null,
		        formats: [],
		        //downloads: 0,
		        languages: [],
		        title: null,
		        author: null,
		        isTextAvailable: false,
		        issued: null
		    };

		    /*
		    * Taken from:
		    * https://github.com/DeepElement/node-gutenberg/blob/master/bin/gutenberg.js
			* Rest of code out of date/pain in ass
			*/

		    parseString(record, function(err, jsonRecord) {
		        if (err)
		            return callback(err);


		        try {
		            response.id = jsonRecord['rdf:RDF']['pgterms:ebook'][0]['$']['rdf:about'].replace('ebooks/', '');
		            if (jsonRecord['rdf:RDF']['pgterms:ebook'][0]['dcterms:language'][0]) {
		                if (jsonRecord['rdf:RDF']['pgterms:ebook'][0]['dcterms:language'][0]['rdf:Description']) {
		                    response.languages.push(jsonRecord['rdf:RDF']['pgterms:ebook'][0]['dcterms:language'][0]['rdf:Description'][0]['rdf:value'][0]["_"]);
		                } else {
		                    response.languages.push(jsonRecord['rdf:RDF']['pgterms:ebook'][0]['dcterms:language'][0]["_"]);
		                }
		            }
		            /*if (jsonRecord['rdf:RDF']['pgterms:ebook'][0]['pgterms:downloads']) {
		                if (jsonRecord['rdf:RDF']['pgterms:ebook'][0]['pgterms:downloads'][0]["rdf:value"]) {
		                    response.downloads = jsonRecord['rdf:RDF']['pgterms:ebook'][0]['pgterms:downloads'][0]["rdf:value"][0]["_"];
		                } else {
		                    response.downloads = jsonRecord['rdf:RDF']['pgterms:ebook'][0]['pgterms:downloads'][0]["_"];
		                }
		            }*/

		            if (jsonRecord['rdf:RDF']['pgterms:ebook'][0]['dcterms:title']) {
		                response.title = jsonRecord['rdf:RDF']['pgterms:ebook'][0]['dcterms:title'];
		            }


		            var creatorNode = null;
		            if (jsonRecord['rdf:RDF']['pgterms:ebook'][0]['dcterms:creator']) {
		                creatorNode = jsonRecord['rdf:RDF']['pgterms:ebook'][0]['dcterms:creator'];
		            } else {
		                var creatorParent = jsonRecord['rdf:RDF']['pgterms:ebook'][0];
		                var marcrelKeys = [];
		                for (var key in creatorParent) {
		                    if (key.indexOf('marcrel:') > -1) {
		                        marcrelKeys.push(key);
		                    }
		                }
		                if (marcrelKeys.length > 0) {
		                    creatorNode = jsonRecord['rdf:RDF']['pgterms:ebook'][0][marcrelKeys[0]];
		                }
		            }

		            try {
		                if (creatorNode) {
		                    response.author = creatorNode[0]['pgterms:agent'][0]['pgterms:name'][0];
		                } else {
		                    response.author = 'Unknown';
		                }
		            } catch (ex) {
		                // do nothing
		            }

		            if (jsonRecord['rdf:RDF']['pgterms:ebook'][0]['dcterms:issued']) {
		                response.issued = jsonRecord['rdf:RDF']['pgterms:ebook'][0]['dcterms:issued'][0]['_'];
		            }

		            if (jsonRecord['rdf:RDF']['pgterms:ebook'][0]['dcterms:hasFormat']) {
		                var files = jsonRecord['rdf:RDF']['pgterms:ebook'][0]['dcterms:hasFormat'];
		                for (var i = 0; i <= files.length - 1; i++) {
		                    var file = files[i];
		                    var format = file['pgterms:file'][0]['dcterms:format'][0]['rdf:Description'][0]['rdf:value'][0]['_'];
		                    var tempFilePath = file['pgterms:file'][0]['$']['rdf:about'];
		                    var fileName = file['pgterms:file'][0]["$"]["rdf:about"].replace('http://www.gutenberg.org/ebooks/', '').replace('http://www.gutenberg.org/files/', '');

		                    var outputContainer = {
		                        format: format,
		                        fileName: fileName,
		                        filePath: tempFilePath,
		                        extension: fileName.substr(fileName.lastIndexOf('.') + 1)
		                    };

		                    if (tempFilePath.indexOf('http://www.gutenberg.org/dirs') > -1)
		                        outputContainer.specialPath = tempFilePath.replace('http://www.gutenberg.org/dirs', '');

		                    response.formats.push(outputContainer);
		                }
		            }
		            return callback(null, response);
		        } catch (ex) {;
		            return callback(ex, response);
		        }
		    });

		};
	};

	return { getMeta: getMeta };

})();

module.exports = RdfParser;

