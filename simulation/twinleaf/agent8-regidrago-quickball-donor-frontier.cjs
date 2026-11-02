'use strict';
const assert=require('node:assert/strict');

const VERSION='agent8-rank13-quickball-evolved-dragon-donor-v1';
const QUICK_BALLS=new Set(['Quick Ball FST','Quick Ball SSH']);
const REGIDRAGO_V='Regidrago V SIT';
// This is a source-13 hypothesis, not a general Dragon discard valuation.
const EVOLVED_DONORS=new Set([
  'Salamence ex JTG','Dragapult ex TWM','Noivern ex PAL'
]);

/**
 * Actor-only, default-off opening opportunity. Before a Regidrago V has
 * appeared, the source rank-13 hand may pay Quick Ball with a one-of
 * copyable evolved Dragon. Its disappearance from hand could eventually
 * help Apex Dragon, but the search target may be Prized or unavailable.
 * This function reads neither native deck contents nor Prize identities.
 *
 * @param {object} view Detached actor-owned owner-root observation
 * @returns {{kind:'play-quick-ball',handIndex:number,printing:string,
 *   donorPrinting:string,desiredTarget:string,source:'rank13-dragon-donor'}|null}
 */
function chooseRegidragoDonorQuickBall(view){
  assert.equal(view?.decisionKind,'owner-root');
  const hand=view.ownHand,own=view.ownPublic,r=view.ownTurnResources;
  if(!Array.isArray(hand)||!Array.isArray(own?.bench)||
     own.bench.every(slot=>slot!==null)||!(own.deckCount>0)||
     r?.itemPlayLocked===true||r?.pokemonPlayLocked===true)return null;
  const regidragoEstablished=[own.active,...own.bench].some(slot=>
    slot?.printing===REGIDRAGO_V||
    slot?.printing==='Regidrago VSTAR SIT');
  if(regidragoEstablished||hand.includes(REGIDRAGO_V))return null;
  const index=hand.findIndex(name=>QUICK_BALLS.has(name));
  if(index<0)return null;
  // Leave the existing duplicate-first low-cost policy alone.
  const counts=new Map();
  for(let j=0;j<hand.length;j++){
    if(j===index||QUICK_BALLS.has(hand[j]))continue;
    counts.set(hand[j],(counts.get(hand[j])??0)+1);
  }
  if([...counts.values()].some(n=>n>=2))return null;
  const donor=hand.find(name=>EVOLVED_DONORS.has(name));
  if(!donor)return null;
  return {kind:'play-quick-ball',handIndex:index,printing:hand[index],
    donorPrinting:donor,desiredTarget:REGIDRAGO_V,
    source:'rank13-dragon-donor'};
}

module.exports={VERSION,QUICK_BALLS,REGIDRAGO_V,EVOLVED_DONORS,
  chooseRegidragoDonorQuickBall};
