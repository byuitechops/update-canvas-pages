const Enquirer = require('enquirer'),
    enquirer = new Enquirer,
    fs = require('fs'),
    canvas = require('canvas-api-wrapper'),
    setup = require('./setUp.js').main,
    chalk = require('chalk'),
    path = require('path'),
    handleErrors = require('./setup.js').errorHandling;
enquirer.register('checkbox', require('prompt-checkbox'));

function getSettings() {
    let settingsFile;
    try {
        fs.accessSync('./settings.json', fs.constants.F_OK);
        settingsFile = fs.readFileSync('./settings.json');
    } catch (err) {
        settingsFile = '';
    }
    return settingsFile.length > 0 ? JSON.parse(settingsFile) : {};
} // end function


function buildInfoObj(names, location) {
    return names.reduce((acc, name, index) => {
        return acc.concat({
            name: name.indexOf('.') !== -1 ? name.substr(0, name.lastIndexOf('.')) : name,
            choice: `(${index + 1}) ${name.substr(0, name.lastIndexOf('-'))}`,
            number: name.slice(name.lastIndexOf('-') + 1, name.lastIndexOf('.')),
            location: path.join(location, name)
        });
    }, []);
} // end function

function choiceQuestion(name, courses, pages) {
    let manipulatedThing = pages ? pages : courses;
    let choices = manipulatedThing.map(manipulatedThing => manipulatedThing.choice);

    return enquirer.question({
        name,
        type: 'checkbox',
        radio: pages ? true : false,
        message: name === 'courses' ? 'What courses would you like to update?' : `What pages to update from ${courses.choice}?`,
        choices
    });

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

    courseObjects = buildInfoObj(readableDirContent, courseLocation);

    // Create question to choose course to update
    choiceQuestion('courses', courseObjects);
    await enquirer.prompt('courses');

    let coursesToUpdate = courseObjects.filter(courseObject => enquirer.answers.courses.includes(courseObject.choice));

    return coursesToUpdate;
} // end function

async function getPagesToUpdate(courses) {
    let pages,
        pagesToUpdate;

    courses.forEach(course => {
        pages = fs.readdirSync(course.location);
        pages = buildInfoObj(pages, course.location);

        choiceQuestion('pages', course, pages);
        enquirer.prompt('pages')
            .then(answer => {
                // console.log(answer);
            });

        console.log(enquirer.answers.pages);
    });

    pagesToUpdate = pages.filter(page => enquirer.answers.pages.includes(page.choice));

    return pagesToUpdate;

} // end function

async function updatePages(pages) {
    return;
} // end function

async function main() {
    try {
        let settings = getSettings();
        let home = require('os').homedir();
        let courses = await getCourseToUpload(home, settings);
        let pagesToUpdate = await getPagesToUpdate(courses);
        console.log(pagesToUpdate);

        updatePages(pagesToUpdate);

    } catch (err) {
        handleErrors(err);
    }
} // end function

main();