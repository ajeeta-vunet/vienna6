import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';

export const FormRow = (props) => {
  const  disableMsg = props.disableMsg ? props.disableMsg : null;
  return (
    <div
      className="kuiVerticalRhythm"
      data-tip={disableMsg}
    >
      <label className="kuiLabel kuiVerticalRhythmSmall" htmlFor={props.id}>
        {props.label}
      </label>
      <div className="kuiVerticalRhythmSmall">
        {props.children}
      </div>
      <ReactTooltip className="disable-msg-tooltip"/>
    </div>
  );
};

FormRow.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};
