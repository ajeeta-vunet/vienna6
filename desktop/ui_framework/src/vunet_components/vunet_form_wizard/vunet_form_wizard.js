
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

import React, { Component } from 'react';

import './_vunet_form_wizard.less';
import PropTypes from 'prop-types';
import { VunetDynamicFormBuilder } from '../vunet_dynamic_form_builder';
import { VunetHorizontalStepper } from '../vunet_horizontal_stepper/vunet_horizontal_stepper';

export class VunetFormWizard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentStep: 0,
      data: {},
      currentForm: {},
      operDict: {
        errorMsg: ''
      }
    };
  }

  componentDidMount() {
    const restApiId = this.props.data.restApiId;
    const name = this.props.data.name;
    const step = this.props.data.step || 0;
    this.props.data.getAllEditData(restApiId, name).then((data) => {
      this.setState({
        data: data,
        currentForm: { ...data.wizardData[step] },
        wizardTabs: data.wizardTabs,

        // This is used to set the color of visited tabs
        // in the wizard.
        visitedColor: data.wizardTabs[0].node_color,
      });
    });
  }

  // We use the 'VunetDynamicFormBuilder' component to
  // display each form in form wizard. We also pass the button names to be
  // displayed in the form component. These button names will replace the
  // default button names of the 'VunetDynamicFormBuilder': submit' and 'cancel'.
  // When the submit button in the form is clicked, we invoke this function
  // 'nextStep' which is passed as a callback to onSubmit function of
  // VunetDynamicFormBuilder
  nextStep(formData) {

    // Check if the currentstep holds the last form of the form wizard
    // and submit the form wizard. We call the onSubmit callback function passed
    // to carry out any operation required. For example: table refresh to update
    // the newly added rows.
    if ((this.state.currentStep + 1) >= this.state.data.wizardData.length) {
      this.props.onSubmit();
      return;
    }

    let currentStep = this.state.currentStep;
    const dataCopy = { ...this.state.data };
    dataCopy.wizardData[currentStep].data = formData;
    currentStep = currentStep + 1;

    // When we encounter 'formSubmit' flag in the currentForm obj
    // we make a back end call to save the data in the wizard.
    if (this.state.currentForm.formSubmit === true) {
      this.saveData().then(() => {
        this.setState({
          currentStep: currentStep,
          data: { ...dataCopy },
          currentForm: { ...this.state.data.wizardData[currentStep] }
        });
      }).catch((e) => {

        // If the save fails, catch the error and
        // display the error message to the user
        const operDictCopy = this.state.operDict;
        operDictCopy.errorMsg = e.data['error-string'];
        this.setState({ operDict: operDictCopy });
      });
    } else {
      this.setState({
        currentStep: currentStep,
        data: { ...dataCopy },
        currentForm: { ...this.state.data.wizardData[currentStep] }
      });
    }

    // Set the color of the current node and the line
    // connecting to the previous node to active when we
    // move to the next step.
    const wizardTabsCopy = [ ...this.state.wizardTabs];
    wizardTabsCopy[currentStep - 1].link_color = this.state.visitedColor;

    // The first node in the stepper is colored by default from back end. We
    // color the rest of the nodes when user clicks next button till
    // the last but one step.
    if (currentStep < this.state.data.wizardData.length) {
      wizardTabsCopy[currentStep].node_color = this.state.visitedColor;
    }
    this.setState({ wizardTabs: wizardTabsCopy });
  }

  // We use the 'VunetDynamicFormBuilder' component to
  // display each form in form wizard. We also pass the button names to be
  // displayed in the form component. These button names will replace the
  // default button names of the 'VunetDynamicFormBuilder': submit' and 'cancel'.
  // When the cancel button in the form is clicked, we invoke this function
  // 'prevStep' which is passed as a callback to onCancel function of
  // VunetDynamicFormBuilder
  prevStep(formData) {

    let currentStep = this.state.currentStep;
    const dataCopy = { ...this.state.data };
    dataCopy.wizardData[currentStep].data = formData;

    // Set the current Step, it can't be less than 0.
    currentStep = currentStep <= 0 ? 0 : currentStep - 1;

    // Set the state with correct Step index and Wizard data.
    this.setState({
      currentStep: currentStep,
      data: { ...dataCopy },
      currentForm: { ...this.state.data.wizardData[currentStep] }
    });
  }

  // This function updates the tab content when
  // user moves between the tabs by clicking on the step
  // icon at the top.
  switchStep =(index) => {
    this.setState({
      currentStep: index,
      currentForm: { ...this.state.data.wizardData[index] }
    });
  }

  // This function calls the callback function
  // to save the form wizard data to the back end.
  saveData() {
    const restApiId = this.props.data.restApiId;
    const name = this.props.data.name;
    return this.props.data.saveData(restApiId, name, this.state.data);
  }

  // This function calls the callback function
  // to perform appropriate actions as per the
  // button clicked.
  buttonCallback = (event) => {
    const buttonName = event.target.name;
    const restApiId = this.props.data.restApiId;
    //const name = this.state.data.wizardData[0].data.name;

    return this.props.data.buttonCallback(buttonName, restApiId, this.props.data.name)
      .then((data) => {

        // Do not proceed if there is no data.
        if(Object.keys(data).length) {
          const currentFormCopy = {
            ...this.state.currentForm
          };

          // Get the index of the button being clicked.
          const buttonIndex = currentFormCopy.metaData.findIndex(
            function (obj) {
              return obj.name === buttonName;
            }
          );

          // Check if button is already clicked once. If already clicked once.
          // replace the meta data just below the button with the new data
          // received.
          if (this.state.operDict.buttonName) {
            currentFormCopy.metaData.splice(
              buttonIndex + 1,
              1,
              data
            );
          } else {
            // insert the data received just below the button clicked.
            currentFormCopy.metaData.splice(
              buttonIndex + 1,
              0,
              data
            );

            // When the button is clicked for the first time, we set
            // the button name as the boolean flag in an operDict and
            // save it in the form wizard state.
            const operDictCopy = this.state.operDict;
            operDictCopy.buttonName = true;
            this.setState({ operDict: operDictCopy });
          }
          this.setState({
            currentForm: currentFormCopy
          });
        }
      });
  }

  /*
   * render form wizard component
   */
  render() {

    let formWizard = '';
    if (Object.keys(this.state.currentForm).length > 0) {

      // prepare data to be passed to the dynamic form builder
      // component.
      const formData = {};
      const errorSection = (
        <div className="row error-msg-container">
          {this.state.operDict.errorMsg}
        </div>);
      formData.editData = { ...this.state.currentForm.data };
      formData.item = [...this.state.currentForm.metaData];
      formData.isParentFormWizard = true;
      formData.buttonCallback = this.buttonCallback;

      // Prepare data required by the horizontal stepper
      // component.
      // steps:       List of objects, where each object is a step.
      // action:      User action can be 'add' or 'edit'
      // currentStep: Current step in form wizard.
      const stepperData = {};
      stepperData.steps = this.state.wizardTabs;
      stepperData.action = this.props.data.action;
      stepperData.currentStep = this.state.currentStep;
      formWizard = (
        <div className="wizard-container">
          <div className="row wizard-tabs-container">
            <VunetHorizontalStepper
              data={stepperData}
              onSwitch={this.switchStep}
            />
          </div>
          <div key={this.state.currentStep} className="row wizard-view">
            {/* Call the dynamic form builder component to display the
                forms in form wizard. We pass the following to the
                'VunetDynamicFormBuilder' component:
                formData: contains data and metadata to display elements in form.
                buttonTitle: contains the names of the buttons for each form.
                nextStep: callback function to be called on form submit.
                prevStep: callback function to be called on form cancel.
            */}
            <VunetDynamicFormBuilder
              className="form"
              formData={formData}
              buttonsList={this.state.currentForm.buttonTitle}
              onSubmit={formData => {
                this.nextStep(formData);
              }}
              onCancel={formData2 => {
                this.prevStep(formData2);
              }}
            />
          </div>
          <div>{this.state.operDict.errorMsg !== '' && errorSection}</div>
        </div>
      );
    }
    return (
      <div className="vunet-form-wizard-container">
        {formWizard}
      </div>
    );
  }
}

VunetFormWizard.propTypes = {
  data: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func
};