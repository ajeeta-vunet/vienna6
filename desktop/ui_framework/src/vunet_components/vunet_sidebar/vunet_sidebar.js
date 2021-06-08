
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

import React, { Component } from 'react';
import { GraphIcon, FileBinaryIcon, DatabaseIcon, ToolsIcon, GearIcon, ShareAndroidIcon } from '@primer/octicons-react';

import './_vunet_sidebar.less';
import $ from 'jquery';
import PropTypes from 'prop-types';
import { VunetSidebarConstants } from './vunet_sidebar_constants';
const chrome = require('ui/chrome');

export class VunetSidebar extends Component {

  //This is a dictionary which maps the sidebar elements to the correspoding claim.
  //A user can view a particular sidebar tab only if he has the correspoding claim next to the tab.
  sideBarTabsClaim = {
    [VunetSidebarConstants.ANALYTICS]: [VunetSidebarConstants.PERMISSION_VIEW_OBJECT,
      VunetSidebarConstants.PERMISSION_MANAGE_OBJECT],
    [VunetSidebarConstants.STORYBOARDS]: [VunetSidebarConstants.PERMISSION_VIEW_OBJECT,
      VunetSidebarConstants.PERMISSION_MANAGE_OBJECT],
    [VunetSidebarConstants.DASHBOARDS]: [VunetSidebarConstants.PERMISSION_VIEW_OBJECT,
      VunetSidebarConstants.PERMISSION_MANAGE_OBJECT],
    [VunetSidebarConstants.SEARCH]: [VunetSidebarConstants.PERMISSION_MANAGE_OBJECT],
    [VunetSidebarConstants.EVENTS]: [VunetSidebarConstants.PERMISSION_VIEW_OBJECT,
      VunetSidebarConstants.PERMISSION_MANAGE_OBJECT],
    [VunetSidebarConstants.REPORTS]: [VunetSidebarConstants.PERMISSION_VIEW_OBJECT,
      VunetSidebarConstants.PERMISSION_MANAGE_OBJECT],
    [VunetSidebarConstants.ANALYTICS_CONFIGURATIONS]: [VunetSidebarConstants.PERMISSION_VIEW_OBJECT,
      VunetSidebarConstants.PERMISSION_MANAGE_OBJECT,
      VunetSidebarConstants.PERMISSION_MANAGE_DATA_SOURCES],
    [VunetSidebarConstants.VISUALIZATIONS]: [VunetSidebarConstants.PERMISSION_VIEW_OBJECT,
      VunetSidebarConstants.PERMISSION_MANAGE_OBJECT],
    [VunetSidebarConstants.ALERT_RULES]: [VunetSidebarConstants.PERMISSION_VIEW_OBJECT,
      VunetSidebarConstants.PERMISSION_MANAGE_OBJECT],
    [VunetSidebarConstants.ANOMALY_DETECTION]: [VunetSidebarConstants.PERMISSION_VIEW_OBJECT,
      VunetSidebarConstants.PERMISSION_MANAGE_OBJECT],
    [VunetSidebarConstants.MANAGE_RESOURCES]: [VunetSidebarConstants.PERMISSION_MANAGE_OBJECT,
      VunetSidebarConstants.PERMISSION_MANAGE_DATA_SOURCES],
    [VunetSidebarConstants.NETWORK_CONFIGURATION]: [VunetSidebarConstants.PERMISSION_MANAGE_DATA_SOURCES],
    [VunetSidebarConstants.DEVICE_CONFIGURATION]: [VunetSidebarConstants.PERMISSION_MANAGE_DATA_SOURCES],
    [VunetSidebarConstants.DATA]: [VunetSidebarConstants.PERMISSION_MANAGE_DATA_SOURCES,
      VunetSidebarConstants.PERMISSION_MANAGE_DATA_ENRICHMENT],
    [VunetSidebarConstants.SOURCES]: [VunetSidebarConstants.PERMISSION_MANAGE_DATA_SOURCES],
    [VunetSidebarConstants.VUBLOCK]: [''],
    [VunetSidebarConstants.ENRICH]: [VunetSidebarConstants.PERMISSION_MANAGE_DATA_ENRICHMENT],
    [VunetSidebarConstants.PIIDATA]: [VunetSidebarConstants.PERMISSION_PII_DATA],
    [VunetSidebarConstants.DATA_STORE]: [VunetSidebarConstants.PERMISSION_MANAGE_DATA_SETTINGS,
      VunetSidebarConstants.PERMISSION_MANAGE_FILES],
    [VunetSidebarConstants.STORAGE]: [VunetSidebarConstants.PERMISSION_MANAGE_DATA_SETTINGS],
    [VunetSidebarConstants.FILES]: [VunetSidebarConstants.PERMISSION_MANAGE_FILES],
    [VunetSidebarConstants.DATA_RETENTION_SETTINGS]: [VunetSidebarConstants.PERMISSION_MANAGE_DATA_SETTINGS],
    [VunetSidebarConstants.SETTINGS]:
    [VunetSidebarConstants.PERMISSION_VIEW_OBJECT, VunetSidebarConstants.PERMISSION_MANAGE_OBJECT,
      VunetSidebarConstants.PERMISSION_MANAGE_DATA_SOURCES,
      VunetSidebarConstants.PERMISSION_MANAGE_DATA_ENRICHMENT,
      VunetSidebarConstants.PERMISSION_MANAGE_DATA_SETTINGS, VunetSidebarConstants.PERMISSION_MANAGE_FILES,
      VunetSidebarConstants.PERMISSION_MANAGE_PREFERENCES,
      VunetSidebarConstants.PERMISSION_MANAGE_USERS, VunetSidebarConstants.PERMISSION_MANAGE_LICENSE],
    [VunetSidebarConstants.PREFERENCES]: [VunetSidebarConstants.PERMISSION_MANAGE_PREFERENCES],
    [VunetSidebarConstants.DEFINITIONS]: [VunetSidebarConstants.PERMISSION_MANAGE_DATA_SOURCES],
    [VunetSidebarConstants.USER]: [VunetSidebarConstants.PERMISSION_MANAGE_USERS],
    [VunetSidebarConstants.LICENSE_USAGE]: [VunetSidebarConstants.PERMISSION_MANAGE_LICENSE],
    [VunetSidebarConstants.ABOUT]:
    [VunetSidebarConstants.PERMISSION_VIEW_OBJECT, VunetSidebarConstants.PERMISSION_MANAGE_OBJECT,
      VunetSidebarConstants.PERMISSION_MANAGE_DATA_SOURCES,
      VunetSidebarConstants.PERMISSION_MANAGE_DATA_ENRICHMENT, VunetSidebarConstants.PERMISSION_MANAGE_DATA_SETTINGS,
      VunetSidebarConstants.PERMISSION_MANAGE_FILES,
      VunetSidebarConstants.PERMISSION_MANAGE_PREFERENCES, VunetSidebarConstants.PERMISSION_MANAGE_USERS,
      VunetSidebarConstants.PERMISSION_MANAGE_LICENSE,
      VunetSidebarConstants.PERMISSION_MANAGE_AGENT, VunetSidebarConstants.PERMISSION_DATA_FETCH_APIS,
      VunetSidebarConstants.PERMISSION_MANAGE_DIAGNOSTIC],
    [VunetSidebarConstants.IMAGEMANAGR]: [VunetSidebarConstants.PERMISSION_MANAGE_FILES],
    [VunetSidebarConstants.BACKUP]: [VunetSidebarConstants.PERMISSION_MANAGE_DATA_SETTINGS],
    [VunetSidebarConstants.NETWORK]: [VunetSidebarConstants.PERMISSION_MANAGE_NETWORK],
    [VunetSidebarConstants.DISCOVERY]: [VunetSidebarConstants.PERMISSION_MANAGE_NETWORK],
    [VunetSidebarConstants.ASSETS]: [VunetSidebarConstants.PERMISSION_MANAGE_NETWORK],
    [VunetSidebarConstants.NETWORKMAP]: [VunetSidebarConstants.PERMISSION_MANAGE_NETWORK]
  };

  constructor(props) {
    super(props);


    this.determineActiveSidebarMenu = this.determineActiveSidebarMenu.bind(this);
  }

  // The href of the page user tries to open is passed to this function
  // Then we try to highlight the corresponding menu item to indicate where the user is
  determineActiveSidebarMenu = (currentRoute) => {
    $('.nav-container').removeClass('active');
    $('.list-group-item').removeClass('active');

    if (currentRoute.includes('/storyboard')) {
      $('#analyticsNavContainer').addClass('active');
      $('#storyboardsLink').addClass('active');
    } else if (currentRoute.includes('/discovery')) {
      $('#networkNavContainer').addClass('active');
      $('#discoveryLink').addClass('active');
    } else if (currentRoute.includes('/assets')) {
      $('#networkNavContainer').addClass('active');
      $('#assetsLink').addClass('active');
    } else if (currentRoute.includes('/networkMap')) {
      $('#networkNavContainer').addClass('active');
      $('#networkMapLink').addClass('active');
    } else if (currentRoute.includes('/discover')) {
      $('#analyticsNavContainer').addClass('active');
      $('#searchLink').addClass('active');
    } else if (currentRoute.includes('/event')) {
      $('#analyticsNavContainer').addClass('active');
      $('#eventsLink').addClass('active');
    } else if (currentRoute.includes('/report')) {
      $('#analyticsNavContainer').addClass('active');
      $('#reportsLink').addClass('active');
    } else if (currentRoute.includes('/visualize')) {
      $('#analyticsConfigurationNavContainer').addClass('active');
      $('#visualizationsLink').addClass('active');
    } else if (currentRoute.includes('/dashboard')) {
      $('#analyticsNavContainer').addClass('active');
      $('#dashboardsLink').addClass('active');
    } else if (currentRoute.includes('/alert')) {
      $('#analyticsConfigurationNavContainer').addClass('active');
      $('#alertRulesLink').addClass('active');
    } else if (currentRoute.includes('/anomaly')) {
      $('#analyticsConfigurationNavContainer').addClass('active');
      $('#anomalyDetectionLink').addClass('active');
    } else if (currentRoute.includes('/management')) {
      $('#analyticsConfigurationNavContainer').addClass('active');
      $('#manageResourcesLink').addClass('active');
    } else if (currentRoute.includes('network_configuartion')) {
      $('#analyticsConfigurationNavContainer').addClass('active');
      $('#networkConfigurationLink').addClass('active');
    } else if (currentRoute.includes('deviceConfiguration')) {
      $('#analyticsConfigurationNavContainer').addClass('active');
      $('#deviceConfigurationLink').addClass('active');
    } else if (currentRoute.includes('/berlin/data_source/vuBlock')) {
      $('#dataNavContainer').addClass('active');
      $('#vuBlockLink').addClass('active');
    } else if (currentRoute.includes('/berlin/data_source/configuration')) {
      $('#dataNavContainer').addClass('active');
      $('#sourcesLink').addClass('active');
    } else if (currentRoute.includes('/berlin/data_source/enrichment')) {
      $('#dataNavContainer').addClass('active');
      $('#enrichLink').addClass('active');
    } else if (currentRoute.includes('/berlin/data_source/storage')) {
      $('#dataStoreNavContainer').addClass('active');
      $('#storageLink').addClass('active');
    } else if (currentRoute.includes('data_source/files')) {
      $('#dataStoreNavContainer').addClass('active');
      $('#filesLink').addClass('active');
    } else if (currentRoute.includes('/berlin/data_source/settings')) {
      $('#dataStoreNavContainer').addClass('active');
      $('#dataRetentionSettingsLink').addClass('active');
    } else if (currentRoute.includes('/berlin/backup')) {
      $('#settingsNavContainer').addClass('active');
      $('#backupLink').addClass('active');
    } else if (currentRoute.includes('/berlin/definition')) {
      $('#settingsNavContainer').addClass('active');
      $('#definitionsLink').addClass('active');
    } else if (currentRoute.includes('/berlin/image_manager')) {
      $('#settingsNavContainer').addClass('active');
      $('#imageManagerLink').addClass('active');
    } else if (currentRoute.includes('/berlin/preferences')) {
      $('#settingsNavContainer').addClass('active');
      $('#preferencesLink').addClass('active');
    } else if (currentRoute.includes('/berlin/user')) {
      $('#settingsNavContainer').addClass('active');
      $('#userLink').addClass('active');
    } else if (currentRoute.includes('/berlin/license')) {
      $('#settingsNavContainer').addClass('active');
      $('#licenseUsage').addClass('active');
    } else if (currentRoute.includes('/berlin/about')) {
      $('#settingsNavContainer').addClass('active');
      $('#aboutLink').addClass('active');
    } else if(currentRoute.includes('/piiData')) {
      $('#dataNavContainer').addClass('active');
      $('#piiDataLink').addClass('active');
    } else if(currentRoute.includes('app/vienna')) {
      $('#analyticsNavContainer').addClass('active');
      $('#dashboardsLink').addClass('active');
    }
  }

  componentDidMount() {
    this.determineActiveSidebarMenu(window.location.href);
  }

  componentDidUpdate() {
  }

  componentWillUnmount() {
  }

  // Rendering final JSX of Vunet Navbar.
  render() {
    return (
      <div id="vunetSidebarContainer" className={this.props.appProps.darkTheme ? 'dark-theme' : 'light-theme'}>

        {
          chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.ANALYTICS]) &&

          <div id="analyticsNavContainer" className="nav-container">
            <button id="analyticsSideNavBtn" className="sidebar-btn">
              <GraphIcon aria-label={VunetSidebarConstants.ANALYTICS} />
            </button>

            <div id="analyticsPopover" className="sidebar-popover">
              <div className="list-group">
                <li className="list-group-item popover-header">{VunetSidebarConstants.ANALYTICS}</li>
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.DASHBOARDS]) &&
                  <a
                    id="dashboardsLink"
                    href="/app/vienna#/dashboards"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.DASHBOARDS}
                  </a>
                }
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.SEARCH]) &&
                  <a
                    id="searchLink"
                    href="/app/vienna#/discover"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.SEARCH}
                  </a>
                }
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.EVENTS]) &&
                  <a
                    id="eventsLink"
                    href="/app/vienna#/event"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.EVENTS}
                  </a>
                }
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.REPORTS]) &&
                  <a
                    id="reportsLink"
                    href="/app/vienna#/reports"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.REPORTS}
                  </a>
                }
              </div>
            </div>
          </div>
        }

        {
          chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.ANALYTICS_CONFIGURATIONS]) &&

          <div id="analyticsConfigurationNavContainer" className="nav-container">
            <button id="analyticsConfigurationSideNavBtn" className="sidebar-btn">
              <FileBinaryIcon aria-label={VunetSidebarConstants.ANALYTICS_CONFIGURATIONS} />
            </button>

            <div id="analyticsConfigurationPopover" className="sidebar-popover">
              <div className="list-group">
                <li className="list-group-item popover-header">{VunetSidebarConstants.ANALYTICS_CONFIGURATIONS}</li>
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.VISUALIZATIONS]) &&
                  <a
                    id="visualizationsLink"
                    href="/app/vienna#/visualize"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.VISUALIZATIONS}
                  </a>
                }
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.ALERT_RULES]) &&
                  <a
                    id="alertRulesLink"
                    href="/app/vienna#/alerts"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.ALERT_RULES}
                  </a>
                }
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.ANOMALY_DETECTION]) &&
                  <a
                    id="anomalyDetectionLink"
                    href="/app/vienna#/anomalys"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.ANOMALY_DETECTION}
                  </a>
                }
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.MANAGE_RESOURCES]) &&
                  <a
                    id="manageResourcesLink"
                    href="/app/vienna#/management"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.MANAGE_RESOURCES}
                  </a>
                }
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.NETWORK_CONFIGURATION]) &&
                  <a
                    id="networkConfigurationLink"
                    href="/app/vienna#/berlin/network_configuartion"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.NETWORK_CONFIGURATION}
                  </a>
                }
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.DEVICE_CONFIGURATION]) &&
                  <a
                    id="deviceConfigurationLink"
                    href="/app/vienna#/deviceConfiguration"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.DEVICE_CONFIGURATION}
                  </a>
                }
              </div>
            </div>
          </div>
        }

        {
          chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.DATA]) &&

          <div id="dataNavContainer" className="nav-container">
            <button id="dataSideNavBtn" className="sidebar-btn">
              <DatabaseIcon aria-label={VunetSidebarConstants.DATA} />
            </button>

            <div id="dataPopover" className="sidebar-popover">
              <div className="list-group">
                <li className="list-group-item popover-header">{VunetSidebarConstants.DATA}</li>
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.VUBLOCK]) &&
                  <a
                    id="vuBlockLink"
                    href="/app/vienna#/berlin/data_source/vuBlock"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.VUBLOCK}
                  </a>
                }
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.SOURCES]) &&
                  <a
                    id="sourcesLink"
                    href="/app/vienna#/berlin/data_source/configuration"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.SOURCES}
                  </a>
                }
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.ENRICH]) &&
                  <a
                    id="enrichLink"
                    href="/app/vienna#/berlin/data_source/enrichment"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.ENRICH}
                  </a>
                }
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.PIIDATA]) &&
                  <a
                    id="piiDataLink"
                    href="/app/vienna#/piiData"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.PIIDATA}
                  </a>
                }
              </div>
            </div>
          </div>
        }

        {
          chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.DATA_STORE]) &&

          <div id="dataStoreNavContainer" className="nav-container">
            <button id="dataStoreSideNavBtn" className="sidebar-btn">
              <ToolsIcon aria-label={VunetSidebarConstants.DATA_STORE} />
            </button>

            <div id="dataStorePopover" className="sidebar-popover">
              <div className="list-group">
                <li className="list-group-item popover-header">{VunetSidebarConstants.DATA_STORE}</li>
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.STORAGE]) &&
                  <a
                    id="storageLink"
                    href="/app/vienna#/berlin/data_source/storage"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.STORAGE}
                  </a>
                }
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.FILES]) &&
                  <a
                    id="filesLink"
                    href="/app/vienna#/berlin/data_source/files"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.FILES}
                  </a>
                }
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.DATA_RETENTION_SETTINGS]) &&
                  <a
                    id="dataRetentionSettingsLink"
                    href="/app/vienna#/berlin/data_source/settings"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.DATA_RETENTION_SETTINGS}
                  </a>
                }
              </div>
            </div>
          </div>
        }

        {
          chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.NETWORK]) &&

          <div id="networkNavContainer" className="nav-container">
            <button id="networkSideNavBtn" className="sidebar-btn">
              <ShareAndroidIcon aria-label={VunetSidebarConstants.NETWORK} />
            </button>

            <div id="networkPopover" className="sidebar-popover">
              <div className="list-group">
                <li className="list-group-item popover-header">{VunetSidebarConstants.NETWORK}</li>
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.DISCOVERY]) &&
                  <a
                    id="discoveryLink"
                    href="/app/vienna#/discovery"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.DISCOVERY}
                  </a>
                }
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.ASSETS]) &&
                  <a
                    id="assetsLink"
                    href="/app/vienna#/assets"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.ASSETS}
                  </a>
                }
                {
                  chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.NETWORKMAP]) &&
                  <a
                    id="networkMapLink"
                    href="/app/vienna#/networkMap"
                    className="list-group-item"
                    onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                  >
                    {VunetSidebarConstants.NETWORKMAP}
                  </a>
                }
              </div>
            </div>
          </div>
        }

        <div id="settingsNavContainer" className="nav-container">
          <button id="settingsSideNavBtn" className="sidebar-btn">
            <GearIcon aria-label={VunetSidebarConstants.SETTINGS} />
          </button>

          <div id="settingsPopover" className="sidebar-popover">
            <div className="list-group">
              <li className="list-group-item popover-header">{VunetSidebarConstants.SETTINGS}</li>
              {
                chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.BACKUP]) &&
                <a
                  id="backupLink"
                  href="/app/vienna#/berlin/backup"
                  className="list-group-item"
                  onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                >
                  {VunetSidebarConstants.BACKUP}
                </a>
              }
              {
                chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.DEFINITIONS]) &&
                <a
                  id="definitionsLink"
                  href="/app/vienna#/berlin/definition"
                  className="list-group-item"
                  onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                >
                  {VunetSidebarConstants.DEFINITIONS}
                </a>
              }
              {
                chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.LICENSE_USAGE]) &&
                <a
                  id="licenseUsage"
                  href="/app/vienna#/berlin/license"
                  className="list-group-item"
                  onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                >
                  {VunetSidebarConstants.LICENSE_USAGE}
                </a>
              }
              {
                chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.IMAGEMANAGR]) &&
                <a
                  id="imageManagerLink"
                  href="/app/vienna#/berlin/image_manager"
                  className="list-group-item"
                  onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                >
                  {VunetSidebarConstants.IMAGEMANAGR}
                </a>
              }
              {
                chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.PREFERENCES]) &&
                <a
                  id="preferencesLink"
                  href="/app/vienna#/berlin/preferences"
                  className="list-group-item"
                  onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                >
                  {VunetSidebarConstants.PREFERENCES}
                </a>
              }
              {
                chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.USER]) &&
                <a
                  id="userLink"
                  href="/app/vienna#/berlin/user"
                  className="list-group-item"
                  onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                >
                  {VunetSidebarConstants.USER}
                </a>
              }
              {
                chrome.hideShowSideBarTab(this.sideBarTabsClaim[VunetSidebarConstants.ABOUT]) &&
                <a
                  id="aboutLink"
                  href="/app/vienna#/berlin/about"
                  className="list-group-item"
                  onClick={(e) => { this.determineActiveSidebarMenu(e.target.href); }}
                >
                  {VunetSidebarConstants.ABOUT}
                </a>
              }
            </div>
          </div>
        </div>

      </div>
    );

  }
}

VunetSidebar.propTypes = {
  appProps: PropTypes.object
};
