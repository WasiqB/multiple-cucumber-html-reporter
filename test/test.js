'use strict';
const path = require('path');

const test = require('../lib/generate-report');

/**
 * Generate a report for browsers
 */
test.generate({
	saveCollectedJSON: true,
	jsonDir: './test/unit/data/json/',
	reportPath: './.tmp/browsers/',
	reportName: 'You can adjust this report name',
	customMetadata: false,
	displayDuration: true,
	durationInMS: true,
	customData: {
		title: 'Run info',
		data: [
			{label: 'Project', value: 'Custom project'},
			{label: 'Release', value: '1.2.3'},
			{label: 'Cycle', value: 'B11221.34321'},
			{label: 'Execution Start Time', value: 'Nov 19th 2017, 02:31 PM EST'},
			{label: 'Execution End Time', value: 'Nov 19th 2017, 02:56 PM EST'}
		]
	}
});

/**
 * Generate a report for browsers with a custom template
 */
test.generate({
	saveCollectedJSON: true,
	jsonDir: './test/unit/data/json/',
	reportPath: './.tmp/browsers/custom-templates/',
	reportName: 'You can adjust this report name',
	customMetadata: false,
	displayDuration: true,
	durationInMS: true,
	customData: {
		title: 'Run info',
		data: [
			{label: 'Project', value: 'Custom project'},
			{label: 'Release', value: '1.2.3'},
			{label: 'Cycle', value: 'B11221.34321'},
			{label: 'Execution Start Time', value: 'Nov 19th 2017, 02:31 PM EST'},
			{label: 'Execution End Time', value: 'Nov 19th 2017, 02:56 PM EST'}
		]
	},
	customTemplate: {
		featuresOverview: path.join(__dirname, 'custom-templates', 'features-overview.tmpl')
	}
});

/**
 * Generate a report with array of embedded data
 */
test.generate({
	saveCollectedJSON: true,
	jsonDir: './test/unit/data/embedded-array-json/',
	reportPath: './.tmp/embedded-array/',
	customStyle: path.join(__dirname, './custom.css'),
	overrideStyle: path.join(__dirname, './my.css'),
	customMetadata: false,
	pageTitle: 'A custom page title',
	pageFooter: '<div><p>Some custom footer data can be placed here</p></div>',
	customData: {
		title: 'Run info',
		data: [
			{label: 'Project', value: 'Custom embedded project'},
			{label: 'Release', value: '4.5.6'}
		]
	}
});

/**
 * Generate a report with custom metadata
 * NOTE: must be last, if you use customMetadata you cannot reuse generator
 */
test.generate({
	saveCollectedJSON: true,
	jsonDir: './test/unit/data/custom-metadata-json/',
	reportPath: './.tmp/custom-metadata/',
	customMetadata: true,
	displayDuration: true
});
