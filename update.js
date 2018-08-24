#!/usr/bin/env node

const Enquirer = require('enquirer'),
    enquirer = new Enquirer,
    fs = require('fs'),
    canvas = require('canvas-api-wrapper'),
    setup = require('./setUp.js').main,
    chalk = require('chalk'),
    path = require('path'),
    he = require('he'),
    handleErrors = require('./setup.js').errorHandling;
enquirer.register('checkbox', require('prompt-checkbox'));
enquirer.register('radio', require('prompt-radio'));

function getSettings(homedir) {
    let settingsFile;
    let filePath = path.resolve(homedir, 'update-canvas-pages/settings.json');
    console.log(filePath);
    try {
        fs.accessSync('./settings.json', fs.constants.F_OK);
        settingsFile = fs.readFileSync('./settings.json');
    } catch (err) {
        settingsFile = '';
    }
    return settingsFile.length > 0 ? JSON.parse(settingsFile) : {};
} // end function getSettings


function buildInfoObj(names, location) {
    return names.reduce((acc, name, index) => {
        let isFile = name.indexOf('.') !== -1 ? true : false;
        return acc.concat({
            name: isFile ? name.substr(0, name.lastIndexOf('.')) : name,
            choice: `(${index + 1}) ${name.substr(0, name.lastIndexOf('-'))}`,
            number: isFile ? name.slice(name.lastIndexOf('-') + 1, name.lastIndexOf('.')) : name.slice(name.lastIndexOf('-') + 1),
            location: path.join(location, name)
        });
    }, []);
} // end function buildInfoObj

function choiceQuestion(name, course, pages) {
    let manipulatedThing = pages ? pages : course;
    let choices = manipulatedThing.map(manipulatedThing => manipulatedThing.choice);

    return enquirer.question({
        name,
        type: 'checkbox', //pages ? 'checkbox' : 'radio',
        errorMessage: pages ? '' : 'If you want more than one course, run the tool multiple times.',
        radio: pages ? true : false,
        message: name === 'courses' ? 'What course would you like to update?' : `What pages to update from ${course.choice}?`,
        choices
    });

} // end function choiceQuestion

function verifyPath(dirPath) {
    let homeDir = require('os').homedir();
    let pathToDir = path.join(homeDir, dirPath);
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
        console.log(courseLocation);
        readableDirContent = fs.readdirSync(courseLocation);
    } catch (err) {
        handleErrors(err);
    }

    courseObjects = buildInfoObj(readableDirContent, courseLocation);

    // Create question to choose course to update
    choiceQuestion('courses', courseObjects);
    await enquirer.prompt('courses');

    let courseToUpdate = courseObjects.filter(courseObject => enquirer.answers.courses.includes(courseObject.choice));

    return courseToUpdate;
} // end function getCourseToUpload

async function getPagesToUpdate(courses) {
    let pages,
        pagesToUpdate;
    if (Array.isArray(courses)) {
        courses.map((course) => {
            pages = fs.readdirSync(course.location);
            pages = buildInfoObj(pages, course.location);
        });
    } else {
        pages = fs.readdirSync(courses.location);
        pages = buildInfoObj(pages, courses.location);
    }
    choiceQuestion('pages' + courses.number, courses, pages);
    // await enquirer.prompt('pages' + courses.number);


    // pagesToUpdate = pages.filter(page => enquirer.answers['pages' + courses.number].includes(page.choice));
    // console.log(pagesToUpdate);
    return pagesToUpdate;

} // end function getPagesToUpdate

async function updatePages(courses) {
    for (let i = 0; i < courses.length; i++) {
        let pages = fs.readdirSync(courses[i].location);
        pages = buildInfoObj(pages, courses[i].location);
        getPagesToUpdate(courses[i]);
        let pagesToUpdate = await enquirer.ask('pages' + courses[i].number);
        pagesToUpdate = pages.filter(page => pagesToUpdate['pages' + courses[i].number].includes(page.choice));

        let course = canvas.getCourse(courses[i].number);

        for (let j = 0; j < pagesToUpdate.length; j++) {
            let newHtml = fs.readFileSync(pagesToUpdate[j].location, 'utf8');

            let encoded = he.encode(newHtml);
            let cleaned = newHtml.replace(/&#160;/g, 'POTATO').replace(/\s/g, '');

            console.log(cleaned);
            let page = await course.pages.getOne(pagesToUpdate[j].number);

            try {
                page.setHtml(newHtml);
                // console.log(page.getHtml());
                await page.update();
            } catch (e) {
                console.log(e);
            }

        }

    }

    return;
} // end function updatePages

async function main() {
    try {
        let home = require('os').homedir();
        let settings = getSettings(home);
        let courses = await getCourseToUpload(home, settings);
        console.log(courses);
        // let pagesToUpdate = await getPagesToUpdate(courses);

        updatePages(courses);

    } catch (err) {
        handleErrors(err);
    }
} // end function main

main();