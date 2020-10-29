// ------------------------- NOTICE ------------------------------- //
//                                                                  //
//                   CONFIDENTIAL INFORMATION                       //
//                   ------------------------                       //
//     This Document contains Confidential Information or           //
//     Trade Secrets, or both, which are the property of VuNet      //
//     Systems Ltd.  This document may not be copied, reproduced,   //
//     reduced to any electronic medium or machine readable form    //
//     or otherwise duplicated and the information herein may not   //
//     be used, disseminated or otherwise disclosed, except with    //
//     the prior written consent of VuNet Systems Ltd.              //
//                                                                  //
// ------------------------- NOTICE ------------------------------- //

// Copyright 2020 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

// This is the components from where the visulization has been intialized. This component links the visData which is 
// the coming api response to tthe visualiaztion and provides the props to the visualization.
function ReactEditorControllerProviderForVuMetric(config) {

  // Private, getAppState and timefilter providers will be used in prepareLinkIfo to go to reference link
  // and all the children of this are pure react components we cannot inject any of them there , hence
  // we are passing them from here down the heirarachy
  class ReactEditorController {
    constructor(el, vis) {
      this.element = el;
      this.vis = vis;

      // This will be used to disabled the save button

      vis.dirty = true;
      vis.initialized = true;
    }

    render(visData) {
      this.visData = visData;
      return new Promise((resolve) => {
        const Component = this.vis.type.editorConfig.component;
        render(<Component
          config={config}
          vis={this.vis}
          visData={this.visData}
          renderComplete={resolve}
        />, this.element);
      });
    }

    resize() {
      if (this.visData) {
        this.render(this.visData);
      }
    }

    destroy() {
      unmountComponentAtNode(this.element);
    }
  }

  return {
    name: 'react_editor',
    handler: ReactEditorController
  };
}

export { ReactEditorControllerProviderForVuMetric };
