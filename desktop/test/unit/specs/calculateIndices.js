define(function (require) {
  var calculateIndices = require('courier/calculateIndices');
  var moment = require('moment');

  describe('calculateIndices()', function () {

    describe('error checking', function() {

      it('should throw an error if start is > end', function () {
        expect(function () { calculateIndices(moment().add('day', 1), moment()); }).to.throwError();
      });

      it('should throw an error if interval is not [ hour, day, week, year ]', function () {
        expect(function () { calculateIndices(moment().subtract('day', 1), moment(), 'century' ); }).to.throwError();
      });
      
    });
    
    describe('hourly interval', function() {

      beforeEach(function () {
        var date = '2014-01-15 04:30:10';
        this.start = moment(date).subtract('hours', 4);
        this.end = moment(date);
        this.interval = 'hour';
        this.pattern = '[logstash-]YYYY.MM.DD.HH';
        this.fixture = [
          'logstash-2014.01.15.01',
          'logstash-2014.01.15.02',
          'logstash-2014.01.15.03',
          'logstash-2014.01.15.04'
        ]
      });

      it('should return a set of hourly indices', function () {
        expect(calculateIndices(this.start, this.end, this.interval, this.pattern))
               .to.eql(this.fixture);
      });
      
    });

    describe('daily interval', function() {

      beforeEach(function () {
        var date = '2014-01-15 04:30:10';
        this.start = moment(date).subtract('days', 4);
        this.end = moment(date);
        this.interval = 'day';
        this.pattern = '[logstash-]YYYY.MM.DD';
        this.fixture = [
          'logstash-2014.01.12',
          'logstash-2014.01.13',
          'logstash-2014.01.14',
          'logstash-2014.01.15'
        ]
      });

      it('should return a set of daily indices', function () {
        expect(calculateIndices(this.start, this.end, this.interval, this.pattern))
               .to.eql(this.fixture);
      });
      
    });

    describe('weekly interval', function() {

      beforeEach(function () {
        var date = '2014-01-15 04:30:10';
        this.start = moment(date).subtract('week', 4);
        this.end = moment(date);
        this.interval = 'week';
        this.pattern = '[logstash-]YYYY.MM.DD';
        this.fixture = [
          'logstash-2013.12.25',
          'logstash-2014.01.01',
          'logstash-2014.01.08',
          'logstash-2014.01.15'
        ]
      });

      it('should return a set of daily indices', function () {
        expect(calculateIndices(this.start, this.end, this.interval, this.pattern))
               .to.eql(this.fixture);
      });
      
    });

    describe('yearly interval', function() {

      beforeEach(function () {
        var date = '2014-01-15 04:30:10';
        this.start = moment(date).subtract('years', 4);
        this.end = moment(date);
        this.interval = 'year';
        this.pattern = '[logstash-]YYYY.MM.DD';
        this.fixture = [
          'logstash-2011.01.15',
          'logstash-2012.01.15',
          'logstash-2013.01.15',
          'logstash-2014.01.15'
        ]
      });

      it('should return a set of yearly indices', function () {
        expect(calculateIndices(this.start, this.end, this.interval, this.pattern))
               .to.eql(this.fixture);
      });
      
    });


  });

});
