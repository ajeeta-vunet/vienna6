import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { InputControlVis } from './components/vis/vis';
import { controlFactory } from './control/control_factory';
import { getLineageMap } from './lineage';
class VisController {
  constructor(el, vis) {
    this.el = el;
    this.vis = vis;
    this.controls = [];

    this.queryBarUpdateHandler = this.updateControlsFromKbn.bind(this);
    this.vis.API.queryFilter.on('update', this.queryBarUpdateHandler);
  }

  async render(visData, printReport, status) {
    if (status.params || (this.vis.params.useTimeFilter && status.time)) {
      this.controls = [];
      this.controls = await this.initControls();
      this.drawVis();
      return;
    }
    return;
  }

  destroy() {
    this.vis.API.queryFilter.off('update', this.queryBarUpdateHandler);
    unmountComponentAtNode(this.el);
  }

  drawVis() {
    render(
      <InputControlVis
        updateFiltersOnChange={this.vis.params.updateFiltersOnChange}
        displayHorizontalLayout={this.vis.params.displayHorizontalLayout}
        controls={this.controls}
        stageFilter={this.stageFilter.bind(this)}
        submitFilters={this.submitFilters.bind(this)}
        resetControls={this.updateControlsFromKbn.bind(this)}
        clearControls={this.clearControls.bind(this)}
        hasChanges={this.hasChanges.bind(this)}
        hasValues={this.hasValues.bind(this)}
        refreshControl={this.refreshControl.bind(this)}
      />,
      this.el);
  }

  async initControls() {

    // List containing the control configuration (configured by user)
    const controlParamsList = this.vis.params.controls.filter((controlParams) => {

      // We ignore the controls that do not have indexPattern or field
      return controlParams.indexPattern && controlParams.fieldName;
    });

    // List of promises which is obtained from control factories (List and Range)
    const controlFactoryPromises = controlParamsList.map((controlParams) => {

      // Get the appropriate factory method(List / Range) by
      // using the control type.
      const factory = controlFactory(controlParams);

      // return the promise returned by factory method.
      return factory(controlParams, this.vis.API);
    });

    // 'controls' contain the data sets to be passed to the ListControl and
    // RangeControl components that is displayed in the visualization
    const controls = await Promise.all(controlFactoryPromises);

    const getControl = (id) => {
      return controls.find(control => {
        return id === control.id;
      });
    };

    const controlInitPromises = [];
    getLineageMap(controlParamsList).forEach((lineage, controlId) => {
      // first lineage item is the control. remove it
      lineage.shift();
      const ancestors = [];

      // Prepare ancestors list
      lineage.forEach(ancestorId => {
        ancestors.push(getControl(ancestorId));
      });

      const control = getControl(controlId);

      // Set ancestors.
      control.setAncestors(ancestors);
      controlInitPromises.push(control.fetch());
    });

    await Promise.all(controlInitPromises);
    return controls;
  }

  stageFilter = async (controlIndex, newValue) => {
    this.controls[controlIndex].set(newValue);
    if (this.vis.params.updateFiltersOnChange) {
      // submit filters on each control change
      this.submitFilters();
    } else {
      await this.updateNestedControls();
      // Do not submit filters, just update vis so controls are updated with latest value
      this.drawVis();
    }
  }

  submitFilters() {
    // Clean up filter pills for nested controls that are now disabled because ancestors are not set
    this.controls.map(async (control) => {
      if (control.hasAncestors() && control.hasUnsetAncestor()) {
        control.filterManager.findFilters().forEach((existingFilter) => {
          this.vis.API.queryFilter.removeFilter(existingFilter);
        });
      }
    });

    const stagedControls = this.controls.filter((control) => {
      return control.hasChanged();
    });

    const newFilters = stagedControls
      .filter((control) => {
        return control.hasKbnFilter();
      })
      .map((control) => {
        return control.getKbnFilter();
      });

    stagedControls.forEach((control) => {
      // to avoid duplicate filters, remove any old filters for control
      control.filterManager.findFilters().forEach((existingFilter) => {
        this.vis.API.queryFilter.removeFilter(existingFilter);
      });
    });

    this.vis.API.queryFilter.addFilters(newFilters);
  }

  clearControls() {
    this.controls.forEach((control) => {
      control.clear();
    });
    this.drawVis();
  }

  updateControlsFromKbn = async () => {
    this.controls.forEach((control) => {
      control.reset();
    });
    await this.updateNestedControls();
    this.drawVis();
  }

  // Makes query to ES whenever Update happens.
  async updateNestedControls() {
    const fetchPromises = this.controls.map(async (control) => {
      if (control.hasAncestors()) {
        await control.fetch();
      }
    });
    return await Promise.all(fetchPromises);
  }

  hasChanges() {
    return this.controls.map((control) => {
      return control.hasChanged();
    })
      .reduce((a, b) => {
        return a || b;
      });
  }

  hasValues() {
    return this.controls.map((control) => {
      return control.hasValue();
    })
      .reduce((a, b) => {
        return a || b;
      });
  }

  // Calls whenever fetch happened.
  refreshControl = async (controlIndex, query) => {
    await this.controls[controlIndex].fetch(query);
    this.drawVis();
  }
}

export { VisController };
