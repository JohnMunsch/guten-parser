# Gutenparser
*Project written to parse Project Gutenberg books to json for injesting in to elasticsearch and other text analysis tools*

## This is not production code

This was written explicitly to get the job done - since most of my other code is being written in `node.js`/`javascript` it made sense to stay consistent and write the parser in it as well.

## Folder structure
**The directory parser expects two files, in a directory mapped out like this:**

```
├── cache
│   ├── 1
│   │   ├── pg1.rdf
│   │   └── pg1.txt.utf8
│   ├── 2
│   │   ├── pg2.rdf
│   │   └── pg2.txt.utf8
│   ├── 3
│   │   ├── pg2.rdf
│   │   └── pg2.txt.utf8
│   ├── 4
│   │   ├── pg2.rdf
│   │   └── pg2.txt.utf8

```

The reason for the layout is largely due to the structure of the Guntenberg Project mirror.


I used wget to pull the needed files (and nothing extra) - be wary make sure you use responsibly and check it yourself before executing - this can take several hours.

```
wget --mirror --no-parent --recursive --force-directories -A "*/" -A "*.txt.utf8" -A "*.rdf" -R "README.txt.utf8" ftp://gutenberg.pglaf.org//mirrors/gutenberg/cache/epub
```

**At the moment there are some errors that come from parsing out the headers**
There are two log files that keep track of the parsing - files that the text doesn't appear parse on, as well as general word counts.
