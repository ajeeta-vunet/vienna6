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

export enum AlertActionEnum {
  LOAD_ALERTS = 'LOAD_ALERTS',
  LOAD_ALERTS_SUCCESS = 'LOAD_ALERTS_SUCCESS',
  LOAD_ALERTS_FAIL = 'LOAD_ALERTS_FAIL',
  SET_FILTER = 'SET_FILTER',
}

export type AlertLoadAction = {
  type: AlertActionEnum.LOAD_ALERTS;
};

export type AlertLoadSuccessAction = {
  type: AlertActionEnum.LOAD_ALERTS_SUCCESS;
  data: Alert[];
};

export type AlertLoadFailAction = {
  type: AlertActionEnum.LOAD_ALERTS_FAIL;
  error: string | string[] | unknown;
};
export type SeverityValues = 'critical' | 'error' | 'information' | 'warning' | '*';
export type AlertSetFilterAction = {
  type: AlertActionEnum.SET_FILTER;
  filter: SeverityValues;
};

export type AlertActions = AlertLoadAction | AlertLoadSuccessAction | AlertLoadFailAction | AlertSetFilterAction;
export interface ListOfEvent {
  List_of_events: Alert[];
}

export interface Alert {
  summary: string;
  alarm_state: string;
  status: string;
  tags: string;
  '@timestamp': Date;
  severity: string;
  id: string;
  duration: number;
  type: string;
  History: History[];
  Similar_Events_Count: number;
  timestamp: Date;
  start_time: Date;
  description: string;
}

export interface History {
  'Event Count': number;
  'Active For': number;
  name: string;
}

export interface AlertDetails {
  summary: string;
  start_time: string;
  History: History2[];
  duration: number;
  alert_id: string;
  'risk-score': number;
  'Alert-Rule-Name': string;
  doc_type: string;
  'Enterprise Name': string;
  alarm_state: string;
  group_fields: string[];
  timestamp: Date;
  Day: string;
  tags: string[];
  severity: string;
  description: string;
  Type: string;
  rules: Rule[];
}

interface Rule {
  metrics: Metric[];
  name: string;
  rule_index: string;
  status: string;
}
interface History2 {
  "Active For": number;
  name: string;
  "Event Count": number;
}

interface Metric {
  value_for_eval_duration: number;
  value_for_event_duration: number;
  insights: string;
  formatted_value_for_eval_duration: string;
  matched_threshold: Matchedthreshold;
  color: string;
  field: string;
  label: string;
  formatted_value_for_event_duration: string;
  metric_index: string;
  type: string;
}

interface Matchedthreshold {
  comparison: string;
  value: number;
}
