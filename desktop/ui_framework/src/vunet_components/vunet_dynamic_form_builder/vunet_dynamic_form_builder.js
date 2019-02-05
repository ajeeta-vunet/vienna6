
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

// Copyright 2019 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React, {
  Component,
} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import './_vunet_dynamic_form_builder.less';
import { VunetSelect } from '../vunet_select/vunet_select';

export class VunetDynamicFormBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = { isValidated: false, hideElm: [] };
  }

  //@@@
  componentDidMount() {
    this.setState({ ...this.props.formData.editData }); // eslint-disable-line
    this.init(true);
  }

  init(initial) {
    // Let us execute rules...
    // This is called twice.. once in the very beginning and another time
    // when a field is updated.. In beginning, we use props and later we
    // use state..
    //
    // we also call a callback to update other fields options if provided

    let hideElm = [];

    if(initial) {
      this.props.formData.item.forEach(_item => {
        if(_item.rules) {
          hideElm = this.applyRule(this.props.formData.editData[_item.key], _item.rules, hideElm);
        }
        if(_item.callback) {
          _item.callback(_item.key, this.props.formData.editData);
        }
      });
    } else {
      this.props.formData.item.forEach(_item => {
        if(_item.rules) {
          hideElm = this.applyRule(this.state[_item.key], _item.rules, hideElm);
        }

        // We should be calling the callback only when a particular item has
        // changed.. we need to enhance this...
        if(_item.callback) {
          _item.callback(_item.key, this.state);
        }
      });
    }
    if (this.state.hideElm.length !== hideElm.length || !_.isEqual(this.state.hideElm, hideElm)) {
      this.setState({ hideElm });
    }
  }

  /* Reset the fields to default defined in resetKeys dictionary
   * Example: resetKeys: { 'home_page': '', 'mobile_kpi': '' }
   *  this will get called when ever onChange event triggers.
   */
  resetFields(elm) {
    for (const key in elm.resetKeys) {
      if (elm.resetKeys.hasOwnProperty(key)) {
        this.setState({ [key]: elm.resetKeys[key] });
      }
    }
  }

  /*
  * Apply available rules
  * Example: { name: 'rule1', option: [{ value: true, action: [{ hide: 'input_ip'}]}]}
  * if the element value in TRUE will hide the 'input_ip' element
  */
  applyRule(value, rules, hideElm) {
    const curRule = this.state.hideElm.find(elm => elm.name === rules.name);
    if(curRule && curRule.elm) {
      curRule.elm = [];
    }
    // @@@
    if(rules.options.length) {
      rules.options.forEach(rule => {
        if (rule.value === value) {
          rule.actions.forEach(action => {
            switch (Object.keys(action)[0]) {
              case 'hide':
                hideElm =  [...hideElm, { name: rules.name, elm: [...action.hide] } ];
                break;
            }
          });
        }
      });
    }
    return hideElm;
  }

  /*
  * Submit callback of form
  */
  onSubmit = (e) => {
    e.preventDefault();
    if (this.props.onSubmit && this.validate()) {
      this.props.onSubmit(this.state);
    }
  }

  /*
  * Cancel callback of form
  */
  onCancel = (e) => {
    e.preventDefault();
    if (this.props.onCancel) this.props.onCancel();
  }

  /*
  * On change of form value will update the state
  * And also apply rule if applicabale
  */
  onChange = (e, key, type = 'single') => {

    // Find the element from props..
    const elm =  this.props.formData.item.find(_item => _item.key === key);

    // Validate the content to set isValidated flag.. This flag is checked to
    // enable/disable Submit button..
    let validationCallbackValue = false;
    if(elm.validationCallback) {
      validationCallbackValue = elm.validationCallback(key, e.target.value);
    }

    // If element is other than multi-select, check the content by invoking
    // the validate function.. If element is multi-select, we should just
    // validate the form and set validated to true if form is valid.
    let eventElement = e;
    if (type === 'multi') {
      eventElement = undefined;
    }

    // Call validate...
    if (this.validate(eventElement, validationCallbackValue)) {
      this.setState({ isValidated: true });
    } else {
      this.setState({ isValidated: false });
    }

    // Set the state and invoke init function.. init function is called to
    // apply a rule or invoke a callback passed for this element..
    if (type === 'file') {
      this.setState({
        [key]: e.target.files[0]
      }, () => this.init(false));
    } else if (type === 'single') {

      // Refresh the fields if the value for a single drop-down has
      // changed.. Its used to reset mobile-kpi/home-page for user
      this.resetFields(elm);

      this.setState({
        [key]: e.target.value
      }, () => this.init(false));
    } else if(type === 'multi') {
      this.setState({
        [key]: e.values
      }, () => this.init(false));
    } else {
      const found = this.state[key] ?
        this.state[key].find ((d) => d === e.target.value) : false;

      if (found) {
        const data = this.state[key].filter((d) => {
          return d !== found;
        });
        this.setState({
          [key]: data
        }, () => this.init(false));
      } else {
        this.setState({
          [key]: [e.target.value, ...this.state[key]]
        }, () => this.init(false));
      }
    }

  }

  /*
  * On change of form value will run the validation
  */
  validate = (e, validationCallbackValue) => {
    const formEl = this.formEl;
    const formLength = formEl.length;

    // @@@ CheckValidity of form element returns False if form itself is not
    // valid..
    if (formEl.checkValidity() === false) {

      // Form is not valid.. If this function is called for a specific element
      // let us add the error text for the same..
      if(e) {
        const elem = e.target;
        const errorLabel = elem.parentNode.parentNode.querySelector('.error-row .invalid');
        if (errorLabel && elem.nodeName.toLowerCase() !== 'button') {
          if (!elem.validity.valid || validationCallbackValue) {
            errorLabel.textContent = elem.dataset.errorText ? elem.dataset.errorText : elem.validationMessage;
          } else {
            errorLabel.textContent = '';
          }
        }
      } else {
        // @@@
        for (let formElemIndex = 0; formElemIndex < formLength; formElemIndex++) {
          const elem = formEl[formElemIndex];
          const errorLabel = elem.parentNode.parentNode.querySelector('.error-row .invalid');

          if (errorLabel && elem.nodeName.toLowerCase() !== 'button') {
            if (!elem.validity.valid || validationCallbackValue) {
              errorLabel.textContent = elem.dataset.errorText ? elem.dataset.errorText : elem.validationMessage;
            } else {
              errorLabel.textContent = '';
            }
          }
        }
      }

      return false;
      // @@@
    } else {

      // Form is valid.. but the element might have a validity check which
      // might have failed... In such a case, we should still return an
      // error so that submit button is not enabled.. We should also put
      // the error message as well..
      if (e) {

        const elem = e.target;
        const errorLabel = elem.parentNode.parentNode.querySelector('.error-row .invalid');

        if (errorLabel) {
          if (validationCallbackValue) {
            errorLabel.textContent = elem.dataset.errorText;
            return false;
          } else {
            errorLabel.textContent = '';
          }
        }
      } else {

        // Form is valid.. We go ahead and fix the textContent of each
        // element to empty string
        for (let formElemIndex = 0; formElemIndex < formLength; formElemIndex++) {
          const elem = formEl[formElemIndex];
          const errorLabel = elem.parentNode.parentNode.querySelector('.error-row .invalid');
          if (errorLabel && elem.nodeName.toLowerCase() !== 'button') {
            errorLabel.textContent = '';
          }
        }
      }

      // If we reached here, it means form is valid and all fields are also
      // valid
      return true;
    }
  };

  /*
  * If the form element is hidden
  */
  isHidden = (key) => {
    const allHiddenKey =  this.state.hideElm
      .map(hideElm => hideElm.elm)
      .reduce((array1, array2) => array1.concat(array2), []);

    return allHiddenKey.includes(key);
  }

  /*
  * Render elements
  * Params:
  * {
  *   key: unique identifier
  *   id: if the element is type 'ID'(for add and edit)
  *   type: define the dom type, default to 'text', valid types: text, radio, select, multiselect, file, checkbox, textarea,
  *   name: element name
  *   errorText: validation error mesage
  *   helpText: tooltip text
  *   value: defualt value
  *   props: extra configuration like css, data-* attributes etc, will be render as it is
  * }
  */
  renderForm = () => {
    const formData = this.props.formData.item;
    const isAddOrEdit = this.props.formData.action === 'add' ? true : false;

    const formUI = formData.map((m) => {

      const key = m.key;

      // If this particular key is hidden, return null for this..
      if (this.isHidden(key)) {
        return null;
      }

      const id = (!isAddOrEdit && m.id) ? true : false;
      const type = m.type || 'text';
      const props = m.props || {};
      const name = m.name;
      const errorText = m.errorText ? m.errorText : '';
      const helpText = m.helpText ? m.helpText : '';
      let value = m.value;

      const target = key;
      value = this.state[target] || '';

      // This is default input element.. We update this for type specific
      // input below..
      let input =  (<input
        {...props}
        className="form-input"
        type={type}
        key={key}
        name={name}
        value={value}
        disabled={id}
        onChange={(e)=>{this.onChange(e, target);}}
        data-error-text={errorText}
      />);

      // We have different form element used for different type of
      // inputs..
      if (type === 'radio') {
        input = m.options.map((o) => {
          const checked = o.value === value;
          return (
            <div className="col-md-2" key={'fr' + o.key}>
              <input
                {...props}
                className=""
                type="radio"
                key={o.key}
                name={o.name}
                checked={checked}
                value={o.value}
                onChange={(e)=>{this.onChange(e, o.name);}}
              />
              <label key={'ll' + o.key}>{o.label}</label>
            </div>
          );
        });
        input = <div className="form-group-radio">{input}</div>;
      }

      if (type === 'select') {

        // Find accessor function if provided for this field..
        const accessor = this.props.formData.accessor &&
                         this.props.formData.accessor.find(acc => acc.columnName === m.key);

        // Create the options for this..
        input = m.options.map((o) => {
          return (
            <option
              {...props}
              key={o.key}
              value={o.value}
            >{accessor ? accessor.func(m.key, o.value) : o.value}
            </option>
          );
        });

        // Value can be in the object format so we must use accessor function
        // if available to convert the value for display purposes
        value = accessor ? accessor.func(m.key, value) : value;

        input = <select className="form-input" value={value} onChange={(e)=>{this.onChange(e, m.key);}}>{input}</select>;
      }

      if(type === 'multiSelect') {

        const accessor = this.props.formData.accessor && this.props.formData.accessor.find(acc => acc.columnName === m.key);
        let selected = [];

        // Create the list of values to be displayed for a
        // multi-select dropdown
        if(value !== '') {

          // The value might already be in an array
          if(Array.isArray(value)) {
            selected = value;
          } else if(typeof value === 'string') {

            // If its in string format, convert this into an array
            try {
              const valObj = JSON.parse(value);
              selected = valObj.map(val => accessor.func(m.key, val));

              // If we didn't find any match in values, we should use an
              // empty list
              if (selected[0] === undefined) {
                selected = [];
              }

            } catch (e) {
              selected = [value];
            }
          }
        }

        // Use the directive for multi-select dropdown
        input =  (<VunetSelect
          placeholder="Select"
          options={m.options}
          values={selected}
          callback={(e) => {this.onChange(e, m.key, 'multi');}}
          multiple
        />);
      }

      // If a file input is to be taken..
      if (type === 'file') {
        input =  (
          <input
            {...props}
            className="form-input"
            key={key}
            type={type}
            onChange={(e)=>{this.onChange(e, target, 'file');}}
          />
        );
      }

      // If input is of large size and we use textarea..
      if(type === 'textarea') {
        if(Array.isArray(value)) {value = value.join('\n');}
        input = (
          <textarea
            {...props}
            rows="5"
            className="form-input textarea-height"
            onChange={(e)=>{this.onChange(e, target);}}
            value={value}
          />
        );
      }

      // If we need to create a checkbox..
      if (type === 'checkbox') {

        input = m.options.map((o) => {

          let checked = false;
          if (value && value.length > 0) {
            checked = value.indexOf(o.value) > -1 ? true : false;
          }

          return (
            <div className="col-md-2" key={'cfr' + o.key}>
              <input
                {...props}
                className="form-control form-input"
                type="checkbox"
                key={o.key}
                name={o.name}
                checked={checked}
                value={o.value}
                onChange={(e)=>{this.onChange(e, m.key, 'multiple');}}
              />
              <label key={'ll' + o.key}>{o.label}</label>
            </div>
          );
        });

        input = <div className="form-group-checkbox">{input}</div>;

      }

      // Return the complete input element if its not a hidden element..
      return (
        <div key={'g' + key} className="form-group row">
          <div className="row">
            <label
              className="form-label"
              key={'l' + key}
              htmlFor={key}
            >
              {m.label}
            </label>
            {helpText !== '' &&
              <span className="dynamic-form-tooltip">
                <i className="fa fa-question-circle" />
                <span className="tooltiptext">{helpText}</span>
              </span>
            }
          </div>
          <div className="row">
            {input}
          </div>
          <div className="row error-row">
            <div className="invalid" />
          </div>
        </div>
      );
    });
    return formUI;
  }

  // Render the form
  render() {
    return (
      <div className="vunet-dynamic-form-div">
        <form
          className={'vunet-dynamic-form ' + (this.state.isValidated ? 'was-validated' : '')}
          noValidate
          onSubmit={(e)=>{this.onSubmit(e);}}
          ref={form => (this.formEl = form)}
        >
          <div className="form-components-wrapper">
            {this.renderForm()}
          </div>
          <div className="row form-actions">
            <button className="kuiButton kuiButton--hollow vunet-button" onClick={(e)=>{this.onCancel(e);}}>Cancel</button>
            <button disabled={!this.state.isValidated} className="kuiButton kuiButton--primary vunet-button" type="submit">Submit</button>
          </div>
        </form>
      </div>
    );
  }
}

VunetDynamicFormBuilder.propTypes = {
  className: PropTypes.string, //form class for applying custom css
  formData: PropTypes.object, // formData - data for edit
  onSubmit: PropTypes.func, // submit callback
  onCancel: PropTypes.func // cancel callback
};
