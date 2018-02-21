import uvMapRouteHandler from './server/routes/handler';

export default function (kibana) {

  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'uvmap-vis',
    uiExports: {
      visTypes: [
        'plugins/uvmap_vis/uvmap_vis'
      ]
    },
    init(server) {
      // Add server routes and initialize the plugin here
      uvMapRouteHandler(server);
    }
  });

}
