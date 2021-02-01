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
import CryptoJS from 'crypto-js';

const BLOCK_SIZE = 16

function generate_key(userName: String){
    const unpaddedKey = ('dnVTbWydhc' + userName).slice(0, BLOCK_SIZE)
    const key = unpaddedKey.padEnd(BLOCK_SIZE, (BLOCK_SIZE - unpaddedKey.length).toString())
    return 	CryptoJS.enc.Utf8.parse(key);
}

export function aesencrypt(userName: String, msgString: any) {
       // msgString is expected to be Utf8 encoded
       var iv = CryptoJS.lib.WordArray.random(16);
       var key = generate_key(userName)
       var encrypted = CryptoJS.AES.encrypt(msgString, key, {
           iv: iv
       });
       return (iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64));
}
