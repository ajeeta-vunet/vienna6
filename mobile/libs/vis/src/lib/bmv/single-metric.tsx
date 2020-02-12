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

import React from 'react';
import { CardBody, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp, faEquals, faDotCircle } from '@fortawesome/free-solid-svg-icons';
import { BaseVisualization, ViewDashboardProp } from '../base-component';
import { VisShell } from '../shell/shell';
import { ColomboConfig, Colors } from '@vu/colombo-lib';
import { getImage } from '@vu/utils';
/**
 * Displays a single metric BMV
 *
 * @export
 * @class BMVSingleMetric
 * @extends {(BaseVisualization<BMVProps & ViewDashboardProp>)}
 */
export class BMVSingleMetric extends BaseVisualization<ViewDashboardProp> {
  render = () => {
    if (this.props.data.type !== 'kpi') {
      return null;
    }
    const metricDataKey = Object.keys(this.props.data.metrics)[0];
    const metricData = this.props.data.metrics[metricDataKey];
    return (
      <VisShell {...this.props}>
        <CardBody className="pt-2">
          <div className="row">
            <div className={(this.props.full ? 'col-12' : 'col-5') + ' image-half'}>
              <div className="icon-container d-flex">
                <img
                  src={
                    metricData.metricIcon ? getImage(metricData.metricIcon) : ColomboConfig.assetsPath + 'Icon_03.svg'
                  }
                  alt={metricData.visualization_name}
                />
              </div>
            </div>
            <div className={(this.props.full ? 'col-12' : 'col-7') + ' info-half'}>
              <div className="text-secondary card-v1" title={metricData.label}>
                {metricData.label}
              </div>
              <div
                className={(this.props.full ? '' : 'text-truncate') + ' card-v2'}
                title={metricData.formattedValue}
                style={{ color: metricData.color }}
              >
                {metricData.formattedValue}
              </div>
              <div
                title={metricData.description}
                className={(this.props.full ? '' : 'text-truncate') + ' card-v3'}
                style={{ color: metricData.color }}
              >
                {metricData.insights}
              </div>{' '}
            </div>
          </div>
          {this.props.full ? (
            <Row className="mt-3">
              {(metricData.historicalData || []).map((v, i) => (
                <Col key={i} className="text-center bmv-historical">
                  <div
                    className="his-value"
                    style={{
                      color: v.color || Colors.Primary,
                    }}
                  >
                    {v.formattedValue}
                  </div>
                  <div className="his-label">
                    <FontAwesomeIcon
                      className="mr-1"
                      style={{
                        color: v.color || Colors.Primary,
                      }}
                      icon={
                        v.icon === 'fa-caret-down'
                          ? faCaretDown
                          : v.icon === 'fa-caret-up'
                          ? faCaretUp
                          : v.icon === 'fa-equals'
                          ? faEquals
                          : faDotCircle
                      }
                    />
                    {v.percentageChange}%
                    <br />
                    {v.label}
                  </div>
                </Col>
              ))}
              {metricData.description ? (
                <div className="col-12 mt-3 text-center">
                  <p className="description">{metricData.description}</p>
                </div>
              ) : null}
            </Row>
          ) : null}
        </CardBody>
      </VisShell>
    );
  };
}
