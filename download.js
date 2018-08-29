#!/usr/bin/env node
const cheerio = require('cheerio'),
    Enquirer = require('enquirer'),
    enquirer = new Enquirer,
    fs = require('fs'),
    canvas = require('canvas-api-wrapper'),
    setup = require('./setUp.js').main,
    path = require('path'),
    chalk = require('chalk'),
    handleErrors = require('./setup.js').errorHandling,
    npmWriteFile = require('write'),
    camelCase = require('camelcase'),
    validator = require('validator'),
    md5 = require('md5'),
    fileExists = require('file-exists');
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
            let pathInQuestion = pathName.slice(0, index + 1).join(path.sep);
            if (!isDir(pathInQuestion) && pathInQuestion) {
                fs.mkdirSync(pathInQuestion);
            }
        });
    }

    createDirectory(coursePath);
    return coursePath;
}


/**
 * 1. Sanitizes fileName
 * 2. Removes spaces and camelCases
 * 3. Either adds course/page ID, or returns just name
 * @param {object} toBeWritten 
 */
function createFileName(name, number, fullCourse) {

    /**
     * Removes characters that are not allowed in URL
     * You can change what is and isn't allowed by changeing `notAllowed`
     *  * Uses regex, so escape characters as needed
     * @param {String} fileName 
     */
    function sanitizeFileName(fileName) {
        let notAllowed = ';/?:@&=+$,';
        return validator.blacklist(fileName, notAllowed);
    }

    let sanitized = sanitizeFileName(name);
    name = `${camelCase(sanitized)}`;
    console.log(name);
    // This needs to be run if the 'fullcourse' option is selected false
    if (!fullCourse) name = `${name}-${number}`;
    return name;
}

/**
 * Compares hash of new file to any existing file of the same name
 * @param {String} page 
 * @param {String} filePath 
 */
function checkContents(page, filePath) {
    return new Promise((resolve, reject) => {
        console.log(chalk.blue('FILE PATH: '), filePath);
        fileExists(filePath, (err, exists) => {
            if (!exists) {
                resolve(true);
            } else {
                fs.readFile(filePath, 'utf-8', (err, oldFile) => {
                    if (err) reject(err);
                    let oldFileHash = md5(oldFile);
                    let newFileHash = md5(page);
                    if (oldFileHash === newFileHash) resolve(false);
                    else resolve(true);
                });
            }

        });
    });
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
            let $ = cheerio.load(htmlString);
            // Potential if(want the things removed) {run code below};
            htmlString = $('link, script').remove();
            htmlString = $.html();
        }
        let fileName = createFileName(page.title, page.page_id, fullCourse);
        let filePath = `${path.join(fullPath, fileName)}.html`;
        checkContents(htmlString, filePath)
            .then(valid => {
                if (valid) {
                    console.log(chalk.blueBright('Write file'));
                    npmWriteFile(filePath, htmlString);
                }
            })
            .catch(err => {
                console.error(err);
            });
    });
}

main();