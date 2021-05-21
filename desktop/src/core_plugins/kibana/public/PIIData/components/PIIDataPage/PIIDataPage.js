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
import './PIIDataPage.less';
import CryptoJS from 'crypto-js';
import { Notifier } from 'ui/notify';

const notify = new Notifier({ location: 'PII Data' });

export class PIIDataPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataToBeHashed: '',
      hashKey: 'VuSmartMaps PII Data',
      hashedData: '',
      flagToDisplayMessageBelowHashedData: false,
      dataToBeHashedErrorFlag: false,
      dataToBeHashedInputType: 'password',
    };
  }

  //this function is called when user started entering data in the input field
  //and this entered data is stored in the component's state.
  handleDataToBeHashed = (e) => {
    let dataToBeHashedErrorFlag = this.state.dataToBeHashedErrorFlag;

    if (e.target.value === '') {
      dataToBeHashedErrorFlag = true;
    } else {
      dataToBeHashedErrorFlag = false;
    }
    this.setState({
      dataToBeHashed: e.target.value,
      flagToDisplayMessageBelowHashedData: true,
      dataToBeHashedErrorFlag,
    });
  };

  //this function is called when user clicks on the 'Transform' button
  //in this function we use the HmacSHA256 method provided by crypt-js
  //package to convert user entered data to it's equivalent SHA256 hash value.
  //hashKey - is used as key for converting to hash value.
  generateHash = () => {
    // eslint-disable-next-line new-cap
    const hashedData = CryptoJS.HmacSHA256(
      this.state.dataToBeHashed,
      this.state.hashKey
    ).toString(CryptoJS.enc.Hex);
    this.setState({
      hashedData: hashedData,
      flagToDisplayMessageBelowHashedData: false,
    });
  };

  //this function is used to change the type of input when user clicks on the
  //hide or unhide data option.
  hideOrUnhideDataInput = () => {
    let dataToBeHashedInputType = this.state.dataToBeHashedInputType;

    if (dataToBeHashedInputType === 'password') {
      dataToBeHashedInputType = 'text';
    } else {
      dataToBeHashedInputType = 'password';
    }

    this.setState({
      dataToBeHashedInputType,
    });
  };

  //this method is used to copy hashdData to clipboard
  copyToClipBoard = () => {
    navigator.clipboard.writeText(this.state.hashedData);
    notify.info('Copied to Clipboard!');
  }

  render() {
    return (
      <div className="hash-data-page-container">
        <div className="input-section">
          <div className="enter-data-div">
            <div className="enter-data-label">Enter Data :</div>
            <div className="data-input-wrapper">
              <input
                className="data-input"
                type={this.state.dataToBeHashedInputType}
                id="data-input"
                maxLength={128}
                value={this.state.dataToBeHashed}
                onChange={(e) => this.handleDataToBeHashed(e)}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') {
                    this.generateHash();
                  }
                }}
              />
              {this.state.dataToBeHashedInputType === 'password' ? (
                <div
                  className="fa fa-eye-slash hideOrUnhide"
                  onClick={() => this.hideOrUnhideDataInput()}
                />
              ) : (
                <div
                  className="fa fa-eye hideOrUnhide"
                  onClick={() => this.hideOrUnhideDataInput()}
                />
              )}
            </div>
            <div className="error-message">
              {this.state.dataToBeHashedErrorFlag && (
                <span>{`This field cannot be empty.`}</span>
              )}
            </div>
          </div>
          <div className="actions-div">
            <button
              className="hash-button"
              onClick={() => this.generateHash()}
              disabled={this.state.dataToBeHashed === ''}
            >
              Transform
            </button>
          </div>
        </div>
        <div className="output-section">
          <div className="hash-data-div">
            <div className="hash-data-label">Transformed Data :</div>
            <textarea
              className="hashed-data"
              value={this.state.hashedData}
              disabled={true}
            />
            <div className="error-message">
              {this.state.flagToDisplayMessageBelowHashedData &&
                this.state.hashedData !== '' && (
                  <span>{`Input data has changed. Click on 'Transform' button to get latest result.`}</span>
                )}
            </div>
          </div>
          <div className="actions-div">
            <button
              className="copyToClipboard-button"
              onClick={() => this.copyToClipBoard()}
              disabled={this.state.hashedData === ''}
            >
              Copy To Clipboard
            </button>
          </div>
        </div>
      </div>
    );
  }
}
