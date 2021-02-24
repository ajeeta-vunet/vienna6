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
import Pagination from 'react-js-pagination';
import { generateHeading } from '../../../event/utils/vunet_format_name';
import { NewAssetModal } from '../NewAssetModal/NewAssetModal';
import './AssetsPage.less';
import chrome from 'ui/chrome';
import $ from 'jquery';
import { produce } from 'immer';
import { fetchListOfAssets, fetchAssetDetailsSummary } from '../../api_calls';
import { Summary } from '../summary/summary';
import ReactTooltip from 'react-tooltip';
import { Notifier } from 'ui/notify';

const notify = new Notifier({ location: 'Assets' });

const emptyAsset = {
  addition_method: 'Manual',
  system_ip: '',
  device_name: '',
  vendor_name: '',
  device_type: '',
  interface_list: [],
  port_list: [],
  location: '',
  maintenance_mode: false,
  tags: [],
};

export class AssetsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      assets: this.props.assetList.assets,
      addNewAsset: false,
      selectedFlag: false,
      deleteIdList: [],
      currentPage: 1,
      totalNumberOfAssets: this.props.assetList.no_of_nodes,
      editAssetDetails: emptyAsset,
      assetDetailsSummary: this.props.assetDetailsSummary
    };
  }

  displayNewAssetModal = () => {
    this.setState({ addNewAsset: true });
  }

  componentDidMount() {
    //this is to avoid redirection to homepage after click of the button in pagination component.
    $('.pagination li a').on('click', function (e) {
      e.preventDefault();
    });
  }

  componentDidUpdate() {
    //this is to avoid redirection to homepage after click of the button in pagination component.
    $('.pagination li a').on('click', function (e) {
      e.preventDefault();
    });
  }

  //this function is used to render the headers of the table.
  renderTableHeader() {
    const header = ['device_name', 'system_ip', 'device_type', 'vendor_name', 'addition_method',
      'topology_name', 'contact_details', 'last_modified_time',  'actions'];
    return header.map((key, index) => {
      return <th key={'head-' + index}>{generateHeading(key)}</th>;
    });
  }

  //this function is used to render the table contents.
  renderTableData() {
    return this.state.assets && this.state.assets.map((asset) => {
      const { node_id, topology_name, last_modified_time, addition_method, vendor_name, device_name,
        device_type, system_ip, contact_details } = asset; //destructuring
      return (
        <tr key={node_id} className={'row-' + node_id}>
          <td>
            <div className="tableRowCell">
              <input
                type="checkbox"
                className="checkSingle"
                onClick={(e) => this.checked(e, node_id)}
              />
            </div>
          </td>
          <td>
            <div className="tableRowCell">
              {device_name}
            </div>
          </td>
          <td>
            <div className="tableRowCell">
              {system_ip}
            </div>
          </td>
          <td>
            <div className="tableRowCell">
              {device_type}
            </div>
          </td>
          <td>
            <div className="tableRowCell">
              {vendor_name}
            </div>
          </td>
          <td>
            <div className="tableRowCell">
              {addition_method}
            </div>
          </td>
          <td>
            <div className="tableRowCell">
              {topology_name}
            </div>
          </td>
          <td>
            <div className="tableRowCell">
              {contact_details}
            </div>
          </td>
          <td>
            <div className="tableRowCell">
              {last_modified_time}
            </div>
          </td>
          <td>
            <button
              className="edit-button"
              onClick={() => this.handleEditAssets(node_id)}
              data-tip={'Edit Asset'}
            >
              <ReactTooltip />
              <span className="fa fa-pencil" />
            </button>
          </td>
        </tr>
      );
    });
  }

  //this function is used to select all the assets displayed on the page.
  selectAll = (e) => {
    // eslint-disable-next-line prefer-const
    let deleteIdList = [];

    if(e.target.checked) {
      $('.checkSingle').each(function () {
        this.checked = true;
      });
      deleteIdList = this.state.assets && this.state.assets.map((asset) => {
        const className = '.row-' + asset.node_id;
        $(className).addClass('row-highlight');
        return asset.node_id;
      });
    }else{
      $('.checkSingle').each(function () {
        this.checked = false;
      });
      this.state.deleteIdList && this.state.deleteIdList.map((id) => {
        const className = '.row-' + id;
        $(className).removeClass('row-highlight');
      });
    }
    this.setState({ deleteIdList: deleteIdList, selectedFlag: e.target.checked });
  }

  //this function is called to delete a asset.
  deleteAssets = () => {

    this.state.deleteIdList && this.state.deleteIdList.map((id) => {
      let urlBase = chrome.getUrlBase();
      urlBase = urlBase + '/asset/' + id + '/';

      fetch(urlBase, {
        method: 'DELETE'
      });
    });

    fetchListOfAssets(0, 10)
      .then(data => {
        fetchAssetDetailsSummary()
          .then(assetDetailsSummary => {
            this.setState({
              assets: data.assets,
              currentPage: 1,
              totalNumberOfAssets: data.no_of_nodes,
              selectedFlag: false,
              assetDetailsSummary: assetDetailsSummary,
              deleteIdList: []
            }, () => notify.info('Asset deleted succesfully.')
            );
          });
      });
  }

  //this function is called when a asset is selected.
  checked = (e, node_id) => {
    let deleteIdList;
    const className = '.row-' + node_id;
    if(e.target.checked) {
      deleteIdList = produce(this.state.deleteIdList, (draft)=> {
        draft.push(node_id);
      });
      if (deleteIdList.length === this.state.assets.length) {
        $('.checkAll').each(function () {
          this.checked = true;
        });
      }
      $(className).addClass('row-highlight');
    }
    else {
      $('.checkAll').each(function () {
        this.checked = false;
      });
      const index = this.state.deleteIdList.indexOf(node_id);
      if (index !== -1) {
        deleteIdList = produce(this.state.deleteIdList, (draft)=> {
          draft.splice(index, 1);
        });
      }
      $(className).removeClass('row-highlight');
    }
    this.setState({ selectedFlag: e.target.checked, deleteIdList: deleteIdList });
  }

  //This method is called when the suer interacts with the pagination component and changes the page.
  //In this method we calculate the scoll-id which will be used to fetch the next 10 assets from the backend
  //API call.
  handlePageChange = (currentPage) => {
    fetchListOfAssets((currentPage - 1) * 10, 10)
      .then(data => {
        this.setState({
          assets: data.assets,
          currentPage: currentPage,
          totalNumberOfAssets: data.no_of_nodes
        });
      });
  };

  //this is used to cancel the add new asset action and remove the input elements from UI by setting addNewAsset to false
  //and editAssetDetails to empty asset.
  cancelNewAsset = () => {
    this.setState({ editAssetDetails: emptyAsset, addNewAsset: false }, () => this.handlePageChange(1));
  }

  //this method is called when edit action of an exiting asset clicked on.
  //we receive the nodeId of the asset to be edited, using this we identify the asset being edited and
  //save this to the state that can be used to edit in further steps.
  handleEditAssets = (nodeId) => {
    let editAssetDetails;
    this.state.assets && this.state.assets.map((asset) => {
      if(asset.node_id === nodeId) {
        editAssetDetails = asset;
      }
    });
    this.setState({ editAssetDetails, addNewAsset: true });
  }

  renderAddOrDeleteIcon = () => {

    if(!this.state.selectedFlag && this.state.deleteIdList.length <= 0) {
      return (
        <button
          className="add-asset kuiButton kuiButton--primary kuiButton--iconText"
          aria-label="Create new"
          onClick={() => this.displayNewAssetModal()}
          data-tip={'Add New Asset'}
        >
          <ReactTooltip />
          <span className="kuiButton__inner">
            <span aria-hidden="true" className="kuiButton__icon kuiIcon fa-plus" />
          </span>
        </button>
      );
    }else {
      return (
        <button
          className="kuiButton delete-asset kuiButton--primary kuiButton--iconText"
          aria-label="Delete"
          onClick={() => this.deleteAssets()}
          style={{ backgroundColor: '#f33434' }}
          data-tip={'Delete'}
        >
          <ReactTooltip />
          <span className="kuiButton__inner">
            <span aria-hidden="true" className="kuiButton__icon kuiIcon fa-trash" />
          </span>
        </button>
      );
    }
  }

  render() {

    return (
      <div className="assetsPage">
        <div className="assets-summary">
          <Summary
            summaryDetails={this.state.assetDetailsSummary}
          />
        </div>
        <div className="assets-table">
          <div className="table-toolbar">
            <div className="toolbar-search">
              <div className="toolbar-searchbox">
                <div className="search-icon fa fa-search" />
                <input
                  className="search-input"
                  placeholder="Search"
                />
              </div>
            </div>
            <div className="kuiToolBarSection">
              {this.renderAddOrDeleteIcon()}
            </div>
          </div>
          {this.state.assets.length > 0 &&
            <table className="assets">
              <thead>
                <tr>
                  <td>
                    <div className="tableRowCell">
                      <input type="checkbox" className="checkAll" onChange={(e) => this.selectAll(e)}/>
                    </div>
                  </td>
                  {this.renderTableHeader()}
                </tr>
              </thead>
              <tbody>
                {this.renderTableData()}
              </tbody>
            </table>
          }
          {this.state.assets.length <= 0 &&
            <div className="no-asset">Looks like there are no assets found.</div>
          }
          <div className="pagination">
            <Pagination
              hideDisabled
              activePage={this.state.currentPage}
              itemsCountPerPage={10}
              totalItemsCount={this.state.totalNumberOfAssets}
              onChange={this.handlePageChange}
            />
          </div>
        </div>
        {this.state.addNewAsset &&
        <div className="newAssetModal">
          <NewAssetModal
            editAssetDetails={this.state.editAssetDetails}
            vendorList={this.props.vendorList}
            deviceType={this.props.deviceTypeList}
            cancelNewAsset={this.cancelNewAsset}
          />
        </div>
        }
      </div>
    );
  }
}