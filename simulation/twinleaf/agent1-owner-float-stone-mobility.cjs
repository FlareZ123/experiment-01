'use strict';

const assert=require('node:assert/strict');

const VERSION='agent1-owner-public-zero-energy-floatstone-mobility-v1';
const FLOAT_STONE='Float Stone BKT';

/**
 * Conservative two-root mobility opportunity from one player's detached
 * hand/public board. This may equip a held Float Stone to a stranded Active
 * Pokemon, then legally retreat into a Benched Pokemon with attached Energy.
 * The native Store, rather than this predicate, decides actual card legality.
 *
 * No opponent hand/deck/Prizes, own unknown deck/Prizes, opponent archetype,
 * matchup identifier or seed are inspected. The rule applies to any Pokemon
 * name and any seat when explicitly opted in.
 *
 * @param {object} view Authenticated actorObservation owner-root snapshot.
 * @param {object} catalog Public Special Conditions enum catalog.
 * @returns {{kind:'attach-emergency-floatstone'|'retreat-emergency-floatstone',
 *   handIndex?:number,benchIndex:number,printing:string}|null}
 */
function chooseOwnerFloatStoneMobility(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic;
  const active=own?.active;
  const r=view.ownTurnResources;
  if(!active||!Array.isArray(own.bench)||!r||view.globalTurn===1)return null;
  if(!Number.isSafeInteger(r.retreatedTurn)||
     r.retreatedTurn===view.globalTurn)return null;
  if(active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.publicRestrictions?.cannotRetreatWhileActive===true||
     active.specialConditions?.some(type=>
       type===catalog.specialConditions.ASLEEP||
       type===catalog.specialConditions.PARALYZED))return null;
  if(own.publicTurnRestrictions?.attackLockTurnsRemaining>0)return null;
  if(!Array.isArray(active.energies)||active.energies.length!==0)return null;
  if(!Array.isArray(active.printed?.retreatCost))return null;

  // Preserve an already payable zero-Energy attacking Active position.
  if(active.attacks?.some(attack=>
    Array.isArray(attack.cost)&&attack.cost.length===0&&
    Number.isSafeInteger(attack.damage)&&attack.damage>0))return null;

  const bench=own.bench.map((p,i)=>({p,i})).filter(({p})=>
    p&&Array.isArray(p.energies)&&p.energies.length>0&&
    p.publicRestrictions?.cannotAttackNextTurn!==true);
  if(bench.length===0)return null;
  bench.sort((a,b)=>b.p.energies.length-a.p.energies.length||a.i-b.i);
  const {p,i:benchIndex}=bench[0];

  // Printed zero Retreat Cost does not require consuming an Item or Tool.
  const naturalFree=active.printed.retreatCost.length===0;
  const floatAttached=active.tools?.includes(FLOAT_STONE)===true;
  if(naturalFree||floatAttached){
    if(floatAttached&&[...(own.stadium??[]),
      ...(view.opponentPublic?.stadium??[])].some(s=>
      s.startsWith('Jamming Tower ')))return null;
    return {kind:'retreat-emergency-floatstone',benchIndex,
      printing:p.printing};
  }
  if(r.toolPlayLocked===true||
     own.publicTurnRestrictions?.toolPlayLocked===true||
     !Array.isArray(active.tools)||active.tools.length>0)return null;
  const handIndex=view.ownHand.indexOf(FLOAT_STONE);
  if(handIndex<0)return null;
  return {kind:'attach-emergency-floatstone',handIndex,benchIndex,
    printing:p.printing};
}

module.exports={VERSION,FLOAT_STONE,chooseOwnerFloatStoneMobility};
