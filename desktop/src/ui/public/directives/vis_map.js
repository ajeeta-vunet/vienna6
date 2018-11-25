const module = require('ui/modules').get('kibana/uvmap_vis');
const _ = require('lodash');
const vis = require('vis');
module.directive('visMap', function () {

  return {
    restrict: 'E',
    scope: {
      mapData: '=',
      onNodeSelect: '=',
      onLinkSelect: '=',
      onNodeDragEnd: '=',
      nodePlacementType: '=',
    },
    replace: true,
    template: '<div class="network-map"></div>',
    link: ($scope, element) => {

      // These are the groups we support..
      const groups = {
        PC: {
          image: '/ui/vienna_images/pc_active.png',
          shape: 'image',
          size: 20,
          font: {
            color: '#2E3458',
            size: 17
          }
        },
        Wifi: {
          image: '/ui/vienna_images/wireless_access_active.png',
          shape: 'image',
          size: 20,
          font: {
            color: '#2E3458',
            size: 17
          }
        },
        WifiAlert: {
          image: '/ui/vienna_images/wireless_access_alert.png',
          shape: 'image',
          size: 20,
          font: {
            color: '#2E3458',
            size: 17
          }
        },
        Printer: {
          image: '/ui/vienna_images/printer_active.png',
          shape: 'image',
          size: 20,
          font: {
            color: '#2E3458',
            size: 17
          }
        },
        PrinterAlert: {
          image: '/ui/vienna_images/printer_alert.png',
          shape: 'image',
          size: 20,

          font: {
            color: '#2E3458',
            size: 17
          }
        },
        Mobile: {
          image: '/ui/vienna_images/mobile_active.png',
          shape: 'image',
          size: 20,
          font: {
            color: '#2E3458',
            size: 17
          }
        },
        MobileAlert: {
          image: '/ui/vienna_images/mobile_alert.png',
          shape: 'image',
          size: 20,
          font: {
            color: '#2E3458',
            size: 17
          }
        },
        Switch: {
          image: '/ui/vienna_images/switch_active.png',
          shape: 'image',
          size: 20,
          font: {
            color: '#2E3458',
            size: 17
          }
        },
        SwitchAlert: {
          image: '/ui/vienna_images/switch_alert.png',
          shape: 'image',
          size: 20,
          font: {
            color: '#2E3458',
            size: 17
          }
        },
        PCAlert: {
          image: '/ui/vienna_images/PC_alert.png',
          shape: 'image',
          size: 20,
          font: {
            color: '#2E3458',
            size: 17
          }
        },
        Firewall: {
          image: '/ui/vienna_images/firewall_active.png',
          shape: 'image',
          size: 20,
          font: {
            color: '#2E3458',
            size: 17
          }
        },
        FirewallAlert: {
          image: '/ui/vienna_images/firewall_alert.png',
          shape: 'image',
          size: 20,
          font: {
            color: '#2E3458',
            size: 17
          }
        },
        Router: {
          image: '/ui/vienna_images/router_active.png',
          shape: 'image',
          size: 20,
          font: {
            color: '#2E3458',
            size: 17
          }
        },
        RouterAlert: {
          image: '/ui/vienna_images/router_alert.png',
          shape: 'image',
          size: 20,
          font: {
            color: '#2E3458',
            size: 17
          }
        },
        App: {
          image: '/ui/vienna_images/application.png',
          shape: 'image',
          size: 20,
          font: {
            color: '#2E3458',
            size: 17
          }
        },
        Device: {
          image: '/ui/vienna_images/network_element.png',
          shape: 'image',
          size: 20,
          font: {
            color: '#2E3458',
            size: 17
          }
        },
        Server: {
          image: '/ui/vienna_images/server_active.png',
          shape: 'image',
          size: 20,
          font: {
            color: '#2E3458',
            size: 17
          }
        },
        ServerAlert: {
          image: '/ui/vienna_images/server_alert.png',
          shape: 'image',
          size: 20,
          font: {
            color: '#2E3458',
            size: 17
          }
        }
      };

      // Font option for node.
      const nodeFont = {
        align: 'left',
        ital: {
          color: 'green',
          size: 13,
          face: '"Open Sans", Helvetica, Arial, sans-serif',
        },
        bold: {
          color: 'orange',
          size: 13,
          face: '"Open Sans", Helvetica, Arial, sans-serif',
        },
        boldital: {
          color: 'red',
          size: 13,
          face: '"Open Sans", Helvetica, Arial, sans-serif',
        },
        mono: {
          color: 'black',
          size: 13,
          face: '"Open Sans", Helvetica, Arial, sans-serif',
        }
      };

      // Font option for edge.
      const edgeFont = {
        align: 'bottom',
        ital: {
          color: 'green',
          size: 12,
          face: '"Open Sans", Helvetica, Arial, sans-serif',
        },
        bold: {
          color: 'orange',
          size: 13,
          face: '"Open Sans", Helvetica, Arial, sans-serif',
        },
        boldital: {
          color: 'red',
          size: 14,
          face: '"Open Sans", Helvetica, Arial, sans-serif',
        }
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
            arrows: {
              middle: {
                enabled: true,
                scaleFactor: 0.5
              }
            },
            physics: false,
            font: edgeFont,
            smooth: {
              enabled: false
            }
          },
          nodes: {
            physics: false,
            chosen: true,
            color: {
              hover: {
                border: 'blue',
                background: 'red',
              }
            },
            font: nodeFont
          },
          interaction: {
            selectConnectedEdges: false,
            hover: true
          }
        };

        // Option to enable physics.
        const physicsEnableOption = {
          groups,
          edges: {
            arrows: {
              middle: {
                enabled: true,
                scaleFactor: 0.5
              }
            },
            physics: true,
            font: edgeFont,
            smooth: {
              enabled: false
            }
          },
          nodes: {
            physics: true,
            chosen: true,
            color: {
              hover: {
                border: 'blue',
                background: 'red',
              }
            },
            font: nodeFont
          },
          interaction: {
            selectConnectedEdges: false,
            hover: true
          }
        };


        let network;

        // Create a vis network using information received from backend.
        // To create a network using physics first to get X and Y value
        // then updates X and Y value by drag and drop of the nodes.
        if ($scope.nodePlacementType === 'physicsAndDragNDrop') {
          const dataNodes = visData.nodes.get();
          let countOfZeroNodes = 0;
          _.each(dataNodes, function (dataNode) {
            if (dataNode.x === 0 && dataNode.y === 0) {
              countOfZeroNodes++;
            }
          });

          if(countOfZeroNodes >= 2) {
            network = new vis.Network(element[0], visData, physicsEnableOption);
            network.stabilize();
          } else {
            network = new vis.Network(element[0], visData, options);
            network.stabilize();
          }
        } else if ($scope.nodePlacementType === 'dragNDrop') {
          // To create a network using drag and drop of the nodes.
          network = new vis.Network(element[0], visData, options);
        } else if ($scope.nodePlacementType === 'withPhysics') {
          // To create a network using physics.
          network = new vis.Network(element[0], visData, physicsEnableOption);
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
            // and gets positions ofall nodes.
            if ($scope.first_stable) {

              network.storePositions();
              network.setOptions(options);
              network.off('stabilized');
              const positionList = network.getPositions();
              $scope.onNodeDragEnd(positionList, data.nodes);
            } else {
              $scope.first_stable = true;
            }
          } else {
            network.off('stabilized');
          }
        });

        // When a node is selected, we check if there is a dashboard
        // associated with it, if so, we load that dashboard.
        network.on('selectNode', (params) => {
          // Invoke the passed function
          if ($scope.onNodeSelect) {
            $scope.onNodeSelect(params);
          }
        });

        // When a node is selected, we check if there is a dashboard
        // associated with it, if so, we load that dashboard.
        network.on('selectEdge', (params) => {
          // Invoke the passed function
          if ($scope.onLinkSelect) {
            const linkId = params.edges[0];
            let linkObj;
            // Get the link-information
            _.forEach(data.edges, function (edge) {
              if (edge.id === linkId) {
                linkObj = edge;
              }
            });

            let srcNode;
            let destNode;
            _.forEach(data.nodes, function (node) {
              if (node.id === linkObj.from) {
                srcNode = node;
              }

              if (node.id === linkObj.to) {
                destNode = node;
              }
            });
            $scope.onLinkSelect(srcNode.key, destNode.key);
          }
        });

        // When a node is dragged, at the end, this function is called.
        // It just prints the locations of the nodes in console. This
        // will help people to fix 'x', 'y' for different nodes,
        // data.nodes will print the nodes information
        network.on('dragEnd', () => {
          //function to update new x and y values in all nodes.
          if($scope.onNodeDragEnd !== undefined) {
            $scope.onNodeDragEnd(network.getPositions(), data.nodes);
          }
        });
      });
    }
  };
});
