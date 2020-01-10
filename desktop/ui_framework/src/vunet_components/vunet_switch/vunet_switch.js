
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

// Copyright 2019 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React from 'react';
import Switch from 'react-switch';
import PropTypes from 'prop-types';

// This component works like a checkbox with the look and feel of a switch that can be toggled.
// We have built a wrapper on top of react-switch( a npm package). This component mainly takes two
// props:
// checked: PropTypes.bool, // Indicate if switch is in ON or OFF
// onChange: PropTypes.func // Call back function to be called on toggle
export function VunetSwitch(props) {

  return (
    <Switch
      onChange={props.onChange}
      checked={props.checked}
      checkedIcon={false}
      uncheckedIcon={false}
      height={14}
      width={28}
      onColor={'#5a4fef'}
      onHandleColor={'#f1f1f1'}
    />
  );
}

VunetSwitch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func
};