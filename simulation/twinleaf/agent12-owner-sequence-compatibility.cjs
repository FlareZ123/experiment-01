'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent12-owner-sequence-compatibility-v1';

// A deliberately closed subset of the current canonical actor-root vocabulary.
// "terminal" means the action itself ends the owner's turn if it resolves.
// Printed Boost Shake ends the turn even though it is an Item. Carmine is the
// narrow first-player first-turn Supporter exception in its printed text.
// This module does not assert that a proposed action can actually resolve.
const KINDS = Object.freeze({
  'attack': {terminal:true},
  'perfection': {terminal:true},
  'pass': {terminal:true},
  'play-boost-shake': {quota:'item',terminal:true,hand:true},
  'bench-basic': {quota:'pokemon',hand:true,bench:true},
  'evolve-pokemon': {quota:'evolution',hand:true},
  'play-quick-ball': {quota:'item',hand:true},
  'play-battle-vip-pass': {quota:'item',hand:true},
  'play-seeker-get-lillie': {quota:'item',hand:true},
  'equip-powerglass': {quota:'tool',hand:true,tool:true},
  'attach-emergency-floatstone': {quota:'tool',hand:true,tool:true},
  'play-thunder-mountain': {quota:'stadium',hand:true},
  'attach-basic-energy': {quota:'energy',hand:true},
  'attach-special-energy': {quota:'energy',hand:true,special:true},
  'attach-dce': {quota:'energy',hand:true,special:true},
  'paid-retreat': {quota:'retreat'},
  'play-lowhand-lillie': {quota:'supporter',hand:true},
  'play-conservative-shuffle-supporter': {quota:'supporter',hand:true},
  'play-seeker-recovered-lillie': {quota:'supporter',hand:true},
  'play-carmine-first': {quota:'supporter',hand:true,firstTurnException:true},
  'play-held-guzma-mobility': {quota:'supporter',hand:true},
  'play-stranded-marnie': {quota:'supporter',hand:true},
  'play-team-flare-grunt-denial': {quota:'supporter',hand:true}
});

const SINGLE_USE = new Set(['supporter','energy','stadium','retreat']);

/**
 * Known negative gates from the detached owner's public turn resources.
 * Missing state stays unknown; unknown never means legal.
 * @param {object} view Detached actorObservation, not a native Store State.
 * @param {object} intent Current-root proposal.
 * @param {object} def Known action family definition.
 * @returns {string|null} Known reason for exclusion.
 */
function excludedAtRoot(view,intent,def){
  const r=view.ownTurnResources??{};
  const t=view.globalTurn;
  const locks={
    supporter:r.supporterPlayLocked,
    item:r.itemPlayLocked,
    energy:r.energyPlayLocked,
    stadium:r.stadiumPlayLocked,
    tool:r.toolPlayLocked,
    pokemon:r.pokemonPlayLocked,
    evolution:r.evolutionPlayLocked
  };
  if(locks[def.quota]===true)return 'public-'+def.quota+'-lock';
  if(def.special&&r.specialEnergyPlayLocked===true)
    return 'public-special-energy-lock';
  if(def.quota==='supporter'){
    if(t===1&&!def.firstTurnException)return 'ordinary-supporter-on-first-turn';
    if(Number.isInteger(r.supporterPlayedTurn)&&r.supporterPlayedTurn>0)
      return 'supporter-already-used';
  }
  if(def.quota==='energy'&&r.energyPlayedTurn===t)
    return 'energy-already-attached';
  if(def.quota==='stadium'&&r.stadiumPlayedTurn===t)
    return 'stadium-already-played';
  if(def.quota==='retreat'&&r.retreatedTurn===t)
    return 'already-retreated';
  if(def.hand){
    if(!Number.isSafeInteger(intent.handIndex)||intent.handIndex<0||
       typeof intent.printing!=='string'||
       view.ownHand?.[intent.handIndex]!==intent.printing)
      return 'owner-hand-printing-unmatched';
  }
  if(def.bench){
    if(!Number.isSafeInteger(intent.benchIndex)||
       view.ownPublic?.bench?.[intent.benchIndex]!==null)
      return 'bench-slot-unavailable';
  }
  return null;
}

/** @returns {string|null} Structural exclusion or null for later-root reassessment. */
function pairExclusion(first,second){
  const a=KINDS[first.kind],b=KINDS[second.kind];
  if(a.terminal)return 'first-action-ends-turn';
  if(a.hand&&b.hand&&first.handIndex===second.handIndex)
    return 'same-physical-owner-hand-card';
  if(a.quota===b.quota&&SINGLE_USE.has(a.quota))
    return 'same-turn-'+a.quota+'-quota';
  if(a.bench&&b.bench&&first.benchIndex===second.benchIndex)
    return 'same-bench-slot';
  if(a.tool&&b.tool&&first.slot===second.slot&&first.index===second.index)
    return 'same-pokemon-tool-slot';
  return null;
}

/**
 * Inspect SAME-root bounded proposals without accessing a concealed card.
 * No action is ranked or executed. For an unobstructed A->B ordering the real
 * Store must accept and settle A, then a *new* actor observation must make B
 * available: target, hand indices, locks, game state and RNG may have changed.
 *
 * @param {object} view Detached actorObservation, owner-root only.
 * @param {object[]} proposals Native-neutral proposals from the same root.
 * @returns {object} Closed-vocabulary, no-legality-claim decision matrix.
 */
function ownerSequenceCompatibility(view,proposals){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(Array.isArray(proposals));
  const offers=proposals.map((intent,index)=>{
    assert.ok(intent&&typeof intent.kind==='string');
    const definition=KINDS[intent.kind];
    const excluded=definition?
      excludedAtRoot(view,intent,definition):'unknown-action-family';
    return {index,kind:intent.kind,
      quota:definition?.quota??null,
      terminal:definition?.terminal===true,
      rootStatus:excluded?'excluded':'not-native-verified',
      reason:excluded,
      physicalHandIndex:definition?.hand?intent.handIndex:null,
      printing:definition?.hand?intent.printing:null};
  });
  const orders=[];
  for(let a=0;a<proposals.length;a++){
    for(let b=0;b<proposals.length;b++){
      if(a===b)continue;
      const first=offers[a],second=offers[b];
      const rootExcluded=first.reason??second.reason;
      const conflict=rootExcluded?'root-gate:'+rootExcluded:
        pairExclusion(proposals[a],proposals[b]);
      orders.push({first:a,then:b,status:conflict?'excluded':
        'requires-native-settlement-and-fresh-owner-root',
        reason:conflict,
        nativeAccepted:false,
        secondActionObserved:false});
    }
  }
  return {version:VERSION,actorSeat:view.actorSeat,
    globalTurn:view.globalTurn,offers,orders,
    hiddenInformationSafeByInputContract:true,
    nativeLegality:'unverified',
    outcomeProof:'none'};
}

module.exports={VERSION,KINDS,excludedAtRoot,pairExclusion,
  ownerSequenceCompatibility};
