import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PanelHeader } from './panel_header';
import { PanelEditOptionsContainer } from './panel_edit_options_container';
import { PanelMaximizeIcon } from './panel_maximize_icon';
import { PanelMinimizeIcon } from './panel_minimize_icon';
import { DashboardViewMode } from '../../dashboard_view_mode';
import { hideBmvTitle } from 'ui/utils/vunet_bmv_utils.js';
import { hideMarkdownTitle } from 'ui/utils/vunet_markdown_utils.js';

import {
  maximizePanel,
  minimizePanel,
} from '../../actions';

import {
  getEmbeddable,
  getPanel,
  getMaximizedPanelId,
  getFullScreenMode,
  getViewMode,
  getHidePanelTitles,
  getObjectType,
} from '../../selectors';

const mapStateToProps = ({ dashboard }, { panelId }) => {
  const embeddable = getEmbeddable(dashboard, panelId);
  const panel = getPanel(dashboard, panelId);
  let visState = {};

  const embeddableTitle = embeddable ? embeddable.title : '';
  // Gets the visState from visualization through embeddable
  if (embeddable) {
    visState = embeddable.visState;
  }
  return {
    title: panel.title === undefined ? embeddableTitle : panel.title,
    isExpanded: getMaximizedPanelId(dashboard) === panelId,
    isViewOnlyMode: getFullScreenMode(dashboard) || getViewMode(dashboard) === DashboardViewMode.VIEW,
    visType: visState && visState.type,
    objectType: getObjectType(dashboard),
    //don't show header if vis type is business metric or control vis
    hidePanelTitles: getHidePanelTitles(dashboard) || (visState && visState.type &&
      (visState && visState.type === 'business_metric') && hideBmvTitle(visState)) ||
      (visState && visState.type === 'insight_vis' && visState.params.insights && visState.params.insights.length > 0) ||
      (visState && visState.type === 'input_control_vis') ||
      (visState && visState.type === 'html') ||
      (visState && visState.type === 'metric') ||
      (visState && visState.type && (visState.type === 'markdown') && hideMarkdownTitle(visState)),
  };
};

const mapDispatchToProps = (dispatch, { panelId }) => ({
  onMaximizePanel: () => dispatch(maximizePanel(panelId)),
  onMinimizePanel: () => dispatch(minimizePanel()),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { isExpanded, isViewOnlyMode, title, objectType, hidePanelTitles } = stateProps;
  const { onMaximizePanel, onMinimizePanel } = dispatchProps;
  const { panelId, embeddableFactory } = ownProps;
  let actions;
  // Edit, Delete, manimize and maximize buttons are applicable only for dashboard and
  // not storyboard.
  if (objectType !== 'storyboard')
  {
    if (isViewOnlyMode) {
      actions = isExpanded ?
        <PanelMinimizeIcon onMinimize={onMinimizePanel} /> :
        <PanelMaximizeIcon onMaximize={onMaximizePanel} />;
    } else {
      actions = (
        // <PanelOptionsMenuContainer
        //   panelId={panelId}
        //   embeddableFactory={embeddableFactory}
        // />
        <PanelEditOptionsContainer
          panelId={panelId}
          embeddableFactory={embeddableFactory}
        />
      );
    }
  }

  return {
    title,
    actions,
    isViewOnlyMode,
    hidePanelTitles,
  };
};

export const PanelHeaderContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(PanelHeader);

PanelHeaderContainer.propTypes = {
  panelId: PropTypes.string.isRequired,
  /**
   * @type {EmbeddableFactory}
   */
  embeddableFactory: PropTypes.shape({
    destroy: PropTypes.func.isRequired,
    render: PropTypes.func.isRequired,
    addDestroyEmeddable: PropTypes.func.isRequired,
  }).isRequired,
};
