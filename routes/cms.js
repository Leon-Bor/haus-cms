var express = require('express');
var router = express.Router();
const { exec } = require('child_process');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
var unzipper = require('unzipper');
var findit = require('findit');
var path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

const adapter = new FileSync('db.json');
const db = low(adapter);
const Schema = require('validate');
const { map } = require('../app');

// AUTH

router.get('/auth', auth, function (req, res, next) {
  try {
    res.json(true);
  } catch (error) {
    console.log(error);
    res.status(409).json({
      message: 'Not authorized.',
    });
  }
});

// TEMPLATE

router.get('/templates', auth, function (req, res, next) {
  try {
    fs.readdir(`./src/templates`, (err, files) => {
      files = files
        .filter((f) => f.endsWith('.html'))
        .map((f) => {
          const file = fs.readFileSync(`./src/templates/${f}`, { encoding: 'utf8' });
          return {
            id: f,
            value: file,
            type: 'template',
          };
        });
      res.json(files);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Unknown error',
    });
  }
});

router.post('/templates', auth, function (req, res, next) {
  try {
    res.json(true);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Unknown error',
    });
  }
});

router.get('/templates/:templateName', auth, function (req, res, next) {
  try {
    const file = fs.readFileSync(`./src/templates/${req.params.templateName}`, { encoding: 'utf8' });
    res.json({
      id: req.params.templateName,
      value: file,
      type: 'template',
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: 'File not found',
    });
  }
});

router.patch('/templates/:templateName', auth, function (req, res, next) {
  try {
    res.json(true);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: 'File not found',
    });
  }
});

router.delete('/templates/:templateName', auth, function (req, res, next) {
  try {
    res.json(true);
  } catch (error) {
    res.status(404).json({
      message: 'File not found',
    });
  }
});

// COMPONENTS

router.get('/components', auth, function (req, res, next) {
  try {
    fs.readdir(`./src/components`, (err, files) => {
      files = files
        .filter((f) => f.endsWith('.html'))
        .map((f) => {
          const file = fs.readFileSync(`./src/components/${f}`, { encoding: 'utf8' });
          return {
            id: f,
            value: file,
            type: 'component',
          };
        });
      res.json(files);
    });
  } catch (error) {
    res.status(404).json({
      message: 'File not found',
    });
  }
});

router.post('/components', auth, function (req, res, next) {
  try {
    res.json(true);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: 'Unknown error',
    });
  }
});

router.get('/components/:componentName', auth, function (req, res, next) {
  try {
    const file = fs.readFileSync(`./src/components/${req.params.componentName}`, { encoding: 'utf8' });
    res.json({
      id: req.params.templateName,
      value: file,
      type: 'component',
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: 'File not found',
    });
  }
});

router.patch('/components/:componentName', auth, function (req, res, next) {
  try {
    res.json(true);
  } catch (error) {
    console.log(error);
  }
});

router.delete('/components/:componentName', auth, function (req, res, next) {
  try {
    res.json(true);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: 'Unknown error',
    });
  }
});

// FILES

router.get('/files', auth, function (req, res, next) {
  try {
    const finder = findit('./src/public');
    const files = [];
    finder.on('file', function (file, stat) {
      files.push(file);
    });

    finder.on('end', function (file, stat) {
      res.json(
        files
          .filter((f) => !f.includes('/.'))
          .map((f) => {
            let value = null;
            let path = f.replace('src/public/', '');

            if (f.includes('.css')) {
              value = fs.readFileSync(f, { encoding: 'utf8' });
            }
            if (f.includes('.js')) {
              value = fs.readFileSync(f, { encoding: 'utf8' });
            }

            return {
              id: f.split('/').pop(),
              path: path,
              value: value,
              type: 'file',
            };
          })
      );
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: 'Unknown error',
    });
  }
});

router.post('/files', auth, function (req, res, next) {
  try {
    res, json(true);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: 'Unknown error',
    });
  }
});

router.get('/files/:fileName', auth, function (req, res, next) {
  try {
    res.json(true);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: 'Unknown error',
    });
  }
});

router.patch('/files/:fileName', auth, function (req, res, next) {
  try {
    res.json(true);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: 'Unknown error',
    });
  }
});

router.delete('/files/:fileName', auth, function (req, res, next) {
  try {
    res.json(true);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: 'Unknown error',
    });
  }
});

module.exports = router;
