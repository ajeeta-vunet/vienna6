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
import { VunetModal } from 'ui_framework/src/vunet_components/vunet_modal/vunet_modal';
import chrome from 'ui/chrome';
import { VunetDataTable } from 'ui_framework/src/vunet_components/vunet_table/vunet_table';
import './manage_visualizations.less';

export class ManageVisualizationsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visInSavedObjectList: [],
      showInfoModal: false,
      showWarningModal: false,
      vizsWithoutPermission: [],
      selectedVizs: [],
      visualizationsMetaData: {
        headers: [
          'Visualization',
          'Total Count',
          'Dashboards Count',
          'Dashboards',
          'Reports Count',
          'Reports',
          'Alerts Count',
          'Alerts',
          'Dependent Vis Count',
          'Dependent Vis',
        ],
        rows: [
          'visualization',
          'totalCount',
          'dashboardCount',
          'dashboardsList',
          'reportsCount',
          'reportsList',
          'alertsCount',
          'alertsList',
          'dependentVizsCount',
          'dependentVizs',
        ],
        id: 'visualization',
        deleteIconCheckCallback: this.deleteIconCheckCallback,
        title: 'Manage visualizations',
        selection: true,
        forceUpdate: false,
        search: true,
        wrapTableCellContents: true,
        tableAction: [{ button: 'Delete' }],
      },
    };
  }

  //To hide the vunet table delete button
  deleteIconCheckCallback = () => {
    return true;
  };

  //Constructing all the table data here
  componentDidMount() {
    const currentUser = chrome.getCurrentUser();
    const userRoles = currentUser[1];

    //Get all dashboards and those dashboards linked visualizations
    const allDashboardsWithVisList = this.getDashboardsLinkedData();

    //Get all reports and those reports linked visualizations
    const allReportsWithVisList = this.getReportsLinkedData();

    //Get all alerts and those alerts linked visualizations
    const allAlertsWithVisList = this.getAlertsLinkedData();

    //Get all visualizations and those visualizations dependent visualizations
    const allVisWithDepedentVisList = this.getVizsLinkedVizs();

    //Constructing visualizations and linked dashboards,reports,alerts and dependent visualizations object to the below variable
    const vizsLinkedObjList = [];

    //Looping all visualizations and constructing the linked data of each visualization
    this.props.visualizationsList.map((eachVizualization) => {
      /*If the current logged in user has modify permission to the visualization
      then isModifyPermission is assigned true value.If isModifyPermission is true then
      the logged in user can delete those visualizations*/
      let isModifyPermission = false;

      JSON.parse(eachVizualization.allowedRolesJSON).map((eachRole) => {
        if (userRoles.includes(eachRole.name)) {
          if (!isModifyPermission) {
            isModifyPermission = eachRole.permission === 'modify' ? true : false;
          }
        }
      });

      //Get each visualization linked dashaboards
      const linkedDashboards = this.getLinkedVisualizations(
        allDashboardsWithVisList,
        eachVizualization.id
      );

      //Get each visualization linked reports
      const linkedReports = this.getLinkedVisualizations(
        allReportsWithVisList,
        eachVizualization.id
      );

      //Get each visualization linked alerts
      const linkedAlerts = this.getLinkedVisualizations(
        allAlertsWithVisList,
        eachVizualization.id
      );

      //Get each visualization linked visualizations(dependent visualizations)
      const linkedVizs = this.getDepedentVisualizations(
        allVisWithDepedentVisList,
        eachVizualization.id
      );

      //Total linked items of a visualization
      const totalUsageCountOfViz =
        linkedDashboards.length +
        linkedReports.length +
        linkedAlerts.length +
        linkedVizs.length;

      //Meta data construction which is assigned to visInSavedObjectList state variable and passed to vunet table
      const eachObject = {
        id: eachVizualization.id,
        visualization: eachVizualization.id,
        permissionToModify: isModifyPermission,
        totalCount: totalUsageCountOfViz,
        dashboardCount: linkedDashboards.length,
        dashboardsList: linkedDashboards,
        reportsCount: linkedReports.length,
        reportsList: linkedReports,
        alertsCount: linkedAlerts.length,
        alertsList: linkedAlerts,
        dependentVizsCount: linkedVizs.length,
        dependentVizs: linkedVizs,
      };
      vizsLinkedObjList.push(eachObject);
    });

    this.setState({
      visInSavedObjectList: vizsLinkedObjList,
    });
  }

  //Getting linked visualizations of dashboards,reports and alerts
  getLinkedVisualizations = (linkedItemsData, visualizationId) => {
    const linkedItems = [];
    //We are adding white space to use word break and added new line to display the linked items
    // one below the other with a line gap so that the list will look clear.
    linkedItemsData.map((eachItemData) => {
      if (eachItemData.linkedData.visIdList.includes(visualizationId)) {
        linkedItems.push(eachItemData.id + ' ' + '\n');
      }
    });

    return linkedItems;
  };

  //Getting dependent visualizations of visualizations
  getDepedentVisualizations = (linkedItemsData, visualizationId) => {
    const linkedItems = [];

    // We are adding white space to use word break and added new line to display the linked items
    // one below the other with a line gap so that the list will look clear.
    linkedItemsData.map((eachItemData) => {
      //If a BMV is linked to a KPI then for KPI BMV should display as dependent viz and for BMV KPI should display as dependent viz
      //those two cases are covered using the below two if conditions
      if (visualizationId === eachItemData.id) {
        eachItemData.linkedData.visIdList.map((eachItem) => {
          linkedItems.push(eachItem + ' ' + '\n');
        });
      }
      if (eachItemData.linkedData.visIdList.includes(visualizationId)) {
        linkedItems.push(eachItemData.id + ' ' + '\n');
      }
    });

    return linkedItems;
  };

  //To get the dashboards and those dashboards linked visualizations data
  getDashboardsLinkedData = () => {
    const allDashboardswithVisList = [];

    this.props.dashboardsList.map((eachBoard) => {
      const panelData = JSON.parse(eachBoard.panelsJSON);
      const linkedData = {};
      linkedData.visIdList = [];
      panelData.map((eachPanel) => {
        if (eachPanel.type === 'visualization') {
          linkedData.visIdList.push(eachPanel.id);
        }
      });

      const eachBoardData = {
        id: eachBoard.id,
        linkedData: linkedData,
      };
      allDashboardswithVisList.push(eachBoardData);
    });
    return allDashboardswithVisList;
  };

  //To get the reports and those reports linked visualizations data
  getReportsLinkedData = () => {
    const allReportsWithVisList = [];

    this.props.reportsList.map((eachReport) => {
      const sectionData = JSON.parse(eachReport.sectionJSON);
      const linkedData = {};
      linkedData.visIdList = [];
      sectionData.map((eachSection) => {
        eachSection.visuals.map((eachVisual) => {
          if (eachVisual.type === 'visualization') {
            linkedData.visIdList.push(eachVisual.id);
          }
        });
      });

      const eachReportData = {
        id: eachReport.id,
        linkedData: linkedData,
      };
      allReportsWithVisList.push(eachReportData);
    });

    return allReportsWithVisList;
  };

  //To get the alerts and those alerts linked visualizations data
  getAlertsLinkedData = () => {
    const allAlertsWithVisList = [];

    this.props.alertRulesList.map((eachAlert) => {
      const ruleData = JSON.parse(eachAlert.ruleList);
      const linkedData = {};
      linkedData.visIdList = [];
      ruleData.map((eachRule) => {
        linkedData.visIdList.push(eachRule.selectedMetric.id);
      });

      const eachAlertData = {
        id: eachAlert.id,
        linkedData: linkedData,
      };
      allAlertsWithVisList.push(eachAlertData);
    });

    return allAlertsWithVisList;
  };

  //To get the structured data of depedent visualizations(like KPI, CJM, Insights, Bullets and UTM) of visualizations
  getVizsLinkedVizs = () => {
    const allVisWithDepedentVisList = [];

    this.props.visualizationsList.map((eachViz) => {
      const visData = JSON.parse(eachViz.visState);
      const linkedData = {};
      linkedData.visIdList = [];

      // Visualizations having another vis as a dependency(Example BMV) is kept under different keys in vis.params.
      // We look for visualization id's in these places based on the visualization type and prepare a list of visualization id's
      const vizsLinkedData = {};

      //Getting KPI linked visualizations
      vizsLinkedData.parameters = visData.params.parameters
        ? visData.params.parameters
        : [];
      vizsLinkedData.parameters.map((eachParameter) => {
        linkedData.visIdList.push(eachParameter.name.id);
      });

      //Getting CJM(Customer journey map) linked visualizations
      vizsLinkedData.metricGroups = visData.params.metricGroups
        ? visData.params.metricGroups
        : [];
      vizsLinkedData.metricGroups.map((eachMetricGrp) => {
        Object.keys(eachMetricGrp.metrics).map((eachMetric) => {
          linkedData.visIdList.push(eachMetricGrp.metrics[eachMetric].id);
        });
      });

      //Getting Insights linked visualizations
      vizsLinkedData.bmv = visData.params.bmv ? visData.params.bmv : [];
      vizsLinkedData.bmv.map((eachBmv) => {
        linkedData.visIdList.push(eachBmv.name.id);
      });

      //Getting Bullets linked visualizations
      vizsLinkedData.bullets = visData.params.bullets
        ? visData.params.bullets
        : [];
      vizsLinkedData.bullets.map((eachBullet) => {
        linkedData.visIdList.push(eachBullet.name.id);
      });

      //Getting UTM(Unified transaction map) linked visualizations
      const graphs = visData.params.graphs ? visData.params.graphs : [];
      graphs.map((eachGraph) => {
        if (eachGraph.bmv) {
          linkedData.visIdList.push(eachGraph.bmv.id);
        }
        if (eachGraph.metrics) {
          eachGraph.metrics.map((eachMetric) => {
            linkedData.visIdList.push(eachMetric.name.id);
          });
        }
        if (eachGraph.subGraphVisList) {
          eachGraph.subGraphVisList.map((eachSubGraph) => {
            linkedData.visIdList.push(eachSubGraph.id);
          });
        }
      });

      const eachVizData = {
        id: eachViz.id,
        linkedData: linkedData,
      };
      allVisWithDepedentVisList.push(eachVizData);
    });
    return allVisWithDepedentVisList;
  };

  //This method is called from vunet table to get data for the table
  fetchVisualizations = async () => {
    return this.state.visInSavedObjectList;
  };

  /*Added delete as a table action button. Here it will deside whether need to show warningModal/infoModal.
  InfoModal will display the list of visualizations which can not be deleted as the logged in person do not have
  modify permission for those visualizations.
  Warning modal is confirmation modal which says that selected rows will be deleted and it is irreversible.*/
  onTableAction = (eventType, rows) => {
    const visualizationsWithoutPermission = [];
    rows.map((eachViz) => {
      if (!eachViz.permissionToModify) {
        visualizationsWithoutPermission.push(eachViz.Visualization);
      }
    });

    if (visualizationsWithoutPermission.length > 0) {
      this.setState({
        showInfoModal: true,
        vizsWithoutPermission: visualizationsWithoutPermission,
      });
    } else {
      this.setState({
        showWarningModal: true,
        selectedVizs: rows,
      });
    }
    return Promise.resolve(false);
  };

  //Once user confirms to delete the selected rows then those selected rows will be deleted by using the deleteVizs callbackfunction.
  onDelete = () => {
    const selectedIds = this.state.selectedVizs.map((item) => item.id);

    const listOfVizs = this.state.visInSavedObjectList;
    listOfVizs.map((eachVizData, index) => {
      if (selectedIds.includes(eachVizData.id)) {
        listOfVizs.splice(index, 1);
      }
    });

    // Calling the deleteVizs method to delete the selected items
    this.props.deleteVizs(selectedIds).then(() => {
      this.setState({
        visualizationsMetaData: {
          ...this.state.visualizationsMetaData,
          forceUpdate: true,
        },
        visInSavedObjectList: listOfVizs,
        showWarningModal: false,
      });
    });
    return Promise.resolve(false);
  };

  render() {
    const { showInfoModal, showWarningModal, vizsWithoutPermission } =
      this.state;
    const vizsWithoutPermissionHtml = vizsWithoutPermission
      .map(
        (n) => '<li style="list-style:none; margin-bottom:10px">' + n + '</li>'
      )
      .join('');

    return (
      <div className="visualizations-details">
        <VunetDataTable
          fetchItems={this.fetchVisualizations}
          tableAction={this.onTableAction}
          metaItem={this.state.visualizationsMetaData}
        />
        <VunetModal
          showModal={showInfoModal}
          data={{
            isForm: false,
            title: 'Selected visualizatins',
            indices: vizsWithoutPermission,
            message:
              '<h4 class="delete-vizs-popup"> You do not have permission to delete the following visualizations.' +
              'Please select visualizations for which you have modify permission <p><ul>' +
              vizsWithoutPermissionHtml +
              '</ul></p></h4>',
          }}
          onClose={() => {
            this.setState({ showInfoModal: false });
          }}
          onSubmit={() => {
            this.setState({ showInfoModal: false });
          }}
        />
        <VunetModal
          showModal={showWarningModal}
          data={{
            isForm: false,
            title: 'Warning',
            message:
              '<span>Are you sure you want to delete the selected visualizations? This action is irreversible!</span>',
          }}
          onClose={() => {
            this.setState({ showWarningModal: false });
          }}
          onSubmit={this.onDelete}
        />
      </div>
    );
  }
}

ManageVisualizationsPage.propTypes = {
  dashboardsList: PropTypes.array, //contains the list of dashboards
  visualizationsList: PropTypes.array, //contains the list of visualizations
  reportsList: PropTypes.array, //contains the list of reports
  alertRulesList: PropTypes.array, //contains the list of alerts
  deleteVizs: PropTypes.func, //a callback method to delete the selected visualizations
};
