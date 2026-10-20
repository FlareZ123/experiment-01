'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {withNativePaperSupporterDiscipline,VERSION}=
  require('../simulation/twinleaf/agent41-paper-supporter-discipline.cjs');

const TrainerType={SUPPORTER:7};
const GameLog={LOG_PLAYER_PLAYS_SUPPORTER:42};
class AddPlayerAction {}
class PlayCardAction {
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class AdvanceTurnAction {
  constructor(nextActor){this.nextActor=nextActor;}
}
const supporter=(name)=>({
  name,fullName:name+' TEST',trainerType:TrainerType.SUPPORTER
});
class Store {
  constructor(){
    this.state={
      turn:1,logs:[],players:[
        {id:101,name:'A',supporterTurn:0,hand:{cards:[
          supporter('First A'),supporter('Second A')
        ]},supporter:{cards:[]}},
        {id:202,name:'B',supporterTurn:0,hand:{cards:[
          supporter('First B'),supporter('Second B')
        ]},supporter:{cards:[]}}
      ]
    };
  }
  dispatch(action){
    if(action instanceof AddPlayerAction)return;
    if(action instanceof AdvanceTurnAction){
      this.state.players.find(p=>p.id===action.nextActor).supporterTurn=0;
      this.state.turn++;
      return;
    }
    if(action instanceof PlayCardAction){
      const owner=this.state.players.find(p=>p.id===action.id);
      const card=owner.hand.cards.splice(action.handIndex,1)[0];
      owner.supporter.cards.push(card);
      owner.supporterTurn++;
      this.state.logs.push({
        message:GameLog.LOG_PLAYER_PLAYS_SUPPORTER,
        params:{name:owner.name,card:card.name}
      });
      // Mimic upstream's immediately cleared Supporter play zone.
      owner.supporter.cards.length=0;
    }
  }
}
class PlaySupporterTactic {
  useTactic(state,player){
    return player.hand.cards.length?
      new PlayCardAction(player.id,0):undefined;
  }
}
const deps={Store,TrainerType,GameLog,PlaySupporterTactic};

for(const firstSeat of [0,1]){
  test('both-seat policy prevents extra ordinary Supporter, resets at next owner turn; first seat '+firstSeat,()=>{
    const originalDispatch=Store.prototype.dispatch;
    const originalTactic=PlaySupporterTactic.prototype.useTactic;
    const evidence=withNativePaperSupporterDiscipline(()=>{
      const store=new Store();
      store.dispatch(new AddPlayerAction());
      const actor=store.state.players[firstSeat];
      const tactic=new PlaySupporterTactic();
      const first=tactic.useTactic(store.state,actor);
      assert.ok(first instanceof PlayCardAction);
      store.dispatch(first);
      assert.equal(actor.supporterTurn,1);
      assert.equal(tactic.useTactic(store.state,actor),undefined);
      assert.equal(actor.hand.cards.length,1);
      store.dispatch(new AdvanceTurnAction(actor.id));
      assert.equal(actor.supporterTurn,0);
      const next=tactic.useTactic(store.state,actor);
      assert.ok(next instanceof PlayCardAction);
      store.dispatch(next);
      return store;
    },deps);
    assert.strictEqual(Store.prototype.dispatch,originalDispatch);
    assert.strictEqual(PlaySupporterTactic.prototype.useTactic,originalTactic);
    assert.equal(evidence.audit.version,VERSION);
    assert.equal(evidence.audit.nativeSupporterQuotaQualified,true);
    assert.equal(evidence.audit.legalSupporterRoots.length,2);
    assert.equal(evidence.audit.nativeSupporterEvents.length,2);
    assert.equal(evidence.audit.rootDispatchVetoes.length,0);
    assert.equal(evidence.audit.ownerProposalSuppressions.length,1);
    assert.equal(evidence.audit.ownerProposalSuppressions[0].seat,firstSeat);
    assert.equal(evidence.result.state.players[firstSeat].supporterTurn,1);
  });
}

test('native root bypass is vetoed before hand, log, or quota changes',()=>{
  const originalDispatch=Store.prototype.dispatch;
  const originalTactic=PlaySupporterTactic.prototype.useTactic;
  let store;
  assert.throws(()=>withNativePaperSupporterDiscipline(()=>{
    store=new Store();store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(101,0));
    store.dispatch(new PlayCardAction(101,0));
  },deps),error=>{
    assert.match(error.message,/PAPER_SUPPORTER_QUOTA_VIOLATION/);
    assert.equal(error.paperSupporterQuotaEvidence.nativeSupporterQuotaQualified,false);
    assert.equal(error.paperSupporterQuotaEvidence.rootDispatchVetoes.length,1);
    assert.equal(error.paperSupporterQuotaEvidence.rootDispatchVetoes[0].seat,0);
    return true;
  });
  assert.strictEqual(Store.prototype.dispatch,originalDispatch);
  assert.strictEqual(PlaySupporterTactic.prototype.useTactic,originalTactic);
  assert.equal(store.state.players[0].supporterTurn,1);
  assert.deepEqual(store.state.players[0].hand.cards.map(card=>card.name),['Second A']);
  assert.equal(store.state.logs.length,1);
});

test('source exceptions must pass the same card-aware native guard',()=>{
  let store;
  const allowance=({owner,card,phase})=>phase==='bot-proposal'?
    owner.id===202:owner.id===202&&card?.name==='Second B';
  const observed=withNativePaperSupporterDiscipline(()=>{
    store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(202,0));
    const proposed=new PlaySupporterTactic().useTactic(
      store.state,store.state.players[1]);
    assert.ok(proposed);
    store.dispatch(proposed);
    return store;
  },{...deps,allowAdditionalSupporter:allowance});
  assert.equal(observed.audit.nativeSameTurnSecondSupporters.length,1);
  assert.equal(observed.audit.nativeSupporterQuotaQualified,false,
    'ordinary quota evidence remains unqualified until exception semantics are separately verified');
});
