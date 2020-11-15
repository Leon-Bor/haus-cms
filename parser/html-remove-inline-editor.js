const parse = require('node-html-parser').parse;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ innerHTML: {} }).write();
var fs = require('fs');

const short = require('short-uuid');

// By default shortened values are now padded for consistent length.
// If you want to produce variable lengths, like in 3.1.1
const translator = short(short.constants.flickrBase58, {
  consistentLength: false,
});

fs.readFile('src/index.html', 'utf8', function (err, data) {
  if (err) throw err;
  // console.log(data);

  const root = parse(data, {
    lowerCaseTagName: false, // convert tag name to lower case (hurt performance heavily)
    comment: true, // retrieve comments (hurt performance slightly)
    blockTextElements: {
      script: true, // keep text content when parsing
      noscript: true, // keep text content when parsing
      style: true, // keep text content when parsing
      pre: true, // keep text content when parsing
    },
  });

  const elements = root.querySelectorAll('[data-haus]') || [];
  console.log(elements);
  elements.map((e) => {
    console.log(e);
    e.removeAttribute('data-haus-id');
  });

  console.log('Remove haus-id templates');

  fs.writeFileSync('src/index.html', root.toString());
});
