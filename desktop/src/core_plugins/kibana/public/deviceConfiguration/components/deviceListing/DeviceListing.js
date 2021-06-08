import React, { Component } from 'react';
import './DeviceListing.less';
import $ from 'jquery';
import { generateHeading } from '../../../event/utils/vunet_format_name';
import produce from 'immer';
import { apiProvider } from '../../../../../../../ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';
import Pagination from 'react-js-pagination';
import { Notifier } from 'ui/notify';
import Button from '../../../../../../../ui_framework/src/vunet_components/button/Button';

// to notify the user on successful deletion and sort operation
const notify = new Notifier({ location: 'DCM' });

class DeviceListing extends Component{
    state={
        devices: true,
        selectedItems: [],
        deviceListing: [],
        currentPage: 1,
        totalNumberOfDevices: 0,
        searchString: '',
        sort_string: {},
        // addDevice: false,
        // deviceDetails: false,
        // deviceIDForDetails: -1,
        // enable: false,
        // disable: false,
        // collectConfig: false,
        // importDevices: false,
        // exportDevices: false
    }

    componentDidMount(){
        const postBody = {
            scroll_id : 0,
            size : 10,
            sort_string : "",
            search_string : "",
            filter : {}
        }
        // to get the default list of devices
        apiProvider.post('/dcm/device/', postBody)
            .then(data => {
                this.setState({deviceListing: data.device_list, totalNumberOfDevices: data.no_of_nodes});
            })
    }

    componentDidUpdate() {
        //this is to avoid redirection to homepage after click of the button in pagination component.
        $('.pagination li a').on('click', function (e) {
          e.preventDefault();
        });
    }

    // To navigate between various sections such as 'Add Device', 'Enable Config' etc,
    onTableAction = (e) => {
        // if the clicked button is not 'Delete', then navigate to relevant section.
        if(e.target.id !== 'deleteDevice'){
                // $('.toolbar-button').removeClass('toolbar-button-current');
                // e.target.classList.add('toolbar-button-current');
                // const id = e.target.id;
                // const newState = {...this.state,devices: false, addDevice: false, enable: false,
                //         disable: false, collectConfig: false, importDevices: false, exportDevices: false};
                // newState[id] = true;
                // this.setState(newState);
        } else{
            // delete one or more selected devices
            if(this.state.selectedItems.length > 0){
                const deletePromise = (
                    this.state.selectedItems.map(item => 
                        apiProvider.remove('dcm/device/' + item + '/', '')
                    )
                );
                Promise.all(deletePromise).then((res) => {
                    if(res[res.length-1].status === 200){
                        const postBody = {
                            scroll_id : 0,
                            size : 10,
                            sort_string : '',
                            search_string: '',
                            filter : {}
                        };
                        apiProvider.post('/dcm/device/', postBody)
                        .then(data => {
                            this.setState({
                                deviceListing: data.device_list,
                                totalNumberOfDevices: data.no_of_nodes,
                                selectedItems: [],
                                currentPage: 1
                            }, () => notify.info('Selected devices successfully deleted'));
                        })
                    } else{
                        notify.info('Cannot delete selected devices. Try again later');
                    }  
                })
                // clear all check-boxes
                $('.single-check').each(function () {
                    this.checked = false;
                });
                $('.multi-check').each(function () {
                    this.checked = false;
                });
            } else{
                notify.info('Select one or more devices');
            }
        }; 
    }

    // to delete a single device
    deleteOne = (id, name) => {
        apiProvider.remove('dcm/device/' + id + '/', '')
        .then(res => {
            if(res.status === 200){
                const updatedDevices = this.state.deviceListing.filter(device => device.id !== id);
                this.setState({deviceListing:updatedDevices}, () => notify.info(`${name} successfully deleted`));
            } else{
                notify.info('Cannot delete this device. Try again later')
            }
        });
    }

    // to select all devices when user clicks on the checkbox in table header.
    selectAll = (e) => {
        if(e.target.checked) {
          $('.single-check').each(function () {
            this.checked = true;
          });
          const updatedItems = this.state.deviceListing.map(item => item.id);
          const newState = {...this.state, selectedItems: updatedItems};
          this.setState(newState);
        } else{
            $('.single-check').each(function () {
                this.checked = false;
            });
            const newState = {...this.state, selectedItems:[]};
            this.setState(newState);
        }
    }

    // to select a device when user clicks on the checkbox in the table row
    selectOne = (e, id) => {
        if(e.target.checked){
            const selectedItems = produce(this.state.selectedItems, (draft) => {
                draft.push(id);
            });
            this.setState({selectedItems}, 
                () => {
                    if(this.state.selectedItems.length === this.state.deviceListing.length){
                        $('.multi-check').each(function () {
                            this.checked = true;
                        });
                    }
                }
            );
        } else{
            $('.multi-check').each(function () {
                this.checked = false;
            });
            const updatedItems = this.state.selectedItems.filter(item => item!=id);
            this.setState({...this.state, selectedItems: updatedItems});
        }
    }

    // sort the table when user clicks on the sort icon in the table header of relevant column
    sortTable = (param) => {
        const sort_selected = {
            sort_column: param,
            sort_method: 'asc'
        }
        // check if the table is already sorted
        if(Object.keys(this.state.sort_string).length > 0){
            // if true, check if it is sorted on the clicked column
            if(this.state.sort_string.sort_column === param){
                // if true, check if it's ascending and if true, sort it on descending now
                if(this.state.sort_string.sort_method === 'asc'){
                    sort_selected.sort_method = 'des';
                }
            }
        }
        // if the table is not sorted or sorted on descending order of the selected column,
        // sort it in the ascending order of selected column.
        this.setState({sort_string:sort_selected});
        // along with sorting, check if there is a search string
        const searchString = $('.search-input').val();
        const postBody = {
            scroll_id: 0,
            size: 10,
            sort_string: sort_selected,
            search_string: searchString,
            filter:{}
        };
        // API call to fetch devices in sorted order
        apiProvider.post('/dcm/device/', postBody)
            .then(data => {
                this.setState({deviceListing: data.device_list,
                    currentPage: 1,
                    totalNumberOfDevices: data.no_of_nodes}, 
                    () => notify.info(`Devices sorted in ${sort_selected.sort_method === 'asc' ? 'ascending' : 'descending'} order based on ${sort_selected.sort_column}`));
            });
    }

    // when the user clicks on 'view details' icon in the relevant row
    // showDeviceDetails = (id) => {
    //     const details = !this.state.deviceDetails;
    //     const newState = {...this.state, deviceIDForDetails: id, deviceDetails: details};
    //     this.setState(newState);
    // }

    // called when user interacts with pagination component
    // currentPage is the page that the user wants to navigate to
    handlePageChange = (currentPage) => {
        const searchString = $('.search-input').val();
        const postBody = {
            scroll_id: (currentPage - 1) * 10,
            size: 10,
            sort_string: this.state.sort_string,
            search_string: searchString,
            filter:{}
        };
        // fetch the devices for the currentPage
        apiProvider.post('/dcm/device/', postBody)
            .then(data => {
            this.setState({deviceListing: data.device_list,
                totalNumberOfDevices: data.no_of_nodes,
                currentPage: currentPage});
        });
    }

    // when user starts typing in search-box
    searchDevices = (e) => {
        const search = e.target.value;
        this.setState({searchString: search});
        if(search !== ''){
            const postBody = {
                scroll_id: 0,
                size: 10,
                sort_string : this.state.sort_string,
                search_string: search,
                filter:{}
            };
            apiProvider.post('/dcm/device/', postBody)
                .then(data => {
                    this.setState({deviceListing: data.device_list,
                        totalNumberOfDevices: data.no_of_nodes,
                        currentPage: 1
                    });
            });
        } else{
            // if search box is empty i.e. when user clears the search-box,
            // fetch the default list of devices.
            const postBody = {
                scroll_id : 0,
                size : 10,
                sort_string : "",
                search_string : "",
                filter : {}
            }
            apiProvider.post('/dcm/device/', postBody)
                .then(data => {
                    this.setState({deviceListing: data.device_list,
                        totalNumberOfDevices: data.no_of_nodes});
                })
        }
    }

    render(){
        return(
            <div className='devices'>
                <h4>
                    Device Listings
                </h4>
                <div className='tool-bar'>
                    <input value={this.state.searchString} onChange={(e) => this.searchDevices(e)} type='text' placeholder='Search' className='search-input'/>
                    {/* <div className='toolbar-button' id='addDevice'>
                        <Button type='tableActions' text='Add'/>
                    </div> */}
                    <Button type='tableActions' text='Delete' id='deleteDevice'
                    onClick={this.onTableAction}/>
                    {/* <div className='toolbar-button'>
                        <Button type='tableActions' text='Enable' id='enable'/>
                    </div>
                    <div className='toolbar-button'>
                        <Button type='tableActions' text='Disable' id='disable'/>
                    </div>
                    <div className='toolbar-button'>
                        <Button type='tableActions' text='Collect Config' id='collectConfig'/>
                    </div>
                    <div className='toolbar-button'>
                        <Button type='tableActions' text='Import' id='importDevices'/>
                    </div>
                    <div className='toolbar-button'>
                        <Button type='tableActions' text='Export' id='exportDevices'/>
                    </div> */}
                </div>
                { this.state.devices && 
                    <div className='table-container'>
                        <table className='table tbl'>
                            <thead>
                                <tr>
                                    <th>
                                        <input className='multi-check' type='checkbox' onChange={(e) => this.selectAll(e)}/>
                                    </th>
                                    <th>
                                        {generateHeading('Device Name')}
                                        <i className="fa fa-sort-amount-desc sort-icon" onClick={() => this.sortTable('device_name')}/>
                                    </th>
                                    <th>
                                        {generateHeading('Address')}
                                        <i className="fa fa-sort-amount-desc sort-icon" onClick={() => this.sortTable('device_address')}/>
                                    </th>
                                    <th>
                                        {generateHeading('Device Family')}
                                        <i className="fa fa-sort-amount-desc sort-icon" onClick={() => this.sortTable('device_family_name')}/>
                                    </th>
                                    <th>
                                        {generateHeading('Collect Schedule')}
                                        <i className="fa fa-sort-amount-desc sort-icon" onClick={() => this.sortTable('collect_schedule_status')}/>
                                    </th>
                                    <th>
                                        {generateHeading('Actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.deviceListing.map(eachDevice => <tr key={eachDevice.id}>
                                        <td>
                                            <input className='single-check' type='checkbox' onChange = {e => this.selectOne(e, eachDevice.id)}/>
                                        </td>
                                        <td>
                                            {eachDevice.device_name}
                                        </td>
                                        <td>
                                            {eachDevice.device_address}
                                        </td>
                                        <td>
                                            {eachDevice.device_family_name}
                                        </td>
                                        <td>
                                            {eachDevice.collect_schedule_status}
                                        </td>
                                        <td>
                                            {/* <i id='details' onClick={() => this.showDeviceDetails(eachDevice.id)} className='fa fa-pencil'></i> */}
                                            <i className='fa fa-trash' onClick={() => this.deleteOne(eachDevice.id, eachDevice.device_name)}
                                            />
                                        </td>
                                    </tr>)
                                }
                            </tbody>
                        </table>
                    </div>
                }
                {   
                    this.state.devices &&
                    <div className="pagination">
                        <Pagination
                            hideDisabled
                            activePage={this.state.currentPage}
                            itemsCountPerPage={10}
                            totalItemsCount={this.state.totalNumberOfDevices}
                            onChange={this.handlePageChange}
                        />
                    </div>
                }      
            </div>
        )
    }
}

export default DeviceListing;