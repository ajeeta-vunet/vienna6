/** 
 * ------------------------- NOTICE ------------------------------- 
 *
 *                  CONFIDENTIAL INFORMATION                       
 *                  ------------------------                       
 *    This Document contains Confidential Information or           
 *    Trade Secrets, or both, which are the property of VuNet      
 *    Systems Ltd.  This document may not be copied, reproduced,   
 *    reduced to any electronic medium or machine readable form    
 *    or otherwise duplicated and the information herein may not   
 *    be used, disseminated or otherwise disclosed, except with    
 *    the prior written consent of VuNet Systems Ltd.              
 *                                                                 
 *------------------------- NOTICE ------------------------------- 

 * Copyright 2020 VuNet Systems Ltd.
 * All rights reserved.
 * Use of copyright notice does not imply publication.
*/

/**
 * Vibration Patterns
 *
 * @export VibrationPattern
 * @enum {number}
 */
export enum VibrationPattern {
  NavigationSuccess,
  NavigationNotFulfiled,
}

/**
 * API to vibrate user's Phone
 *
 * @export
 * @param {VibrationPattern} p Vibration Pattern
 */
export const vibrate = (p: VibrationPattern) => {
  if (navigator.vibrate) {
    switch (p) {
      case VibrationPattern.NavigationSuccess:
        window.navigator.vibrate([100]);
        break;
      case VibrationPattern.NavigationNotFulfiled:
        window.navigator.vibrate([75, 50, 75]);
        break;
    }
  }
};
export default vibrate;
