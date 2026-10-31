'use strict';
const assert=require('node:assert/strict');

const VERSION='agent41-owner-physical-basic-attachment-menu-v1';

/**
 * Enumerate independent one-Energy attachment choices from a detached owner
 * view. Each entry names the exact physical hand index and a public occupied
 * recipient. A real Store still controls legality, attachment settlement,
 * and the once-per-turn Energy quota. This list is for an observer only.
 *
 * @param {object} view Detached owner actor observation.
 * @param {{basicEnergies:Set<string>}} catalog Public printing metadata.
 * @returns {Array<{kind:string,handIndex:number,printing:string,
 *   slot:string,index:number}>}
 */
function ownerBasicAttachmentMenu(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources;
  if(!Array.isArray(view.ownHand)||!Array.isArray(own?.bench)||
     !(catalog?.basicEnergies instanceof Set)||
     r?.energyPlayLocked===true||
     own.publicTurnRestrictions?.energyPlayLocked===true||
     r?.energyPlayedTurn===view.globalTurn)return [];
  const positions=[
    ...(own.active?[{slot:'active',index:0}]:[]),
    ...own.bench.flatMap((p,index)=>p?[{slot:'bench',index}]:[])
  ];
  const intents=[];
  for(let handIndex=0;handIndex<view.ownHand.length;handIndex++){
    const printing=view.ownHand[handIndex];
    if(!catalog.basicEnergies.has(printing))continue;
    for(const pos of positions)intents.push({
      kind:'attach-basic-energy',handIndex,printing,...pos
    });
  }
  return intents;
}
module.exports={VERSION,ownerBasicAttachmentMenu};
