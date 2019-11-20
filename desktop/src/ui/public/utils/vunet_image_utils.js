
// This function updated list with images and returns it.
export const dictInDictForImages = function (dictInDict) {
  const dict = {};
  for (const image in dictInDict) {
    if (dictInDict.hasOwnProperty(image)) {
      dict[image] = { 'image': dictInDict[image] };
    }
  }
  return dict;
};

// This function updated dict with images and returns it.
export const getUploadedImagesDict = function (StateService, dict) {
  return StateService.getUploadedImages().then(function (data) {
    data.visualization.map(image => {
      dict[image.name] = image['file-name'];
    });
    return dict;
  });
};

// This function returns All images (Both static and dynamically uploaded images)
// require in vsualizations.
export const getImages = function (StateService, dictInDict) {
  const images =  (
    {
      'archival_cost': '/ui/vienna_images/archival_cost.svg',
      'archival_growth_rate': '/ui/vienna_images/archival_growth_rate.svg',
      'archival_volume': '/ui/vienna_images/archival_volume.svg',
      'cpu': '/ui/vienna_images/cpu.svg',
      'hard_disk': '/ui/vienna_images/hard_disk.svg',
      'operational_performance_index': '/ui/vienna_images/operational_performance_index.svg',
      'productivity_hours': '/ui/vienna_images/productivity_hours.svg',
      'ram_memory': '/ui/vienna_images/ram_memory.svg',
      'resource_cost': '/ui/vienna_images/resource_cost.svg',
      'total_man_hours': '/ui/vienna_images/total_man_hours.svg',
      'unproductivity_hours': '/ui/vienna_images/unproductivity_hours.svg',
      'verfiy_beneficiary': '/ui/vienna_images/verfiy_beneficiary.svg',
      'swift': '/ui/vienna_images/swift.svg',
      'otp': '/ui/vienna_images/otp.svg',
      'rate_and_charges': '/ui/vienna_images/rate_and_charges.svg',
      'fund_debit': '/ui/vienna_images/fund_debit.svg',
      'fts': '/ui/vienna_images/fts.svg',
      'Action Required': '/ui/vienna_images/action_required_insight.png',
      'Archival Cost': '/ui/vienna_images/archival_cost_insight.png',
      'Archival Volume': '/ui/vienna_images/archival_volume_insight.png',
      'Calender': '/ui/vienna_images/calender_insight.png',
      'Information': '/ui/vienna_images/information_insight.png',
      'Network': '/ui/vienna_images/network_insight.png',
      'Operational Perormance': '/ui/vienna_images/operational_perormance_insight.png',
      'Server': '/ui/vienna_images/server_insights.png',
      'Service': '/ui/vienna_images/service_insight.png',
      'Time': '/ui/vienna_images/time_insight.png',
      'DataBase': '/ui/vienna_images/database_utm.jpg',
      'NodeBalancer': '/ui/vienna_images/load_balancer.jpg',
      'PC': '/ui/vienna_images/pc.jpg',
      'Wifi': '/ui/vienna_images/wifi_utm.jpg',
      'Printer': '/ui/vienna_images/printer.jpg',
      'Mobile': '/ui/vienna_images/mobile.jpg',
      'Switch': '/ui/vienna_images/switch.jpg',
      'Firewall': '/ui/vienna_images/firewall.jpg',
      'Router': '/ui/vienna_images/router.jpg',
      'App': '/ui/vienna_images/application.jpg',
      'Device': '/ui/vienna_images/device.jpg',
      'Firmware': '/ui/vienna_images/firmware.jpg',
      'NetworkElement': '/ui/vienna_images/network_element_umt.jpg',
      'NetworkDevice': '/ui/vienna_images/network_device.jpg',
      'Server': '/ui/vienna_images/server.jpg',
      'Other': '/ui/vienna_images/other_utm.jpg'
    });

  return getUploadedImagesDict(StateService, images).then(function (images) {

    // For dictInDict (Ex: for UTM/ UVM).
    if (dictInDict) {
      images = dictInDictForImages(images);
    }
    return images;

  });
};
