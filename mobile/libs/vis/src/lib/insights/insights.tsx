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
import { BaseVisualization } from '../base-component';
import { VisShell } from '../shell/shell';
import { CardBody } from 'reactstrap';
import { ImageManager } from '@vu/utils';
export class InsightVisualization extends BaseVisualization {
  render() {
    if (this.props.data.type !== 'insights') {
      return null;
    }
    return (
      <VisShell {...this.props}>
        <CardBody className="pt-2">
          {this.props.data.insights.map((v, i) => (
            <div key={i} className="vu-insight row">
              <div
                className={this.props.full ? 'col-12 text-center' : 'col-auto'}
                style={{ width: this.props.full ? 200 : 100 }}
              >
                <img src={ImageManager.getImage(v.group)} alt={v.group} />
              </div>
              <div className={this.props.full ? 'col-12 pt-4 text-center' : 'col'}>
                <div className="insights-h1">
                  {v.metadata.value.length === 0
                    ? 'NA'
                    : v.metadata.value.map((val, i2) => (
                        <span className="insights-value" key={i2}>
                          {val}
                        </span>
                      ))}
                </div>
                <div>
                  <div className="insights-h2"> {v.name}</div>
                  <p>{v.data.text || 'No text'} </p>
                </div>
              </div>
            </div>
          ))}
        </CardBody>
      </VisShell>
    );
  }
}
