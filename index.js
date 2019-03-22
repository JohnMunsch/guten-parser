const fs = require('fs');
const path = require('path');
const ProgressBar = require('progress');
const rdfParser = require('./bin/rdf-parser.js');
const recursive = require('recursive-readdir');

const rdfFilesRegex = /^pg\d+\.rdf/;

let catalog = [];

function ignoreDotFiles(file, stats) {
  // `file` is the path to the file, and `stats` is an `fs.Stats`
  // object returned from `fs.lstat()`.
  return stats.isFile() && path.basename(file).match(rdfFilesRegex) === null;
}

recursive('./cache/epub', [ignoreDotFiles], function(err, files) {
  // `files` is an array of file paths
  let bar = new ProgressBar(
    '  converting [:bar] :current/:total :percent :etas',
    {
      total: files.length,
      width: 20
    }
  );

  files.forEach(file => {
    rdfParser(file, (err, results) => {
      // console.log(err, results);
      catalog.push(results);
      bar.tick();

      if (bar.complete) {
        // Write the catalog to a new JSON file.
        fs.writeFile('catalog.json', JSON.stringify(catalog), 'utf8', err => {
          if (err) throw err;
        });

        console.log('\ncomplete\n');
      }
    });
  });
});
