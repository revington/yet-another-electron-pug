'use strict';
const {
    app,
    protocol
} = require('electron');
const  {
    createHandler,
    completion,
} = require('./lib');

function register(pugOptions, localsHook) {
    function intercept() {
        protocol.interceptBufferProtocol('file', createHandler(pugOptions, localsHook), completion);
    }
    if (app.isReady()) {
        intercept();
    } else {
        app.on('ready', intercept);
    }
}
exports = module.exports = register;
