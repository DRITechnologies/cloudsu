/*jshint esversion: 6 */
'use strict';

const NodeCache = require('node-cache');
const Cache = new NodeCache({
    stdTTL: 3000,
    checkperiod: 150
});

class cache {
    constructor() {}

    get(key) {
        return Cache.get(key);
    }

    set(key, obj) {
        return Cache.set(key, obj);
    }

    flush() {
        return Cache.flushAll();
    }
}


module.exports = new cache();
