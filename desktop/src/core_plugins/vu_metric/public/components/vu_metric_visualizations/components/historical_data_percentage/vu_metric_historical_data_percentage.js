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
// import './vu_metric_historical_data_percentage.less'

// This function will be used to create a single historical data block which will consist of the historical data  
// values and perecntage along with the perecentage change values and the trend.
function VuMetricHistoricalDataPercentage(props) {

    const model = props.model;
    const historicalDataObj = props.historicalDataObj;

    let displayIcon = false;
    let displayValue = '';
    if (historicalDataObj.hasOwnProperty('percentageChange')) {
        // When percentage change is -1
        if (historicalDataObj.percentageChange === -1) {
            // When both value and percentage are to be displayed
            // hide the percentage if value is 'N.A.'. This is done to
            // avoid showing "N.A. (N.A.)"
            if (model.enableHistDataValueWithPercentage && historicalDataObj.formattedValue === 'N.A.') {
                displayValue = '';
            } else {
                displayValue = 'N.A.';
            }
            displayIcon = false;

            // This is the case when a table header is received.
            // We set the display value to formattedValue which
            // holds the table 'header'
        } else if (historicalDataObj.percentageChange === 'header') {

            // When both percentage and value is enabled, We do not
            // show the display value to avoid duplicates as shown below:
            // 'Previous Window (Previous Window)'
            if (model.enableHistDataValueWithPercentage) {
                displayValue = '';
            } else {
                displayValue = historicalDataObj.formattedValue;
            }
            displayIcon = false;

            // This is the case when there is no data for a
            // particular metric and we set prepare an empty row
            // with all values as 'N.A.'.
        } else if (historicalDataObj.percentageChange === 'N.A.') {
            displayValue = '';
            displayIcon = false;

        } else {
            displayValue = historicalDataObj.percentageChange;
            displayIcon = true;
        }
    }
    return (
        <span>
            {(model.enableHistDataValueWithPercentage && historicalDataObj.percentageChange != 'header' && historicalDataObj.formattedValue != 'N.A.') ?
                (
                    <span>( </span>
                )
                :
                null

            }
            <span>
                {
                    (displayIcon && !model.enableHistDataValueWithPercentage) ?
                        (

                            <i className={"vumetric-horizontal-table-historical-data-value-icon fa " + historicalDataObj.icon}
                                aria-hidden="true">
                            </i>
                        )
                        :
                        null
                }
                <span>
                    {displayValue}
                    {
                        displayIcon ?
                            (
                                <span>%</span>
                            )
                            :
                            null
                    }
                </span>
            </span>
            {
                (model.enableHistDataValueWithPercentage && historicalDataObj.percentageChange != 'header' && historicalDataObj.formattedValue != 'N.A.') ?
                    (
                        <span>
                            )
                        </span>
                    )
                    :
                    null
            }
        </span>
    )
}
VuMetricHistoricalDataPercentage.propTypes = {
    model: PropTypes.object, //  This is the parameters object 
    historicalDataObj: PropTypes.object, // This is historical data object values which will be shown.
};

export default VuMetricHistoricalDataPercentage;