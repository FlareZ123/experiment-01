'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {withLateOwnerRootPhysicalAudit,LILLIE}=
  require('../simulation/twinleaf/agent7-late-owner-root-physical-audit.cjs');

class AddPlayerAction{}
class PassTurnAction{
  constructor(clientId){this.clientId=clientId;}
}
class PlayCardAction{
  constructor(clientId,handIndex){this.clientId=clientId;this.handIndex=handIndex;}
}
class ResolvePromptAction{
  constructor(id){this.id=id;}
}
class Store{
  constructor(state){this.state=state;this.calls=0;}
  dispatch(action){
    this.calls++;
    if(action?.reject)throw new Error('native reject');
    return action?.constructor?.name;
  }
}

/** @param {number} deckCount @param {number} turn */
function state(deckCount=2,turn=30){
  const cards=n=>Array.from({length:n},(_,i)=>({fullName:'Card '+i}));
  return {
    turn,activePlayer:0,prompts:[],
    players:[
      {id:'owner',hand:{cards:[{fullName:LILLIE},{fullName:'Ace Trainer AOR'}]},
       deck:{cards:cards(deckCount)},supporterTurn:0,
       prizes:[{cards:[1]},{cards:[1]},{cards:[]}]},
      {id:'source',hand:{cards:[{fullName:'PRIVATE OPPONENT CARD'}]},
       deck:{cards:cards(25)},supporterTurn:0,prizes:[]}
    ]
  };
}
const trial={id:'original-deal:champion',candidateSlot:'A'};

test('captures a held Lillie on a genuine late non-Pass root, owner only',()=>{
  const prior=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const st=new Store(state(0,40));
  const observed=withLateOwnerRootPhysicalAudit(()=>{
    st.dispatch(new AddPlayerAction());
    st.dispatch(new PlayCardAction('owner',1));
    st.dispatch(new PassTurnAction('owner'));
    return 'unchanged';
  },[trial],{Store});
  assert.equal(observed.result,'unchanged');
  assert.equal(observed.audit.realGameCount,1);
  const row=observed.audit.rows[0];
  assert.equal(row.candidateDeckZeroSeen,true);
  assert.equal(row.candidateDeckZeroFirstDispatch.heldLillie,1);
  assert.equal(row.observedOwnerRoots,2);
  assert.deepEqual(row.lateRootEvents.map(e=>e.actionKind),
    ['PlayCardAction','PassTurnAction']);
  assert.equal(row.lateRootEvents[0].ownerDeckCount,0);
  assert.equal(row.lateRootEvents[0].heldLillieCount,1);
  assert.equal(row.lateRootEvents[0].selectedCard,'Ace Trainer AOR');
  assert.equal(row.lateRootEvents[0].nativeAccepted,true);
  assert.ok(!JSON.stringify(observed.audit).includes('PRIVATE OPPONENT CARD'));
  assert.strictEqual(Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch').value,prior.value);
});

test('filters opponent decisions, unresolved prompts and pre-window actions',()=>{
  const s=state(21,5),st=new Store(s);
  const observed=withLateOwnerRootPhysicalAudit(()=>{
    st.dispatch(new AddPlayerAction());
    st.dispatch(new PassTurnAction('owner'));
    s.turn=16;
    s.activePlayer=1;
    st.dispatch(new PlayCardAction('source',0));
    s.activePlayer=0;
    s.prompts=[{id:9,result:undefined}];
    st.dispatch(new PassTurnAction('owner'));
    st.dispatch(new ResolvePromptAction(9));
    s.prompts=[];
    st.dispatch(new PassTurnAction('owner'));
  },[trial],{Store});
  const row=observed.audit.rows[0];
  assert.equal(row.observedOwnerRoots,1);
  assert.equal(row.lateRootEvents[0].actionKind,'PassTurnAction');
  assert.equal(row.candidateDeckZeroSeen,false);
});

test('records native rejected action without swallowing the error and restores',()=>{
  const st=new Store(state(0,42));
  const prior=Store.prototype.dispatch;
  assert.throws(()=>withLateOwnerRootPhysicalAudit(()=>{
    st.dispatch(new AddPlayerAction());
    const a=new PlayCardAction('owner',0);
    a.reject=true;
    st.dispatch(a);
  },[trial],{Store}),/native reject/);
  assert.strictEqual(Store.prototype.dispatch,prior);
});

test('pairs distinct native Store instances to the registered physical seat',()=>{
  const a=new Store(state(1,31));
  const bState=state(3,32);
  bState.activePlayer=1;
  bState.players[1].id='source-own';
  const b=new Store(bState);
  const paired=[
    trial,{id:'original-deal:newmoon',candidateSlot:'B'}
  ];
  const observed=withLateOwnerRootPhysicalAudit(()=>{
    a.dispatch(new AddPlayerAction());
    a.dispatch(new PassTurnAction('owner'));
    b.dispatch(new AddPlayerAction());
    b.dispatch(new PassTurnAction('source-own'));
  },paired,{Store});
  assert.deepEqual(observed.audit.rows.map(r=>r.observedOwnerRoots),[1,1]);
  assert.deepEqual(observed.audit.rows.map(r=>r.candidateSeat),[0,1]);
  assert.equal(observed.audit.realGameCount,2);
});

test('requires exact count of real game instances and restores',()=>{
  const prior=Store.prototype.dispatch;
  assert.throws(()=>withLateOwnerRootPhysicalAudit(()=>null,[trial],{Store}),
    /Every registered trial/);
  assert.strictEqual(Store.prototype.dispatch,prior);
});
