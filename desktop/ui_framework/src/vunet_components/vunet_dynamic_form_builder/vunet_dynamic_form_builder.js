
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
import { VunetCronTab } from '../vunet_cron_tab/vunet_cron_tab';
import { VunetHelp } from 'ui_framework/src/vunet_components/vunet_help/vunet_help';

export class VunetDynamicFormBuilder extends Component {

  constructor(props) {
    super(props);

    // Create an operdict
    const listOperDictCopy = {};
    this.props.formData.item.forEach(_item => {
      if (_item.type === 'formGroup') {
        listOperDictCopy[_item.key] = {};
        listOperDictCopy[_item.key].isListValidated = false;
        listOperDictCopy[_item.key].showFormGroup = false;
      }
    });

    this.state = {
      isValidated: false,
      listOperDict: listOperDictCopy,
      helpOperationsDict: {},
      hideElm: [],
      operDict: {}
    };
  }

  static defaultProps = { buttonsList: ['Cancel', 'Submit'] }

  componentDidMount() {

    // If the 'vunet_dynamic_form_builder' component is being called from
    // 'vunet_form_wizard' component, then check for 'isParentFormWizard'
    // flag and do a form validation. This is done to enable the buttons
    // for transitions between the forms in the wizard for a saved
    // instance ( 'Edit form'  use case)
    if (this.props.formData && this.props.formData.isParentFormWizard) {
      this.setState({ ...this.props.formData.editData }, function () { // eslint-disable-line
        this.setState({ isValidated: this.formEl.checkValidity() });
      });
    } else {
      this.setState({ ...this.props.formData.editData }); // eslint-disable-line
    }
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

    // helpOperationsDict is an object which maintains boolean values to
    // hide / show the help content for a field.
    const helpOperationsDictCopy = _.cloneDeep(this.state.helpOperationsDict);

    if (initial) {
      this.props.formData.item.forEach(_item => {
        if (_item.rules) {
          hideElm = this.applyRule(this.props.formData.editData[_item.key], _item.rules, hideElm);
        }
        if (_item.callback) {
          _item.callback(_item.key, this.props.formData.editData);
        }

        // Set the help contents collapsed for all the fields
        // on loading the form.
        if (_item.helpObj) {
          helpOperationsDictCopy[_item.name] = false;
        }

        // Set the help contents collapsed for all the fields in form group
        // on loading the form. This is not in use for now. Lets keep this
        // commented for now.
        // if (_item.type === 'formGroup') {
        //   helpOperationsDictCopy[_item.key] = {};
        //   _item.content.metaData.forEach((obj) => {
        //     if (obj.helpObj) {
        //       helpOperationsDictCopy[_item.key][obj.key] = false;
        //     }
        //   });
        // }
      });
      this.setState({ helpOperationsDict: helpOperationsDictCopy });
    } else {
      this.props.formData.item.forEach(_item => {
        if (_item.rules) {
          hideElm = this.applyRule(this.state[_item.key], _item.rules, hideElm);
        }

        // We should be calling the callback only when a particular item has
        // changed.. we need to enhance this...
        if (_item.callback) {
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
    if (curRule && curRule.elm) {
      curRule.elm = [];
    }
    // @@@
    if (rules.options.length) {
      rules.options.forEach(rule => {
        // Check rule.value and value selected from selected box is same or not
        // then update the hideElm for a particular selected field.
        if (rule.value === value) {
          rule.actions.forEach(action => {
            switch (Object.keys(action)[0]) {
              case 'hide':
                hideElm = [...hideElm, { name: rules.name, elm: [...action.hide] }];
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

    // We pass the state in onCancel as this can be used as
    // a callback function in other components.
    // Example: The 'vunetFormWizard' component calls the
    // 'vunetDynamicFormBuilder' component with its prevStep
    // function as a callback to onCancel function in
    // vunetDynamicFormBuilder.
    if (this.props.onCancel) {
      this.props.onCancel(this.state);
    }
  }

  /*
  * Cancel callback of form group
  */
  onCancelFormGroup = (parentKey) => {
    const listOperDictCopy = { ...this.state.listOperDict };
    listOperDictCopy[parentKey].showFormGroup = false;
    listOperDictCopy[parentKey].rowIndex = -1;
    this.setState({ listOperDict: listOperDictCopy });
  }

  // This function is called to add the currently open row to the
  // corresponding formGroup list
  addRowToFormGroup = (parentKey, childKeyList) => {
    const listOperDictCopy = { ...this.state.listOperDict };
    const formGroupStateKeys = childKeyList.map(chKey => { return parentKey + '$' + chKey; });
    let formGroupData = this.state[parentKey] ? this.state[parentKey] : [];
    const formGroupInnerData = {};

    // Create a dict with the formGroup object's field keys
    childKeyList.forEach(chKey => {
      formGroupInnerData[chKey] = this.state[parentKey + '$' + chKey];
    });

    // Get the rowIndex for this entry
    const rowIndex = listOperDictCopy[parentKey].rowIndex;

    // If rowIndex is anything other than -1, we should overwrite that row
    // in the state instead of appending things..
    if (rowIndex !== -1) {
      // Splice the row in formGroupData
      formGroupData[rowIndex] = formGroupInnerData;
    } else {
      formGroupData = [...formGroupData, ...[formGroupInnerData]];
    }

    // Save the updated list object (form group) to the state.
    this.setState({ [parentKey]: formGroupData }, () => {

      // Delete the temporary entries..
      formGroupStateKeys.forEach(formGroupStateKey => {
        delete this.state[formGroupStateKey];
      });
    });

    // update the operDict flags after adding an entry.
    listOperDictCopy[parentKey].isListValidated = false;
    listOperDictCopy[parentKey].showFormGroup = false;
    this.setState({ listOperDict: listOperDictCopy });
  }

  // Called for editing the specific row..
  editRowInFormGroup = function (parentKey, childKeyList, rowIndex) {
    const formGroupStateKeys = childKeyList.map(chKey => { return parentKey + '$' + chKey; });
    const formGroupData = this.state[parentKey][rowIndex];

    // Set the operational data
    const listOperDictCopy = { ...this.state.listOperDict };
    listOperDictCopy[parentKey].showFormGroup = true;
    listOperDictCopy[parentKey].rowIndex = rowIndex;
    this.setState({ listOperDict: listOperDictCopy });

    // Iterate on keys and set the state variable in temporary fields from
    // the row
    formGroupStateKeys.forEach(key => {
      const newKey = key.split('$');
      this.setState({
        [key]: formGroupData[newKey[1]],
      });
    });
  }

  // This is called when a formGroup row is deleted, it removes the
  // row from the state and set the state again
  deleteRowInFormGroup = function (parentKey, rowIndex) {

    // Get the formGroupData dict from state
    const formGroupData = this.state[parentKey] ? this.state[parentKey] : [];

    // Splice the row with rowIndex
    if (formGroupData.length > 0) {
      formGroupData.splice(rowIndex, 1);
    }

    //Set the state again..
    this.setState({ [parentKey]: formGroupData });
  }

  // This function updates the boolean value of the field
  // to hide / show the help content when its help icon is
  // clicked.
  toggleHelpContent = (target) => {

    // If the field modified is form group, then the
    // target will have $ in it.
    const keysList = target.split('$');

    // If the length of the 'keysList' is greater than one,
    // It means, the target recevied is the key of element
    // inside a 'formGroup'.
    if (keysList.length > 1) {

      // Get the parent and child keys
      const parentKey = keysList && keysList[0];
      const childKey = keysList && keysList[1];
      const helpOperationsDictCopy = _.cloneDeep(this.state.helpOperationsDict);
      helpOperationsDictCopy[parentKey][childKey] = !this.state.helpOperationsDict[parentKey][childKey];
      this.setState({ helpOperationsDict: helpOperationsDictCopy });
    } else {

      // Here the key of element is outside the 'formGroup'.
      // Toggle the help content section for this field and
      // update the state.
      const helpOperationsDictCopy = _.cloneDeep(this.state.helpOperationsDict);
      helpOperationsDictCopy[target] = !this.state.helpOperationsDict[target];
      this.setState({ helpOperationsDict: helpOperationsDictCopy });
    }
  }

  /*
  * On change of form value will update the state
  * And also apply rule if applicabale
  */
  onChange = (e, key, type = 'single') => {
    // Find the element from props..
    let parentElm = {};
    let elm = {};
    let formGroup = false;

    // If we find a '$' in key, we consider it
    // to be a key of a form element under form group.
    if (key.indexOf('$') > 0) {

      // get the parent and child keys in an array (keys).
      // the string before the $ has the parent key.
      const keys = key.split('$');

      // get the form group
      parentElm = this.props.formData.item.find(_item => _item.key === keys[0]);

      // If we dont find the parent element we do not
      // proceed.
      if (parentElm === undefined) {
        return;
      }

      // get the element inside the form group.
      elm = parentElm.content.metaData.find(_item => _item.key === keys[1]);
      formGroup = true;

      // get the form element which is not inside the form group
    } else {
      elm = this.props.formData.item.find(_item => _item.key === key);
    }

    // If we dont find the element we do not
    // validate it.
    if (elm === undefined) {
      return;
    }
    // Validate the content to set isValidated flag.. This flag is checked to
    // enable/disable Submit button..
    let validationCallbackValue = false;
    if (elm.validationCallback) {

      // If input is checkbox, the value is available in e.target.checked
      if (type === 'checkBox') {
        validationCallbackValue = elm.validationCallback(key, e.target.checked);
      } else {
        validationCallbackValue = elm.validationCallback(key, e.target.value);
      }
    }

    if (formGroup) {
      const formEl = this.formEl;
      const formLength = formEl.length;
      let isListValidated = true;

      // If the form is invalid, check for validity for
      // every element in the form.
      if (formEl.checkValidity() === false) {
        for (let count = 0; count < formLength; count++) {
          const elem = formEl[count];

          // If any element in the form is invalid
          // find if this element exists under a form group(listElement)
          if (!elem.validity.valid) {
            if (parentElm.content.metaData.find(item => item.name === elem.name)) {

              // Set the validation flag for the corresponding
              // form group. This will be used to disable the form group
              // submit button if any element in it is invalid.
              isListValidated = false;
            }
          }
        }
      }
      // Create an operdict
      const listOperDictCopy = { ...this.state.listOperDict };
      listOperDictCopy[parentElm.key].isListValidated = isListValidated;
      this.setState({ listOperDict: listOperDictCopy });
    }


    // If element is other than multi-select or cronTab, check the content by invoking
    // the validate function.. If element is multi-select or cronTab, we should just
    // validate the form and set validated to true if form is valid.
    let eventElement = e;
    if (type === 'multi' || type === 'cronTab') {
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

    } else if (type === 'checkBox') {
      // check for non empty and non zero value then Typecast it to a Number for type number.
      this.setState({
        [key]: e.target.checked
      }, () => {
        this.init(false);
      });

    } else if (type === 'cronTab') {

      // Here 'e' is an object with cronString and
      // schedule frequency.
      this.setState(
        {
          [key]: e.cronString,
          scheduleFrequency: e.scheduleFrequency,
        });

    } else if (type === 'number') {
      // check for non empty and non zero value then Typecast it to a Number for type number.
      this.setState({
        [key]: e.target.value && Number(e.target.value)
      }, () => this.init(false));

    } else if (type === 'multi') {
      this.setState({
        [key]: e.values
      }, () => this.init(false));
    } else {
      const found = this.state[key] ?
        this.state[key].find((d) => d === e.target.value) : false;

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
    const multiSelect = document.getElementsByClassName('selection');
    let errorFlag = false;
    // @@@ CheckValidity of form element returns False if form itself is not
    // valid..
    if (formEl.checkValidity() === false) {

      // Form is not valid.. If this function is called for a specific element
      // let us add the error text for the same..
      if (e) {
        const elem = e.target;
        const errorLabel = elem.parentNode.parentNode.parentNode.querySelector('.error-row .invalid');
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
          const errorLabel = elem.parentNode.parentNode.parentNode.querySelector('.error-row .invalid');

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

      //Form is valid.. but we check to see whether the multi-select
      //elements validity fails or not.
      if(multiSelect.length > 0) {
        for(let i = 0; i < multiSelect.length; i++) {
          if(multiSelect[i].ariaRequired && multiSelect[i].innerText === 'Select') {
            errorFlag = true;
            multiSelect[i].parentNode.parentNode.nextSibling.childNodes[0].innerText = 'Please select a value for this field';
          }else {
            multiSelect[i].parentNode.parentNode.nextSibling.childNodes[0].innerText = '';
          }
        }
      }

      // Form is valid.. but the element might have a validity check which
      // might have failed... In such a case, we should still return an
      // error so that submit button is not enabled.. We should also put
      // the error message as well..
      if (e) {

        const elem = e.target;
        const errorLabel = elem.parentNode.parentNode.parentNode.querySelector('.error-row .invalid');
        if (errorLabel) {
          if (validationCallbackValue) {
            errorLabel.textContent = elem.dataset.errorText;
            return false;
          } else {
            errorLabel.textContent = '';
            // Check if error messages are shown for any of the form inputs. If yes,
            // invalidate the form. This is added to take care of multiple validation
            // callbacks in a form. For example: schedule name and backup location in
            // Backup section.
            for (let formElemIndex = 0; formElemIndex < formLength; formElemIndex++) {
              const elem = formEl[formElemIndex];
              const errorLabel = elem.parentNode.parentNode.parentNode.querySelector('.error-row .invalid');
              if (errorLabel && elem.nodeName.toLowerCase() !== 'button' &&
                errorLabel.textContent !== null &&
                errorLabel.textContent.length > 0 && e.target.type !== 'checkbox') {
                return false;
              }
              else {
                if(errorLabel !== null)
                {errorLabel.textContent = '';}
              }
            }
          }
        }
      } else {

        // Form is valid.. We go ahead and fix the textContent of each
        // element to empty string
        for (let formElemIndex = 0; formElemIndex < formLength; formElemIndex++) {
          const elem = formEl[formElemIndex];
          const errorLabel = elem.parentNode.parentNode.parentNode.querySelector('.error-row .invalid');
          if (errorLabel && elem.nodeName.toLowerCase() !== 'button') {
            errorLabel.textContent = '';
          }
        }
      }

      //return false if the multi-select type fails validation.
      if(errorFlag) return false;

      // If we reached here, it means form is valid and all fields are also
      // valid
      return true;
    }
  };

  /*
  * If the form element is hidden
  */
  isHidden = (key) => {
    const allHiddenKey = this.state.hideElm
      .map(hideElm => hideElm.elm)
      .reduce((array1, array2) => array1.concat(array2), []);

    return allHiddenKey.includes(key);
  }

  /*
  * This function is used to display the form group
  * when add or edit is clicked for a particular form group
  */
  showFormGroupSection = (formGroupkey, formGroupDefaultData) => {
    const listOperDictCopy = { ...this.state.listOperDict };

    // Initialize a dictionary to store the default values to the
    // for the fields in form group.
    const formGroupChildKeys = {};
    listOperDictCopy[formGroupkey].showFormGroup = true;
    listOperDictCopy[formGroupkey].rowIndex = -1;

    // Populate the default values received for the
    // formgroup
    for (const key in formGroupDefaultData) {
      if (formGroupDefaultData.hasOwnProperty(key)) {
        formGroupChildKeys[formGroupkey + '$' + key] = formGroupDefaultData[key];
      }
    }

    // Update the state with keys of formgroup that is being configured.
    // This is done to reflect the default values in form group UI.
    this.setState({ ...formGroupChildKeys });
    this.setState({ listOperDict: listOperDictCopy });
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
  *   helpObj: help text
  *   value: defualt value
  *   props: extra configuration like css, data-* attributes etc, will be render as it is
  * }
  */
  renderForm = (formData, parentKey = '') => {
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
      let value = m.value;
      // If the form element belongs to a form group, we prepend the
      // key with parentKey received as argument with a '$' in the middle.
      const target = parentKey !== '' ? parentKey + '$' + key : key;
      value = this.state[target] || '';

      // This is default input element.. We update this for type specific
      // input below..
      let input = (
        <div className="text-input-container">
          <input
            {...props}
            className="form-input"
            type={type}
            key={key}
            name={name}
            value={value}
            disabled={id}
            onChange={(e) => { this.onChange(e, target); }}
            data-error-text={errorText}
          />
        </div>
      );

      // We have different form element used for different type of
      // inputs..
      if (type === 'number') {

        // Re assigne the value for type number 0 if it is coming in value
        if (this.state[target] === 0) {
          value = 0;
        }

        input = (
          <div className="number-input-container">
            <input
              {...props}
              className="form-input"
              type={type}
              key={key}
              name={name}
              value={value}
              disabled={id}
              onChange={(e) => { this.onChange(e, target, 'number'); }}
              data-error-text={errorText}
            />
          </div>);
      }

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
                onChange={(e) => { this.onChange(e, o.name); }}
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
            >{accessor ? accessor.func(m.key, o.value) : o.label}
            </option>
          );
        });

        // Value can be in the object format so we must use accessor function
        // if available to convert the value for display purposes
        value = accessor ? accessor.func(m.key, value) : value;

        input = (
          <div className="select-input-container">
            <select
              className="form-input"
              value={value}
              data-error-text={errorText}
              onChange={(e) => { this.onChange(e, target); }}
            >
              {input}
            </select>
          </div>);
      }

      if (type === 'multiSelect') {

        const accessor = this.props.formData.accessor && this.props.formData.accessor.find(acc => acc.columnName === m.key);
        let selected = [];

        // Create the list of values to be displayed for a
        // multi-select dropdown
        if (value !== '') {

          // The value might already be in an array
          if (Array.isArray(value)) {
            selected = value;
          } else if (typeof value === 'string') {

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
        input = (<VunetSelect
          placeholder="Select"
          options={m.options}
          values={selected}
          callback={(e) => { this.onChange(e, m.key, 'multi'); }}
          multiple
          disabled={id}
          required={props.required}
        />);
      }

      // If a file input is to be taken..
      if (type === 'file') {
        input = (
          <div className="file-input-container">
            <input
              {...props}
              className="form-input"
              key={key}
              type={type}
              disabled={id}
              onChange={(e) => { this.onChange(e, target, 'file'); }}
            />
          </div>
        );
      }

      // If input is of large size and we use textarea..
      if (type === 'textarea') {
        if (Array.isArray(value)) { value = value.join('\n'); }
        input = (
          <div className="textarea-container">
            <textarea
              {...props}
              rows="5"
              className="form-input textarea-height"
              onChange={(e) => { this.onChange(e, target); }}
              value={value}
            />
          </div>
        );
      }

      // If we need to create a checkbox..
      if (type === 'checkbox') {

        input = (
          <div className="checkbox-container">
            <input
              {...props}
              className=""
              type="checkbox"
              key={key}
              name={name}
              value={value}
              checked={value}
              disabled={id}
              data-error-text={errorText}
              onChange={(e) => { this.onChange(e, target, 'checkBox'); }}
            /><span className="checkbox-label">{m.label} </span>
          </div>
        );
      }

      if (type === 'formGroup') {

        // This is a form group... We need to add an object for this in
        // state's operDict as well

        const formGroupKeys = m.content.metaData.map((o) => o.key);
        const tableRows = this.state[m.key] && this.state[m.key].map((row, rowIndex) => {
          return (
            <tr key={rowIndex}>
              {Object.keys(row)
                .map((key, index) => <td key={index}> {row[formGroupKeys[index]]} </td>)
              }
              <td>
                <span onClick={() => { this.editRowInFormGroup(m.key, formGroupKeys, rowIndex); }}>
                  <i className="fa fa-pencil" />
                </span>
                <span onClick={() => { this.deleteRowInFormGroup(m.key, rowIndex); }}>
                  <i className="fa fa-trash" />
                </span>
              </td>
            </tr>
          );
        });

        const tableHeaders = m.content.metaData.map((o, index) => <th key={index}>{o.key}</th>);

        if (this.state[m.key] && this.state[m.key].length > 0) {
          tableHeaders.push(<th key="action">Action</th>);
        }

        const inputGroup = this.renderForm(m.content.metaData, m.key);
        input = (
          <div className="form-group-wrapper">
            <table className="table">
              <thead>
                <tr>{tableHeaders}</tr>
              </thead>
              <tbody>{tableRows}</tbody>
            </table>
            {this.state.listOperDict[key].showFormGroup &&
              <div>
                <fieldset key={key}>
                  {inputGroup}
                </fieldset>
                <div
                  className="form-group-buttons-container"
                >
                  <button
                    className="kuiButton kuiButton--hollow vunet-button"
                    type="button"
                    onClick={() => { this.onCancelFormGroup(key); }}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!this.state.listOperDict[key].isListValidated}
                    className="kuiButton kuiButton--hollow vunet-button"
                    type="button"
                    onClick={() => { this.addRowToFormGroup(key, formGroupKeys); }}
                  >
                    {this.state.listOperDict[m.key].rowIndex === -1 && 'Add Entry'}
                    {this.state.listOperDict[m.key].rowIndex > -1 && 'Update Entry'}
                  </button>
                </div>
              </div>
            }
          </div>);
      }

      if (type === 'html') {
        input = <div className="html-container" dangerouslySetInnerHTML={{ __html: m.htmlContent }} />;
      }

      if (type === 'header') {
        input = <div />;
      }

      if (type === 'paragraph') {
        input = (<div className="paragraph-container">{m.textContent}</div>);
      }

      if (type === 'button') {
        input = (
          <div className="form-button-wrapper">
            <button
              className={'btn form-button ' + m.buttonType}
              type="button"
              name={m.name}
              onClick={(e) => { this.props.formData.buttonCallback(e); }}
            >
              {m.label}
            </button>
          </div>
        );
      }

      if (type === 'referenceLink') {
        input = (
          <div className="reference-link-wrapper">
            <a
              className="form-link"
              name={m.name}
              href={m.url}
            > {m.label}
            </a>
          </div>
        );
      }

      if (type === 'separator') {
        input = (
          <div className="horizontal-separator" />
        );
      }

      if (type === 'crontab' && this.state && this.state.scheduleFrequency) {
        input = (
          <div key="crontabcontainer" className="crontab-container">
            <VunetCronTab
              getCronInfo={this.onChange}
              jobName={m.key}
              frequency={this.state.scheduleFrequency}
              cronString={this.state.cronString}
            />
          </div>
        );
      }

      // if (type === 'stepper') {
      //   input = (
      //     <VunetStepper
      //       data={m.content}
      //     />
      //   );
      // }

      // Return the complete input element if its not a hidden element..
      return (
        <div key={'g' + key} className="form-group row">
          {
            (m.type !== 'stepper' &&
              m.type !== 'html' &&
              m.type !== 'button' &&
              m.type !== 'checkbox' &&
              m.type !== 'referenceLink' &&
              m.type !== 'paragraph') &&
              <div className="row">
                <label
                  className="form-label"
                  key={'l' + key}
                  htmlFor={key}
                >
                  <span>{m.label}</span>
                  {m.type === 'formGroup' &&
                    <span
                      className="add-row-icon"
                      onClick={() => { this.showFormGroupSection(m.key, m.content.data); }}
                    >
                      <i className="fa fa-plus-circle" />
                    </span>
                  }
                </label>

                {/* Help icon will be displayed if help obj is passed in metadata */}
                {m.helpObj &&
                  <span>
                    <i
                      className="help-icon icon-help-blue"
                      onClick={() => { this.toggleHelpContent(target); }}
                    />
                  </span>
                }

                {/* Help component that will be displayed when help icon is clicked */}
                {m.helpObj && this.state.helpOperationsDict[key] &&
                  <VunetHelp
                    metaData={m.helpObj}
                    onClose={() => { this.toggleHelpContent(target); }}
                  />
                }

                {/* Help component for form Group that will be displayed when help icon is clicked.
                Lets keep this commented as this is not being used as of now */}
                {/* {m.helpObj && parentKey.length > 0 &&
                  this.state.helpOperationsDict &&
                  Object.keys(this.state.helpOperationsDict).length &&
                  this.state.helpOperationsDict[parentKey] &&
                  Object.keys(this.state.helpOperationsDict[parentKey]).length &&
                  this.state.helpOperationsDict[parentKey][key] &&
                  <VunetHelp
                    backgroundColor="white"
                    metaData={m.helpObj}
                    onClose={() => { this.toggleHelpContent(target); }}
                  />
                } */}
              </div>
          }
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
          name="dynamic-form"
          className={'vunet-dynamic-form ' + (this.state.isValidated ? 'was-validated' : '')}
          noValidate
          onSubmit={(e) => { this.onSubmit(e); }}
          ref={form => (this.formEl = form)}
        >
          <div className="form-components-wrapper">
            {this.renderForm(this.props.formData.item)}
          </div>
          <div className="row form-actions">
            <button
              className="kuiButton kuiButton--hollow vunet-button"
              onClick={(e) => { this.onCancel(e); }}
            >
              {this.props.buttonsList[0]}
            </button>
            <button
              disabled={!this.state.isValidated}
              className="kuiButton kuiButton--primary vunet-button"
              type="submit"
            >
              {this.props.buttonsList[1]}
            </button>
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
  onCancel: PropTypes.func, // cancel callback
  buttonsList: PropTypes.array // display names for the form action buttons
};
