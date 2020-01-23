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

import React from 'react';
import _ from 'lodash';
import { BaseVisualization, ViewDashboardProp } from '../base-component';
import { VisShell } from '../shell/shell';
import { BMV_MAX_ROWS } from './config';
import { Link } from 'react-router-dom';
import { ExpandedVisualizationUrl } from '@vu/colombo-lib';

/**
 * BMV Table Visualization
 *
 * @export
 * @class BMVTable
 * @extends {(BaseVisualization<TableProps & ViewDashboardProp>)}
 */
export class BMVTable extends BaseVisualization<ViewDashboardProp> {
  render() {
    if (this.props.data.type !== 'kpi') {
      return null;
    }
    const metricsArray = Object.keys(this.props.data.metrics).map((key) => ({
      _displayName: key,
      ...(this.props.data as any).metrics[key],
    }));
    const histKeys = _.uniq(_.flattenDeep(metricsArray.map((a) => a.historicalData || [])).map((a) => a.label));
    return (
      <VisShell {...this.props}>
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>
                  <b>Metric {/* <FontAwesomeIcon icon={faSort} /> */}</b>
                </th>
                <th>
                  <b>Value</b>
                </th>
                {histKeys.map((hk, hi) => (
                  <th key={hi}>
                    <b>{hk}</b>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metricsArray.slice(0, BMV_MAX_ROWS).map((v, i) => {
                return (
                  <tr key={i}>
                    <td>{v._displayName}</td>
                    <td style={{ color: v.color ? v.color : '' }}>{v.formattedValue}</td>
                    {histKeys.map((ha, hi) => {
                      const hk = v.historicalData.find((a) => a.label === ha);
                      return hk ? (
                        <td key={hi} style={{ color: hk.color }}>
                          {hk.percentageChange > 0 ? '+' : null}
                          {hk.percentageChange}%
                        </td>
                      ) : (
                        <td>NA</td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            {metricsArray.length > BMV_MAX_ROWS && !this.props.full ? (
              <tfoot>
                <tr>
                  <td className="text-center text-link" colSpan={100}>
                    <Link
                      to={ExpandedVisualizationUrl(this.props.dashboard.dashboardId,this.props.dashboard.key)}
                      className="card-v4 text-link"
                    >
                      Readmore
                    </Link>
                  </td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
      </VisShell>
    );
  }
}
