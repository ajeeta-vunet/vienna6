define(function (require) {
  var module = require('ui/modules').get('kibana/uvmap_vis');
  var _ = require('lodash');
  var vis = require('vis');
  module.directive('visMap', function (kbnUrl) {

    return {
      restrict: 'E',
      scope: {
        mapData: '=',
        onNodeSelect: '=',
        onLinkSelect: '=',
      },
      replace: true,
      template: '<div class="network-map"></div>',
      link: ($scope, element) => {

        // We watch mapData and if it changes, we draw the network
        $scope.$watch('mapData', function() {
          var visData, network;

            if (!$scope.mapData) {
              console.log("visMap: Returning as no mapData");
              return;
            }

            var data = $scope.mapData;

            if (!data.nodes){
              return
            }

            visData = {
              nodes: new vis.DataSet(data.nodes),
              edges: new vis.DataSet(data.edges)
            };

            var options = {

              // These are the groups we support..
              groups: {
                PC: {
                  image: '/ui/vienna_images/PC_active.png',
                  shape: 'image',
                  size: 20,
                  font: {
                    color:'#2E3458',
                    size:17
                  }
                },
              Wifi: {
                image: '/ui/vienna_images/wireless_access_active.png',
                shape: 'image',
                size: 20,
                font: {
                  color:'#2E3458',
                  size:17
                }
              },
              WifiAlert: {
                image: '/ui/vienna_images/wireless_access_alert.png',
                shape: 'image',
                size: 20,
                font: {
                  color:'#2E3458',
                  size:17
                }
              },
              Printer: {
                image: '/ui/vienna_images/printer_active.png',
                shape: 'image',
                size: 20,
                font: {
                  color:'#2E3458',
                  size:17
                }
              },
              PrinterAlert: {
                image: '/ui/vienna_images/printer_alert.png',
                shape: 'image',
                size: 20,

                font: {
                  color:'#2E3458',
                  size:17
                }
              },
              Mobile: {
                image: '/ui/vienna_images/mobile_active.png',
                shape: 'image',
                size: 20,
                font: {
                  color:'#2E3458',
                  size:17
                }
              },
              MobileAlert: {
                image: '/ui/vienna_images/mobile_alert.png',
                shape: 'image',
                size: 20,
                font: {
                  color:'#2E3458',
                  size:17
                }
              },
              Switch: {
                image: '/ui/vienna_images/switch_active.png',
                shape: 'image',
                size: 20,
                font: {
                  color:'#2E3458',
                  size:17
                }
              },
              SwitchAlert: {
                image: '/ui/vienna_images/switch_alert.png',
                shape: 'image',
                size: 20,
                font: {
                  color:'#2E3458',
                  size:17
                }
              },
              PCAlert: {
                image: '/ui/vienna_images/PC_alert.png',
                shape: 'image',
                size: 20,
                font: {
                  color:'#2E3458',
                    size:17
                }
              },
              Firewall: {
                image: '/ui/vienna_images/firewall_active.png',
                shape: 'image',
                size: 20,
                font: {
                  color:'#2E3458',
                  size:17
                }
              },
              FirewallAlert: {
                image: '/ui/vienna_images/firewall_alert.png',
                shape: 'image',
                size: 20,
                font: {
                  color:'#2E3458',
                  size:17
                }
              },
              Router: {
                image: '/ui/vienna_images/router_active.png',
                shape: 'image',
                size: 20,
                font: {
                  color:'#2E3458',
                  size: 17
                }
              },
              RouterAlert: {
                image: '/ui/vienna_images/router_alert.png',
                shape: 'image',
                size: 20,
                font: {
                  color:'#2E3458',
                  size: 17
                }
              },
              App: {
                image: '/ui/vienna_images/application.png',
                shape: 'image',
                size: 20,
                font: {
                  color:'#2E3458',
                  size: 17
                }
              },
              Device: {
                image: '/ui/vienna_images/network_element.png',
                shape: 'image',
                size: 20,
                font: {
                  color:'#2E3458',
                  size: 17
                }
              },
              Server: {
                image: '/ui/vienna_images/server_active.png',
                shape: 'image',
                size: 20,
                font: {
                  color:'#2E3458',
                  size: 17
                }
              },
              ServerAlert: {
                image: '/ui/vienna_images/server_alert.png',
                shape: 'image',
                size: 20,
                font: {
                  color:'#2E3458',
                  size: 17
                }
              }
            },

            edges: {
              arrows: {
                middle: {
                  enabled: true,
                  scaleFactor: 0.5
                }
              },
              physics: false,
                font: {
                  align:'bottom',
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
                },
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
                font: {
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
                }
              },
              interaction: {
                selectConnectedEdges: false
              }
            }

            // Create a vis network using information received from backend
            network = new vis.Network(element[0], visData, options);

            // Let us immediately stablize the network immediately
            network.stabilize();
            network.fit();

            // Once network gets stablized, we stop the stablization
            network.on('stabilized', (params) => {
              network.off('stabilized');
            });

            // When a node is selected, we check if there is a dashboard
            // associated with it, if so, we load that dashboard.
            network.on('selectNode', (params) => {
              console.log("Selecting node");
              console.log(params);
              // Invoke the passed function
              if ($scope.onNodeSelect) {
                 $scope.onNodeSelect(params);
              }
            });

            // When a node is selected, we check if there is a dashboard
            // associated with it, if so, we load that dashboard.
            network.on('selectEdge', (params) => {
              console.log("Selecting edge");
              console.log(params);
              // Invoke the passed function
              if ($scope.onLinkSelect) {
                 var link_id = params.edges[0];
                 var link_obj;
                 // Get the link-information
                 _.forEach(data.edges, function(edge) {
                   if (edge.id == link_id) {
                      link_obj = edge;
                   }
                 });

                 var src_node;
                 var dest_node;
                  _.forEach(data.nodes, function(node) {
                    if (node.id == link_obj.from) {
                       src_node = node;
                    }

                    if (node.id == link_obj.to) {
                       dest_node = node;
                    }
                  });
                  $scope.onLinkSelect(src_node['key'], dest_node['key']);
                }
              });

               // When a node is dragged, at the end, this function is called.
               // It just prints the locations of the nodes in console. This
               // will help people to fix 'x', 'y' for different nodes,
               // data.nodes will print the nodes information
               network.on('dragEnd', () => {
                   console.log(data.nodes);
                   console.log(network.getPositions());
               });
             });
           }
         };
     });
});
