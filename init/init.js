const fs = require('fs');

if (!fs.existsSync('node_modules')) {
  console.log(`> Error: Please run "npm install" first.`);
  process.exit(0);
}

var inquirer = require('inquirer');
var Spinner = require('cli-spinner').Spinner;
const { COPYFILE_EXCL } = fs.constants;
const uuid = require('uuid');

var spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');

const defualtDelay = 100;
function delay(t = defualtDelay, val) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(val);
    }, t);
  });
}

const hadError = false;
async function init() {
  const title = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      default: 'My Website',
      message: 'What is your page title?',
    },
  ]);

  spinner.start();
  await delay();
  spinner.stop(true);

  const domain = await inquirer.prompt([
    {
      type: 'input',
      name: 'domain',
      default: 'my-website.com',
      message: 'Enter your domain name',
    },
  ]);

  spinner.start();
  await delay();
  spinner.stop(true);

  const template = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'Generate a default template?',
      choices: [
        { name: 'Yes', value: true, checked: true },
        { name: 'No', value: false, checked: false },
      ],
    },
  ]);

  spinner.start();
  await delay();
  if (template.template == true) {
    try {
      fs.mkdirSync('./dist/website/pages', { recursive: true });
      if (fs.existsSync('./dist/website/pages/index.html')) {
        fs.unlinkSync('./dist/website/pages/index.html');
      }
      fs.copyFileSync(
        './init/index.html',
        './dist/website/pages/index.html',
        COPYFILE_EXCL,
      );

      fs.mkdirSync('./dist/website/assets', { recursive: true });
      if (fs.existsSync('./dist/website/assets/favicon.png')) {
        fs.unlinkSync('./dist/website/assets/favicon.png');
      }
      fs.copyFileSync(
        './init/favicon.png',
        './dist/website/assets/favicon.png',
        COPYFILE_EXCL,
      );

      // await htmlFindInlineEditor.parse();
      // await htmlToTemplate.parse();
      spinner.stop(true);
    } catch (error) {
      console.log(error);
      spinner.stop(true);
      console.log('> Warning: File "index.html: already exits in "src" folder');
      // await htmlFindInlineEditor.parse();
      // await htmlToTemplate.parse();
    }
  }

  const autoUpdate = await inquirer.prompt([
    {
      type: 'list',
      name: 'autoUpdate',
      message: 'Do you want to update the Haus CMS automatically?',
      choices: [
        { name: 'Yes', value: true, checked: true },
        { name: 'No', value: false, checked: false },
      ],
    },
  ]);

  const analytics = await inquirer.prompt([
    {
      type: 'list',
      name: 'analytics',
      message: 'Do you want to collect analytical data of your page visitors?',
      choices: [
        { name: 'Yes', value: true, checked: true },
        { name: 'No', value: false, checked: false },
      ],
    },
  ]);

  spinner.start();
  await delay();
  const key = uuid.v4();
  try {
    const env = `
    adminToken=${key}
    title=${title.title}
    domain=${domain.domain}
    analytics=${analytics.analytics}
    autoUpdate=${autoUpdate.autoUpdate}`;
    fs.writeFileSync('.env', env);
    spinner.stop(true);
    console.log('> Generated .env file.');
  } catch (error) {
    spinner.stop(true);
    console.log('> Warning: Creating .env failed.');
  }

  if (!hadError) {
    console.log('');
    console.log('');
    console.log('----------- YOUR PRIVATE CMS ACCESS KEY -----------');
    console.log('');
    console.log('>      ' + key);
    console.log('');
    console.log('---------------------------------------------------');
    console.log('');
    console.log('');
    await delay();
    console.log('> Copy and save this key in a secure location.');
    await delay();
    console.log('');
    console.log('');
    spinner.start();
    await delay();
    spinner.stop(true);
    console.log('> All done. Now start the Haus CMS with "npm start"');
    console.log('');
  } else {
    console.log('> Warning: Initializing the Haus CMS failed.');
  }
}

init();
