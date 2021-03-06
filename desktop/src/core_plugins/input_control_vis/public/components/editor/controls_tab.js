import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ControlEditor } from './control_editor';
import { KuiButton, KuiButtonIcon } from 'ui_framework/components';
import { addControl, moveControl, newControl, removeControl, setControl } from '../../editor_utils';
import { getLineageMap, getParentCandidates } from '../../lineage';

export class ControlsTab extends Component {

  state = {
    type: 'list'
  }

  getIndexPatterns = async (search) => {
    const resp = await this.props.scope.vis.API.savedObjectsClient.find({
      type: 'index-pattern',
      fields: ['title'],
      search: `${search}*`,
      search_fields: ['title'],
      perPage: 100
    });
    return resp.savedObjects;
  }

  getIndexPattern = async (indexPatternId) => {
    return await this.props.scope.vis.API.indexPatterns.get(indexPatternId);
  }

  setVisParam(paramName, paramValue) {
    const params = _.cloneDeep(this.props.scope.vis.params);
    params[paramName] = paramValue;
    this.props.stageEditorParams(params);
  }

  handleLabelChange = (controlIndex, evt) => {
    const updatedControl = this.props.scope.vis.params.controls[controlIndex];
    updatedControl.label = evt.target.value;
    this.setVisParam('controls', setControl(this.props.scope.vis.params.controls, controlIndex, updatedControl));
  }

  handleIndexPatternChange = (controlIndex, evt) => {
    const updatedControl = this.props.scope.vis.params.controls[controlIndex];
    updatedControl.indexPattern = evt.value;
    updatedControl.fieldName = '';
    this.setVisParam('controls', setControl(this.props.scope.vis.params.controls, controlIndex, updatedControl));
  }

  handleFieldNameChange = (controlIndex, evt) => {
    const updatedControl = this.props.scope.vis.params.controls[controlIndex];
    updatedControl.fieldName = evt.value;
    this.setVisParam('controls', setControl(this.props.scope.vis.params.controls, controlIndex, updatedControl));
  }

  handleCheckboxOptionChange = (controlIndex, optionName, evt) => {
    const updatedControl = this.props.scope.vis.params.controls[controlIndex];
    updatedControl.options[optionName] = evt.target.checked;
    this.setVisParam('controls', setControl(this.props.scope.vis.params.controls, controlIndex, updatedControl));
  }

  handleNumberOptionChange = (controlIndex, optionName, evt) => {
    const updatedControl = this.props.scope.vis.params.controls[controlIndex];
    updatedControl.options[optionName] = parseFloat(evt.target.value);
    this.setVisParam('controls', setControl(this.props.scope.vis.params.controls, controlIndex, updatedControl));
  }

  handleRemoveControl = (controlIndex) => {
    this.setVisParam('controls', removeControl(this.props.scope.vis.params.controls, controlIndex));
    //if 'range' type is present in list of controls then set 'displayHorizontalLayout' to 'false'.
    const rangeTypeIsPresent = this.props.scope.vis.params.controls.some(control => {
      return control.type === 'range';
    });
    if(rangeTypeIsPresent) this.setVisParam('displayHorizontalLayout', false);
  }

  moveControl = (controlIndex, direction) => {
    this.setVisParam('controls', moveControl(this.props.scope.vis.params.controls, controlIndex, direction));
  }

  handleAddControl = () => {
    this.setVisParam('controls', addControl(this.props.scope.vis.params.controls, newControl(this.state.type)));
    //if type is equal to 'range' then set 'displayHorizontalLayout' to 'false'.
    if(this.state.type === 'range') this.setVisParam('displayHorizontalLayout', false);
  }

  // To add parent property in vis params.
  handleParentChange = (controlIndex, evt) => {
    const updatedControl = this.props.scope.vis.params.controls[controlIndex];
    updatedControl.parent = evt.target.value;
    this.setVisParam('controls', setControl(this.props.scope.vis.params.controls, controlIndex, updatedControl));
  }

  renderControls() {
    const lineageMap = getLineageMap(this.props.scope.vis.params.controls);
    return this.props.scope.vis.params.controls.map((controlParams, controlIndex) => {

      // Get Parent control options.
      const parentCandidates = getParentCandidates(
        this.props.scope.vis.params.controls,
        controlParams.id,
        lineageMap);

      return (
        <ControlEditor
          key={controlParams.id}
          controlIndex={controlIndex}
          controlParams={controlParams}
          handleLabelChange={this.handleLabelChange}
          moveControl={this.moveControl}
          handleRemoveControl={this.handleRemoveControl}
          handleIndexPatternChange={this.handleIndexPatternChange}
          handleFieldNameChange={this.handleFieldNameChange}
          getIndexPatterns={this.getIndexPatterns}
          getIndexPattern={this.getIndexPattern}
          handleCheckboxOptionChange={this.handleCheckboxOptionChange}
          handleNumberOptionChange={this.handleNumberOptionChange}
          parentCandidates={parentCandidates}
          handleParentChange={this.handleParentChange}
        />
      );
    });
  }

  render() {
    return (
      <div>

        {this.renderControls()}

        <div className="kuiSideBarFormRow">
          <div className="kuiSideBarFormRow__control kuiFieldGroupSection--wide">
            <select
              aria-label="Select control type"
              className="kuiSelect"
              value={this.state.type}
              onChange={evt => this.setState({ type: evt.target.value })}
            >
              <option value="range">Range slider</option>
              <option value="list">Options list</option>
            </select>
          </div>
          <KuiButton
            buttonType="primary"
            type="button"
            icon={<KuiButtonIcon type="create" />}
            onClick={this.handleAddControl}
            data-test-subj="inputControlEditorAddBtn"
          >
            Add
          </KuiButton>
        </div>
      </div>
    );
  }
}

ControlsTab.propTypes = {
  scope: PropTypes.object.isRequired,
  stageEditorParams: PropTypes.func.isRequired
};
