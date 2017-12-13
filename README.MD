Multiple Cucumber HTML Reporter
===============================
[![Join the chat at https://gitter.im/wswebcreation/protractor-cucumber-typescript-boilerplate](https://badges.gitter.im/wswebcreation/multiple-cucumber-html-reporter.svg)](https://gitter.im/wswebcreation/multiple-cucumber-html-reporter?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![dependencies Status](https://david-dm.org/wswebcreation/multiple-cucumber-html-reporter/status.svg)](https://david-dm.org/wswebcreation/multiple-cucumber-html-reporter) [![Build Status](https://travis-ci.org/wswebcreation/multiple-cucumber-html-reporter.svg?branch=master)](https://travis-ci.org/wswebcreation/multiple-cucumber-html-reporter) [![Coverage Status](https://coveralls.io/repos/github/wswebcreation/multiple-cucumber-html-reporter/badge.svg?branch=master)](https://coveralls.io/github/wswebcreation/multiple-cucumber-html-reporter?branch=master)

[![NPM](https://nodei.co/npm/multiple-cucumber-html-reporter.png)](https://nodei.co/npm/multiple-cucumber-html-reporter/)

Multiple Cucumber HTML Reporter is a reporting module for Cucumber to parse the JSON output to a beautiful report. The difference between all the other reporting modules on the market is that this module has:

- a quick overview of all tested features and scenarios
- a features overview that can hold multiple runs of the same feature / runs of the same feature on different browsers / devices
- a features overview that can be searched / filtered / sorted
- a feature(s) overview with metadata of the used browser(s) / devices


![Snapshot - Features overview](./docs/images/features-overview.jpg "Snapshot - Features overview")

A sample can be found [here](https://wswebcreation.github.io/multiple-cucumber-html-reporter/)

## Install
Install this module locally with the following command:

``` bash
npm install multiple-cucumber-html-reporter
```

Save to dependencies or dev-dependencies:

``` bash
npm install multiple-cucumber-html-reporter --save
npm install multiple-cucumber-html-reporter --save-dev
```

## Compatibility
Multiple Cucumber HTML Reporter **now works with CucumberJS 1, 2 and 3**.

## Usage
> **If you are using Protractor I would advise you to use [protractor-multiple-cucumber-html-reporter-plugin](https://github.com/wswebcreation/protractor-multiple-cucumber-html-reporter-plugin).**

> **It provides `multiple-cucumber-html-reporter` and some nice integration features that will make using Protractor + CucumberJS 1/2/3 nicely integrate with only a few lines of code.**

### cucumber-js 2.x and lower
Multiple Cucumber HTML Reporter transforms the Cucumber JSON output to a beautiful report. In order to let this happen add the piece of code that is placed below to CucumberJS `AfterFeatures`-hook.

```javascript
const report = require('multiple-cucumber-html-reporter');

report.generate({
	jsonDir: './path-to-your-json-output/',
	reportPath: './path-where-the-report-needs-to-be/',
	metadata:{
        browser: {
            name: 'chrome',
            version: '60'
        },
        device: 'Local test machine',
        platform: {
            name: 'ubuntu',
            version: '16.04'
        }
    },
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
```

### cucumber-js 3.x
Since cucumber-js 3.x the `AfterFeatures` hook is not supported anymore. To use Multiple Cucumber HTML Reporter it must be run in a separate node executable after the cucumber-js process finishes.


> **IMPORTANT:**

> Make sure that, when you generate the JSON files with Cucumber, each file will have a **UNIQUE** name. If you don't provide a unique name Cucumber will **override** the JSON files.

> **Advice** is to use for example the name of the feature, the name of the browser / device it is running on AND a unix timestamp with for example this `(new Date).getTime();`. This will result in something like this `name_of_feature.chrome.1495298685509.json`

> 

## Options
### `jsonDir`
- **Type:** `String`
- **Mandatory:** Yes

The directory that will hold all the generated JSON files, relative from where the script is started.

**N.B.:** If you use a npm script from the command line, like for example `npm run generate-report` the `jsonDir` will be relative from the path where the script is executed. Executing it from the root of your project will also search for the `jsonDir` from the root of you project.

### `reportPath`
- **Type:** `String`
- **Mandatory:** Yes

The directory in which the report needs to be saved, relative from where the script is started.

**N.B.:** If you use a npm script from the command line, like for example `npm run generate-report` the `reportPath` will be relative from the path where the script is executed. Executing it from the root of your project will also save the report in the `reportPath` in the root of you project.

### `openReportInBrowser`
- **Type:** `boolean`
- **Mandatory:** No

If true the report will automatically be opened in the default browser of the operating system.

### `saveCollectedJSON`
- **Type:** `boolean`
- **Mandatory:** No

This module will first merge all the JSON-files to 1 file and then enrich it with data that is used for the report. If `saveCollectedJSON :true` the merged JSON **AND** the enriched JSON will be saved in the `reportPath`. They will be saved as:

- `merged-output.json`
- `enriched-output.json`

### `disableLog`
- **Type:** `boolean`
- **Mandatory:** No
- **Default:** `false`

This will disable the log so will **NOT** see this.

```shell
=====================================================================================
    Multiple Cucumber HTML report generated in:

    /Users/wswebcreation/multiple-cucumber-html-reporter/.tmp/index.html
========================================================================
```

### `reportName`
- **Type:** `string`
- **Mandatory:** No

You can change the report name to a name you want

### `metadata`
- **Type:** `JSON`
- **Mandatory:** No

Print more data to your report, such as browser name + version, platform name + version and your environment. The values need to meet some predefined data, see [Metadata](#metadata) for more info.
Data can be passed like below.

> **If you provide the metadata when instantiating `multi-cucumber-html-reporter` the metadata will be added to each feature. If you already have metadata in your JSON then the metadata in the JSON will be leading**

```js
metadata:{
    browser: {
        name: 'chrome',
        version: '60'
    },
    device: 'Local test machine',
    platform: {
        name: 'ubuntu',
        version: '16.04'
    }
}
```

See [metadata](#metadata-1) for more info

### `customData`
- **Type:** `object`
- **Mandatory:** No

You can add a custom data block to the report like this

![Snapshot - Features overview custom data](./docs/images/custom-data.jpg "Snapshot - Features overview custom data")

```js
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
```

#### `customData.title`
- **Type:** `string`
- **Mandatory:** No
- **Default:** `Custom data title`

Select a title for the custom data block. If not provided it will be defaulted.

#### `customData.data`
- **Type:** `array`
- **Mandatory:** yes

The data you want to add. This needs to be in the format

```js
data: [
    {label: 'your label', value: 'the represented value'}
]
```

## Metadata
The report can also show on which browser / device a feature has been executed. It is shown on the featurs overview in the table as well as on the feature overview in a container.

### Adding metadata to the Cucumber JSON

To be able to see this you will need to add the following to the Cucumber JSON before you save it.


```javascript
// This represents the Cucumber JSON file that has be retrieved
const cucumberJSON;

const metadata = "metadata": {
	"browser": {
		"name": "chrome",
		"version": "58"
	},
	"device": "string",
	"platform": {
		"name": "osx",
		"version": "10.12"
	}
}

// Add it with for example
cucumberJSON[0].metadata = metadata;

// Now save the file to the disk
```

### `metadata.app.name`
- **Type:** `string`

**e.g.:** The version of the app.

### `metadata.app.version`
- **Type:** `string`

**e.g.:** The version of the app.

### `metadata.browser.name`
- **Type:** `string`
- **Possible values:** `internet explorer | edge | chrome | firefox | safari`

> If no correct value is provided the `?`-icon with the text `not known` is shown

### `metadata.browser.version`
- **Type:** `string`

**e.g.:** The version of the browser, this can be added manual or retrieved during the execution of the tests to get the exact version number.

>If no correct value is provided the `?`-icon with the text `not known` is shown

### `metadata.device`
- **Type:** `string`

**e.g.:** A name that represents the type of device. For example, if you run it on a virtual machine, you can place it here `Vitrual Machine`, or the name of the mobile, like for example `iPhone 7 Plus`.

> If no correct value is provided the `?`-icon with the text `not known` is shown

### `metadata.platform.name`
- **Type:** `string`
- **Possible values:** `windows | osx | linux | ubuntu | android | ios`

> If no correct value is provided the `?`-icon with the text `not known` is shown

### `metadata.platform.version`
- **Type:** `string`

**e.g.:** The version of the platform

>If no correct value is provided the `?`-icon with the text `not known` is shown

### Metadata example features overview
![Snapshot - Features overview browser / device info](./docs/images/overview-metadata.jpg "Snapshot - Features overview browser / device info")

### Metadata example scenario with and without known data
![Snapshot - Scenario browser / device info](./docs/images/scenario-browser-metadata.jpg "Snapshot - Scenario browser / device info")
![Snapshot - Scenario app / device info](./docs/images/scenario-app-metadata.jpg "Snapshot - Scenario app / device info")
![Snapshot - Scenario browser / device info not known](./docs/images/scenario-no-metadata.jpg "Snapshot - Scenario browser / device info not known")

## FAQ
### Only 1 report is shown in the features overview table
It could be that the name of the Cucumber JSON file that has been saved is not unique (enough).

My advice is to use for example:

- the name of the feature
- the name of the browser / device it is running on
- a unix timestamp with for example this `(new Date).getTime();`

This will result in something like this `name_of_feature.chrome.1495298685509.json`.

The advantage of this is that when you look at the folder where the Cucumber JSON-files are saved you can see:

- the features that have been executed
- on which browser
- a timestamp to see which feature has been executed the last (if featurename and browser are the same)

### Metdata shows `not known` or not the correct icons
There could be 2 causes:

 1. The metadata has not (correctly) been added to the Cucumber JSON.
 2. The `metadata.browser.name` or `metadata.platform.name` can't be mapped to the right icon

To fix this see the part about **Metadata** and check the **possible values**.

### How to attach Screenshots to HTML report
You can attach screenshots at any time to a Cucumber JSON file. Just create a Cucumber `scenario`-hook that will handle this. You can add them during running or when a `scenario` failed.

Depending on the framework you are using, you can add a screenshot to the report like this

```javascript
return driver.takeScreenshot()
	.then(function (buffer) {
    	const decodedImage = new Buffer(screenshot.replace(/^data:image\/png;base64,/, ''), 'base64');
        scenario.attach(decodedImage, 'image/png');
  }
```

### How to attach Plain Text to HTML report
You can attach plain-text / data at any time to a Cucumber JSON file to help debug / review the results. You can add them during running or when a `scenario` failed.

```javascript
scenario.attach('place here what you want to show in the report');
```

### How to attach pretty JSON to HTML report
You can attach JSON at any time to a Cucumber JSON file. You can add them during running or when a `scenario` failed.

```javascript
scenario.attach(JSON.stringify(yourJsonObject));
```

## Changelog
The Changelog can be found [here](./CHANGELOG.md)

## Contributing
How to contribute can be found [here](./docs/CONTRIBUTING.md)

## Credits
In the search for a reporting tools for Cucumber I found a few tools that helped me a lot:

- [cucumber-html-repository](https://github.com/gkushang/cucumber-html-reporter)
- [cucumber-html-report](https://github.com/leinonen/cucumber-html-report)
- [cucumber-protractor-report](https://github.com/JesterXL/cucumber-protractor-report)
- [grunt-protractor-cucumber-html-report](https://github.com/robhil/grunt-protractor-cucumber-html-report)

