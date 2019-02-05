
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

// Copyright 2019 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React, {
  Component,
} from 'react';
import PropTypes from 'prop-types';
import {
  KuiButton,
  KuiModal,
  KuiModalBody,
  KuiModalFooter,
  KuiModalHeader,
  KuiModalHeaderTitle,
  KuiModalOverlay,
} from 'ui_framework/components';

import { VunetDynamicFormBuilder } from '../vunet_dynamic_form_builder/vunet_dynamic_form_builder';

import './_vunet_modal.less';

// import $ from 'jquery'

export class VunetModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isModalVisible: false, // Hide or show the Modal based on data received.
      data: {}
    };
  }

  componentWillReceiveProps(props) {
    this.setState({ isModalVisible: props.showModal, data: props.data });
  }

  // Close the modal
  closeModal = (e) => {
    this.setState({ isModalVisible: false });
    this.props.onClose(e);
  }

  /**
  * This function gets called when modal does not have a form.
  * The modal state is set and its call back function is called
  * with event.
  */
  submitModal = (e) => {
    this.setState({ isModalVisible: false });
    this.props.onSubmit(e);
  }

  /**
   * This function gets called when modal has form.
   * On form submit, the modal state is set and its call back
   * function is called with data.
   */
  onFormSubmit = (model) => {
    this.setState({ isModalVisible: false });
    if (this.props.data.eventType) {
      model.eventType = this.props.data.eventType;
    }
    this.props.onSubmit(model);
  }

  /**
   * This function renders modal body.
   * if 'isForm':true then we load the 'VunetDynamicFormBuilder'
   * component and display the form.
   * if 'isForm':false, modal body will display contents received from
   * props 'message'.
   */
  renderModalBody = () => {
    if (this.props.data.isForm !== undefined && !this.props.data.isForm) {
      return (
        <p dangerouslySetInnerHTML={{ __html: this.props.data.message }} />
      );
    } else {
      return (
        <VunetDynamicFormBuilder
          className="form"
          formData={this.state.data}
          onSubmit={(model) => { this.onFormSubmit(model); }}
          onCancel={() => { this.closeModal(); }}
        />
      );
    }
  }

  /**
   * Modal footer
   *  If there is form in the modal, we hide the modal footer buttons (Ok, Canel).
   *  If there is no form in the modal, we display the form specific
   *  buttons(submit/cancel) from VunetDynamicFormBuilder component.
   */
  renderFooter = () => {
    if (this.props.data.isForm !== undefined && !this.props.data.isForm) {
      return (
        <KuiModalFooter className="noform-padding">
          <KuiButton
            className="vunet-button"
            buttonType="hollow "
            onClick={() => this.closeModal(false)}
          >
            Cancel
          </KuiButton>

          <KuiButton
            className="vunet-button"
            buttonType="primary "
            onClick={() => this.submitModal(this.props.data.eventType)}
          >
            Ok
          </KuiButton>
        </KuiModalFooter>
      );
    } else {
      return (
        <KuiModalFooter />
      );
    }
  }

  /**
  * Render Modal
  */
  render() {
    let modal;

    /**
     * If Modal is Open
     */
    if (this.state.isModalVisible) {
      modal = (
        <KuiModalOverlay>
          <KuiModal
            onClose={this.closeModal}
            style={{ width: '800px' }}
          >
            <KuiModalHeader>
              <KuiModalHeaderTitle >
                {this.state.data.title}
              </KuiModalHeaderTitle>
            </KuiModalHeader>

            <KuiModalBody>
              {this.renderModalBody()}
            </KuiModalBody>

            {this.renderFooter()}
          </KuiModal>
        </KuiModalOverlay>
      );
    }
    return (
      <div>
        {modal}
      </div>
    );
  }
}

VunetModal.propTypes = {
  showModal: PropTypes.bool, // to show/hide modal
  onClose: PropTypes.func, // on modal close callback
  onSubmit: PropTypes.func, // on modal submit callback
  data: PropTypes.object // data, modal used with form expect to be form data, otherwise custom message
};
