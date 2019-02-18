import moment from 'moment';

const app = require('ui/modules').get('app/alert', []);

// Filter to format all kinds of alert values in alertLogs
app.filter('formatAlertValue', function () {
  return function (val) {
    // For empty or null values it returns 'NULL'
    if (val === null || val === undefined || val === '') {
      return 'NULL';
    }
    else {
      // Round off a float to 5 decimal places
      if (!isNaN(val) && val.toString().indexOf('.') !== -1) {
        val = val.toFixed(5);
      }
      // Format datetime values
      else if (moment(val, 'YYYY-MM-DDTHH:mm:ss.SSSSSSZ', true).isValid()) {
        val = moment(val).format('YYYY-MM-DD HH:mm:ss');
      }
      // To put space after commas in a string
      else if (typeof (val) === 'string') {
        val = val.replace(/,/g, ', ');
      }
      else {
        // pass
      }
      return val;
    }
  };
});
