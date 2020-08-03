const {join, resolve} = require('path');
const {readdirSync} = require('fs-extra');
const moment = require('moment');

/**
 * Find all JSON Files
 *
 * @param {string} dir
 *
 * @returns {string[]}
 */
function findJsonFiles(dir) {
    const folder = resolve(process.cwd(), dir);

    try {
        return readdirSync(folder)
            .filter(file => file.slice(-5) === '.json')
            .map(file => join(folder, file));
    } catch (e) {
        throw new Error(`There were issues reading JSON-files from '${folder}'.`);
    }
}

/**
 * Format input date to YYYY/MM/DD HH:mm:ss
 *
 * @param {Date} date
 *
 * @returns {string} formatted date in ISO format local time
 */
function formatToLocalIso(date) {
    return moment(date).format('YYYY/MM/DD HH:mm:ss')
}

module.exports = {
    findJsonFiles,
    formatToLocalIso,
}
