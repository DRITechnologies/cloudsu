(function() {
  var convertObject, fromDynamo, toDynamo, util, _;

  _ = require('lodash');

  util = require('util');


  /*
     converts a DynamoDB compatible JSON object into
     a native JSON object
     @param dbObj the dynamodb JSON object
     @throws an error if input object is not compatible
     @return res the converted object
   */

  convertObject = function(obj) {
    var converted, key, value;
    converted = {};
    for (key in obj) {
      value = obj[key];
      converted[key] = fromDynamo(value);
    }
    return converted;
  };

  fromDynamo = function(dbObj) {
    var element, key, obj, _i, _len;
    if (_.isArray(dbObj)) {
      obj = [];
      for (key = _i = 0, _len = dbObj.length; _i < _len; key = ++_i) {
        element = dbObj[key];
        obj[key] = fromDynamo(element);
      }
      return obj;
    }
    if (_.isObject(dbObj)) {
      if (dbObj.M) {
        return convertObject(dbObj.M);
      } else if ((dbObj.BOOL != null)) {
        return dbObj.BOOL;
      } else if (dbObj.S) {
        return dbObj.S;
      } else if (dbObj.SS) {
        return dbObj.SS;
      } else if (dbObj.N) {
        return parseFloat(dbObj.N);
      } else if (dbObj.NS) {
        return _.map(dbObj.NS, parseFloat);
      } else if (dbObj.L) {
        return _.map(dbObj.L, fromDynamo);
      } else if (dbObj.NULL) {
        return null;
      } else {
        return convertObject(dbObj);
      }
    } else {
      return dbObj;
    }
  };

  module.exports.fromDynamo = fromDynamo;

  toDynamo = function(item) {
    var array, key, map, obj, value, _i, _len;
    if (_.isArray(item)) {
      if (_.every(item, _.isNumber)) {
        return obj = {
          'NS': item
        };
      } else if (_.every(item, _.isString)) {
        return obj = {
          'SS': item
        };
      } else if (_.every(item, _.isObject)) {
        array = [];
        for (_i = 0, _len = item.length; _i < _len; _i++) {
          value = item[_i];
          array.push(toDynamo(value));
        }
        return obj = {
          'L': array
        };
      } else {
        throw new TypeError('Expected homogenous array of numbers or strings');
      }
    } else if (_.isNumber(item)) {
      return obj = {
        'N': item.toString()
      };
    } else if (_.isString(item)) {
      return obj = {
        'S': item
      };
    } else if (_.isBoolean(item)) {
      return obj = {
        'BOOL': item
      };
    } else if (_.isObject(item)) {
      map = {};
      for (key in item) {
        value = item[key];
        map[key] = toDynamo(value);
      }
      return obj = {
        'M': map
      };
    } else if (item === null) {
      return obj = {
        'NULL': true
      };
    } else if (!item) {
      throw new TypeError("toDynamo() does not support mapping " + (util.inspect(item)));
    }
  };

  module.exports.toDynamo = toDynamo;

}).call(this);
