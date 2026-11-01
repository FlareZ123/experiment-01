'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {chooseForcedGuzmaNominalKo, fundedPlainAttacks} =
  require('../simulation/twinleaf/agent31-forced-guzma-ko-frontier.cjs');

const catalog = {
  basicEnergies: new Set(['Psychic Energy SVI']),
  basicEnergyTypes: {Psychic: 1}, colorlessEnergyType: 0,
  specialConditions: {ASLEEP: 5, PARALYZED: 6}
};
const move = (damage, opts={}) => ({
  name: 'Moon Press', damage, cost: [1,0], gxAttack: false,
  text: '', damageCalculation: null, ...opts
});
const actor = (overrides={}) => ({
  decisionKind: 'owner-root', globalTurn: 3, ownHand: ['Guzma BUS'],
  ownTurnResources: {supporterPlayedTurn: 0, supporterPlayLocked: false},
  ownPublic: {
    active: {attacks: [move(100)], energies: [], specialConditions: []},
    bench: [{attacks: [move(100)], energies: [
      'Psychic Energy SVI','Psychic Energy SVI'
    ], specialConditions: []}],
    publicTurnRestrictions: {
      supporterPlayLocked: false, attackLockTurnsRemaining: 0
    }, resolvingSupporter: []
  },
  opponentPublic: {
    active: {hp: 200, damage: 0},
    bench: [{hp: 90, damage: 0, tools: []}]
  },
  ...overrides
});

test('one Bench recipient on each side produces forced nominal KO intent', () => {
  const plan = chooseForcedGuzmaNominalKo(actor(), catalog);
  assert.equal(plan.kind, 'play-guzma-forced-nominal-ko');
  assert.equal(plan.benchIndex, 0);
  assert.equal(plan.opponentBenchIndex, 0);
  assert.equal(plan.nominalDamage, 100);
  assert.equal(plan.targetRemainingHp, 90);
  assert.equal(plan.predictedNativeTargetsForced, true);
  assert.equal(plan.actualKoAndTacticalBenefitUnverified, true);
});

test('do not spend Supporter when own Active already nominally KOs', () => {
  const view = actor();
  view.ownPublic.active.energies = [
    'Psychic Energy SVI','Psychic Energy SVI'
  ];
  view.opponentPublic.active.hp = 90;
  assert.equal(chooseForcedGuzmaNominalKo(view,catalog), null);
});

test('Guzma and Hala differs from Guzma; first-turn and quota excluded', () => {
  assert.equal(chooseForcedGuzmaNominalKo(
    actor({ownHand: ['Guzma & Hala CEC']}),catalog),null);
  assert.equal(chooseForcedGuzmaNominalKo(
    actor({globalTurn: 1}),catalog),null);
  assert.equal(chooseForcedGuzmaNominalKo(
    actor({ownTurnResources: {supporterPlayedTurn: 1}}),catalog),null);
});

test('multiple Bench destinations on either side disqualify forced choice', () => {
  const own = actor();
  own.ownPublic.bench.push({...own.ownPublic.bench[0]});
  assert.equal(chooseForcedGuzmaNominalKo(own,catalog),null);
  const opp = actor();
  opp.opponentPublic.bench.push({hp: 50,damage: 0,tools: []});
  assert.equal(chooseForcedGuzmaNominalKo(opp,catalog),null);
});

test('visible Eviolite and unknown Tool are conservatively screened', () => {
  const view=actor();
  view.opponentPublic.bench[0].tools=['Eviolite NVI'];
  assert.equal(chooseForcedGuzmaNominalKo(view,catalog),null);
  view.opponentPublic.bench[0].damage=20;
  assert.equal(chooseForcedGuzmaNominalKo(view,catalog).nominalDamage,80);
  view.opponentPublic.bench[0].tools=['Other Tool X'];
  assert.equal(chooseForcedGuzmaNominalKo(view,catalog),null);
});

test('unpaid, status-blocked or text-effect attacks are excluded', () => {
  const view=actor();
  view.ownPublic.bench[0].energies=[];
  assert.equal(chooseForcedGuzmaNominalKo(view,catalog),null);
  view.ownPublic.bench[0].energies=[
    'Psychic Energy SVI','Psychic Energy SVI'
  ];
  view.ownPublic.bench[0].specialConditions=[5];
  assert.equal(chooseForcedGuzmaNominalKo(view,catalog),null);
  view.ownPublic.bench[0].specialConditions=[];
  view.ownPublic.bench[0].attacks[0].text='Discard an Energy.';
  assert.deepEqual(fundedPlainAttacks(view.ownPublic.bench[0],catalog),[]);
});

test('supporter or attack lock and KOed Bench target are excluded', () => {
  const view=actor();
  view.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
  assert.equal(chooseForcedGuzmaNominalKo(view,catalog),null);
  view.ownPublic.publicTurnRestrictions.supporterPlayLocked=false;
  view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.equal(chooseForcedGuzmaNominalKo(view,catalog),null);
  view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=0;
  view.opponentPublic.bench[0].damage=90;
  assert.equal(chooseForcedGuzmaNominalKo(view,catalog),null);
});

test('hidden opponent hand changes cannot affect the owner-public proposal', () => {
  const left=actor({opponentHidden:{hand:['concealed A'],prizes:['A']}});
  const right=actor({opponentHidden:{hand:['concealed B'],prizes:['B']}});
  assert.deepEqual(chooseForcedGuzmaNominalKo(left,catalog),
    chooseForcedGuzmaNominalKo(right,catalog));
});

test('root integration is default-off and opt-in selects Guzma before an attack', () => {
  const {chooseActorRootIntent}=require(
    '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  const v=actor();
  v.ownPublic.active.energies=[
    'Psychic Energy SVI','Psychic Energy SVI'
  ];
  v.ownTurnResources.energyPlayedTurn=3;
  const defaultDecision=chooseActorRootIntent(v,catalog);
  assert.notEqual(defaultDecision.kind,'play-guzma-forced-nominal-ko');
  const chosen=chooseActorRootIntent(v,catalog,{forcedGuzmaNominalKo:true});
  assert.equal(chosen.kind,'play-guzma-forced-nominal-ko');
  assert.equal(chosen.handIndex,0);
});

test('native-shaped actor wrapper submits the typed forced Guzma Supporter root', () => {
  const {withActorOnlyRootPolicy}=require(
    '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  class AddPlayerAction{}
  class PlayCardAction{
    constructor(id,handIndex,target){
      this.id=id;this.handIndex=handIndex;this.target=target;
    }
  }
  class AttackAction{constructor(id,name){this.id=id;this.name=name;}}
  class PassTurnAction{constructor(id){this.id=id;}}
  class Store{
    constructor(){
      const empty=()=>({getPokemonCard:()=>null,cards:[],damage:0,
        specialConditions:[],energies:{cards:[]},tools:[]});
      const player=id=>({id,active:empty(),
        bench:Array.from({length:5},empty),
        hand:{cards:[]},deck:{cards:[]},prizes:[],
        stadium:{cards:[]},discard:{cards:[]},
        lostzone:{cards:[]},supporter:{cards:[]}});
      this.state={players:[player(101),player(202)],
        activePlayer:0,prompts:[],turn:3,phase:2};
    }
    dispatch(){return true;}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){throw Error('Unsupported generic root');}
  }
  const priorDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const priorDispatch=Store.prototype.dispatch;
  const view=actor();
  const executed=withActorOnlyRootPolicy(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    const action=new SimpleTacticsAi(101).decodeNextAction(store.state);
    assert.ok(action instanceof PlayCardAction);
    assert.deepEqual(action.target,{player:2,slot:0,index:0});
    assert.equal(action.handIndex,0);
    store.dispatch(action);
    return action;
  },{
    SimpleTacticsAi,Store,GamePhase:{PLAYER_TURN:2,FINISHED:7},
    observe:()=>Object.freeze(view),getCatalog:()=>catalog,
    forcedGuzmaNominalKo:true,
    cardActions:{PlayCardAction,
      PlayerType:{BOTTOM_PLAYER:0,ANY:2},
      SlotType:{BOARD:0,ACTIVE:1,BENCH:2}},
    gameActions:{AttackAction,PassTurnAction}
  });
  assert.equal(executed.audit.forcedGuzmaNominalKoOptIn,true);
  assert.equal(executed.audit.typedIntentCounts[
    'play-guzma-forced-nominal-ko'],1);
  assert.equal(executed.audit.acceptedActorRoots,1);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,priorDecode);
  assert.strictEqual(Store.prototype.dispatch,priorDispatch);
});
