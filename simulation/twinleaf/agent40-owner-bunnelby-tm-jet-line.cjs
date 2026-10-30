'use strict';

const assert=require('node:assert/strict');
const {publicSpecialAttackPayable}=
  require('./agent17-public-context-special-energy.cjs');

const VERSION='agent40-owner-bunnelby-tm-jet-line-v1';
const BUNNELBY='Bunnelby PRC';
const TM='Technical Machine: Evolution PAR';
const JET='Jet Energy ';

/**
 * Count only known registered physical copies that could still reside in
 * the unseen owner deck. Subtract owner-visible cards, never unobserved deck
 * or face-down Prize identities. Positive count means possible, not certain.
 *
 * @param {object} view Actual actor-only detached observation.
 * @param {object} catalog Public printed card evolution definitions.
 * @param {string[]} ownRegisteredSixty Legal player's own known printed 60.
 * @returns {boolean}
 */
function sourceCouldEvolveBench(view,catalog,ownRegisteredSixty){
  assert.equal(ownRegisteredSixty?.length,60,'Require one registered owner 60');
  assert.ok(ownRegisteredSixty.every(x=>typeof x==='string'));
  if(!(catalog.evolutions instanceof Map))return false;
  const bases=new Set((view.ownPublic?.bench??[])
    .map(x=>x?.name).filter(Boolean));
  const remaining=new Map();
  for(const printing of ownRegisteredSixty){
    const evolution=catalog.evolutions.get(printing);
    if(![catalog.stages.STAGE_1,catalog.stages.STAGE_2]
      .includes(evolution?.stage)||
        !bases.has(evolution.evolvesFrom))continue;
    remaining.set(printing,(remaining.get(printing)??0)+1);
  }
  const own=view.ownPublic;
  const publiclyUsed=[
    ...view.ownHand,...(own.discard??[]),...(own.lostZone??[]),
    ...(own.active?.evolutionPrintings??[]),
    ...(own.bench??[]).flatMap(p=>p?.evolutionPrintings??[])
  ];
  for(const printing of publiclyUsed)
    if(remaining.has(printing))
      remaining.set(printing,remaining.get(printing)-1);
  return [...remaining.values()].some(n=>n>0);
}

/**
 * Exact source-list-aware root actions for the known Bunnelby Omega Barrage /
 * TM Evolution / Jet Energy Aichi lock-building line.
 *
 * This does not look into actual deck or Prize contents, and cannot certify
 * that a needed Stage 1 is unprized. Native Store validates each root and
 * later prompted evolution choice. Only the acting player's registered 60
 * is admissible; a shared opponent-source list is never read.
 *
 * @param {object} view Detached owner-root observation.
 * @param {object} catalog Public immutable printed card catalogue.
 * @param {string[]} ownRegisteredSixty Actor's own known printed 60.
 * @returns {object|null}
 */
function chooseBunnelbyTmJetRoot(view,catalog,ownRegisteredSixty){
  assert.equal(view.decisionKind,'owner-root');
  if(!Array.isArray(ownRegisteredSixty)||ownRegisteredSixty.length!==60)
    return null;
  const own=view.ownPublic,quota=view.ownTurnResources;
  if(!own?.active||!Array.isArray(own.bench)||
      !sourceCouldEvolveBench(view,catalog,ownRegisteredSixty)||
      own.publicTurnRestrictions?.attackLockTurnsRemaining>0)
    return null;
  const sources=[{slot:'active',index:0,pokemon:own.active},
    ...own.bench.map((p,index)=>({slot:'bench',index,pokemon:p}))];
  const bun=sources.find(x=>x.pokemon?.printing===BUNNELBY);
  if(!bun)return null;
  const pokemon=bun.pokemon;
  if(pokemon.publicRestrictions?.cannotAttackNextTurn===true||
      pokemon.publicRestrictions?.blockedAttackNameNextTurn==='Evolution'||
      pokemon.publicRestrictions?.blockedAttackNameUntilLeavesActive==='Evolution'||
      pokemon.publicRestrictions?.cannotUseAttacksNextTurn?.includes('Evolution'))
    return null;
  const ready=publicSpecialAttackPayable(view,catalog,pokemon,{
    name:'Evolution',cost:[catalog.colorlessEnergyType]
  });
  const tmAttached=pokemon.tools?.includes(TM);
  const tmIndex=view.ownHand.indexOf(TM);
  const energyOpen=quota?.energyPlayedTurn!==view.globalTurn&&
    quota?.energyPlayLocked!==true&&quota?.specialEnergyPlayLocked!==true&&
    own.publicTurnRestrictions?.energyPlayLocked!==true&&
    own.publicTurnRestrictions?.specialEnergyPlayLocked!==true;
  const jetIndex=view.ownHand.findIndex(p=>p.startsWith(JET)&&
    catalog.specialEnergies?.has(p));
  // A real Tool attack is available only on the current Active. Its
  // actual announcement and Omega Barrage followup belong to the Store.
  if(bun.slot==='active'&&tmAttached&&ready&&view.globalTurn>1&&
      !pokemon.specialConditions?.some(x=>
        x===catalog.specialConditions?.ASLEEP||
        x===catalog.specialConditions?.PARALYZED))
    return {kind:'attack',attackName:'Evolution',
      reason:'bunnelby-active-registered-stage-tm'};
  // Equip before consuming the single Energy attachment. A Stage target
  // might still be Prized; native prompt search is the first K1 access.
  if(!tmAttached&&tmIndex>=0&&
      (bun.slot==='active'||jetIndex>=0)&&
      pokemon.tools?.length===0&&
      quota?.toolPlayLocked!==true&&
      own.publicTurnRestrictions?.toolPlayLocked!==true)
    return {kind:'equip-bunnelby-tm',handIndex:tmIndex,printing:TM,
      slot:bun.slot,index:bun.index};
  if(!tmAttached||!energyOpen||jetIndex<0||ready)return null;
  if(bun.slot==='active')
    return {kind:'attach-special-energy',
      printing:view.ownHand[jetIndex],handIndex:jetIndex,
      slot:'active',index:0,
      reason:'fund-bunnelby-tm-evolution'};
  // Forced Jet switch removes the old Active's Active-only passive Abilities
  // and ends an otherwise payable tactical attack. Conservatively keep both.
  if(own.active.abilityDetails?.some(x=>typeof x.text==='string'&&
    /(?:as long as|while)\s+this\s+pok[eé]mon\s+is\s+(?:your\s+active\s+pok[eé]mon|in\s+the\s+active\s+spot)/i.test(x.text)))
    return null;
  if(own.active.attacks?.some(a=>
    Array.isArray(a.cost)&&
    publicSpecialAttackPayable(view,catalog,own.active,a)))return null;
  if([...(own.stadium??[]),...(view.opponentPublic?.stadium??[])]
    .some(x=>x.startsWith('Temple of Sinnoh ')))return null;
  return {kind:'attach-special-energy',
    printing:view.ownHand[jetIndex],handIndex:jetIndex,
    slot:'bench',index:bun.index,
    reason:'jet-promote-bunnelby-registered-stage-tm'};
}

module.exports={VERSION,BUNNELBY,TM,
  sourceCouldEvolveBench,chooseBunnelbyTmJetRoot};
