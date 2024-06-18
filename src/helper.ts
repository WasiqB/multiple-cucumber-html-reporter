import { DateTime, Duration } from "luxon";
import fs from "fs-extra";
import path from "path";

/**
 * Formats input date to yyyy/MM/dd HH:mm:ss
 *
 * @param {Date} date
 * @returns {string} formatted date in ISO format local time
 */
export const formatToLocalIso = (date: Date | string): string => {
  return typeof date === "string"
    ? DateTime.fromISO(date).toFormat("yyyy/MM/dd HH:mm:ss")
    : DateTime.fromJSDate(date).toFormat("yyyy/MM/dd HH:mm:ss");
};

/**
 * Calculate and return the percentage
 * @param {number} amount
 * @param {number} total
 * @return {string} percentage
 * @private
 */
export const calculatePercentage = (amount: number, total: number): string => {
  return ((amount / total) * 100).toFixed(2);
};

/**
 * Read a template file and return it's content
 * @param {string} fileName
 * @return {*} Content of the file
 * @private
 */
export const readTemplateFile = (fileName: string): string => {
  if (fileName) {
    try {
      fs.accessSync(fileName, fs.constants.R_OK);
      return fs.readFileSync(fileName, "utf-8");
    } catch (err) {
      return fs.readFileSync(
        path.join(__dirname, "..", "templates", fileName),
        "utf-8"
      );
    }
  }
  return "";
};

/**
 * Escape html in string
 * @param string
 * @return {string}
 * @private
 */
export const escapeHtml = (text: string): string => {
  return text.replace(
    /[^0-9A-Za-z ]/g,
    (chr) => "&#" + chr.charCodeAt(0) + ";"
  );
};

/**
 * Formats the duration to HH:mm:ss.SSS.
 *
 * @param {number} duration a time duration usually in ns form; it can be
 * possible to interpret the value as ms, see the option {durationInMS}.
 *
 * @return {string} the duration formatted as a string
 */
export const formatDuration = (duration: number, inMillis: boolean): string => {
  return Duration.fromMillis(inMillis ? duration : duration / 1000000).toFormat(
    "hh:mm:ss.SSS"
  );
};
