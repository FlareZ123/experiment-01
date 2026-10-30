'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {PaperSupporterQuotaError,PaperFirstTurnSupporterError,
  withPaperSupporterQuotaGuard}=
  require('../simulation/twinleaf/paper-supporter-quota-guard.cjs');

const SUPPORTER=7;
class AddPlayerAction{}
class PlayCardAction {
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class Store {
  constructor(){
    this.state={turn:2,players:[{
      id:101,supporterTurn:0,supporter:{cards:[]},hand:{cards:[]}
    },{
      id:202,supporterTurn:0,supporter:{cards:[]},hand:{cards:[
        {fullName:'Cynthia & Caitlin CEC',trainerType:SUPPORTER},
        {fullName:'Sidney FST 241',trainerType:SUPPORTER},
        {fullName:'Battle VIP Pass FST',trainerType:4}
      ]}
    }]};
    this.nativeCalls=0;
  }
  dispatch(action){
    this.nativeCalls++;
    if(action instanceof PlayCardAction){
      const player=this.state.players.find(x=>x.id===action.id);
      const card=player.hand.cards[action.handIndex];
      if(!card)throw new Error('Native invalid hand target');
      player.hand.cards.splice(action.handIndex,1);
      if(card.trainerType===SUPPORTER)player.supporterTurn++;
    }
  }
}

test('native first Supporter and all Items pass unmodified',()=>{
  const original=Store.prototype.dispatch;
  const a=withPaperSupporterQuotaGuard(Store,SUPPORTER,()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(202,0));
    store.dispatch(new PlayCardAction(202,1));
    return store;
  });
  assert.strictEqual(Store.prototype.dispatch,original);
  assert.equal(a.result.state.players[1].supporterTurn,1);
  assert.equal(a.result.nativeCalls,3);
  assert.equal(a.legalSupporterRoots.length,1);
  assert.equal(a.legalSupporterRoots[0].quotaBefore,0);
});

test('second Supporter denied pre-dispatch with physical card preserved',()=>{
  const original=Store.prototype.dispatch;
  let evidence=null,store;
  assert.throws(()=>withPaperSupporterQuotaGuard(Store,SUPPORTER,()=>{
    store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(202,0));
    store.dispatch(new PlayCardAction(202,0));
  },{onViolation:row=>{evidence=row;}}),e=>{
    assert.ok(e instanceof PaperSupporterQuotaError);
    assert.deepEqual(e.violation,evidence);
    return true;
  });
  assert.strictEqual(Store.prototype.dispatch,original);
  assert.equal(store.nativeCalls,2);
  assert.equal(store.state.players[1].supporterTurn,1);
  assert.equal(store.state.players[1].hand.cards[0].fullName,'Sidney FST 241');
  assert.equal(evidence.rootOrdinal,3);
  assert.equal(evidence.quotaBefore,1);
  assert.equal(evidence.rejectedBeforeNativeDispatch,true);
  assert.equal(evidence.handCardPhysicallyPresent,true);
});

test('source-authenticated explicit extra Supporter allowance can override diagnostic guard',()=>{
  const a=withPaperSupporterQuotaGuard(Store,SUPPORTER,()=>{
    const store=new Store();store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(202,0));
    store.dispatch(new PlayCardAction(202,0));
    return store;
  },{allowAdditionalSupporter:({owner,card})=>
    owner.supporterTurn===1&&card.fullName==='Sidney FST 241'});
  assert.equal(a.result.state.players[1].supporterTurn,2);
  assert.equal(a.legalSupporterRoots.length,2);
});

test('guard restoration survives native failure',()=>{
  const original=Store.prototype.dispatch;
  assert.throws(()=>withPaperSupporterQuotaGuard(Store,SUPPORTER,()=>{
    const store=new Store();store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(202,99));
  }),/Native invalid hand target/);
  assert.strictEqual(Store.prototype.dispatch,original);
});

test('other Store instances cannot contaminate the authenticated root',()=>{
  const a=withPaperSupporterQuotaGuard(Store,SUPPORTER,()=>{
    const first=new Store();first.dispatch(new AddPlayerAction());
    const alternate=new Store();
    alternate.state.players[1].supporterTurn=1;
    alternate.dispatch(new PlayCardAction(202,0));
    return {first,alternate};
  });
  assert.equal(a.legalSupporterRoots.length,0);
  assert.equal(a.result.alternate.state.players[1].supporterTurn,2);
});

test('optional first-player opening veto rejects ordinary Supporter before Store',()=>{
  const original=Store.prototype.dispatch;
  let store,violation;
  assert.throws(()=>withPaperSupporterQuotaGuard(Store,SUPPORTER,()=>{
    store=new Store();
    store.state.turn=1;
    store.state.activePlayer=1;
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(202,0));
  },{
    enforceFirstPlayerSupporter:true,
    onViolation:x=>{violation=x;}
  }),error=>{
    assert.ok(error instanceof PaperFirstTurnSupporterError);
    assert.deepEqual(error.violation,violation);
    return true;
  });
  assert.strictEqual(Store.prototype.dispatch,original);
  assert.equal(store.nativeCalls,1);
  assert.equal(store.state.players[1].supporterTurn,0);
  assert.equal(store.state.players[1].hand.cards[0].fullName,
    'Cynthia & Caitlin CEC');
  assert.equal(violation.turn,1);
  assert.equal(violation.seat,1);
  assert.equal(violation.reason,'first-player-ordinary-supporter');
  assert.equal(violation.rejectedBeforeNativeDispatch,true);
});

test('printed first-turn exception requires explicit owner-card authorization',()=>{
  const original=Store.prototype.dispatch;
  const observed=[];
  const a=withPaperSupporterQuotaGuard(Store,SUPPORTER,()=>{
    const store=new Store();
    store.state.turn=1;
    store.state.activePlayer=1;
    store.state.players[1].hand.cards[0]={
      fullName:'Carmine TWM',trainerType:SUPPORTER
    };
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(202,0));
    return store;
  },{
    enforceFirstPlayerSupporter:true,
    allowFirstPlayerSupporter:({owner,card,state})=>{
      observed.push({ownerId:owner.id,card:card.fullName,turn:state.turn});
      return owner.id===202&&card.fullName==='Carmine TWM'&&state.turn===1;
    }
  });
  assert.strictEqual(Store.prototype.dispatch,original);
  assert.deepEqual(observed,[{ownerId:202,card:'Carmine TWM',turn:1}]);
  assert.equal(a.result.nativeCalls,2);
  assert.equal(a.result.state.players[1].supporterTurn,1);
  assert.equal(a.legalSupporterRoots.length,1);
});

test('even first-turn exceptions remain subject to independent Supporter quota',()=>{
  let store;
  assert.throws(()=>withPaperSupporterQuotaGuard(Store,SUPPORTER,()=>{
    store=new Store();
    store.state.turn=1;
    store.state.activePlayer=1;
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(202,0));
    store.dispatch(new PlayCardAction(202,0));
  },{
    enforceFirstPlayerSupporter:true,
    allowFirstPlayerSupporter:()=>true
  }),PaperSupporterQuotaError);
  assert.equal(store.nativeCalls,2);
  assert.equal(store.state.players[1].supporterTurn,1);
  assert.equal(store.state.players[1].hand.cards[0].fullName,'Sidney FST 241');
});

test('first-turn option preserves normal first Supporter on later turns',()=>{
  const a=withPaperSupporterQuotaGuard(Store,SUPPORTER,()=>{
    const store=new Store();
    store.state.turn=2;
    store.state.activePlayer=1;
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(202,0));
    return store;
  },{enforceFirstPlayerSupporter:true});
  assert.equal(a.legalSupporterRoots.length,1);
  assert.equal(a.result.state.players[1].supporterTurn,1);
});
