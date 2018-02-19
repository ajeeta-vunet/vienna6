import heartbeatRouteHandler from './server/routes/handler';

export default function (kibana) {

  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'heartbeat-vis',
    uiExports: {
      visTypes: [
        'plugins/heartbeat_vis/heartbeat_vis'
      ]
    },
    init(server, options) {
      // Add server routes and initialize the plugin here
      heartbeatRouteHandler(server);
    }
  });

}
