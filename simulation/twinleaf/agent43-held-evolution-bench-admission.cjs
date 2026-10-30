'use strict';
const assert=require('node:assert/strict');
const VERSION='agent43-held-evolution-lastbench-v1';

/**
 * Pick an owner-held Basic whose directly evolving card is also in hand when
 * the original first-in-hand Basic would fill the last Bench slot.
 * @param {object} view Detached real owner observation.
 * @param {object} catalog Public card metadata.
 * @param {object} first Original actor-root intent.
 * @returns {{intent:object,receipt:object}|null}
 */
function chooseHeldEvolutionBench(view,catalog,first){
  assert.equal(view.decisionKind,'owner-root');
  if(first?.kind!=='bench-basic'||!Array.isArray(view.ownPublic?.bench)||
     !Array.isArray(view.ownHand)||!(catalog.evolutions instanceof Map)||
     !(catalog.basicNames instanceof Map))return null;
  const free=view.ownPublic.bench.flatMap((x,i)=>x===null?[i]:[]);
  const r=view.ownTurnResources;
  if(free.length!==1||first.benchIndex!==free[0]||
     r?.pokemonPlayLocked===true)return null;
  const eligible=view.ownHand.flatMap((printing,handIndex)=>
    catalog.basics.has(printing)&&
    !(r?.abilityPokemonPlayLocked===true&&catalog.abilityBasics.has(printing))?
      [{printing,handIndex}]:[]);
  if(eligible.length<2||!eligible.some(x=>x.handIndex===first.handIndex))return null;
  const held=printing=>view.ownHand.filter(evolution=>{
    const from=catalog.evolutions.get(evolution)?.evolvesFrom;
    return typeof from==='string'&&catalog.basicNames.get(printing)===from;
  });
  if(held(first.printing).length>0)return null;
  const next=eligible.find(x=>held(x.printing).length>0);
  if(!next)return null;
  return {intent:{kind:'bench-basic',handIndex:next.handIndex,
    benchIndex:free[0],printing:next.printing},
    receipt:{version:VERSION,reason:'direct-held-evolution-base',
      previous:first.printing,preferred:next.printing,
      evolutionPrintings:held(next.printing),
      ownerSlot:free[0],nativeAccepted:'unverified',
      impact:'unknown',competitiveQualified:false}};
}
module.exports={VERSION,chooseHeldEvolutionBench};
