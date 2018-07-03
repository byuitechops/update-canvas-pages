const Enquirer = require('enquirer'),
    enquirer = new Enquirer,
    fs = require('fs'),
    canvas = require('canvas-api-wrapper'),
    setup = require('./setUp.js').main,
    chalk = require('chalk'),
    path = require('path'),
    handleErrors = require('./setup.js').errorHandling;


function sliceName(names) {
    return names.map(name => {
        return name.substr(0, name.lastIndexOf('-'));
    });
}

async function getCourseToUpload(homeDir) {
    let courseLocation,
        readable,
        courses;

    enquirer.question({
        name: 'courseLocation',
        type: 'input',
        message: 'Where are your courses saved?',
        default: '/Documents/courses'
    });

    await enquirer.prompt('courseLocation')
        .then(answer => {
            courseLocation = path.join(homeDir, answer.courseLocation);
        });

    readable = fs.readdirSync(courseLocation);
    courses = sliceName(fs.readdirSync(courseLocation));

    enquirer.register('checkbox', require('prompt-checkbox'));
    enquirer.question({
        name: 'course',
        type: 'checkbox',
        message: 'What course do you want to update?',
        choices: sliceName(fs.readdirSync(courseLocation))
    });

    let pages;
    enquirer.question({
        name: 'pages',
        type: 'radio',
        message: 'What pages do you want to update?',
        choices: pages
    });

    let courseContent = await enquirer.prompt('course');
    return courseContent;

}

async function getPagesToUpdate(courses) {

    return;
}

async function main() {
    let home = require('os').homedir();
    let courses = await getCourseToUpload(home);
    let location = path.join(home, courses.courseLocation);
    console.log(location);
    let pages = await getPagesToUpdate(courses.courseContent, location);
}

main();