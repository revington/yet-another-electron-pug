'use strict';
const assert = require('assert');
const fs = require('fs');
const {
    FAILED,
    FILE_NOT_FOUND,
    fixWindowsPath,
    completion,
    createHandler,
    getPath,
    handleNonPugContent,
    handlePugContent
} = require('../lib');
describe('#getPath(url)', function () {
    it('should return the path', function () {
        const input = 'file:///home/something.ext';
        const actual = getPath(input);
        assert.deepEqual(actual, '/home/something.ext');
    });
});
describe('#fixWindowsPath(input)', function () {
    it('should remove the first slash', function () {
        assert.deepEqual(fixWindowsPath('/c:/some'), 'c:/some');
        assert.deepEqual(fixWindowsPath('c:/some'), 'c:/some');
    });
});
describe('#completion(err)', function () {
    it('should throw received error', function () {
        try {
            completion(new Error('hello'));
        } catch (e) {
            assert.deepEqual(e.message, 'hello');
            return;
        }
        assert.fail();
    });
});
describe('#handleNonPugContent(file, ext, callback)', function () {
    var result;
    const nodeLogoFile = './test/fixtures/node-logo.svg.png';
    before(function (done) {
        handleNonPugContent(nodeLogoFile, 'png', function (res) {
            if (!Number.isNaN(+res)) {
                return done(new Error('received error code' + res));
            }
            result = res;
            return done();
        });
    });
    it('should callback that file contents', function (done) {
        fs.readFile(nodeLogoFile, function (err, data) {
            assert.deepEqual(data, result.data);
            return done();
        });
    });
    it('should callback that file mime type', function () {
        assert.deepEqual(result.mimeType, 'image/png');
    });
    describe('When `file` is not found', function () {
        it('should return `FILE_NOT_FOUND`', function (done) {
            handleNonPugContent('./test/fixtures/nothing', 'png', function (res) {
                assert.deepEqual(FILE_NOT_FOUND, res);
                return done();
            });
        });
    });
});
describe('#handlePugContent(file, pugOptions, locals, callback)', function () {
    var result;
    before(function (done) {
        handlePugContent('./test/fixtures/hello.pug', {
            pretty: true
        }, {
            greeting: 'hello'
        }, function (res) {
            if (!Number.isNaN(+res)) {
                return done(new Error('received error code' + res));
            }
            result = res;
            return done();
        });
    });
    it('should callback file contents as buffer', function () {
        assert(result.data instanceof Buffer, 'expecting a Buffer');
    });
    it('should callback that file mime type', function () {
        assert.deepEqual(result.mimeType, 'text/html');
    });
    it('should pass `locals` to pug compiler', function () {
        var html = result.data.toString();
        assert(html.indexOf('hello') > -1);
    });
    it('should pass pugOptions to pugCompiler', function () {
        var html = result.data.toString();
        assert(html.split('\n').length > 2, 'expecting multiline string because `pretty` was set to true. Instead got\n' + html);
    });
    describe('When `file` is not found', function () {
        it('should return `FILE_NOT_FOUND`', function (done) {
            handlePugContent('./test/fixtures/nothing', {}, {}, function (res) {
                assert.deepEqual(FILE_NOT_FOUND, res);
                return done();
            });
        });
    });
    describe('When `pug.compile` fails', function () {
        it('should callback that error', function (done) {
            handlePugContent('./test/fixtures/broken.pug', {
                pretty: true
            }, {}, function (res) {
                const contents = res.data.toString();
                const expectedError = 'Invalid indentation, you can use tabs or spaces but not both</pre>';
                assert(contents.indexOf(expectedError > -1));
                return done();
            });
        });
    });
});
describe('#createHandler(pugOptions, beforePugFileLoad)', function () {
    describe('new handler', function () {
        var file;
        var result;
        before(function (done) {
            function beforePugFileLoad(_file, cb) {
                file = _file;
                cb({
                    greeting: 'helloooo'
                });
            }
            let handler = createHandler({}, beforePugFileLoad);
            let url =
                'file://' + __dirname + '/fixtures/hello.pug';
            handler({
                    url
                },
                function (res) {
                    result = res;
                    return done();
                });
        });
        it('should call beforePugFileLoad before loading every pug file', function () {
            assert(file.indexOf('hello.pug') > -1);
        });
        it('locals should be passed to pugCompiler along the file', function () {
            const contents = result.data.toString();
            assert(contents.indexOf('helloooo') > -1);
        });
    });
});
