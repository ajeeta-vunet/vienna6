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
import './ImportAsset.less';

export class ImportAsset extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      errorType: ''
    };
  }

  //this method is called when the user uploads a file.
  onChange = (event) => {
    if(event.target.files.length === 1 && event.target.files[0].name.endsWith('.xls')) {
      document.getElementById('submitButton').disabled = false;
      this.setState({ selectedFile: event.target.files[0], errorType: '' });
    }else {
      document.getElementById('submitButton').disabled = true;
      this.setState({ errorType: 'fileName' });
    }
    event.preventDefault();
  }

  //this mehtod is called when user has uploaded a file
  //and the clicks on submit button.
  handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append(
      'file',
      this.state.selectedFile,
      this.state.selectedFile.name
    );
    this.props.handleAssetImport(formData);
  }

  render() {
    return(
      <div className="import-asset-wrapper">
        <p className="title">
              Import List of Assets
        </p>
        <form
          className="import-form"
          onSubmit={this.handleSubmit}
        >
          <input
            type="file"
            id="assetFile"
            name="assetFile"
            className="assetFile"
            onChange={this.onChange}
          />
          <div className="error-message">
            {this.state.errorType === 'fileName' && <span>Invalid file format. Only .xls type supported.</span>}
          </div>
          <div className="help-block">
            <p>Only file type with *.xls is supported. Download sample xls file from
              <a href="/ui/vienna_data/asset_import.xls"><i className="data-source-import-template-link"> here</i></a>
            </p>
          </div>
          <div className="actions">
            <input className="import-cancel-button" type="button" value="Cancel" onClick={() => this.props.cancelAssetImport()}/>
            <input
              className="import-submit-button"
              type="submit"
              value="Submit"
              id="submitButton"
              disabled={true}
            />
          </div>
        </form>
      </div>
    );
  }
}