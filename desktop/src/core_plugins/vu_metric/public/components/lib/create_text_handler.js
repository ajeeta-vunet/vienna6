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

import _ from 'lodash';
import { detectIE } from 'ui/utils/detect_ie';

// Thiis handler will be used to detect the change in all text boxes i.e text inputs and 
// it will return the current value in text box and the index which is passed to it.
export default (handleChange) => {
  return (name, index) => (e) => {
    // IE preventDefault breaks input, but we still need to prevent enter from being pressed
    if (!detectIE() || e.keyCode === 13) e.preventDefault();

    const value = _.get(e, 'target.value');
    if (_.isFunction(handleChange)) {
      return handleChange({ [name]: value }, index);
    }
  };
};