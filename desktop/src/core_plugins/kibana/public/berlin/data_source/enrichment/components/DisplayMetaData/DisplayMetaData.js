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
import './DisplayMetaData.less';
import { VunetHelp } from 'ui_framework/src/vunet_components/vunet_help/vunet_help';
import * as HelpConstants from '../../enrichment_help_constants';

// This component is used to display all the keys or values of a
// enrichment table.

export class DisplayMetaData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      helpOperationsDict: {
        Keys: false,
        values: false,
      },
    };
  }

  toggleHelpContent = (field) => {
    const helpOperDict = { ...this.state.helpOperationsDict };
    helpOperDict[field] = !this.state.helpOperationsDict[field];
    this.setState({ helpOperationsDict: helpOperDict });
  };

  prepareRows = (inputList) => {
    return inputList.map((obj, index) => {
      return (
        <tr key={index}>
          <td>{obj.label}</td>
          <td>{obj.field_name}</td>
          <td>{obj.type}</td>
          <td>{obj.minimum}</td>
          <td>{obj.maximum}</td>
          <td>{obj.constraint}</td>
          <td>{obj.options}</td>
          <td>
            <i
              className="fa fa-pencil"
              onClick={() => {
                this.props.editEntry(this.props.type, obj, index);
              }}
            />
          </td>
        </tr>
      );
    });
  };

  render() {
    const { type, metaDataList, tableId } = this.props;
    return (
      <div className="form-group-for-table">
        <div className="meta-table-navbar">
          <label htmlFor={type}>
            {type}{' '}
            <span>
              <i
                className="help-icon icon-help-blue"
                onClick={() => {
                  this.toggleHelpContent(type);
                }}
              />
            </span>
          </label>
          {tableId && type === 'Keys' ? null : (
            <button
              type="button"
              className="kuiButton kuiButton--primary kuiButton--iconText"
              aria-label="Create new"
              onClick={() => this.props.addEntry(type)}
              data-tip={`Add New ${type}`}
            >
              <span className="kuiButton__inner">
                <span
                  aria-hidden="true"
                  className="kuiButton__icon kuiIcon fa-plus"
                />
              </span>
            </button>
          )}
        </div>
        {this.state.helpOperationsDict[type] && (
          <VunetHelp
            metaData={
              type === 'Keys'
                ? HelpConstants.KEY_HELP_OBJ
                : HelpConstants.VALUES_HELP_OBJ
            }
            onClose={() => {
              this.toggleHelpContent(type);
            }}
          />
        )}

        <div className="metadata-table-wrapper">
          <table className="table metadata-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Field Name</th>
                <th>Type</th>
                <th>Minimum Value</th>
                <th>Maximum Value</th>
                <th>Constraint</th>
                <th>Options</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>{this.prepareRows(metaDataList)}</tbody>
          </table>
          {!metaDataList.length && (
            <div className="metadata-table-error">
              No {this.props.type} added yet.
            </div>
          )}
        </div>
      </div>
    );
  }
}

DisplayMetaData.propTypes = {
  type: PropTypes.string,
  metaDataList: PropTypes.array,
  tableId: PropTypes.number,
  addEntry: PropTypes.func,
  editEntry: PropTypes.func,
};
