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
export enum TimeRangeEnum {
  TIME_RANGE_LAST_15_MIN = 'TIME_RANGE_LAST_15_MIN',
  TIME_RANGE_LAST_1_HOUR = 'TIME_RANGE_LAST_1_HOUR',
  TIME_RANGE_LAST_4_HOUR = 'TIME_RANGE_LAST_4_HOUR',
  TIME_RANGE_LAST_12_HOUR = 'TIME_RANGE_LAST_12_HOUR',
  TIME_RANGE_LAST_24_HOUR = 'TIME_RANGE_LAST_24_HOUR',
  TIME_RANGE_LAST_7_DAYS = 'TIME_RANGE_LAST_7_DAYS',
  TIME_RANGE_LAST_MONTH = 'TIME_RANGE_LAST_MONTH',
  TIME_RANGE_LAST_YEAR = 'TIME_RANGE_LAST_YEAR',
  TIME_RANGE_TODAY = 'TIME_RANGE_TODAY',
  TIME_RANGE_YESTERDAY = 'TIME_RANGE_YESTERDAY',
  TIME_RANGE_DAYBEFORE_YESTERDAY = 'TIME_RANGE_DAYBEFORE_YESTERDAY',
  TIME_RANGE_WEEK = 'TIME_RANGE_WEEK',
  TIME_RANGE_MONTH = 'TIME_RANGE_MONTH',
  TIME_RANGE_YEAR = 'TIME_RANGE_YEAR',
  TIME_SET_START = 'TIME_SET_START',
  TIME_SET_END = 'TIME_SET_END',
}
export type CustomStartTimeRangeAction = {
  type: TimeRangeEnum.TIME_SET_START;
  start: Date;
  title: string;
};
export type CustomEndTimeRangeAction = {
  type: TimeRangeEnum.TIME_SET_END;
  end: Date;
  title: string;
};

/**
 * Type for Time Range Actions
 *
 * @export
 * @interface TimeRangeAction
 */
export interface TimeRangeAction {
  type:
    | TimeRangeEnum.TIME_RANGE_LAST_15_MIN
    | TimeRangeEnum.TIME_RANGE_LAST_1_HOUR
    | TimeRangeEnum.TIME_RANGE_LAST_4_HOUR
    | TimeRangeEnum.TIME_RANGE_LAST_12_HOUR
    | TimeRangeEnum.TIME_RANGE_LAST_24_HOUR
    | TimeRangeEnum.TIME_RANGE_LAST_7_DAYS
    | TimeRangeEnum.TIME_RANGE_LAST_MONTH
    | TimeRangeEnum.TIME_RANGE_LAST_YEAR
    | TimeRangeEnum.TIME_RANGE_TODAY
    | TimeRangeEnum.TIME_RANGE_YESTERDAY
    | TimeRangeEnum.TIME_RANGE_DAYBEFORE_YESTERDAY
    | TimeRangeEnum.TIME_RANGE_WEEK
    | TimeRangeEnum.TIME_RANGE_MONTH
    | TimeRangeEnum.TIME_RANGE_YEAR;
}
export type TimeRangeActions = TimeRangeAction | CustomEndTimeRangeAction | CustomStartTimeRangeAction;
