import React from 'react';
import PropTypes from 'prop-types';

import {
  KuiButton,
  KuiButtonIcon,
} from '../..';

export function KuiListingTableExportButton({ onExport, ...props }) {
  return (
    <KuiButton
      {...props}
      buttonType="export"
      onClick={onExport}
      icon={<KuiButtonIcon type="export" />}
    />
  );
}

KuiListingTableExportButton.propTypes = {
  onExport: PropTypes.func
};
