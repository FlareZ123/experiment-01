'use strict';
const assert=require('node:assert/strict');
const VERSION='agent26-mew-dce-recipient-v1';
const ENERGY='Double Colorless Energy SUM';
/** @param {object} view Acting player observation.
 * @param {object} catalog Printed catalog.
 * @returns {object|null} Owner-only proposed native attachment.
 */
function chooseMewDceRecipient(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const handIndex=view.ownHand.indexOf(ENERGY);
  const own=view.ownPublic,r=view.ownTurnResources;
  if(handIndex<0||!catalog.specialEnergies.has(ENERGY)||
    r.energyPlayLocked!==false||r.specialEnergyPlayLocked===true||
    r.energyPlayedTurn===view.globalTurn)return null;
  if([...(own.stadium??[]),...(view.opponentPublic?.stadium??[])]
    .some(x=>x.startsWith('Temple of Sinnoh ')))return null;
  const targets=[{slot:'active',index:0,pokemon:own.active},
    ...(own.bench??[]).map((pokemon,index)=>({slot:'bench',index,pokemon}))];
  const options=targets.filter(t=>t.pokemon&&
    (t.pokemon.printing==='Mew V FST'||
     t.pokemon.printing==='Mew VMAX FST')&&
    Array.isArray(t.pokemon.energies)&&
    t.pokemon.energies.length===0);
  options.sort((a,b)=>
    Number(b.pokemon.printing==='Mew VMAX FST')-
    Number(a.pokemon.printing==='Mew VMAX FST')||
    (a.slot==='active'?0:1)-(b.slot==='active'?0:1)||a.index-b.index);
  const t=options[0];
  return t?{kind:'attach-special-energy',handIndex,printing:ENERGY,
    slot:t.slot,index:t.index}:null;
}
module.exports={VERSION,chooseMewDceRecipient};
