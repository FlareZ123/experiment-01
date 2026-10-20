'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {withSupporterProposalStateAudit,VERSION}=
  require('../simulation/twinleaf/agent22-supporter-proposal-state-audit.cjs');

class AddPlayerAction {}
class PlayCardAction {
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class PassTurnAction {}
class Store {
  constructor(){
    this.state={turn:2,players:[{
      id:101,supporterTurn:0,hand:{cards:[{fullName:'Supporter TEST'}]}
    }]};
  }
  dispatch(action){
    if(action instanceof PlayCardAction)
      this.state.players[0].supporterTurn++;
  }
}
class PlaySupporterTactic {
  useTactic(state,owner){
    owner.supporterTurn=state.turn;
    return new PlayCardAction(owner.id,0);
  }
}
class SimpleTacticsAi {
  constructor(reject=false){this.reject=reject;}
  decodeNextAction(state){
    const proposal=new PlaySupporterTactic().useTactic(state,state.players[0]);
    return this.reject?new PassTurnAction():proposal;
  }
}
const deps={Store,PlaySupporterTactic,SimpleTacticsAi};

test('native State alias and selected proposal are observed without changing them',()=>{
  const methods=[Store.prototype.dispatch,
    PlaySupporterTactic.prototype.useTactic,SimpleTacticsAi.prototype.decodeNextAction];
  const {result,audit}=withSupporterProposalStateAudit(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    const action=new SimpleTacticsAi().decodeNextAction(store.state);
    assert.ok(action instanceof PlayCardAction);
    assert.equal(store.state.players[0].supporterTurn,2);
    store.dispatch(action);
    return store;
  },deps);
  assert.equal(audit.schema,VERSION);
  assert.equal(audit.readOnly,true);
  assert.equal(audit.mutatedRootProposals,1);
  assert.equal(audit.proposalMarkerPersistedToBotExit,1);
  assert.equal(audit.physicalRootStatePreservedToDispatch,1);
  assert.equal(audit.physicalRootOwnerPreservedToDispatch,1);
  assert.equal(audit.rejectedAndMutatedRootProposals,0);
  assert.equal(audit.nativeDispatchedSelected,1);
  const record=audit.records[0];
  assert.equal(record.physicalRootStateAlias,true);
  assert.equal(record.quotaBeforeProposal,0);
  assert.equal(record.quotaAfterProposal,2);
  assert.equal(record.quotaAfterBotDecision,2);
  assert.equal(record.rootStateAliasAtBotExit,true);
  assert.equal(record.rootOwnerAliasAtBotExit,true);
  assert.equal(record.quotaAtNativeDispatch,2);
  assert.equal(record.rootStateAliasAtDispatch,true);
  assert.equal(record.rootOwnerAliasAtDispatch,true);
  assert.equal(record.quotaAfterNativeDispatch,3);
  assert.equal(record.nativeDispatchOutcome,'returned');
  assert.equal(result.state.players[0].supporterTurn,3);
  assert.deepEqual([Store.prototype.dispatch,
    PlaySupporterTactic.prototype.useTactic,
    SimpleTacticsAi.prototype.decodeNextAction],methods);
});

test('a rejected proposal can mutate the authentic mock State before dispatch',()=>{
  const {result,audit}=withSupporterProposalStateAudit(()=>{
    const store=new Store();store.dispatch(new AddPlayerAction());
    const action=new SimpleTacticsAi(true).decodeNextAction(store.state);
    assert.ok(action instanceof PassTurnAction);
    store.dispatch(action);
    return store;
  },deps);
  assert.equal(audit.rejectedAndMutatedRootProposals,1);
  assert.equal(audit.proposedButNotSelectedOnRoot,1);
  assert.equal(audit.nativeDispatchedSelected,0);
  assert.equal(audit.records[0].botFinalAction,'PassTurnAction');
  assert.equal(result.state.players[0].supporterTurn,2);
});

test('a detached simulation does not count as a real Store State mutation',()=>{
  const {audit}=withSupporterProposalStateAudit(()=>{
    const store=new Store();store.dispatch(new AddPlayerAction());
    const clone={turn:2,players:[{
      id:101,supporterTurn:0,hand:{cards:[{fullName:'Supporter TEST'}]}
    }]};
    new SimpleTacticsAi(true).decodeNextAction(clone);
    assert.equal(store.state.players[0].supporterTurn,0);
  },deps);
  assert.equal(audit.mutatedRootProposals,0);
  assert.equal(audit.records[0].physicalRootStateAlias,false);
});

test('all patched native methods restore on an exception',()=>{
  const original=[Store.prototype.dispatch,
    PlaySupporterTactic.prototype.useTactic,SimpleTacticsAi.prototype.decodeNextAction];
  assert.throws(()=>withSupporterProposalStateAudit(()=>{
    throw new Error('Native aborted');
  },deps),/Native aborted/);
  assert.deepEqual([Store.prototype.dispatch,
    PlaySupporterTactic.prototype.useTactic,
    SimpleTacticsAi.prototype.decodeNextAction],original);
});
