define(function (require) {
  var _ = require('lodash');

  _.mixin({
    move: function (array, fromIndex, toIndex) {
      array.splice(toIndex, 0, array.splice(fromIndex, 1)[0]);
      return array;
    },
    remove: function (array, index) {
      array.splice(index, 1);
      return array;
    },
    // If variable is value, then return alt. If variable is anything else, return value;
    toggle: function (variable, value, alt) {
      return variable === value ? alt : value;
    },
    toggleInOut: function (array, value) {
      if (_.contains(array, value)) {
        array = _.without(array, value);
      } else {
        array.push(value);
      }
      return array;
    },
    // NOTE: The flatten behavior here works if you don't need to keep a reference to the
    // original value
    flattenWith: function (dot, nestedObj, flattenArrays) {
      var key; // original key
      var stack = []; // track key stack
      var flatObj = {};
      (function flattenObj(obj) {
        _.keys(obj).forEach(function (key) {
          stack.push(key);
          if (!flattenArrays && _.isArray(obj[key])) flatObj[stack.join(dot)] = obj[key];
          else if (_.isObject(obj[key])) flattenObj(obj[key]);
          else flatObj[stack.join(dot)] = obj[key];
          stack.pop();
        });
      }(nestedObj));
      return flatObj;
    },
    // assign the properties of an object's subObject to the parent object.
    // obj = { prop: { a: 1} } ===> obj = { a: 1 }
    unwrapProp: function (obj, prop) {
      var wrapped = obj[prop];
      delete obj[prop];
      _.assign(obj, wrapped);
    },
    optMemoize: function (fn) {
      var memo = _.memoize(fn);
      return function () {
        if (arguments[0] == null) {
          return fn.apply(this, arguments);
        } else {
          return memo.apply(this, arguments);
        }
      };
    },
    isNumeric: function (v) {
      return !_.isNaN(v) && !_.isArray(v) && !_.isNaN(parseInt(v, 10));
    },
    setValue: function (obj, name, value) {
      var path = name.split('.');
      var current = obj;

      (function recurse() {
        var step = path.shift();

        if (path.length === 0) {
          current[step] = value;
        }

        if (_.isObject(current)) {
          current = current[step];
          recurse();
        }
      }());
    }
  });

  return _;
});
