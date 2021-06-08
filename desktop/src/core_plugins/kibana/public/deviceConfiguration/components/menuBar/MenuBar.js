import React, { Component } from 'react';
import './MenuBar.less';
import { DeviceConfigConstants } from '../../deviceConfigurationConstants';


// To navigate to various sections in DCM such as 'Device Families', 'Policies', 'Dashboards' etc.
// 'Devices' section is shown by default
class MenuBar extends Component {

    navigateTo = (e) => {
        if(e.target.id === 'devices'){
            window.location.href = 'vienna#' +
            DeviceConfigConstants.LANDING_PAGE_PATH;
        } 
        // else if(e.target.id === 'deviceFamilies'){
        //     window.location.href = 'vienna#' +
        //     DeviceConfigConstants.DEVICE_FAMILIES;
        // }
    }

    render(){
        return(
            <div className="tabs-section" onClick={(e) => this.navigateTo(e)}>
                <div id="devices" 
                className={`individual-tab ${this.props.currentSection === 'devices' ? 'selected-tab' : null}`}>
                    Devices
                </div>
                {/* <div id="deviceFamilies"
                className={`individual-tab ${this.props.currentSection === 'deviceFamilies' ? 'selected-tab' : null}`}>
                    Device Families
                </div> */}
            </div>
        );
    }
}

export default MenuBar;