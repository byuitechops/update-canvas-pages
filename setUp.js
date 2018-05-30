const enquirer = require('enquirer');
const fs = require('fs');

function setUp() {
    let question = [{
        type: 'input',
        name: 'API_key',
        message: 'Please enter your API key'
    }]
    enquirer.prompt()
}