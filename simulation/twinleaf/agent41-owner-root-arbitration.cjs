'use strict';

const assert=require('node:assert/strict');

const VERSION='agent41-owner-turnend-arbitration-v1-bench-special-only';
const MAX_SAMPLES=40;

/**
 * Arbitrate the observed first-choice attack against a bounded owner-visible
 * nonterminal alternative. This is a deliberately small partial action chooser:
 * it does not assert native legality, optimal play, or full information safety
 * for the fallback decision engine. Only the real Store settles any selection.
 *
 * @param {object} view Detached acting-player hand, resources, public board.
 * @param {object} catalog Public printing metadata.
 * @param {object} first Existing actor-only first-return intent.
 * @param {object} options Frozen enabled policy switches.
 * @param {Function} [collect] Pure-test seam for the bounded opportunity census.
 * @returns {{intent:object,receipt:object}}
 */
function arbitrateOwnerRootIntent(view,catalog,first,options={},collect){
  assert.equal(view.decisionKind,'owner-root');
  assert.ok(first&&typeof first.kind==='string');
  const receipt={version:VERSION,baselineKind:first.kind,
    selectedKind:first.kind,reason:'preserve-first-choice',
    candidateCount:0,selectedPrinting:null,selectedTarget:null,
    nativePlayability:'unverified'};
  if(first.kind!=='attack'||options.publicContextSpecialEnergy!==true){
    receipt.reason='outside-bounded-attack-special-contention';
    return {intent:first,receipt};
  }
  const collector=collect??require('./agent16-owner-priority-contention.cjs')
    .collectOwnerContention;
  const offers=collector(view,catalog,options,first).alternatives??[];
  const matching=offers.filter(x=>x.probe==='public-special-energy'&&
    x.kind==='attach-special-energy'&&x.slot==='bench');
  receipt.candidateCount=matching.length;
  if(matching.length===0){
    receipt.reason='no-supported-bench-special-offer';
    return {intent:first,receipt};
  }
  const r=view.ownTurnResources;
  if(r?.energyPlayLocked===true||r?.specialEnergyPlayLocked===true||
      r?.energyPlayedTurn===view.globalTurn){
    receipt.reason='energy-quota-or-lock';
    return {intent:first,receipt};
  }
  // A lone remaining Prize is a conservative tactical hold: the choice to
  // forgo a potential finishing attack requires a stronger damage/Prize model.
  if(view.ownPublic?.prizeCount===1){
    receipt.reason='potential-last-prize-attack';
    return {intent:first,receipt};
  }
  const good=matching.find(x=>
    Number.isInteger(x.handIndex)&&x.handIndex>=0&&
    view.ownHand?.[x.handIndex]===x.printing&&
    Number.isInteger(x.index)&&x.index>=0&&
    view.ownPublic?.bench?.[x.index]&&
    Array.isArray(view.ownPublic.bench[x.index].attacks)&&
    view.ownPublic.bench[x.index].attacks.length>0);
  if(!good){
    receipt.reason='unmatched-physical-owner-target';
    return {intent:first,receipt};
  }
  const intent={kind:'attach-special-energy',
    printing:good.printing,handIndex:good.handIndex,
    slot:'bench',index:good.index};
  receipt.selectedKind=intent.kind;
  receipt.selectedPrinting=intent.printing;
  receipt.selectedTarget={slot:intent.slot,index:intent.index};
  receipt.reason='fund-public-bench-attack-before-turn-ending-root';
  return {intent,receipt};
}

/** @returns {object} Bounded, postgame redacted chooser diagnostics. */
function newOwnerArbitrationAudit(){
  return {version:VERSION,ownerRoots:0,changedRoots:0,
    bySeat:{0:{ownerRoots:0,changedRoots:0},
      1:{ownerRoots:0,changedRoots:0}},reasons:{},samples:[],
    nativeLegality:'requires separate Store accepted/effect witness',
    scope:'Owner-visible bounded attack-versus-Bench-Special-Energy development policy'};
}

/**
 * @param {object} audit Mutable diagnostics, not decision input.
 * @param {0|1} seat Real physical actor seat.
 * @param {number} turn Current turn.
 * @param {object} receipt Pure chooser receipt.
 */
function recordOwnerArbitration(audit,seat,turn,receipt){
  assert.ok(seat===0||seat===1);
  const changed=receipt.baselineKind!==receipt.selectedKind;
  audit.ownerRoots++;
  audit.bySeat[seat].ownerRoots++;
  if(changed){audit.changedRoots++;audit.bySeat[seat].changedRoots++;}
  audit.reasons[receipt.reason]=(audit.reasons[receipt.reason]??0)+1;
  if(audit.samples.length<MAX_SAMPLES&&
      (changed||receipt.candidateCount>0)){
    audit.samples.push({seat,globalTurn:turn,
      baselineKind:receipt.baselineKind,selectedKind:receipt.selectedKind,
      reason:receipt.reason,offerCount:receipt.candidateCount,
      selectedPrinting:receipt.selectedPrinting,
      selectedTarget:receipt.selectedTarget,
      nativePlayability:'unverified'});
  }
}

module.exports={VERSION,arbitrateOwnerRootIntent,
  newOwnerArbitrationAudit,recordOwnerArbitration};
