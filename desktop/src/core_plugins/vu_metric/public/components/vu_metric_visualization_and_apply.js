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
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { keyCodes } from 'ui_framework/services';
import { VunetModal } from 'ui_framework/src/vunet_components/vunet_modal/vunet_modal'
import VuMetricVisualization from './vu_metric_visualization';
import 'react-toggle/style.css';

const MIN_CHART_HEIGHT = 375;

class VuMetricVisualizationAndApply extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: MIN_CHART_HEIGHT,
      dragging: false,
      originalParamsOfObject: this.props.model,
      discardChangesModal: false
    };

    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.onSizeHandleKeyDown = this.onSizeHandleKeyDown.bind(this);
  }

  handleMouseDown() {
    this.setState({ dragging: true });
  }

  handleMouseUp() {
    this.setState({ dragging: false });
  }

  componentWillMount() {
    this.handleMouseMove = (event) => {
      if (this.state.dragging) {
        // Here we are setting the height of the block where the visualization will be shown as the height can be changed using the
        // resizeable handler provided
        this.setState((prevState) => ({
          height: Math.max(MIN_CHART_HEIGHT, prevState.height + event.movementY)
        }));
      }
    };
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  componentDidMount() {
    const el = findDOMNode(this.visDiv);
    el.setAttribute('render-counter', 'disabled');
  }

  /**
   * Resize the chart height when pressing up/down while the drag handle
   * for resizing has the focus.
   * We use 15px steps to do the scaling and make sure the chart has at least its
   * defined minimum width (MIN_CHART_HEIGHT).
   */
  onSizeHandleKeyDown(ev) {
    const { keyCode } = ev;
    if (keyCode === keyCodes.UP || keyCode === keyCodes.DOWN) {
      ev.preventDefault();
      this.setState((prevState) => {
        const newHeight = prevState.height + (keyCode === keyCodes.UP ? -15 : 15);
        return {
          height: Math.max(MIN_CHART_HEIGHT, newHeight)
        };
      });
    }
  }


  // This function will be used to show the modal of confirmation to discard the changes
  showDiscardChangesModal = () => {
    this.setState({
      discardChangesModal: true
    })
  }

  // This function will be used to close the modal of confirmation to discard the changes
  discardChangesModalClose = () => {
    this.setState({
      discardChangesModal: false
    })
  }

  // This function will be used to submit the modal of confirmation to discard the changes
  discardChangesModalSubmit = () => {
    this.discardChanges();
    this.setState({
      discardChangesModal: false
    })
  }


  // This function will be used to discard any changes done in the form and reset it to the original form or the saved Object
  discardChanges = () => {
    this.props.onChange(this.state.originalParamsOfObject)
  }

  render() {
    const { dirty, sameLabelExists, errorInSavedSearchFound } = this.props;
    const style = { height: this.state.height };
    if (this.state.dragging) {
      style.userSelect = 'none';
    }
    const discardChangesModalData = {
      class: 'discard-changes-modal',
      isForm: false,
      title: 'Discard Changes',
      message: '<h4>Are you sure you want to discard all the changes in the configuration forms?</h4>'
    }

    const trapeziodButton = (
      <div
        className="vunet-trapezoid">
        <div
          className={"play-icon-and-name-container " +
            ((!dirty || !this.props.isFormValid || sameLabelExists || errorInSavedSearchFound) ? 'play-icon-and-name-container-disabled' : '')}
          onClick={this.props.onCommit}>
          <i className='icon-play-button'></i>
          <span className="preview-span-name">Preview</span>
        </div>
        <div
          className="discard-icon-and-name-container"
          onClick={this.showDiscardChangesModal}>
          <i className='icon-discard'></i>
          <span className="discard-span-name">Discard</span>
        </div>
        <div
          className="resize-trapezoid"
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}
          onKeyDown={this.onSizeHandleKeyDown}>
          <i className='icon-dragging-circles'></i>
        </div>
      </div>

    )

    return (
      <div>
        <div
          style={style}
          ref={(el) => this.visDiv = el}
          className="vis_editor__visualization"
        >
          <VuMetricVisualization
            title={this.props.title}
            model={this.props.model}
            visData={this.props.visData}
            isEditorMode={this.props.isEditorMode}
            Private={this.props.Private}
            getAppState={this.props.getAppState}
            timefilter={this.props.timefilter}
            config={this.props.config}
            filterInjectorForVerticalTable = {this.props.filterInjectorForVerticalTable}
          />

        </div>
        <div className="vis-editor-hide-for-reporting">
          {trapeziodButton}
        </div>
        <VunetModal
          showModal={this.state.discardChangesModal}
          onClose={this.discardChangesModalClose.bind(this)}
          data={discardChangesModalData}
          onSubmit={this.discardChangesModalSubmit.bind(this)}
        />
      </div>
    );
  }
}

VuMetricVisualizationAndApply.propTypes = {
  dirty: PropTypes.bool,
  isFormValid: PropTypes.bool,
  title: PropTypes.string,
  model: PropTypes.object,
  onChange: PropTypes.func,
  onCommit: PropTypes.func,
  visData: PropTypes.array,
  isEditorMode: PropTypes.bool,
  sameLabelExists: PropTypes.bool,
  errorInSavedSearchFound: PropTypes.bool,
  Private: PropTypes.func, // This will be used for going to reference link to prepare link information
  getAppState: PropTypes.func, // This will be used for going to reference link to prepare link information
  timefilter: PropTypes.object, // This will be used for going to reference link to prepare link information
  config: PropTypes.object, // This will be used to all the configurations from Manage Resources -> Advanced Settings
  filterInjectorForVerticalTable: PropTypes.func // This is angular $filter injectable which will be used in vertical table
};

export default VuMetricVisualizationAndApply;
