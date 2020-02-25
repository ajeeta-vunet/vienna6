import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Select from 'react-select';
import { FormRow } from './form_row';
import _ from 'lodash';

export class ListControl extends Component {
  constructor(props) {
    super(props);

    this.handleOnChange = this.handleOnChange.bind(this);
    this.truncate = this.truncate.bind(this);
  }

  componentDidMount = () => {
    this._isMounted = true;
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  }

  handleOnChange(evt) {
    let newValue = '';
    if (evt) {
      newValue = evt;
    }
    this.props.stageFilter(this.props.controlIndex, newValue);
  }

  debouncedFetch = _.debounce(async (searchValue) => {
    await this.props.fetchOptions(searchValue);

    if (this._isMounted) {
      this.setState({
        isLoading: false,
      });
    }
  }, 300);

  // calls while searching in select box.
  onSearchChange = (searchValue) => {
    this.setState({
      isLoading: true,
    }, this.debouncedFetch.bind(null, searchValue));
  }

  truncate(selected) {
    if (selected.label.length <= 24) {
      return selected.label;
    }
    return `${selected.label.substring(0, 23)}...`;
  }

  render() {

    // For disable input.
    if (this.props.disableMsg) {
      return (
        <FormRow
          id={this.props.control.id}
          label={this.props.control.label}
          disableMsg={this.props.disableMsg}
        >
          <Select
            className="list-control-react-select"
            placeholder="Select..."
            disabled={true}
            multi={this.props.control.options.multiselect}
            simpleValue={true}
            delimiter={this.props.control.getMultiSelectDelimiter()}
            value={this.props.control.value}
            options={this.props.control.selectOptions}
            onSearchChange={this.onSearchChange}
            onChange={this.handleOnChange}
            valueRenderer={this.truncate}
            inputProps={{ id: this.props.control.id }}
          />
        </FormRow>
      );
    }
    return (
      <FormRow
        id={this.props.control.id}
        label={this.props.control.label}
      >
        <Select
          className="list-control-react-select"
          placeholder="Select..."
          multi={this.props.control.options.multiselect}
          simpleValue={true}
          delimiter={this.props.control.getMultiSelectDelimiter()}
          value={this.props.control.value}
          options={this.props.control.selectOptions}
          onSearchChange={this.onSearchChange}
          onChange={this.handleOnChange}
          valueRenderer={this.truncate}
          inputProps={{ id: this.props.control.id }}
        />
      </FormRow>
    );
  }
}

ListControl.propTypes = {
  control: PropTypes.object.isRequired,
  controlIndex: PropTypes.number.isRequired,
  stageFilter: PropTypes.func.isRequired
};

ListControl.defaultProps = {
  multiselect: true,
  selectedOptions: [],
  options: [],
};
