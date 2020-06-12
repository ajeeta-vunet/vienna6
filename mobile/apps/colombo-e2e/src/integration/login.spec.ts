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
describe('Login Test', () => {
  beforeEach(() => {
    window.localStorage.setItem('vu.mobile', 'mobile');
    cy.visit('https://localhost/vunet/dashboard');
  });
  it('should display error if incorrect credentials provided', () => {
    cy.visit('https://localhost/vunet/dashboard');
    cy.get('#name').type('testadmin');
    cy.get('#password').type('wrongpassword');
    cy.get('.login-btn').click();
    cy.get('.alert').should('have.text', 'Invalid Username or Password');
    cy.url().should('contain', 'https://localhost/vunet/login');
  });
  it('should login if correct credentials provided', () => {
    cy.visit('https://localhost/vunet/dashboard');
    cy.get('#name').type('testadmin');
    cy.get('#password').type('admin');
    cy.get('.login-btn').click();
    cy.url().should('eq', 'https://localhost/vunet/dashboard');
  });
});
