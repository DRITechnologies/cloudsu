var fs = require('fs');

var cache = {};

module.exports = function (name) {
    if (!(name in cache))
        cache[name] = fs.readFileSync(__dirname + '/' + name);
    return cache[name];
}
