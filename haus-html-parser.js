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

var dir = './dist';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

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
  elements.map((e) => {
    const uuid = e.getAttribute('data-haus-id');
    if (!uuid) {
      const newUuid = translator.new();
      e.setAttribute('data-haus-id', newUuid);
      db.set(`innerHTML.${newUuid}`, e.innerHTML).write();
    }
  });

  fs.writeFileSync('src/index.html', root.toString());

  // ------------- generate tempalte
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

    elements.map((e) => {
      const id = e.getAttribute('data-haus-id');
      e.setAttribute('data-editable', '');
      e.set_content(`{{ data.${id} | safe }}`);
    });

    console.log('Created templates');

    fs.writeFileSync('./dist/index.generated.nunjucks', root.toString());
  });
});
