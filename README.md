[![Build Status](https://travis-ci.org/revington/yet-another-electron-pug.svg?branch=master)](https://travis-ci.org/revington/yet-another-electron-pug)
[![Known Vulnerabilities](https://snyk.io/test/github/revington/yet-another-electron-pug/badge.svg?targetFile=package.json)](https://snyk.io/test/github/revington/yet-another-electron-pug?targetFile=package.json)
[![Coverage Status](https://coveralls.io/repos/github/revington/yet-another-electron-pug/badge.svg?branch=master)](https://coveralls.io/github/revington/yet-another-electron-pug?branch=master)
# yet-another-electron-pug
Yet another electron pug plugin. Main advantage over other similar modules is the ability to update `pug locals` on every file load.

## Install
```
$ npm install yet-another-electron-pug
```
## Usage
```
const electronPug = require('yet-another-electron-pug');

const pugOptions = {
    pretty: true
};

function onFileLoad(file, cb){
    var locals = {greeting:'hello'};
    return cb(locals);
}

electronPug(pugOptions, onFileLoad);
```
