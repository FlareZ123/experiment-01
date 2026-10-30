'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withLiveJetRootCensus}=
  require('../simulation/twinleaf/agent40-live-jet-root-census.cjs');
const {registration}=require(
  '../simulation/evaluation/agent40-jet-original-source-census.cjs');

const JET='Jet Energy PAL';
const catalog={specialEnergies:new Set([JET]),
  basicEnergies:new Set(),basicEnergyTypes:{Lightning:4,Fairy:8},
  colorlessEnergyType:9,stages:{BASIC:0},
  dragonPokemonPrintings:new Set(),
  specialConditions:{ASLEEP:2,PARALYZED:3}};
const pokemon=(name,attack,cost,damage)=>({
  name,printing:name+' TEST',printed:{stage:0,types:[4]},
  energies:[],attacks:[{name:attack,cost,damage,gxAttack:false}],
  specialConditions:[],publicRestrictions:{},abilityDetails:[]
});
function visible(){
  return {decisionKind:'owner-root',globalTurn:4,ownHand:[JET],
    ownTurnResources:{energyPlayedTurn:-1,energyPlayLocked:false,
      specialEnergyPlayLocked:false},
    ownPublic:{active:pokemon('Dratini','Water Hit',[3],10),
      bench:[pokemon('Doduo','Reckless Charge',[9],30),null,null,null,null],
      stadium:[],prizeCount:6,publicTurnRestrictions:{}},
    opponentPublic:{stadium:[],prizeCount:6,
      active:pokemon('Pidgey','Tackle',[9,9],20)}
  };
}
class AddPlayerAction{}
class PassTurnAction{}
class FakeStore{
  constructor(state){this.state=state;}
  dispatch(action){return action;}
}
class FakeBot{
  constructor(id){this.client={id};}
  decodeNextAction(_state){return new PassTurnAction();}
}

/**
 * Pure mock boundary: real code must still see the exact native Store state
 * and use only the acting owner's detached observation.
 * @param {0|1} seat
 */
function sample(seat){
  const v=visible(),playerId=100+seat;
  const state={phase:4,turn:4,activePlayer:seat,
    prompts:[],players:[{id:100},{id:101}]};
  const originalDecode=FakeBot.prototype.decodeNextAction;
  const originalDispatch=FakeStore.prototype.dispatch;
  const {result,audit}=withLiveJetRootCensus(()=>{
    const store=new FakeStore(state);
    store.dispatch(new AddPlayerAction());
    const bot=new FakeBot(playerId);
    const speculative={...state};
    assert.ok(bot.decodeNextAction(speculative) instanceof PassTurnAction);
    return bot.decodeNextAction(store.state);
  },{trackedSeat:seat,SimpleTacticsAi:FakeBot,Store:FakeStore,
    GamePhase:{PLAYER_TURN:4},observe:()=>v,catalog});
  assert.strictEqual(FakeBot.prototype.decodeNextAction,originalDecode);
  assert.strictEqual(FakeStore.prototype.dispatch,originalDispatch);
  return {result,audit};
}
test('frozen registered sample has twelve distinct original-source physical arms',()=>{
  const plan=registration();
  assert.equal(plan.trials.length,12);
  assert.deepEqual(plan.sourceRanks,[2,7,15]);
  assert.equal(new Set(plan.trials.map(x=>x.seed)).size,12);
});
for(const seat of [0,1]){
  test('read-only observer does not intervene and counts actual live root seat '+seat,()=>{
    const {result,audit}=sample(seat);
    assert.ok(result instanceof PassTurnAction);
    assert.equal(audit.realStoreObserved,true);
    assert.equal(audit.actionPolicyChanged,false);
    assert.deepEqual(audit.bySeat[seat],{
      roots:1,heldJetRoots:1,proposedJetRoots:1});
    assert.deepEqual(audit.bySeat[1-seat],{
      roots:0,heldJetRoots:0,proposedJetRoots:0});
    assert.equal(audit.sourceProposalExamples.length,1);
    const receipt=audit.sourceProposalExamples[0];
    assert.equal(receipt.proposed.kind,'attach-special-energy');
    assert.equal(receipt.proposed.slot,'bench');
    assert.equal(receipt.baselineAction,'PassTurnAction',
      'The original bot action must still be what the caller receives');
    assert.equal(receipt.seat,seat);
    assert.equal(audit.gamesQualifiedForStrength,0);
  });
}
