/* eslint-disable camelcase */
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
import './NetworkMap.less';
import { produce } from 'immer';
import { Summary } from '../../../assetsPage/components/Summary/Summary';
import { Map } from '../Map/Map';
import { FilterBar } from '../../../discovery/components/FilterBar/FilterBar';
import { NodeDetails } from '../NodeDetails/NodeDetails';
import { apiProvider } from '../../../../../../../ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';
import { Notifier } from 'ui/notify';
import _ from 'lodash';
import { NetworkConstants } from '../../network_constants';

const notify = new Notifier({ location: 'Network Map' });

export class NetworkMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      assetList: this.props.assetList,
      summaryDetails: this.props.assetDetailsSummary,
      filterObject: {},
      showDetails: false,
    };
  }

  // to hide node details when user clicks on close
  hideNodeDetails = () => {
    this.setState({ showDetails: false });
  };

  // to show node details when user clicks on a node
  showNodeDetails = (nodeId) => {
    // for device_type='Broadcase-Network', node details are unavailable
    if (nodeId === -1) {
      this.setState({ nodeDetails: { available: false }, showDetails: true });
    } else {
      apiProvider.getAll(`${NetworkConstants.FETCH_ASSET_DETAILS}${nodeId}/`).then((data) => {
        if (data) {
          // for nodeId whose data is unavailable, error-code is received from the backend
          if ('error-code' in data) {
            this.setState({
              nodeDetails: { available: false },
              showDetails: true,
            });
          } else {
            this.setState({ nodeDetails: data, showDetails: true });
          }
        } else {
          this.setState({
            nodeDetails: { available: false },
            showDetails: true,
          });
        }
      });
    }
  };

  // In this function we use the filterStore object and
  // update the data passed to 'FilterBar' and 'Summary'
  // components based on filters applied by the user. This function receives filterField and
  // filterValue. If the corresponding field and value is present in filterStore,
  // it will be removed. Else it will be added to filterStore.
  handleFilter = (filterValue, filterField) => {
    let updatedfilterObject = this.state.filterObject;
    // Check if filter with 'filterField' exists in filterObject and filterValue received is not empty.
    // If filterValue is empty then the 'close' filter button is clicked.
    if (_.has(this.state.filterObject, filterField) && filterValue !== '') {
      const filterValueIndex =
        this.state.filterObject[filterField].indexOf(filterValue);
      // If filterValue exists remove it as user is clicking on the same filter
      // for the second time.
      if (filterValueIndex > -1) {
        updatedfilterObject = produce(this.state.filterObject, (draft) => {
          draft[filterField].splice(filterValueIndex, 1);
          if (draft[filterField].length === 0) delete draft[filterField];
        });
      }
      // If filterValue does not exist, add it as user is clicking on a filter
      // for the first time.
      else {
        updatedfilterObject = produce(this.state.filterObject, (draft) => {
          draft[filterField].push(filterValue);
        });
      }
    }
    // If 'filterField' does not exist in filterObject, add it and update the
    // filterValue in its array.
    else if (filterValue !== '') {
      updatedfilterObject = produce(this.state.filterObject, (draft) => {
        draft[filterField] = [filterValue];
      });
    }
    this.setState({ filterObject: updatedfilterObject }, () => {
      this.applyFilters(this.state.filterObject);
    });
  };

  // this method will be called to clear all filters
  // and fetch the list of all the nodes and edges
  clearAllFilter = () => {
    const postBody = {
      filter: {},
    };

    apiProvider.post(NetworkConstants.FETCH_ASSET_LIST_FOR_NETWORK, postBody).then((data) => {
      this.setState(
        {
          filterObject: {},
          assetList: data,
        },
        () => notify.info('All filters cleared.')
      );
    });
  };

  // this method will be called to fetch all the nodes and edges
  // based on the filter applied whose value is stored in
  // filterStore.
  applyFilters = (filters) => {
    const postBody = {
      filter: filters,
    };

    apiProvider.post(NetworkConstants.FETCH_FILTERED_LIST_OF_ASSETS, postBody).then((data) => {
      this.setState({
        assetList: data,
      });
    });
  };

  render() {
    return (
      <div className="network-map-container">
        <div className="filters">
          {/* To show the applied filters on top */}
          <FilterBar
            filterObject={this.state.filterObject}
            handleFilter={this.handleFilter}
            clearAllFilter={this.clearAllFilter}
          />
        </div>
        <div className="assetsPage">
          <div className="assets-summary">
            <Summary
              summaryDetails={this.props.assetDetailsSummary}
              handleFilter={this.handleFilter}
              filterObject={this.state.filterObject}
            />
          </div>
          <div className="assets-table">
            <Map
              assetList={this.state.assetList}
              showNodeDetails={this.showNodeDetails}
              hideNodeDetails={this.hideNodeDetails}
            />
            {this.state.showDetails && (
              <div className="import-asset-modal">
                <NodeDetails
                  nodeDetails={this.state.nodeDetails}
                  hideNodeDetails={this.hideNodeDetails}
                  showNodeDetails={this.showNodeDetails}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
