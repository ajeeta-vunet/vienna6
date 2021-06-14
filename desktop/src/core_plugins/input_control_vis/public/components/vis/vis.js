import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { RangeControl } from './range_control';
import { ListControl } from './list_control';
import { KuiFieldGroup, KuiFieldGroupSection, KuiButton } from 'ui_framework/components';

export class InputControlVis extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rowStyle: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleClearAll = this.handleClearAll.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const rangeTypeIsPresent = newProps.controls.some(control => {
      return control.type === 'range';
    });
    if(rangeTypeIsPresent) this.setState({ rowStyle: false });
    else this.setState({ rowStyle: true });
  }

  handleSubmit() {
    this.props.submitFilters();
  }

  handleReset() {
    this.props.resetControls();
  }

  handleClearAll() {
    this.props.clearControls();
  }

  renderControls() {
    return this.props.controls.map((control, index) => {
      let controlComponent = null;
      switch (control.type) {
        case 'list':
          controlComponent = (
            <ListControl
              id={control.id}
              label={control.label}
              options={control.selectOptions}
              selectedOptions={control.value}
              disableMsg={control.isEnabled() ? null : control.disabledReason}
              multiselect={control.options.multiselect}
              controlIndex={index}
              stageFilter={this.props.stageFilter}
              fetchOptions={query => { this.props.refreshControl(index, query); }}
              control={control}
            />
          );
          break;
        case 'range':
          controlComponent = (
            <RangeControl
              control={control}
              controlIndex={index}
              stageFilter={this.props.stageFilter}
            />
          );
          break;
        default:
          throw new Error(`Unhandled control type ${control.type}`);
      }
      return (
        <div
          className="inputControlVisItem"
          key={control.id}
          data-test-subj={'inputControl' + index}
        >
          {controlComponent}
        </div>
      );
    });
  }

  renderStagingButtons() {
    return (
      <KuiFieldGroup className="actions">
        <KuiFieldGroupSection>
          <KuiButton
            buttonType="primary"
            type="button"
            onClick={this.handleSubmit}
            disabled={!this.props.hasChanges()}
            data-test-subj="inputControlSubmitBtn"
          >
            Apply changes
          </KuiButton>
        </KuiFieldGroupSection>
        <KuiFieldGroupSection>
          <KuiButton
            buttonType="basic"
            type="button"
            onClick={this.handleReset}
            disabled={!this.props.hasChanges()}
            data-test-subj="inputControlCancelBtn"
          >
            Cancel changes
          </KuiButton>
        </KuiFieldGroupSection>
        <KuiFieldGroupSection>
          <KuiButton
            buttonType="basic"
            type="button"
            onClick={this.handleClearAll}
            disabled={!this.props.hasValues()}
            data-test-subj="inputControlClearBtn"
          >
            Clear form
          </KuiButton>
        </KuiFieldGroupSection>
      </KuiFieldGroup>
    );
  }

  render() {
    let stagingButtons;
    if (this.props.controls.length > 0 && !this.props.updateFiltersOnChange) {
      stagingButtons = this.renderStagingButtons();
    }

    return (
      <div
        className="inputControlVis"
      >
        <div
          className="inputControlVisContainer"
          style={this.props.displayHorizontalLayout && this.state.rowStyle ? { flexDirection: 'row' } : { flexDirection: 'column' }}
        >
          {this.renderControls()}
        </div>
        <div>
          {stagingButtons}
        </div>
      </div>
    );
  }
}

InputControlVis.propTypes = {
  stageFilter: PropTypes.func.isRequired,
  submitFilters: PropTypes.func.isRequired,
  resetControls: PropTypes.func.isRequired,
  clearControls: PropTypes.func.isRequired,
  controls: PropTypes.array.isRequired,
  updateFiltersOnChange: PropTypes.bool,
  displayHorizontalLayout: PropTypes.bool,
  hasChanges: PropTypes.func.isRequired,
  hasValues: PropTypes.func.isRequired
};
