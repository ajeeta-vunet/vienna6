import React from 'react';
import PropTypes from 'prop-types';

import {
  KuiButton,
  KuiButtonIcon,
} from '../..';

export function KuiListingTablePublishButton({ onPublish, ...props }) {
  return (
    <KuiButton
      {...props}
      buttonType="basic"
      onClick={onPublish}
      icon={<KuiButtonIcon type="publish" />}
    />
  );
}

KuiListingTablePublishButton.propTypes = {
  onPublish: PropTypes.func
};
