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
import _, { flow, add } from 'lodash';
import { BaseVisualization, ViewDashboardProp, ExpandedVisualizationUrl } from '../base-component';
import { VisShell } from '../shell/shell';
import { BMV_MAX_ROWS } from './config';
import { Link } from 'react-router-dom';

/**
 * BMV Table Visualization
 *
 * @export
 * @class BMVTable
 * @extends {(BaseVisualization<TableProps & ViewDashboardProp>)}
 */
export class BMVTable extends BaseVisualization<ViewDashboardProp> {
  /**
   * Constructor
   * @param props Props
   */
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    if (this.state.error) {
      return this.errorVis();
    }
    if (this.props.data.type !== 'kpi') {
      return null;
    }
    const histKeys = _.uniq(
      _.flattenDeep(this.props.data.metrics.map((a) => a.historicalData || [])).map((a) => a.label),
    );
    return (
      <VisShell {...this.props}>
        <div className="table-responsive">
          {this.props.data.metrics.length === 0 ? (
            <h1 className="text-center py-5">No data</h1>
          ) : (
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
                {this.props.data.metrics.slice(0, BMV_MAX_ROWS).map((v, i) => {
                  return (
                    <tr key={i}>
                      <td>{v.label}</td>
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
              {this.props.data.metrics.length > BMV_MAX_ROWS && !this.props.full ? (
                <tfoot>
                  <tr>
                    <td className="text-center text-link" colSpan={100}>
                      <Link
                        to={ExpandedVisualizationUrl(this.props.dashboard.dashboardId, this.props.dashboard.key)}
                        className="card-v4 text-link"
                      >
                        Readmore
                      </Link>
                    </td>
                  </tr>
                </tfoot>
              ) : null}
            </table>
          )}
        </div>
      </VisShell>
    );
  }
}
