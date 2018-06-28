const Enquirer = require('enquirer');
const enquirer = new Enquirer;
const fs = require('fs');
const canvas = require('canvas-api-wrapper');
const setup = require('./setUp.js');
const chalk = require('chalk');
const path = require('path');

// Use Enquirer to get the course ID from the user
function getCourseID() {
    return new Promise((resolve, reject) => {
        enquirer.question('course_ID', 'ID of the course you want to download', {
            default: 16956
        });
        enquirer.ask('course_ID')
            .then(answers => {
                resolve(answers.course_ID);
            })
            .catch(reject);
    });
}

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
        if (!isDir(pathInQuestion) && pathInQuestion) fs.mkdirSync(pathInQuestion);
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
            if (!isDir(pathInQuestion) && pathInQuestion) fs.mkdirSync(pathInQuestion);
        });
    }

    createDirectory(pathToDir);
    return pathToDir;
}

function writeFile(path, fileGuts) {
    try {
        fs.writeFileSync(path, fileGuts);
    } catch (err) {
        errorHandling(err);
    }
    console.log(color(`${path} written`));
}
}

async function main() {
    let dirPath = await setup(canvas);
    let course_ID = await getCourseID();
    let course = await canvas.getCourse(course_ID).get();
    let pages = await course.pages.getComplete();
    let fullPath = verifyPath(dirPath);
    let html = pages.map(page => {
        return page.getHtml();
    });

    writeFile(course);
    writeFile(pages);
    console.log(html);
}

main();