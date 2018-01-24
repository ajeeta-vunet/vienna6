export default function (server) {

  let _ = require('lodash');
  let fs = require('fs');
  var Promise = require('bluebird');
  var path = require('path');

  function replyWithError(e, reply) {
    reply({title: e.toString(), message: e.toString(), stack: e.stack}).code(400);
  }

  /*
   * This function is called to create a link with the passed information. It
   * also adds the created object into the passed allLinks list.
   */
  function createLink(linkId, fromNodeId, toNodeId, allLinks) {
      const linkObj = {};
      linkObj['id'] = linkId;
      linkObj['from'] = fromNodeId;
      linkObj['to'] = toNodeId;
      linkObj['label'] = '';
      linkObj['color'] = '#0D8EFF';
      linkObj['font'] = {};
      linkObj['font']['multi'] = 'html';

      allLinks.push(linkObj);
      return linkObj;
  };

  /*
   * This function is used to prepare metric node labels
   * based on the metric color schema configured for a
   * metric. User has an option to configure 3 colors:
   * 'Red', 'Green', 'Orange' and define range for the metric
   * If the metric value is not in the configured range, black
   * color is used for the metric node label.
   */
  function getColorCodedMetricLabel(colorSchemaDict, label, dataValue) {

    let nodeLabel = '';
    let start_tag = '<code>';
    let end_tag = '</code>';
    _.forEach(colorSchemaDict, function(metricObj) {
      if(dataValue >= metricObj.min &&
         dataValue <= metricObj.max) {
        if(metricObj.color === 'Orange') {
          start_tag = '<b>';
          end_tag = '</b>';
        } else if(metricObj.color === 'Green' ){
          start_tag = '<i>';
          end_tag = '</i>';
        } else if(metricObj.color === 'Red') {
          start_tag = '<b><i>';
          end_tag = '</i></b>';
        }
        // When the dataValue for a metric matches the
        // metric color schema configuration, We set the
        // node label and break the for loop.
        nodeLabel = '\n' + start_tag + label + ':' + dataValue + end_tag;
        return false;
      }
    });

    // If the data value for the label is not in range
    // set black color for the node label.
    if (nodeLabel == '') {
      nodeLabel = '\n' + start_tag + label + ':' + dataValue + end_tag;
    }
    return nodeLabel;
  }

  /*
   * This is a helper function to create a dictionary look up
   * using the color schema reaceived from front end.
   */
  function addColorConfigForMetric(metricObj, colorSchemaDict) {
    let colorConfigDict = {};
    colorConfigDict['min'] = metricObj.min;
    colorConfigDict['max'] = metricObj.max;
    colorConfigDict['color'] = metricObj.color;
    colorSchemaDict[metricObj.metric].push(colorConfigDict);
  }

  /*
   * This is for handling Unified Visibility Map visualization. For ES
   * queries, it uses Timelion and for connections, it uses a in-house
   * grammar. It supports parameter as well as time based drilldowns.
   * There is also a way to load specified dashboards
   */
  return {
    uvmap_vis_handler(request, reply) {

          const grammar = fs.readFileSync(path.resolve(__dirname, '../../public/uvmap_vis.peg'), 'utf8');
          const PEG = require('pegjs');
          const Parser = PEG.buildParser(grammar);

          // Get the color schema configured in the front end.
          const colorSchema = request.payload.colorSchema;

          // Initializing the color schema dict to store
          // color and range configuration for a metric
          const colorSchemaDict = {};

          /*. Preparing a dictionary look up based on metric
           * Sample output is as shown below:
           * { count:
           *     [ { min: 1, max: 100, color: 'Orange' },
           *       { min: 101, max: 500, color: 'Red' },
           *       { min: 501, max: 1000, color: 'Green' } ],
           *   sum: [ { min: 0, max: 51000, color: 'Red' } ],
           *   max: [ { min: 0, max: 1000, color: 'Orange' } ]
           * }
           */
          _.forEach(colorSchema, function(metricObj) {
            const colorConfigDict = {};
            // add each color configuration for a metric in its
            // corresponding list.
            if(colorSchemaDict.hasOwnProperty(metricObj.metric)) {
              addColorConfigForMetric(metricObj, colorSchemaDict);
            }
            else {
              // Creating a list for every new metric
              // found in color schema configured in
              // front end.
              colorSchemaDict[metricObj.metric] = [];
              addColorConfigForMetric(metricObj, colorSchemaDict);
            }
          });

          // Let us first parse the connection details from the configuration
          try {
            var connection = Parser.parse(request.payload.connection[0]);
          } catch(err) {
            console.log('An error occured');
            console.log(err);
            replyWithError(err, reply);
            return
          }

          // The below is to find the nodes, links from the connection
          // configuration
          const allNodesDict = {};
          const allNodes = [];
          const allLinks = [];
          const nodeDashboardDict = {}
          let nodeId = 1;
          let toNodeId;
          let toNode;
          let fromNodeId;
          let fromNode;
          let linkId = 1;

          // pathvislist contains the list of objects created after grammar
          // parsing. It contains the nodes and their information..
          // Information looks like:
          // For 'isconnectedto', it will provide following:
          // {"connected": {
          //       "from":{"value":"10.10.10.1"},
          //       "to":{"value":"11.11.11.1"}
          //    }
          // },
          // For 'attributes', it will provide following:
          // {"node_type": {
          //      "type":{"value":"Server"},
          //      "name":{"value":"12.12.12.1"},
          //      "node":{"value":"12.12.12.1"},
          //      "x":{"value":"50"},
          //      "y":{"value":"-50"},
          //      "dashboard":{"value":"Heartbeat-Line"}
          //      }
          // }
          //
          // We iterate on this list and whenever we encounter either
          // 'connected' or 'node_type', we parse the information as mentioned
          // above and create the node and links
          _.map(connection.pathvislist, function(connect) {
            // If its the isconnectedto syntax.. its used to create a
            // connection between two nodes
            if ('connected' in connect) {
              let toNodeObj = {};
              let fromNodeObj = {};
              toNode = connect.connected.to.value;
              fromNode = connect.connected.from.value;

              // Check if the node is already seen or not...
              if(toNode in allNodesDict) {
                toNodeObj = allNodesDict[toNode];
              } else {
                // We are seeing this node first time, let us add this
                // in the all nodes dict as well as allNodes list
                toNodeObj['id'] = nodeId;
                allNodesDict[toNode] = toNodeObj;
                nodeId += 1;
                allNodes.push(toNodeObj);
              }
              toNodeId = toNodeObj['id'];

              // Do the same for from-node as well
              if (fromNode in allNodesDict) {
                fromNodeObj = allNodesDict[fromNode];
              } else {
                // We are seeing this node first time, let us add this
                // in the all nodes dict as well as allNodes list
                fromNodeObj['id'] = nodeId;
                allNodesDict[fromNode] = fromNodeObj;
                nodeId += 1;
                allNodes.push(fromNodeObj);
              }
              fromNodeId = fromNodeObj['id'];

              // Create the link..
              const linkObj = createLink(linkId, fromNodeId, toNodeId, allLinks);
              console.log("Adding node object");
              console.log(fromNodeObj);
              console.log(toNodeObj);
              console.log(linkObj);
              linkId += 1;
            } else if ('node_type' in connect) {
              // For node attributes, node_type is used
              let node = connect.node_type.node.value;
              let name = connect.node_type.name.value;
              let type = connect.node_type.type.value;
              let x = connect.node_type.x.value;
              let y = connect.node_type.y.value;
              if (node in allNodesDict) {
                // If we have seen this node already, let us update all
                // the attributes
                let nodeObj = allNodesDict[node]
                nodeObj['font'] = {};
                nodeObj['font']['multi'] = 'html';
                nodeObj['label'] = name;
                nodeObj['group'] = type;
                nodeObj['x'] = x;
                nodeObj['y'] = y;
                if ('dashboard' in connect.node_type ) {
                  nodeDashboardDict[nodeObj['id']] = connect.node_type.dashboard.value;
                }
              }
            }
          });

          // For metric collection, we use ES queries similar to Timelion.. Let
          // us use that by invoking required functions.
          const timelionDefaults = require('../../../../src/core_plugins/timelion/server/lib/get_namespaced_settings')();
          const tlConfig = require('../../../../src/core_plugins/timelion/server/handlers/lib/tl_config.js')({
            server: server,
            request: request,
            settings: _.defaults(timelionDefaults) // Just in case they delete some setting.
          });

          // This is basically invoking timelion code from here to parse the
          // expression..
          const chainRunnerFn = require('../../../../src/core_plugins/timelion/server/handlers/chain_runner.js');

          const chainRunner = chainRunnerFn(tlConfig);
          let sheet;
          try {
            sheet = chainRunner.processRequest(request.payload);
          } catch (e) {
            console.log("Got an error");
            console.log(e);
            replyWithError(e, reply);
            return;
          }

          return Promise.all(sheet).then(function (sheet) {
            _.forEach(allNodes, function (nodeObj) {
              let data = '';
              // Here we are trying to map the received ES response of
              // metrics to the nodes. We check the node-label in the
              // returned instance's label, if its available, we assume
              // that the two are connected and use this metric to update
              // the node label.
              _.map(sheet[0].list, function(instance) {
                if (instance.label.indexOf(nodeObj['label']) !== -1) {
                  let dataValue = instance.data[0][1];
                  if (typeof dataValue === 'number') {
                    // If its a float, we use only two decimal points
                    if (Math.round(dataValue) != dataValue) {
                      dataValue = parseFloat(dataValue).toFixed(2);
                    }
                  }
                  const label = instance.label.split('>')[1];
                  let nodeLabel = '';
                  // Check if label exists as a metric in the
                  // metric dictionary look up. If exists
                  // call the function 'getColorCodedMetricLabel'
                  // to get the colored metric node label.
                  if (colorSchemaDict.hasOwnProperty(label)) {
                    nodeLabel = getColorCodedMetricLabel(colorSchemaDict[label], label, dataValue);
                  }

                  // If color schema is not configured for a metric, we
                  // show the node labels for this metric in black.
                  else {
                    nodeLabel = '\n<code>' + label + ':' + dataValue + '</code>';
                  }
                  data = data + nodeLabel;
                }
              });

              // Now update the nodeObj label
              nodeObj['label'] = '<code>' + nodeObj['label'] + '</code>' + '\n' + data;
            });

            // We have built all the required information in allNodes and
            // allLinks, create a data object and send it as repsonse
            var data = {
              "nodes": allNodes,
              "edges": allLinks,
              "node_dashboard_dict": nodeDashboardDict
            };

            return reply({"data": data});
          }).catch(function (e) {
              if (e.isBoom) {
                reply(e);
              } else {
                replyWithError(e, reply);
              }
          });

      }
  }

};
