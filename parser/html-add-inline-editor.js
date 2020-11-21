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

exports.parse = function (templateName = 'index') {
  return new Promise((res) => {
    var dir = './dist';

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    fs.readFile(`src/templates/${templateName}.html`, 'utf8', function (err, data) {
      if (err) throw err;

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

      fs.writeFileSync(`src/templates/${templateName}.html`, root.toString());

      // ------------- generate tempalte
      fs.readFile(`src/templates/${templateName}.html`, 'utf8', function (err, data) {
        if (err) throw err;

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

        const body = root.querySelectorAll('body')[0];
        body.set_content(
          body.innerHTML +
            `<script src="cms/editor.js"></script>
        `
        );

        console.log('Created blank template');

        fs.writeFileSync(`dist/${templateName}.generated.nunjucks`, root.toString());
        res();
      });
    });
  });
};
