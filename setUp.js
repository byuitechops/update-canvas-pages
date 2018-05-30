const Enquirer = require('enquirer');
const enquirer = new Enquirer();
const fs = require('fs');

function setUp() {
    let questions = [{
        name: 'API_Key',
        type: 'input',
        message: 'What is your API Key?'
    },
    {
        name: 'path',
        type: 'input',
        message: 'Where will the course to be saved?'
    }]

    enquirer.ask(questions)
        .then(answers => {
            let key = answers.API_Key;
            let path = answers.path;
        })
        .catch(console.error);
}
setUp();