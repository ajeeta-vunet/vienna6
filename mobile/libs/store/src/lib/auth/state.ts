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
 * State for loginForm
 *
 * @export
 * @interface LoginFormState
 */
export interface LoginFormState {
  // Username provided by end user in LoginForm Component
  name: string;
  // Password provided by end user in LoginForm Component
  password: string;
  // Captcha Key from backend
  captchaKey:'no_captcha'| string;
  // Captcha value solved by user
  captchaSolution: string;
  // Captcha value solved by user
  captchaImage: string;
  // Store error recieved from Backend
  errors: any;
  // Set if user click login button, reset after request complete
  isLoading: boolean;
  // terminate active session
  terminate_active_session?: boolean;
}
