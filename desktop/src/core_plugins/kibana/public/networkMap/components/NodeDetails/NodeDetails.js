// ------------------------- NOTICE ------------------------------- //
//                                                                  //
//                   CONFIDENTIAL INFORMATION                       //
//                   ------------------------                       //
//     This Document contains Confidential Information or           //
//     Trade Secrets, or both, which are the property of VuNet      //
//     Systems Ltd.  This document may not be copied, reproduced,   //
//     reduced to any electronic medium or machine readable form    //
//     or otherwise duplicated and the information herein may not   //
//     be used, disseminated or otherwise disclosed, except with    //
//     the prior written consent of VuNet Systems Ltd.              //
//                                                                  //
// ------------------------- NOTICE ------------------------------- //

// Copyright 2021 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React from 'react';
import './NodeDetails.less';

export class NodeDetails extends React.Component {
  constructor(props) {
    super(props);
  }

  hideDetails = () => {
    this.props.hideNodeDetails();
  }

  render() {
    return(
      <div className="import-asset-wrapper">
        <p className="title">
              Node details
        </p>
        { this.props.nodeDetails.available === false ? 
          <h3>
            No details available for this device
          </h3> :
          <div className="node-details">
            <div className="node-details-values">
              <div>
                Device Name
              </div>
              <div className="node-values">
              {this.props.nodeDetails.device_name}
              </div>
            </div>
            <div className="node-details-values">
              <div>
                Device Type
              </div>
              <div className="node-values">
              {this.props.nodeDetails.device_type}
              </div>
            </div>
            <div className="node-details-values">
              <div>
                System IP
              </div>
              <div className="node-values">
              {this.props.nodeDetails.system_ip}
              </div>
            </div>
            <div className="node-details-values">
              <div>
                Vendor
              </div>
              <div className="node-values">
              {this.props.nodeDetails.vendor_name}
              </div>
            </div>
            <div className="node-details-values">
              <div>
                Location
              </div>
              <div className="node-values">
              {this.props.nodeDetails.location}
              </div>
            </div>
          </div>
        }
        
        <div className="actions">
          <button className="close-button" onClick={this.hideDetails}>
            Close
          </button>
        </div>
      </div>
    );
  }
}