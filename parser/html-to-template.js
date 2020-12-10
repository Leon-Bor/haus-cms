const parse = require('node-html-parser').parse;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ innerHTML: {} }).write();
var fs = require('fs');

const short = require('short-uuid');
const { consoleTestResultHandler } = require('tslint/lib/test');

const htmlFindInlineEditor = require('../parser/html-find-inline-editor');
// By default shortened values are now padded for consistent length.
// If you want to produce variable lengths, like in 3.1.1
const translator = short(short.constants.flickrBase58, {
  consistentLength: false,
});

const addDataHausIds = function (name, html) {
  return new Promise(res => {
    let root = parse(html, {
      lowerCaseTagName: false, // convert tag name to lower case (hurt performance heavily)
      comment: true, // retrieve comments (hurt performance slightly)
      blockTextElements: {
        script: true, // keep text content when parsing
        noscript: true, // keep text content when parsing
        style: true, // keep text content when parsing
        pre: true, // keep text content when parsing
      },
    });

    // ------------- add ids if not there to db json
    let elements = root.querySelectorAll('[data-haus]') || [];
    elements.map(e => {
      const uuid = e.getAttribute('data-haus-id');
      if (!uuid) {
        const newUuid = translator.new();
        e.setAttribute('data-haus-id', newUuid);
        db.set(`innerHTML.${newUuid}`, e.innerHTML).write();
      }
    });

    fs.writeFileSync(`src/templates/${name}.html`, root.toString());

    console.log('Add ids to file: ', name + '.html');
    res(root.toString());
  });
};

const replaceIdsWithTemplateBrackets = function (name, html) {
  return new Promise(res => {
    const root = parse(html, {
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

    elements.map(e => {
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

    console.log('Add brackets to file: ', name + '.html');

    res(root.toString());
  });
};

const replaceComponents = function (name, html) {
  return new Promise(res => {
    const root = parse(html, {
      lowerCaseTagName: false, // convert tag name to lower case (hurt performance heavily)
      comment: true, // retrieve comments (hurt performance slightly)
      blockTextElements: {
        script: true, // keep text content when parsing
        noscript: true, // keep text content when parsing
        style: true, // keep text content when parsing
        pre: true, // keep text content when parsing
      },
    });

    const elements = root.querySelectorAll('[data-haus-component]') || [];
    elements.map(e => {
      const id = e.getAttribute('id');
      if (id) {
        let component = fs.readFileSync(`src/components/${id}.html`, 'utf8');
        e.set_content(component);
      }
    });

    console.log('Add components to file: ', name + '.html');

    res(root.toString());
  });
};

exports.parse = async function (templateName = 'index.html') {
  var dir = './dist';
  let htmlFiles = [];

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  fs.readdirSync('src/templates/').forEach(file => {
    console.log(file);
    if (file.endsWith('.html')) {
      htmlFiles.push(file);
    }
  });

  for (let index = 0; index < htmlFiles.length; index++) {
    const htmlFile = htmlFiles[index].replace('.html', '');

    await htmlFindInlineEditor.parse(htmlFile);

    let template = fs.readFileSync(`src/templates/${htmlFile}.html`, 'utf8');
    template = await addDataHausIds(htmlFile, template);
    template = await replaceComponents(htmlFile, template);
    template = await replaceIdsWithTemplateBrackets(htmlFile, template);
    fs.writeFileSync(`dist/${htmlFile}.generated.nunjucks`, template);
  }
};
