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

import { TimeRangeActions, TimeRangeEnum } from '../action/types';
import { Reducer } from 'react';
import { MillisecondsInOne } from '@vu/utils';
import { map } from 'lodash';

export type TimeRangeStore = {timerange:TimeRangeState}
export type TimeRangeState = { start: Date; end: Date; display: string };

/**
 * This is the main reducer
 * Because of cyclic reference we declared this at top.
 * @param state
 * @param action
 */
const stateReducer = (state: TimeRangeState, action: TimeRangeActions): TimeRangeState => {
  const now = new Date();
  let start = new Date();
  let end = new Date();
  const day = now.getDay();
  switch (action.type) {
    case TimeRangeEnum.TIME_RANGE_LAST_15_MIN:
      return {
        start: new Date(now.getTime() - 15 * MillisecondsInOne.MINUTE),
        end: end,
        display: 'Last 15 min',
      };
    case TimeRangeEnum.TIME_RANGE_LAST_1_HOUR:
      return {
        start: new Date(now.getTime() - MillisecondsInOne.HOUR),
        end: end,
        display: 'Last hour',
      };
    case TimeRangeEnum.TIME_RANGE_LAST_4_HOUR:
      return {
        start: new Date(now.getTime() - 4 * MillisecondsInOne.HOUR),
        end: end,
        display: 'Last 4 hour',
      };
    case TimeRangeEnum.TIME_RANGE_LAST_12_HOUR:
      return {
        start: new Date(now.getTime() - 12 * MillisecondsInOne.HOUR),
        end: end,
        display: 'Last 12 hour',
      };
    case TimeRangeEnum.TIME_RANGE_LAST_24_HOUR:
      return {
        start: new Date(now.getTime() - MillisecondsInOne.DAY),
        end: end,
        display: 'Last 24 hour',
      };
    case TimeRangeEnum.TIME_RANGE_LAST_7_DAYS:
      return {
        start: new Date(now.getTime() - 7 * MillisecondsInOne.DAY),
        end: end,
        display: 'Last 7 Days',
      };
    case TimeRangeEnum.TIME_RANGE_MONTH:
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: end,
        display: 'This Month',
      };
    case TimeRangeEnum.TIME_RANGE_LAST_MONTH:
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        end: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        display: 'Last Month',
      };
    case TimeRangeEnum.TIME_RANGE_TODAY:
      return {
        start: new Date(start.setHours(0, 0, 0, 0)),
        end: end,
        display: 'Today',
      };
    case TimeRangeEnum.TIME_RANGE_WEEK:
      return {
        start: new Date(start.setDate(now.getDate() - day + (day === 0 ? -6 : 1))),
        end: end,
        display: 'This Week',
      };
    case TimeRangeEnum.TIME_RANGE_YESTERDAY:
      start = new Date(now.getTime() - MillisecondsInOne.DAY);
      end = new Date(now.getTime() - MillisecondsInOne.DAY);
      return {
        start: new Date(start.setHours(0, 0, 0, 0)),
        end: new Date(end.setHours(23, 59, 59, 999)),
        display: 'Yesterday',
      };
    case TimeRangeEnum.TIME_RANGE_DAYBEFORE_YESTERDAY:
      start = new Date(now.getTime() - 2 * MillisecondsInOne.DAY);
      end = new Date(now.getTime() - 2 * MillisecondsInOne.DAY);
      return {
        start: new Date(start.setHours(0, 0, 0)),
        end: new Date(end.setHours(23, 59, 59, 999)),
        display: 'Day before yesterday',
      };
    case TimeRangeEnum.TIME_RANGE_YEAR:
      return {
        start: new Date(now.getFullYear(), 0, 1, 0, 0, 0),
        end: end,
        display: 'This Year',
      };
    case TimeRangeEnum.TIME_RANGE_LAST_YEAR:
      return {
        start: new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0),
        end: new Date(now.getFullYear(), 0, 1, 0, 0, 0),
        display: 'This Year',
      };
    case TimeRangeEnum.TIME_SET_START:
      return {
        ...state,
        start: new Date(action.start),
        display: action.title,
      };
    case TimeRangeEnum.TIME_SET_END:
      return {
        ...state,
        end: new Date(action.end),
        display: action.title,
      };
    default:
      return state;
  }
};

const TimeRanges = map(TimeRangeEnum, (_, value) => value);
const nowDate = new Date();
const Key4TimeAction = 'TimeRangeAction';
const Key4TimeValue = 'TimeRangeValue';
/**
 * This is a layer above the default reducer initial value, this will try loading value from localStorage
 *
 * @param defaultValue Default Value
 */
const tryLoadTime = (defaultValue?: TimeRangeState): TimeRangeState => {
  const lastTime = localStorage.getItem(Key4TimeAction);
  const lastValue = localStorage.getItem(Key4TimeValue);

  // Try getting previous time
  let val: TimeRangeState;
  try {
    if (lastValue) {
      /**
       * JSON parsing is not sufficient for date types
       * so we are parsing date again
       */
      const val2 = JSON.parse(lastValue) as TimeRangeState;
      val = { display: val2.display, end: new Date(val2.end), start: new Date(val2.end) };
    }
  } catch {
  }
  val = val || {
    start: new Date(nowDate.getTime() - 15 * MillisecondsInOne.MINUTE),
    end: nowDate,
    display: 'Last 15 min',
  };
  try {
    if (lastTime) {
      return stateReducer(val, JSON.parse(lastTime) as TimeRangeActions);
    } else return val;
  } catch (ex) {
    return val;
  }
};
export const TimeRangeInitialState: TimeRangeState = tryLoadTime();
export const isValidTimeAction = (action: { type: string }): boolean => {
  return TimeRanges.findIndex((a) => a === action.type) !== -1;
};
export /**
 * We have a reducer on top of file because we want to call it to initialize state
 * that was creating a circular dependency. So we refactored functionality to top of file.
 *
 * @param {*} [state=TimeRangeInitialState]
 * @param {*} action
 * @returns TimeRangeStates
 */
const TimeRangeReducer: Reducer<TimeRangeState, TimeRangeActions> = (state = TimeRangeInitialState, action) => {
  if (isValidTimeAction(action)) {
    localStorage.setItem(Key4TimeAction, JSON.stringify(action));
  }
  const retVal = stateReducer(state, action);
  if (isValidTimeAction(action)) {
    localStorage.setItem(Key4TimeValue, JSON.stringify(retVal));
  }
  return retVal;
};
