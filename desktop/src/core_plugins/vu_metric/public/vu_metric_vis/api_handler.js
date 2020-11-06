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

import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { addSearchStringForUserRole } from 'ui/utils/add_search_string_for_user_role.js';

const chrome = require('ui/chrome');

// This handler will be used to prepare the payload to be sent to the api and then will make the api call to fetch the latest 
// values to be shown in the visualization
const MetricsRequestGeneratorProviderForVuMetric = function (Private, Notifier, timefilter, $http, $filter, getAppState) {
  const dashboardContext = Private(dashboardContextProvider);
  const notify = new Notifier({ location: 'vuMetrics' });
  const urlBase = chrome.getUrlBase();

  return {
    name: 'vu-metrics',
    handler: function (vis) {
      return new Promise((resolve) => {
        const timeDuration = timefilter.getBounds();
        const timeDurationStart = timeDuration.min.valueOf();
        const timeDurationEnd = timeDuration.max.valueOf();
        const params = vis.params;

        /* Here we are injecting all the angular dependency injections used. This includes the following:-
        1. Private, getAppState and timefilter are needed for the Reference Link scenarios.
        2. $filter will be used in the case of getting filters for saved search when metric is based on Saved Search.
        3. config will be used to get the configuration from Manage Resources-> Advanced Settings . Specifically we need to get
           the dateFormat config so that all the timestamp values can be represented in the configured format.This config is anyhow
           being injected from editor controller and it is available in both configuration page nad dashboards.
        */
        vis.angularInjectables = {
          Private: Private,
          timefilter: timefilter,
          getAppState: getAppState,
          filter: $filter
        }


        if (params && params.metrics[0].index.title != '') {

          // Preparing historical data to be sent to api , we save shift value and shift unti separately but we need to send them
          // combined to the backend.
          let historicalData = []
          _.each(params.historicalData, function (historicalDataObj) {
            const newHistoricalDataObj = {};
            newHistoricalDataObj.label = historicalDataObj.label;

            if (historicalDataObj.timeshiftMetric !== '') {
              newHistoricalDataObj.type = 'timeshift';
              if (historicalDataObj.timeshiftMetric !== 'Custom configuration') {
                newHistoricalDataObj.value = historicalDataObj.timeshiftMetric;
              } else {
                newHistoricalDataObj.value = historicalDataObj.shiftValue + historicalDataObj.shiftUnit;
              }
            } else {
              newHistoricalDataObj.type = 'interval';
              newHistoricalDataObj.value = historicalDataObj.intervalMetric;
            }
            historicalData.push(newHistoricalDataObj);
          });

          // This is used to set the metricListIndex of each metric
          _.each(params.metrics, function (metric) {
            let metricListIndexForMetric = _.indexOf(params.metrics, metric);
            metric.metricListIndex = metricListIndexForMetric;
          })


          // Preparing thresholds data to be sent to api , we save interval value and interval unit separately but we need to send them
          // combined to the backend.
          let metricsForPayload = _.cloneDeep(params.metrics)
          _.each(metricsForPayload, function (metric) {
            if (metric.threshold && metric.threshold.length >= 1) {
              _.each(metric.threshold, function (singleThreshold) {
                if (singleThreshold.interval === undefined) {
                  singleThreshold.interval = '';
                }
                else {
                  singleThreshold.interval = singleThreshold.interval + singleThreshold.intervalUnit;
                }

                // This is being done because we store max value as valueMax for comparison type range but we need to sent it as value 
                // to the backend
                if (singleThreshold.comparison === "Range") {
                  singleThreshold.value = singleThreshold.valueMax;
                  delete singleThreshold.valueMax;
                }

                // We do not need to send the intervalUnit and the label to the backend hence deleting the same
                delete singleThreshold.intervalUnit;
                delete singleThreshold.label;
              })
            }

            // We are doing this because in case of field type is string we need to send valueStr instead of value to the backend
            if (metric.fieldType === 'string') {
              if (metric.threshold.length >= 1) {
                _.each(metric.threshold, function (singleThreshold) {
                  singleThreshold.valueStr = singleThreshold.value;
                  singleThreshold.value = null;
                  singleThreshold.valueMax = null;
                });
              }
            }
          })


          // metricsForPayload contains all the fields used in saved configuration but we do not need to send all the fields
          // to thebackend hence we are filtering the fields we do not need to send to the backend and we only send the 
          // fields required by t he backend. finalMetricsForPayload will only include the key value pairs needed by the backend
          // Apart from this we may have all these fields for newly configured Vu-metric , but the saved configurations of the old
          // BMV may not contains all the fields required by backend hence the same. 
          let finalMetricsForPayload = [];

          metricsForPayload.map((metric) => {
            let metricArg = metric.metricArg;
            let metricType = metric.type;
            // Median is nothing but 50th percentile.
            // So if the selected metric type is median then
            // send 50 as percents always
            if (metric.type === 'median') {
              metricType = 'percentiles';
              metricArg = '50';
            }
            if (metricType !== 'percentiles') {
              metricArg = '';
            }

            finalMetricsForPayload.push({
              metricListIndex: metric.metricListIndex,
              index: metric.index,
              label: metric.label,
              metricGroup: metric.groupName || '',
              metricType: metricType || '',
              metricArg: metricArg || '',
              field: metric.field || '',
              fieldType: metric.fieldType || '',
              advancedConfig: metric.advancedConfig || '',
              hideMetric: metric.hideMetric || false,
              scripted: metric.scripted || false,
              filter: metric.filter || '*',
              savedSearchFilter: metric.savedSearchFilter,
              enableAutoBaselining: metric.enableAutoBaseLining || false,
              intervalMetric: metric.intervalMetric,
              additionalFields: metric.additionalFields || '',
              threshold: metric.threshold || [],
              format: metric.format || ''
            })
          })


          let esFilter = dashboardContext();

          //Get the search string assigned to the logged-in user's role.
          esFilter = addSearchStringForUserRole(esFilter);

          const payload = {
            metrics: finalMetricsForPayload,
            historicalData: historicalData,
            aggregations: params.aggregations ? params.aggregations : [],
            time: {
              'gte': timeDurationStart,
              'lte': timeDurationEnd
            },
            esFilter: esFilter
          };
          
          const httpResult = $http.post(urlBase + '/metric/', payload)
            .then(resp => resp.data)
            .catch(resp => { throw resp.data; });

          return httpResult
            .then(resolve)
            .catch(resp => {
              resolve([]);
              const err = new Error(resp.message);
              err.stack = resp.stack;
              notify.error(err);
            });

        }
        else {
          return resolve([]);
        }
      });
    }
  };
};

export { MetricsRequestGeneratorProviderForVuMetric };