import React from 'react';
import PropTypes from 'prop-types';

import {
  KuiButton,
  KuiButtonIcon,
} from '../..';

export function KuiListingTableImportButton({ onImport, ...props }) {
  return (
    <KuiButton
      {...props}
      buttonType="import"
      onClick={onImport}
      icon={<KuiButtonIcon type="import" />}
    />
  );
}

KuiListingTableImportButton.propTypes = {
  onImport: PropTypes.func
};
