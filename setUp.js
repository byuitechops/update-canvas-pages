const Enquirer = require('enquirer');
const enquirer = new Enquirer();
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
let settingsFile;

try {
    let settingsFilePath = path.join(__dirname, 'settings.json');
    fs.accessSync(settingsFilePath, fs.constants.F_OK);
    settingsFile = fs.readFileSync(settingsFilePath);
} catch (err) {
    settingsFile = '';
}
let settings = settingsFile.length > 0 ? JSON.parse(settingsFile) : {};

function setUp() {
    return new Promise((resolve, reject) => {
        let defaultDir = path.join(require('os').homedir(), 'Documents', 'courses');

        enquirer.question({
            name: 'API_Key',
            type: 'input',
            message: 'What is your API Key?',
            when: () => process.env.CANVAS_API_TOKEN === undefined
        });

        enquirer.question({
            name: 'path',
            type: 'input',
            message: 'Where will the course to be saved?',
            default: settings.courseLocation ? settings.courseLocation : defaultDir
        });

        enquirer.ask()
            .then(answers => {
                let key = process.env.CANVAS_API_TOKEN || answers.API_Key;
                let path = answers.path;
                resolve({
                    'key': key,
                    'path': path
                });
            })
            .catch(reject);
    });
}

function errorHandling(err) {
    console.error(chalk.red(err));
}

async function main(canvas = require('canvas-api-wrapper')) {
    try {
        let settings = await setUp();
        if (!process.env.CANVAS_API_TOKEN) {
            canvas.apiToken = settings.key;
        }
        return settings.path;
    } catch (err) {
        errorHandling(err);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    main,
    errorHandling
};