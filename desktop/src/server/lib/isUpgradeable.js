var config = require('../config');
var semver = require('semver');
var rcVersionRegex = /(\d+\.\d+\.\d+)\-rc(\d+)/i;

module.exports = function (doc) {
  if (/beta|snapshot/i.test(doc._id)) return false;
  if (doc._id === config.package.version) return false;

  var packageVersion, packageRcRelease, version, rcRelease;
  packageRcRelease = rcRelease = Infinity;
  var matches = doc._id.match(rcVersionRegex);
  var packageMatches = config.package.version.match(rcVersionRegex);

  if (matches) {
    version = matches[1];
    rcRelease = parseInt(matches[2], 10);
  } else {
    version = doc._id;
  }

  if (packageMatches) {
    packageVersion = packageMatches[1];
    packageRcRelease = parseInt(packageMatches[2], 10);
  } else {
    packageVersion = config.package.version;
  }

  if (semver.gte(version, packageVersion) && rcRelease >= packageRcRelease) return false;
  return true;
};
