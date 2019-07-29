import React from 'react';
import PropTypes from 'prop-types';

import {
  KuiToolBarFooter,
  KuiToolBarText,
  KuiToolBarFooterSection,
} from '../../';



export function KuiListingTableToolBarFooter({ pager, itemsSelectedCount }) {
  const renderText = () => {
    // if no items are selected on table, then don't show any message on tableFooter
    // if 1 or more items are selected, then we display the count
    if (itemsSelectedCount === 0) {
      return;
    }
    else if (itemsSelectedCount === 1) {
      return '1 item selected';
    }
    else {
      return `${itemsSelectedCount} items selected`;
    }
  };

  let pagerSection;

  if (pager) {
    pagerSection = (
      <KuiToolBarFooterSection>
        {pager}
      </KuiToolBarFooterSection>
    );
  }

  return (
    <KuiToolBarFooter>
      <KuiToolBarFooterSection>
        <KuiToolBarText>
          {renderText()}
        </KuiToolBarText>
      </KuiToolBarFooterSection>

      {pagerSection}
    </KuiToolBarFooter>
  );
}

KuiListingTableToolBarFooter.PropTypes = {
  pager: PropTypes.node,
  itemsSelectedCount: PropTypes.number,
};
