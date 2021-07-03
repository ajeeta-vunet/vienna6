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
import PropTypes from 'prop-types';

import { EnrichmentConstants } from '../enrichment_constants';
import { VunetDataTable } from 'ui_framework/src/vunet_components/vunet_table/vunet_table';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';
import { AddOrEditTable } from './AddOrEditTable/AddOrEditTable';
import chrome from 'ui/chrome';
import { Notifier } from 'ui/notify';
const notify = new Notifier({ location: 'Enrichment Tables' });

export class EnrichmentTablesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAddOrEditTablePage: false,
      tableId: undefined,
    };
  }

  // Display the add page when user clicks
  // on add table.
  onCustomAddAction = () => {
    this.setState({ showAddOrEditTablePage: true });
  };

  onCancel = () => {
    this.setState({ showAddOrEditTablePage: false, tableId: undefined });
  };

  // This function gets called when the save button in
  // add or edit table page is clicked
  onSubmit = (event, tableId, data) => {
    // prepare the data in the required
    // format for add / edit operation.
    const postData = {
      table_name: data.tableName,
      topic_name: `enrich-${data.tableName}`,
      keys: data.keys,
      values: data.values,
      options: {},
      description: data.description,
      helpText: data.helpText,
    };

    // Add new table
    if (event === 'add') {
      return apiProvider
        .post(EnrichmentConstants.ENRICHMENT_TABLES_API_URL, postData)
        .then((data) => {
          {
            this.setState(
              {
                showAddOrEditTablePage: false,
                tableId: undefined,
              },
              () => {
                if (data.status === 200) {
                  notify.info(`${postData.table_name} has been added successfully`);
                } else {
                  notify.error(`${data.response.data['error-string']}`);
                }
              }
            );
            return Promise.resolve(true);
          }
        })
        .catch((error) => {
          this.setState({
            showAddOrEditTablePage: false,
            tableId: undefined
          });
          notify.error(error);
          return Promise.resolve(false);
        });
      // Edit a table
    } else if (event === 'edit') {
      return apiProvider
        .put(
          `${EnrichmentConstants.ENRICHMENT_TABLES_API_URL}${data.id}/`,
          postData
        )
        .then((data) => {
          this.setState(
            {
              showAddOrEditTablePage: false,
              tableId: undefined,
            },
            () => {
              if (data.status === 200) {
                notify.info(`${postData.table_name} has been updated successfully`);
              } else {
                notify.error(`${data.response.data['error-string']}`);
              }
            }
          );
          return Promise.resolve(true);
        })
        .catch((error) => {
          this.setState({
            showAddOrEditTablePage: false,
            tableId: undefined,
          });
          notify.error(error);
          return Promise.resolve(false);
        });
    }
  };

  // This function handles all the A actions on a table.
  onRowAction = (eventType, rowId) => {
    // Show the edit table page when user edits a table
    if (eventType === 'Edit') {
      this.setState({ showAddOrEditTablePage: true, tableId: rowId });
      return Promise.resolve(false);
      //Display the enrichment data for a table
    } else if (eventType === 'View More') {
      window.location.href = `vienna#/berlin/data_source/enrichment/${rowId}`;
      return Promise.resolve(false);
    }
  };

  // Currently delete selected items doesn't do anything...
  deleteSelectedItems = (rows) => {
    // Iterate over list of tables to be deleted and delete
    // one by one. We return a list of promises which contains both
    // success and failure cases.

    const deletePromises = rows.map((row) => {
      return apiProvider.remove(
        `${EnrichmentConstants.ENRICHMENT_TABLES_API_URL}/${row.id}`
      );
    });

    // Wait till all Promises(deletePromises) are resolved
    // and return single Promise
    return Promise.all(deletePromises);
  };

  // This is called to fetch all the existing data enrichment tables
  fetchEnrichmentMetaData = () => {
    return apiProvider
      .getAll(EnrichmentConstants.ENRICHMENT_TABLES_API_URL)
      .then(function (data) {
        return data.data;
      });
  };

  render() {
    const enrichmentGroupsMeta = {
      headers: ['Name', 'Description'],
      rows: ['table_name', 'description'],
      rowAction: [
        {
          name: 'Edit',
          icon: 'fa-pencil',
          toolTip: 'Edit',
        },
        {
          name: 'View More',
          icon: 'fa-arrow-circle-right',
          toolTip: 'View Enrichment Data',
        },
      ],
      tableAction: [],
      id: 'id', // This is the table id.
      add: false,
      customAdd: true,
      edit: false,
    };

    const isModifyAllowed = chrome.canManageDataEnrichment();

    if (isModifyAllowed) {
      enrichmentGroupsMeta.tableAction.push({ button: 'Export' });
    }

    return (
      <div
        className="vunet-enrichment-container menubar-fixed-top"
        data-test-subj="userLandingPage"
      >
        {this.state.showAddOrEditTablePage ? (
          <AddOrEditTable
            onCancelTable={this.onCancel}
            onSaveTable={this.onSubmit}
            tableId={this.state.tableId}
          />
        ) : (
          <div>
            {isModifyAllowed ? (
              <div className="row import-row">
                <div className="col-sm-offset-11 col-sm-1 import-column">
                  <div
                    uib-tooltip="Import data into data enrichment"
                    tooltip-placement="bottom"
                    className="display-inline-block"
                  >
                    <button
                      type="button"
                      className="btn vunet-btn-import"
                      onClick={() => {
                        this.props.openImportModal();
                      }}
                    >
                      <span className="">Import</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <VunetDataTable
              fetchItems={this.fetchEnrichmentMetaData}
              deleteSelectedItems={this.deleteSelectedItems}
              rowAction={this.onRowAction}
              metaItem={enrichmentGroupsMeta}
              tableAction={this.props.exportEnrichment}
              onCustomAddAction={this.onCustomAddAction}
            />
          </div>
        )}
      </div>
    );
  }
}

EnrichmentTablesPage.propTypes = {
  openImportModal: PropTypes.func,
  exportEnrichment: PropTypes.func,
};
