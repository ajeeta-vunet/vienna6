import _ from 'lodash';
import { SavedObjectsClientProvider } from 'ui/saved_objects';

var utils = {};



utils.textFromRequest = function (request) {
  var data = request.data;
  if (typeof data != "string") {
    data = data.join("\n");
  }
  return request.method + " " + request.url + "\n" + data;
};

utils.jsonToString = function (data, indent) {
  return JSON.stringify(data, null, indent ? 2 : 0);
};

utils.reformatData = function (data, indent) {
  var changed = false;
  var formatted_data = [];
  for (var i = 0; i < data.length; i++) {
    var cur_doc = data[i];
    try {
      var new_doc = utils.jsonToString(JSON.parse(utils.collapseLiteralStrings(cur_doc)), indent ? 2 : 0);
      if (indent) {
        new_doc = utils.expandLiteralStrings(new_doc);
      }
      changed = changed || new_doc != cur_doc;
      formatted_data.push(new_doc);
    }
    catch (e) {
      formatted_data.push(cur_doc);
    }
  }

  return {
    changed: changed,
    data: formatted_data
  };
};

utils.collapseLiteralStrings = function (data) {
  return data.replace(/"""(?:\s*\r?\n)?((?:.|\r?\n)*?)(?:\r?\n\s*)?"""/g, function (match, literal) {
      return JSON.stringify(literal);
  });
}

utils.expandLiteralStrings = function (data) {
  return data.replace(/("(?:\\"|[^"])*?")/g, function (match, string) {
    // expand things with two slashes or more
    if (string.split(/\\./).length > 2) {
      string = JSON.parse(string).replace("^\s*\n", "").replace("\n\s*^", "");
      var append = string.includes("\n") ? "\n" : ""; // only go multi line if the string has multiline
      return '"""' + append + string + append + '"""';
    } else {
      return string;
    }
  });
}

utils.extractDeprecationMessages = function (warnings) {
  // pattern for valid warning header
  var re = /\d{3} [0-9a-zA-Z!#$%&'*+-.^_`|~]+ \"((?:\t| |!|[\x23-\x5b]|[\x5d-\x7e]|[\x80-\xff]|\\\\|\\")*)\"(?: \"[^"]*\")/
  // split on any comma that is followed by an even number of quotes
  return _.map(utils.splitOnUnquotedCommaSpace(warnings), function (warning) {
    var match = re.exec(warning)
    // extract the actual warning if there was a match
    return "#! Deprecation: " + (match !== null ? utils.unescape(match[1]) : warning)
  });
}

utils.unescape = function (s) {
  return s.replace(/\\\\/g, "\\").replace(/\\"/g, "\"")
}

utils.splitOnUnquotedCommaSpace = function (s) {
  var quoted = false;
  var arr = [];
  var buffer = '';
  var i = 0
  while (i < s.length) {
    var token = s.charAt(i++)
    if (token == '\\' && i < s.length) {
      token += s.charAt(i++)
    } else if (token == ',' && i < s.length && s.charAt(i) == ' ') {
      token += s.charAt(i++);
    }
      if (token == '"') {
        quoted = !quoted
      } else if (!quoted && token == ', ') {
        arr.push(buffer);
        buffer = '';
        continue
      }
      buffer += token;
  }
  arr.push(buffer)
  return arr;
}

// This function returns only the value part with comma delimitted
// for the specified field
// List - [{"id":"1", "name":"admin"},{"id":"2", "name":"dba"}
// fieldToFetch - name output = admin,dba
// fieldToFetch - id, output = 1,2
utils.getValueToStoreInKibana = function (objectList, fieldToFetch) {
  let value = '';
  _.each(objectList, function (obj) {
    value = value + obj[fieldToFetch] + ',';
  });
  value = value.replace(/,\s*$/, '');
  return value;
}

// It returns the saved object like search, index-pattern...from the .kibana
// object based on the param doc_type. For ex; To get title of all the saved
// searched we need to pass 'search' for doc_type and ['title'] for the list.
utils.getSavedObject = async function (doc_tpye, fieldList, page_size, Private) {
  let savedObject = [];
  let savedObjectsClient = Private(SavedObjectsClientProvider);
  await savedObjectsClient.find({
    type: doc_tpye,
    fields: fieldList,
    perPage: page_size
  }).then(response => {
    savedObject = response.savedObjects.map(pattern => {
      const id = pattern.id;
      const objectPattern = {
        id: id,
        title: pattern.get('title'),
      };
      return objectPattern;
    });
  });
  return savedObject;
}

// It returns a specific visualization object based on the param vis_type.
// For ex; To get all the business metrics, we need to pass 'business_metric'
// for the vis_type param
utils.getVisualizationObjectByType = async function (doc_tpye, fieldList, page_size, vis_type, Private) {
  let visualizationObject = [];
  let savedObjectsClient = Private(SavedObjectsClientProvider);
  await savedObjectsClient.find({
    type: doc_tpye,
    fields: fieldList,
    perPage: page_size
  }).then(response => {
    response.savedObjects.map(pattern => {
      if(JSON.parse(pattern.attributes.visState).type === vis_type) {
        const id = pattern.id;
        const visTitle = {
          id: id,
          title: pattern.get('title'),
        };
        visualizationObject.push(visTitle);
      }
    });
  });
  return visualizationObject;
}

export default utils;
