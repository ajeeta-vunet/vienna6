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

// Copyright 2020 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React from 'react';
import PropTypes from 'prop-types';
import { produce } from 'immer';

import { VunetModal } from 'ui_framework/src/vunet_components/vunet_modal/vunet_modal';
import { VunetLoader } from 'ui_framework/src/vunet_components/VunetLoader/VunetLoader';
import { DisplayMetaData } from '../DisplayMetaData/DisplayMetaData';
import { VunetHelp } from 'ui_framework/src/vunet_components/vunet_help/vunet_help';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';

import {
  EnrichmentConstants,
  FIELD_TYPES,
  KEY_VALUES_RULES_META,
} from '../../enrichment_constants';
import * as HelpConstants from '../../enrichment_help_constants';
import './AddOrEditTable.less';

export class AddOrEditTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tableMetaDataList: [],
      tableObj: {
        tableName: '',
        description: '',
        keys: [],
        values: [],
      },
      errorType: {
        tableNameRequired: false,
        duplicateTableNameFound: false,
        descriptionRequired: false,
      },
      helpOperationsDict: {
        tableName: false,
        description: false,
      },
      formModal: {},
      showAddEditModal: false,
      isFormValid: false,
    };
  }

  // get meta data to display input fields
  // for keys and values.
  getKeysOrValuesMeta = (metaDataType) => {
    const metaData = [
      {
        key: 'label',
        label: 'Label',
        name: 'label',
        type: 'text',
        validationCallback:
          metaDataType === 'Keys'
            ? this.validateKeyInputs
            : this.validateValueInputs,
        helpObj:
          metaDataType === 'Keys'
            ? HelpConstants.KEY_LABEL_HELP_OBJ
            : HelpConstants.VALUE_LABEL_HELP_OBJ,
        props: {
          required: true,
          maxLength: '120',
          pattern: '^[a-zA-Z0-9]+([a-zA-Z0-9_]+)*$',
        },
        errorText: `Label should be unique and can have alpha-numeric characters. _ and - 
  is also allowed but the name should not exceed 120 characters.`,
      },
      {
        key: 'field_name',
        label: 'Field name',
        name: 'field_name',
        type: 'text',
        validationCallback:
          metaDataType === 'Keys'
            ? this.validateKeyInputs
            : this.validateValueInputs,
        helpObj:
          metaDataType === 'Keys'
            ? HelpConstants.KEY_FIELD_NAME_HELP_OBJ
            : HelpConstants.VALUE_FIELD_NAME_HELP_OBJ,
        props: {
          required: true,
          maxLength: '120',
          pattern: '^[a-zA-Z0-9]+([a-zA-Z0-9_.]+)*$',
        },
        errorText: `Field Name should be unique and can have alpha-numeric characters. _, . and - 
  is also allowed but the name should not exceed 120 characters.`,
      },
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        name: 'type',
        id: true,
        helpObj:
          metaDataType === 'Keys'
            ? HelpConstants.KEY_TYPE_HELP_OBJ
            : HelpConstants.VALUE_TYPE_HELP_OBJ,
        options: FIELD_TYPES,
        props: {
          required: true,
        },
        rules: KEY_VALUES_RULES_META,
      },
      {
        key: 'minimum',
        label: 'Minimum Value',
        name: 'min',
        type: 'number',
        helpObj:
          metaDataType === 'Keys'
            ? HelpConstants.KEY_MINIMUM_HELP_OBJ
            : HelpConstants.VALUE_MINIMUM_HELP_OBJ,
        props: {
          required: true,
        },
        errorText: `Please provide a minimum value allowed for this field.`,
      },
      {
        key: 'maximum',
        label: 'Maximum Value',
        name: 'maximum',
        type: 'number',
        helpObj:
          metaDataType === 'Keys'
            ? HelpConstants.KEY_MAXIMUM_HELP_OBJ
            : HelpConstants.VALUE_MAXIMUM_HELP_OBJ,
        props: {
          required: true,
        },
        errorText: `Please provide a maximum value allowed for this field.`,
      },
      {
        key: 'constraint',
        label: 'Constraint',
        name: 'constraint',
        type: 'text',
        helpObj:
          metaDataType === 'Keys'
            ? HelpConstants.KEY_CONSTRAINT_HELP_OBJ
            : HelpConstants.VALUE_CONSTRAINT_HELP_OBJ,
        props: {
          required: true,
          maxLength: '100',
          pattern: '.*',
        },
        errorText: `Please provide a valid regex.`,
      },
      {
        key: 'options',
        label: 'Options',
        name: 'options',
        type: 'text',
        helpObj:
          metaDataType === 'Keys'
            ? HelpConstants.KEY_OPTIONS_HELP_OBJ
            : HelpConstants.VALUE_OPTIONS_HELP_OBJ,
        props: {
          required: true,
          maxLength: '120',
          pattern: '.*',
        },
        errorText: `Please provide all the supported values for this field in a comma separated format.`,
      },
      {
        key: 'helpText',
        label: 'Help',
        name: 'helpText',
        type: 'text',
        helpObj:
          metaDataType === 'Keys'
            ? HelpConstants.KEY_HELPDESC_HELP_OBJ
            : HelpConstants.VALUE_HELPDESC_HELP_OBJ,
        props: {
          maxLength: '120',
          pattern: '.*',
        },
        errorText: `Please provide a description for this field`,
      },
    ];
    return metaData;
  };

  // Check for duplicate labels / field names in keys list
  validateKeyInputs = (key, value) => {
    return this.state.tableObj.keys.some((obj) => {
      return obj[key] === value;
    });
  };

  // Check for duplicate labels / field names in values list
  validateValueInputs = (key, value) => {
    return this.state.tableObj.values.some((obj) => {
      return obj[key] === value;
    });
  };

  // Check if table name already exists when creating a new
  // enrichment table.
  isTableNameExists = (tableValue) => {
    return this.state.tableMetaDataList && this.state.tableMetaDataList.find((obj) => {
      return obj.table_name === tableValue ? true : false;
    });
  };

  // This function checks for atleast one key and
  // value to be configured.
  isAtleastOneKeyAndValueExists = function () {
    if (
      this.state.tableObj.keys.length >= 1 &&
      this.state.tableObj.values.length >= 1
    ) {
      return true;
    } else {
      return false;
    }
  };

  toggleHelpContent = (field) => {
    const helpOperDict = { ...this.state.helpOperationsDict };
    helpOperDict[field] = !this.state.helpOperationsDict[field];
    this.setState({ helpOperationsDict: helpOperDict });
  };

  componentDidMount() {
    let tableMetaDataList = [];
    let tableMetaData = {};
    apiProvider
      .getAll(EnrichmentConstants.ENRICHMENT_TABLES_API_URL)
      .then((data) => {
        // Get metadata of all the tables configured from the $route
        tableMetaDataList = data.data;
        this.setState({
          tableMetaDataList: tableMetaDataList,
        });
        if (this.props.tableId) {
          // Get the metadata corresponding to the current table that is being
          // viewed
          tableMetaData = tableMetaDataList.find((obj) => {
            return obj.id === this.props.tableId;
          });
          tableMetaData.tableName = tableMetaData.table_name;
          this.setState({
            tableObj: tableMetaData,
          });
        }
      });
  }

  // This method is called when any input field in the table form changes,
  // based on the value of the field necessary state variable is changed.
  onChange = (e, field) => {
    let errorType = this.state.errorType;
    e.preventDefault();
    let table = this.state.tableObj;
    switch (field) {
      case 'tableName':
        if (
          e.target.value === '' &&
          document.getElementById('tableName').value === ''
        ) {
          errorType = produce(this.state.errorType, (draft) => {
            draft.tableNameRequired = true;
            draft.duplicateTableNameFound = false;
          });
        } else if (this.isTableNameExists(e.target.value)) {
          errorType = produce(this.state.errorType, (draft) => {
            draft.duplicateTableNameFound = true;
            draft.tableNameRequired = false;
          });
        } else {
          errorType = produce(this.state.errorType, (draft) => {
            draft.duplicateTableNameFound = false;
            draft.tableNameRequired = false;
          });
        }
        table = produce(this.state.tableObj, (draft) => {
          draft.tableName = e.target.value;
        });
        break;
      case 'description':
        if (
          e.target.value === '' &&
          document.getElementById('description').value === ''
        ) {
          errorType = produce(this.state.errorType, (draft) => {
            draft.descriptionRequired = true;
          });
        } else {
          errorType = produce(this.state.errorType, (draft) => {
            draft.descriptionRequired = false;
          });
        }
        table = produce(this.state.tableObj, (draft) => {
          draft.description = e.target.value;
        });
    }

    const isFormValid =
      !Object.values(errorType).includes(true) &&
      this.isAtleastOneKeyAndValueExists();
    e.preventDefault();
    this.setState({
      tableObj: table,
      errorType: errorType,
      isFormValid: isFormValid,
    });
  };

  // Gets called when a new key or value is added.
  addEntry = (metaDataType) => {
    let formModalData = {};
    const metaData = this.getKeysOrValuesMeta(metaDataType);
    if (metaDataType === 'Keys') {
      formModalData = {
        title: 'Add Key',
        action: 'add',
        editData: { type: 'enum', constraint: '.*' },
        metaDataType: metaDataType,
        item: metaData,
      };
    } else {
      formModalData = {
        title: 'Add Value',
        action: 'add',
        editData: { type: 'enum', constraint: '.*' },
        metaDataType: metaDataType,
        item: metaData,
      };
    }
    this.setState(
      {
        formModal: formModalData,
      },
      () => {
        this.setState({ showAddEditModal: true });
      }
    );
  };

  // Gets called when a entry in keys or values table
  // is edited.
  editEntry = (metaDataType, data, index) => {
    let formModalData = {};
    const metaData = this.getKeysOrValuesMeta(metaDataType);
    if (metaDataType === 'Keys') {
      formModalData = {
        title: 'Edit Key',
        action: 'edit',
        editIndex: index,
        editData: data,
        metaDataType: metaDataType,
        item: metaData,
      };
    } else {
      formModalData = {
        title: 'Edit Value',
        action: 'edit',
        editData: data,
        editIndex: index,
        metaDataType: metaDataType,
        item: metaData,
      };
    }
    this.setState(
      {
        formModal: formModalData,
      },
      () => {
        this.setState({ showAddEditModal: true });
      }
    );
  };

  // This function gets called when the modal
  // shown to add or edit keys/values is closed.
  onAddEditModalClose = () => {
    this.setState({
      showAddEditModal: false,
      editId: '',
      formModal: {},
    });
  };

  // This function gets called when the modal
  // shown to add or edit keys/values is submitted.
  onAddEditModalSubmit = (data) => {
    const row = {};
    row.label = data.label;
    row.field_name = data.field_name;
    row.type = data.type;
    if (data.type === 'string') {
      row.constraint = data.constraint;
    } else {
      row.constraint = '';
    }
    row.minimum = data.minimum;
    row.maximum = data.maximum;
    row.options = data.options;
    row.helpText = data.helpText;
    let tableObjCopy = {};
    if (this.state.formModal.action === 'edit') {
      const editIndex = this.state.formModal.editIndex;

      if (this.state.formModal.metaDataType === 'Keys') {
        tableObjCopy = produce(this.state.tableObj, (draft) => {
          draft.keys[editIndex] = row;
        });
      } else {
        tableObjCopy = produce(this.state.tableObj, (draft) => {
          draft.values[editIndex] = row;
        });
      }
    } else {
      tableObjCopy = produce(this.state.tableObj, (draft) => {
        this.state.formModal.metaDataType === 'Keys'
          ? draft.keys.push(row)
          : draft.values.push(row);
      });
    }
    this.setState({ tableObj: tableObjCopy }, () => {
      const isFormValid =
        !Object.values(this.state.tableObj).includes('') &&
        this.isAtleastOneKeyAndValueExists();
      this.setState({
        showAddEditModal: false,
        formModal: {},
        isFormValid: isFormValid,
      });
    });
  };

  // This function gets called when user decides not to
  // add a table and clicks on the cancel button
  cancelTable = () => {
    this.props.onCancelTable();
  };

  // This function gets called when the user provides
  // necessary information to create a table and clicks
  // Save.
  saveTable = () => {
    const action = this.props.tableId ? 'edit' : 'add';
    this.props.onSaveTable(action, this.props.tableId, this.state.tableObj);
  };

  render() {
    return this.props.tableId && this.state.tableObj.tableName === '' ? (
      <VunetLoader />
    ) : (
      <div className="add-edit-table-container">
        <div className="table-navbar">
          <div className="table-header">
            {this.props.tableId
              ? 'Edit Enrichment Table'
              : 'Add Enrichment Table'}
          </div>
          <div className="save-table-wrapper">
            <button
              type="button"
              id="cancelButton"
              onClick={() => {
                this.cancelTable();
              }}
              className="nav-buttons"
            >
              <i className="button-icon icon-discard" />
              Cancel
            </button>
            <button
              type="button"
              id="saveButton"
              disabled={!this.state.isFormValid}
              onClick={() => {
                this.saveTable();
              }}
              className="nav-buttons"
            >
              <i className="button-icon icon-save" />
              Save
            </button>
          </div>
        </div>
        <form name="tableForm" className="table-form">
          <div className="form-group-wrapper">
            <div className="form-group">
              <label htmlFor="Table Name">Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="tableName"
                  name="tableName"
                  value={this.state.tableObj.tableName}
                  disabled={this.props.tableId}
                  onChange={(e) => this.onChange(e, 'tableName')}
                />
                <span>
                  <i
                    className="help-icon icon-help-blue"
                    onClick={() => {
                      this.toggleHelpContent('tableName');
                    }}
                  />
                </span>
                <div className="error-message">
                  {this.state.errorType.tableNameRequired && (
                    <span>Please provide the table name.</span>
                  )}
                  {this.state.errorType.duplicateTableNameFound && (
                    <span>
                      A table with this name already exists. Please choose a
                      different name
                    </span>
                  )}
                </div>
              </div>
            </div>
            {this.state.helpOperationsDict.tableName && (
              <VunetHelp
                metaData={HelpConstants.TABLE_HELP_OBJ}
                onClose={() => {
                  this.toggleHelpContent('tableName');
                }}
              />
            )}
          </div>
          <div className="form-group-wrapper">
            <div className="form-group">
              <label htmlFor="Description">Description</label>
              <div className="input-wrapper">
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={this.state.tableObj.description}
                  onChange={(e) => this.onChange(e, 'description')}
                />
                <span>
                  <i
                    className="help-icon icon-help-blue description-help-icon"
                    onClick={() => {
                      this.toggleHelpContent('description');
                    }}
                  />
                </span>
                <div className="error-message">
                  {this.state.errorType.descriptionRequired && (
                    <span>Please provide a description.</span>
                  )}
                </div>
              </div>
            </div>
            {this.state.helpOperationsDict.description && (
              <VunetHelp
                metaData={HelpConstants.DESCRIPTION_HELP_OBJ}
                onClose={() => {
                  this.toggleHelpContent('description');
                }}
              />
            )}
          </div>
          <DisplayMetaData
            type={'Keys'}
            metaDataList={this.state.tableObj.keys}
            tableId={this.props.tableId}
            addEntry={this.addEntry}
            editEntry={this.editEntry}
          />
          <DisplayMetaData
            type={'Values'}
            metaDataList={this.state.tableObj.values}
            tableId={this.props.tableId}
            addEntry={this.addEntry}
            editEntry={this.editEntry}
          />
        </form>
        {this.state.showAddEditModal && (
          <VunetModal
            showModal={true}
            data={this.state.formModal}
            onClose={this.onAddEditModalClose}
            onSubmit={this.onAddEditModalSubmit}
            clickOutsideToCloseModal={true}
          />
        )}
      </div>
    );
  }
}

AddOrEditTable.propTypes = {
  onCancelTable: PropTypes.func,
  onSaveTable: PropTypes.func,
  tableId: PropTypes.number,
};
