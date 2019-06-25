import React from 'react';
import chrome from 'ui/chrome';

import {
  KuiEmptyTablePrompt,
  KuiEmptyTablePromptPanel,
  KuiLinkButton,
  KuiButtonIcon,
} from 'ui_framework/components';

export function NoVisualizationsPrompt() {
  return (
    <KuiEmptyTablePromptPanel>
      {chrome.isModifyAllowed() ?
        (
          <KuiEmptyTablePrompt
            actions={
              <KuiLinkButton
                href="#/visualize/new"
                buttonType="primary"
                icon={<KuiButtonIcon type="create" />}
              >
                Create a visualization
              </KuiLinkButton>
            }
            message="Looks like you don't have any visualizations. Let's create some!"
          />
        ) :
        (
          <KuiEmptyTablePrompt
            message="Looks like you don't have any visualizations."
          />
        )
      }
    </KuiEmptyTablePromptPanel>
  );
}
