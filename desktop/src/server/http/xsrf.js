import { badRequest } from 'boom';

export default function (kbnServer, server, config) {
  const disabled = config.get('server.xsrf.disableProtection');
  const versionHeader = 'kbn-version';
  const xsrfHeader = 'kbn-xsrf';

  server.ext('onPostAuth', function (req, reply) {
    // Currently, we don't check kbn-version in header..
    return reply.continue();
  });
}
