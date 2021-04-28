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

// Copyright 2021 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React from 'react';
import PropTypes from 'prop-types';
import './license_usage.less';
import moment from 'moment';
import {
  LICENSE_USAGE_LEGEND,
  LICENSE_VALIDITY_LEGEND,
} from './license_usage_constants';

export class LicenseUsagePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modules: [],
      modulesWithStatus: [],
      licenseModulesData: [],
      licenseExpiryDate: '',
      licenseExpiryTime: '',
      noOfDaysLeft: null,
      licenseUsageLevel: 'normal',
      totalUsedPercentage: null,
    };
    this.breachedItemsCount = 0;
    this.crossedItemsCount = 0;
    this.impendingItemsCount = 0;
    this.breachedItemsTotalLimit = 0;
    this.breachedItemsTotalUsage = 0;
    this.crossedItemsTotalLimit = 0;
    this.crossedItemsTotalUsage = 0;
    this.impendingItemsTotalLimit = 0;
    this.impendingItemsTotalUsage = 0;
    this.normalItemsTotalLimit = 0;
    this.normalItemsTotalUsage = 0;
  }

  componentDidMount() {
    //This will hold the license modules parameters limit data
    const licenseUsageLimit = this.props.licenseModulesUsageLimit;
    //This will hold the license modules parameters usage data
    const licenseActiveUsage = this.props.licenseModulesActiveUsage;
    //This will hold the list of license modules
    const modules = Object.keys(licenseActiveUsage);
    //This is to store modules with there status
    const modulesWithStatus = [];
    //This is to store the list of license modules,smodule parameters with limit,usage,usagelevel and used percentage
    const licenseModulesData = [];
    //This is to store the license usage level
    let licenseUsageLevel = '';

    //This method returns the structured license module data which is required for usage details table
    const structureLicenseData = this.licenseDetailsData(
      modules,
      licenseUsageLimit,
      licenseActiveUsage,
      licenseModulesData,
      modulesWithStatus
    );

    //This method return the license expiry date, expiry time and no of days left for the license expiry
    const licenseExpiryDetails = this.getLicenseExpiryDetails();

    const normalRowsUsage =
      (this.normalItemsTotalUsage / this.normalItemsTotalLimit) * 100;
    const impendingRowsUsage =
      (this.impendingItemsTotalUsage / this.impendingItemsTotalLimit) * 100;
    const crossedRowsUsage =
      (this.crossedItemsTotalUsage / this.crossedItemsTotalLimit) * 100;
    const breachedRowsUsage =
      (this.breachedItemsTotalUsage / this.breachedItemsTotalLimit) * 100;

    //Here we will get the total usage percentage and current usage level
    //based on usage levels count and priority of usage levels.
    let totalUsedPercentage = null;
    if (this.breachedItemsCount > 0) {
      licenseUsageLevel = 'breached';
      totalUsedPercentage = breachedRowsUsage;
    } else if (this.crossedItemsCount > 0) {
      licenseUsageLevel = 'crossed';
      totalUsedPercentage = crossedRowsUsage;
    } else if (this.impendingItemsCount > 0) {
      licenseUsageLevel = 'impending';
      totalUsedPercentage = impendingRowsUsage;
    } else {
      licenseUsageLevel = 'normal';
      totalUsedPercentage = normalRowsUsage;
    }

    this.setState({
      modules: modules,
      modulesWithStatus: structureLicenseData.modulesWithStatus,
      licenseModulesData: structureLicenseData.licenseModulesData,
      licenseExpiryDate: licenseExpiryDetails.licenseExpiryDate,
      licenseExpiryTime: licenseExpiryDetails.licenseExpiryTime,
      noOfDaysLeft: licenseExpiryDetails.daysLeftForLicenseExpiry,
      licenseUsageLevel: licenseUsageLevel,
      totalUsedPercentage: Math.round(totalUsedPercentage),
    });
  }

  //This method is to construct the license module parameters in a proper structure
  licenseDetailsData(
    modules,
    licenseUsageLimit,
    licenseActiveUsage,
    licenseModulesData,
    modulesWithStatus
  ) {
    modules.map((moduleName) => {
      //This holds the current module all parameters usage limits
      const currentModuleLimits = licenseUsageLimit[moduleName];
      //This holds the current module all parameters usage
      const currentModuleUsed = licenseActiveUsage[moduleName];
      //Getting all modules list
      const moduleParamsLimits = Object.keys(licenseUsageLimit[moduleName]);
      //This holds each module parameters limit,usage,usedpercentagea nd usagelevel
      licenseModulesData[moduleName] = [];
      //Mapping module parameters and assigning limit,usage,percentage and usagelevel
      //(i.e breached,crossed,impending or normal)
      moduleParamsLimits.map((moduleParameter) => {
        //This is the varibale which holds the complete license usage deatails
        const moduleParameters = {};

        if (moduleParameter !== 'status') {
          //If the module status is disabled we should not display
          //the module parameters limit and usage else we will display limit and usage
          //of each module parameter.
          if (currentModuleLimits.status === 'disabled') {
            moduleParameters.moduleParameter = moduleParameter;
            moduleParameters.limit = '-';
            moduleParameters.used = '-';
            moduleParameters.usageLevel = '';
            moduleParameters.percentage = '';
            licenseModulesData[moduleName].push(moduleParameters);
            modulesWithStatus[moduleName] = 'Not Licensed';
          } else {
            //This holds each module parameter limit
            const currentParamLimit =
              currentModuleLimits[moduleParameter] !== 'unlimited'
                ? Number(currentModuleLimits[moduleParameter])
                : 'unlimited';
            //This holds each module parameter usage
            const currentParamUsed = Number(currentModuleUsed[moduleParameter]);
            moduleParameters.moduleParameter = moduleParameter;
            moduleParameters.limit = currentParamLimit;
            moduleParameters.used =
              currentParamLimit === 'unlimited' ? '-' : currentParamUsed;
            modulesWithStatus[moduleName] = '';
            //If the limit is not unlimited calculating the each parameter usage percentage
            //and increasing the count of the each usage level.
            //If it is unlimited just making the percentage also unlimited
            if (currentParamLimit !== 'unlimited') {
              const moduleParamUsedPercentage =
                (currentParamUsed / currentParamLimit) * 100;
              moduleParameters.percentage = moduleParamUsedPercentage;
              moduleParameters.usageLevel = this.getEachParameterUsageLevel(
                moduleParamUsedPercentage
              );
              //This is to update a few class parameterd
              this.getModuleParameterCountLimitUsage(
                currentParamLimit,
                currentParamUsed,
                moduleParamUsedPercentage
              );
            } else {
              moduleParameters.percentage = 'unlimited';
              moduleParameters.usageLevel = '';
            }
            licenseModulesData[moduleName].push(moduleParameters);
          }
        }
      });
    });
    return {
      modulesWithStatus,
      licenseModulesData,
    };
  }

  //This method is to calculate the license expiry date and time in a proper format
  //along with the no of days left for the license expiry date.
  getLicenseExpiryDetails() {
    const todayDate = moment(new Date()); //todays date
    const expiryDate = this.props.licenseModulesUsageLimit.time;
    const expiryDateNew = moment(expiryDate); // another date
    const differenceInTime = moment.duration(expiryDateNew.diff(todayDate));
    const daysLeftForLicenseExpiry = Math.round(differenceInTime.asDays());

    //calculating expiry date
    const licenseExpiryDate =
      moment(expiryDateNew).format('DD') +
      ' ' +
      moment(expiryDateNew).format('MMMM') +
      ' ' +
      moment(expiryDateNew).format('YYYY');
    //calculating expirty time
    const licenseExpiryTime = moment(expiryDateNew).format('HH:mm:ss');
    return {
      daysLeftForLicenseExpiry,
      licenseExpiryDate,
      licenseExpiryTime,
    };
  }

  //This method is to know the each module parameter usage level
  getEachParameterUsageLevel(moduleParamUsedPercentage) {
    let eachParameterUsageLevel = '';
    const isParameterUsageimpeding =
      moduleParamUsedPercentage > 91 && moduleParamUsedPercentage <= 100
        ? 'impending'
        : 'normal';
    const isParameterUsageCrossed =
      moduleParamUsedPercentage > 101 && moduleParamUsedPercentage <= 109
        ? 'crossed'
        : isParameterUsageimpeding;
    eachParameterUsageLevel =
      moduleParamUsedPercentage > 109 ? 'breached' : isParameterUsageCrossed;

    return eachParameterUsageLevel;
  }

  //This method is to update the count, limit and usage results of each module parameter
  getModuleParameterCountLimitUsage(
    currentParamLimit,
    currentParamUsed,
    moduleParamUsedPercentage
  ) {
    switch (true) {
      case moduleParamUsedPercentage > 109:
        this.breachedItemsCount++;
        this.breachedItemsTotalLimit =
          this.breachedItemsTotalLimit + currentParamLimit;
        this.breachedItemsTotalUsage =
          this.breachedItemsTotalUsage + currentParamUsed;
      case moduleParamUsedPercentage > 101 && moduleParamUsedPercentage <= 109:
        this.crossedItemsCount++;
        this.crossedItemsTotalLimit =
          this.crossedItemsTotalLimit + currentParamLimit;
        this.crossedItemsTotalUsage =
          this.crossedItemsTotalUsage + currentParamUsed;
      case moduleParamUsedPercentage > 91 && moduleParamUsedPercentage <= 100:
        this.impendingItemsCount++;
        this.impendingItemsTotalLimit =
          this.impendingItemsTotalLimit + currentParamLimit;
        this.impendingItemsTotalUsage =
          this.impendingItemsTotalUsage + currentParamUsed;
      default:
        this.normalItemsTotalLimit =
          this.normalItemsTotalLimit + currentParamLimit;
        this.normalItemsTotalUsage =
          this.normalItemsTotalUsage + currentParamUsed;
    }

    return;
  }

  render() {
    const {
      modules,
      modulesWithStatus,
      licenseModulesData,
      licenseExpiryDate,
      licenseExpiryTime,
      noOfDaysLeft,
      licenseUsageLevel,
      totalUsedPercentage,
    } = this.state;

    //Calculating license validity canvas color
    const limitColor1 =
      noOfDaysLeft <= 60 && noOfDaysLeft >= 31 ? '#F56F00' : '#F70302';
    const limitColor2 =
      noOfDaysLeft <= 90 && noOfDaysLeft >= 61 ? '#FCA600' : limitColor1;
    const limitColor = noOfDaysLeft > 90 ? '#05A608' : limitColor2;

    //Calculating license usage canvas color
    const usageColor1 =
      licenseUsageLevel === 'impending' ? '#FCA600' : '#05A608';
    const usageColor2 =
      licenseUsageLevel === 'crossed' ? '#F56F00' : usageColor1;
    const usageColor =
      licenseUsageLevel === 'breached' ? '#F70302' : usageColor2;

    return (
      <div className="license-details-container">
        <div className="license-validity-usage-wrapper">
          <div className="license-validity-container">
            <p className="license-validity">License Validity</p>
            <div className="canvas-expiry">
              <div className="canvas-wrapper-container">
                <div
                  className="canvas-wrapper"
                  style={{
                    border: '5px solid',
                    borderWidth: '1.4rem',
                    borderColor: limitColor,
                  }}
                >
                  <div className="validity-days">
                    <div className="days-left">{noOfDaysLeft}</div>
                    <div>Days left</div>
                  </div>
                </div>
              </div>
              <div className="expiry-wrapper">
                <div className="expiry">
                  <p>Expires on</p>
                  <p className="expiry-date">{licenseExpiryDate}</p>
                  <p>{licenseExpiryTime}</p>
                </div>
              </div>
            </div>
            <div className="legend-container">
              {LICENSE_VALIDITY_LEGEND.map((legend, index) => {
                return (
                  <div key={index} className="legend">
                    <div className={`dot ${legend.severity}`} />
                    <div className="legend-text">{legend.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="license-usage-container">
            <p className="license-usage">License Usage</p>
            <div className="canvas-usage">
              <div className="canvas-wrapper-container">
                <div
                  className="canvas-wrapper"
                  style={{
                    border: '5px solid',
                    borderWidth: '1.4rem',
                    borderColor: usageColor,
                  }}
                >
                  <div className="license-used-percentage">
                    <div>{licenseUsageLevel}</div>
                  </div>
                </div>
              </div>
              <div className="license-usage-text-wrapper">
                {licenseUsageLevel === 'normal' && (
                  <div className="license-usage-text">
                    <p>Current usage is with in the Licensed limits.</p>
                  </div>
                )}
                {licenseUsageLevel === 'impending' && (
                  <div className="license-usage-text">
                    <p>Current usage is approaching Licensed limits.</p>
                    <p>Please contact VuNet support team immediately.</p>
                  </div>
                )}
                {(licenseUsageLevel === 'crossed' ||
                  licenseUsageLevel === 'breached') && (
                    <div className="license-usage-text">
                      <p>
                      Current usage has <b>{licenseUsageLevel}</b> Licensed
                      limits.
                      </p>
                      <p>Please contact VuNet support team immediately.</p>
                    </div>
                  )}
              </div>
            </div>
            <div className="legend-container">
              {LICENSE_USAGE_LEGEND.map((legend, index) => {
                return (
                  <div key={index} className="legend">
                    <div className={`dot ${legend.severity}`} />
                    <div className="legend-text">{legend.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="license-details-table-container">
          <div className="license-details-table">
            <p className="table-title">Usage details</p>
            <div className="usage-details-table">
              <div>
                <div className="license-table-header">
                  <div className="module-name-wrapper">
                    <div className="module-title" />
                    <div className="limit">Usage Limit</div>
                    <div className="usage">Actual Usage</div>
                  </div>
                </div>
              </div>
              <div className="table-body">
                {modules.map((eachModule, moduleIndex) => (
                  <div key={moduleIndex + 'module'}>
                    <div className="module-name-wrapper">
                      <div className="module-title">
                        Module : {eachModule}
                        &nbsp;
                        {modulesWithStatus[eachModule] === 'Not Licensed' && (
                          <div className="module-status">
                            - {modulesWithStatus[eachModule]}
                          </div>
                        )}
                      </div>
                      <div className="limit" />
                      <div className="usage" />
                    </div>
                    {licenseModulesData[eachModule].map(
                      (eachItem, moduleParameterIndex) => (
                        <div
                          key={moduleParameterIndex + 'module item'}
                          className="module-item-name"
                        >
                          {eachItem.usageLevel === licenseUsageLevel &&
                            licenseUsageLevel !== 'normal' && (
                              <div
                                className={
                                  // eslint-disable-next-line no-nested-ternary
                                  eachItem.percentage > 109
                                    ? 'breached'
                                    : eachItem.percentage > 101 &&
                                      eachItem.percentage <= 109
                                      ? 'crossed'
                                      : 'impending'
                                }
                              />
                            )}
                          {licenseUsageLevel !== 'normal' &&
                            eachItem.usageLevel !== licenseUsageLevel && (
                              <div className="normal" />
                            )}
                          <div className="module-title">
                            {eachItem.moduleParameter}
                          </div>
                          <div className="limit">{eachItem.limit}</div>
                          <div className="usage">{eachItem.used}</div>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

LicenseUsagePage.propTypes = {
  licenseModulesUsageLimit: PropTypes.object, //contains the list of modules and moduleParameters limit
  licenseModulesActiveUsage: PropTypes.object, //contails the list of modules and moduleParameters usage
};
