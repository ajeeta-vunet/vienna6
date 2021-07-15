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
import './Sources.less';
import { VunetDynamicTable } from 'ui_framework/src/vunet_components/vunet_dynamic_table/vunet_dynamic_table';
import { VunetModal } from 'ui_framework/src/vunet_components/vunet_modal/vunet_modal';
import { VunetImportModal } from 'ui_framework/src/vunet_components/vunet_import_modal/VunetImportModal';
import chrome from 'ui/chrome';
const urlBase = chrome.getUrlBase();
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider.js';
import { VuBlockConstants } from '../../vu_block_constants';
import _ from 'lodash';

export class Sources extends React.Component {

  constructor(props) {
    super(props);

    const importTemplateLink =
      chrome.getUrlBase() +
      '/vublock/' +
      this.props.vuBlockId +
      '/source_bulk/export?blank=True';

    this.defaultImportModalData = {
      title: 'Import Data Sources',
      tip: 'Only file types with *.xlsx and *.xls are supported.',
      templateLink: importTemplateLink,
      downloadErrors: null,
      success: false,
      error: ''
    };

    this.state = {
      size: 10, // Number of rows to be shown
      headers: {}, // Headers for the table
      search: null, // Search string for the table
      totalRecords: 0, // Total Number of Records to be displayed
      search_fields: null, // Search Fields
      sort_field: null, // Sort based on the field
      order: null, // Sort order
      scroll_id: null, // Scroll ID returned by ES
      rows: [], // The rows to be displayed
      modalStatus: false, // Add or Edit Modal to be shown or not
      modalFormData: {}, // Form data inside the modal
      importModalStatus: false,
      importModalData: this.defaultImportModalData,
      selectedItems: [], // Selected rows
      page: 1, // Page Number in the table
      action: 'next', // Page Action Direction (Next or Previous)
      actionType: null // Type of action to be performed like delete, import, enable...
    };
  }

  componentDidMount() {
    // Fetch the Source Instances for the VuBlock and
    // feed the data returned into state variables
    this.fetchSourcesAndUpdateRows();

    this.searchForKeyword = _.debounce(keyword => {
      this.setState({
        search: keyword === '' ? null : keyword,
        scroll_id: null,
        page: 1
      }, () => {
        this.fetchSourcesAndUpdateRows();
      });
    }, 1000);
  }

  // Function to create the URL for fetching source instances
  createSourceInstanceURL = () => {
    const url = new URL(window.location.origin + urlBase + '/' + VuBlockConstants.VUBLOCK_API_BASE_PATH +
      '/' + this.props.vuBlockId + '/source-instances');
    const params = {};
    const stateCopy = { ...this.state };
    const paramKeys = [
      'scroll_id',
      'size',
      'search',
      'search_fields',
      'sort_field',
      'order',
      'page',
      'action'
    ];
    paramKeys.map((paramKey) => {
      if(stateCopy[paramKey] && stateCopy[paramKey] !== '') {
        params[paramKey] = stateCopy[paramKey];
        url.searchParams.append(paramKey, params[paramKey]);
      }
    });
    return url;
  };

  // Function to set search params to default
  resetDataAndRefresh = () => {
    this.setState({
      search: null,
      totalRecords: 0,
      search_fields: null,
      sort_field: null,
      order: null,
      scroll_id: null,
      rows: [],
      headers: {},
      modalStatus: false,
      modalFormData: {},
      importModalStatus: false,
      importModalData: this.defaultImportModalData,
      actionType: null,
      page: 1,
      action: 'next'
    }, () => {
      this.fetchSourcesAndUpdateRows();
    });
  }

  // Function used for calling the API and fetching the results
  fetchSourcesAndUpdateRows = () => {
    apiProvider.getAll(this.createSourceInstanceURL())
      .then((data) => {
        if(data && data.source_instances && data.headers && data.total) {
          this.setState({
            rows: data.source_instances,
            headers: data.headers,
            totalRecords: data.total,
            scroll_id: data.scroll_id,
            page: data.page
          });
        } else {
          this.setState({
            rows: [],
            headers: {},
            totalRecords: 0,
            scroll_id: null,
            page: 1
          });
        }
      });
  };

  // Called when save button is clicked in modal
  submitSourceInstance = (restApiId, name, data) => {
    // Initialize a list to store data to be sent
    // to the back end.
    const submitDataList = [];
    if (data.wizardData) {
      // Iterate wizardData list received from form wizard
      // and push the data objects to the 'submitDataList'.
      // We do this until we encounter a flag: 'formSubmit'
      // which is set to true.
      data.wizardData.some(function (dataObj) {
        submitDataList.push(dataObj.data);
        if (dataObj.formSubmit &&
            dataObj.formSubmit === true) {
          return true;
        }
      });

      if (name === undefined) {
        // Api call for adding a new data source instance
        return apiProvider.post(`${VuBlockConstants.VUBLOCK_API_BASE_PATH}/` +
        `${this.props.vuBlockId}/${VuBlockConstants.VUBLOCK_SOURCES}/`, submitDataList);
      } else {
        // Api call for editing an existing data source instance
        return apiProvider.put(`${VuBlockConstants.VUBLOCK_API_BASE_PATH}/` +
        `${this.props.vuBlockId}/${VuBlockConstants.VUBLOCK_SOURCES}/${name}`, submitDataList);
      }
    }
  };

  // Promise to carry out delete operation
  newDeletePromise = (item) => {
    return apiProvider.remove(`${VuBlockConstants.VUBLOCK_API_BASE_PATH}/` +
    `${this.props.vuBlockId}/${VuBlockConstants.VUBLOCK_SOURCES}/${item}`);
  }

  // Promise to carry out enable / disable operation
  newEnablePromise = (item, actionType) => {
    return apiProvider.put(`${VuBlockConstants.VUBLOCK_API_BASE_PATH}/` +
    `${this.props.vuBlockId}/${VuBlockConstants.VUBLOCK_SOURCES}/?action=${actionType}`, item);
  }

  // Callback to submit modal
  onModalSubmit = () => {
    // If the selected action is delete
    if (this.state.actionType === 'Delete') {
      // If the delete source modal is submitted
      const itemsToDelete = [...this.state.selectedItems];
      const promisesList = [];
      itemsToDelete.map((item) => {
        promisesList.push(this.newDeletePromise(item));
      });
      Promise.all(promisesList)
        .then(() => {
          this.resetDataAndRefresh();
        });
    }
    // If the selected action is export
    else if (this.state.actionType === 'Export') {
      this.props.exportDataSources();
      this.setState({
        modalStatus: false,
        modalFormData: {}
      });
    }
    // If the selected action is enable / disable
    else if (this.state.actionType === 'enable' ||
      this.state.actionType === 'disable') {
      const itemsToEnable = [...this.state.selectedItems];
      const promisesList = [];
      promisesList.push(this.newEnablePromise(itemsToEnable, this.state.actionType));
      Promise.all(promisesList)
        .then(() => {
          this.resetDataAndRefresh();
        });
    } else {
      // If the Add or Edit Source Modal is submitted
      this.resetDataAndRefresh();
    }
  };

  //////////////////////////////
  // ** CALLBACK FUNCTIONS ** //
  //////////////////////////////

  // Callback to fetch previous or next rows
  // The value for direction can be 'right' or 'left'
  getNextOrPrevRecords = (direction) => {
    this.setState(prevState => (
      {
        page: direction === 'next' ? prevState.page + 1 : prevState.page - 1,
        action: direction
      }
    ), () => {
      this.fetchSourcesAndUpdateRows();
    });
  };

  // Callback to add a new row
  addNewSourceInstance = () => {
    const formModal = {
      title: 'Add source instance',
      action: 'add',
      restApiId: '',
      isFormWizard: true,
      class: 'form-wizard-modal',
      saveData: this.submitSourceInstance,
      getAllEditData: () => {
        return apiProvider.getAll(`${VuBlockConstants.VUBLOCK_API_BASE_PATH}/` +
          `${this.props.vuBlockId}/${VuBlockConstants.VUBLOCK_SOURCES}/${VuBlockConstants.SOURCE_INSTANCE_TEMPLATE}`);
      },
      // deleteSelectedItems: this.deleteSelectedItems,
      buttonCallback: this.props.buttonCallback
    };
    this.setState({
      modalStatus: true,
      modalFormData: formModal
    });
  };

  // Callback to edit a table row
  editSourceInstance = (sourceId) => {
    const formModal = {
      title: 'Edit source instance',
      action: 'edit',
      restApiId: '',
      isFormWizard: true,
      name: sourceId,
      class: 'form-wizard-modal',
      saveData: this.submitSourceInstance,
      getAllEditData: () => {
        return apiProvider.getAll(`${VuBlockConstants.VUBLOCK_API_BASE_PATH}/` +
          `${this.props.vuBlockId}/${VuBlockConstants.VUBLOCK_SOURCES}/${sourceId}${VuBlockConstants.SOURCE_INSTANCE_TEMPLATE}`);
      },
      // deleteSelectedItems: this.deleteSelectedItems,
      buttonCallback: this.props.buttonCallback
    };
    this.setState({
      modalStatus: true,
      modalFormData: formModal
    });
  };

  // Callback to sort a column
  sortSourceInstances = (field, order) => {
    this.setState({
      scroll_id: null,
      sort_field: field,
      order: order,
      page: 1
    }, () => {
      this.fetchSourcesAndUpdateRows();
    });
  };

  // Callback to change the size of the table
  changeRowLimit = (size) => {
    this.setState({
      size: size,
      scroll_id: null,
      page: 1
    }, () => {
      this.fetchSourcesAndUpdateRows();
    });
  };

  // Callback to delete selected rows
  showDeleteModal = (selectedRows) => {
    const formModal = {
      isForm: false,
      title: 'Delete Confirmation',
      message: '<h4> Are you sure you want to delete the selected items? </h4>'
    };
    this.setState({
      modalStatus: true,
      modalFormData: formModal,
      selectedItems: selectedRows,
      actionType: 'Delete'
    });
  }

  // Callback to enable / disable selected source instances
  showEnableDisableModal = (selectedRows, status) => {
    const formModal = {
      isForm: false,
      title: status.charAt(0).toUpperCase() + status.slice(1) + ' Confirmation',
      message: '<h4> Are you sure you want to <font color="red">' + status + ' </font>the selected items? </h4>'
    };
    this.setState({
      modalStatus: true,
      modalFormData: formModal,
      selectedItems: selectedRows,
      actionType: status
    });
  }

  // Function to show export modal
  showExportModal = () => {
    const formModal = {
      isForm: false,
      title: 'Export Data',
      message: '<h4> Are you sure you want to export data? </h4>'
    };
    this.setState({
      modalStatus: true,
      modalFormData: formModal,
      actionType: 'Export'
    });
  }

  // API Call to upload data via import
  importDataSources = (formData) => {
    // API call to upload data source file
    apiProvider.post(`${VuBlockConstants.VUBLOCK_API_BASE_PATH}/` +
    `${this.props.vuBlockId}/${VuBlockConstants.VUBLOCK_SOURCES_IMPORT}`, formData)
      .then((data) => {
        const importModalDataCopy = { ...this.state.importModalData };
        if (data.status === 200) {
          // If the file upload was successful
          importModalDataCopy.success = true;
        } else {
          // If the file upload fails
          if(data.response.data && data.response.data['error-string']) {
            // If error string is present, set the error 
            // and provide the function to download the error logs
            importModalDataCopy.error = data.response.data['error-string'];
            importModalDataCopy.downloadErrors = this.downloadImportErrors;
          } else {
            // Generic error message when the error string is not present
            importModalDataCopy.error = 'Error while uploading. Please check the file!';
          }
        }
        // Updating the modal content
        this.setState({
          importModalData: importModalDataCopy
        });
      });
  }

  // Function to download the error logs
  downloadImportErrors = () => {
    this.props.downloadImportErrors();
    this.setState({
      importModalData: this.defaultImportModalData
    });
  };

  // Function to dismiss the import modal
  onImportModalClose = (success) => {
    const refresh = success || false;
    if(refresh) {
      // If the file upload was successful, refresh the table
      this.resetDataAndRefresh();
    } else {
      // If the file upload failed, reset the modal content
      this.setState({
        importModalStatus: false,
        importModalData: this.defaultImportModalData
      });
    }
  }

  // Array that contains any custom row actions
  sourceTableActionButtons = [
    {
      title: 'Enable',
      label: 'enable',
      styling: {
        backgroundColor: '#0d6efd',
      },
      onPerform: (selectedRows) => {
        this.showEnableDisableModal(selectedRows, 'enable');
      }
    },
    {
      title: 'Disable',
      label: 'disable',
      styling: {
        backgroundColor: '#6c757d',
      },
      onPerform: (selectedRows) => {
        this.showEnableDisableModal(selectedRows, 'disable');
      }
    }
  ];

  // Final rendering of Sources tab content
  render() {
    return (
      <div className="sources-wrapper">
        <VunetDynamicTable
          rowIdentifier={'source_id_value'}
          rows={this.state.rows}
          headers={this.state.headers}
          getNextOrPrevRecords={this.getNextOrPrevRecords}
          searchForKeyword={this.searchForKeyword}
          addNewRecord={this.addNewSourceInstance}
          editRecord={this.editSourceInstance}
          deleteRecord={this.showDeleteModal}
          tableActions={this.sourceTableActionButtons}
          pageNumber={this.state.page}
          sortField={this.sortSourceInstances}
          totalRecords={this.state.totalRecords}
          importData={() => { this.setState({ importModalStatus: true }); }}
          exportData={this.showExportModal}
          rowLimits={[10, 20, 50]}
          changeRowLimit={this.changeRowLimit}
        />
        <VunetModal
          showModal={this.state.modalStatus}
          data={this.state.modalFormData}
          onClose={() => { this.setState({ modalStatus: false }); }}
          onSubmit={this.onModalSubmit}
          clickOutsideToCloseModal={true}
        />
        <VunetImportModal
          showModal={this.state.importModalStatus}
          data={this.state.importModalData}
          onClose={this.onImportModalClose}
          onUpload={this.importDataSources}
          onUpdateModal={(data) => { this.setState({ importModalData: data }); }}
        />
      </div>
    );
  }
}

Sources.propTypes = {};