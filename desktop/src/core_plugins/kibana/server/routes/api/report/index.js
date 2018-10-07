import Boom from 'boom';
import { open, unlinkSync, createReadStream, close } from 'fs';
import { fromNode as fcb } from 'bluebird';
import { replacePlaceholder } from '../../../../../../optimize/public_path_placeholder.js';

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

      const url = 'http://127.0.0.1:8080/app/kibana#/report/print/' + req.payload.reportName;
      const duration = req.payload.timeDuration;
      const userName = req.payload.username;
      const userRole = req.payload.userRole;
      const userPermissions = req.payload.permissions;
      const searchString = req.payload.searchString;
      const fileName = onlyReportName + '.pdf';
      const fileNameWithTime = onlyReportName + '-' + time + '.pdf';
      const filePath = '/tmp/' + fileNameWithTime;
      console.log('Request payload is ', req.payload);
      const tenantId = req.payload.tenantId;
      const buId = req.payload.buId;
      const shipperUrl = req.payload.shipperUrl;
      server.log(['info'], 'Search string is ' + searchString);
      server.log(['info'], 'Request payload is ' +  req.payload);
      const childArgs = [
        '/opt/kibana/report/report.js',
        url,
        filePath,
        userName,
        userRole,
        userPermissions,
        duration,
        tenantId,
        buId,
        shipperUrl,
        searchString
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
}
