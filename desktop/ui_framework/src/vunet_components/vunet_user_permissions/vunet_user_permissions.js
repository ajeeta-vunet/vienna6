
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

// Copyright 2020 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import './_vunet_user_permissions.less';

const chrome = require('ui/chrome');
const notify = require('ui/notify');


export async function getDefaultPermission(allowedRoles) {
  // We need to get all the roles available every time someone is
  // trying to save an object. This is because we need to update the
  // role list in the object if a new role is created or an existing
  // one is deleted.
  // Now get all the roles available
  const currentUser = chrome.getCurrentUser();

  // Get the first part of the url containing the tenant
  // and bu id to prepare urls for api calls.
  // Example output: /vuSmartMaps/api/1/bu/1/
  const urlBase = chrome.getUrlBase();
  const url = urlBase + '/user_groups/';

  // perform a get request to get latest userRoles
  //update the state with latest userRoles
  const { userRoles, userRolePermissionDetails }  = await fetch(url)
    .then(resp => resp.json())
    .catch(resp => { throw resp.data; })
    .then((data) => {
      const userRoles = [];
      const userRolePermissionDetails = [];

      if (allowedRoles.length === 0) {
        // This seems to be a request for a new object, let us create
        // roles information for each existing role and add it. For
        // current user's role, we automatically set the permission
        // to modify
        _.each(data.user_groups, function (role) {
          const userdetails = { 'name': role.name, 'claims': role.permissions };
          userRolePermissionDetails.push(userdetails);

          //indexOf returns -1 if ViewObject is not found.
          if(role.permissions.indexOf('ViewObject') > -1) {
            const newRole = { 'name': role.name, 'permission': '' };
            // If the role is same as current user, mark the
            // permission as 'modify'
            if (role.name === currentUser[1] || role.name === 'VunetAdmin') {
              newRole.permission = 'modify';
            }
            userRoles.push(newRole);
          }
        });
      } else {
        // Iterate on all roles from backend which has 'ViewObject'
        // claim and check it in current
        // allowed-roles list otherwise create a new one and push it
        // With this logic, we should finally have the same roles in
        // the allowed roles list as what we have in backend
        _.each(data.user_groups, function (role) {
          const userdetails = { 'name': role.name, 'claims': role.permissions };
          userRolePermissionDetails.push(userdetails);
          let roleFound = false;
          if(role.permissions.indexOf('ViewObject') > -1) {
            _.each(allowedRoles, function (allowRole) {
              if (role.name === allowRole.name) {
                userRoles.push(allowRole);
                roleFound = true;
              }
            });

            // If we didn't found this role in existing allowedRole,
            // it means this is a newly created role
            if (!roleFound) {
              const newRole = { 'name': role.name, 'permission': '' };
              userRoles.push(newRole);
            }
          }
        });
      }
      return { userRoles, userRolePermissionDetails };
    })
    .catch(function () {
      notify.error('Failed to find user roles');
    });

  return { userRoles, userRolePermissionDetails };
}

// This component provides the RBAC(role based access control) for user roles
export class VunetUserPermissions extends React.Component {
  constructor(props) {
    super(props);

    // define initial states
    this.state = {
      rbac_options: false,
      userRoles: [],
      userRolePermissionDetails: [],
      isUserPermissionCollapsed: false
    };

    // perform a get request to get latest userRoles
    //update the state with latest userRoles
    this._init();
  }

  // We need to disable 'modify' permission for users with only ViewObject
  // permission and no ManageObject permission
  isModifyDisabled(roleName) {
    const userRolePermissionDetails = this.state.userRolePermissionDetails;
    const index = userRolePermissionDetails.findIndex(x => x.name === roleName);
    if(userRolePermissionDetails[index].claims.indexOf('ManageObject') === -1) {
      return true;
    }
    return false;
  }


  // initial processing
  // we perform a get request to get latest userRoles and update the state
  _init = () => {
    const {
      allowedRoles
    } = this.props;

    getDefaultPermission(allowedRoles).then((userRolesObj)=> {
      // update state with latest userRoles
      this.setState({
        ...this.state,
        userRoles: userRolesObj.userRoles,
        userRolePermissionDetails: userRolesObj.userRolePermissionDetails
      });

      // return the updated value using callback
      this.props.onChange(userRolesObj.userRoles);
    });
  }

  // When the user updates the user permission
  // we update the state and return the updated list to userRoles using a callback
  onChange = (roleName, value) => {
    // create a copy of userRoles
    const userRoles = JSON.parse(JSON.stringify(this.state.userRoles));

    // identify and update the respective user
    userRoles.forEach(userRole => {
      if (userRole.name === roleName) {
        userRole.permission = value;
      }
    });

    // update the state
    this.setState({
      ...this.state,
      userRoles: userRoles
    });

    // return the updated value using callback
    this.props.onChange(userRoles);
  }

  // expand/collapse user permissions using the arrow
  displayUserPermission = () => {
    this.setState({
      ...this.state,
      isUserPermissionCollapsed: !this.state.isUserPermissionCollapsed
    });
  }


  render() {
    const { userRoles, isUserPermissionCollapsed } = this.state;
    const { owner } = this.props;
    return (
      <div className="user-permissions-container">
        <div className="user-permission-header">
          <span className="title-text">User Permission</span>
          <i
            className={'title-icon fa ' + (isUserPermissionCollapsed ? 'fa-chevron-down' : 'fa-chevron-up')}
            onClick={this.displayUserPermission}
          />
        </div>
        <div className="user-permission-body">
          {!isUserPermissionCollapsed &&
            userRoles.map((role, index) => {
              return (
                <div
                  className="permission-container"
                  key={owner.role + index}
                >
                  <span className="radio-title ">{role.name.charAt(0).toUpperCase() + role.name.slice(1)}</span>
                  <div className={'radio-input-container ' +
                  (role.name === owner.role || role.name === 'VunetAdmin' || this.isModifyDisabled(role.name) ? 'disabledRadioInput' : null)}
                  >
                    <input
                      className="form-control radio-input"
                      type="radio"
                      disabled={role.name === owner.role || role.name === 'VunetAdmin' || this.isModifyDisabled(role.name)}
                      id={'Modify' + index}
                      value="modify"
                      name={role.name}
                      checked={role.permission === 'modify'}
                      onChange={(e) => { this.onChange(role.name, e.target.value); }}
                    />
                    <label
                      className="radio-input-text"
                      name={role.name}
                      htmlFor={'Modify' + index}
                    >
                      Modify
                    </label>
                  </div>
                  <div className={'radio-input-container ' +
                   (role.name === owner.role || role.name === 'VunetAdmin' ? 'disabledRadioInput' : null)}
                  >
                    <input
                      className="form-control radio-input"
                      type="radio"
                      disabled={role.name === owner.role || role.name === 'VunetAdmin'}
                      id={'View' + index}
                      value="view"
                      name={role.name}
                      checked={role.permission === 'view'}
                      onChange={(e) => { this.onChange(role.name, e.target.value); }}
                    />
                    <label
                      className="radio-input-text"
                      name={role.name}
                      htmlFor={'View' + index}
                    >
                      View
                    </label>
                  </div>
                  <div className={'radio-input-container ' +
                  (role.name === owner.role || role.name === 'VunetAdmin' ? 'disabledRadioInput' : null)}
                  >
                    <input
                      className="form-control radio-input"
                      type="radio"
                      disabled={role.name === owner.role}
                      id={'None' + index}
                      value=""
                      name={role.name}
                      checked={role.permission === ''}
                      onChange={(e) => { this.onChange(role.name, e.target.value); }}
                    />
                    <label
                      className="radio-input-text"
                      name={role.name}
                      htmlFor={'None' + index}
                    >
                      None
                    </label>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}

VunetUserPermissions.propTypes = {
  allowedRoles: PropTypes.array.isRequired, // list of user-roles and their permissions
  owner: PropTypes.object.isRequired, // owner details
  onChange: PropTypes.func.isRequired // on change callback when user updates permission
};
