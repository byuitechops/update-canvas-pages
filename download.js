#!/usr/bin/env node
const Enquirer = require('enquirer'),
    enquirer = new Enquirer,
    fs = require('fs'),
    canvas = require('canvas-api-wrapper'),
    setup = require('./setUp.js').main,
    chalk = require('chalk'),
    path = require('path'),
    handleErrors = require('./setup.js').errorHandling;

function getCourseID() {
    return new Promise((resolve, reject) => {
        enquirer.question('course_ID', 'ID of the course you want to download', {
            default: 16786
        });
        enquirer.ask('course_ID')
            .then(answers => {
                resolve(answers.course_ID);
            })
            .catch(reject);
    });
}


function verifyPath(dirPath) {
    let homeDir = require('os').homedir();
    let pathToDir = path.join(homeDir, dirPath);

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

    createDirectory(pathToDir);
    return pathToDir;
}

function writeFile(path, fileGuts) {
    try {
        fs.writeFileSync(path, fileGuts);
    } catch (err) {
        handleErrors(err);
    }
    console.log(`${path} written`);
}

/**
 * 
 * @param {object} toBeWritten 
 */
function createFileName(name, number) {
    console.log(chalk.blue(name));
    return `${name
        .trim()
        .replace(/-|\s/g, '_')
        .replace(/\W/g, '')}-${number}`;
}

async function main() {
    let dirPath = await setup(canvas);
    let course_ID = await getCourseID();
    let course = await canvas.getCourse(course_ID).get();
    let courseName = createFileName(course.course_code, course.id);
    console.log(path.join(dirPath, courseName));
    let pages = await course.pages.getComplete();
    let fullPath = verifyPath(path.join(dirPath, courseName));
    // console.log(chalk.blue(pages[0].title));
    // console.log(chalk.red(pages[0].title.replace(/-/g, '_').replace(/\W/g, '')));

    pages.map(page => {
        let fileName = createFileName(page.title, page.page_id);
        let filePath = path.join(fullPath, fileName);
        writeFile(`${filePath}.html`, page.getHtml());
        //     return page.getHtml();
    });
}

main();