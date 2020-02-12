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
 
 * Copyright 2020 VuNet Systems Ltd.
 * All rights reserved.
 * Use of copyright notice does not imply publication.
*/

import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody } from 'reactstrap';
import { DashboardsUrl } from '@vu/colombo-lib';

/**
 * Will render the default page
 * when any route is not matched
 *
 * @export
 * @returns
 */
export const Notfound = () => (
  <div className="container-fluid my-5">
    <Card className="my-5">
      <CardBody className="col text-center">
        <div className="h4">The page you are looking isn't available.</div>
        <Link to={DashboardsUrl()}>
          <Button>Navigate to home</Button>
        </Link>
      </CardBody>
    </Card>
  </div>
);

export default Notfound;
