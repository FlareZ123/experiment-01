'use strict';
const {choose,verifyRank26}=require('./aichi-meloetta-prize-ticket.cjs');
/** @param {number} n @param {number} b @param {number} h @param {number} q */
function ticketStoneCrobat(n,b,h,q){
 if(![n,b,h,q].every(Number.isInteger)||n>60||n<6||b<1||b>n-3||h<2||h+q>=n-1||q<1)throw new RangeError('Invalid opening parameters');
 const C=choose,V=C(n,h)-C(n-b,h),common=q/(n-h)/V;
 const allThreeOpening=C(n-4,h-3)*common;
 const turnDrawTicket=C(n-4,h-2)*common/(n-h-1);
 const turnDrawStone=turnDrawTicket;
 const turnDrawCrobat=(C(n-4,h-2)-C(n-b-3,h-2))*common/(n-h-1);
 return {allThreeOpening,turnDrawTicket,turnDrawStone,turnDrawCrobat,directRoute:allThreeOpening+turnDrawTicket+turnDrawStone+turnDrawCrobat};
}
module.exports={ticketStoneCrobat,verifyRank26};
