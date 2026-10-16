'use strict';
const {choose,verifyRank26}=require('./aichi-meloetta-prize-ticket.cjs');
/** @param {number} n @param {number} b @param {number} h @param {number} q */
function ticketStoneCrobat(n,b,h,q){const C=choose,V=C(n,h)-C(n-b,h);const common=q/(n-h)/V; const allThreeOpening=C(n-4,h-3)*common;return {allThreeOpening};}
module.exports={ticketStoneCrobat,verifyRank26};
