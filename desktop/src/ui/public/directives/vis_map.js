import { colors } from 'ui/utils/severity_colors.js';

const module = require('ui/modules').get('kibana/uvmap_vis');
const _ = require('lodash');
const vis = require('vis-network');
import { getImages } from 'ui/utils/vunet_image_utils.js';

module.directive('visMap', function (StateService) {

  return {
    restrict: 'E',
    scope: {
      mapData: '=',
      nodePlacementType: '=',
      doesNodeHasDashboard: '=',
      utmEventArgs: '='
    },
    replace: true,
    template: '<div class="network-map"></div>',
    link: ($scope, element) => {

      // We obtain all the methods to be called for various events
      const {
        onNodeSelect,
        onNodeDeselect,
        onEdgeDeselect,
        onLinkSelect,
        onNodeDragStart,
        onNodeDragEnd,
        onNetworkStabilized
      } = $scope.utmEventArgs;

      let groups = {};

      // Get the updated groups with uploaded images.
      // Call vis Network after getting the images.
      getImages(StateService, 'DictInDict').then(function (iconDict) {
        groups = iconDict;
        // groups[]
        // We populate groups with common properties below
        _.forOwn(groups, (group) =>
        {
          group.shape = 'circularImage';
          group.size = 40;
          group.font = {
            size: 21,
            color: '#353535'
          };
        });

        // Other groups are added below
        groups.metric = {
          shape: 'text',
          font: {
            size: 18,
            align: 'left',
            color: '#353535'
          }
        };
        groups.iconGreen = {
          shape: 'icon',
          icon: { face: 'FontAwesome', size: 20, color: colors.green, code: '\uf058' },
          iconFontFace: 'FontAwesome',
          iconSize: 21,
        };
        groups.iconYellow = {
          shape: 'icon',
          icon: { face: 'FontAwesome', size: 20, color: colors.yellow, code: '\uf06a' },
          iconFontFace: 'FontAwesome',
          iconSize: 21,
        };
        groups.iconOrange = {
          shape: 'icon',
          icon: { face: 'FontAwesome', size: 20, color: colors.orange, code: '\uf06a' },
          iconFontFace: 'FontAwesome',
          iconSize: 21,
        };
        groups.iconRed = {
          shape: 'icon',
          icon: { face: 'FontAwesome', size: 20, color: colors.red, code: '\uf057' },
          iconFontFace: 'FontAwesome',
          iconSize: 21,
        };

        // We watch mapData and if it changes, we draw the network
        $scope.$watch('mapData', function () {

          if (!$scope.mapData) {
            return;
          }

          const data = $scope.mapData;

          if (!data.nodes) {
            return;
          }

          const visData = {
            nodes: new vis.DataSet(data.nodes),
            edges: new vis.DataSet(data.edges)
          };

          const options = {
            groups: groups,
            edges: {
              width: 2,
              arrows: {
                middle: {
                  enabled: true,
                  scaleFactor: 0.5
                }
              },
              physics: false,
              length: 500,
              smooth: {
                enabled: true,
                type: 'cubicBezier',
                roundness: 0.65,
              }
            },
            nodes: {
              borderWidth: 2,
              physics: false,
              chosen: true,
              color: {
                background: 'white',
                hover: {
                  background: 'white',
                },
                highlight: {
                  background: 'white',
                }
              },
              widthConstraint: 215,
            },
            interaction: {
              selectConnectedEdges: false,
              hover: true
            }
          };

          // Option to enable physics.
          const physicsEnableOption = {
            groups: groups,
            edges: {
              width: 2,
              arrows: {
                middle: {
                  enabled: true,
                  scaleFactor: 0.5
                }
              },
              physics: false,
              length: 500,
              smooth: {
                enabled: true,
                type: 'cubicBezier',
                roundness: 0.65
              }
            },
            nodes: {
              borderWidth: 2,
              physics: true,
              chosen: true,
              color: {
                background: 'white',
                hover: {
                  background: 'white',
                },
                highlight: {
                  background: 'white',
                }
              },
              widthConstraint: 215,
            },
            interaction: {
              selectConnectedEdges: false,
              hover: true
            }
          };

          let network;

          // Use 'withPhysics' to network uses physics to
          // automatically align nodes get X and Y value

          // Use 'dragNDrop' to manually update X and Y
          // value by drag and drop of the nodes

          if ($scope.nodePlacementType === 'withPhysics' ||
            $scope.nodePlacementType === 'physicsAndDragNDrop') {
            network = new vis.Network(element[0], visData, physicsEnableOption);
          } else if ($scope.nodePlacementType === 'dragNDrop') {
            network = new vis.Network(element[0], visData, options);
          } else {
          // Throw an error if nodePlacementType has not passed.
            throw 'Network will not be created without nodePlacementType';
          }

          // Let us immediately stablize the network immediately
          network.stabilize();
          network.fit();

          $scope.first_stable = false;
          // Once network gets stablized, we stop the stablization
          network.on('stabilized', () => {
            if($scope.nodePlacementType === 'physicsAndDragNDrop') {
            // check network has stabilized or not
            // if it is stabilized then stop stabilization
            // switch options to dragNDrop
              if ($scope.first_stable) {
                network.storePositions();
                network.setOptions(options);
                network.off('stabilized');
              } else {
                $scope.first_stable = true;
              }
            } else {
              network.off('stabilized');
            }
          });

          const handleCallbackResp = (resp) => {
            switch (resp.action) {
              case 'moveNode':
                _.each(resp.val, (node) => {
                  network.moveNode(node.id, node.x, node.y);
                });
                break;
              case 'selectNodes':
                network.selectNodes(resp.val);
                break;
              default:
                throw `action of type ${resp.action} was not found`;
            }
          };

          // After physics is applied we need to re-align the nodeGroups and icons below the node
          // TODO: performs this action using a setTimeout is a hack, find better way of implementing this
          setTimeout(() => {
            if (onNetworkStabilized) {
              const callbackResp = onNetworkStabilized(network.getPositions());

              // If a callbackResp is provided, we perform the required action
              if (callbackResp) {
                handleCallbackResp(callbackResp);
              }
            }
          }, 500);

          // When a node is selected, we check if there is a dashboard
          // associated with it, if so, we load that dashboard.
          network.on('selectNode', (params) => {
          // Invoke the passed function
            if (onNodeSelect) {
              const NodeImageGroups = groups;
              // send selectedNodeId
              const callbackResp = onNodeSelect(params.nodes[0], NodeImageGroups);

              // If a callbackResp is provided, we perform the required action
              if (callbackResp) {
                handleCallbackResp(callbackResp);
              }
            }
          });

          // Perform any action when a node is de-selected
          // A node can be de-selected by clicking outside the node
          network.on('deselectNode', (params) => {
            if (onNodeDeselect) {
            // send list of deselected nodes
              onNodeDeselect(params.nodes);
            }
          });

          // Perform any action when a edge is de-selected
          // An edge can be de-selected by clicking outside the edge
          network.on('deselectEdge', (params) => {
            if (onEdgeDeselect) {
            // send list of deselected edges
              onEdgeDeselect(params.edges);
            }
          });

          // Function is called when an edge clicked
          network.on('selectEdge', (params) => {
          // Invoke the passed function
            if (onLinkSelect) {
            // send selectedEdgeId
              onLinkSelect(params.edges[0]);
            }
          });

          if ($scope.doesNodeHasDashboard) {
          // On hovering a node make cursor as pointer.
            network.on('hoverNode', function (params) {
            // send hoveredNodeId
              if($scope.doesNodeHasDashboard(params.node)) {
                network.canvas.body.container.style.cursor = 'pointer';
              }
            });

            // On moving out of node make cursor as default.
            network.on('blurNode', function () {
              network.canvas.body.container.style.cursor = 'default';
            });
          }

          // when a node is dragged this function is called once
          network.on('dragStart', (params) => {
            if (onNodeDragStart) {
            // send draggedNodeId
              const callbackResp = onNodeDragStart(params.nodes[0]);

              // If a callbackResp is provided, we perform the required action
              if (callbackResp) {
                handleCallbackResp(callbackResp);
              }
            }
          });

          // When a node is dragged and released, at the end, this function is called
          network.on('dragEnd', (params) => {
          //function to update new x and y values in all nodes.
            if(onNodeDragEnd) {
            // send draggedNodeList
              onNodeDragEnd(params.nodes, network.getPositions());
            }
          });


          // Default zoomScale used afterd fitting all the nodes
          const currentZoomScale  = network.getScale();

          // We calculate the required offset, 85% of default zoomScale
          const zoomOutLimitOffset = (currentZoomScale * 0.85);

          // If user zooms out too much such that the node disappaers
          // then apply default zoom and fit all nodes
          network.on('zoom', () => {
            if(network.getScale() <= currentZoomScale - zoomOutLimitOffset)
            {
              network.fit();
            }
          });

        });
      });
    }
  };
});
