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


import Axios from 'axios';

/**
 * The Singleton class defines the `getInstance` method that lets clients access
 * the Http singleton instance.
 */
class HttpClient {
  private static instance: HttpClient;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {}

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
      Axios.defaults.withCredentials = true;
    }

    return HttpClient.instance;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async get<Response = any>(url: string, options?) {
    const response = await Axios.get<Response>(url, options);
    return { data: response.data, headers: response.headers, status: response.status };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async post<Request = any, Response = any>(url: string, body: Request, options?) {
    const response = await Axios.post<Response>(url, body, options);
    return { data: response.data, headers: response.headers, status: response.status };
  }
}

export const vuHttp = HttpClient.getInstance();
