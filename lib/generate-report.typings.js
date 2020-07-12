/**
 * Generate Report Options
 * @typedef {Object} GenerateReportOptions
 * @property {string} jsonDir - Path to your JSON output.
 * @property {string} reportPath - Path to where teh report needs to be.
 * @property {Metadata} metadata - Report metadata
 * @property {CustomData} customData - Report Custom Data
 * @property {CustomTemplate} customTemplate - Report Custom Templates
 */

/**
 * Metadata Report
 * @typedef {Object} Metadata
 * @property {Object} browser
 * @property {string} device
 */

/**
 * Custom Data Report
 * @typedef {Object} CustomData
 * @property {string} title
 * @property {Object[]} data
 */

/**
 * Custom Templates Report
 * @typedef {Object} CustomTemplate
 * @property {string} featuresOverview - path to your custom features-overview.tmpl template file or to your custom features-overview-custom-metadata.tmpl template file if you are using customMetadata
 */
