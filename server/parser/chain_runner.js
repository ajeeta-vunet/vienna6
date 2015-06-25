var aggspretion = require('../parser/chain.js');
var _ = require('lodash');
var Promise = require('bluebird');
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
});

// Contains the parsed sheet;
var sheet;

function getRequest (config) {
  var body = {
    query: {
      query_string: {
        query: config.query
      }
    },
    aggs: {
      series: {
        date_histogram: {
          field: '@timestamp',
          interval: '1w',
          extended_bounds: {
            min: 'now-2y',
            max: 'now'
          },
          min_doc_count: 0
        }
      }
    }
  };

  if (config.field && config.metric) {
    body.aggs.series.aggs = {metric: {}};
    body.aggs.series.aggs.metric[config.metric] = {field: config.field};
  }

  return body;
}

/**
 * Reduces multiple arrays into a single array using a function
 * @param {Array} arrayOfArrays - An array of series to reduce into a single series.
 * @params {Function} fn - Function used to combine points at same index in each array
 * @return {Array} A single series as modified by the fn
 */
function reduce (arrayOfArrays, fn) {
  return Promise.all(arrayOfArrays).then(function (arrayOfArrays) {
    return _.reduce(arrayOfArrays, function(destinationObject, argument) {

      var output = _.mapValues(destinationObject.data, function (value, key) {
        // Allow function to take 2 arrays of equal length, OR an array and a single number;
        // null points are not drawn
        if (value == null) {
          return null;
        }

        if (_.isNumber(argument)) {
          return fn(value, argument);
        }

        if (argument.data[key] == null) {
          return null;
        }

        return fn(value, argument.data[key]);
      });

      // Output = single series

      output = {
        data: output
      };
      output = _.defaults(output, destinationObject);
      return output;

    });
  });
}

function alter (args, fn) {
  return Promise.all(args).then(function (args) {
    return fn(args);
  });
}

function unzipPairs (timeValObject) {
  var paired = _.chain(timeValObject).pairs().map(function (point) {
    return [parseInt(point[0], 10), point[1]];
  }).sortBy(function (point) {
    return point[0];
  }).value();
  return paired;
}

function asSorted (timeValObject, fn) {
  var data = unzipPairs(timeValObject);
  return _.zipObject(fn(data));
}

/**
 * Modifies an array
 * @param {Array} args - An array of arguments. Usually one or more series, in an array.
 * @return {Array} A single series as modified by the function
 */
var functions = {
  abs: function (args) {
    return alter(args, function (args) {
      var data = _.mapValues(args[0].data, function (value) {
        return Math.abs(value);
      });
      args[0].data = data;
      return args[0];
    });
  },
  sum: function (args) {
    return reduce(args, function (a, b) {
      return a + b;
    });
  },
  subtract: function (args) {
    return reduce(args, function (a, b) {
      return a - b;
    });
  },
  multiply: function (args) {
    return reduce(args, function (a, b) {
      return a * b;
    });
  },
  divide: function (args) {
    return reduce(args, function (a, b) {
      return a / b;
    });
  },
  roundTo: function (args) {
    return reduce(args, function (a, b) {
      return parseInt(a * Math.pow(10, b), 10) / Math.pow(10, b);
    });
  },
  color: function (args) {
    return alter(args, function (args) {
      args[0].color = args[1];
      return args[0];
    });
  },
  label: function (args) {
    return alter(args, function (args) {
      args[0].label = args[1];
      return args[0];
    });
  },
  attr: function (args) {
    return alter(args, function (args) {
      args[0][args[1]] = args[2];
      return args[0];
    });
  },
  yaxis2: function (args) {
    return alter(args, function (args) {
      args[0].yaxis = 2;
      return args[0];
    });
  },
  linewidth: function (args) {
    return alter(args, function (args) {
      args[0].lines = {lineWidth: args[1]};
      return args[0];
    });
  },
  first: function (args) {
    return alter(args, function (args) {
      return args[0];
    });
  },
  movingaverage: function (args) {
    return alter(args, function (args) {

      var windowSize = args[1];
      args[0].data = asSorted(args[0].data, function (pairs) {
        return _.map(pairs, function(point, i) {
          if (i < windowSize) { return [point[0], null]; }

          var average = _.chain(pairs.slice(i - windowSize, i))
          .map(function (point) {
            return point[1];
          }).reduce(function (memo, num) {
            return (memo + num);
          }).value() / windowSize;

          return [point[0], average];
        });
      });

      return args[0];
    });
  },
  derivative: function (args) {
    return alter(args, function (args) {

      args[0].data = asSorted(args[0].data, function (pairs) {
        return  _.map(pairs, function(point, i) {
          if (i === 0 || pairs[i - 1][1] == null || point[1] == null) { return [point[0], null]; }
          return [point[0], point[1] - pairs[i - 1][1]];
        });
      });

      return args[0];
    });
  }
};

var invokeTree;
// Invokes a modifier function, resolving arguments into series as needed
function invoke (fnName, args) {

  args = _.map(args, function (item) {

    if (_.isNumber(item) || _.isString(item)) {
      return item;
    }
    else if (_.isObject(item) && item.type === 'query') {
      return client.search({
        index: 'usagov',
        filterPath: 'aggregations.series.buckets.key,aggregations.series.buckets.doc_count,aggregations.series.buckets.metric.value',
        searchType: 'count',
        body:getRequest(item)
      }).then(function (resp) {
        var values;
        var keys = _.pluck(resp.aggregations.series.buckets, 'key');
        if (resp.aggregations.series.buckets[0].metric) {
          values = _.pluck(_.pluck(resp.aggregations.series.buckets, 'metric'), 'value');
        } else {
          values = _.pluck(resp.aggregations.series.buckets, 'doc_count');
        }
        var data = _.zipObject(keys, values);
        return { data:  data};
      });
    }
    else if (_.isObject(item) && item.type === 'function') {
      return invoke(item.function, item.arguments);
    }
    else if (_.isObject(item) && item.type === 'reference') {
      var reference = sheet[item.row - 1][item.column][item.series - 1];
      return invokeTree(reference);
    }
    return item;
  });

  return Promise.all(args).then(function (series) {

    if (!functions[fnName]){
      throw new Error('Function not found');
    }
    var output = functions[fnName](series);
    return output;
  });
}

function invokeTree (chain, result) {
  if (chain.length === 0) {
    return result[0];
  }

  chain = _.clone(chain);
  var link = chain.shift();
  var promise;
  if (!result) {
    promise = invoke('first', [link]);
  } else {
    promise = invoke(link.function, result.concat(link.arguments));
  }

  return promise.then(function (result) {
    return invokeTree(chain, [result]);
  });

}

function resolveTree (forest) {
  var seriesList = _.map(forest, function (tree) {
    var values = invokeTree(tree);

    return values.then(function (args) {
      args.data = unzipPairs(args.data);

      return args;
    });
  });

  return Promise.all(seriesList).then(function (args) {
    return args;
  }).catch(function () {
    return {};
  });

}

function resolveSheet (sheet) {
  return _.map(sheet, function (row) {
    return _.map(row, function (column) {
      return aggspretion.parse(column);
    });
  });
}

function processRequest (request) {
  // This is setting the "global" sheet
  sheet = resolveSheet(request);
  return _.map(sheet, function (row) {
    return _.map(row, function (tree) {
      return Promise.all(resolveTree(tree)).then(function (columns) {
        return columns;
      });
    });
  });
}

module.exports = processRequest;


function debugSheet (sheet) {
  sheet = processRequest(sheet);

  var rows = _.map(sheet, function (row) {
    return Promise.all(row);
  });

  Promise.all(rows).then(function (sheet) {
    console.log(JSON.stringify(sheet));
  });
}

debugSheet([
  ['(`geo.country_code:US`);(`*`).sum(A1@1)'],
]);

