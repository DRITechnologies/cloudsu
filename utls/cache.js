var NodeCache = require("node-cache");
var Cache = new NodeCache({
    stdTTL: 300,
    checkperiod: 150
});

function cache() {}

cache.prototype.get = function (key) {
    return Cache.get(key);
};

cache.prototype.set = function (key, obj) {
    return Cache.set(key, obj);
};

cache.prototype.flush = function () {
    return Cache.flushAll();
};


module.exports = new cache();