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



define(function (require) {
  'use strict';
  var getIndices = require('lib/ClusterState/getIndices');  
  var moment = require('moment');

  describe('lib/ClusterState', function () {
    describe('#getIndices()', function() {
      var kbnIndex, results;
      var dashboard = {
        current: {
          index: { interval: 'days', pattern: '[.marvel-]YYYY.MM.DD' }
        }
      };

      beforeEach(function () {
        kbnIndex = { indices: sinon.stub() };
        kbnIndex.indices.onFirstCall().returns('test');
        results = getIndices(kbnIndex, dashboard);
      });

      it('should pass todays date as the first argument to kbnIndex', function () {
        sinon.assert.calledOnce(kbnIndex.indices);
        var from = kbnIndex.indices.args[0][0];
        expect(from.format('YYYY.MM.DD')).to.equal(moment.utc().subtract('days', 3).format('YYYY.MM.DD'));

      });

      it('should pass todays date as the second argument to kbnIndex', function () {
        sinon.assert.calledOnce(kbnIndex.indices);
        var to = kbnIndex.indices.args[0][1];
        expect(to.format('YYYY.MM.DD')).to.equal(moment.utc().format('YYYY.MM.DD'));

      });

      it('should pass the pattern  as the third argument to kbnIndex', function () {
        sinon.assert.calledOnce(kbnIndex.indices);
        var pattern = kbnIndex.indices.args[0][2];
        expect(pattern).to.equal(dashboard.current.index.pattern);
      });

      it('should pass the interval as the forth argument to kbnIndex', function () {
        var interval = kbnIndex.indices.args[0][3];
        expect(interval).to.equal(dashboard.current.index.interval);
      });

      it('should return the results from kbnIndex', function () {
        expect(results).to.equal('test');
      });

    });
  });
});
