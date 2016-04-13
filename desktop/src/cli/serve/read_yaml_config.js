import { chain, isArray, isPlainObject, forOwn, memoize, set, transform } from 'lodash';
import { readFileSync as read } from 'fs';
import { safeLoad } from 'js-yaml';
import { red } from 'ansicolors';

import { fromRoot } from '../../utils';
import { rewriteDeprecatedConfig } from './deprecated_config';

const log = memoize(function (message) {
  console.log(red('WARNING:'), message);
});

export function merge(sources) {
  return transform(sources, (merged, source) => {
    forOwn(source, function apply(val, key) {
      if (isPlainObject(val)) {
        forOwn(val, function (subVal, subKey) {
          apply(subVal, key + '.' + subKey);
        });
        return;
      }

      if (isArray(val)) {
        set(merged, key, []);
        val.forEach((subVal, i) => apply(subVal, key + '.' + i));
        return;
      }

      set(merged, key, val);
    });
  }, {});
}

export default function (paths) {
  const files = [].concat(paths || [])
    .map(path => safeLoad(read(path, 'utf8')))
    .map(file => rewriteDeprecatedConfig(file, log));

  return merge(files);
}
