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
 * Resources file, will store constants used in the app
 */
export const DashboardsUrl = () =>  '/dashboard';
export const ViewDashboards = (dashboardId: string = ':dashboardId') => `${DashboardsUrl()}/${dashboardId}`;
export const ExpandedVisualizationUrl =  (dashboardId: string = ':dashboardId', visId: string = ':visId') => `${ViewDashboards(dashboardId)}/${visId}`;
export const Colors = {
  Primary: '#B30984',
  Warning: '#ffbc34',
};

/**
 * This contains the path where all images/assets will be located
 *
 * @export
 * @class ColomboConfig
 */
export class ColomboConfig{
  static _assetPath : string;
  static get assetsPath() : string {
    return this._assetPath;
  }
  static set assetsPath(v : string) {
    this._assetPath = v;
  }
}
