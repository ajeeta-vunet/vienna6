export default function (server) {

  const _ = require('lodash');
  const fs = require('fs');
  const Promise = require('bluebird');
  const path = require('path');

  function replyWithError(e, reply) {
    reply({ title: e.toString(), message: e.toString(), stack: e.stack }).code(400);
  }

  /*
   * This function is called to create a link with the passed information. It
   * also adds the created object into the passed allLinks list.
   */
  function createLink(linkId, fromNodeId, toNodeId, allLinks, edgeName) {
    const linkObj = {};
    linkObj.id = linkId;
    linkObj.from = fromNodeId;
    linkObj.to = toNodeId;
    linkObj.label = edgeName;
    linkObj.color = '#0D8EFF';
    linkObj.font = {};
    linkObj.font.multi = 'html';

    allLinks.push(linkObj);
    return linkObj;
  }

  /*
   * This function is used to prepare metric node labels
   * based on the metric color schema configured for a
   * metric. User has an option to configure 3 colors:
   * 'Red', 'Green', 'Orange' and define range for the metric
   * If the metric value is not in the configured range, black
   * color is used for the metric node label.
   */
  function getColorCodedMetricLabel(colorSchemaDict, label, dataValue, unit) {
    let nodeLabel = '';
    let startTag = '<code>';
    let endTag = '</code>';
    _.forEach(colorSchemaDict, function (metricObj) {
      if(dataValue >= metricObj.min &&
         dataValue <= metricObj.max) {
        if(metricObj.color === 'Orange') {
          startTag = '<b>';
          endTag = '</b>';
        } else if(metricObj.color === 'Green') {
          startTag = '<i>';
          endTag = '</i>';
        } else if(metricObj.color === 'Red') {
          startTag = '<b><i>';
          endTag = '</i></b>';
        }
        // When the dataValue for a metric matches the
        // metric color schema configuration, We set the
        // node label and break the for loop.
        nodeLabel = '\n' + startTag + label + ': ' + dataValue + unit + endTag;
        return false;
      }
    });

    // If the data value for the label is not in range
    // set black color for the node label.
    if (nodeLabel === '') {
      nodeLabel = '\n' + startTag + label + ': ' + dataValue + unit + endTag;
    }
    return nodeLabel;
  }

  // This function returns the color based on the tags
  function getColorForLink(linkLabel) {
    let labelColor = '#0D8EFF';

    if (_.includes(linkLabel, '<b>') && _.includes(linkLabel, '<i>')) {
      labelColor = 'Red';
    } else if (_.includes(linkLabel, '<i>')) {
      labelColor = 'Green';
    } else if (_.includes(linkLabel, '<b>')) {
      labelColor = 'Orange';
    }

    return labelColor;
  }

  // Function returns list of duplicate items in an array.
  function getDuplicate(labelList) {
    const uniqueList = [];
    const duplicateList = [];

    _.forEach(labelList, function (item) {
      if (!uniqueList.includes(item)) {
        uniqueList.push(item);
      } else {
        duplicateList.push(item);
      }
    });

    return duplicateList;
  }

  // Function to throw an error if name for node or link
  // has occurred more than once.
  function checkDuplicateName(allNodes, allLinks, reply) {
    // If node name and link name is same
    // then we need to throw an error
    const nodeLabelList = [];
    const linkLabellist = [];

    // List of node labels.
    _.forEach(allNodes, function (nodeObj) {
      nodeLabelList.push(nodeObj.label);
    });

    // List of Link labels.
    _.forEach(allLinks, function (linkObj) {
      if (linkObj.label !== '') {
        linkLabellist.push(linkObj.label);
      }
    });

    const sameNodeLinkName = _.intersection(nodeLabelList, linkLabellist);

    // Displaying error if node name and link name, Node-Node or Link-Link name is same.
    if (sameNodeLinkName.length > 0) {
      // For node and link names are same
      replyWithError('Name: ' + sameNodeLinkName + ' used by both Node as well as Link. Please specify unique name', reply);
    } else if (nodeLabelList.length !== _.uniq(nodeLabelList).length) {
      // For duplicate node names.
      const errorForNodeLabel = getDuplicate(nodeLabelList);
      replyWithError('Node name/names ' + errorForNodeLabel + ' is/are already used for other node. Please use different node name',
        reply);
    } else if (linkLabellist.length !== _.uniq(linkLabellist).length) {
      // For duplicate link names.
      const errorForLinkLabel = getDuplicate(linkLabellist);
      replyWithError('Link name/names ' + errorForLinkLabel + ' is/are already used for other link. Please use different link name',
        reply);
    }
    return;
  }

  // Function to display the metrics on Links or Nodes.
  function getResourceLabel(allresource, sheet, request, colorSchemaDict, isLinkObj) {
    const resourceLabelList = [];

    _.forEach(allresource, function (resourceObj) {
      let dataValue;
      let data = '';

      // Here we are trying to map the received ES response of
      // metrics to the nodes or Links. We check the node-label or link-label in the
      // returned instance's label, if its available, we assume
      // that the two are connected and use this metric to update
      // the node label or link label.
      _.map(sheet[0].list, function (instance) {
        let resourceLabel = '';
        let unit = '';
        const splitInstanceLabel = instance.label.split('>');
        const resourceName = splitInstanceLabel[0];
        const label = splitInstanceLabel[1];
        const hasUnitVal = splitInstanceLabel[2];

        // to display metric for a perticular node or link
        // checking label has configured and node or link label.
        if (resourceName === resourceObj.label) {
          let queryList = request.payload.sheet[0];
          queryList = request.payload.sheet[0].split('),');

          // Get the dataValue by iterating through queryList
          _.each(queryList, function (query) {

            // For metric count and sum we are addingup two buckets.
            if ((_.includes(query, 'metric=count') || (_.includes(query, 'metric=sum')))
            && _.includes(query, instance.label) && (instance.data.length === 2)) {
              dataValue = instance.data[0][1] + instance.data[1][1];
              return false;
            } else {
              dataValue = instance.data[0][1];
            }
          });

          if (typeof dataValue === 'number') {
            // If its a float, we use only two decimal points
            if (Math.round(dataValue) !== dataValue) {
              dataValue = parseFloat(dataValue).toFixed(2);
            }
          }

          // Get the unit if it is specified in the configuration
          if (hasUnitVal !== undefined) {
            unit = hasUnitVal;
          }

          // Check if label exists as a metric in the
          // metric dictionary look up. If exists
          // call the function 'getColorCodedMetricLabel'
          // to get the colored metric node label.
          if (colorSchemaDict.hasOwnProperty(label)) {
            resourceLabel = getColorCodedMetricLabel(colorSchemaDict[label], label, dataValue, unit);

            // For link object get color for connected links.
            if (isLinkObj === true) {
              // color the link with first metric's color.
              // If first metric has not colored then it will be default color.
              if (!resourceLabelList.includes(resourceObj.label)) {
                resourceObj.color = getColorForLink(resourceLabel);
              }
            }

          } else {
            // If color schema is not configured for a metric, we
            // show the node or link labels for this metric in black.
            resourceLabel = '\n<code>' + label + ':' + dataValue +  unit + '</code>';
          }

          data = data + resourceLabel;
          // Pushing all resource objects label name to the list.
          resourceLabelList.push(resourceObj.label);
        }
      });

      // Now update the resourceObj label
      // For linkObj don't display Link name.
      if (isLinkObj === true) {
        resourceObj.label = data;
      } else {
        resourceObj.label = '<code>' + resourceObj.label + '</code>' + '\n' + data;
      }
    });
  }

  /*
   * This is a helper function to create a dictionary look up
   * using the color schema reaceived from front end.
   */
  function addColorConfigForMetric(metricObj, colorSchemaDict) {
    const colorConfigDict = {};
    colorConfigDict.min = metricObj.min;
    colorConfigDict.max = metricObj.max;
    colorConfigDict.color = metricObj.color;
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
      _.forEach(colorSchema, function (metricObj) {
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
      let connection = undefined;
      try {
        connection = Parser.parse(request.payload.connection[0]);
      } catch(err) {
        console.log('An error occured');
        console.log(err);
        replyWithError(err, reply);
        return;
      }

      // The below is to find the nodes, links from the connection
      // configuration
      const allNodesDict = {};
      const allNodes = [];
      const allLinks = [];
      const nodeDashboardDict = {};
      let nodeId = 1;
      let toNodeId;
      let toNode;
      let fromNodeId;
      let fromNode;
      let linkId = 1;
      let edgeName = '';

      // pathvislist contains the list of objects created after grammar
      // parsing. It contains the nodes and their information..
      // Information looks like:
      // For 'isconnectedto', it will provide following:
      // {"connected": {
      //       "from":{"value":"10.10.10.1"},
      //       "to":{"value":"11.11.11.1"},
      //       "name": {"value": "edge name"} // edge name is optional.
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
      _.map(connection.pathvislist, function (connect) {
        // If its the isconnectedto syntax.. its used to create a
        // connection between two nodes
        if ('connected' in connect) {
          let toNodeObj = {};
          let fromNodeObj = {};
          toNode = connect.connected.to.value;
          fromNode = connect.connected.from.value;

          // If connection has name then assign name to edgeName.
          if (connect.connected.name) {
            edgeName = connect.connected.name.value;
          }

          // Check if the node is already seen or not...
          if(toNode in allNodesDict) {
            toNodeObj = allNodesDict[toNode];
          } else {
            // We are seeing this node first time, let us add this
            // in the all nodes dict as well as allNodes list
            toNodeObj.id = nodeId;
            allNodesDict[toNode] = toNodeObj;
            nodeId += 1;
            allNodes.push(toNodeObj);
          }
          toNodeId = toNodeObj.id;

          // Do the same for from-node as well
          if (fromNode in allNodesDict) {
            fromNodeObj = allNodesDict[fromNode];
          } else {
            // We are seeing this node first time, let us add this
            // in the all nodes dict as well as allNodes list
            fromNodeObj.id = nodeId;
            allNodesDict[fromNode] = fromNodeObj;
            nodeId += 1;
            allNodes.push(fromNodeObj);
          }
          fromNodeId = fromNodeObj.id;

          // Create the link..
          const linkObj = createLink(linkId, fromNodeId, toNodeId, allLinks, edgeName);
          edgeName = '';
          console.log('Adding node object');
          console.log(fromNodeObj);
          console.log(toNodeObj);
          console.log(linkObj);
          linkId += 1;
        } else if ('node_type' in connect) {
          // For node attributes, node_type is used
          const node = connect.node_type.node.value;
          const name = connect.node_type.name.value;
          const type = connect.node_type.type.value;
          const x = connect.node_type.x.value;
          const y = connect.node_type.y.value;
          if (node in allNodesDict) {
            // If we have seen this node already, let us update all
            // the attributes
            const nodeObj = allNodesDict[node];
            nodeObj.font = {};
            nodeObj.font.multi = 'html';
            nodeObj.label = name;
            nodeObj.group = type;
            nodeObj.x = x;
            nodeObj.y = y;
            if ('dashboard' in connect.node_type) {
              nodeDashboardDict[nodeObj.id] = connect.node_type.dashboard.value;
            }
          }
        }
      });

      // Check node or link has duplicate name.
      checkDuplicateName(allNodes, allLinks, reply);

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
        console.log('Got an error');
        console.log(e);
        replyWithError(e, reply);
        return;
      }

      return Promise.all(sheet).then(function (sheet) {
        // Display the node with label and metrics.
        getResourceLabel(allNodes, sheet, request, colorSchemaDict, false);

        // Display the metrics on a link.
        getResourceLabel(allLinks, sheet, request, colorSchemaDict, true);

        // We have built all the required information in allNodes and
        // allLinks, create a data object and send it as repsonse
        const data = {
          'nodes': allNodes,
          'edges': allLinks,
          'node_dashboard_dict': nodeDashboardDict
        };

        return reply({ 'data': data });
      }).catch(function (e) {
        if (e.isBoom) {
          reply(e);
        } else {
          replyWithError(e, reply);
        }
      });

    }
  };

}
