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
import { VunetDataTable } from '../../../../../../../ui_framework/src/vunet_components/vunet_table/vunet_table';
import { NodeDetails } from '../NodeDetails/NodeDetails';
import { connect } from 'react-redux';
import {
  updateViewDetails,
  fetchNewScanList,
} from '../../actions/topologyActions';
import chrome from 'ui/chrome';
import { displayTwoTimeUnits } from 'ui/utils/vunet_get_time_values.js';
import './Topology.less';
import { apiProvider } from '../../../../../../../ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';
import { DiscoveryConstants } from '../../discovery_constants';

const mapStateToProps = (state) => {
  return {
    viewDetails: state.topologyData.viewDetails,
    topologyList: state.topologyData.topologyList,
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
      method: 'GET',
    })
      // .then(response => response.json())
      .then((data) => {
        dispatch({ type: fetchNewScanList, newListOfScan: data });
      });
  },
});

class TopologyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewDetails: this.props.viewDetails,
      nodeList: [],
      multiSelectCredentialsArray: [],
      multiSelectSourceIpArray: [],
      currentPage: 1,
      rowId: 0,
      scrollId: 0,
      totalNumberOfNodes: 0,
      nodeDetailsSummary: {},
      topologyNames: {},
      selectedTopologyId: '',
    };
  }

  componentDidMount() {
    this.prepareMulitSelectList();
    this.props.fetchNewListOfScans();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.viewDetails) {
      this.props.swapViewDetails();
    }
    this.setState({ viewDetails: newProps.viewDetails });
  }

  // this function will be used to the fetch the values for ScanList
  fetchItemsForScanList = async () => {
    let urlBase = chrome.getUrlBase();
    urlBase = urlBase + '/asset/topology/';
    const response = await fetch(urlBase, {
      method: 'GET',
    });

    const data = await response.json();
    return this.prepareData(data.topology);
  };

  // This will be used to delete the selected entries from the table
  deleteSelectedItemsForScanList = (rows) => {
    // Wait till all Promises(deletePromises) are resolved
    // and return single Promise
    const deletePromises = Promise.all(
      rows.map((row) => {
        apiProvider.remove(DiscoveryConstants.DELETE_TOPOLOGY + row.topology_id + '/');
      })
    );

    return deletePromises;
  };

  //this function is used to convert certains field in topologies object to displayable format.
  prepareData = (topologies) => {
    const topologyNames = {};
    topologies &&
      topologies.map((topology) => {
        topology.duration = displayTwoTimeUnits(topology.duration);
        topologyNames[topology.topology_id] = topology.name;
      });

    this.setState({ topologyNames: topologyNames });
    return topologies;
  };

  // This will be used on submit of ScanList table
  onSubmitForScanList = (event, topologyId, scanData) => {
    const url = chrome.getUrlBase();
    const tenantId = url.substring(
      url.indexOf('api/') + 4,
      url.indexOf('/bu/')
    );
    const buId = url.substring(url.indexOf('bu/') + 3, url.length);

    const newScan = {
      tenant_id: tenantId,
      bu_id: buId,
      start_ip: '',
      end_ip: '',
      source_ip: scanData.sourceIp,
      excluded_ip: scanData.excludedIp,
      seed_ip: scanData.seedIp,
      cred_list: scanData.credentials,
      schedule_name: '',
      schedule_string: '',
      user_details: '',
      name: scanData.name,
    };

    if (event === 'add') {
      return apiProvider.post(newScan);
    }
  };

  onRowAction = (e, rowId) => {
    //call API to fecth node details and node details summary to be passed to NodeDetails Component.
    const postBody = {
      scroll_id: 0,
      size: 10,
    };

    //  window.location.href = 'vienna#' + '/topology/' + rowId;

    const nodeDetailspostBody = {
      fields: ['device_type', 'vendor_name', 'system_ip'],
      topology_id: rowId,
    };
    return apiProvider
      .post(DiscoveryConstants.FETCH_NODE_DETAILS + rowId + '/', postBody)
      .then((data) => {
        apiProvider
          .post(DiscoveryConstants.FETCH_NODES_SUMMARY, nodeDetailspostBody)
          .then((nodeDetailsSummary) => {
            this.setState({
              rowId: rowId,
              nodeList: data.topology.nodes,
              totalNumberOfNodes: data.topology.no_of_nodes,
              nodeDetailsSummary: nodeDetailsSummary,
            });
            this.props.swapViewDetails();
            return Promise.resolve(false);
          });
      });
  };

  //this function is used to go back to Topology page from NodeDetails page.
  goBack = () => {
    this.props.swapViewDetails();
  };

  //this is called to prepare data for multiselect options array.
  prepareMulitSelectList = () => {
    const credList = this.props.credList.credentials;
    let sourceIpList =
      this.props.sourceIpAddressList &&
      this.props.sourceIpAddressList.source_ip_address;

    // eslint-disable-next-line prefer-const
    let multiSelectCredentialsArray = [];
    // eslint-disable-next-line prefer-const
    let multiSelectSourceIpArray = [];

    credList &&
      credList.map((credential) => {
        multiSelectCredentialsArray.push({
          key: credential,
          label: credential,
          name: credential,
          value: credential,
        });
      });
    sourceIpList && sourceIpList.replace(/ /g, '');
    sourceIpList = sourceIpList && sourceIpList.split(',');
    sourceIpList &&
      sourceIpList.map((sourceIp) => {
        multiSelectSourceIpArray.push({
          key: sourceIp,
          label: sourceIp,
          name: sourceIp,
          value: sourceIp,
        });
      });

    this.setState({
      multiSelectCredentialsArray: multiSelectCredentialsArray,
      multiSelectSourceIpArray: multiSelectSourceIpArray,
    });
  };

  render() {
    const scanListingMeta = {
      headers: [
        'Name',
        'Node Count',
        'Seed IP',
        'Start Time',
        'Duration',
        'Discovery Status',
      ],
      rows: [
        'name',
        'no_of_nodes_discovered',
        'seed_ip',
        'start_time',
        'duration',
        'discovery_status',
      ],
      rowAction: [
        {
          name: 'View More',
          icon: 'fa-arrow-circle-right',
          toolTip: 'Click here to see Scan Details',
        },
      ],
      id: 'topology_id',
      add: false,
      edit: false,
      sortOn: 'start_time',
      isDescending: true,
      title: 'New Scan',
      selection: true,
      search: true,
      forceUpdate: false,
      table: [
        {
          key: 'name',
          label: 'Name *',
          type: 'text',
          name: 'name',
          props: {
            required: true,
          },
        },
        {
          key: 'seedIp',
          label: 'Seed IP *',
          type: 'text',
          name: 'seedIp',
          props: {
            required: true,
          },
        },
        {
          key: 'credentials',
          label: 'Credentials *',
          type: 'multiSelect',
          name: 'status',
          options: this.state.multiSelectCredentialsArray,
          props: {
            required: true,
          },
        },
        {
          key: 'excludedIp',
          label: 'Excluded IP',
          type: 'text',
          name: 'excludedIp',
          props: {
            required: false,
            // eslint-disable-next-line max-len
            pattern:
              '^(([1-9]?\\d|1\\d\\d|25[0-5]|2[0-4]\\d)\\.){3}([1-9]?\\d|1\\d\\d|25[0-5]|2[0-4]\\d)$',
          },
          errorText: 'Invalid IP-address.',
        },
        {
          key: 'sourceIp',
          label: 'Source IP *',
          type: 'multiSelect',
          name: 'sourceIp',
          options: this.state.multiSelectSourceIpArray,
          props: {
            required: true,
          },
        },
      ],
    };
    if (!this.state.viewDetails) {
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
    } else {
      return (
        <NodeDetails
          goBack={this.goBack}
          topologyName={
            this.state.topologyNames[this.state.rowId]
              ? this.state.topologyNames[this.state.rowId]
              : ''
          }
          topologyId={this.state.rowId}
          nodeDetails={this.state.nodeList}
          currentPage={this.state.currentPage}
          totalNumberOfNodes={this.state.totalNumberOfNodes}
          summaryDetails={this.state.nodeDetailsSummary}
          applyFilters={this.applyFilters}
        />
      );
    }
  }
}

export const Topology = connect(
  mapStateToProps,
  mapDispatchToProps
)(TopologyComponent);
