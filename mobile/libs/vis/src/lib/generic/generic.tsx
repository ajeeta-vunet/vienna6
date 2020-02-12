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

import React from 'react';
import { BaseVisualization, ViewDashboardProp } from '../base-component';
import { VisShell } from '../shell/shell';

/**
 * Display the JSON Data in development environment only
 *
 * @export
 * @class GenericVisualization
 * @extends {(BaseVisualization<{ data: any } & ViewDashboardProp>)}
 */
export class GenericVisualization extends BaseVisualization<{ data: any } & ViewDashboardProp> {
  render() {
    return <VisShell {...this.props}>{JSON.stringify(this.props.data)}</VisShell>;
  }
}
