export default (server) => {

  const heartbeatVis = require('./heartbeat_vis')(server);

  server.route({
    path: '/api/heartbeat_vis/run',
    method: 'POST',
    handler: (req, reply) => {
      console.log('Got a request from frontend');
      return heartbeatVis.heartbeat_vis_full_path(req, reply);
    }
  });

  server.route({
    path: '/api/tracepath_vis_hop/run',
    method: 'POST',
    handler: (req, reply) => {
      console.log('Got a request from frontend');
      return heartbeatVis.tracepath_vis_hop(req, reply);
    }
  });
};
