const Enquirer = require('enquirer');
const enquirer = new Enquirer();
const fs = require('fs');

function setUp() {
    return new Promise((resolve, reject) => {
        let questions = [{
            name: 'API_Key',
            type: 'input',
            message: 'What is your API Key?',
        },
        {
            name: 'path',
            type: 'input',
            message: 'Where will the course to be saved?',
            default: `/documents/courses`
        }]

        enquirer.ask(questions)
            .then(answers => {
                let key = answers.API_Key;
                let path = answers.path;
                resolve({
                    'key': key,
                    'path': path
                })
            })
            .catch(console.error);
    })
}

async function main(canvas = require('canvas-api-wrapper')) {
    let settings = await setUp();
    console.log(settings);
    canvas.apiToken = settings.key;
    return settings.path;

}

if (require.main === module) {
    main()
}

module.exports = main;