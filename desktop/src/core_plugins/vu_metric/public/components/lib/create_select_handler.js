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

// Thiis handler will be used to detect the change in all select input boxes and it
//  willreturn the current value in select box and the index which is passed to it.
import _ from 'lodash';
export default (handleChange) => {
  return (name, index) => (e) => {
    const value = _.get(e, 'target.value');
    if (_.isFunction(handleChange)) {
      return handleChange(
        { [name]: value }, index);
    }
  };
};
