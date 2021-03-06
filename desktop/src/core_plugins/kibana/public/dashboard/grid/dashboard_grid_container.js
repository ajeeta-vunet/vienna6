import { connect } from 'react-redux';
import { DashboardGrid } from './dashboard_grid';
import { updatePanels } from '../actions';
import {
  getPanels,
  getViewMode,
  getUseMargins,
  getTitle,
  getObjectType,
} from '../selectors';

const mapStateToProps = ({ dashboard }) => ({
  panels: getPanels(dashboard),
  dashboardViewMode: getViewMode(dashboard),
  useMargins: getUseMargins(dashboard),
  isHomeDashboard: (getTitle(dashboard)  === 'Home' ? true : false),
  objectType: getObjectType(dashboard),
});

const mapDispatchToProps = (dispatch) => ({
  onPanelsUpdated: updatedPanels => dispatch(updatePanels(updatedPanels)),
});

export const DashboardGridContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardGrid);
