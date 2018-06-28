const Enquirer = require('enquirer');
const enquirer = new Enquirer();
const fs = require('fs');
const chalk = require('chalk');

function setUp() {
    return new Promise((resolve, reject) => {
        // let questions = [{
        //         name: 'API_Key',
        //         type: 'input',
        //         message: 'What is your API Key?',
        //     },
        //     {
        //         name: 'path',
        //         type: 'input',
        //         message: 'Where will the course to be saved?',
        //         default: '/documents/courses'
        //     }
        // ];

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
            default: '/Documents/courses'
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
    })
}

function errorHandling(err) {
    console.error(chalk.red(err));
}

async function main(canvas = require('canvas-api-wrapper')) {
    try {
        let settings = await setUp();
        console.log(settings);
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

module.exports = main;