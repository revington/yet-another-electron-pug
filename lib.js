'use strict';
const fs = require('fs');
const path = require('path');
const pug = require('pug');
const mime = require('mime');
const {
    parse
} = require('url');
// ERROR CODES
// https://code.google.com/p/chromium/codesearch#chromium/src/net/base/net_error_list.h
const FILE_NOT_FOUND = -6;
const FAILED = -2;

function fixWindowsPath(input) {
    if (input[0] === '/') {
        return input.substr(1);
    }
    return input;
}

function getPath(url) {
    let parsed = parse(url);
    let result = decodeURIComponent(parsed.pathname);
    if (process.platform === 'win32') {
        return fixWindowsPath(result);
    }
    return result;
}

function handlePugContent(file, pugOptions, locals, callback) {
    var defaultPugOptions = {
        filename: file
    };
    Object.assign(pugOptions, defaultPugOptions);
    fs.readFile(file, 'utf8', function (err, content) {
        var result;
        if (err && err.code === 'ENOENT') {
            return callback(FILE_NOT_FOUND);
        }
        if (err) {
            return callback(FAILED);
        }
        try {
            result = pug.compile(content, pugOptions)(locals);
        } catch (e) {
            result = `<pre style="tab-size:1">${e}</pre>`;
        }
        return callback({
            data: new Buffer(result),
            mimeType: 'text/html'
        });
    });
}

function handleNonPugContent(file, ext, callback) {
    fs.readFile(file, function (err, content) {
        if (err && err.code === 'ENOENT') {
            return callback(FILE_NOT_FOUND);
        }
        if (err) {
            return callback(FAILED);
        }
        return callback({
            data: content,
            mimeType: mime.getType(ext)
        });
    });
}

function createHandler(pugOptions, localsHook) {
    return function handler(request, callback) {
        let file = getPath(request.url);
        const ext = path.extname(file).toLowerCase();
        if (ext === '.pug') {
            localsHook(file, function (locals) {
                handlePugContent(file, pugOptions, locals, callback);
            });
            return;
        }
        handleNonPugContent(file, ext, callback);
    };
}

function completion(err) {
    if (err) {
        throw err;
    }
}
exports = module.exports = {
    FAILED,
    FILE_NOT_FOUND,
    fixWindowsPath,
    completion,
    createHandler,
    getPath,
    handleNonPugContent,
    handlePugContent
};
