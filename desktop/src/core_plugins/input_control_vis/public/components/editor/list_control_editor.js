import PropTypes from 'prop-types';
import React from 'react';
import { IndexPatternSelect } from './index_pattern_select';
import { FieldSelect } from './field_select';

function filterField(field) {
  return field.aggregatable && ['number', 'boolean', 'date', 'ip', 'string'].includes(field.type);
}

export function ListControlEditor(props) {
  const multiselectId = `multiselect-${props.controlIndex}`;
  const sizeId = `size-${props.controlIndex}`;
  const handleMultiselectChange = (evt) => {
    props.handleCheckboxOptionChange(props.controlIndex, 'multiselect', evt);
  };
  const handleSizeChange = (evt) => {
    props.handleNumberOptionChange(props.controlIndex, 'size', evt);
  };

  // Prepare Parent candidates options for parent control.
  const parentCandidatesOptions = [
    { value: '', text: '' },
    ...props.parentCandidates,
  ];

  // Create the options for parent control.
  const parentControlOptions = parentCandidatesOptions.map((parent) => {
    return (
      <option
        key={parent.text}
        value={parent.value}
      >{parent.text}
      </option>
    );
  });
  return (
    <div>

      <IndexPatternSelect
        value={props.controlParams.indexPattern}
        onChange={props.handleIndexPatternChange}
        getIndexPatterns={props.getIndexPatterns}
      />

      <FieldSelect
        value={props.controlParams.fieldName}
        indexPatternId={props.controlParams.indexPattern}
        filterField={filterField}
        onChange={props.handleFieldNameChange}
        getIndexPattern={props.getIndexPattern}
      />

      <div className="kuiSideBarFormRow">
        <label className="kuiSideBarFormRow__label" htmlFor={multiselectId}>
          Enable Multiselect
        </label>
        <div className="kuiSideBarFormRow__control">
          <input
            id={multiselectId}
            className="kuiCheckBox"
            type="checkbox"
            checked={props.controlParams.options.multiselect}
            onChange={handleMultiselectChange}
          />
        </div>
      </div>

      <div className="kuiSideBarFormRow">
        <label className="kuiSideBarFormRow__label" htmlFor={sizeId}>
          Size
        </label>
        <div className="kuiSideBarFormRow__control kuiFieldGroupSection--wide">
          <input
            id={sizeId}
            className="kuiTextInput"
            type="number"
            min="1"
            value={props.controlParams.options.size}
            onChange={handleSizeChange}
          />
        </div>
      </div>

      { parentCandidatesOptions.length > 1 &&
        <div className="kuiSideBarFormRow">
          <label className="kuiSideBarFormRow__label" htmlFor={sizeId}>
            Parent Control
          </label>
          <div className="kuiSideBarFormRow__control kuiFieldGroupSection--wide">
            <select
              className="kuiTextInput"
              onChange={(evt) => props.handleParentChange(props.controlIndex, evt)}
              value={props.controlParams.parent}
            >
              {parentControlOptions}
            </select>
          </div>
        </div>
      }
    </div>
  );
}

ListControlEditor.propTypes = {
  getIndexPatterns: PropTypes.func.isRequired,
  getIndexPattern: PropTypes.func.isRequired,
  controlIndex: PropTypes.number.isRequired,
  controlParams: PropTypes.object.isRequired,
  handleFieldNameChange: PropTypes.func.isRequired,
  handleIndexPatternChange: PropTypes.func.isRequired,
  handleCheckboxOptionChange: PropTypes.func.isRequired,
  handleNumberOptionChange: PropTypes.func.isRequired,
  handleParentChange: PropTypes.func.isRequired,
};
