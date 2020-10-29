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

import PropTypes from 'prop-types';
import React from 'react';
import { vuMetricConstants } from '../../../lib/vu_metric_constants';
import './vu_metric_historical_data.less'

// This function will be used to create a single historical data block which will consist of the historical data  
// values and perecntage along with the perecentage change values and the trend.
function VuMetricHistoricalData(props) {

  const model = props.model;
  const historicalDataObj = props.historicalDataObj;
  const indexForMetric = props.indexForMetric;

  return (
    <div className="historical-data-values-and-trend-container">
      {(!model.enableHistDataPercentage || model.enableHistDataValueWithPercentage) ?
        (
          <div
            className="historical-data-value"
          >
            {historicalDataObj.formattedValue}
          </div>
        )
        :
        null
      }
      {/* This is the case either when percentageChange of historical data is enabled and Historical Data Value With Percentage is also enbaled or 
       only just percentageChangeis enable and percentageChange is not -1 or header  */}
      {(model.enableHistDataPercentage && model.enableHistDataValueWithPercentage && historicalDataObj.percentageChange !== -1 && historicalDataObj.percentageChange !== 'header')
        || (!model.enableHistDataPercentage && model.enableHistDataValueWithPercentage && historicalDataObj.percentageChange !== -1 && historicalDataObj.percentageChange !== 'header') ?
        (
          <div className="historical-data-value-perecnt">
            ({historicalDataObj.percentageChange}%)
        </div>
        )
        :
        null
      }
      {/* This is the case when only percentageChange of historical data is enabled and HistDataValue With Percentage is off  and percentageChange is not -1 or header  */}
      {(model.enableHistDataPercentage && !model.enableHistDataValueWithPercentage && historicalDataObj.percentageChange !== -1 && historicalDataObj.percentageChange !== 'header') ?
        (
          <div className="historical-data-value-perecnt">
            {historicalDataObj.percentageChange}%
        </div>
        )
        :
        null
      }
      {(model.enableHistDataPercentage && !model.enableHistDataValueWithPercentage && historicalDataObj.percentageChange === -1 && historicalDataObj.percentageChange !== 'header' && historicalDataObj.formattedValue !== 'N.A.') ?
        (
          <div
            className="historical-data-value-perecnt"
            style={model.metrics[indexForMetric].bgColorEnabled ? { color: vuMetricConstants.COLOR_CONSTANTS.WHITE } : { color: vuMetricConstants.COLOR_CONSTANTS.GREY }}>
            N.A.
        </div>
        )
        :
        null
      }
      {(model.enableHistDataPercentage && model.enableHistDataValueWithPercentage && historicalDataObj.percentageChange === -1 && historicalDataObj.percentageChange !== 'header' && historicalDataObj.formattedValue !== 'N.A.')
        || (!model.enableHistDataPercentage && model.enableHistDataValueWithPercentage && historicalDataObj.percentageChange === -1 && historicalDataObj.percentageChange !== 'header' && historicalDataObj.formattedValue !== 'N.A.') ?
        (
          <div
            className="historical-data-value-perecnt"
            style={model.metrics[indexForMetric].bgColorEnabled ? { color: vuMetricConstants.COLOR_CONSTANTS.WHITE } : { color: vuMetricConstants.COLOR_CONSTANTS.GREY }}>
            (N.A.)
        </div>
        )
        :
        null
      }
      {(historicalDataObj.formattedValue === 'N.A.' || historicalDataObj.percentageChange === -1 || historicalDataObj.percentageChange === 'header' || historicalDataObj.percentageChange === 0) ?
        null
        :
        (
          <div className="historical-data-trend" >
            <i
              className={historicalDataObj.icon == 'fa-caret-up' ? 'icon-triangle-up' : 'icon-triangle-down'}
              style={model.metrics[indexForMetric].bgColorEnabled ? { color: vuMetricConstants.COLOR_CONSTANTS.WHITE } : {}}>
            </i>
          </div>
        )
      }

    </div>
  )
}
VuMetricHistoricalData.propTypes = {
  model: PropTypes.object, //  This is the parameters object 
  historicalDataObj: PropTypes.object, // This is historical data object values which will be shown.
  indexForMetric: PropTypes.number // This is the index of the metric for which historical data has to e generated
};

export default VuMetricHistoricalData;