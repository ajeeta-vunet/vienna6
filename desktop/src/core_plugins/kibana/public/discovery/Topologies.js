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
import { VunetDataTable } from '../../../../../ui_framework/src/vunet_components/vunet_table/vunet_table';
import { NodeDetails } from './components/NodeDetails';
import { connect } from 'react-redux';
import { updateViewDetails, fetchNewScanList } from './actions/topologyActions';
import chrome from 'ui/chrome';
import { createNewScan, deleteScan } from './api_calls';
import { displayTwoTimeUnits } from 'ui/utils/vunet_get_time_values.js';
import moment from 'moment-timezone';
import './Topologies.less';

const mapStateToProps = state => {
  return {
    viewDetails: state.topologyData.viewDetails,
    topologyList: state.topologyData.topologyList
  };
};

const mapDispatchToProps = (dispatch) => ({
  swapViewDetails: () => {
    return dispatch(updateViewDetails());
  },
  fetchNewListOfScans: () => {
    let urlBase = chrome.getUrlBase();
    urlBase = urlBase + '/asset/topology/';
    fetch(urlBase, {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {dispatch({ type: fetchNewScanList, newListOfScan: data });});
  }
});

class TopologyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewDetails: this.props.viewDetails,
      nodeDetails: {
        systemIP: 1,
        systemName: 'Test',
        additionType: 'TestAddition',
        credentialName: 'CredentialTest',
        credentialType: 'SNMP',
        enrichedData: 'SNMPData'
      },
      multiSelectCredentialsArray: [],
      multiSelectSourceIpArray: [],
    };
  }

  componentDidMount() {
    this.prepareMulitSelectList();
    this.props.fetchNewListOfScans();
  }

  componentWillReceiveProps(newProps) {
    this.setState({ viewDetails: newProps.viewDetails });
  }

  // this function will be used to the fetch the values for ScanList
  fetchItemsForScanList = async () => {
    let urlBase = chrome.getUrlBase();
    urlBase = urlBase + '/asset/topology/';
    const response = await fetch(urlBase, {
      method: 'GET'
    });

    const data = await response.json();
    return this.prepareData(data.topology);
  }

  // This will be used to delete the selected entries from the table
  deleteSelectedItemsForScanList = (rows) => {

    // Wait till all Promises(deletePromises) are resolved
    // and return single Promise
    const deletePromises = Promise.all(
      rows.map((row) => {
        deleteScan(chrome, row.topology_id);
      })
    );

    return deletePromises;
  }

  //this function is used to convert certains field in topologies object to displayable format.
  prepareData = (topologies) => {
    topologies && topologies.map(topology => {
      topology.duration = displayTwoTimeUnits(topology.duration);
      topology.start_time = moment(topology.start_time).format('ddd, Do MMM YYYY, h:mm:ss a');
    });

    return topologies;
  }

  // This will be used on submit of ScanList table
   onSubmitForScanList = (event, topology_id, scanData) => {
     const url = chrome.getUrlBase();
     const tenantId = url.substring(url.indexOf('api/') + 4, url.indexOf('/bu/'));
     const buId = url.substring(url.indexOf('bu/') + 3, url.length);

     const newScan = {
       'tenant_id': tenantId,
       'bu_id': buId,
       'start_ip': '',
       'end_ip': '',
       'source_ip': scanData.sourceIp,
       'excluded_ip': scanData.excludedIp,
       'seed_ip': '192.168.43.0/24',
       'cred_list': scanData.credentials,
       'schedule_name': '',
       'schedule_string': '',
       'user_details': '',
       'name': scanData.name
     };

     if (event === 'add') {
       return createNewScan(chrome, newScan);
     }
   }

   onRowAction = (e, rowId) => {
     //call API to fecth node details - in phase-2
     //  this.props.swapViewDetails();
     return Promise.resolve(false);
   };

   goBack = () => {
     this.props.swapViewDetails();
   }

   //this is called to prepare data for multiselect options array.
   prepareMulitSelectList = () => {
     const credList = this.props.credList.credentials;
     let sourceIpList = this.props.sourceIpAddressList && this.props.sourceIpAddressList.source_ip_address;

     // eslint-disable-next-line prefer-const
     let multiSelectCredentialsArray = [];
     // eslint-disable-next-line prefer-const
     let multiSelectSourceIpArray = [];

     credList && credList.map((credential) => {
       multiSelectCredentialsArray.push({
         key: credential,
         label: credential,
         name: credential,
         value: credential,
       });
     });
     sourceIpList.replace(/ /g, '');
     sourceIpList = sourceIpList.split(',');
     sourceIpList && sourceIpList.map((sourceIp) => {
       multiSelectSourceIpArray.push({
         key: sourceIp,
         label: sourceIp,
         name: sourceIp,
         value: sourceIp,
       });
     });

     this.setState({
       multiSelectCredentialsArray: multiSelectCredentialsArray,
       multiSelectSourceIpArray: multiSelectSourceIpArray
     });
   }

   render() {

     const scanListingMeta = {
       headers: ['Topology ID', 'Name', 'Node Count', 'Start Time', 'Duration', 'Discovery Status'],
       rows: ['topology_id', 'name', 'no_of_nodes_discovered', 'start_time', 'duration', 'discovery_status'],
       //  rowAction: [{ name: 'View More', icon: 'fa-arrow-circle-right', toolTip: 'Click here to see Scan Details' }],
       rowAction: [{ name: 'View More', icon: 'fa-arrow-circle-right', toolTip: 'Yet to be implemented' }],
       id: 'topology_id',
       add: true,
       edit: false,
       title: 'New Scan',
       selection: true,
       search: true,
       forceUpdate: false,
       wrapTableCellContents: true,
       table:
            [
              {
                key: 'name',
                label: 'Name *',
                type: 'text',
                name: 'name',
                props: {
                  required: true
                }
              },
              {
                key: 'seedIp',
                label: 'Seed IP *',
                type: 'text',
                name: 'seedIp',
                props: {
                  required: true
                }
              },
              {
                key: 'credentials',
                label: 'Credentials *',
                type: 'multiSelect',
                name: 'status',
                options: this.state.multiSelectCredentialsArray,
                props: {
                  required: true
                }
              },
              {
                key: 'excludedIp',
                label: 'Excluded IP',
                type: 'text',
                name: 'excludedIp',
                props: {
                  required: false,
                  // eslint-disable-next-line max-len
                  pattern: '^(([1-9]?\\d|1\\d\\d|25[0-5]|2[0-4]\\d)\\.){3}([1-9]?\\d|1\\d\\d|25[0-5]|2[0-4]\\d)$'
                },
                errorText: 'Invalid IP-address.'
              },
              {
                key: 'sourceIp',
                label: 'Source IP *',
                type: 'multiSelect',
                name: 'sourceIp',
                options: this.state.multiSelectSourceIpArray,
                props: {
                  required: true
                }
              },
            ]
     };
     if(!this.state.viewDetails) {
       return (
         <div className="configure-ScanList-table">
           {
             <VunetDataTable
               fetchItems={this.fetchItemsForScanList}
               deleteSelectedItems={this.deleteSelectedItemsForScanList}
               metaItem={scanListingMeta}
               onSubmit={this.onSubmitForScanList}
               rowAction={this.onRowAction}
             />
           }
         </div>
       );
     } else{
       return (
         <NodeDetails
           goBack={this.goBack}
           nodeDetails={this.state.nodeDetails}
         />
       );
     }
   }
}

export const Topologies = connect(mapStateToProps, mapDispatchToProps) (TopologyComponent);