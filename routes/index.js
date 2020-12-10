var express = require('express');
var router = express.Router();
const { exec } = require('child_process');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
var fs = require('fs');
var unzipper = require('unzipper');
var findit = require('findit');
var path = require('path');

const adapter = new FileSync('db.json');
const Schema = require('validate');
const { map } = require('../app');

const db = low(adapter);
// Set some defaults (required if your JSON file is empty)
db.defaults({ innerHTML: {} }).write();

/* GET home page. */
router.get('/see-data', async (req, res, next) => {
  try {
    const data = db.get(`bingos`).value();

    res.json(data);
  } catch (error) {
    console.log(error);
  }
});

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    db.read();
    const templateName = 'index';
    console.log(db.get('innerHTML').value()['tWGnLfmAgognpWff8mpVKf']);
    res.render('index.nunjucks', {
      templateName: '../dist/' + templateName + '.generated.nunjucks',
      data: db.get('innerHTML').value(),
    });
  } catch (error) {
    console.log(error);
  }
});
router.get('/:templateName', async (req, res, next) => {
  try {
    db.read();
    let templateName = req.params.templateName || 'index';
    templateName = templateName.replace('.html', '').replace('.htm', '');

    console.log('GET PAGE ', templateName);
    res.render('index.nunjucks', {
      templateName: '../dist/' + templateName + '.generated.nunjucks',
      data: db.get('innerHTML').value(),
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
