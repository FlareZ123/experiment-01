'use strict';
const assert=require('node:assert/strict');
const VERSION='agent7-source-psychic-bench-rondo-staging-v2-preserve-active-clefairy';

/**
 * A deliberately narrow experimental alternative to attaching a held Basic
 * Psychic Energy to the current Active. This is owner's hand and face-up
 * Bench only. Source attack, mobility, prizes and opposing reply still need
 * actual Store settlement before strategic value can be assessed.
 *
 * @param {object} view Detached actor-only owner-root observation.
 * @param {{basicEnergies:Set<string>}} catalog Public printing catalog.
 * @returns {{kind:string,handIndex:number,printing:string,
 *   slot:string,index:number,attackName:string,reason:string}|null}
 */
function proposeRondoPsychicBenchStaging(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources;
  // An already Active JTG Clefairy may have the strongest immediate
  // Rondo route. Diverting scarce once-per-turn Psychic to a second Benched
  // Clefairy destroyed native source attacks in a held-out 8-seed panel.
  // This guard is deliberately exact-print and owner-public only.
  if(own?.active?.printing==="Lillie's Clefairy ex JTG")return null;
  if(!Array.isArray(view.ownHand)||!Array.isArray(own?.bench)||
     own.publicTurnRestrictions?.energyPlayLocked===true||
     r?.energyPlayLocked===true||r?.energyPlayedTurn===view.globalTurn||
     !(catalog?.basicEnergies instanceof Set))return null;
  const handIndex=view.ownHand.findIndex(printing=>
    printing.startsWith('Psychic Energy ')&&
    catalog.basicEnergies.has(printing));
  if(handIndex<0)return null;
  const recipients=own.bench.flatMap((pokemon,index)=>{
    if(pokemon?.printing!=="Lillie's Clefairy ex JTG"||
       !pokemon.attacks?.some(a=>a.name==='Full Moon Rondo')||
       !Array.isArray(pokemon.energies)||
       pokemon.energies.length>=2)return [];
    return [{index,count:pokemon.energies.length}];
  });
  recipients.sort((a,b)=>b.count-a.count||a.index-b.index);
  if(!recipients.length)return null;
  return {kind:'attach-basic-energy',handIndex,
    printing:view.ownHand[handIndex],
    slot:'bench',index:recipients[0].index,
    attackName:'Full Moon Rondo',
    reason:'experimental-owner-visible-psychic-to-rondo-benched'};
}
module.exports={VERSION,proposeRondoPsychicBenchStaging};
