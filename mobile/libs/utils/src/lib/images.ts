/**
 * ------------------------- NOTICE -------------------------------
 *
 *                  CONFIDENTIAL INFORMATION
 *                  ------------------------
 *    This Document contains Confidential Information or
 *    Trade Secrets, or both, which are the property of VuNet
 *    Systems Ltd.  This document may not be copied, reproduced,
 *    reduced to any electronic medium or machine readable form
 *    or otherwise duplicated and the information herein may not
 *    be used, disseminated or otherwise disclosed, except with
 *    the prior written consent of VuNet Systems Ltd.
 *
 *------------------------- NOTICE -------------------------------
 *
 * Copyright 2020 VuNet Systems Ltd.
 * All rights reserved.
 * Use of copyright notice does not imply publication.
 */
import { vuHttp } from '@vu/http';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

export const ImageManagerImages = {
  archival_cost: '/ui/vienna_images/archival_cost.svg',
  archival_growth_rate: '/ui/vienna_images/archival_growth_rate.svg',
  archival_volume: '/ui/vienna_images/archival_volume.svg',
  cpu: '/ui/vienna_images/cpu.svg',
  hard_disk: '/ui/vienna_images/hard_disk.svg',
  operational_performance_index: '/ui/vienna_images/operational_performance_index.svg',
  productivity_hours: '/ui/vienna_images/productivity_hours.svg',
  ram_memory: '/ui/vienna_images/ram_memory.svg',
  resource_cost: '/ui/vienna_images/resource_cost.svg',
  total_man_hours: '/ui/vienna_images/total_man_hours.svg',
  unproductivity_hours: '/ui/vienna_images/unproductivity_hours.svg',
  verfiy_beneficiary: '/ui/vienna_images/verfiy_beneficiary.svg',
  swift: '/ui/vienna_images/swift.svg',
  otp: '/ui/vienna_images/otp.svg',
  rate_and_charges: '/ui/vienna_images/rate_and_charges.svg',
  fund_debit: '/ui/vienna_images/fund_debit.svg',
  fts: '/ui/vienna_images/fts.svg',
  'Action Required': '/ui/vienna_images/action_required_insight.png',
  'Archival Cost': '/ui/vienna_images/archival_cost_insight.png',
  'Archival Volume': '/ui/vienna_images/archival_volume_insight.png',
  Calender: '/ui/vienna_images/calender_insight.png',
  Information: '/ui/vienna_images/information_insight.png',
  Network: '/ui/vienna_images/network_insight.png',
  'Operational Perormance': '/ui/vienna_images/operational_perormance_insight.png',
  Server: '/ui/vienna_images/server_insights.png',
  Service: '/ui/vienna_images/service_insight.png',
  Time: '/ui/vienna_images/time_insight.png',
  DataBase: '/ui/vienna_images/database_utm.jpg',
  NodeBalancer: '/ui/vienna_images/load_balancer.jpg',
  PC: '/ui/vienna_images/pc.jpg',
  Wifi: '/ui/vienna_images/wifi_utm.jpg',
  Printer: '/ui/vienna_images/printer.jpg',
  Mobile: '/ui/vienna_images/mobile.jpg',
  Switch: '/ui/vienna_images/switch.jpg',
  Firewall: '/ui/vienna_images/firewall.jpg',
  Router: '/ui/vienna_images/router.jpg',
  App: '/ui/vienna_images/application.jpg',
  Device: '/ui/vienna_images/device.jpg',
  Firmware: '/ui/vienna_images/firmware.jpg',
  NetworkElement: '/ui/vienna_images/network_element_umt.jpg',
  NetworkDevice: '/ui/vienna_images/network_device.jpg',
  Other: '/ui/vienna_images/other_utm.jpg',
};

export const DEFAULT_IMAGEMANAGER_IMAGE = '/assets/images/Icon_03.svg';
export interface fgwImagesResponse {
  visualization: {
    name: string;
    'file-name': string;
  }[];
  logo: {
    name: string;
    'file-name': string;
  }[];
}

export class ImageManager {
  private static images = new BehaviorSubject<{ [key: string]: string }>(ImageManagerImages);
  /**
   * Will Load Images and update the
   * @member images BehaviourSubject
   */
  static LoadImages() {
    vuHttp
      .get$<fgwImagesResponse>('/vuSmartMaps/api/1/bu/1/fgw/?file_type=images')
      .pipe(
        map((a) => {
          const ret: { [key: string]: string } = ImageManagerImages;
          a.visualization.forEach((i) => {
            Object.assign(ret, { [i.name]: i['file-name'] });
          });
          return ret;
        }),
      )
      .subscribe((new_images) => this.images.next(new_images));
  }
  /**
   * Will return dictionary of all images
   */
  static getDynImages() {
    return ImageManager.images;
  }

  /**
   *
   * @param name Key for Image
   * This function will return the image path for the name provided
   */
  public static getImage = (name: string): Observable<string> => {
    return ImageManager.getDynImages().pipe(map((a) => a[name] || DEFAULT_IMAGEMANAGER_IMAGE));
  };
}
