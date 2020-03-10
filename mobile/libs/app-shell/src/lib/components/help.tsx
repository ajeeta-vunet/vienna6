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
import { Card, CardBody, CardHeader } from 'reactstrap';
import { Link } from 'react-router-dom';
import { DashboardsUrl } from '@vu/vis';


/**
 * Will render the help page,
 * This page will help users if they need some help
 */
export const HelpPage = () => (
  <div className="container-fluid my-5">
    <Card className="my-5 shadow">
      <CardHeader>Help Section</CardHeader>
      <CardBody className="col text-center">
        <h3>Content isn't uploaded yet.</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </p>
        <Link to={DashboardsUrl()} className="btn btn-link">
          Go to home
        </Link>
      </CardBody>
    </Card>
  </div>
);

export default HelpPage;
