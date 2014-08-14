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
  '_',
  'curl'
], function (_, curl) {
  'use strict';

  module("CURL");

  var notCURLS = [
    'sldhfsljfhs',
    's;kdjfsldkfj curl -XDELETE ""',
    '{ "hello": 1 }'
  ];

  var CURLS = [
    {
      "curl": "curl -XPUT 'http://localhost:9200/twitter/tweet/1' -d '{ \
          \"user\" : \"kimchy\", \
        \"post_date\" : \"2009-11-15T14:12:12\",\
        \"message\" : \"trying out Elastic Search\"\
        }'",
      "ret": {
        "server": "http://localhost:9200",
        "method": "PUT",
        "url": "/twitter/tweet/1",
        "data": "{ \
          \"user\" : \"kimchy\", \
        \"post_date\" : \"2009-11-15T14:12:12\",\
        \"message\" : \"trying out Elastic Search\"\
        }"
      }
    },
    {
      "curl": "curl -XGET \"localhost/twitter/tweet/1?version=2\" -d '{ \
     \"message\" : \"elasticsearch now has versioning support, double cool!\"\
      }'",
      "ret": {
        "server": "http://localhost",
        "method": "GET",
        "url": "/twitter/tweet/1?version=2",
        "data": "{ \
     \"message\" : \"elasticsearch now has versioning support, double cool!\"\
      }"
      }
    },
    {
      "curl": "curl -XPOST https://localhost/twitter/tweet/1?version=2 -d '{ \n\
     \"message\" : \"elasticsearch now has versioning support, double cool!\"\n\
      }'",
      "ret": {
        "server": "https://localhost",
        "method": "POST",
        "url": "/twitter/tweet/1?version=2",
        "data": "{ \n\
     \"message\" : \"elasticsearch now has versioning support, double cool!\"\n\
      }"
      }
    },
    {
      "curl": "curl -XPOST https://localhost/twitter",
      "ret": {
        "server": "https://localhost",
        "method": "POST",
        "url": "/twitter",
        "data": ""
      }
    },
    {
      "curl": "curl -X POST https://localhost/twitter/",
      "ret": {
        "server": "https://localhost",
        "method": "POST",
        "url": "/twitter/",
        "data": ""
      }
    },
    {
      "curl": "curl -s -XPOST localhost:9200/missing-test -d'\n\
    { \n\
      \"mappings\": {\n\
      }\n\
    }'",
      "ret": {
        "server": "http://localhost:9200",
        "method": "POST",
        "url": "/missing-test",
        "data": "{ \n\
      \"mappings\": {\n\
      }\n\
    }"
      }
    },
    {
      "curl": "curl 'localhost:9200/missing-test/doc/_search?pretty' -d'\n\
    {\n\
      \"query\": {\n\
      },\n\
    }'",
      "ret": {
        "server": "http://localhost:9200",
        "method": "",
        "url": "/missing-test/doc/_search?pretty",
        "data": "{\n\
      \"query\": {\n\
      },\n\
    }"
      }
    },
    {
      "curl": 'curl localhost:9200/ -d"\n\
    {\n\
      \\"query\\": {\n\
      },\n\
    }"',
      "ret": {
        "server": "http://localhost:9200",
        "method": "",
        "url": "/",
        "data": "{\n\
      \"query\": {\n\
      },\n\
    }"
      }
    }
  ];


  function compareCURL(result, expected) {
    deepEqual(result.server, expected.server);
    deepEqual(result.method, expected.method);
    deepEqual(result.url, expected.url);
    deepEqual(result.data, expected.data);
  }


  _.each(notCURLS, function (notCURL, i) {
    test("cURL Detection - broken strings " + i, function () {
      ok(!curl.detectCURL(notCURL), "marked as curl while it wasn't:" + notCURL);
    });
  });

  _.each(CURLS, function (fixture, i) {
    test("cURL Detection - correct strings " + i, function () {
      ok(curl.detectCURL(fixture.curl), "marked as not curl while it was:" + fixture.curl);
      var r = curl.parseCURL(fixture.curl);
      compareCURL(r, fixture.ret);
    });
  })
    
});