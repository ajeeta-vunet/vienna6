const Promise = require('bluebird');
const fs = require('fs');
const _ = require('lodash');
const request = require('request');
const getProgressReporter = require('../progressReporter');

/*
Responsible for managing http transfers
*/
module.exports = function (logger, sourceUrl, targetPath, timeout) {
  let _resolve;
  let _reject;
  let _archiveType;
  let _hasError = false;
  let _readStream;
  let _writeStream;
  let _errorMessage;
  let _progressReporter = getProgressReporter(logger);

  const promise = new Promise(function (resolve, reject) {
    _resolve = resolve;
    _reject = reject;
  });

  function consumeStreams() {
    //console.log('http.consumeStreams');
    _readStream
      .on('response', handleResponse)
      .on('data', handleData)
      .on('error', _.partial(handleError, 'ENOTFOUND'));
      //.pipe(_writeStream)

    return promise;
  }

  function createReadStream() {
    //console.log('http.createReadStream');
    let requestOptions = { url: sourceUrl };
    if (timeout !== 0) {
      requestOptions.timeout = timeout;
    }

    return Promise.try(() => {
      return request.get(requestOptions);
    })
    .catch((err) => {
      if (err.message.match(/invalid uri/i)) {
        throw new Error('ENOTFOUND');
      }
      throw err;
    })
    .then((readStream) => {
      _readStream = readStream;
    });
  }

  function createWriteStream() {
    //console.log('http.createWriteStream');
    _writeStream = fs.createWriteStream(targetPath);
    _writeStream.on('error', function (err) {
      console.log('_writeStream.error', err);
    });
    _writeStream.on('finish', function () {
      //console.log('_writeStream.finish');

      //setTimeout (function() {
      if (_hasError) {
        fs.unlinkSync(targetPath);
        _reject(new Error(_errorMessage));
      } else {
        logger.log('Transfer complete');
        _resolve({
          archiveType: _archiveType
        });
      }
      //}, 10);
    });
  }

  function handleError(errorMessage, err) {
    //console.log('http.handleError', errorMessage);
    if (_hasError) return;

    if (err) logger.error(err);
    _hasError = true;
    _errorMessage = errorMessage;

    if (_readStream.abort) _readStream.abort();
  }

  function handleResponse(resp) {
    //console.log(resp);
    //console.log('http.handleResponse', resp.statusCode);
    if (resp.statusCode >= 400) {
      handleError('ENOTFOUND', null);
    } else {
      resp.pipe(_writeStream);
      _archiveType = getArchiveTypeFromResponse(resp.headers['content-type']);
      let totalSize = parseInt(resp.headers['content-length'], 10) || 0;

      //Note: no progress is logged if the plugin is downloaded in a single packet
      _progressReporter.init(totalSize);

    }
  }

  function handleData(buffer) {
    //console.log('http.handleData');
    if (_hasError) return;
    _progressReporter.progress(buffer.length);
  }

  function getArchiveTypeFromResponse(contentType) {
    //console.log('http.getArchiveTypeFromResponse', contentType);
    contentType = contentType || '';

    switch (contentType.toLowerCase()) {
      case 'application/zip':
        return '.zip';
        break;
      case 'application/x-gzip':
        return '.tar.gz';
        break;
    }
  }

  return createReadStream()
 .then(createWriteStream)
 .then(consumeStreams);
};
