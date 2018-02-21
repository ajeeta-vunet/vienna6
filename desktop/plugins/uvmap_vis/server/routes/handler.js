export default (server) => {

  const uvmapVis = require('./uvmap_vis')(server);

  server.route({
    path: '/api/uvmap_vis/run',
    method: 'POST',
    handler: (req, reply) => {
      return uvmapVis.uvmap_vis_handler(req, reply);
    }
  });

};
