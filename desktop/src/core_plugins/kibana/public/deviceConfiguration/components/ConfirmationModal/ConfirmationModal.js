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
import './ConfirmationModal.less';
import { VunetButton } from 'ui_framework/src/vunet_components/vunet_button/vunet_button';

export function ConfirmationModal(props) {
  return(
    <div className="dcm-confirmation-modal">
      <div className="dcm-confirmation-wrapper">

        <div className="dcm-confirmation-title">Confirm {props.action}</div>
        <hr/>

        <div className="dcm-confirmation-content">{props.confirmationMessage}</div>

        <div className="dcm-confirmation-actions">
          <VunetButton
            className="secondary"
            data-text="Cancel"
            id="delete-cancel"
            onClick={props.cancelAction}
          />
          <VunetButton
            className="primary dcm-confirmation-submit"
            data-text={props.confirmButtonText}
            id="delete-submit"
            onClick={props.confirmAction}
          />
        </div>
      </div>
    </div>
  );
}