'use strict';
const {choose}=require('./aichi-meloetta-prize-ticket.cjs');
/** @param {number} n @param {number} b @param {number} h @param {number} q */
function ticketStoneMeloetta(n,b,h,q){const C=choose,V=C(n,h)-C(n-b,h);const f=q/(n-h)/V,a=C(n-5,h-4)*f,d=C(n-5,h-3)*f/(n-h-1);return {allFourInSeven:a,meloettaTurnDraw:d,otherTurnDraw:3*d,firstEight:a+4*d,meloettaInitially:a+3*d};}
module.exports={ticketStoneMeloetta};
