'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {LILLIE,lillieExclusionReason,
  chooseLillieAfterPass,withActorOnlyLillieAfterPass}=
  require('../simulation/twinleaf/agent12-actor-only-lillie-after-pass.cjs');

test('matches actual pinned engine card fullName printing',()=>{
  const {LilliesDetermination}=require('../vendor/twinleaf/ptcg-server/output/sets/11-mega-evolution/set-mega-evolution/lillies-determination');
  assert.equal(new LilliesDetermination().fullName,LILLIE);
  assert.equal(LILLIE,"Lillie's Determination M1L");
});

function observed(seat=0){
  return {decisionKind:'owner-root',actorSeat:seat,globalTurn:3,
    ownHand:['Mewtwo & Mew-GX UNM',LILLIE],
    ownPublic:{deckCount:28,prizeCount:6,
      resolvingSupporter:[],publicTurnRestrictions:{
        supporterPlayLocked:false}},
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false}};
}

test('eligible printed shuffle-draw identity after other resources are exhausted',()=>{
  assert.deepEqual(chooseLillieAfterPass(observed()),{
    kind:'play-lillie-shuffle-draw',handIndex:1,printing:LILLIE
  });
  const opponent=observed(1);
  assert.deepEqual(chooseLillieAfterPass(opponent),
    chooseLillieAfterPass(observed()));
  opponent.opponentHiddenHand=['Unknown Secret Box'];
  assert.deepEqual(chooseLillieAfterPass(opponent),
    chooseLillieAfterPass(observed()));
});

test('paper first-player turn, spent Supporter, lock and empty deck are vetoed',()=>{
  const x=observed();
  x.globalTurn=1;
  assert.equal(chooseLillieAfterPass(x),null);
  x.globalTurn=3;
  x.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(chooseLillieAfterPass(x),null);
  x.ownTurnResources.supporterPlayedTurn=0;
  x.ownTurnResources.supporterPlayLocked=true;
  assert.equal(chooseLillieAfterPass(x),null);
  x.ownTurnResources.supporterPlayLocked=false;
  x.ownPublic.deckCount=0;
  assert.equal(chooseLillieAfterPass(x),null);
  x.ownPublic.deckCount=25;
  x.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
  assert.equal(chooseLillieAfterPass(x),null);
  x.ownPublic.publicTurnRestrictions.supporterPlayLocked=false;
  x.ownHand=['Iono PAL'];
  assert.equal(chooseLillieAfterPass(x),null);
  assert.equal(lillieExclusionReason(x),'lillie-not-held');
  x.ownHand=[LILLIE];
  x.decisionKind='owner-prompt';
  assert.equal(chooseLillieAfterPass(x),null);
});

test('real native typed root dispatch uses only actor view and restores hooks',()=>{
  class AddPlayerAction{}
  class PassTurnAction{constructor(clientId){this.clientId=clientId;}}
  class PlayCardAction{
    constructor(clientId,handIndex,target){
      this.clientId=clientId;this.handIndex=handIndex;this.target=target;
    }
  }
  class Store{
    constructor(){this.dispatched=[];}
    dispatch(action){this.dispatched.push(action);return 'ok';}
  }
  class SimpleTacticsAi {
    constructor(id){this.client={id};}
    decodeNextAction(){return new PassTurnAction(this.client.id);}
  }
  const beforeDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const beforeDispatch=Store.prototype.dispatch;
  const deps={SimpleTacticsAi,Store,observe:(state,seat)=>{
    assert.equal(seat,1);
    assert.equal(state.players[seat].id,202);
    return observed(seat);
  },cardActions:{PlayCardAction,PlayerType:{ANY:2},SlotType:{BOARD:3}}};
  const result=withActorOnlyLillieAfterPass(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    const state={players:[{id:101},{id:202}],
      activePlayer:1,prompts:[]};
    const action=new SimpleTacticsAi(202).decodeNextAction(state);
    assert.ok(action instanceof PlayCardAction);
    assert.equal(action.clientId,202);
    assert.equal(action.handIndex,1);
    assert.deepEqual(action.target,{player:2,slot:3,index:0});
    store.dispatch(action);
    return store.dispatched.length;
  },deps);
  assert.equal(result.result,2);
  assert.equal(result.audit.passRootObservations,1);
  assert.equal(result.audit.passRootReasonCounts.eligible,1);
  assert.equal(result.audit.attemptedLillieRoots,1);
  assert.equal(result.audit.acceptedLillieRoots,1);
  assert.equal(result.audit.rejectedLillieRoots,0);
  assert.equal(result.audit.competitiveGameQualified,false);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,beforeDecode);
  assert.strictEqual(Store.prototype.dispatch,beforeDispatch);
});

test('non-Pass and unresolved prompt actions remain entirely delegated',()=>{
  class PassTurnAction{}
  class PlayCardAction {}
  class Store{dispatch(action){return action;}}
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return {constructor:{name:'AttackAction'}};}
  }
  const x=withActorOnlyLillieAfterPass(()=>{
    return new SimpleTacticsAi(101).decodeNextAction({
      players:[{id:101},{id:202}],activePlayer:0,prompts:[]});
  },{SimpleTacticsAi,Store,
    observe:()=>{throw Error('No actor view requested for nonpass');},
    cardActions:{PlayCardAction,PlayerType:{ANY:2},SlotType:{BOARD:3}}});
  assert.equal(x.result.constructor.name,'AttackAction');
  assert.equal(x.audit.attemptedLillieRoots,0);
  assert.equal(x.audit.acceptedLillieRoots,0);
  assert.equal(x.audit.competitiveGameQualified,false);
  assert.equal(typeof PassTurnAction,'function');
});
