import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import {
  KuiFieldGroup,
  KuiFieldGroupSection,
  KuiCheckBoxLabel } from 'ui_framework/components';

const checkboxWrapper = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'fit-content'
};

const iconPadding = {
  paddingLeft: '0.5rem',
  paddingTop: '0.5rem',
};

export class OptionsTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rangeTypeIsPresent: this.props.scope.vis.params.controls.some(control => {
        return control.type === 'range';
      })
    };
    this.handleUpdateFiltersChange = this.handleUpdateFiltersChange.bind(this);
    this.displayHorizontalLayout = this.displayHorizontalLayout.bind(this);
  }

  setVisParam(paramName, paramValue) {
    const params = _.cloneDeep(this.props.scope.vis.params);
    params[paramName] = paramValue;
    this.props.stageEditorParams(params);
  }

  handleUpdateFiltersChange(evt) {
    this.setVisParam('updateFiltersOnChange', evt.target.checked);
  }

  //this method is called when the user clicks on the 'Horizontal Layout' checkbox.
  //if range type is added then set the 'displayHorizontalLayout' flag to 'false' by default.
  //if 'range' type is not present then set the 'displayHorizontalLayout' flag to the 'true' or 'false' based
  //on user input.
  displayHorizontalLayout(evt) {
    if(this.state.rangeTypeIsPresent) {
      this.setVisParam('displayHorizontalLayout', false);
    }else{
      this.setVisParam('displayHorizontalLayout', evt.target.checked);
    }
  }

  componentWillReceiveProps() {
    //if props changes and 'range' type is present in list of controls then set 'rangeTypeIsPresent' to 'true' or set it to 'false'.
    const rangeTypeIsPresent = this.props.scope.vis.params.controls.some(control => {
      return control.type === 'range';
    });
    if(rangeTypeIsPresent) this.setState({ rangeTypeIsPresent: true });
    else this.setState({ rangeTypeIsPresent: false });
  }

  render() {

    return (
      <div>

        <div className="sidebar-item">
          <div className="vis-editor-agg-header">
            <KuiFieldGroup>
              <KuiFieldGroupSection>
                <div style={checkboxWrapper}>
                  <KuiCheckBoxLabel
                    text="Update filters on each change"
                    isChecked={this.props.scope.vis.params.updateFiltersOnChange}
                    onChange={this.handleUpdateFiltersChange}
                    data-test-subj="inputControlEditorUpdateFiltersOnChangeCheckbox"
                  />
                  <i
                    style={iconPadding}
                    className="help-icon icon-help-blue"
                    data-tip={'Enable this to automatically apply filters on selection'}
                    data-for="updateFiltersOnChange"
                  />
                  <ReactTooltip id="updateFiltersOnChange"/>
                </div>
                <div style={checkboxWrapper}>
                  <KuiCheckBoxLabel
                    text="Horizontal Layout"
                    isChecked={this.props.scope.vis.params.displayHorizontalLayout}
                    onChange={this.displayHorizontalLayout}
                    isDisabled={this.state.rangeTypeIsPresent}
                    data-test-subj="inputControlEditordisplayHorizontalLayoutCheckbox"
                  />
                  <i
                    style={iconPadding}
                    className="help-icon icon-help-blue"
                    data-tip={this.state.rangeTypeIsPresent ? 'Horizonatal Layout not available for visualization including Range type.' :
                      'Enable this to display List items next to each other'}
                    data-for="displayHorizontalLayout"
                  />
                  <ReactTooltip id="displayHorizontalLayout"/>
                </div>
              </KuiFieldGroupSection>
            </KuiFieldGroup>
          </div>
        </div>

      </div>
    );
  }
}

OptionsTab.propTypes = {
  scope: PropTypes.object.isRequired,
  stageEditorParams: PropTypes.func.isRequired
};
