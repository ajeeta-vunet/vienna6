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
import './BasicDetails.less';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider.js';
import { VuBlockStoreConstants } from '../../vublock_store_constants';

export class BasicDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editMode: false,
      details: null,
      draft: null,
      nameErrorText: '',
      descriptionErrorText: '',
      instanceIDErrorText: '',
    };

    this.handleEditButtonClick = this.handleEditButtonClick.bind(this);
    this.handleDiscardButtonClick = this.handleDiscardButtonClick.bind(this);
    this.handleSaveButtonClick = this.handleSaveButtonClick.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.fetchBasicDetails = this.fetchBasicDetails.bind(this);
    this.getTagsAsText = this.getTagsAsText.bind(this);
  }

  // Function to fetch basic details
  fetchBasicDetails = () => {
    const vuBlockId = this.props.vuBlockId;

    apiProvider.getAll(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}/${vuBlockId}`)
      .then((data) => {
        this.props.updateVuBlockName(data.name);
        this.setState({
          details: data,
          draft: {
            name: data.name,
            description: data.description,
            type: data.type,
            instance_identifier: data.instance_identifier,
            tags: data.tags
          },
        });
      });

    apiProvider.getAll(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}/`
      + `${this.props.vuBlockId}/${VuBlockStoreConstants.VUBLOCK_ICON}`)
      .then((data) => {
        this.setState((prevState) => ({
          details: {
            ...prevState.details,
            icon: data.icon ? data.icon : 'others.png'
          }
        }));
      });
  }

  // Function to convert the tags stored into a string
  // that can be used for displaying in Editable format
  getTagsAsText = (tags) => {
    let str = '';
    tags.forEach(tag => str = str + tag + '; ');
    return str;
  }

  // Function triggers when user clicks Edit Basic Details
  handleEditButtonClick = () => {
    this.setState({
      editMode: true,
      nameErrorText: '',
      descriptionErrorText: '',
      instanceIDErrorText: '',
      draft: {
        name: this.state.details.name,
        description: this.state.details.description,
        type: this.state.details.type,
        instance_identifier: this.state.details.instance_identifier,
        tags: this.state.details.tags
      },
    });
  };

  // Function triggers when user clicks Discard Changes
  handleDiscardButtonClick = () => {
    this.setState({
      editMode: false,
      nameErrorText: '',
      descriptionErrorText: '',
      instanceIDErrorText: '',
      draft: {
        name: this.state.details.name,
        description: this.state.details.description,
        type: this.state.details.type,
        instance_identifier: this.state.details.instance_identifier,
        tags: this.state.details.tags
      },
    });
  };

  // Function triggers when user clicks Save Changes
  handleSaveButtonClick = () => {
    if (
      this.state.nameErrorText ||
      this.state.descriptionErrorText ||
      this.state.instanceIDErrorText
    ) {
      return;
    }
    this.setState({
      editMode: false,
      nameErrorText: '',
      descriptionErrorText: '',
      instanceIDErrorText: ''
    });
    apiProvider.put(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}/${this.props.vuBlockId}`, this.state.draft)
      .then(() => {
        this.fetchBasicDetails();
      });
  };

  // Function to validate value changes
  onFieldChange = (property, value) => {
    switch (property) {
      case 'name':
        if (value === '') {
          this.setState({
            nameErrorText: 'This field is required',
          });
        } else if (value.length > 20) {
          this.setState({
            nameErrorText: 'Maximum length for this field is 20',
          });
        } else {
          this.setState((prevState) => ({
            draft: {
              ...prevState.draft,
              name: value,
            },
            nameErrorText: '',
          }));
        }
        break;
      case 'description':
        if (value === '') {
          this.setState({
            descriptionErrorText: 'This field is required',
          });
        } else if (value.length > 200) {
          this.setState({
            descriptionErrorText: 'Maximum length for this field is 200',
          });
        } else {
          this.setState((prevState) => ({
            draft: {
              ...prevState.draft,
              description: value,
            },
            descriptionErrorText: '',
          }));
        }
        break;
      case 'instance_identifier':
        if (value === '') {
          this.setState({
            instanceIDErrorText: 'This field is required',
          });
        } else if (value.length > 20) {
          this.setState({
            instanceIDErrorText: 'Maximum length for this field is 20',
          });
        } else {
          this.setState((prevState) => ({
            draft: {
              ...prevState.draft,
              instance_identifier: value,
            },
            instanceIDErrorText: '',
          }));
        }
        break;
      case 'type':
        this.setState((prevState) => ({
          draft: {
            ...prevState.draft,
            type: value,
          }
        }));
        break;
      case 'tags':
        let updatedTags = value.replaceAll(/\s/g, '').split(';');
        if(updatedTags[updatedTags.length - 1] === '') {
          updatedTags = updatedTags.slice(0, updatedTags.length - 1);
        }
        this.setState((prevState) => ({
          draft: {
            ...prevState.draft,
            tags: updatedTags,
          }
        }));
        break;
    }
  };

  componentWillMount() {
    this.fetchBasicDetails();
  }

  componentDidMount() {
  }

  componentDidUpdate() {}

  componentWillUnmount() {}

  render() {
    let tagsAsText = '';
    if (this.state.details && this.state.details.tags) {
      tagsAsText = this.getTagsAsText(this.state.details.tags);
    }

    return (
      <div className="basic-details-wrapper">

        { /* ACTION BUTTONS FOR BASIC DETAILS */ }
        {this.state.details && (
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

        {this.state.details && (
          <div className="vublock-basic-details-content">

            { /* VUBLOCK NAME FIELDSET */ }
            {this.state.details.name && (
              <div className="vublock-fieldset">
                <p className="basic-details-label">Name</p>
                {!this.state.editMode && (
                  <p className="basic-details-value">
                    {this.state.details.name}
                  </p>
                )}
                {this.state.editMode && (
                  <div className="input-container">
                    <input
                      className="basic-details-input form-control"
                      type="text"
                      required=""
                      placeholder="Name of the VuBlock"
                      defaultValue={this.state.details.name}
                      onChange={(e) =>
                        this.onFieldChange('name', e.target.value)
                      }
                    />
                    {this.state.nameErrorText && (
                      <div className="errorFieldText">
                        {this.state.nameErrorText}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            { /* VUBLOCK LOGO FIELDSET */ }
            {/* <div className="vublock-fieldset">
              <p className="basic-details-label">Icon</p>
              {!this.state.editMode && (
                <p className="basic-details-value">
                  {this.state.details.icon}
                </p>
              )}
              {this.state.editMode && (
                <div className="input-container">
                  <input
                    className="basic-details-input form-control"
                    type="file"
                  />
                </div>
              )}
            </div> */}

            { /* VUBLOCK DESCRIPTION FIELDSET */ }
            {this.state.details.description && (
              <div className="vublock-fieldset">
                <p className="basic-details-label">Description</p>
                {!this.state.editMode && (
                  <p className="basic-details-value">
                    {this.state.details.description}
                  </p>
                )}
                {this.state.editMode && (
                  <div className="input-container">
                    <textarea
                      className="form-control vublock-description-text-area basic-details-input"
                      type="text"
                      maxLength="201"
                      placeholder="Description of the VuBlock"
                      onChange={(e) =>
                        this.onFieldChange('description', e.target.value)
                      }
                      defaultValue={this.state.details.description}
                    />
                    {this.state.descriptionErrorText && (
                      <div className="errorFieldText">
                        {this.state.descriptionErrorText}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            { /* VUBLOCK TYPE FIELDSET */ }
            {this.state.details.type && (
              <div className="vublock-fieldset">
                <p className="basic-details-label">Type</p>
                {!this.state.editMode && (
                  <p className="basic-details-value">
                    {this.state.details.type}
                  </p>
                )}
                {this.state.editMode && (
                  <div className="input-container">
                    <select
                      className="form-control basic-details-input"
                      placeholder="Type of VuBlock"
                      onChange={(e) =>
                        this.onFieldChange('type', e.target.value)
                      }
                      defaultValue={this.state.details.type}
                    >
                      <option value="Component">Component</option>
                      <option value="Logical">Logical</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            { /* VUBLOCK INSTANCE IDENTIFIER FIELDSET */ }
            {this.state.details.instance_identifier && (
              <div className="vublock-fieldset">
                <p className="basic-details-label">Instance Identifier</p>
                {!this.state.editMode && (
                  <p className="basic-details-value">
                    {this.state.details.instance_identifier}
                  </p>
                )}
                {this.state.editMode && (
                  <div className="input-container">
                    <input
                      className="basic-details-input form-control"
                      type="text"
                      required=""
                      placeholder="Eg : host"
                      defaultValue={this.state.details.instance_identifier}
                      onChange={(e) =>
                        this.onFieldChange('instance_identifier', e.target.value)
                      }
                    />
                    {this.state.instanceIDErrorText && (
                      <div className="errorFieldText">
                        {this.state.instanceIDErrorText}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            { /* VUBLOCK TAGS FIELDSET */ }
            {this.state.details.tags && (
              <div className="vublock-fieldset">
                <p className="basic-details-label">Tags</p>
                {!this.state.editMode && (
                  <div className="tags-container">
                    {
                      this.state.details.tags.map(
                        (tag) => <div key={tag} className="tag-value">{tag}</div>
                      )
                    }
                  </div>
                )}
                {this.state.editMode && (
                  <div className="input-container">
                    <textarea
                      className="form-control vublock-tags-text-area basic-details-input"
                      type="text"
                      maxLength="350"
                      placeholder="Tags for the VuBlock (separated by ';')"
                      onChange={(e) =>
                        this.onFieldChange('tags', e.target.value)
                      }
                      defaultValue={tagsAsText}
                    />
                  </div>
                )}
              </div>
            )}

            { /* VUBLOCK CREATED AT FIELDSET */ }
            {this.state.details.created_at && (
              <div className="vublock-fieldset">
                <p className="basic-details-label">Created at</p>
                {!this.state.editMode && (
                  <p className="basic-details-value">
                    {this.state.details.created_at}
                  </p>
                )}
                {this.state.editMode && (
                  <div className="input-container">
                    <input
                      className="basic-details-input form-control"
                      type="text"
                      required=""
                      placeholder="Creation Time"
                      disabled
                      defaultValue={this.state.details.created_at}
                    />
                  </div>
                )}
              </div>
            )}

            { /* VUBLOCK CREATED BY FIELDSET */ }
            {this.state.details.created_by && (
              <div className="vublock-fieldset">
                <p className="basic-details-label">Created by</p>
                {!this.state.editMode && (
                  <p className="basic-details-value">
                    {this.state.details.created_by}
                  </p>
                )}
                {this.state.editMode && (
                  <div className="input-container">
                    <input
                      className="basic-details-input form-control"
                      type="text"
                      required=""
                      placeholder="Owner of the VuBlock"
                      disabled
                      defaultValue={this.state.details.created_by}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

BasicDetails.propTypes = {};
