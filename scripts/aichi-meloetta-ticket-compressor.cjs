'use strict';
const {choose,verifyRank26}=require('./aichi-meloetta-prize-ticket.cjs');
/**
 * Exact conditional opening access to both singleton Prize-redeal Ticket and
 * a Battle Compressor, while required singleton DCE begins Prized.
 * @param {number} n Cards in deck
 * @param {number} b Starting-eligible Basics
 * @param {number} h Initial cards
 * @param {number} q Initial Prizes
 * @param {number} c Battle Compressor copies
 */
function ticketCompressor(n,b,h,q,c){
 if(![n,b,h,q,c].every(Number.isInteger)||n<4||b<1||c<1||
   b+c+2>n||h<1||q<1||h+q>=n)throw new RangeError('Invalid setup');
 const C=choose,V=C(n,h)-C(n-b,h);
 const both=C(n-2,h-1)-C(n-2-c,h-1)-C(n-2-b,h-1)+C(n-2-c-b,h-1);
 const ticketOnly=C(n-2-c,h-1)-C(n-2-c-b,h-1);
 const compressorOnly=C(n-2,h)-C(n-2-c,h)-C(n-2-b,h)+C(n-2-c-b,h);
 const factor=q/(n-h)/V;
 const bothOpening=both*factor;
 const compressorDraw=ticketOnly*factor*c/(n-h-1);
 const ticketDraw=compressorOnly*factor/(n-h-1);
 return {bothOpening,compressorDraw,ticketDraw,directRoute:bothOpening+compressorDraw+ticketDraw};
}
/** @param {object} manifest Published source manifest */
function verifyCompressor(manifest){
 const d=verifyRank26(manifest);
 const count=d.cards.filter(x=>x.name==='Battle Compressor')
   .reduce((sum,x)=>sum+x.count,0);
 if(count!==4)throw new Error('Rank 26 source changed: Battle Compressor');
 return count;
}
module.exports={ticketCompressor,verifyCompressor};
