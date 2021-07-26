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
import './DeleteConfirmationModal.less';
import { VunetButton } from 'ui_framework/src/vunet_components/vunet_button/vunet_button';

export function DeleteConfirmationModal(props) {
  return(
    <div className="dcm-delete-modal">
      <div className="dcm-delete-wrapper">

        <div className="dcm-delete-title">Delete device</div>
        <hr/>

        <div className="dcm-delete-content">{props.confirmationMessage}</div>

        <div className="dcm-delete-actions">
          <VunetButton
            className="secondary delete-cancel"
            text="Cancel"
            id="delete-cancel"
            onClick={props.cancelDeleteOperation}
          />
          <VunetButton
            className="primary dcm-delete-submit"
            text="Yes, Delete"
            id="delete-submit"
            onClick={props.deleteDevice}
          />
        </div>
      </div>
    </div>
  );
}