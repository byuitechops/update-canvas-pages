const Enquirer = require('enquirer'),
    enquirer = new Enquirer,
    fs = require('fs'),
    canvas = require('canvas-api-wrapper'),
    setup = require('./setUp.js').main,
    chalk = require('chalk'),
    path = require('path'),
    handleErrors = require('./setup.js').errorHandling;

enquirer.register('checkbox', require('prompt-checkbox'));


function buildCourseObjects(names) {
    return names.reduce((acc, name, index) => {
        return acc.concat({
            name,
            choice: `(${index + 1}) ${name.substr(0, name.lastIndexOf('-'))}`,
            number: name.slice(name.lastIndexOf('-') + 1)
        });
    }, []);
}

async function getCourseToUpload(homeDir) {
    let courseLocation,
        readableDirContent,
        courseObjects,
        choices;

    enquirer.question({
        name: 'courseLocation',
        type: 'input',
        message: 'Where are your courses saved?',
        default: '/Documents/courses'
    });

    await enquirer.prompt('courseLocation');
    courseLocation = path.join(homeDir, enquirer.answers.courseLocation);

    readableDirContent = fs.readdirSync(courseLocation);
    courseObjects = buildCourseObjects(readableDirContent);
    choices = courseObjects.map(courseObject => courseObject.choice);

    enquirer.question({
        name: 'coursesToUpdate',
        type: 'checkbox',
        message: 'What course do you want to update?',
        choices
    });

    await enquirer.prompt('coursesToUpdate');

    let coursesToUpdate = courseObjects.filter(courseObject => enquirer.answers.coursesToUpdate.includes(courseObject.choice));

    return coursesToUpdate.map(courseToUpdate => courseToUpdate.name);
}


async function getPagesToUpdate(courses, location) {
    let pages,
        courseLocation;
    // console.log(courses);

    courses.courseToUpdate.course.forEach((course => {
        courseLocation = path.join(location, course);
        pages = fs.readdirSync(courseLocation);
        enquirer.question({
            name: 'pages',
            type: 'radio',
            message: `What pages do you want to update from ${course}?`,
            choices: pages
        });
    }));
    return;
}

async function main() {
    let home = require('os').homedir();
    let courses = await getCourseToUpload(home);
    // let location = path.join(home, courses.courseToUpdate.courseLocation);
    // let pages = await getPagesToUpdate(courses, location);
}

main();