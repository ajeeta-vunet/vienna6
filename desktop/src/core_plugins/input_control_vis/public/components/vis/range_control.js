import _  from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import InputRange from 'react-input-range';
import { FormRow } from './form_row';

const toState = (props) => {

  const sliderValue = props.control.hasValue() ?
    props.control.value :
    // InputRange component does not have an "empty state"
    // Faking an empty state by setting the slider value range to length of zero anchored at the range minimum
    {
      min: props.control.min,
      max: props.control.min
    };

  const state = {
    sliderValue,
    minValue: props.control.hasValue() ? props.control.value.min : '',
    maxValue: props.control.hasValue() ? props.control.value.max : '',
    isRangeValid: true,
    errorMessage: '',
  };

  return state;
};

export class RangeControl extends Component {
  constructor(props) {
    super(props);

    this.state = toState(props);
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState(toState(nextProps));
  }

  handleOnChange = (value) => {
    this.setState({
      sliderValue: value,
      minValue: value.min,
      isRangeValid: true,
      maxValue: value.max,
      errorMessage: '',
    });
  }

  handleMinChange = (evt) => {
    this.handleChange(parseFloat(evt.target.value), this.state.maxValue);
  };

  handleMaxChange = (evt) => {
    this.handleChange(this.state.minValue, parseFloat(evt.target.value));
  };


  handleOnChangeComplete = (value) => {
    this.props.stageFilter(this.props.controlIndex, value);
  }

  handleChange = (min, max) => {
    min = isNaN(min) ? '' : min;
    max = isNaN(max) ? '' : max;

    const isMinValid = min !== '';
    const isMaxValid = max !== '';
    let isRangeValid = true;
    let errorMessage = '';

    if ((!isMinValid && isMaxValid) || (isMinValid && !isMaxValid)) {
      isRangeValid = false;
      errorMessage = 'Both min and max must be set';
    }

    if (isMinValid && isMaxValid && max < min) {
      isRangeValid = false;
      errorMessage = 'Max must be greater or equal to min';
    }

    this.setState({
      minValue: min,
      maxValue: max,
      isRangeValid,
      errorMessage,
    });

    if (isRangeValid && isMaxValid && isMinValid) {
      this.handleOnChangeComplete({ min, max });
    }
  };

  formatLabel = (value) => {
    let formatedValue = value;

    const decimalPlaces = _.get(this.props, 'control.options.decimalPlaces');
    if (decimalPlaces !== null && decimalPlaces >= 0) {
      formatedValue = value.toFixed(decimalPlaces);
    }
    return formatedValue;
  }

  render() {
    return (
      <div>
        <FormRow
          id={this.props.control.id}
          label={this.props.control.label}
          disableMsg={this.state.errorMessage ? [this.state.errorMessage] : []}
        >
          <input
            id={`${this.props.control.id}_min`}
            name="min"
            type="number"
            className="kuiTextInput"
            value={this.state.minValue}
            min={this.props.control.min}
            max={this.props.control.max}
            onChange={this.handleMinChange}
          />
          <div className="inputRangeContainer">
            <InputRange
              maxValue={this.props.control.max}
              minValue={this.props.control.min}
              step={this.props.control.options.step}
              value={this.state.sliderValue}
              onChange={this.handleOnChange}
              onChangeComplete={this.handleOnChangeComplete}
              draggableTrack={true}
              ariaLabelledby={this.props.control.id}
              formatLabel={this.formatLabel}
            />
          </div>
          <input
            id={`${this.props.control.id}_max`}
            name="max"
            type="number"
            className="kuiTextInput"
            value={this.state.maxValue}
            min={this.props.control.min}
            max={this.props.control.max}
            onChange={this.handleMaxChange}
          />
        </FormRow>
        <span className="rangeErrorMsg">{this.state.errorMessage}</span>
      </div>
    );
  }
}

RangeControl.propTypes = {
  control: PropTypes.object.isRequired,
  controlIndex: PropTypes.number.isRequired,
  stageFilter: PropTypes.func.isRequired
};
