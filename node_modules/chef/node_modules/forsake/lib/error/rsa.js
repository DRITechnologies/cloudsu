var assert = require('assert'),
    util = require('util');

var RsaError = module.exports = function(messages) {

    if (!Array.isArray(messages))
        messages = arguments.length ? [messages] : [];

    //handle constructor call without 'new'
    if (! (this instanceof RsaError)) {
        return new RsaError(messages);
    }

    //populate error details
    this.name = 'RsaError';
    if (messages.length > 0)
        this.message = messages.shift();
    this.failures = messages;

    //include stack trace in error object
    Error.captureStackTrace(this, this.constructor);

};

util.inherits(RsaError, Error);

RsaError.prototype.toString = function() {
    return this.name + ': ' + this.message.toString();
};
