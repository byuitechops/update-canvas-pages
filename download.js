const Enquirer = require('enquirer');
const enquirer = new Enquirer;
const fs = require('fs');
const canvas = require('canvas-api-wrapper');
const setup = require('./setUp.js');
const chalk = require('chalk');

// Use Enquirer to get the course ID from the user
function getCourseID() {
    return new Promise((resolve, reject) => {
        enquirer.question('course_ID', 'ID of the course you want to download', { default: 12845 });
        enquirer.ask('course_ID')
            .then(answers => {
                resolve(answers.course_ID);
            })
            .catch(reject);

    })
};

function writeToHD(pages, path, course_ID = 0) {
    return new Promise((resolve, reject) => {
        if (course_ID === 0) {
            for (let page in pages) {
                fs.writeFile(page, `${page.page_id} | ${page.title}`, err => {
                    if (err) throw err;
                });
            }
        }
        else {
            fs.mkdir(pages);
        }
    })
}

async function main() {
    let course_ID = await getCourseID();
    // console.log(course_ID);
    let path = await setup(canvas);
    // console.log(path);
    console.log(`This file is ${__dirname}`);
    console.log(process.cwd());
    process.chdir('../../')
    console.log(process.cwd());
    // process.chdir(path);

    // writeToHD(course_ID);
    // let pages = await canvas.getCourse(course_ID).pages.get();
    // // writeToHD(pages, path);
}

main();