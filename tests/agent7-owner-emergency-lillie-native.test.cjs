'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {emergencyLillieExclusion,withOwnerEmergencyLillie,
  withRegisteredOwnerEmergencyLillie}=
  require('../simulation/twinleaf/agent7-emergency-lillie-before-terminal-root.cjs');

const LILLIE="Lillie's Determination M1L";

/** @param {object} [overrides] @returns {object} */
function view(overrides={}){
  return {
    decisionKind:'owner-root',globalTurn:40,
    ownHand:[LILLIE,...Array.from({length:30},(_,i)=>'Card '+i)],
    ownPublic:{deckCount:1,prizeCount:6,
      publicTurnRestrictions:{supporterPlayLocked:false},
      resolvingSupporter:[]},
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    ...overrides
  };
}

test('emergency rule requires imminent loss plus enough cards to refill',()=>{
  assert.equal(emergencyLillieExclusion(view(),'AttackAction'),null);
  assert.equal(emergencyLillieExclusion(view(),'PassTurnAction'),null);
  assert.equal(emergencyLillieExclusion(view(),'PlayCardAction'),
    'not-terminal-native-root');
  assert.equal(emergencyLillieExclusion(view({
    ownPublic:{...view().ownPublic,deckCount:2}
  }),'AttackAction'),'deck-not-last-card');
  assert.equal(emergencyLillieExclusion(view({
    ownHand:[LILLIE,'One other','Two other']
  }),'AttackAction'),'insufficient-reshuffle-for-next-draw');
  assert.equal(emergencyLillieExclusion(view({
    ownTurnResources:{...view().ownTurnResources,supporterPlayedTurn:1}
  }),'AttackAction'),'supporter-already-spent');
  assert.equal(emergencyLillieExclusion(view({
    ownPublic:{...view().ownPublic,
      publicTurnRestrictions:{supporterPlayLocked:true}}
  }),'AttackAction'),'supporter-locked');
});

class AddPlayerAction{}
class AttackAction{}
class PassTurnAction{}
class PlayCardAction{
  constructor(id,handIndex,destination){
    this.id=id;this.handIndex=handIndex;this.destination=destination;
  }
}
class Store{
  constructor(state){this.state=state;this.realActions=[];}
  dispatch(action){
    this.realActions.push(action);
    return true;
  }
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){return new AttackAction();}
}

/** @param {0|1} seat @param {number} deckCount */
function scene(seat,deckCount=1){
  const own={
    id:'owner',hand:{cards:[{
      fullName:LILLIE,
      canPlay:()=>true
    },...Array.from({length:30},(_,i)=>({fullName:'Card '+i}))]},
    deck:{cards:Array.from({length:deckCount},(_,i)=>({i}))},
    supporterTurn:0
  };
  const other={id:'other',hand:{cards:[]},deck:{cards:[1,2,3]},
    supporterTurn:0};
  const players=seat===0?[own,other]:[other,own];
  const state={players,activePlayer:seat,prompts:[],turn:40};
  return {state,store:new Store(state),bot:new SimpleTacticsAi('owner')};
}

/** @param {object} data @param {object} [overrides] */
function executeOne(data,overrides={}){
  return withOwnerEmergencyLillie(()=>{
    data.store.dispatch(new AddPlayerAction());
    const intent=data.bot.decodeNextAction(data.state);
    data.store.dispatch(intent);
    return intent;
  },{
    bot:{SimpleTacticsAi},store:{Store},
    play:{PlayCardAction,PlayerType:{ANY:'ANY'},SlotType:{BOARD:'BOARD'}},
    observe:()=>view(overrides),
    nativeDrawAudit:execute=>({result:execute(),
      audit:{supportRoots:1,printedDrawConfirmed:1}})
  });
}

test('original terminal Attack is replaced by owner-printed Lillie in both seats',()=>{
  const priorBot=SimpleTacticsAi.prototype.decodeNextAction;
  const priorStore=Store.prototype.dispatch;
  for(const seat of [0,1]){
    const data=scene(seat);
    const output=executeOne(data);
    assert.ok(output.result instanceof PlayCardAction);
    assert.equal(output.result.handIndex,0);
    assert.equal(output.audit.eligible,1);
    assert.equal(output.audit.accepted,1);
    assert.equal(output.audit.rejected,0);
    assert.equal(output.audit.events[0].seat,seat);
    assert.equal(output.audit.events[0].originalNativeAction,'AttackAction');
    assert.equal(output.audit.nativeLillieDrawSettlement.printedDrawConfirmed,1);
  }
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,priorBot);
  assert.strictEqual(Store.prototype.dispatch,priorStore);
});

test('actual native card canPlay gates selected emergency Supporter',()=>{
  const data=scene(0);
  data.state.players[0].hand.cards[0].canPlay=()=>false;
  const output=executeOne(data);
  assert.ok(output.result instanceof AttackAction);
  assert.equal(output.audit.eligible,0);
  assert.equal(output.audit.accepted,0);
});

test('no unexpected substitute on deck with two cards left',()=>{
  const data=scene(0,2);
  const output=executeOne(data,{
    ownPublic:{...view().ownPublic,deckCount:2}});
  assert.ok(output.result instanceof AttackAction);
  assert.equal(output.audit.eligible,0);
});

test('exception restores both native prototypes',()=>{
  const originalDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const originalDispatch=Store.prototype.dispatch;
  const data=scene(0);
  assert.throws(()=>withOwnerEmergencyLillie(()=>{
    throw new Error('native failure');
  },{
    bot:{SimpleTacticsAi},store:{Store},
    play:{PlayCardAction,PlayerType:{ANY:'ANY'},SlotType:{BOARD:'BOARD'}},
    observe:()=>view(),
    nativeDrawAudit:run=>({result:run(),audit:{}})
  }),/native failure/);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,originalDecode);
  assert.strictEqual(Store.prototype.dispatch,originalDispatch);
});

test('registered proxy runs precisely the expected games and restores export',()=>{
  const root={withActorOnlyRootPolicy:(fn,options)=>{
    assert.equal(options.existing,true);
    return {result:fn(),audit:{}};
  }};
  const prior=root.withActorOnlyRootPolicy;
  const trials=[{id:'one'},{id:'two'}];
  let index=0;
  const augmented=withRegisteredOwnerEmergencyLillie(()=>{
    return [root.withActorOnlyRootPolicy(()=>11,{existing:true}),
      root.withActorOnlyRootPolicy(()=>21,{existing:true})];
  },trials,{root,runTrial:run=>{
    const trial=trials[index++];
    return {result:run(),audit:{trace:trial.id}};
  }});
  assert.deepEqual(augmented.result.map(x=>x.result),[11,21]);
  assert.deepEqual(augmented.audit.interventions.map(x=>x.trialId),
    ['one','two']);
  assert.strictEqual(root.withActorOnlyRootPolicy,prior);
});
