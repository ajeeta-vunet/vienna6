import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PanelHeader } from './panel_header';
import { PanelError } from './panel_error';

export class DashboardPanel extends React.Component {
  async componentDidMount() {
    this.props.renderEmbeddable(this.panelElement, this.props.panel);
  }

  onFocus = () => {
    const { onPanelFocused, panel } = this.props;
    if (onPanelFocused) {
      onPanelFocused(panel.panelIndex);
    }
  };

  onBlur = () => {
    const { onPanelBlurred, panel } = this.props;
    if (onPanelBlurred) {
      onPanelBlurred(panel.panelIndex);
    }
  };

  componentWillUnmount() {
    this.props.onDestroy();
  }

  renderEmbeddedContent(panelContentClass) {
    return (
      <div
        id="embeddedPanel"
        className={panelContentClass}
        ref={panelElement => this.panelElement = panelElement}
      />
    );
  }

  renderEmbeddedError() {
    const { error } = this.props;
    const errorMessage = error.message || JSON.stringify(error);
    return <PanelError error={errorMessage} />;
  }

  renderEmbeddedContent(panelContentClass) {
    return (
      <div
        id="embeddedPanel"
        className={panelContentClass}
        ref={panelElement => this.panelElement = panelElement}
      />
    );
  }

  renderEmbeddedError() {
    return <PanelError error={this.props.error} />;
  }

  render() {
    let classes;
    let dashboardPanelClass = 'dashboard-panel';
    let panelContentClass = 'panel-content';

    const { visState, viewOnlyMode, error, panel, embeddableFactory } = this.props;
    if (visState && visState.type === 'markdown' && visState.params.useForHeading) {
      classes = classNames('markdown-panel panel-default', this.props.className, {
        'panel--edit-mode': !viewOnlyMode
      });
    }

    // When 'useForHeading' option is checked in HTML vis, we make the background
    // of this visualization panel to be transparent.
    else if(visState && visState.type === 'html' && visState.params.useForHeading) {
      classes = classNames('html-panel panel-default', this.props.className, {
        'panel--edit-mode': !viewOnlyMode
      });
    }

    // To display rounded corners for BMV panels when
    // panel header is not present, we have defined the following 2 classes:
    // dashboardPanelClass, panelContentClass
    else if (visState && visState.type === 'business_metric') {
      classes = classNames('panel panel-default', this.props.className, {
        'panel--edit-mode': !viewOnlyMode
      });
      dashboardPanelClass = 'dashboard-panel-without-header dashboard-panel';
      panelContentClass = 'panel-content-without-header panel-content';
    }
    else {
      classes = classNames('panel panel-default', this.props.className, {
        'panel--edit-mode': !viewOnlyMode
      });
    }
    return (
      <div
        className={dashboardPanelClass}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
      >
        <div
          className={classes}
          data-test-subj="dashboardPanel"
        >
          <PanelHeader
            embeddableFactory={embeddableFactory}
            panelId={panel.panelIndex}
          />

          {error ? this.renderEmbeddedError() : this.renderEmbeddedContent(panelContentClass)}

        </div>
      </div>
    );
  }
}

DashboardPanel.propTypes = {
  panel: PropTypes.shape({
    panelIndex: PropTypes.string,
  }),
  renderEmbeddable: PropTypes.func.isRequired,
  viewOnlyMode: PropTypes.bool.isRequired,
  onDestroy: PropTypes.func.isRequired,
  onPanelFocused: PropTypes.func,
  onPanelBlurred: PropTypes.func,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  embeddableFactory: PropTypes.object.isRequired,
  visState: PropTypes.object.isRequired,
};
