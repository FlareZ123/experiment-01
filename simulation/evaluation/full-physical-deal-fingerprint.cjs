'use strict';

const {createHash}=require('node:crypto');
const {createInitialSourceDealObserver}=
  require('./source-physical-deal-fingerprint.cjs');

/**
 * Fingerprint both physical players' complete card zones at the first stable
 * pre-action turn-1 Store root. Any setup mulligan or compensation is already
 * reflected. The digest is opaque and may never enter a player's live policy.
 *
 * @returns {{observe:(state:object)=>void,result:()=>object|null}}
 */
function createFullPhysicalDealObserver() {
  const perSeat=[createInitialSourceDealObserver(0),
    createInitialSourceDealObserver(1)];
  let captured=null;
  return Object.freeze({
    /** @param {object} state The actual pinned-engine Store state. */
    observe(state) {
      if(captured)return;
      perSeat.forEach(observer=>observer.observe(state));
      const snapshots=perSeat.map(observer=>observer.result());
      if(snapshots.some(row=>row===null))return;
      captured=Object.freeze({
        schema:'initial-full-physical-deal-sha256-v1',
        digestSha256:createHash('sha256').update(JSON.stringify(
          snapshots.map(row=>[row.seat,row.digestSha256])
        )).digest('hex')
      });
    },
    /** @returns {{schema:string,digestSha256:string}|null} */
    result() {return captured;}
  });
}
module.exports={createFullPhysicalDealObserver};
