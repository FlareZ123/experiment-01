'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {sourceZoneSnapshot, zoneSnapshotDigest} =
  require('../simulation/twinleaf/source-zone-checkpoint.cjs');
const {observableState, hash} =
  require('../simulation/twinleaf/source-state-continuity.cjs');

const card = fullName => ({fullName});

function slot() {
  return {
    cards:[card('Mimikyu GRI')], energies:{cards:[]},tools:[],
    damage:0,hp:70,pokemonPlayedTurn:0,specialConditions:[],
    poisonDamage:10,burnDamage:20,attacksThisTurn:undefined,
    cannotAttackNextTurn:false,cannotRetreatNextTurn:false,
    abilityLockActivationOrder:0,
    damageReductionNextTurn:0,preventDamageNextTurn:null,
    marker:{markers:[]}
  };
}

function player(id) {
  return {
    id, deck:{cards:[card('Psychic Energy MEE')]},
    hand:{cards:[card('Switch SVI')]},
    discard:{cards:[]},lostzone:{cards:[]},stadium:{cards:[]},
    supporter:{cards:[]},prizes:[{cards:[card('Ultra Ball SVI')]}],
    active:slot(),bench:[slot()],usedGX:false,usedVSTAR:false,
    energyPlayedTurn:0,supporterTurn:0,retreatedTurn:0,
    stadiumPlayedTurn:0,cannotPlayItemCards:false,
    cannotPlaySupporterCards:false,cannotPlayPokemonCards:false,
    cannotUseGXAttacks:false,cannotPlayToolCards:false,
    playLocksTurnsRemaining:0,pendingEndOfTurnEffects:[],
    marker:{markers:[]}
  };
}

function state() {
  return {
    phase:2,turn:27,activePlayer:1,winner:-1,skipOpponentTurn:false,
    playerLastAttack:{},prompts:[],players:[player(101),player(202)]
  };
}

function priorDigests(s) {
  return [
    zoneSnapshotDigest(sourceZoneSnapshot(s)),
    hash(observableState(s))
  ];
}

test('positive control: represented play lock and GX status change both digests',()=>{
  const s=state();
  const original=priorDigests(s);
  s.players[1].cannotPlayItemCards=true;
  assert.notDeepEqual(priorDigests(s),original);
  s.players[1].cannotPlayItemCards=false;
  s.players[1].usedGX=true;
  assert.notDeepEqual(priorDigests(s),original);
});

test('negative control: tool lock and duration can change without a digest change',()=>{
  const s=state();
  const original=priorDigests(s);
  s.players[1].cannotPlayToolCards=true;
  s.players[1].playLocksTurnsRemaining=1;
  assert.deepEqual(priorDigests(s),original);
});

test('negative control: prevention and reduction effects are not covered',()=>{
  const s=state();
  const original=priorDigests(s);
  s.players[1].active.damageReductionNextTurn=30;
  s.players[1].active.preventDamageNextTurn={sourceIsEvolution:true};
  assert.deepEqual(priorDigests(s),original);
});

test('negative control: pending end-of-turn knockout is absent from both digests',()=>{
  const s=state();
  const original=priorDigests(s);
  s.players[1].pendingEndOfTurnEffects.push({
    type:'knock_out',target:s.players[0].active,
    attackerPlayerId:202,attack:{name:'Pale Moon-GX'},
    sourceCard:card('Gengar & Mimikyu-GX TEU')
  });
  assert.deepEqual(priorDigests(s),original);
});

test('negative control: prompt controller and marker differences are omitted',()=>{
  const s=state();
  const original=priorDigests(s);
  s.promptControllerId=202;
  s.players[1].marker.markers.push({name:'ABILITY_LOCK',sourceType:'attack'});
  assert.deepEqual(priorDigests(s),original);
});

test('negative control: Store prompt callbacks cannot be witnessed by State-only digests',()=>{
  const s=state();
  const a={state:s,promptItems:[{ids:[4],then:()=>{}}]};
  const b={state:s,promptItems:[]};
  assert.notDeepEqual(a.promptItems,b.promptItems);
  assert.deepEqual(priorDigests(a.state),priorDigests(b.state));
});
