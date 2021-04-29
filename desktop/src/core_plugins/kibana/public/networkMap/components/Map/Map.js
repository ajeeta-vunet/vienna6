import Graph from 'react-graph-vis';
import React from 'react';

// to show the tooltip when user hovers on a node
import "../../../../../../../node_modules/vis-network/dist/vis-network.min.css";

export class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      graph: this.props.assetList,
      timeout: setTimeout(() => {
                  this.state.network.fit(); 
               }, 1000),
      network: null,
    };
  }

  // to fit the map in the canvas and to re-render the graph when filters are applied  
  componentWillReceiveProps(newProps) {
    this.setState({
      timeout: setTimeout(() => {
        this.state.network.fit();
      }, 1000), 
      graph: newProps.assetList,
    });
  }

  // to hide node details when user clicks on close
  hideDetails = () => {
    this.props.hideNodeDetails();
  }

  // to show node details when user clicks on a node
  showDetails = (nodeId) => {
    this.props.showNodeDetails(nodeId);
  }

    render() {

      const graph = this.state.graph;

      const options = {
        autoResize: true, // to scale the map according to the height and width of the canvas
        edges: {
          color: "#6A1B4D",
        },
        interaction: {
          hideEdgesOnDrag: true,
          tooltipDelay: 200, // milliseconds after which the tooltip is displayed when a user hovers on a node
        },
        nodes: {
          shape: "dot",
          color:{
            background: "#26d4bf" // node color
          }
        },
        height: "430px",
        physics: {
          barnesHut: { // barnesHut is one of the libraries used to stabilize the map
            gravitationalConstant: -5000, // negative value repels the nodes. Higher the value, more spread out the nodes will be
          }
        },
        
      };
    
      // event handler for the rendered graph
      const events = {

        // select event fires when the user selects a node/ edge
        select: (event) => {
          var { nodes, edges } = event;
          for(let i = 0; i < graph.nodes.length;i++){
            if(graph.nodes[i].id === nodes[0]){
              // if the selected node matches with the node present in the graph, 
              // and the device type is not 'Broadcast-Network', call showDetails method.
              if(graph.nodes[i].device_type === "Broadcast-Network"){
                this.showDetails(-1);
              } else {
                this.showDetails(graph.nodes[i].id);
              }
            }
          }
        }
      };

      return (
        <div>
          <Graph
            graph={this.state.graph} // nodes and edges to actually construct the map
            options={options} // global configs applicable to all nodes and edges
            events={events} // event handlers for the constructed map
            // getNetwork() provides the entire network on which we can have additional methods provided by vis.js Eg: network.fit()
            getNetwork={network => this.setState({ network: network }) } 
          />
        </div>
      );
    }
  }