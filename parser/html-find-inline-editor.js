const parse = require('node-html-parser').parse;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ innerHTML: {} }).write();
var fs = require('fs');

function findParentDiv(e, lvl = 0) {
  if (e.rawTagName == 'div') {
    e.setAttribute('data-haus', '');
  } else {
    if (e.rawTagName == 'body') {
      // console.log('No parent div found for element.');
    } else {
      findParentDiv(e.parentNode, lvl + 1);
    }
  }
}

function removeNestedEditors(e, lvl = 0) {
  if (e.rawTagName == 'body') {
    // console.log('No parent editor found.');
    return true;
  } else {
    e.removeAttribute('data-haus');
    removeNestedEditors(e.parentNode, lvl + 1);
  }
}

exports.parse = function () {
  fs.readFile('src/templates/index.html', 'utf8', function (err, data) {
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

    const p = root.querySelectorAll('p') || [];
    const h1 = root.querySelectorAll('h1') || [];
    const h2 = root.querySelectorAll('h2') || [];
    const h3 = root.querySelectorAll('h3') || [];
    const h4 = root.querySelectorAll('h4') || [];
    const h5 = root.querySelectorAll('h5') || [];
    const h6 = root.querySelectorAll('h6') || [];
    const span = root.querySelectorAll('span') || [];
    const button = root.querySelectorAll('button') || [];
    const label = root.querySelectorAll('label') || [];
    const elements = [...p, ...h1, ...h2, ...h3, ...h4, ...h5, ...h6, ...span, ...button, ...label];

    elements.map((e) => {
      findParentDiv(e);
    });

    const hausElements = root.querySelectorAll('[data-haus]') || [];

    hausElements.map((e) => {
      removeNestedEditors(e.parentNode);
    });

    fs.writeFileSync('src/templates/index.html', root.toString());
  });
  return true;
};
