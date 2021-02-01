'use strict';

var page = require('webpage').create(),
  system = require('system'),
  address,
  duration,
  output,
  size;

//How to to wait for kibana to load and the data from elasticseatch in milliseconds.
var waitTime = 60 * 1000;

if (system.args.length < 11 || system.args.length > 13) {
  console.log("Usage: report.js URL filename username userrole userpermissions tenant_id bu_id duration shipper_url search_string");
  phantom.exit(1);
} else {
  address = system.args[1];
  output = system.args[2];
  duration = system.args[8];
  page.viewportSize = { width: 1920, height: 1080 };
  page.paperSize = {
    width: 1920,
    height: 1080,
    orientation: 'landscape',
    margin: '1cm',
    header: {
      height: "1cm",
      contents: phantom.callback(function (pageNum, numPages) {
        return "<div style='border-bottom:1px solid; height:1px;color:#01b5d5;font-size:14px;width:1765px;font-weight:bold;margin-left:15px'></div>";
      })
    },
    footer: {
      height: "0.97cm",
      contents: phantom.callback(function (pageNum, numPages) {
      return "<div style='border-bottom:1px solid; height:1px;color:#01b5d5;font-size:14px;width:1765px;font-weight:bold;margin-left:15px'><div style='padding-top:5px;'><span style='display:inline-block;margin-left:5px'> vuSmartMaps</span><span style='margin-left:910px'>" + pageNum + " / " + numPages + "</span></div></div>";
      })
    }
  };

  // Let us write a simple logic of calculating waitTime based on duration
  // For within a day, use waitTime as 15 seconds
  if (duration <= 24) {
    waitTime = 20 * 1000;
  } else if (duration <= 120) {
    waitTime = 30 * 1000;
  } else if (duration <= 360) {
    waitTime = 40 * 1000;
  } else if (duration <= 720) {
    waitTime = 50 * 1000;
  }
  // Anything  beyond that, we wait for 60 seconds.. We may need to change this
  // at some palces...

  // Add custome header with username

  page.customHeaders = {
    "username": system.args[3],
    "user_group": system.args[4],
    "permissions": system.args[5],
    "tenant_id": system.args[6],
    "bu_id": system.args[7],
    "shipper_url": system.args[9],
    "search_string": system.args[10]
  };

  page.open(address, function (status) {
    if (status !== 'success') {
      console.log('Unable to load the address!');
      phantom.exit();
    } else {
      window.setTimeout(function () {
        page.render(output);
        phantom.exit();
      }, waitTime);
    }
  });
}
