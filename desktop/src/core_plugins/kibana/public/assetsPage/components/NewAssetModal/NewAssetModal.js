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

// Copyright 2021 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React from 'react';
// import PropTypes from 'prop-types';
import chrome from 'ui/chrome';
import { produce } from 'immer';
import './NewAssetModal.less';

export class NewAssetModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceType: this.props.deviceType.sort(),
      vendorList: this.props.vendorList.sort(),
      displayInterfaceInput: false,
      editInterfaceInput: false,
      interfaceObject: {
        interfaceName: '',
        interfaceIp: '',
      },
      editInterfaceList: {},
      interfaceList: this.props.editAssetDetails.interface_list,
      assetObject: this.props.editAssetDetails,
      errorType: {
        interfaceName: false,
        interfaceNameRequired: false,
        interfaceIp: false,
        interfaceIPRequired: false,
        systemIP: false,
        systemIPRequired: false,
        deviceName: false,
        deviceNameRequired: false,
        portListInvalid: false,
        tagsInvalid: false,
      },
      validInterface: false,
      interfaceIndex: -1,
    };
  }

  componentWillReceiveProps(newProps) {
    if (
      newProps.editAssetDetails.system_ip !== 'undefined' &&
      newProps.editAssetDetails.device_name !== 'undefined'
    ) {
      document.getElementById('submitButton').disabled = true;
    }
    this.setState({
      deviceType: newProps.deviceType.sort(),
      vendorList: newProps.vendorList.sort(),
      interfaceList: newProps.editAssetDetails.interface_list,
      assetObject: newProps.editAssetDetails,
    });
  }

  //this method will be called to renderthe options for dropdown of deviceType.
  renderDeviceType = () => {
    return (
      this.state.deviceType &&
      this.state.deviceType.map((device) => {
        return (
          <option key={device} value={device}>
            {device}
          </option>
        );
      })
    );
  };

  //this method will be called to renderthe options for dropdown of vendorName.
  renderVendorName = () => {
    return (
      this.state.vendorList &&
      this.state.vendorList.map((vendor) => {
        return (
          <option key={vendor} value={vendor}>
            {vendor}
          </option>
        );
      })
    );
  };

  //this method is called when the submit button is clicked.
  handleSubmit = (e) => {
    let urlBase = chrome.getUrlBase();
    let method;

    e.preventDefault();
    if (
      !this.state.assetObject.node_id ||
      this.state.assetObject.node_id === ''
    ) {
      urlBase = urlBase + '/asset/';
      method = 'POST';
    } else {
      urlBase = urlBase + '/asset/' + this.state.assetObject.node_id;
      method = 'PUT';
    }
    this.props.handleAssetSubmit(method, urlBase, this.state.assetObject);
  };

  //this method is called when any input field in the asset modal changes,
  //based on the value of the field necessary state variable is changed.
  onChange = (e, field) => {
    // eslint-disable-next-line prefer-const
    let errorType = this.state.errorType;
    e.preventDefault();
    let asset = this.state.assetObject;
    if (asset.node_id !== '') {
      document.getElementById('submitButton').disabled = false;
    }
    switch (field) {
      case 'systemIP':
        if (
          e.target.value === '' &&
          document.getElementById('deviceName').value === ''
        ) {
          errorType = produce(this.state.errorType, (draft) => {
            draft.systemIPRequired = true;
            draft.systemIP = false;
          });
        } else if (
          e.target.value.match(
            '^(([1-9]?\\d|1\\d\\d|25[0-5]|2[0-4]\\d)\\.){3}([1-9]?\\d|1\\d\\d|25[0-5]|2[0-4]\\d)$'
          ) === null &&
          e.target.value !== ''
        ) {
          errorType = produce(this.state.errorType, (draft) => {
            draft.systemIP = true;
            draft.systemIPRequired = false;
          });
        } else {
          errorType = produce(this.state.errorType, (draft) => {
            draft.systemIP = false;
            draft.systemIPRequired = false;
            draft.deviceNameRequired = false;
          });
        }
        asset = produce(this.state.assetObject, (draft) => {
          draft.system_ip = e.target.value;
        });
        break;
      case 'deviceName':
        if (
          e.target.value === '' &&
          document.getElementById('systemIP').value === ''
        ) {
          errorType = produce(this.state.errorType, (draft) => {
            draft.deviceNameRequired = true;
            draft.deviceName = false;
          });
        } else if (
          e.target.value.match('^[a-zA-Z0-9!@#$&()\\-`.+,/"]*$') === null
        ) {
          errorType = produce(this.state.errorType, (draft) => {
            draft.deviceName = true;
            draft.deviceNameRequired = false;
          });
        } else {
          errorType = produce(this.state.errorType, (draft) => {
            draft.deviceNameRequired = false;
            draft.deviceName = false;
            draft.systemIPRequired = false;
          });
        }
        asset = produce(this.state.assetObject, (draft) => {
          draft.device_name = e.target.value;
        });
        break;
      case 'vendorName':
        asset = produce(this.state.assetObject, (draft) => {
          draft.vendor_name = e.target.value;
        });
        break;
      case 'deviceType':
        asset = produce(this.state.assetObject, (draft) => {
          draft.device_type = e.target.value;
        });
        break;
      case 'portList':
        if (
          e.target.value !== '' &&
          e.target.value.match('^[0-9]*(,[0-9]+)*$') === null
        ) {
          errorType = produce(this.state.errorType, (draft) => {
            draft.portListInvalid = true;
          });
        } else {
          errorType = produce(this.state.errorType, (draft) => {
            draft.portListInvalid = false;
          });
        }
        asset = produce(this.state.assetObject, (draft) => {
          draft.port_list = e.target.value.split(',');
        });
        break;
      case 'location':
        asset = produce(this.state.assetObject, (draft) => {
          draft.location = e.target.value;
        });
        break;
      case 'contactDetails':
        asset = produce(this.state.assetObject, (draft) => {
          draft.contact_details = e.target.value;
        });
        break;
      case 'maintainanceMode':
        asset = produce(this.state.assetObject, (draft) => {
          draft.maintenance_mode = JSON.parse(e.target.value);
        });
        break;
      case 'tags':
        if (
          e.target.value !== '' &&
          e.target.value.match('[0-9a-zA-Z]+(,[0-9a-zA-Z]+)*(, s*d+)*$') ===
            null
        ) {
          errorType = produce(this.state.errorType, (draft) => {
            draft.tagsInvalid = true;
          });
        } else {
          errorType = produce(this.state.errorType, (draft) => {
            draft.tagsInvalid = false;
          });
        }
        asset = produce(this.state.assetObject, (draft) => {
          draft.tags = e.target.value.split(',');
        });
        break;
      default:
        break;
    }

    if (
      document.getElementById('systemIP').value === '' &&
      document.getElementById('deviceName').value === ''
    ) {
      errorType = produce(errorType, (draft) => {
        draft.systemIPRequired = true;
      });
    }
    if (Object.values(errorType).includes(true)) {
      document.getElementById('submitButton').disabled = true;
    } else {
      document.getElementById('submitButton').disabled = false;
    }
    this.setState({ assetObject: asset, errorType: errorType });
  };

  //this method is called when the input fields of the interface input is changed.
  handleInterfaceChange = (e, type, index) => {
    // eslint-disable-next-line prefer-const
    let interfaceList =
      this.state.interfaceList &&
      this.state.interfaceList.map((obj) => ({ ...obj }));
    // eslint-disable-next-line prefer-const
    let errorType;
    let validInterface;
    if (this.state.assetObject.node_id !== '') {
      document.getElementById('submitButton').disabled = false;
    }

    if (type === 'interfaceName') {
      if (e.target.value === '') {
        errorType = produce(this.state.errorType, (draft) => {
          draft.interfaceNameRequired = true;
          draft.interfaceName = false;
        });
      } else if (
        e.target.value.match('^[a-zA-Z0-9!@#$&()\\-`.+,/"]*$') === null
      ) {
        errorType = produce(this.state.errorType, (draft) => {
          draft.interfaceName = true;
          draft.interfaceNameRequired = false;
        });
      } else {
        if (document.getElementById('interfaceIp').value === '') {
          errorType = produce(this.state.errorType, (draft) => {
            draft.interfaceName = false;
            draft.interfaceNameRequired = false;
            draft.interfaceIPRequired = true;
          });
        } else {
          errorType = produce(this.state.errorType, (draft) => {
            draft.interfaceName = false;
            draft.interfaceNameRequired = false;
            draft.interfaceIPRequired = false;
          });
        }
      }
      interfaceList[index].interfaceName = e.target.value;
    } else {
      if (e.target.value === '') {
        errorType = produce(this.state.errorType, (draft) => {
          draft.interfaceIPRequired = true;
          draft.interfaceIp = false;
        });
      } else if (
        e.target.value.match(
          '^(([1-9]?\\d|1\\d\\d|25[0-5]|2[0-4]\\d)\\.){3}([1-9]?\\d|1\\d\\d|25[0-5]|2[0-4]\\d)$'
        ) === null
      ) {
        errorType = produce(this.state.errorType, (draft) => {
          draft.interfaceIp = true;
          draft.interfaceIPRequired = false;
        });
      } else {
        if (document.getElementById('interfaceName').value === '') {
          errorType = produce(this.state.errorType, (draft) => {
            draft.interfaceIp = false;
            draft.interfaceIPRequired = false;
            draft.interfaceNameRequired = true;
          });
        } else {
          errorType = produce(this.state.errorType, (draft) => {
            draft.interfaceIp = false;
            draft.interfaceIPRequired = false;
            draft.interfaceNameRequired = false;
          });
        }
      }
      interfaceList[index].interfaceIp = e.target.value;
    }

    if (Object.values(errorType).includes(true)) {
      validInterface = false;
      document.getElementById('submitButton').disabled = true;
    } else {
      validInterface = true;
      document.getElementById('submitButton').disabled = false;
    }
    e.preventDefault();
    this.setState({
      interfaceList: interfaceList,
      errorType: errorType,
      validInterface: validInterface,
    });
  };

  //this method is on change of th einput fileds of an add new interface.
  handleNewInterface = (e, type) => {
    let errorType = this.state.errorType;
    let interfaceObject = {
      interfaceName: '',
      interfaceIp: '',
    };
    let validInterface;
    if (type === 'interfaceName') {
      if (e.target.value === '') {
        errorType = produce(this.state.errorType, (draft) => {
          draft.interfaceNameRequired = true;
          draft.interfaceName = false;
        });
      } else if (
        e.target.value.match('^[a-zA-Z0-9!@#$&()\\-`.+,/"]*$') === null
      ) {
        errorType = produce(this.state.errorType, (draft) => {
          draft.interfaceName = true;
          draft.interfaceNameRequired = false;
        });
      } else {
        if (document.getElementById('newInterfaceIp').value === '') {
          errorType = produce(this.state.errorType, (draft) => {
            draft.interfaceName = false;
            draft.interfaceNameRequired = false;
            draft.interfaceIPRequired = true;
          });
        } else {
          errorType = produce(this.state.errorType, (draft) => {
            draft.interfaceName = false;
            draft.interfaceNameRequired = false;
            draft.interfaceIPRequired = false;
          });
        }
      }
      interfaceObject = produce(this.state.interfaceObject, (draft) => {
        draft.interfaceName = e.target.value;
      });
    } else {
      if (e.target.value === '') {
        errorType = produce(this.state.errorType, (draft) => {
          draft.interfaceIPRequired = true;
          draft.interfaceIp = false;
        });
      } else if (
        e.target.value.match(
          '^(([1-9]?\\d|1\\d\\d|25[0-5]|2[0-4]\\d)\\.){3}([1-9]?\\d|1\\d\\d|25[0-5]|2[0-4]\\d)$'
        ) === null
      ) {
        errorType = produce(this.state.errorType, (draft) => {
          draft.interfaceIp = true;
          draft.interfaceIPRequired = false;
        });
      } else {
        if (document.getElementById('newInterfaceName').value === '') {
          errorType = produce(this.state.errorType, (draft) => {
            draft.interfaceIp = false;
            draft.interfaceIPRequired = false;
            draft.interfaceNameRequired = true;
          });
        } else {
          errorType = produce(this.state.errorType, (draft) => {
            draft.interfaceIp = false;
            draft.interfaceIPRequired = false;
            draft.interfaceNameRequired = false;
          });
        }
      }
      interfaceObject = produce(this.state.interfaceObject, (draft) => {
        draft.interfaceIp = e.target.value;
      });
    }

    if (Object.values(errorType).includes(true)) {
      validInterface = false;
    } else {
      validInterface = true;
    }
    e.preventDefault();
    this.setState({
      interfaceObject: interfaceObject,
      errorType: errorType,
      validInterface: validInterface,
    });
  };

  //this method is called when the user clicks on the add new interface button.
  handleOnAddClick = () => {
    const errorType = produce(this.state.errorType, (draft) => {
      draft.interfaceIp = false;
      draft.interfaceIPRequired = false;
      draft.interfaceName = false;
      draft.interfaceNameRequired = false;
    });
    this.setState({
      interfaceObject: {
        interfaceName: '',
        interfaceIp: '',
      },
      displayInterfaceInput: true,
      errorType: errorType,
      validInterface: false,
    });
  };

  //this method is called when the user clicks on the 'x' button of an interface edit.
  onCancelInterfaceList = (e, interfaceIndex) => {
    const editInterfaceList = produce(this.state.editInterfaceList, (draft) => {
      draft[interfaceIndex] = false;
    });
    const errorType = produce(this.state.errorType, (draft) => {
      draft.interfaceIp = false;
      draft.interfaceIPRequired = false;
      draft.interfaceName = false;
      draft.interfaceNameRequired = false;
    });
    e.preventDefault();
    this.setState({
      interfaceList: this.state.assetObject.interface_list,
      editInterfaceList: editInterfaceList,
      editInterfaceInput: false,
      errorType: errorType,
      validInterface: false,
    });
  };

  //this method is called when the user clicks on the 'x' button of an interface add.
  onCancelNewInterfaceList = (e) => {
    const errorType = produce(this.state.errorType, (draft) => {
      draft.interfaceIp = false;
      draft.interfaceIPRequired = false;
      draft.interfaceName = false;
      draft.interfaceNameRequired = false;
    });
    e.preventDefault();
    this.setState({
      displayInterfaceInput: false,
      errorType: errorType,
      validInterface: false,
    });
  };

  //this method is called when the interface is submitted.
  //this is saved in the interfaceList property of state's assetObject.
  //when the submit button of the whole form is clicked, this will then be
  //used in API call.
  onSubmitInterface = (e, index) => {
    if (index >= 0) {
      const assetObject = produce(this.state.assetObject, (draft) => {
        draft.interface_list = this.state.interfaceList;
      });
      const editInterfaceList = produce(
        this.state.editInterfaceList,
        (draft) => {
          draft[index] = false;
        }
      );
      this.setState(
        {
          assetObject: assetObject,
          editInterfaceList: editInterfaceList,
          displayInterfaceInput: false,
        },
        () => {
          if (this.state.assetObject.node_id !== '') {
            document.getElementById('submitButton').disabled = false;
          }
        }
      );
    } else {
      const assetObject = produce(this.state.assetObject, (draft) => {
        draft.interface_list.push(this.state.interfaceObject);
      });
      this.setState(
        {
          assetObject: assetObject,
          displayInterfaceInput: false,
          interfaceList: assetObject.interface_list,
        },
        () => {
          if (this.state.assetObject.node_id !== '') {
            document.getElementById('submitButton').disabled = false;
          }
        }
      );
    }
    e.preventDefault();
  };

  //this method will be called when the user clicks on the edit of a interface from the interface list.
  handleEditInterface = (e, interfaceName, interfaceIp, interfaceIndex) => {
    const interfaceObject = produce(this.state.interfaceObject, (draft) => {
      draft.interfaceName = interfaceName;
      draft.interfaceIp = interfaceIp;
    });
    const editInterfaceList = produce(this.state.editInterfaceList, (draft) => {
      draft[interfaceIndex] = true;
    });
    e.preventDefault();
    this.setState({
      interfaceObject: interfaceObject,
      editInterfaceList: editInterfaceList,
      editInterfaceInput: true,
      validInterface: false,
    });
  };

  //this method will be called when the user clicks on the delete of an interface from
  //the interface list.
  onDeleteInterface = (interfaceIndex) => {
    const assetObject = produce(this.state.assetObject, (draft) => {
      draft.interface_list.splice(interfaceIndex, 1);
    });
    if (!Object.values(this.state.errorType).includes('true')) {
      document.getElementById('submitButton').disabled = false;
    }
    this.setState({ assetObject });
  };

  render() {
    //this will be used to display the interfaceList of input box based on the editInterfaceList
    //flag set in the state.
    const displayInterfaceList =
      this.state.assetObject.interface_list &&
      this.state.assetObject.interface_list.map((o, index) => {
        if (this.state.editInterfaceList[index] !== true) {
          return (
            <div className="interface-row" key={o.interfaceName}>
              <div className="interface-name">{o.interfaceName}</div>
              <div className="interface-ip">{o.interfaceIp}</div>
              <div>
                <button
                  className="edit-interface-button"
                  onClick={(e) =>
                    this.handleEditInterface(
                      e,
                      o.interfaceName,
                      o.interfaceIp,
                      index
                    )
                  }
                >
                  <span className="fa fa-pencil" />
                </button>
                <button
                  className="delete-button"
                  onClick={() => this.onDeleteInterface(index)}
                >
                  <span className="fa fa-trash" />
                </button>
              </div>
            </div>
          );
        } else {
          return (
            <div className="interface-row" key={o.interfaceName}>
              <div>
                <input
                  type="text"
                  id="interfaceName"
                  name="interfaceName"
                  value={this.state.interfaceList[index].interfaceName}
                  onChange={(e) =>
                    this.handleInterfaceChange(e, 'interfaceName', index)
                  }
                />
                <div className="error-message">
                  {this.state.errorType.interfaceName && (
                    <span>Invalid Interface name.</span>
                  )}
                  {this.state.errorType.interfaceNameRequired && (
                    <span>Interface name cannot be empty.</span>
                  )}
                </div>
              </div>
              <div>
                <input
                  type="text"
                  id="interfaceIp"
                  name="interfaceIp"
                  value={this.state.interfaceList[index].interfaceIp}
                  onChange={(e) =>
                    this.handleInterfaceChange(e, 'interfaceIp', index)
                  }
                />
                <div className="error-message">
                  {this.state.errorType.interfaceIp && (
                    <span>Invalid Interface IP.</span>
                  )}
                  {this.state.errorType.interfaceIPRequired && (
                    <span>Interface IP cannot be empty.</span>
                  )}
                </div>
              </div>
              <div className="interface-actions">
                <button
                  type="text"
                  id="edit-button"
                  className="edit-button"
                  disabled={!this.state.validInterface}
                  onClick={(e) => this.onSubmitInterface(e, index)}
                >
                  <span className="fa fa-check" />
                </button>
                <button
                  className="delete-button"
                  onClick={(e) => this.onCancelInterfaceList(e, index)}
                >
                  <span className="fa fa-times" />
                </button>
              </div>
            </div>
          );
        }
      });

    return (
      <div className="newAssetModal-wrapper">
        <div className="title">
          {this.state.assetObject.system_ip === '' &&
          this.state.assetObject.device_name === ''
            ? 'New Asset'
            : 'Edit Asset'}
        </div>
        <form
          id="asset-form"
          name="asset-form"
          className="asset-form"
          onSubmit={this.handleSubmit}
        >
          <div className="form-body">
            <label htmlFor="systemIP">System IP: *</label>
            <input
              type="text"
              id="systemIP"
              name="systemIP"
              value={this.state.assetObject.system_ip}
              onChange={(e) => this.onChange(e, 'systemIP')}
            />
            <div className="error-message">
              {this.state.errorType.systemIP && <span>Invalid IP format.</span>}
              {this.state.errorType.systemIPRequired && (
                <span>Either System IP or Device Name is required.</span>
              )}
            </div>
            <label htmlFor="deviceName">Device Name: *</label>
            <input
              type="text"
              id="deviceName"
              name="deviceName"
              value={this.state.assetObject.device_name}
              onChange={(e) => this.onChange(e, 'deviceName')}
            />
            <div className="error-message">
              {this.state.errorType.deviceName && (
                <span>Invalid device name.</span>
              )}
              {this.state.errorType.deviceNameRequired && (
                <span>Either System IP or Device Name is required.</span>
              )}
            </div>

            <label htmlFor="deviceType">Device Type:</label>
            <select
              name="deviceType"
              id="deviceType"
              onChange={(e) => this.onChange(e, 'deviceType')}
              defaultValue={this.state.assetObject.device_type}
            >
              <option value="">Select...</option>
              {this.renderDeviceType()}
            </select>
            <label htmlFor="vendorName">Vendor Name:</label>
            <select
              name="vendorName"
              id="vendorName"
              onChange={(e) => this.onChange(e, 'vendorName')}
              defaultValue={this.state.assetObject.vendor_name}
            >
              <option value="">Select...</option>
              {this.renderVendorName()}
            </select>
            <label htmlFor="interfaceList">
              <span>Interface List:</span>
              <span onClick={() => this.handleOnAddClick()}>
                <i className="fa fa-plus-circle" />
              </span>
            </label>
            <div className="interface-wrapper">
              <div className="interface-heading">
                <label className="interfaceName-label">Interface Name:</label>
                <label className="interfaceIP-label">Interface IP:</label>
                <label className="interfaceActions-label">Actions</label>
              </div>
              <div className="interface-list">
                {displayInterfaceList}
                {this.state.displayInterfaceInput && (
                  <div className="interface-row">
                    <div>
                      <input
                        type="text"
                        id="newInterfaceName"
                        name="newInterfaceName"
                        onChange={(e) =>
                          this.handleNewInterface(e, 'interfaceName')
                        }
                      />
                      <div className="error-message">
                        {this.state.errorType.interfaceName && (
                          <span>Invalid Interface name.</span>
                        )}
                        {this.state.errorType.interfaceNameRequired && (
                          <span>Interface name cannot be empty.</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        id="newInterfaceIp"
                        name="newInterfaceIp"
                        onChange={(e) =>
                          this.handleNewInterface(e, 'interfaceIp')
                        }
                      />
                      <div className="error-message">
                        {this.state.errorType.interfaceIp && (
                          <span>Invalid Interface IP.</span>
                        )}
                        {this.state.errorType.interfaceIPRequired && (
                          <span>Interface IP cannot be empty.</span>
                        )}
                      </div>
                    </div>
                    <div className="interface-actions">
                      <button
                        type="text"
                        id="addInterfaceButton"
                        className="add-interface-button"
                        disabled={!this.state.validInterface}
                        onClick={(e) => this.onSubmitInterface(e, -1)}
                      >
                        <span className="fa fa-check" />
                      </button>
                      <button
                        className="delete-button"
                        onClick={(e) => this.onCancelNewInterfaceList(e)}
                      >
                        <span className="fa fa-times" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <label htmlFor="portList">Port List:</label>
            <input
              type="text"
              id="portList"
              name="portList"
              value={this.state.assetObject.port_list}
              onChange={(e) => this.onChange(e, 'portList')}
            />
            <div className="error-message">
              {this.state.errorType.portListInvalid && (
                <span>Port List Invalid. Comma separated numbers only.</span>
              )}
            </div>
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              id="location"
              name="location"
              value={this.state.assetObject.location}
              onChange={(e) => this.onChange(e, 'location')}
            />
            <label htmlFor="contactDetails">Contact Details:</label>
            <input
              type="text"
              id="contactDetails"
              name="contactDetails"
              value={this.state.assetObject.contact_details}
              onChange={(e) => this.onChange(e, 'contactDetails')}
            />
            <label htmlFor="maintainanceMode">Maintainance Mode:</label>
            <select
              type="text"
              id="maintainanceMode"
              name="maintainanceMode"
              defaultValue={this.state.assetObject.maintenance_mode}
              onChange={(e) => this.onChange(e, 'maintainanceMode')}
            >
              <option value={true}>True</option>
              <option value={false}>False</option>
            </select>
            <label htmlFor="tags">Tags:</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={this.state.assetObject.tags}
              onChange={(e) => this.onChange(e, 'tags')}
            />
            <div className="error-message">
              {this.state.errorType.tagsInvalid && (
                <span>Tags List Invalid. Comma separated values only.</span>
              )}
            </div>
          </div>
          <div className="actions">
            <input
              className="asset-button"
              type="button"
              value="Cancel"
              onClick={() => this.props.cancelNewAsset()}
            />
            <input
              className="asset-button"
              type="submit"
              value="Submit"
              id="submitButton"
              disabled={true}
            />
          </div>
        </form>
      </div>
    );
  }
}
