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

import React, { Component } from 'react';
import './ImportDevices.less';
import { VunetButton } from 'ui_framework/src/vunet_components/vunet_button/vunet_button';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';
import { Notifier } from 'ui/notify';

const notify = new Notifier({ location: 'Import Devices' });

export class ImportDevices extends Component {
  state={
    importFile: ''
  }

  // to store the selected CSV file
  storeSelectedFile = (e) => {
    this.setState({ importFile: e.target.files[0] });
  };

  // to import devices from selected file
  importDevices = () => {
    const formData = new FormData();
    formData.append(
      'file',
      this.state.importFile,
      this.state.importFile.name
    );
    apiProvider.post('dcm/device/import/', formData).then((response) => {
      if (response.status === 200) {
        notify.info(`Successfully imported devices from ${this.state.importFile.name}`);
        this.props.displayDeviceListingPage();
      } else {
        this.setState({ importFile: '' }, notify.error(`${response.response.data['error-string']}`));
      }
    });
  }

  render() {
    return(
      <div className="dcm-import">
        <div className="dcm-import-wrapper">
          <h4>Import from a *.csv file</h4>
          <div className="import-file">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => this.storeSelectedFile(e)}
            />
          </div>
          <div className="import-actions">
            <VunetButton
              className="secondary"
              data-text="Cancel"
              id="import-cancel"
              onClick={() => this.props.cancelImport()}
            />
            <VunetButton
              className="primary import-submit"
              data-text="Import"
              id="import-submit"
              disabled={this.state.importFile.length === 0 && true}
              onClick={this.importDevices}
            />
          </div>
        </div>
      </div>
    );
  }
}