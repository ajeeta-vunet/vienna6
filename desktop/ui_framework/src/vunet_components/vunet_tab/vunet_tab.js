import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

  // Display the tabs configured.
  renderTabs() {
    return this.props.tabs.map((tab, index) => (
      <KuiTab
        className="vunetTabButtons"
        onClick={() => this.onSelectedTabChanged(tab.id)}
        isSelected={tab.id === this.state.selectedTabId}
        key={index}
      >
        {tab.name}
      </KuiTab>
    ));
  }

  // Render all the tabs
  render() {
    return (
      <KuiTabs>
        {this.renderTabs()}
      </KuiTabs>
    );
  }
}

VunetTab.propTypes = {
  tabs: PropTypes.array,
  landingTab: PropTypes.string,
  switchTab: PropTypes.func
};