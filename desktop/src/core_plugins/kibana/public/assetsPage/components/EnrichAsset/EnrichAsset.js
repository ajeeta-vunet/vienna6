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

import { produce } from 'immer';
import React from 'react';
import './EnrichAsset.less';

export class EnrichAsset extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enrichData: this.props.enrichData,
      key: '',
      value: '',
      disableValidKeyAndValueFlag: true,
      addNewFlag: this.props.addNewFlag,
      disableEditEnteredDataFlag: false,
      keyUnderEdit: '',
      disableAddNewButton: Object.keys(this.props.enrichData).length <= 0,
      keyExists: false,
      keyEmpty: false,
      valueEmpty: false,
    };
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      addNewFlag: newProps.addNewFlag,
    });
  }

  //this method is called when the user enters/edits a key in the key input box.
  //this method also validate whether bot key and value are entered and set a flag accordingly.
  handleKeyChange = (e) => {
    const key = e.target.value;
    let keyExists = this.state.keyExists;
    if (key !== '') {
      if (key !== this.state.keyUnderEdit && this.state.enrichData[key]) {
        keyExists = true;
      } else keyExists = false;
    }
    const disableValidKeyAndValueFlag =
      this.state.value === '' || e.target.value === '';
    this.setState({
      key: e.target.value,
      disableValidKeyAndValueFlag,
      keyExists,
      keyEmpty: key === '',
    });
  };

  //this method is called when the user enters/edits a value in the value input box.
  //this method also validate whether bot key and value are entered and set a flag accordingly.
  handleValueChange = (e) => {
    const disableValidKeyAndValueFlag =
      this.state.key === '' || e.target.value === '';
    this.setState({
      value: e.target.value,
      disableValidKeyAndValueFlag,
      valueEmpty: e.target.value === '',
    });
  };

  //this method is called when the user has finished entering both key and value and the user clicks on
  //add button.
  addNewEnrichData = () => {
    const enrichData = produce(this.state.enrichData, (draft) => {
      if (this.state.keyUnderEdit !== '' && !draft[this.state.key]) {
        delete draft[this.state.keyUnderEdit];
      }
      draft[this.state.key] = this.state.value;
    });

    this.setState(
      {
        key: '',
        value: '',
        enrichData,
        disableValidKeyAndValueFlag: true,
        addNewFlag: false,
        disableAddNewButton: false,
        disableEditEnteredDataFlag: false,
        keyUnderEdit: '',
      },
      () => this.props.enrichAssetMethod(enrichData)
    );
  };

  //this method is called when the user clicks on the 'x' icon while adding/editing a row.
  cancelNewOrEditEntry = () => {
    this.setState(
      {
        key: '',
        value: '',
        disableValidKeyAndValueFlag: true,
        addNewFlag: false,
        keyUnderEdit: '',
        disableEditEnteredDataFlag: false,
        disableAddNewButton: false,
        keyEmpty: false,
      },
      () =>
        Object.keys(this.props.enrichData).length === 0 &&
        this.props.cancelEnrichAsset()
    );
  };

  //this method is called when the user clicks on the 'pencil' icon to edit any row present.
  editEnteredEnrichData = (key) => {
    this.setState({
      key: key,
      value: this.state.enrichData[key],
      keyUnderEdit: key,
      disableEditEnteredDataFlag: true,
      disableValidKeyAndValueFlag: true,
      disableAddNewButton: true,
    });
  };

  //this method is called to delete an exiting row under enrich Asset form.
  deleteEnteredData = (key) => {
    const enrichData = produce(this.state.enrichData, (draft) => {
      delete draft[key];
    });
    const disableAddNewButton = this.state.disableEditEnteredDataFlag;
    this.setState(
      {
        enrichData,
        disableAddNewButton,
      },
      () => this.props.enrichAssetMethod(enrichData)
    );
  };

  //this method is called to display the rows under the enrich data.
  //if enrich data exits it is displayed as rows, if not then two input
  //boxes - one for key and one for value is displayed.
  displayEnteredData = () => {
    return (
      this.state.enrichData &&
      Object.entries(this.state.enrichData).map(([key, value]) => {
        if (this.state.keyUnderEdit === key) {
          return (
            <div key={key} className="input-section">
              <div className="key-input-div">
                <input
                  type="text"
                  className="key-input"
                  value={this.state.key}
                  onChange={(e) => this.handleKeyChange(e)}
                />
                <div className="error-message">
                  {this.state.keyEmpty && <span>Key cannot be empty.</span>}
                  {this.state.keyExists && (
                    <span>Entered key value already exists.</span>
                  )}
                </div>
              </div>
              <div className="value-input-div">
                <input
                  type="text"
                  className="value-input"
                  value={this.state.value}
                  onChange={(e) => this.handleValueChange(e)}
                />
                <div className="error-message">
                  {this.state.valueEmpty && <span>Value cannot be empty.</span>}
                </div>
              </div>
              <div className="row-actions">
                <button
                  className="add-button"
                  onClick={() => this.addNewEnrichData()}
                  disabled={this.state.disableValidKeyAndValueFlag}
                >
                  <span className="fa fa-check" />
                </button>
                <button
                  className="cancel-button"
                  onClick={() => this.cancelNewOrEditEntry()}
                >
                  <span className="fa fa-times" />
                </button>
              </div>
            </div>
          );
        } else {
          return (
            <div key={key} className="entered-data-row">
              <div className="entered-key">{key}</div>
              <div className="entered-value">{value}</div>
              <div className="edit-delete-actions">
                <button
                  className="edit-button"
                  onClick={() => this.editEnteredEnrichData(key)}
                  disabled={this.state.disableEditEnteredDataFlag}
                >
                  <span className="fa fa-pencil" />
                </button>
                <button
                  className="cancel-button"
                  onClick={() => this.deleteEnteredData(key)}
                  disabled={this.state.disableEditEnteredDataFlag}
                >
                  <span className="fa fa-trash" />
                </button>
              </div>
            </div>
          );
        }
      })
    );
  };

  render() {
    return (
      <div className="enrich-asset-wrapper">
        <div className="input-form">
          <div className="heading-div">
            <div className="key-heading">Key:</div>
            <div className="value-heading">Value:</div>
            <div className="actions-heading">Actions:</div>
          </div>
          <div className="entered-data">{this.displayEnteredData()}</div>
          {this.state.addNewFlag && (
            <div className="input-section">
              <div className="new-key-input-div">
                <input
                  type="text"
                  className="new-key-input"
                  value={this.state.key}
                  onChange={(e) => this.handleKeyChange(e)}
                />
                <div className="error-message">
                  {this.state.keyEmpty && <span>Key cannot be empty.</span>}
                  {this.state.keyExists && (
                    <span>Entered key value already exists.</span>
                  )}
                </div>
              </div>
              <div className="new-value-input-div">
                <input
                  type="text"
                  className="new-value-input"
                  value={this.state.value}
                  onChange={(e) => this.handleValueChange(e)}
                />
                <div className="error-message">
                  {this.state.valueEmpty && <span>Value cannot be empty.</span>}
                </div>
              </div>
              <div className="row-actions">
                <button
                  className="add-button"
                  onClick={() => this.addNewEnrichData()}
                  disabled={this.state.disableValidKeyAndValueFlag}
                >
                  <span className="fa fa-check" />
                </button>
                <button
                  className="cancel-button"
                  onClick={() => this.cancelNewOrEditEntry()}
                >
                  <span className="fa fa-times" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
