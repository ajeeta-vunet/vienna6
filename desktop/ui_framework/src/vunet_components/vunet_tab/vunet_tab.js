import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  KuiTabs,
  KuiTab,
} from 'ui_framework/components';

import './_vunet_tab.less';

export class VunetTab extends Component {
  constructor(props) {
    super(props);

    // Set the landing tab on page load.
    this.state = {
      selectedTabId: this.props.landingTab
    };

    // Set the tab to be active.
    this.props.switchTab(this.state.selectedTabId);
  }

  /*
   * This function gets called when a tab is clicked
   *  and it is set to be active.
   */
  onSelectedTabChanged = id => {
    this.setState({
      selectedTabId: id,
    });

    // Call the callback function to navigate to
    // the selected tab.
    this.props.switchTab(id);

  };

  /*
   * This function gets called when a tab is removed
   */
  onTabRemoved = (id, index) => {
    const tab = _.last(this.props.tabs);
    let tabID;
    // If there is more than 1 tab
    if (this.props.tabs.length > 1 && this.state.selectedTabId === id) {
      // If the last tab is deleted then activate the previous tab
      if (tab.id === id) {
        tabID = this.props.tabs[index - 1].id;
      }
      // else set the next tab active
      else {
        tabID = this.props.tabs[index + 1].id;
      }
      this.setState({
        selectedTabId: tabID,
      });
      this.props.switchTab(tabID);
    }
    this.props.removeTab(index);
  };

  // Display the tabs configured.
  // Show the close button only when the delete flag is true.
  renderTabs(tabStyle) {
    return this.props.tabs.map((tab, index) => (
      <div style={tabStyle} className="kuiTabWrapper">
        <KuiTab
          className="vunetTabButtons"
          onClick={() => this.onSelectedTabChanged(tab.id)}
          isSelected={tab.id === this.state.selectedTabId}
          key={index}
          data-placement={tab.name}
          title={tab.name}
          style={tabStyle}
        >
          {tab.name}
        </KuiTab>
        {this.props.delete ? (
          <button
            type="button"
            className="close-tab"
            aria-label="Close"
            onClick={() => this.onTabRemoved(tab.id, index)}
          >
            <span
              aria-hidden="true"
            >
            &times;
            </span>
          </button>
        ) : (''
        )}
      </div>
    ));
  }

  // Render all the tabs
  render() {
    let tabStyle = {};
    if (this.props.tabStyle === undefined) {
      tabStyle = {
        backgroundColor: '#f1f2f7'
      };
    }
    return (
      <KuiTabs>
        {this.renderTabs(tabStyle)}
      </KuiTabs>
    );
  }
}

VunetTab.propTypes = {
  tabs: PropTypes.array,
  landingTab: PropTypes.string,
  switchTab: PropTypes.func,
  removeTab: PropTypes.func,
  delete: PropTypes.bool,
  tabStyle: PropTypes.object
};