const Enquirer = require('enquirer'),
    enquirer = new Enquirer,
    fs = require('fs'),
    canvas = require('canvas-api-wrapper'),
    setup = require('./setUp.js').main,
    chalk = require('chalk'),
    path = require('path'),
    handleErrors = require('./setup.js').errorHandling;

function getSettings() {
    let settingsFile;
    try {
        fs.accessSync('./settings.json', fs.constants.F_OK);
        settingsFile = fs.readFileSync('./settings.json');
    } catch (err) {
        settingsFile = '';
    }
    return settingsFile.length > 0 ? JSON.parse(settingsFile) : {};
}

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

async function getCourseToUpload(homeDir, settings) {
    let courseLocation,
        readableDirContent,
        courseObjects,
        choices;

    enquirer.question({
        name: 'courseLocation',
        type: 'input',
        message: 'Where are your courses saved?',
        default: settings.courseLocation ? settings.courseLocation : ''
    });

    try {
        await enquirer.prompt('courseLocation')
            .then(answer => {
                if (answer.courseLocation !== settings.courseLocation) {
                    settings.courseLocation = answer.courseLocation;
                    try {
                        fs.writeFileSync('./settings.json', JSON.stringify(settings || '{}', null, 4));
                    } catch (err) {
                        handleErrors(err);
                    }
                }
            });
        courseLocation = path.join(homeDir, enquirer.answers.courseLocation);
        readableDirContent = fs.readdirSync(courseLocation);
    } catch (err) {
        handleErrors(err);
    }

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
    console.log(coursesToUpdate);

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
    try {
        let settings = getSettings();
        console.log(settings);
        let home = require('os').homedir();
        let courses = await getCourseToUpload(home, settings);
        // let location = path.join(home, courses);
        // let pages = await getPagesToUpdate(courses, courseLocation);
    } catch (err) {
        handleErrors(err);
    }
}


main();