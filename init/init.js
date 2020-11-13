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

function delay(t, val) {
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
  await delay(1000);
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
  await delay(1000);
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
  await delay(1000);
  if (template.template == true) {
    try {
      fs.copyFileSync('./init/index.html', './test/index.html', COPYFILE_EXCL);
      spinner.stop(true);
    } catch (error) {
      spinner.stop(true);
      console.log('> Warning: File "index.html: already exits in "src" folder');
    }
  }

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
  await delay(1000);
  const key = uuid.v4();
  try {
    const env = `editKey=${key}
    title=${title.title}
    domain=${domain.domain}
    analytics=${analytics.analytics}`;
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
    await delay(2000);
    console.log('> Copy and save this key in a secure location.');
    await delay(2000);
    console.log('');
    console.log('');
    spinner.start();
    await delay(3000);
    spinner.stop(true);
    console.log('> All done. Now start the Haus CMS with "npm start"');
    console.log('');
  } else {
    console.log('> Warning: Initializing the Haus CMS failed.');
  }
}

init();
