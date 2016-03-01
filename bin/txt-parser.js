var TxtParser;


TxtParser = (function(){


  function clean(src, callback){

    const fs = require('graceful-fs');
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
      '***START OF THE PROJECT GUTENBERG EBOOK',
      '*** START OF THE COPYRIGHTED',
      '***START OF THE PROJECT GUTENBERG',
      'SERVICE THAT CHARGES FOR DOWNLOAD',
      'This etext was prepared by',
      'E-text prepared by',
      //'Produced by',
      'Distributed Proofreading Team',
      '*END THE SMALL PRINT',
      //'This etext was produced by',
      'http://gutenberg.spiegel.de/ erreichbar.',
      'Project Runeberg publishes',
      'Beginning of this Project Gutenberg',
      //'Project Gutenberg Online Distributed',
      //'Gutenberg Online Distributed',
      'This Etext was prepared by',
      'This etext was prepared by',
      'Gutenberg Distributed Proofreaders',
      'the Project Gutenberg Online Distributed Proofreading Team',
      'More information about this book is at the top of this file.',
      'tells you about restrictions in how the file may be used.',
      'of the etext through OCR.',
      '*****These eBooks Were Prepared By Thousands of Volunteers!*****',
      '*These Etexts Prepared By Hundreds of Volunteers',
      'We need your donations more than ever!',
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
      var headerIndexOld = 0;
    	var footerIndex = null;
      var hasHeader = false;
    	var hasFooter = false;

        for (var i = 0; i < array.length; i++) {

          var line = array[i].toString();

          footerIndex = (!hasFooter ? footerIndex+1 : footerIndex);
          headerIndex = (!hasHeader ? 0 : headerIndex);

        	if (HEADER_MARKERS.some(function(v) { return array[i].indexOf(v) >= 0; })) {
            headerIndexOld = headerIndex;
            headerIndex = i;
            hasHeader = true;
      		}

      		if (FOOTER_MARKERS.some(function(v) { return array[i].indexOf(v) >= 0; })) {
    				footerIndex = i;
    				hasFooter = true;
      		}

      		parsedText.push(array[i]);

        }
        if (headerIndex >= footerIndex || footerIndex - headerIndex < 100 ){
          headerIndex = headerIndexOld;
        }
        var cleanedText = parsedText.slice(headerIndex+1, footerIndex-1);

        var txt = {
          txt: cleanedText.join('\r\n'),
          header: headerIndex,
          footer: footerIndex
        }

        return callback(err, txt);
    });
  }


  return {
    clean:clean,
  };


})();

module.exports = TxtParser;

