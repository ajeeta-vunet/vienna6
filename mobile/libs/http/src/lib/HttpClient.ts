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

import Axios, { AxiosResponse, AxiosError } from 'axios';
import { Observable, Observer } from 'rxjs';
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
      Axios.interceptors.response.use(
        (response) => {
          return response;
        },
        function(error: { response: AxiosResponse }) {
          try {
            // Assuming server is returning status code according to https://tools.ietf.org/html/rfc2616#section-10.4.2
            // Forbidden
            if (error.response.status === 403) {
            } else if (error.response.status === 401) {
              if (
                window.location.pathname.toLocaleLowerCase() !== '/vunet/' &&
                !window.location.pathname.toLocaleLowerCase().startsWith('/vunet/login')
              ) {
                // It better idea to clear everything before logging Out
                localStorage.clear();
                window.location.href = '/vunet/login';
              }
            }
          } finally {
            // using finally because want the request to complete, otherwise it'll remain
            // in memory and can cause memory leak
            return Promise.reject(error.response);
          }
        },
      );
    }

    return HttpClient.instance;
  }
  /**
   * This will return an Observable for a get Request.
   * @param url URL for request
   * @param options Options
   */
  public get$<Response = any>(url: string, options?): Observable<Response> {
    return Observable.create((observer: Observer<Response>) => {
      Axios.get(url, options)
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error: AxiosResponse) => {
          observer.error({ ...error, message: error.status === 500 ? 'Internal Server Error' : null });
        });
    });
  }
  /**
   * This will return an Observable for a POST Request.
   * @param url URL for request
   * @param options Options
   */
  public post$<Request = any, Response = any>(url: string, body: Request, options?): Observable<Response> {
    return Observable.create((observer: Observer<Response>) => {
      Axios.post<Response>(url, body, options)
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error: AxiosResponse) => {
          observer.error({ ...error, message: error.status === 500 ? 'Internal Server Error' : null });
        });
    });
  }
}

/**
 * Will Extract Error message from error Object
* @param error error Object
 */
export const getErrorMessage = (error): string =>
  error.data['error-string'] || (error as any).message || JSON.stringify(error);
export const vuHttp = HttpClient.getInstance();
