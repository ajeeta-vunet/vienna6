import React, { Component } from 'react';
import './CollectConfigCommitModal.less';
import { VunetButton } from 'ui_framework/src/vunet_components/vunet_button/vunet_button';
import { VunetHelp } from 'ui_framework/src/vunet_components/vunet_help/vunet_help';
import * as HelpConstants from '../../device_configuration_help_constants';

export class CollectConfigCommitModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commitMessageForConfigCollection: '',
      errorMessage: '',
      showHelpText: false
    };
  }

  // when user starts typing commit message in the textarea
  handleCommitMessage = (e) => {
    if(e.target.value === '') {
      // commit message is mandatory and hence, when it is empty,
      // show an error message to the user
      this.setState({
        commitMessageForConfigCollection: e.target.value,
        errorMessage: 'Please provide a message for git commit'
      });
    } else {
      this.setState({
        commitMessageForConfigCollection: e.target.value,
        errorMessage: ''
      });
    }
  }

  toggleHelpContent = () => {
    const showHelpText = !this.state.showHelpText;
    this.setState({ showHelpText });
  }

  render() {
    return(
      <div className="dcm-collect-config">
        <div className="dcm-collect-config-wrapper">

          <div className="dcm-collect-config-title">Configuration Collection</div>
          <hr/>

          <label>Message</label>
          <span>
            <i
              className="help-icon icon-help-blue"
              onClick={this.toggleHelpContent}
            />
          </span>
          {this.state.showHelpText &&
            <VunetHelp
              metaData={HelpConstants.CONFIG_COLLECT_HELP_OBJ}
              onClose={this.toggleHelpContent}
            />
          }
          <textarea
            rows={3}
            className="collect-config-commit-message"
            onChange={this.handleCommitMessage}
            value={this.state.commitMessageForConfigCollection}
          />
          {
            this.state.errorMessage.length > 0 &&
            <div className="error-text">{this.state.errorMessage}</div>
          }
          <div className="dcm-collect-config-actions">
            <VunetButton
              className="secondary collect-config-cancel"
              data-text="Cancel"
              onClick={this.props.cancelConfigCollection}
            />
            <VunetButton
              className="primary collect-config-submit"
              data-text="Collect"
              onClick={() => this.props.startConfigCollection(this.state.commitMessageForConfigCollection)}
              disabled={this.state.commitMessageForConfigCollection.length === 0}
            />
          </div>

        </div>
      </div>
    );
  }
}