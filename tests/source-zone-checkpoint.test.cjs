'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {sourceZoneSnapshot, zoneSnapshotDigest, withSourceZoneCheckpoint} =
  require('../simulation/twinleaf/source-zone-checkpoint.cjs');

const card = fullName => ({fullName});
function pokemon(cards = []) {
  return {
    cards:cards.map(card),energies:{cards:[]},tools:[],
    damage:0,hp:140,pokemonPlayedTurn:1,
    specialConditions:[],poisonDamage:10,burnDamage:20,
    attacksThisTurn:undefined,cannotAttackNextTurn:false,
    cannotRetreatNextTurn:false,abilityLockActivationOrder:0
  };
}
function player(id, prizePrint) {
  return {
    id,deck:{cards:[card('Energy '+id),card('Trainer '+id)]},
    hand:{cards:[card('Hidden '+id)]},
    discard:{cards:[]},lostzone:{cards:[]},stadium:{cards:[]},
    supporter:{cards:[]},prizes:[{cards:[card(prizePrint)]},{cards:[]}],
    active:pokemon(['Mimikyu GRI']),bench:[pokemon()],
    usedGX:false,usedVSTAR:false,energyPlayedTurn:1,
    supporterTurn:2,retreatedTurn:0,stadiumPlayedTurn:0
  };
}
function state() {
  return {phase:2,turn:27,activePlayer:1,winner:-1,
    skipOpponentTurn:false,playerLastAttack:{
      101:{sourceCard:card('Regidrago VSTAR SIT'),attack:{name:'Apex Dragon'}}
    },prompts:[],players:[player(101,'Grass Energy MEE'),player(202,'Psychic Energy MEE')]};
}

test('ordered private Prize, hand and deck identity affect checkpoint digests',()=>{
  const s=state();
  const snap=sourceZoneSnapshot(s), digest=zoneSnapshotDigest(snap);
  assert.equal(snap.players[1].prizes[0][0],'Psychic Energy MEE');
  assert.equal(snap.players[0].deck[0],'Energy 101');
  assert.equal(snap.previousAttack[0].attack,'Apex Dragon');
  assert.equal(zoneSnapshotDigest(sourceZoneSnapshot(s)),digest);
  s.players[1].prizes[0].cards[0].fullName='Changed Hidden Prize';
  assert.notEqual(zoneSnapshotDigest(sourceZoneSnapshot(s)),digest);
  assert.equal(snap.players[1].prizes[0][0],'Psychic Energy MEE',
    'Read-only snapshot must be detached');
});

test('live checkpoint excludes a second speculative Store',()=>{
  class AddPlayerAction{}
  class Move{}
  class Store{
    constructor(){this.state={phase:0,turn:0,activePlayer:0,players:[],prompts:[]};}
    dispatch(action){return action.constructor.name;}
  }
  const original=Store.prototype.dispatch;
  const live=new Store(),simulated=new Store();
  const result=withSourceZoneCheckpoint(Store,()=>{
    live.dispatch(new AddPlayerAction());
    simulated.state=state();
    simulated.dispatch(new Move());
    live.state=state();
    return live.dispatch(new Move());
  },{turn:27,candidateSeat:1});
  assert.equal(result.result,'Move');
  assert.equal(result.checkpoint.turn,27);
  assert.deepEqual(result.checkpoint.players[1].hand,['Hidden 202']);
  assert.equal(result.digest,zoneSnapshotDigest(result.checkpoint));
  assert.equal(Store.prototype.dispatch,original);
});

test('restores dispatcher when an engine action throws',()=>{
  class Move{}
  class Store{
    constructor(){this.state={turn:1,phase:0,activePlayer:0,prompts:[]};}
    dispatch(){throw new Error('engine-failure');}
  }
  const original=Store.prototype.dispatch;
  assert.throws(()=>withSourceZoneCheckpoint(Store,()=>new Store().dispatch(new Move()),
    {turn:27,candidateSeat:1}),/engine-failure/);
  assert.equal(Store.prototype.dispatch,original);
});
