const Enquirer = require('enquirer'),
    enquirer = new Enquirer,
    fs = require('fs'),
    canvas = require('canvas-api-wrapper'),
    setup = require('./setUp.js').main,
    chalk = require('chalk'),
    path = require('path'),
    handleErrors = require('./setup.js').errorHandling;

async function getCourseToUpload() {

    function sliceName(names) {
        return names.map(name => {
            return name.substr(0, name.lastIndexOf('-'));
        });
    }

    // let courseLocation;
    enquirer.question({
        name: 'courseLocation',
        type: 'input',
        message: 'Where are your courses saved?',
        default: '/Documents/courses'
    });

    let courseLocation;
    await enquirer.prompt('courseLocation')
        .then(answer => {
            let homeDir = require('os').homedir();
            courseLocation = path.join(homeDir, answer.courseLocation);
        });

    let courses = sliceName(fs.readdirSync(courseLocation));

    enquirer.register('radio', require('prompt-radio'));
    enquirer.question({
        name: 'course',
        type: 'radio',
        message: 'What course do you want to update?',
        choices: courses
    });

    let pages;
    enquirer.question({
        name: 'pages',
        type: 'radio',
        message: 'What pages do you want to update?',
        choices: pages
    });

    await enquirer.prompt('course')
        .then(answer => {
            console.log(answer);
            pages = fs.readdirSync(answer.course);
        });

    console.log(pages);






}


function main() {
    getCourseToUpload();
    // getPagesToUpdate();

}

main();