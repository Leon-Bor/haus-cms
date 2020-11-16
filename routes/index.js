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
const db = low(adapter);
const Schema = require('validate');
const { map } = require('../app');

// Set some defaults (required if your JSON file is empty)
db.defaults({ innerHTML: {} }).write();

// /* GET home page. */
// router.get('/uuid/:saufLink', function (req, res, next) {
//   try {
//     const { saufLink } = req.params;

//     const bingo = db.get(`bingos.${saufLink}`).value();

//     res.json(bingo);
//   } catch (error) {
//     console.log(error);
//   }
// });

// router.post('/uuid/:saufLink', async (req, res, next) => {
//   try {
//     const { saufLink } = req.params;
//     const { lastUpdate, fields, korken, archiveBingoNumbers, archiveFields, name } = req.body;

//     const bingo = db.get(`bingos.${saufLink}`).value();
//     const currentTime = new Date().getTime();

//     const [error] = bingoSchema.validate({ fields, korken, lastUpdate: currentTime });

//     if (!error) {
//       if (bingo && bingo.lastUpdate && lastUpdate) {
//         if (bingo.lastUpdate > lastUpdate) {
//           res.json({ status: 200, reload: true });
//         } else {
//           await db.set(`bingos.${saufLink}`, { fields, korken, archiveBingoNumbers, archiveFields, name, lastUpdate: currentTime }).write();
//           res.json({ status: 200, reload: false, currentTime });
//         }
//       } else {
//         await db.set(`bingos.${saufLink}`, { fields, korken, archiveBingoNumbers, archiveFields, name, lastUpdate: currentTime }).write();
//         res.json({ status: 200, reload: false, currentTime });
//       }
//     } else {
//       res.json({ status: 666, reload: true });
//     }
//   } catch (error) {
//     console.log(error);
//   }
// });

// /* GET home page. */
// router.get('/build12345678909876543212345678', function (req, res, next) {
//   try {
//     const command = `sudo git pull && sudo npm i && sudo pm2 restart haus-cms`;

//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         console.error(`exec error: ${error}`);
//         return;
//       }
//       resolved();
//     });

//     res.json(true);
//   } catch (error) {
//     console.log(error);
//   }
// });

function findIndexHtml(fromPath = './dist/template') {
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

router.post('/upload-file', function (req, res, next) {
  var fstream;
  try {
    if (req.busboy) {
      req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        fstream = fs.createWriteStream(__dirname + '/../dist/' + 'template.zip');
        file.pipe(fstream);
        fstream.on('close', () => {
          console.log('file ' + filename + ' uploaded');
          try {
            fs.createReadStream('./dist/template.zip')
              .pipe(unzipper.Extract({ path: './dist/template' }))
              .on('finish', () => {
                findIndexHtml().then((file) => {
                  console.log(file.substring(0, str.lastIndexOf('/')));
                  // copyHtmlFiles(file.substring(0, str.lastIndexOf('/')), './test123');
                  copyAssetFiles(file.substring(0, file.lastIndexOf('/')), './test123');
                });
              })
              .on('error', (e) => {
                findIndexHtml().then((file) => {
                  console.log(file.substring(0, file.lastIndexOf('/')));
                  // copyHtmlFiles(file.substring(0, file.lastIndexOf('/')), './test123');
                  copyAssetFiles(file.substring(0, file.lastIndexOf('/')), './test123');
                });
              });
          } catch (error) {
            console.log(error);
          }
        });
      });
      req.busboy.on('finish', (fieldname, file, filename, encoding, mimetype) => {
        res.json({ success: true });
      });
      req.pipe(req.busboy);
    }
  } catch (error) {
    console.log(error);
  }
});

/* GET home page. */
router.get('/see-data', async (req, res, next) => {
  try {
    const data = db.get(`bingos`).value();

    res.json(data);
  } catch (error) {
    console.log(error);
  }
});

router.post('/haus', async (req, res, next) => {
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

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    res.render('index.nunjucks', { templateName: '../dist/index.generated.nunjucks', data: db.get('innerHTML').value() });
  } catch (error) {
    console.log(error);
  }
});
router.get('/:templateName', async (req, res, next) => {
  try {
    const templateName = req.params.templateName || 'index';
    const { edit = 'false', editKey = null } = req.query;
    res.render('index.nunjucks', { templateName: '../dist/' + templateName + '.generated.nunjucks' });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
