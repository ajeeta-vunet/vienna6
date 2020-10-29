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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../additional_information/additional_information_tab.less'
import ActionButtons from './components/action_buttons'
import HistoricalData from './components/historical_data'

class AdditionalInformationTab extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="additional-information-tab-container">
        <div className="additional-information-description">
          Configure additional display contents and information.
        </div>

        <HistoricalData
          model={this.props.model}
          onChange={this.props.onChange}
        />

        <ActionButtons
          model={this.props.model}
          onChange={this.props.onChange}
        />

      </div >
    );
  }
}


AdditionalInformationTab.propTypes = {
  model: PropTypes.object, //  This is the parameters object 
  onChange: PropTypes.func, // This is the callback function for form changes to update the latest model to state
};

export default AdditionalInformationTab;