import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { PanelEditOptions } from './panel_edit_options';

import {
  destroyEmbeddable,
  deletePanel,
} from '../../actions';

import {
  getEmbeddable,
  getEmbeddableEditUrl,
  getMaximizedPanelId,
  getPanel,
} from '../../selectors';


const mapStateToProps = ({ dashboard }, { panelId }) => {
  const embeddable = getEmbeddable(dashboard, panelId);
  const panel = getPanel(dashboard, panelId);
  const embeddableTitle = embeddable ? embeddable.title : '';
  return {
    panelTitle: panel.title === undefined ? embeddableTitle : panel.title,
    editUrl: embeddable ? getEmbeddableEditUrl(dashboard, panelId) : null,
    isExpanded: getMaximizedPanelId(dashboard) === panelId,
  };
};


/**
 * @param dispatch {Function}
 * @param panelId {string}
 */
const mapDispatchToProps = (dispatch, { embeddableFactory, panelId }) => ({
  onDeletePanel: () => {
    dispatch(deletePanel(panelId));
    dispatch(destroyEmbeddable(panelId, embeddableFactory));
  },
});

const mergeProps = (stateProps, dispatchProps) => {
  const { editUrl } = stateProps;
  const { ...dispatchers } = dispatchProps;

  return {
    editUrl,
    ...dispatchers
  };
};

export const PanelEditOptionsContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(PanelEditOptions);

PanelEditOptionsContainer.propTypes = {
  panelId: PropTypes.string.isRequired,
};
