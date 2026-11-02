'use strict';

const {probe}=require('./agent12-bellelba-optional-payment-native.cjs');
const {withPaperBellelbaOptionalPayment}=
  require('./agent12-bellelba-paper-optional-payment-guard.cjs');

/**
 * Test the exact default-off reversible guard in the real pinned native Store.
 * @param {0|1} seat
 * @param {0|1|2|3} count
 * @param {2|3} available
 */
function guardedProbe(seat,count,available=3){
  const {result,audit}=withPaperBellelbaOptionalPayment(
    ()=>probe(seat,count,available));
  return {seat,count,available,audit,result};
}
if(require.main===module){
  for(const seat of [0,1])
    for(const count of [0,1,2,3])
      console.log('AGENT12_BELLELBA_GUARDED_NATIVE '+
        JSON.stringify(guardedProbe(seat,count)));
  for(const seat of [0,1])
    console.log('AGENT12_BELLELBA_GUARDED_NATIVE '+
      JSON.stringify(guardedProbe(seat,2,2)));
}
module.exports={guardedProbe};
