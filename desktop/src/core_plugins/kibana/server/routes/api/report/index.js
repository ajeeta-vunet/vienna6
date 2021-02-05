import Boom from 'boom';
import { open, unlinkSync, createReadStream, close } from 'fs';
import { fromNode as fcb } from 'bluebird';
import { replacePlaceholder } from '../../../../../../optimize/public_path_placeholder.js';
const Request = require('request').defaults({
  strictSSL: false
});


async function getResponse(req, filePath, fileName) {

  let fd;
  try {
    // we use and manage a file descriptor mostly because
    // that's what Inert does, and since we are accessing
    // the file 2 or 3 times per request it seems logical
    fd = await fcb(cb => open(filePath, 'r', cb));

    const read = createReadStream(null, {
      fd,
      start: 0,
      autoClose: true
    });
    fd = null; // read stream is now responsible for fd

    const response = req.generateResponse(replacePlaceholder(read, filePath));
    response.code(200);
    //response.etag(`${hash}-${publicPath}`);
    response.header('Content-Type', 'application/pdf');
    response.header('content-disposition', fileName);
    response.type(req.server.mime.path(filePath).type);

    // Delete the file before we return
    unlinkSync(filePath);
    return response;

  } catch (error) {
    if (fd) {
      try {
        await fcb(cb => close(fd, cb));
      } catch (error) {
        // ignore errors from close, we already have one to report
        // and it's very likely they are the same
      }
    }

    if (error.code === 'ENOENT') {
      return Boom.notFound();
    }

    return Boom.boomify(error);
  }
}

export function reportDownloadApi(server) {

  server.route({
    path: '/vienna_print_report/',
    config: {
      tags: ['api'],
    },
    method: ['POST'],
    handler: (req, reply) => {
      const binPath = '/opt/kibana/node_modules/phantomjs/lib/phantom/bin/phantomjs';
      const time = Date.now();
      const childProcess = require('child_process');
      // As there is time information as a query parameter, report-name is
      // only till ?
      const onlyReportName = req.payload.reportName.split('?')[0];

      const url = 'http://127.0.0.1:8080/app/vienna#/report/print/' + req.payload.reportName;
      const duration = req.payload.timeDuration;
      const userName = req.payload.username;
      const userRole = req.payload.userRole;
      const userPermissions = req.payload.permissions;
      const searchString = req.payload.searchString;
      const fileName = onlyReportName + '.pdf';
      const fileNameWithTime = onlyReportName + '-' + time + '.pdf';
      const filePath = '/tmp/' + fileNameWithTime;
      const tenantId = req.payload.tenantId;
      const buId = req.payload.buId;
      const shipperUrl = req.payload.shipperUrl;
      const isDashboardUsed = req.payload.isDashboardUsed;
      server.log(['info'], 'Search string is ' + searchString);
      server.log(['info'], 'Request payload is ' +  req.payload);
      const childArgs = [
        '/opt/kibana/report/report.js',
        url,
        filePath,
        userName,
        userRole,
        userPermissions,
        tenantId,
        buId,
        duration,
        shipperUrl,
        searchString,
        isDashboardUsed
      ];

      // Debug output..
      server.log(['info'], 'Executing ' + binPath + ' with url ' + url);
      server.log(['info'], 'User ' + userName + ' with role ' + userRole);
      server.log(['info'], 'Duration ' + duration + ' with shipper url ' + shipperUrl);

      childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
        console.log('Executing bipPath', binPath);
        console.log('childArgs', childArgs);
        console.log('Got error', err);
        console.log('Got stderror', stderr);
        reply(getResponse(req, filePath, fileName));
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/vuSmartMaps/api/{tenant_id}/bu/{bu_id}/metric/',
    handler: (request, reply) => {
      const tenantId = request.params.tenant_id;
      const buId = request.params.bu_id;
      Request.post({
        url: 'https://127.0.0.1/vuSmartMaps/api/' + tenantId + '/bu/' + buId + '/_metricReport_/',
        body: JSON.stringify(request.payload),
      }, function (error, response, body) {
        if (response.statusCode !== 200) {
          reply(body).code(response.statusCode);
        } else {
          reply(body);
        }
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/vuSmartMaps/api/{tenant_id}/bu/{bu_id}/utMap/',
    handler: (request, reply) => {
      const tenantId = request.params.tenant_id;
      const buId = request.params.bu_id;
      Request.post({
        url: 'https://127.0.0.1/vuSmartMaps/api/' + tenantId + '/bu/' + buId + '/_utMapReport_/',
        body: JSON.stringify(request.payload),
        headers: { 'user': request.headers.username }
      }, function (error, response, body) {
        if (response.statusCode !== 200) {
          reply(body).code(response.statusCode);
        } else {
          reply(body);
        }
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/vuSmartMaps/api/{tenant_id}/bu/{bu_id}/cjm/',
    handler: (request, reply) => {
      const tenantId = request.params.tenant_id;
      const buId = request.params.bu_id;
      Request.post({
        url: 'https://127.0.0.1/vuSmartMaps/api/' + tenantId + '/bu/' + buId + '/_cjmReport_/',
        body: JSON.stringify(request.payload),
        headers: { 'user': request.headers.username }
      }, function (error, response, body) {
        if (response.statusCode !== 200) {
          reply(body).code(response.statusCode);
        } else {
          reply(body);
        }
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/vuSmartMaps/api/{tenant_id}/bu/{bu_id}/insights/',
    handler: (request, reply) => {
      const tenantId = request.params.tenant_id;
      const buId = request.params.bu_id;
      Request.post({
        url: 'https://127.0.0.1/vuSmartMaps/api/' + tenantId + '/bu/' + buId + '/_insightsReport_/',
        body: JSON.stringify(request.payload),
        headers: { 'user': request.headers.username }
      }, function (error, response, body) {
        if (response.statusCode !== 200) {
          reply(body).code(response.statusCode);
        } else {
          reply(body);
        }
      });
    }
  });

  server.route({
    method: 'GET',
    //the query-parameter file_type=images is  ignored for this url.
    path: '/vuSmartMaps/api/{tenant_id}/bu/{bu_id}/fgw/',
    handler: (request, reply) => {
      const tenantId = request.params.tenant_id;
      const buId = request.params.bu_id;
      const fileType = request.query.file_type;
      Request.get({
        url: 'https://127.0.0.1/vuSmartMaps/api/' + tenantId + '/bu/' + buId + '/_fgwImagesReport_/',
      }, function (error, response, body) {
        if (response.statusCode !== 200) {
          reply(body).code(response.statusCode);
        } else {
          reply(body);
        }
      });
    }
  });

}
