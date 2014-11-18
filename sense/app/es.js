/**
 * ELASTICSEARCH CONFIDENTIAL
 * _____________________________
 *
 *  [2014] Elasticsearch Incorporated All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Elasticsearch Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Elasticsearch Incorporated
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Elasticsearch Incorporated.
 */



define([
    "_", "jquery", "exports"
  ], function (_, $, exports) {
    "use strict";

    var baseUrl;
    var serverChangeListeners = [];
    var esVersion = [];

    exports.getBaseUrl = function () {
      return baseUrl;
    };
    exports.getVersion = function () {
      return esVersion;
    };

    exports.send = function (method, path, data, server, disable_auth_alert) {
      var wrappedDfd = $.Deferred();

      server = server || exports.getBaseUrl();
      path = exports.constructESUrl(server, path);
      var uname_password_re = /^(https?:\/\/)?(?:(?:([^\/]*):)?([^\/]*?)@)?(.*)$/;
      var url_parts = path.match(uname_password_re);

      var uname = url_parts[2];
      var password = url_parts[3];
      path = url_parts[1] + url_parts[4];
      console.log("Calling " + path + "  (uname: " + uname + " pwd: " + password + ")");
      if (data && method == "GET") {
        method = "POST";
      }

      // delayed loading for ciruclar references
      var settings = require("settings");

      var options = {
        url: path,
        data: method == "GET" ? null : data,
        cache: false,
        crossDomain: true,
        type: method,
        password: password,
        username: uname,
        dataType: "text", // disable automatic guessing
        xhrFields: {
          withCredentials: settings.getBasicAuth()
        }
      };


      $.ajax(options).then(
        function (data, textStatus, jqXHR) {
          wrappedDfd.resolveWith(this, [data, textStatus, jqXHR]);
        },
        function (jqXHR, textStatus, errorThrown) {
          if (jqXHR.status == 401 && !options.xhrFields.withCredentials && !disable_auth_alert) {
            settings.showBasicAuthPopupIfNotShown();
          } else if (jqXHR.status == 0 && jqXHR.state() == "rejected") {
            jqXHR.responseText =
              "\nElasticsearch may not be reachable or you may need to check your CORS settings." +
              "\nPlease check the elasticsearch documentation."
          }
          wrappedDfd.rejectWith(this, [jqXHR, textStatus, errorThrown]);
        });
      return wrappedDfd;
    };

    exports.constructESUrl = function (server, path) {
      if (!path) {
        path = server;
        server = exports.getBaseUrl();
      }
      if (path.indexOf("://") >= 0) {
        return path;
      }
      if (server.indexOf("://") < 0) {
        server = (document.location.protocol || "http:") + "//" + server;
      }
      if (server.substr(-1) == "/") {
        server = server.substr(0, server.length - 1);
      }
      if (path.charAt(0) === "/") {
        path = path.substr(1);
      }

      return server + "/" + path;
    };

    exports.forceRefresh = function () {
      exports.setBaseUrl(baseUrl, true)
    };

    exports.setBaseUrl = function (base, force) {
      if (baseUrl !== base || force) {
        var old = baseUrl;
        baseUrl = base;
        exports.send("GET", "/").done(function (data, status, xhr) {
          if (xhr.status === 200) {
            // parse for version
            var value = xhr.responseText;
            try {
              value = JSON.parse(value);
              if (value.version && value.version.number) {
                esVersion = value.version.number.split(".");
              }
            }
            catch (e) {

            }
          }
          _.each(serverChangeListeners, function (cb) {
            cb(base, old)
          });
        }).fail(function () {
          esVersion = []; // unknown
          _.each(serverChangeListeners, function (cb) {
            cb(base, old)
          });
        });
      }
    };

    exports.addServerChangeListener = function (cb) {
      serverChangeListeners.push(cb);
    }
  }
);
