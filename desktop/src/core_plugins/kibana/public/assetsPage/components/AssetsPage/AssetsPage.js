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
import { fetchListOfAssets,
  fetchAssetDetailsSummary,
  searchAssetDetails,
  downloadAssets,
  fetchFilteredListOfAssets,
  importAssets } from '../../api_calls';
import { Summary } from '../Summary/Summary';
import ReactTooltip from 'react-tooltip';
import { Notifier } from 'ui/notify';
import { FilterBar } from '../../../discovery/components/FilterBar/FilterBar';
import _ from 'lodash';
import { ImportAsset } from '../ImportAsset/ImportAsset';
import { SingleAssetDetails } from '../SingleAssetDetails/SingleAssetDetails';

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
      assetDetailsSummary: this.props.assetDetailsSummary,
      filterObject: {},
      importAssetFlag: false,
      singleAssetDetails: {},
      singleAssetDetailsFlag: false,
      searchString: ''
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
      'topology_name', 'last_modified_time', 'actions'];
    return header.map((key, index) => {
      return <th key={'head-' + index}>{generateHeading(key)}</th>;
    });
  }

  //this function is used to render the table contents.
  renderTableData() {
    return this.state.assets && this.state.assets.map((asset) => {
      const { node_id, topology_name, last_modified_time, addition_method, vendor_name, device_name,
        device_type, system_ip } = asset; //destructuring
      return (
        <tr key={node_id} className={'row-' + node_id}>
          <td>
            <input
              type="checkbox"
              className="checkSingle"
              onClick={(e) => this.checked(e, node_id)}
            />
          </td>
          <td>
            {device_name}
          </td>
          <td>
            {system_ip}
          </td>
          <td>
            {device_type}
          </td>
          <td>
            {vendor_name}
          </td>
          <td>
            {addition_method}
          </td>
          <td>
            {topology_name}
          </td>
          <td>
            {last_modified_time}
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
            <button
              className="more-details-button"
              onClick={() => this.handleMoreDetails(node_id)}
              data-tip={'More Details'}
            >
              <ReactTooltip />
              <span className="fa fa-arrow-circle-right" />
            </button>
          </td>
        </tr>
      );
    });
  }

  //when the action button to display more details of an asset is clicked this mehod is called.
  //this method receives the nodeId of asset cliked on, using this the asset Details of that nodeId is determined
  //and stored in singleAssetDetails state variable. We also set the singleAssetDetailsFlag to true to display
  //SingleAssetDetails component.
  handleMoreDetails = (nodeId) => {
    let singleAssetDetails;
    this.state.assets && this.state.assets.map((asset) => {
      if(asset.node_id === nodeId) {
        singleAssetDetails = asset;
      }
    });
    this.setState({ singleAssetDetails, singleAssetDetailsFlag: true });
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

    // Promise.all(

    const promises = this.state.deleteIdList && this.state.deleteIdList.map((id) => {
      let urlBase = chrome.getUrlBase();
      urlBase = urlBase + '/asset/' + id + '/';

      return fetch(urlBase, {
        method: 'DELETE'
      });
    });
    // )
    Promise.all(promises).then(() => {
      fetchFilteredListOfAssets(0, this.state.filterObject)
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

  //this method is used to render the Add or Delete icon based on
  //whether a record is selected or not.
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

  //This method is called when the user wants to search for a ceratin asset based on fields displayed
  //on in the Assets page. The search string will be sent in the post body of the API call which returns
  //a list of matching assets.
  onSearch = (e) => {
    const search_string = e.target.value;
    if(search_string !== '') {
      const postBody = {
        scroll_id: 0,
        size: 10,
        search_string: search_string
      };
      const data = searchAssetDetails(postBody);
      data.then((details) => {
        this.setState({
          assets: details.assets,
          totalNumberOfAssets: details.no_of_assets,
          currentPage: 1,
          searchString: search_string
        });
      });
    }else {
      this.setState({
        assets: this.props.assetList.assets,
        totalNumberOfAssets: this.props.assetList.no_of_nodes,
        currentPage: 1,
        selectedFlag: false,
        searchString: search_string
      });
    }
  }

  //This method is called when the suer interacts with the pagination component and changes the page.
  //In this method we calculate the scoll-id which will be used to fetch the next 10 assets from the backend
  //API call.
  handlePageChange = (currentPage) => {
    const searchString = $('.search-input').val();
    if(searchString !== '') {
      const postBody = {
        scroll_id: (currentPage - 1) * 10,
        size: 10,
        search_string: searchString
      };
      const data = searchAssetDetails(postBody);
      data.then((details) => {
        this.setState({
          assets: details.assets,
          currentPage: currentPage,
          totalNumberOfAssets: details.no_of_assets,
          selectedFlag: false,
        });
      });
    }else {
      fetchFilteredListOfAssets((currentPage - 1) * 10, this.state.filterObject)
        .then(data => {
          this.setState({
            assets: data.assets,
            currentPage: currentPage,
            totalNumberOfAssets: data.no_of_nodes,
            selectedFlag: false,
          });
        });
    }
  }

  // In this function we use the filterStore object and
  // update the data passed to 'FilterBar' and 'Summary'
  // components based on filters applied by the user. This function receives filterField and
  // filterValue. If the corresponding field and value is present in filterStore, it will be removed.
  // Else it will be added to filterStore.
  handleFilter = (filterValue, filterField) => {
    let updatedfilterObject = this.state.filterObject;
    // Check if filter with 'filterField' exists in filterObject and filterValue received is not empty.
    //If filterValue is empty then the 'cancel' filter button is clicked.
    if (_.has(this.state.filterObject, filterField) && filterValue !== '') {
      // Check if filtered value exists in the array of filters
      const filterValueIndex = this.state.filterObject[filterField].indexOf(
        filterValue
      );

      // If filterValue exists remove it as user is clicking on the same widget
      // for the second time.
      if (filterValueIndex > -1) {
        updatedfilterObject = produce(this.state.filterObject, (draft) => {
          draft[filterField].splice(filterValueIndex, 1);
          //Delete property if there are no filters to be applied on this property
          if (draft[filterField].length === 0) delete draft[filterField];
        });
        // If filterValue does not exist, add it as user is clicking on the same widget
        // for the first time.
      } else {
        updatedfilterObject = produce(this.state.filterObject, (draft) => {
          draft[filterField].push(filterValue);
        });
      }
      // If 'filterField' does not exist in filterObject, add it and update the
      // filterValue in its array.
    } else if(filterValue !== '') {
      updatedfilterObject = produce(this.state.filterObject, (draft) => {
        draft[filterField] = [filterValue];
      });
    }
    this.setState({ filterObject: updatedfilterObject }, () => {
      this.applyFilters(0, this.state.filterObject);
    });
  }

  // this method will be called to fetch the list of assets
  //based on the filter applied whose value is store in
  //filterStore.
  applyFilters = (scrollId, filters) => {
    fetchFilteredListOfAssets(scrollId, filters)
      .then(data => {
        this.setState({
          assets: data.assets,
          totalNumberOfAssets: data.no_of_nodes
        });
      });
  }

  //this method will be called to clear all filters
  //and fetch the list of assets without any filters applied.
  clearAllFilter = () => {
    fetchListOfAssets(0, 10)
      .then(data => {
        this.setState({
          filterObject: {},
          assets: data.assets,
          currentPage: 1,
          totalNumberOfAssets: data.no_of_nodes,
        }, () => notify.info('All filters cleared.'));
      });
  }

  //this method will be called to set the importAssetFlag to true,
  //so that the importAsset component will be displayed
  displayImportModal = () => {
    this.setState({ importAssetFlag: true });
  }

  //this method will be called to set the importAssetFlag to false,
  //so that the importAsset component will not be displayed.
  cancelAssetImport = () => {
    this.setState({ importAssetFlag: false });
  }

  //this method will be called when the user uploads an xls file
  //with the list of assets.
  handleAssetImport = (formData) => {
    importAssets(formData)
      .then(() => {
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
                  deleteIdList: [],
                  filterObject: {}
                }, () => {
                  notify.info('Assets Imported succesfully.');
                  this.cancelAssetImport();
                }
                );
              });
          });
      })
      .catch((error) => {
        notify.error(error);
        this.cancelAssetImport();
      });
  }

  //method called when the New Asset Modal form is submitted after entering details
  //or after editing the details of existing asset.
  handleAssetSubmit = (method, urlBase, assetObject) => {

    fetch(urlBase, {
      method: method,
      body: JSON.stringify(assetObject)
    })
      .then(response => {
        if(response.ok) {
          return response.json();
        }else {
          if(method === 'POST') {
            notify.error('Failed to add asset.');
          }else {
            notify.error('Failed to edit asset.');
          }
        }
      })
      .then(data => {
        if(data) {
          if(method === 'POST') {
            notify.info('Asset added successfully.');
          }else {
            notify.info('Asset edit successful.');
          }
        }
        fetchFilteredListOfAssets(0, this.state.filterObject)
          .then(assetDetails => {
            fetchAssetDetailsSummary()
              .then(assetDetailsSummary => {
                this.setState({
                  assets: assetDetails.assets,
                  currentPage: 1,
                  totalNumberOfAssets: assetDetails.no_of_nodes,
                  selectedFlag: false,
                  assetDetailsSummary: assetDetailsSummary,
                  deleteIdList: []
                }, () => this.cancelNewAsset());
              });
          });
      })
      .catch(() => {
        notify.error('Asset add/edit failure.');
      });
  };

  //this method is called to change the singleAssetDetailsFlag which controls the
  //display of Single Asset Details component.
  goBackToDetails = () => {
    this.setState({ singleAssetDetailsFlag: !this.state.singleAssetDetailsFlag });
  }

  render() {

    return (
      <div className="assetsPage-wrapper">
        {!this.state.singleAssetDetailsFlag &&
        <div>
          <div className="filters">
            <FilterBar
              filterObject={this.state.filterObject}
              handleFilter={this.handleFilter}
              clearAllFilter={this.clearAllFilter}
            />
          </div>
          <div className="assetsPage">
            <div className="assets-summary">
              <Summary
                summaryDetails={this.state.assetDetailsSummary}
                handleFilter={this.handleFilter}
                filterObject={this.state.filterObject}
              />
            </div>
            <div className="assets-table">
              <div className="table-toolbar">
                <div className="toolbar-search">
                  <div className="toolbar-searchbox">
                    <div className="search-icon fa fa-search" />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search"
                      value={this.state.searchString}
                      onChange={(e) => this.onSearch(e)}
                    />
                  </div>
                </div>
                <div className="kuiToolBarSection">
                  <div className="import-button-wrapper">
                    <button
                      className="vunet-btn-import"
                      onClick={() => this.displayImportModal()}
                    >
                  Import
                    </button>
                  </div>
                  <div className="export-button-wrapper">
                    <button className="vunet-btn-export" data-tip="Download CSV Report" onClick={() => downloadAssets()}>
                      Export
                      <ReactTooltip />
                    </button>
                  </div>
                  {this.renderAddOrDeleteIcon()}
                </div>
              </div>
              {this.state.assets.length > 0 &&
              <table className="assets">
                <thead>
                  <tr>
                    <td>
                      <input type="checkbox" className="checkAll" onChange={(e) => this.selectAll(e)}/>
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
                handleAssetSubmit={this.handleAssetSubmit}
                cancelNewAsset={this.cancelNewAsset}
              />
            </div>
            }
            {this.state.importAssetFlag &&
            <div className="import-asset-modal">
              <ImportAsset
                cancelAssetImport={this.cancelAssetImport}
                handleAssetImport={this.handleAssetImport}
              />
            </div>
            }
          </div>
        </div>
        }
        {this.state.singleAssetDetailsFlag &&
          <div className="single-asset-details">
            <SingleAssetDetails
              singleAssetDetails={this.state.singleAssetDetails}
              goBackToDetails={this.goBackToDetails}
            />
          </div>
        }
      </div>
    );
  }
}