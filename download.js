#!/usr/bin/env node
const cheerio = require('cheerio');
const Enquirer = require('enquirer'),
    enquirer = new Enquirer,
    fs = require('fs'),
    canvas = require('canvas-api-wrapper'),
    setup = require('./setUp.js').main,
    path = require('path'),
    handleErrors = require('./setup.js').errorHandling,
    npmWriteFile = require('write'),
    camelCase = require('camelcase');
enquirer.register('radio', require('prompt-radio'));

function getCourseID() {
    return new Promise((resolve, reject) => {
        enquirer.question('course_ID', 'ID of the course you want to download?', {
        });
        enquirer.question('fullHtml', 'Do you want the full HTML of the page?', {
            default: 'no',
            type: 'radio',
            choices: ['Yes', 'No']
        });
        enquirer.ask()
            .then(answers => {
                resolve(answers);
            })
            .catch(reject);
    });
}


function verifyPath(coursePath) {

    /**
     * Checks if the directory exists.
     * Creates it if it doesn't.
     * 
     * Code drawn from StackOverflow: https://stackoverflow.com/a/40385651
     * 
     * @param {String} pathName 
     */
    function createDirectory(pathName) {
        function isDir(dpath) {
            try {
                return fs.lstatSync(dpath).isDirectory();
            } catch (e) {
                return false;
            }
        }

        pathName = path.normalize(pathName).split(path.sep);
        pathName.forEach((sdir, index) => {
            var pathInQuestion = pathName.slice(0, index + 1).join(path.sep);
            if (!isDir(pathInQuestion) && pathInQuestion) {
                fs.mkdirSync(pathInQuestion);
            }
        });
    }

    createDirectory(coursePath);
    return coursePath;
}


/**
 * 
 * @param {object} toBeWritten 
 */
function createFileName(name, number, fullCourse) {
    // This needs to be run every time
    name = `${camelCase(name)
        .replace(/\W/g, '')}`;
    // This needs to be run if the 'fullcourse' option is selected false
    if (!fullCourse) name = `${name}-${number}`;
    return name;
}

async function main() {
    let dirPath = await setup(canvas);
    let answers = await getCourseID();
    let course_ID = answers.course_ID;
    let fullCourse = answers.fullHtml === 'Yes' ? true : false;
    let course = await canvas.getCourse(course_ID).get();
    let courseName = createFileName(course.course_code, course.id, fullCourse);
    let pages = await course.pages.getComplete();
    let fullPath = verifyPath(path.join(dirPath, courseName));

    pages.map(page => {
        let htmlString = page.getHtml();
        if (fullCourse) {
            var $ = cheerio.load(htmlString);
            // Potential if(want the things removed) {run code below};
            htmlString = $('link, script').remove();
            htmlString = $.html();
        }
        let fileName = createFileName(page.title, page.page_id, fullCourse);
        let filePath = path.join(fullPath, fileName);
        console.log(filePath);
        npmWriteFile(`${filePath}.html`, htmlString);
    });
}

main();