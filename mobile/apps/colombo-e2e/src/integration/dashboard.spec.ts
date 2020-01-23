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

describe('Dashboard Test', () => {
  beforeEach(() => {
    window.localStorage.setItem('vu.mobile', 'mobile');
    cy.visit('https://localhost/mobile/dashboard');
    cy.get('#name').type('testadmin');
    cy.get('#password').type('admin');
    cy.get('.login-btn').click();
    cy.server();
    cy.route({
      method: 'GET',
      url: '/api/default/users/testadmin/',
      response: 'fixture:dashboard-list',
    });
    cy.route({
      method: 'GET',
      url: '/vuSmartMaps/api/1/bu/1/dashboard/dashboard:HomePage/',
      response: 'fixture:dashboard1',
    });
  });
  it('should load first dashboard', () => {
    cy.url().should('eq', 'https://localhost/mobile/dashboard');
    cy.get(':nth-child(1) > .btn').click();
  });
  it('should change time range dashboard', () => {
    cy.url().should('eq', 'https://localhost/mobile/dashboard');
    cy.get('[src="/mobile/assets/Expand.svg"]').click();
    cy.get(':nth-child(2) > :nth-child(2) > ul > :nth-child(1)').click();
    cy.get(':nth-child(1) > .btn').click();
    cy.url().should('eq', 'https://localhost/mobile/dashboard/dashboard:HomePage');
  });
  it('should load', () => {
    cy.get(':nth-child(1) > .btn').click();
    cy.url().should('eq', 'https://localhost/mobile/dashboard/dashboard:HomePage');
  });
});
