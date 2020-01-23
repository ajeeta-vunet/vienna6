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
 *
 * Copyright 2020 VuNet Systems Ltd.
 * All rights reserved.
 * Use of copyright notice does not imply publication.
 */


import { HistoricalDatum } from './HistoricalDatum';
import { Threshold } from './Threshold';
import { Viewmore } from './Viewmore';
export type Metric = {
  success: boolean;
  historicalData: HistoricalDatum[];
  metricIcon: string;
  threshold: Threshold[];
  groupName: string;
  status: number;
  Enable_Background_Theme: boolean;
  color: string;
  view_more: Viewmore;
  description: string;
  label: string;
  formattedValue: string;
  visualization_name: string;
  visualization_type: string;
  insights: string;
  value: number;
};
