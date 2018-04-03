export default function (server) {

  const _ = require('lodash');

  // dictionary for document type.
  const dataSourceDocTypeDict = {
    'device_heartbeat': 'ping',
    'service_heartbeat': 'tcpping',
    'url_heartbeat': 'urlbeat',
    'tracepath_beat': 'full-path'
  };

  // dictionary for Metric Name.
  const metricDisplayName = {
    'rtt': 'RTT',
    'jitter': 'Jitter',
    'downloadtime': 'Download time',
    'loss': 'Loss'
  };

  // This function is to create metric name to display the label in front end.
  function getMetricDisplayName(metricName) {
    if (metricName in metricDisplayName) {
      return metricDisplayName[metricName];
    } else {
      return metricName;
    }
  }

  // To reply error with error code to the front end.
  function replyWithError(e, reply) {
    reply({ title: e.toString(), message: e.toString(), stack: e.stack }).code(400);
  }

  /*
   * This function is called to create the default metric string
   * from the passed metric-name and value
   */
  function getDefaultMetricString(metricName, value, visFormat) {
    let metricString;
    // for jitter, rtt, downloadtime we append 'ms'
    if (metricName === 'rtt' || metricName === 'jitter' || metricName === 'downloadtime') {
      metricString = getMetricDisplayName(metricName) + ': ' + value + 'ms';
    } else {
      // for lostPercentage, we append '%'
      metricString = getMetricDisplayName(metricName) + ': ' + value + '%';
    }

    if (!(visFormat)) {
      metricString = '<p style="margin:8px">' + metricString + '</p>';
    }

    return metricString;
  }

  /*
   * This is called ot get the metric string based on the color passed
   * We have fixed the following color and font scheme as Vis library
   * support only three such scheme
   * red - BoldItalic
   * green - italic
   * orange - Bold
   */

  function getMetricStringForColor(metricName, value, color, visFormat) {
    const metricString = getDefaultMetricString(metricName, value, visFormat);
    // If color is red, use both bold and italic
    if (color === 'Red') {
      if (visFormat) {
        return ('<b><i>' + metricString + '</i></b>');
      } else {
        return '<p style="margin:8px;color:red">' + metricString + '</p>';
      }
    } else if (color === 'Orange') {
      if (visFormat) {
        return ('<b>' + metricString + '</b>');
      } else {
        return '<p style="margin:8px;color:orange">' + metricString + '</p>';
      }
    } else {
      if (visFormat) {
        return ('<i>' + metricString + '</i>');
      } else {
        return '<p style="margin:8px;color:green">' + metricString + '</p>';
      }
    }
  }


  /*
   * This function is called to process the ES response. Based on that it
   * creates a response dict which has a list of aggregations and list of
   * metric
   */
  function processESResponse(esQuery, respAggs, instanceDict, responseList) {
    let count = 0;
    for (const key in esQuery.aggs) {
      // The key should be in resp-aggregations, if not, we cannot continue
      if (key in respAggs) {
        const aggs = respAggs[key];
        if ('buckets' in aggs) {
          if ('terms' in esQuery.aggs[key]) {
            // We have buckets available, let us iterate on the same
            for (count = 0; count < aggs.buckets.length; count++) {
              if (count !== 0) {
                const instanceDupObj = _.clone(instanceDict, true);
                instanceDict = instanceDupObj;
                responseList.push(instanceDict);
              }
              instanceDict[esQuery.aggs[key].terms.field] = aggs.buckets[count].key;
              if ('aggs' in esQuery.aggs[key]) {
                processESResponse(esQuery.aggs[key], aggs.buckets[count], instanceDict, responseList);
              }
            }
          }
        } else {
          // We assume that its metric.. We are currently assuming that
          // all are 'avg' metrics
          instanceDict[esQuery.aggs[key].avg.field] = aggs.value;
        }
      }
    }
  }

  /*
   * This function is called to create the metric string with the passed
   * values. It uses the configured colorSchema to identify the color to be
   * used. At present, we support only three color schemes because of the
   * vis.js limitation.
   */
  function getMetricString(metricName, value, colorSchema, visFormat) {

    // If no colorSchema is mentioned or range doesn't fit the value,
    // we will go with default.
    if(colorSchema.length === 0) {
      return getDefaultMetricString(metricName, value, visFormat);
    }

    // Default values..
    let found = false;
    let colorFound = '';

    // Iterate on colorSchema
    _.forEach(colorSchema, function (colorObj) {
      // Compare the mix, max with the value only if its for the same metric
      if (colorObj.metric === metricName) {
        // Frontend takes care of overlapping ranges..
        if (value >= colorObj.min && value <= colorObj.max) {
          found = true;
          colorFound = colorObj.color;
        }
      }
    });

    // If no-match, we return the default match string
    if (found) {
      return getMetricStringForColor(metricName, value, colorFound, visFormat);
    } else {
      return getDefaultMetricString(metricName, value, visFormat);
    }

  }

  /*
   * This function is called to create a link with the passed information. It
   * also adds the created object into the passed allLinks list.
   */
  function createLink(linkId, fromNodeId, toNodeId, allLinks) {
    const linkObj = {};
    linkObj.id = linkId;
    linkObj.from = fromNodeId;
    linkObj.to = toNodeId;
    linkObj.label = '';
    linkObj.color = 'blue';
    linkObj.font = {};
    linkObj.font.multi = 'html';

    allLinks.push(linkObj);
    return linkObj;
  }

  /*
   * Prepare the node object and insert it into node dictionary as well as
   * all-nodes list.
   */
  function prepareNodeObj(source, nodeId, nodeX, nodeY, hopId, nodeDict, allNodes) {
    const node = { id: nodeId };
    node.x = nodeX;
    node.y = nodeY;
    node.group = 'Router';
    node.label = '<i>' + source + '</i>';
    node.title = '';
    node.font = {};
    node.font.multi = 'html';
    if (hopId) {
      node.hopId = hopId;
    }
    node.key = source;
    nodeDict[source] = node;
    allNodes.push(node);
    return node;
  }

  /*
   * This function is create title for the node. The information here is shown
   * when user hovers on the passed node
   */
  function createTitle(nodeObj, colorSchema, rtt, jitter, lostP, org, Location) {

    nodeObj.title = '<div style="width:400px;padding:10px;font-size:20px;background:#E7EBEE;color:black">';

    nodeObj.title = nodeObj.title + '<p style="margin:8px;text-align:center;background:#cccccc;">Hop IP: ' + nodeObj.key + '</p>';

    if (org) {
      nodeObj.title = nodeObj.title + '<p style="margin:8px;">Organisation: ' + org + '</p>';
    }

    if (Location) {
      nodeObj.title = nodeObj.title + '<p style="margin:8px;">Location: ' + Location + '</p>';
    }

    // If rtt is available add it to the label
    if (rtt) {
      const rttMetric = getMetricString('rtt', rtt, colorSchema, false);
      nodeObj.title = nodeObj.title + rttMetric;
    }

    // If jitter is available add it to the label
    if (jitter) {
      const jitterMetric = getMetricString('jitter', jitter, colorSchema, false);
      nodeObj.title = nodeObj.title + jitterMetric;
    }

    // If lostP is available add it to the label
    if (lostP) {
      const lostPMetric = getMetricString('loss', lostP, colorSchema, false);
      nodeObj.title = nodeObj.title + lostPMetric;
    }

    nodeObj.title = nodeObj.title + '</div>';

    return;
  }

  /*
   * This function is called to get the x,y coordinate for the passed node
   * object.
   */
  function getXY(nodeObj, destination, hopId, hopIdDict) {
    // Starting x and y coordinate for node
    let nodeX = -450;
    let nodeY = -200;

    if (destination) {
      hopId = hopId;
    } else {
      hopId = hopId - 1;
    }

    const maxElementInOneRow = 10;
    let multiple = 0;
    if (hopId >= maxElementInOneRow) {
      const remainder = hopId % maxElementInOneRow;
      multiple = (hopId - remainder) / maxElementInOneRow;
    }

    nodeY = nodeY + multiple * 300;

    // For odd rows, we go left-to-right
    if (((multiple + 1) % 2) === 1) {
      nodeX = nodeX + (hopId % maxElementInOneRow - 1) * 150;
    } else {
      // For even rows we go right to left
      nodeX = nodeX + (maxElementInOneRow - (hopId % maxElementInOneRow) - 2) * 150;
    }

    // Now y axis will change based on the number-of-nodes in a hop..
    if (destination) {
      let nodeList;
      if (hopId in hopIdDict) {
        nodeList = hopIdDict[hopId];
        nodeList.push(nodeObj);
      } else {
        nodeList = [];
        nodeList.push(nodeObj);
        hopIdDict[hopId] = nodeList;
      }

      const length = nodeList.length;

      if (length !== 1) {
        // Change y if required.. This is to take care of keeping odd number node
        // below the first node and even node above the first node
        if (length % 2 === 0) {
          nodeY = nodeY + (length / 2) * 100;
        } else {
          nodeY = nodeY - ((length - 1) / 2) * 100;
        }
      }
    }

    nodeObj.x = nodeX;
    nodeObj.y = nodeY;

    return;

  }

  return {

    /*
     * This function is called when the frontend makes a request to fetch the
     * hop-by-hop details for a given source/destination pair. It prepares a
     * ES query and sends it to ES. Once the response comes, it parses the
     * same and creates a list-of-nodes and list-of-links from the response
     * and return the same
     */
    tracepath_vis_hop(request, reply) {

      // get data out of request, we have time-filter, source and
      // destination
      const timeFilter = request.payload.time;
      const source = request.payload.source;
      const destination = String(request.payload.destination);
      const colorSchema = request.payload.colorSchema;
      // Gets index value from the user in front-end
      const indexVal = request.payload.indexVal;

      // Create the ES query, we have two parts to it. One which is fixed
      // and another one which depends upon the data coming from front-end
      const esQuery = {};
      esQuery.size = 0;
      esQuery.aggs = {};
      esQuery.aggs['4'] = {};
      esQuery.aggs['4'].terms = {
        'field': 'from.keyword',
        'size': 100,
        'order': {
	  '1': 'desc'
        }
      };
      esQuery.aggs['4'].aggs = {};
      esQuery.aggs['4'].aggs['1'] = {
        'avg': {
          'field': 'average_rtt'
        }
      };
      esQuery.aggs['4'].aggs['5'] = {};
      esQuery.aggs['4'].aggs['5'].terms = {
        'field': 'hop-ip.keyword',
        'size': 5,
        'order': {
          '1': 'desc'
        }
      };
      esQuery.aggs['4'].aggs['5'].aggs = {};
      esQuery.aggs['4'].aggs['5'].aggs['1'] =  {
        'avg': {
          'field': 'average_rtt'
        }
      };
      const aggs6 = {};
      esQuery.aggs['4'].aggs['5'].aggs['6'] = aggs6;
      aggs6.terms = {
        'field': 'org',
        'size': 5,
        'order': {
          '1': 'desc'
        }
      };
      aggs6.aggs = {};
      aggs6.aggs['1'] = {
        'avg': {
          'field': 'average_rtt'
        }
      };
      aggs6.aggs['7'] = {};
      aggs6.aggs['7'].terms =  {
        'field': 'Location',
        'size': 5,
        'order': {
          '1': 'desc'
        }
      };
      aggs6.aggs['7'].aggs = {};
      aggs6.aggs['7'].aggs['1'] = {
        'avg': {
          'field': 'average_rtt'
        }
      };
      aggs6.aggs['7'].aggs['8'] = {};
      aggs6.aggs['7'].aggs['8'].terms = {
        'field': 'hop',
        'size': 5,
        'order': {
          '1': 'desc'
        }
      };
      aggs6.aggs['7'].aggs['8'].aggs = {};
      aggs6.aggs['7'].aggs['8'].aggs['1'] = {
        'avg': {
          'field': 'average_rtt'
        }
      };
      aggs6.aggs['7'].aggs['8'].aggs['2'] = {
        'avg': {
          'field': 'avg_jitter'
        }
      };
      aggs6.aggs['7'].aggs['8'].aggs['3'] = {
        'avg': {
          'field': 'loss_percent'
        }
      };


      // Add the filter... We use 'hop' type and source/destination pair
      // passed by frontend
      esQuery.query = {};
      esQuery.query.bool = {};
      esQuery.query.bool.must = [];
      esQuery.query.bool.must.query = {};
      esQuery.query.bool.must.query.query_string = {};
      esQuery.query.bool.must.query.query_string.query = 'type:hop AND host.keyword:' + source + ' AND target:' + destination;
      esQuery.query.bool.must.query.query_string.analyze_wildcard = true;

      esQuery.query.bool.must.filter = {};
      esQuery.query.bool.must.filter.bool = {};
      esQuery.query.bool.must.filter.bool.must = [];
      esQuery.query.bool.must.filter.bool.must_not = [];

      // Add the time-filter
      const mustObject = {};
      mustObject.range = {};
      mustObject.range['@timestamp'] = {};
      mustObject.range['@timestamp'].gte = timeFilter.gte;
      mustObject.range['@timestamp'].lte = timeFilter.lte;
      mustObject.range['@timestamp'].format = 'epoch_millis';
      esQuery.query.bool.must.filter.bool.must.push(mustObject);

      // Let us get the extended ES filter and append it.. This is useful
      // when a user is drilling down on table/matrix etc.
      const extendedMustObject = request.payload.extended.es.filter.bool.must;
      const extendedMustNotObject = request.payload.extended.es.filter.bool.must_not;
      esQuery.query.bool.must.filter.bool.must = esQuery.query.bool.must.filter.bool.must.concat(extendedMustObject);
      esQuery.query.bool.must.filter.bool.must_not = esQuery.query.bool.must.filter.bool.must_not.concat(extendedMustNotObject);

      // callWithRequest is what sends a request to the ES.
      const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');
      const body = { index: indexVal, body: esQuery };

      // Node dictionary uses key as node address and value as the node-object
      const nodeDict = {};

      // The below lists is created for Vis. It contains all nodes and edges
      const allNodes = [];
      const allLinks = [];

      // Starting node-id and link-id
      let nodeId = 1;
      let linkId = 1;

      // Starting x and y coordinate for node
      const nodeX = -600;
      const nodeY = -200;

      // Hop id dict is used to identify if there are multiple nodes on a
      // given hop level, if so, we replace the y axis location of the new
      // node such that they all come on the same vertical line
      const newHopIdDict = {};

      const fromHopIdDict = {};
      const toHopIdDict = {};

      const data = { 'nodes': allNodes, 'edges': allLinks };

      // Invoke ES query and once we get the response, process it..
      callWithRequest(request, 'search', body).then(function (resp) {

        let lastHopId = 0;

        // Process the ES response...
        const responseList = [];
        const instanceDict = {};

        responseList.push(instanceDict);
        processESResponse(esQuery, resp.aggregations, instanceDict, responseList);

        // Creating the first source node.
        const srcNodeObj = prepareNodeObj(source, nodeId, nodeX, nodeY - 200, 0, nodeDict, allNodes);
        nodeId += 1;

        // Iterate on the returned list, it contains the following
        // aggrgraton-id and its corresponding values
        _.forEach(responseList, function (responseObj) {
          // Create a node for each from and to and then add a link
          const rtt = Math.round(responseObj.average_rtt);
          const jitter = Math.round(responseObj.avg_jitter);
          const lostP = Math.round(responseObj.loss_percent);
          const from = responseObj['from.keyword'];
          const to = responseObj['hop-ip.keyword'];
          const org = responseObj.org;
          const Location = responseObj.Location;
          const hopId = responseObj.hop;
          let fromNodeObj;
          let toNodeObj;

          // Add from node.., hop-id 1 is always source node
          if (hopId !== 1) {
            if (from in nodeDict) {
              fromNodeObj = nodeDict[from];
              fromHopIdDict[from] = fromNodeObj;
            } else {
              // We add the node-x and node-y as zero, this gets
              // updated when we find it in the 'to' part of a
              // link
              fromNodeObj = prepareNodeObj(from, nodeId, 0, 0, hopId, nodeDict, allNodes);
              fromHopIdDict[from] = fromNodeObj;
              nodeId += 1;
            }
          } else {
            // Its source node object
            fromNodeObj = srcNodeObj;

            // Add this object all into node dictionary
            nodeDict[source] = srcNodeObj;
          }

          // Create to node object..
          if (to in nodeDict) {
            toNodeObj = nodeDict[to];
            toHopIdDict[to] = toNodeObj;
            // If node-x and node-y are not updated yet, lets do
            // it..
            if (toNodeObj.x === 0 && toNodeObj.y === 0) {
              getXY(toNodeObj, true, hopId, newHopIdDict);
            }
          } else {
            toNodeObj = prepareNodeObj(to, nodeId, nodeX, nodeY, hopId, nodeDict, allNodes);
            getXY(toNodeObj, true, hopId, newHopIdDict);
            toHopIdDict[to] = toNodeObj;
            nodeId += 1;
          }

          // Update the node-object's rtt, jitter... we do it only
          // when the node is in 'to'
          createTitle(toNodeObj, colorSchema, rtt, jitter, lostP, org, Location);

          // Calcualte last-hop-id, this is later used for different
          // purposes..
          if (lastHopId < hopId) {
            lastHopId = hopId;
          }

          // Let us create a link for from-to
          const linkObj = createLink(linkId, fromNodeObj.id, toNodeObj.id, allLinks);

          // If rtt is available add it to the label
          if (rtt) {
            const rttMetric = getMetricString('rtt', rtt, colorSchema, true);
            linkObj.label = linkObj.label + '\n\n' + rttMetric;
          }

          linkId += 1;

        });

        // Update the last hop-id label with destination name only if the
        // destination wasn't an IP address
        const regexStr = '.*[a-zA-Z]+.*';
        const ipRegexStr = '[0-9\.]+';
        if (destination.match(regexStr)) {
          let lastObj;
          if (lastHopId in newHopIdDict) {
            const lastHopIdObjList = newHopIdDict[lastHopId];
            _.forEach(lastHopIdObjList, function (lastHopObj) {
              // We add the domain name along with IP address if
              // its last hop and its an IP address..
              if (lastHopObj.key.match(ipRegexStr)) {
                const label = lastHopObj.label;
                lastHopObj.label = '<i>' + destination + '</i>\n' + label;
              }
              lastObj = lastHopObj;
            });
          }

          // If a destination is hostname, there may be multiple IP
          // addresses and we identify them using the object which does
          // not have a 'to' object and uses an IP address. It need
          // not be the last hop and so we run a new loop below
          if (lastObj) {
            const lastObjX = lastObj.x;
            let lastObjY = lastObj.y;
            for(const key in toHopIdDict) {
              // If it exist in from-hop-id-dict, we can skip it
              if ((!(key in fromHopIdDict)) && (lastHopId !== toHopIdDict[key].hopId)) {
                if (toHopIdDict[key].key.match(ipRegexStr)) {
                  const label = toHopIdDict[key].label;
                  toHopIdDict[key].label = '<i>' + destination + '</i>\n' + label;
                }
                toHopIdDict[key].x = lastObjX;
                lastObjY += 100;
                toHopIdDict[key].y = lastObjY;
              }
            }
          }
        }

        // Node for back button
        return reply({ 'data': data });
      });
    },

    /*
     * This is for handling Heartbeat Map visualization. It makes ES query
     * to a specific index and get the required information and from that
     * it prepares the node-and-edge information which is returned to the
     * front-end
     */

    heartbeat_vis_full_path(request, reply) {

      // Get the parameters sent by front-end
      const timeFilter = request.payload.time;
      const colorSchema = request.payload.colorSchema;
      const indexVal = request.payload.indexVal;
      let typeVal = 'undefined';
      const esFilterVal = request.payload.filterVal;

      if(request.payload.typeVal in dataSourceDocTypeDict) {
        typeVal = dataSourceDocTypeDict[request.payload.typeVal];
      }
      else {
        console.log('An error occured');
        replyWithError(new Error('configuration not proper'), reply);
        return;
      }

      // Create the ES query, we have two parts to it. One which is fixed
      // and another one which depends upon the data coming from front-end
      const esQuery = {};
      esQuery.size = 0;
      esQuery.aggs = {};
      esQuery.aggs['2'] = {};
      esQuery.aggs['2'].terms = {
        'field': 'host.keyword',
        'size': 100,
        'order': {
          '1': 'desc'
        }
      };
      esQuery.aggs['2'].aggs = {};
      // Checks the type of input as not of urlbeat
      //if so..
      if (typeVal !== 'urlbeat') {
        esQuery.aggs['2'].aggs = {
          '1': {
            'avg': {
              'field': 'average_rtt'
            }
          }
        };
        esQuery.aggs['2'].aggs['3'] = {
          'terms': {
            'field': 'target.keyword',
            'size': 100,
            'order': {
              '1': 'desc'
            }
          }
        };
        esQuery.aggs['2'].aggs['3'].aggs = {
          '1': {
            'avg': {
              'field': 'average_rtt'
            }
          }
        };
        // Checks the type value of full_path
        // if so.. it fetch reachability and total hops
        if (typeVal === 'full-path') {
          esQuery.aggs['2'].aggs['3'].aggs['4'] = {
            'avg': {
              'field': 'reachability'
            }
          };
          esQuery.aggs['2'].aggs['3'].aggs['5'] = {
            'avg': {
              'field': 'total-hops'
            }
          };
        }
        // Checks the type value of tcpping
        // if so.. it fetches port and average_rtt.
        else if (typeVal === 'tcpping') {
          esQuery.aggs['2'].aggs['3'].aggs['4'] = {
            'terms': {
              'field': 'port.keyword',
              'size': 5,
              'order': {
                '1': 'desc'
              }
            },
            'aggs': {
              '1': {
                'avg': {
                  'field': 'average_rtt'
                }
              }
            }
          };
        }
      }
      // If type value is urlbeat
      // It fetches downloadtime, url as destination.
      else {
        esQuery.aggs['2'].aggs['1'] = {
          'avg': {
            'field': 'download_time'
          }
        };
        esQuery.aggs['2'].aggs['3'] = {};
        esQuery.aggs['2'].aggs['3'].terms = {
          'field': 'url.keyword',
          'size': 100,
          'order': {
            '1': 'desc'
          }
        };
        esQuery.aggs['2'].aggs['3'].aggs = {
          '1': {
            'avg': {
              'field': 'download_time'
            }
          }
        };
      }

      // Checks whether entered filter value or not
      // If not it appends *
      let filterString;
      if(typeof esFilterVal === 'undefined' || esFilterVal === '') {
        filterString = '*';
      }
      else {
        filterString = esFilterVal;
      }

      let dataSourceTypeVal = 'type.keyword:';
      dataSourceTypeVal += typeVal;
      // Create a filter using type alone
      esQuery.query = {};
      esQuery.query.bool = {};
      esQuery.query.bool.must = [];
      esQuery.query.bool.must.push({
        'query_string': {
          'query': dataSourceTypeVal,
          'analyze_wildcard': true
        }
      });

      esQuery.query.bool.must_not = [];
      esQuery.query.bool.filter = [];
      esQuery.query.bool.filter.push({
        'query_string': {
          'query': filterString,
          'analyze_wildcard': true
        }
      });

      // Create a time-filter with passed time data
      const mustObject = {};
      mustObject.range = {};
      mustObject.range['@timestamp'] = {};
      mustObject.range['@timestamp'].gte = timeFilter.gte;
      mustObject.range['@timestamp'].lte = timeFilter.lte;
      mustObject.range['@timestamp'].format = 'epoch_millis';
      esQuery.query.bool.must.push(mustObject);

      // Let us get the extended ES filter and append it.. This is useful
      // when a user is drilling down on table/matrix etc.
      const extendedMustObject = request.payload.extended.es.filter.bool.must;
      const extendedMustNotObject = request.payload.extended.es.filter.bool.must_not;
      esQuery.query.bool.must = esQuery.query.bool.must.concat(extendedMustObject);
      esQuery.query.bool.must_not = esQuery.query.bool.must_not.concat(extendedMustNotObject);

      // callWithRequest is used to send the ES query..
      const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');
      const body = { index: indexVal, body: esQuery };

      // Following are constants used in building the response
      //
      // numNodeInOneXForSrc - Used to decide when to change x,y for
      //                             source node
      // numNodeInOneX         - Used to decide when to change x,y for
      //                             destination node
      // nodeId                   - Starts with 1
      // linkId                   - Starts with 1
      // nodeSrcXStart          - X axis location for source
      // nodeSrcYStart          - Y axis location for source
      // nodeDestXStart         - X axis location for destination
      // nodeDestYStart         - Y axis location for destination

      const numNodeInOneXForSrc = 4;
      const numNodeInOneX = 7;
      const nodeDict = {};
      const responseList = [];
      const allNodes = [];
      const allLinks = [];
      let nodeId = 1;
      let linkId = 1;
      const nodeSrcXStart = -500;
      const nodeSrcYStart = -200;
      const nodeDestXStart = 200;
      const nodeDestYStart = -200;
      let nodeSrcX = nodeSrcXStart;
      let nodeSrcY = nodeSrcYStart;
      let nodeDestX = nodeDestXStart;
      let nodeDestY = nodeDestYStart;
      let numSrcNodes = 1;
      let numDestNodes = 1;

      callWithRequest(request, 'search', body).then(function (resp) {

        const instanceDict = {};
        responseList.push(instanceDict);
        //Checks if aggregation property exist under resp
        // if aggregation doesnot exist we initialize
        // nodes and edges to []
        if(!resp.hasOwnProperty('aggregations')) {
          return reply({ 'data': [] });
        }
        processESResponse(esQuery, resp.aggregations, instanceDict, responseList);

        _.forEach(responseList, function (responseObj) {
          // If we haven't got host itself, let us return..
          if (!('host.keyword' in responseObj)) {
            return false;
          }

          // Populate local variable for this response..
          const source = responseObj['host.keyword'];
          const dest = responseObj['target.keyword'];
          let desturl;
          let downloadTime;
          let port;
          let hops;
          let reachability;
          let rtt;

          // Based on the type fetching perticular response.
          if (typeVal === 'urlbeat') {
            desturl = responseObj['url.keyword'];
            downloadTime = Math.round(responseObj.download_time);
          } else {
            rtt = Math.round(responseObj.average_rtt);
          }

          if (typeVal === 'tcpping') {
            port = responseObj['port.keyword'];
          }

          if (typeVal === 'full-path') {
            hops = Math.round(responseObj['total-hops']);
            reachability = responseObj.reachability;
          }
          let srcNodeId;
          let srcNode;

          if (source in nodeDict) {
            srcNode = nodeDict[source];
            srcNodeId = srcNode.id;
          } else {
            srcNodeId = nodeId;
            srcNode = prepareNodeObj(source, nodeId, nodeSrcX, nodeSrcY, undefined, nodeDict, allNodes);
            if (numSrcNodes % numNodeInOneXForSrc === 0) {
              const multiplier = numSrcNodes / numNodeInOneX;
              nodeSrcX = nodeSrcXStart + multiplier * 100;
              nodeSrcY = nodeSrcYStart + multiplier * 250;
            }
            nodeId += 1;
            numSrcNodes += 1;
            nodeSrcY += 250;
          }

          let destNode;
          // Create  destination node if required..
          // Based on the type the destNodeKey value is set
          // by the response which had fetched.
          let destNodeKey;
          if (typeVal === 'urlbeat') {
            destNodeKey = desturl;
          } else {
            destNodeKey = dest;
          }
          if (typeVal === 'tcpping') {
            destNodeKey += ' : ' + port;
          }

          if (destNodeKey in nodeDict) {
            destNode = nodeDict[destNodeKey];
          } else {
            destNode = prepareNodeObj(destNodeKey, nodeId, nodeDestX, nodeDestY, undefined, nodeDict, allNodes);
          }
          const destNodeId = destNode.id;
          if (numDestNodes % numNodeInOneX === 0) {
            const multiplier = numDestNodes / numNodeInOneX;
            nodeDestX = nodeDestXStart + multiplier * 200;
            nodeDestY = nodeDestYStart + multiplier * 100;
          } else {
            nodeDestY += 100;
          }

          nodeId += 1;
          numDestNodes += 1;
          // Create a link object between source/destination
          const linkObj = createLink(linkId, srcNodeId, destNodeId, allLinks);

          // Let us get the metric value in string format with
          // correct color etc.
          let colorMetric;
          if(typeVal !== 'urlbeat') {
            colorMetric = getMetricString('rtt', rtt, colorSchema, true);
          } else {
            colorMetric = getMetricString('downloadtime', downloadTime, colorSchema, true);
          }

          if (typeVal === 'full-path') {
            if (reachability === 0) {
              linkObj.color = 'red';
            } else if (reachability === 1) {
              linkObj.color = 'blue';
              if (rtt) {
                linkObj.label = '\nHops:' + hops + '\n' + colorMetric;
              } else {
                linkObj.label = '\nHops:' + hops;
              }
            } else {
              linkObj.color = 'orange';
              if (rtt) {
                linkObj.label = '\nHops:' + hops + '\n' + colorMetric;
              } else {
                linkObj.label = '\nHops:' + hops;
              }
            }

          } else {
            if (downloadTime > 0 || rtt > 0) {
              linkObj.label = colorMetric;
            } else {
              linkObj.color = 'red';
              linkObj.label = colorMetric;
            }
          }
          linkId += 1;
        });

        const data = { 'nodes': allNodes, 'edges': allLinks };
        return reply({ 'data': data });
      })
        .catch(function (e) {
          if (e.isBoom) {
            reply(e);
          } else {
            replyWithError(e, reply);
          }
        });
    }
  };
}
