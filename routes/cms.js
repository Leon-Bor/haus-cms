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
var rimraf = require('rimraf');
const fsp = require('fs').promises;

const adapter = new FileSync('db.json');
const db = low(adapter);
const Schema = require('validate');
const { map } = require('../app');

function findIndexHtml(fromPath = path.join(__dirname, '../dist/template.zip')) {
  return new Promise((res, rej) => {
    const finder = findit(fromPath);
    finder.on('directory', function (dir, stat, stop) {
      var base = path.basename(dir);
      if (base === '.git' || base === 'node_modules') stop();
    });

    finder.on('file', function (file, stat) {
      if (!file.includes('__MACOSX') && file.includes('index.html')) {
        res(file);
      }
    });
  });
}

function copyHtmlFiles(fromPath, toPath) {
  const { COPYFILE_EXCL } = fs.constants;

  return new Promise((res, rej) => {
    const finder = findit(fromPath);

    finder.on('directory', function (dir, stat, stop) {
      var base = path.basename(dir);
      if (base === '.git' || base === 'node_modules') stop();
    });

    finder.on('file', function (file, stat) {
      if (!file.includes('__MACOSX') && file.endsWith('.html')) {
        console.log('copy fileÖ', file);
        fs.copyFileSync(file, `${toPath}/${file.replace(/^.*[\\\/]/, '')}`, COPYFILE_EXCL);
      }
    });

    finder.on('end', function () {
      res();
    });
  });
}

function copyAssetFiles(fromPath, toPath) {
  const { COPYFILE_EXCL } = fs.constants;

  return new Promise((res, rej) => {
    const finder = findit(fromPath);

    finder.on('directory', function (dir, stat, stop) {
      var base = path.basename(dir);
      if (base === '.git' || base === 'node_modules') stop();
    });

    finder.on('file', function (file, stat) {
      if (!file.includes('__MACOSX') && !file.endsWith('.html') && !file.includes('/.')) {
        console.log('file', file, `${toPath}${file.replace(fromPath, '')}`);
        var fileData = fs.readFileSync(file, 'utf8');

        let pathArray = `${toPath}${file.replace(fromPath, '')}`.split('/');
        pathArray.pop();
        console.log(pathArray);
        pathArray.reduce((pre, cur) => {
          if (!fs.existsSync(pre + cur)) {
            fs.mkdirSync(pre + cur, { recursive: true });
          }
          return pre + cur + '/';
        }, '');

        fs.writeFileSync(`${toPath}${file.replace(fromPath, '')}`, fileData);
      }
    });

    finder.on('end', function () {
      res();
    });
  });
}

function removeDir(path) {
  return new Promise((res) => {
    rimraf(path, function (e) {
      console.log('Deleted folder ' + path);
      console.log(e);
      res();
    });
  });
}

function clearSrcFolder() {
  return new Promise(async (res) => {
    const srcPath = path.join(__dirname, '../src');
    console.log('remove current template');
    await fsp.rmdir(srcPath, { recursive: true });
    fs.mkdirSync(srcPath);
    fs.mkdirSync(srcPath + '/components');
    fs.mkdirSync(srcPath + '/public');
    fs.mkdirSync(srcPath + '/templates');

    fs.writeFileSync(srcPath + '/components/.gitkeep');
    fs.writeFileSync(srcPath + '/public/.gitkeep');
    fs.writeFileSync(srcPath + '/templates/.gitkeep');

    res();
  });
}

function copyTemplateToFolders() {
  return new Promise(async (res) => {
    const file = await findIndexHtml();
    await clearSrcFolder();
    await copyHtmlFiles(file.substring(0, file.lastIndexOf('/')), './test123');
    await copyAssetFiles(file.substring(0, file.lastIndexOf('/')), '../src/assets');
    res();
  });
}

// files

router.post('/upload-template', async function (req, res, next) {
  var fstream;
  try {
    if (req.busboy) {
      if (fs.existsSync(path.join(__dirname, '../dist/template'))) await removeDir(path.join(__dirname, '../dist/template'));
      if (fs.existsSync(path.join(__dirname, '../dist/template.zip'))) fs.unlinkSync(path.join(__dirname, '../dist/template.zip'));

      console.log('busboy');
      req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        fstream = fs.createWriteStream(path.join(__dirname, '../dist/template.zip'));
        file.pipe(fstream);
        fstream.on('close', () => {
          console.log('file ' + filename + ' uploaded');
          try {
            fs.createReadStream(path.join(__dirname, '../dist/template.zip'))
              .pipe(unzipper.Extract({ path: path.join(__dirname, '../dist/template') }))
              .on('finish', async () => {
                console.log('Finish file upload: success');
                // await copyTemplateToFolders();
              })
              .on('error', async (e) => {
                console.log('Finish file upload: error');
                // await copyTemplateToFolders();
              });
          } catch (error) {
            console.log(error);
          }
        });
      });
      req.busboy.on('finish', async (fieldname, file, filename, encoding, mimetype) => {
        console.log('upload finish');
        res.json({ success: true });
      });
      req.pipe(req.busboy);
    }
  } catch (error) {
    console.log(error);
  }
});

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

// CONTENT

router.post('/content', async (req, res, next) => {
  try {
    if (process.env.editKey === req.query.editKey) {
      Object.keys(req.body).map(async (k) => {
        await db.set(`innerHTML.${k}`, req.body[k]).write();
      });

      res.json(true);
    } else {
      res.status(400).send({
        message: 'No or wrong edit key provided.',
      });
    }
  } catch (error) {
    res.status(500).send({
      message: 'Internal server error.',
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
