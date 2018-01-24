//import uvmap_vis_handler from './uvmap_vis';

export default (server) => {

  const uvmap_vis = require('./uvmap_vis')(server);

  server.route({
    path: '/api/uvmap_vis/run',
    method: 'POST',
    handler: (req, reply) => {
       return uvmap_vis.uvmap_vis_handler(req, reply);
    }
  });

}
