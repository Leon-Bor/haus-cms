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
const slash = require('slash');

const adapter = new FileSync('db.json');
const db = low(adapter);
const Schema = require('validate');
const { map } = require('../app');

const htmlAddInlineEditor = require('../parser/html-add-inline-editor');
const htmlFindInlineEditor = require('../parser/html-find-inline-editor');

function findIndexHtml(fromPath = path.join(__dirname, '../dist/template')) {
  return new Promise((res, rej) => {
    try {
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
    } catch (error) {
      rej(error);
    }
  });
}

function copyHtmlFiles(fromPath, toPath) {
  const { COPYFILE_EXCL } = fs.constants;

  console.log(`Copy html files from ${fromPath} to ${toPath}`);
  return new Promise((res, rej) => {
    try {
      const finder = findit(fromPath);

      finder.on('directory', function (dir, stat, stop) {
        var base = path.basename(dir);
        if (base === '.git' || base === 'node_modules') stop();
      });

      finder.on('file', function (file, stat) {
        if (!file.includes('__MACOSX') && file.endsWith('.html')) {
          console.log('copy html file: ', file);
          fs.copyFileSync(file, path.join(__dirname + `${toPath}/${file.replace(/^.*[\\\/]/, '')}`), COPYFILE_EXCL);
        }
      });

      finder.on('end', function () {
        res();
      });
    } catch (error) {
      rej(error);
    }
  });
}

function copyAssetFiles(fromPath, toPath, indexFile) {
  const { COPYFILE_EXCL } = fs.constants;

  console.log(`Copy html files from ${fromPath} to ${toPath}`);
  return new Promise((res, rej) => {
    try {
      const finder = findit(fromPath);

      finder.on('directory', function (dir, stat, stop) {
        var base = path.basename(dir);
        if (base === '.git' || base === 'node_modules') stop();
      });

      finder.on('file', function (file, stat) {
        try {
          if (!file.includes('__MACOSX') && !file.endsWith('.html') && !file.includes('/.')) {
            var fileName = file.replace(/^.*[\\\/]/, '');
            console.log('copy asset file: ', file);
            file = slash(file);
            const indexPath = indexFile.replace('/index.html', '');
            let templateFilePath = file.replace(indexPath, '').replace(fileName, '');

            fs.mkdirSync(path.join(__dirname + toPath + templateFilePath), {
              recursive: true,
            });
            fs.copyFileSync(file, `${path.join(__dirname + toPath)}${file.replace(fromPath, '')}`, COPYFILE_EXCL);
          }
        } catch (error) {
          console.log(error);
        }
      });

      finder.on('end', function () {
        res();
      });
    } catch (error) {
      rej(error);
    }
  });
}

function removeDir(path) {
  return new Promise((res, rej) => {
    try {
      rimraf(path, function (e) {
        console.log('Deleted folder ' + path);
        console.log(e);
        res();
      });
    } catch (error) {
      rej(error);
    }
  });
}

function clearSrcFolder() {
  return new Promise(async (res, rej) => {
    try {
      const srcPath = path.join(__dirname, '../src');
      console.log('remove current template');
      await removeDir(srcPath);
      fs.mkdirSync(srcPath);
      fs.mkdirSync(srcPath + '/components');
      fs.mkdirSync(srcPath + '/public');
      fs.mkdirSync(srcPath + '/templates');

      fs.writeFileSync(srcPath + '/components/.gitkeep');
      fs.writeFileSync(srcPath + '/public/.gitkeep');
      fs.writeFileSync(srcPath + '/templates/.gitkeep');

      res();
    } catch (error) {
      console.log(error);
      rej(error);
    }
  });
}

function copyTemplateToFolders() {
  return new Promise(async (res, rej) => {
    try {
      console.log('start copyTemplateToFolders');
      const indexFile = slash(await findIndexHtml());
      console.log('index file ', indexFile);
      await clearSrcFolder();
      await copyHtmlFiles(indexFile.substring(0, indexFile.lastIndexOf('/')), '/../src/templates');
      await copyAssetFiles(indexFile.substring(0, indexFile.lastIndexOf('/')), '/../src/public', indexFile);

      await htmlFindInlineEditor.parse();
      await htmlAddInlineEditor.parse();
      res();
    } catch (error) {
      rej(error);
    }
  });
}

router.post('/upload-template', async function (req, res, next) {
  try {
    console.log(req.files);
    if (!req.files) {
      res.status(404).send({
        status: false,
        message: 'No file uploaded',
      });
    } else {
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let template = req.files.file;
      console.log('before move');

      //Use the mv() method to place the file in upload directory (i.e. "uploads")
      template.mv(path.join(__dirname, '../dist/template.zip'));
      console.log('after move');
      //send response

      setTimeout(() => {
        var stream = fs
          .createReadStream(path.join(__dirname, '../dist/template.zip'))
          .pipe(unzipper.Extract({ path: path.join(__dirname, '../dist/template') }));

        stream.on('finish', function () {
          console.log('Finish unzip');
          copyTemplateToFolders();
        });
      }, 2000);

      res.send({
        status: true,
        message: 'File is uploaded',
        data: {
          name: template.name,
          mimetype: template.mimetype,
          size: template.size,
        },
      });
    }
  } catch (err) {
    res.status(500).send(err);
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

router.post('/content', auth, async (req, res, next) => {
  try {
    Object.keys(req.body).map(async k => {
      await db.set(`innerHTML.${k}`, req.body[k]).write();
    });

    res.json(true);
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
        .filter(f => f.endsWith('.html'))
        .map(f => {
          const file = fs.readFileSync(`./src/templates/${f}`, {
            encoding: 'utf8',
          });
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
    if (!req.body.id) {
      res.status(500).json({
        message: 'Missing file id',
      });
      return;
    }

    let filename = req.body.id;

    if (!filename.endsWith('.html')) {
      filename = filename + '.html';
    }

    filename = filename.replace(/\s/g, '-');

    fs.writeFileSync(`./src/templates/${filename}`, '');
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
    const file = fs.readFileSync(`./src/templates/${req.params.templateName}`, {
      encoding: 'utf8',
    });
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
    fs.writeFileSync(`./src/templates/${req.params.templateName}`, req.body.value);
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
        .filter(f => f.endsWith('.html'))
        .map(f => {
          const file = fs.readFileSync(`./src/components/${f}`, {
            encoding: 'utf8',
          });
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
    if (!req.body.id) {
      res.status(500).json({
        message: 'Missing file id',
      });
      return;
    }

    let filename = req.body.id;

    if (!filename.endsWith('.html')) {
      filename = filename + '.html';
    }

    filename = filename.replace(/\s/g, '-');

    fs.writeFileSync(`./src/components/${filename}`, '');
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
    fs.writeFileSync(`./src/components/${req.params.componentName}`, req.body.value);
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
          .filter(f => !f.includes('/.'))
          .map(f => {
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
    if (!req.body.id) {
      res.status(500).json({
        message: 'Missing file id',
      });
      return;
    }

    let filename = req.body.id;

    filename = filename.replace(/\s/g, '-');

    if (!filename.includes('.')) {
      res.status(500).json({
        message: 'Missing file extension',
      });
      return;
    }

    fs.writeFileSync(`./src/components/${filename}`, '');
    res.json(true);
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
    fs.writeFileSync(`./src/files/${req.params.fileName}`, req.body.value);
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
