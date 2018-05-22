import React from 'react';
import PropTypes from 'prop-types';

export class PanelEditOptions extends React.Component {

  state = {};
  onEdit = () => {
    window.location = this.props.editUrl;
  };

  onDeletePanel = () => {
    if (this.props.onDeletePanel) {
      this.props.onDeletePanel();
    }
  };

  render() {
    return (
      <div>
        <button
          className="kuiMicroButton editButton"
          aria-label="Edit panel"
          data-test-subj="dashboardEditIcon"
          onClick={this.onEdit}
        >
          <span
            aria-hidden="true"
            className="kuiIcon fa-pencil-square-o"
          />
        </button>
        <button
          className="kuiMicroButton deleteButton"
          aria-label="Delete panel"
          data-test-subj="dashboardDeleteIcon"
          onClick={this.onDeletePanel}
        >
          <span
            aria-hidden="true"
            className="kuiIcon fa-trash"
          />
        </button>
      </div>
    );
  }
}

PanelEditOptions.propTypes = {
  onEdit: PropTypes.func,
  onDeletePanel: PropTypes.func

};
