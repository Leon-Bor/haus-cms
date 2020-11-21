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
