const Enquirer = require('enquirer'),
    enquirer = new Enquirer,
    fs = require('fs'),
    canvas = require('canvas-api-wrapper'),
    setup = require('./setUp.js').main,
    chalk = require('chalk'),
    path = require('path'),
    handleErrors = require('./setup.js').errorHandling;
enquirer.register('checkbox', require('prompt-checkbox'));
enquirer.register('radio', require('prompt-radio'));

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

function choiceQuestion(name, course, pages) {
    let manipulatedThing = pages ? pages : course;
    let choices = manipulatedThing.map(manipulatedThing => manipulatedThing.choice);
    console.log('PAGES COURSE: ', course[0].choice);

    return enquirer.question({
        name,
        type: pages ? 'checkbox' : 'radio',
        errorMessage: pages ? '' : 'If you want more than one course, run the tool multiple times.',
        radio: pages ? true : false,
        message: name === 'courses' ? 'What course would you like to update?' : `What pages to update from ${course[0].choice}?`,
        choices
    });

}
async function getCourseToUpload(homeDir, settings) {
    let courseLocation,
        readableDirContent,
        courseObjects;

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
    console.log('COURSES TO UPDATE ', coursesToUpdate);

    return coursesToUpdate;
} // end function

async function getPagesToUpdate(course) {
    let pages,
        pagesToUpdate;

    course.map((course) => {
        pages = fs.readdirSync(course.location);
        pages = buildInfoObj(pages, course.location);
    });
    choiceQuestion('pages', course, pages);
    enquirer.prompt('pages')
        .then(answer => {});

    pagesToUpdate = pages.filter(page => enquirer.answers.pages.includes(page.choice));
    console.log('PAGES TO UPDATE: ', pagesToUpdate);
    return pagesToUpdate;

} // end function

async function updatePages(pages) {
    return;
} // end function

async function update() {
    try {
        let settings = getSettings();
        let home = require('os').homedir();
        let course = await getCourseToUpload(home, settings);
        let pagesToUpdate = await getPagesToUpdate(course);

        updatePages(pagesToUpdate);

    } catch (err) {
        handleErrors(err);
    }
} // end function

update();