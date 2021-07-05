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

// Copyright 2021 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React from 'react';
import { generateHeading } from '../../utils/vunet_format_name';
import './SortEventsSidebar.less';

export class SortEventsSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {

    return (
      <div className="sort-list-sidebar-container">
        <div className="sort-list-sidebar-wrapper">
          <div className="sort-header-row">
            <div className="sort-header">Sorting</div>
            <div
              className="clear-all-div"
              onClick={() => this.props.clearAllSorting()}
            >
              {this.props.columnsList.length > 0 &&
              <div className="clear-all-label">
                Clear all
                <div className="clear-all-icon-div">
                  <i
                    className="fa fa-times clear-all-icon"
                  />
                </div>
              </div>
              }
            </div>
          </div>
          <div className="sort-list-items-container">
            {
              this.props.columnsList.length > 0 ? (
                this.props.columnsList.map((eachColumn, index) => (
                  <div key={index} className="sort-item-row">
                    <div className="row-number">
                      {index + 1}
                    </div>
                    <div className="row-name">
                      {generateHeading(eachColumn.name)}
                    </div>
                    <div className="sort-row-actions">
                      <div
                        className="sort-icon-div"
                        onClick={() => this.props.sortByClickedField(eachColumn.name)}
                      >
                        <i
                          className={[(eachColumn.direction === 1 ?
                            'fa-long-arrow-up' : 'fa-long-arrow-down'), 'kuiIcon sort-icon'].join(' ')}
                        />
                      </div>
                      <div
                        className="remove-sort-item"
                        onClick={() => this.props.removeSortItem(eachColumn.name)}
                      >
                        <i className="fa fa-times remove-sort-icon" />
                      </div>
                    </div>
                  </div>
                ))) :
                (
                  <div className="no-items-to-sort">
                  No sorting is applied on the events.
                  </div>
                )}
          </div>
        </div>
      </div>
    );
  }
}