import React, { Component } from 'react';
import MenuBar from '../menuBar/MenuBar';
import DeviceListing from '../deviceListing/DeviceListing';

// this is the home screen of DCM
class Devices extends Component{
    render(){
        return(
            <div>
                <MenuBar currentSection='devices'/>
                <DeviceListing/>
            </div>
        );
    }
}

export default Devices;