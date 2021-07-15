import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { VunetLoader } from '../VunetLoader/VunetLoader';
import './_vunet_import_modal.less';

export class VunetImportModal extends Component {
  constructor(props) {
    super(props);
    this.nodeModal = null; // The ref of the modal

    this.state = {
      selectedFile: null, // file selected by the user
      loading: false, // Loading State
    };
  }

  componentWillMount() {
    // Registering click listener to record clicks by the user
    document.addEventListener('mousedown', this.handleClick, false);
  }

  componentWillUnmount() {
    // Removing the click listener
    document.removeEventListener('mousedown', this.handleClick, false);
  }

  componentWillReceiveProps(nextProps) {
    // If loader is active and the props get updated, stop the loader
    if (
      JSON.stringify(nextProps) !== JSON.stringify(this.props) &&
      this.state.loading
    ) {
      this.setState({
        loading: false,
      });
    }
  }

  // Click Handler to spot clicks outside the modal
  handleClick = (e) => {
    if (this.props.showModal) {
      if (this.nodeModal && this.nodeModal.contains(e.target)) {
        // The click is inside the modal, we just simply return
        return;
      }
      // The Click is outside the modal, we are closing it
      this.closeModal();
    }
  };

  // Close the modal
  closeModal = () => {
    if (this.props.data.success === true) {
      // If the upload is successful,
      // we are passing the true flag to trigger a refresh
      this.props.onClose(true);
    } else {
      // If the upload is not successful, we are not doing the above
      this.props.onClose(false);
    }
  };

  // On file select (from the popup)
  onFileSelect = (event) => {
    // Update the state
    this.setState({ selectedFile: event.target.files[0] });
  };

  // On file upload (click the upload button)
  uploadFile = () => {
    // Setting up loader
    this.setState({
      loading: true,
    });

    // Create an object of formData
    const formData = new FormData();

    // Update the formData object
    formData.append(
      'file',
      this.state.selectedFile,
      this.state.selectedFile.name
    );

    this.props.onUpload(formData);
  };

  // Resetting the modal
  resetModalForm = () => {
    const copy = { ...this.props.data };
    copy.error = '';
    copy.downloadErrors = null;
    copy.success = false;
    this.props.onUpdateModal(copy);
  };

  // Rendering the form of the modal body
  renderForm = () => {
    return (
      <div className="import-modal-content">
        <p className="header">{this.props.data.title}</p>

        <p className="tip">
          <span className="tip-title">
            <i className="fa fa-info-circle" />
            Note
          </span>
          {this.props.data.tip}
          {this.props.data.templateLink && (
            <span>
              You can download the template from&nbsp;
              <a
                className="modal-link"
                href={this.props.data.templateLink}
                target="_blank"
              >
                here
              </a>
            </span>
          )}
        </p>

        <input type="file" name="file" onChange={this.onFileSelect} required />
      </div>
    );
  };

  // Rendering success message when the file is submitted successfully
  renderSuccessMessage = () => {
    return (
      <div className="import-modal-content">
        <p className="header">{this.props.data.title}</p>

        <p className="tip">
          <span className="tip-title">
            <i className="fa fa-check-circle" />
            Import Successful
          </span>
        </p>
      </div>
    );
  };

  // Rendering error message when the file submit fails
  renderErrors = () => {
    return (
      <div className="import-modal-content">
        <p className="header">{this.props.data.title}</p>

        <p className="error">
          <span className="error-title">
            <i className="fa fa-times-circle" />
            Import Unsuccessful
          </span>
          {this.props.data.error}
          {this.props.data.downloadErrors && (
            <span>
              &nbsp; You can download the entire list of errors from&nbsp;
              <span
                className="modal-link"
                onClick={this.props.data.downloadErrors}
              >
                here
              </span>
            </span>
          )}
        </p>
      </div>
    );
  };

  // Rendering the body of the modal
  renderModalBody = () => {
    if (this.state.loading === true) {
      return (
        <div>
          <VunetLoader />
        </div>
      );
    } else {
      if (this.props.data.success === true) {
        return (
          <div className="import-modal-container">
            {this.renderSuccessMessage()}
            <div className="footer">
              <button
                type="submit"
                className="btn btn-positive"
                onClick={this.closeModal}
                disabled={!this.state.selectedFile}
              >
                OK
              </button>
            </div>
          </div>
        );
      } else if (!this.props.data.error) {
        return (
          <div className="import-modal-container">
            {this.renderForm()}
            <div className="footer">
              <button
                type="button"
                className="btn btn-negative"
                onClick={this.closeModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-positive"
                onClick={this.uploadFile}
                disabled={!this.state.selectedFile}
              >
                Submit
              </button>
            </div>
          </div>
        );
      } else {
        return (
          <div className="import-modal-container">
            {this.renderErrors()}
            <div className="footer">
              <button
                type="submit"
                className="btn btn-positive"
                onClick={this.resetModalForm}
              >
                Retry
              </button>
            </div>
          </div>
        );
      }
    }
  };

  /**
   * Render Modal
   */
  render() {
    return this.props.showModal ? (
      <div className="import-modal-overlay">
        <div
          className="import-modal"
          ref={(e) => {
            this.nodeModal = e;
          }}
        >
          {this.renderModalBody()}
        </div>
      </div>
    ) : null;
  }
}

VunetImportModal.propTypes = {
  showModal: PropTypes.bool, // to show/hide modal
  data: PropTypes.object, // Modal Data
  onClose: PropTypes.func, // on modal close callback
  onUpload: PropTypes.func, // on modal submit callback
  onUpdateModal: PropTypes.func, // callback to update modal content
};