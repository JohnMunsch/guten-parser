var TxtParser;


TxtParser = (function(){


  function clean(src, callback){

    const fs = require('fs');
    const isUtf8 = require('is-utf8'); 



    var parsedText = [];


    /*
    *
    *   Markers are from: https://github.com/adamliesko/gutenberg/blob/master/scraper/cleaner.rb
    *
    */

    const lineSeparator = /[\r]{0,1}\n/; //regex that handle linux/mac (9+)/windows

    const HEADER_MARKERS = [

      '*** START OF THE PROJECT GUTENBERG',
      '*** START OF THIS PROJECT GUTENBERG',
      '**The Project Gutenberg',
      '** The Project Gutenberg',
      '**The Project Gutenberg Etext',
      /*'This etext was prepared by',
      'E-text prepared by',
      'Produced by',
      'Distributed Proofreading Team',
      '*END THE SMALL PRINT',
      '***START OF THE PROJECT GUTENBERG',
      'This etext was produced by',
      '*** START OF THE COPYRIGHTED',
      'The Project Gutenberg',
      'http://gutenberg.spiegel.de/ erreichbar.',
      'Project Runeberg publishes',
      'Beginning of this Project Gutenberg',
      'Project Gutenberg Online Distributed',
      'Gutenberg Online Distributed',
      'the Project Gutenberg Online Distributed',
      'Project Gutenberg TEI',
      'This eBook was prepared by',
      'http://gutenberg2000.de erreichbar.',
      'This Etext was prepared by',
      'Gutenberg Distributed Proofreaders',
      'the Project Gutenberg Online Distributed Proofreading Team',
      '*SMALL PRINT!',
      'More information about this book is at the top of this file.',
      'tells you about restrictions in how the file may be used.',
      'of the etext through OCR.',
      '*****These eBooks Were Prepared By Thousands of Volunteers!*****',
      'SERVICE THAT CHARGES FOR DOWNLOAD',
      'We need your donations more than ever!',*/
      ' *** START OF THIS PROJECT GUTENBERG',
      '****     SMALL PRINT!'

    ]

    const FOOTER_MARKERS = [
      '*** END OF THE PROJECT GUTENBERG',
      '*** END OF THIS PROJECT GUTENBERG',
      '***END OF THE PROJECT GUTENBERG',
      'End of the Project Gutenberg',
      'End of The Project Gutenberg',
      'by Project Gutenberg',
      'End of Project Gutenberg',
      'End of this Project Gutenberg',
      '***END OF THE PROJECT GUTENBERG',
      '*** END OF THE COPYRIGHTED',
      'End of this is COPYRIGHTED',
      '**This is a COPYRIGHTED Project Gutenberg Etext, Details Above**',
      'More information about this book is at the top of this file.',
      'We need your donations more than ever!',
      '<<THIS ELECTRONIC VERSION OF',
      'END OF PROJECT GUTENBERG',
      ' End of the Project Gutenberg',
      ' *** END OF THIS PROJECT GUTENBERG'
    ];

    /*var readStream = fs.createReadStream(src);    //outputing partials?

    var lines = [];

    readStream.on('data', (chunk) => {

      var buffer = '';

      buffer += chunk;

      lines = buffer.split(lineSeparator);

  
    });

    readStream.on('end', () => {
      console.log('there will be no more data.');
    });

    readStream.on('end', () => {

      for (var i = 0; i < lines.length; i++) {

          var line = array[i].toString();

          if (!hasFooter) {
            footerIndex = i+1;
          }

          if (HEADER_MARKERS.some(function(v) { return array[i].indexOf(v) >= 0; })) {
            headerIndex = i;
          }

          if (FOOTER_MARKERS.some(function(v) { return array[i].indexOf(v) >= 0; })) {
            footerIndex = i;
            hasFooter = true;
          }


          if(i > headerIndex && i < footerIndex) {
            parsedText.push(array[i]);
          }

      }

      callback(parsedText.join('\r\n'), err);

    });*/

    fs.readFile(src, function(err, file) {

      if(!file){return callback( 'There is nothing to parse or this is not a file', src) }; //is there a file check
      if(!isUtf8(file)){return callback( 'This is not a utf8 file', src) }; //utf8 check
        
      var array = file.toString().split(lineSeparator);


      var headerIndex = null;
    	var footerIndex = null;
      var hasHeader = false;
    	var hasFooter = false;

        for (var i = 0; i < array.length; i++) {

          var line = array[i].toString();

      		if (!hasFooter) {
      			footerIndex = i+1;
      		}

        	if (HEADER_MARKERS.some(function(v) { return array[i].indexOf(v) >= 0; })) {
            headerIndex = i;
            hasHeader = true;
      		}

      		if (FOOTER_MARKERS.some(function(v) { return array[i].indexOf(v) >= 0; })) {
    				footerIndex = i;
    				hasFooter = true;
      		}


      		if(i > headerIndex && i < footerIndex && headerIndex > 0 && hasHeader) {
      			parsedText.push(array[i]);
      		}

        }

        return callback(err, parsedText.join('\r\n'));

    });
  }


  return {
    clean:clean,
  };


})();

module.exports = TxtParser;

