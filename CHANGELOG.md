CHANGELOG
=========

<a name="1.2.0"></a>
## [1.2.0](https://github.com/wswebcreation/multiple-cucumber-html-reporter/compare/v1.1.0...v1.2.0) (2017-11-13)

### Features

* **feature:** add `app` as a metadata and update the docs

<a name="1.1.0"></a>
## [1.1.0](https://github.com/wswebcreation/multiple-cucumber-html-reporter/compare/v1.0.1...v1.1.0) (2017-09-22)

### Features

* **feature:** add option to disable the log when a report has been generated
* **feature:** defaulted the dropdown to 50 and updated the options to `[50, 100, 150, "All"]`
* **feature:** added *created by* to templates

<a name="1.0.1"></a>
## [1.0.1](https://github.com/wswebcreation/multiple-cucumber-html-reporter/compare/v1.0.0...v1.0.1) (2017-09-12)

### Bug Fixes

* **fix:** fixed typos, see [PR 9](https://github.com/wswebcreation/multiple-cucumber-html-reporter/pull/9), tnx to [achingbrain](https://github.com/achingbrain)

<a name="1.0.0"></a>
## [1.0.0](https://github.com/wswebcreation/multiple-cucumber-html-reporter/compare/v0.2.1...v1.0.0) (2017-09-08)

### Features

* **feature:** added support for CucumberJS 3, the only thing that has changes for reporting is that the `embedding.mime_type` has been changed to `embedding.media.type`.
* **feature:** `metadata` is now also an option, see the readme

<a name="0.2.1"></a>
## [0.2.1](https://github.com/wswebcreation/multiple-cucumber-html-reporter/compare/v0.2.0...v0.2.1) (2017-07-26)

### Bug Fixes

* **fix:** Styling for showing scenario title on smaller window size (< `1200 px`)


<a name="0.2.0"></a>
## [0.2.0](https://github.com/wswebcreation/multiple-cucumber-html-reporter/compare/v0.1.3...v0.2.0) (2017-07-18)

### Features

* **feature:** parse json to show info when `embedding.mime_type` is text and can be parsed as a JSON

### Bug Fixes

* **fix:** remove the embedding image to limit the output size
* **fix:** making the `+ Show Error`, `+ Show Info` and `Screenshot`- link more unique


<a name="0.1.3"></a>
## [0.1.3](https://github.com/wswebcreation/multiple-cucumber-html-reporter/compare/v0.1.2...v0.1.3) (2017-06-23)

### Bug Fixes

* **fix:** fix templates to work with node 4.4.5 by removing blockbindings

<a name="0.1.2"></a>
## [0.1.2](https://github.com/wswebcreation/multiple-cucumber-html-reporter/compare/v0.1.1...v0.1.2) (2017-05-26)

### Bug Fixes

* **fix:** sanitize `feature.id` that is used for urls in the features overview


<a name="0.1.1"></a>
## [0.1.1](https://github.com/wswebcreation/multiple-cucumber-html-reporter/compare/v0.1.0...v0.1.1) (2017-05-24)

### Bug Fixes

* **fix:** `embedding.mime_type  'text/plain'` can have encoded and plain text. Fixed this with a base64 check and added tests


<a name="0.1.0"></a>
## 0.1.0 (2017-05-21)

### Features

* **initial:** initial version of `Multiple Cucumer HTML Reporter`



