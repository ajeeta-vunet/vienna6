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
import PropTypes from 'prop-types';
import { VunetSelect } from 'ui_framework/src/vunet_components/vunet_select/vunet_select';
import './manage_permissions.less';
import { VunetModal } from 'ui_framework/src/vunet_components/vunet_modal/vunet_modal';
import { updateVisualizationPermissions } from '../../../dashboard/lib/update_visualization_permissions';
import { updateSavedsearchPermissions } from '../../../dashboard/lib/update_savedsearch_permissions';
import { getVisualizationInterlinkedData } from '../../../dashboard/lib/get_visualizations_interlinked_data';

export class ManagePermissionsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dashboardsList: this.props.dashboardsList,
      userRolesList: this.props.userRolesList,
      permissionsList: this.props.permissionsList,
      selectedDashboards: [],
      selectedRoles: [],
      selectedPermission: '',
      submitted: false,
      showDashboardUpdateModal: false,
      selectedDashboardsUpdatedData: {},
      selectedDashboardsLinkedData: {},
    };
    //This is to store all dashboards of this product in a proper structure for multi select
    this.allDashboards  = [];
    //This is to store all user roles of this product in a proper structure for multi select
    this.allUserRoles = [];
  }

  componentDidMount() {
    //Creating a structure list of all dashboards for dashboard multi select field
    this.state.dashboardsList.map((dashboard) => {
      const eachOption = {
        key: dashboard.id,
        name: dashboard.id,
        label: 'Dashboards',
        value: dashboard.id
      };
      this.allDashboards.push(eachOption);
    });

    //Creating a structure list of all user roles for user roles multi select field
    this.state.userRolesList.map((userrole) => {
      const eachOption = {
        key: userrole.name,
        name: userrole.name,
        label: 'Role',
        value: userrole.name
      };
      this.allUserRoles.push(eachOption);
    });
  }

  //Set permission based on user selection
  setPermission = (e) => {
    const { name } = e.target;
    let changedPermission = '';

    //stores the list of permissions
    const permisions = this.props.permissionsList;

    //updating the permissionsList with latest values, like which is selected make that value as true
    //and making remaining permissions value as fasle.
    //changedPermission holds the latest selected permission value.
    permisions.map((each) => {
      if (each.name === name) {
        each.value = !each.value;
        changedPermission = each.key;
      } else {
        each.value = false;
      }
    });
    this.setState({
      permissionsList: permisions,
      selectedPermission: changedPermission,
    });
  }

  onChange = (e, type) => {
    if (type === 'dashboard') {
      //If slected item dashboard will execute this condition and
      //selectedDashboards will be updated with latest selected dashboards list
      this.setState({
        selectedDashboards: e.values,
        submitted: false,
      });
    } else {
      //If slected item is not dahsboard i.e nothing but role as we have only two multi select fields
      //then this case will execute. selectedRoles will be updated with latest selected roles list
      this.setState({
        selectedRoles: e.values,
        submitted: false,
      });
    }
  }

  //This method will be executed when we click on save button
  onSave = async () => {
    this.setState({
      submitted: true,
    });
    //When atleast one dashboard and user role is seleted then only will move forward for updating permissions
    //else based on submitted variable of state we are displaying field required error.
    if (this.state.selectedDashboards.length > 0 && this.state.selectedRoles.length > 0) {
      const selectedRolesList = this.state.selectedRoles;
      const selectedDashboardsList = this.state.selectedDashboards;
      const newPermission = this.state.selectedPermission;
      const savedDashboard = this.props.savedDashboardService;

      //This is to store list of dashboards with updated user role permissions
      const selectedDashboardsUpdatedData = [];

      //This is to store all dashboards updated user permissions, linked visualization ids and linked saved searches ids
      const selectedDashboardsLinkedData = {};

      //This is for whether we need to ask user confirmation to upgrade/degrade selected
      //dashboard and linked visualization/saved searches user role permissions
      let showDashboardUpdateModal = false;

      await Promise.all(selectedDashboardsList.map(async (selectedBoard) => {
        await savedDashboard.get(selectedBoard).then(async function (dashboardResult) {
          //This is to store the each dashboard linked visualizations
          const visualizationIds = [];

          //This is to store the each dashboard linked saved searches
          const savedSearchIds = [];

          const dashboardPermisisons = JSON.parse(dashboardResult.allowedRolesJSON);
          const dashboardPanelData = JSON.parse(dashboardResult.panelsJSON);

          //Upgrading or degrading permisisons for selected dashaboards for selected user roles
          dashboardPermisisons.map((eachPermission, index) => {
            if (selectedRolesList.includes(eachPermission.name)) {
              if (eachPermission.permission !== newPermission) {
                showDashboardUpdateModal = true;
                dashboardPermisisons[index].permission = newPermission;
              }
            }
          });
          dashboardPanelData.map(function (value) {
            if (value.type === 'visualization') {
              visualizationIds.push(value.id);
            } else {
              savedSearchIds.push(value.id);
            }
          });
          dashboardResult.allowedRolesJSON = JSON.stringify(dashboardPermisisons);
          selectedDashboardsUpdatedData.push(dashboardResult);
          //This is to store each dashboard user role permissions,linked visualizations and saved searches
          const eachDashboardData = {};
          eachDashboardData.dashboardPermisisons = dashboardPermisisons;
          eachDashboardData.visualizationIds = visualizationIds;
          eachDashboardData.savedSearchIds = savedSearchIds;
          selectedDashboardsLinkedData[selectedBoard] = eachDashboardData;
        });
      }));
      //updating state varibles to update/degrade dashbaord permisisons based on user confirmation
      this.setState({
        showDashboardUpdateModal: showDashboardUpdateModal,
        selectedDashboardsUpdatedData: selectedDashboardsUpdatedData,
        selectedDashboardsLinkedData: selectedDashboardsLinkedData,
      });
    }
  }

  // Update dashboard,visualizations and saved searches permissions
  updatePermissions = (dashboardsListToUpdate, dashboardLinkedData) => {
    //This is savedvisualizations service
    const savedVisualizations = this.props.savedVisualizationService;

    //This is saved searches service
    const savedSearches = this.props.savedSearcheService;

    //This is notify service
    const notify = this.props.notify;

    //This is to store the updated interlinked visualizations
    //(EX : Linked BMV's for KPI)
    let interlinkedUpdatedVisualizations = [];

    //This is to store the inter linked saved searches
    //(EX : If any visualization is created using a saved search)
    let interlinkedUpdatedSavedSearches = [];

    //Updating selected dashboards for the selected user roles with the selected permission
    dashboardsListToUpdate.map((eachUpdatedDashboard) => {
      eachUpdatedDashboard.save();
    });

    //Updating dashboards linked visulizations and saved searches
    Object.keys(dashboardLinkedData).map(async (eachDashboard) => {
      const dashboardPermissions = JSON.stringify(dashboardLinkedData[eachDashboard].dashboardPermisisons);
      const visualizationIds = dashboardLinkedData[eachDashboard].visualizationIds;
      const savedSearchIds = dashboardLinkedData[eachDashboard].savedSearchIds;

      //Getting updated visualization objects
      const selectedVisualizationsData = Promise.resolve(
        updateVisualizationPermissions(dashboardPermissions, visualizationIds, savedVisualizations)
      );

      //Getting updated savedsearch objects
      const selectedSavedSearchesData = Promise.resolve(
        updateSavedsearchPermissions(dashboardPermissions, savedSearchIds, savedSearches)
      );

      await selectedVisualizationsData.then(async function (result) {
        const updatedVisualizations = result.visualizations;

        //This is to get interlinked visualizations and saved searches
        const interlinkedData = Promise.resolve(
          getVisualizationInterlinkedData(
            updatedVisualizations,
            dashboardPermissions,
            savedVisualizations,
            visualizationIds,
            savedSearchIds)
        );
        await interlinkedData.then(async function (result) {
          //Getting updated interlinked visualization objects
          const interLinkedVizsData = Promise.resolve(
            updateVisualizationPermissions(dashboardPermissions, result.linkedBmvIds, savedVisualizations)
          );
          //Getting updated interlinked savedsearch objects
          const interlinledSavedSearchesData = Promise.resolve(
            updateSavedsearchPermissions(dashboardPermissions, result.linkedSavedSearcheIds, savedSearches)
          );
          await interLinkedVizsData.then(function (result) {
            interlinkedUpdatedVisualizations = result.visualizations;
          });
          await interlinledSavedSearchesData.then(function (result) {
            interlinkedUpdatedSavedSearches = result.savedSearches;
          });
        });

        //Merging Dashboard direct linked and inter linked visulisations updated objects
        const finalVisualizations = [...updatedVisualizations, ...interlinkedUpdatedVisualizations];

        //Updating each visualization with new user role permissions
        await finalVisualizations.map(async (eachVisualization) => {
          await eachVisualization.save();
        });
      });

      await selectedSavedSearchesData.then(async function (result) {
        const updatedSavedSearches = result.savedSearches;

        //Merging Dashboard direct linked and inter linked saved searches updated objects
        const finalSavedSearches = [...updatedSavedSearches, ...interlinkedUpdatedSavedSearches];

        //Updating each saved search with new user role permissions
        await finalSavedSearches.map(async (eachSavedSearch) => {
          await eachSavedSearch.save();
        });
      });
    });
    //notifying the user once after updating dashboards,visualizations and saved searches with a success message
    notify.info('Dashboards,Visualizations,Saved searches are updated successfully');
  }

  render() {

    const {
      selectedDashboards,
      selectedRoles,
      permissionsList,
      submitted,
      showDashboardUpdateModal,
      selectedDashboardsUpdatedData,
      selectedDashboardsLinkedData } = this.state;

    return (
      <div className="event-details">
        <div className="muliti-selection">
          <label className="dashboard-lable">{'Dashboards'}</label>
          <div className="dashboards-multi-selection">
            <VunetSelect
              placeholder="Select dashboards"
              options={this.allDashboards}
              values={selectedDashboards}
              callback={(e) => { this.onChange(e, 'dashboard'); }}
              multiple
            />
            {submitted === true && selectedDashboards.length === 0 &&
            <div style={{ color: 'red' }}>{'Please select atleast on dashboard to update permissions'}</div>
            }
          </div>
        </div>
        <div className="muliti-selection">
          <label className="roles-lable">{'User roles'}</label>
          <div className="roles-multi-selection">
            <VunetSelect
              placeholder="Select roles"
              options={this.allUserRoles}
              values={selectedRoles}
              callback={(e) => { this.onChange(e, 'role'); }}
              multiple
            />
            {submitted === true && selectedRoles.length === 0 &&
            <div style={{ color: 'red' }}>{'Please select atleast one role to update permissions'}</div>
            }
          </div>
        </div>
        <div className="permissions-selection">
          <label className="select-permission">{'Select permission'}</label>
          {permissionsList.map((each) => (
            <div className="permissions" key={each.id}>
              <input
                className=""
                type="radio"
                name={each.name}
                checked={each.value}
                value={each.value}
                onChange={(e) => { this.setPermission(e); }}
              />
              <label className="permission-name">{each.name}</label>
            </div>
          ))}
        </div>
        <button
          className="vunet-button manage-permissions-button"
          type="button"
          onClick={() => { this.onSave(); }}
        >
            Save
        </button>
        <div>
          <VunetModal
            showModal={showDashboardUpdateModal}
            data={{
              isForm: false,
              title: 'Confirm User Permissions Upgrade',
              message: '<span>Do you want to update the user permission levels of dashboards,visualizations and saved searches?</span>'
            }}
            onClose={() => {
              this.setState({ showDashboardUpdateModal: false });
            }}
            onSubmit={() => {
              this.setState({ showDashboardUpdateModal: false });
              this.updatePermissions(selectedDashboardsUpdatedData, selectedDashboardsLinkedData);
            }}
          />
        </div>
      </div>
    );
  }
}

ManagePermissionsPage.propTypes = {
  dashboardsList: PropTypes.array, //contains the list od dashboards
  userRolesList: PropTypes.array, //contains the list ok user roles
  permissionsList: PropTypes.array, //contails the list of permisions
  savedDashboardService: PropTypes.object,
  savedVisualizationService: PropTypes.object,
  savedSearcheService: PropTypes.object,
  notify: PropTypes.object,
};