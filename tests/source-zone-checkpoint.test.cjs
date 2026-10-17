'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {sourceZoneSnapshot, zoneSnapshotDigest, withSourceZoneCheckpoint} =
  require('../simulation/twinleaf/source-zone-checkpoint.cjs');

const {sourceEffectSnapshot,sourceEffectDigest} =
  require('../simulation/twinleaf/source-effect-checkpoint.cjs');

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


test('effect-bearing source fields omitted by the legacy zone and history checkpoints are detected by the supplementary digest',()=>{
  const original=state();
  const zone=zoneSnapshotDigest(sourceZoneSnapshot(original));
  const effect=sourceEffectDigest(original);
  const cases=[
    ['player Tool lock',s=>{s.players[1].cannotPlayToolCards=true;}],
    ['player Stadium lock',s=>{s.players[1].cannotPlayStadiumCards=true;}],
    ['play-lock countdown',s=>{s.players[1].playLocksTurnsRemaining=2;}],
    ['attack suppression',s=>{s.players[1].attackPowerSuppressions=[{turnsRemaining:1,powerTypes:[1],mode:'block'}];}],
    ['damage prevention',s=>{s.players[1].active.preventDamageNextTurn={maxDamage:100};}],
    ['damage reduction',s=>{s.players[1].active.damageReductionNextTurn=30;}],
    ['forbidden named attack',s=>{s.players[1].active.cannotUseAttacksNextTurn=['Apex Dragon'];}],
    ['global Ability activation order',s=>{s.abilityLockOrderCounter=4;}]
  ];
  for(const [name,mutate] of cases) {
    const changed=state();
    mutate(changed);
    assert.equal(zoneSnapshotDigest(sourceZoneSnapshot(changed)),zone,
      name+' is invisible to existing ordered-zone digest');
    assert.notEqual(sourceEffectDigest(changed),effect,
      name+' must change the supplementary effect digest');
  }
  const actualZoneChange=state();
  actualZoneChange.players[1].active.damage=30;
  assert.notEqual(zoneSnapshotDigest(sourceZoneSnapshot(actualZoneChange)),zone);
  assert.equal(sourceEffectDigest(actualZoneChange),effect,
    'The supplementary digest remains deliberately scoped to omitted fields');
});

test('supplementary effect snapshots detach their structured fields',()=>{
  const live=state();
  live.players[0].attackPowerSuppressions=[{turnsRemaining:2,powerTypes:[3],mode:'block'}];
  const checkpoint=sourceEffectSnapshot(live);
  live.players[0].attackPowerSuppressions[0].turnsRemaining=1;
  assert.equal(checkpoint.players[0].fields.attackPowerSuppressions[0].turnsRemaining,2);
});


test('all-own-primitive audit catches physical Card mutation hidden from print-zone history',()=>{
  const live=state();
  const zone=zoneSnapshotDigest(sourceZoneSnapshot(live));
  const before=sourceEffectDigest(live);
  live.players[0].hand.cards[0].damageTakenLastTurn=80;
  assert.equal(zoneSnapshotDigest(sourceZoneSnapshot(live)),zone);
  assert.notEqual(sourceEffectDigest(live),before);
  const primitive=sourceEffectSnapshot(live).players[0].primitive.hand[0];
  assert.deepEqual(primitive.find(([name])=>name==='damageTakenLastTurn'),
    ['damageTakenLastTurn',80]);
});

test('all-own-primitive audit preserves undefined versus absent, without invoking getters',()=>{
  const game=state();
  const original=sourceEffectDigest(game);
  game.players[0].debugUndefined=undefined;
  assert.notEqual(sourceEffectDigest(game),original);
  const after=sourceEffectDigest(game);
  Object.defineProperty(game.players[0],'unsafeGetter',{
    enumerable:true,get(){throw new Error('must not invoke source getter');}
  });
  assert.equal(sourceEffectDigest(game),after);
  game.players[0].debugUndefined=false;
  assert.notEqual(sourceEffectDigest(game),after);
});
