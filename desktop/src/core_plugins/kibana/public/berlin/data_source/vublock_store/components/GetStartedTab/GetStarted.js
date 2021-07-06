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
// import PropTypes from 'prop-types';
import MarkdownIt from 'markdown-it';
import './GetStarted.less';
import $ from 'jquery';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider.js';
import { VuBlockStoreConstants } from '../../vublock_store_constants';
import { VunetLoader } from 'ui_framework/src/vunet_components/VunetLoader/VunetLoader';

export class GetStarted extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      templateType: undefined,
      editMode: false,
      getStartedContent: undefined
    };
    this.onTemplateChange = this.onTemplateChange.bind(this);
    this.createGetStartedMarkup = this.createGetStartedMarkup.bind(this);
    this.handleEditButtonClick = this.handleEditButtonClick.bind(this);
    this.handleDiscardButtonClick = this.handleDiscardButtonClick.bind(this);
    this.handleSaveButtonClick = this.handleSaveButtonClick.bind(this);
  }

  // Function to handle switching between HTML and Markdown template
  onTemplateChange = (templateType) => {
    this.setState({
      templateType: templateType
    });
  }

  // Function to set state for content to be rendered
  createGetStartedMarkup = () => {
    if(this.state.templateType === 'HTML') {
      return {
        __html: this.state.getStartedContent
      };
    } else if(this.state.templateType === 'Markdown') {
      const markdownIt = new MarkdownIt({
        html: false,
        linkify: true
      });
      const markdownValue = markdownIt.render(this.state.getStartedContent);
      return {
        __html: markdownValue
      };
    }
  };

  // Function to trigger when Edit button is clicked
  handleEditButtonClick = () => {
    this.setState({
      editMode: true,
    });
  };

  // Function to trigger when Discard button is clicked
  handleDiscardButtonClick = () => {
    this.setState({
      editMode: false,
    });
  };

  // Function to trigger when Save button is clicked
  handleSaveButtonClick = () => {
    const templateValue = $('#templateSelectList').find(':selected').text();
    const getStartedText = $('#getStartedContentTextArea').val();
    const getStartedData = {
      get_started_format: templateValue,
      get_started_content: getStartedText
    };
    apiProvider.put(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}` +
        `/${this.props.vuBlockId}/${VuBlockStoreConstants.VUBLOCK_GET_STARTED}`, getStartedData)
      .then(() => {
        this.setState({
          getStartedContent: getStartedText,
          templateType: templateValue,
          editMode: false
        });
      });
  };

  componentWillMount() {
    if(this.props.editable === 'true') {
      apiProvider.getAll(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}` +
        `/${this.props.vuBlockId}/${VuBlockStoreConstants.VUBLOCK_GET_STARTED}`)
        .then((data) => {
          this.setState({
            templateType: data.get_started_format ? data.get_started_format : 'Markdown',
            getStartedContent: data.get_started_content ? data.get_started_content : ''
          });
        });
    } else {
      apiProvider.getAll(`${VuBlockStoreConstants.VUBLOCK_BASE_PATH}` +
        `/${this.props.vuBlockId}/${VuBlockStoreConstants.VUBLOCK_GET_STARTED}`)
        .then((data) => {
          this.setState({
            templateType: data.get_started_format ? data.get_started_format : 'Markdown',
            getStartedContent: data.get_started_content ? data.get_started_content : ''
          });
        });
    }
  }

  render() {
    return (
      <div className="get-started-wrapper">

        { /* WHEN GET STARTED CONTENT IS UNDEFINED (NOT LOADED) */ }
        {this.state.getStartedContent === undefined && (
          <div className="loading-indicator">
            <VunetLoader />
          </div>
        )}

        { /* ACTION BUTTONS WHEN USER IS EDITING CONTENT THAT IS ALREADY PRESENT */ }
        {this.props.editable === 'true' && this.state.getStartedContent !== undefined && this.state.getStartedContent && (
          <div className="action-buttons-section">
            {!this.state.editMode && (
              <button
                className="vublock-edit-button"
                onClick={this.handleEditButtonClick}
              >
                Edit
              </button>
            )}
            {this.state.editMode && (
              <button
                className="vublock-discard-button"
                onClick={this.handleDiscardButtonClick}
              >
                Discard
              </button>
            )}
            {this.state.editMode && (
              <button
                className="vublock-save-button"
                onClick={this.handleSaveButtonClick}
              >
                Save
              </button>
            )}
          </div>
        )}

        { /* ACTION BUTTONS WHEN USER CREATING CONTENT NEWLY */ }
        {this.props.editable === 'true' && this.state.getStartedContent !== undefined && !this.state.getStartedContent && (
          <div className="action-buttons-section">
            <button
              className="vublock-save-button"
              onClick={this.handleSaveButtonClick}
            >
              Save
            </button>
          </div>
        )}

        { /* FORM SECTION UNDER GET STARTED */ }
        {
          this.props.editable === 'true' && ((this.state.getStartedContent !== undefined && !this.state.getStartedContent) ||
          (this.state.getStartedContent !== undefined && this.state.getStartedContent && this.state.editMode)) && (
            <div className="get-started-form">
              <div className="input-container">
                <select
                  id="templateSelectList"
                  className="form-control template-format-input"
                  placeholder="Template Format"
                  onChange={(e) =>
                    this.onTemplateChange(e.target.value)
                  }
                  defaultValue={this.state.templateType}
                >
                  <option value="HTML">HTML</option>
                  <option value="Markdown">Markdown</option>
                </select>
              </div>
              <br />
              <textarea
                id="getStartedContentTextArea"
                className="form-control get-started-text-area"
                type="text"
                maxLength="1200"
                placeholder="Get Started Content"
                defaultValue={this.state.getStartedContent}
              />
            </div>
          )}

        { /* CONTENT TO BE SHOWN FOR GET STARTED */ }
        {this.state.getStartedContent !== undefined && this.state.getStartedContent && !this.state.editMode && (
          <div
            className="get-started-content"
            dangerouslySetInnerHTML={this.createGetStartedMarkup()}
          />
        )}
      </div>
    );
  }
}

GetStarted.propTypes = {};