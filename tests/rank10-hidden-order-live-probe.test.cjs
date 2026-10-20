'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {compareHiddenDeckOrders,withRootHiddenOrderProbe,withRootDispatchCounter}=
  require('../simulation/twinleaf/rank10-hidden-order-live-probe.cjs');

function state() {
  return {
    turn:27,activePlayer:1,prompts:[],
    players:[
      {id:101,deck:{cards:[{fullName:'Opponent'}]}},
      {id:202,deck:{cards:[
        {fullName:'A',id:10},{fullName:'B',id:20}
      ]}}
    ]
  };
}
class FakeBot {
  constructor(client,options,deck) {
    this.client=client;
    this.tactics=[{options:options??{}}];
    this.deck=deck??null;
  }
  decodeNextAction(source) {
    return {top:source.players[1].deck.cards[0].fullName,
      random:Math.random()<0.5?'L':'R'};
  }
}

test('hidden deck reorder is detectable without altering live State or global PRNG',()=>{
  const physical=state(),before=structuredClone(physical);
  const originalRandom=Math.random;
  const result=compareHiddenDeckOrders(
    physical,202,
    ()=>new FakeBot({id:202},{}),
    structuredClone,
    ()=>()=>0.25
  );
  assert.equal(result.deckCards,2);
  assert.equal(result.actionSensitiveToHiddenDeckOrder,true);
  assert.equal(result.physicalOrder.data,'{"top":"A","random":"L"}');
  assert.equal(result.reversedOrder.data,'{"top":"B","random":"L"}');
  assert.equal(result.liveStatePreserved,true);
  assert.deepEqual(physical,before);
  assert.strictEqual(Math.random,originalRandom);
  assert.equal(result.knownDeckMembershipVerified,false);
});

test('source decision wrapper runs ordinary bot action after matched exploratory worlds',()=>{
  const physical=state();
  const original=FakeBot.prototype.decodeNextAction;
  const result=withRootHiddenOrderProbe(FakeBot,
    ()=>new FakeBot({id:202},{}).decodeNextAction(physical),
    structuredClone,
    {turn:27,seat:1,makeRandom:()=>()=>0.25}
  );
  assert.equal(result.events.length,1);
  assert.equal(result.events[0].actionSensitiveToHiddenDeckOrder,true);
  assert.equal(result.result.top,'A');
  assert.equal(result.events[0].liveStatePreserved,true);
  assert.strictEqual(FakeBot.prototype.decodeNextAction,original);
});

test('source decision wrapper restores original method if detached-state checks fail',()=>{
  const physical=state(),original=FakeBot.prototype.decodeNextAction;
  assert.throws(()=>withRootHiddenOrderProbe(
    FakeBot,()=>new FakeBot({id:202},{}).decodeNextAction(physical),
    ()=>{throw Error('clone preflight failed')},
    {turn:27,seat:1,makeRandom:()=>()=>0.25}
  ),/clone preflight failed/);
  assert.strictEqual(FakeBot.prototype.decodeNextAction,original);
});

test('only root-Store dispatches advance the source action ordinal',()=>{
  class AddPlayerAction{}
  class Store {
    dispatch(action){return action.constructor.name;}
  }
  const original=Store.prototype.dispatch;
  const count=withRootDispatchCounter(Store,getOrdinal=>{
    const root=new Store(),hypothetical=new Store();
    assert.equal(root.dispatch(new AddPlayerAction()),'AddPlayerAction');
    assert.equal(getOrdinal(),1);
    hypothetical.dispatch({kind:'speculative'});
    assert.equal(getOrdinal(),1);
    root.dispatch({kind:'live'});
    assert.equal(getOrdinal(),2);
    return getOrdinal();
  });
  assert.equal(count,2);
  assert.strictEqual(Store.prototype.dispatch,original);
});

test('decisive root ordinal gates the detached probe after routine same-turn actions',()=>{
  const physical=state();
  physical.turn=28;
  let ordinal=214;
  const original=FakeBot.prototype.decodeNextAction;
  const observed=withRootHiddenOrderProbe(
    FakeBot,()=>{
      const bot=new FakeBot({id:202},{});
      const earlier=bot.decodeNextAction(physical);
      ordinal=215;
      const decisive=bot.decodeNextAction(physical);
      return {earlier,decisive};
    },
    structuredClone,{
      turn:28,seat:1,rootActionOrdinal:215,
      readRootDispatchCount:()=>ordinal,makeRandom:()=>()=>0.25
    }
  );
  assert.equal(observed.events.length,1);
  assert.equal(observed.events[0].rootActionOrdinal,215);
  assert.equal(observed.events[0].actionSensitiveToHiddenDeckOrder,true);
  assert.equal(observed.result.earlier.top,'A');
  assert.equal(observed.result.decisive.top,'A');
  assert.strictEqual(FakeBot.prototype.decodeNextAction,original);
});

test('live owner deck-search observation proves a K1 prompt without speculative leakage',()=>{
  class AddPlayerAction{}
  class ChooseCardsPrompt {
    constructor(player){this.id=15;this.playerId=player.id;
      this.cards=player.deck;this.result=undefined;}
  }
  class Store {
    constructor(){this.state={turn:3,players:[
      {id:101,deck:{cards:[]}},
      {id:202,deck:{cards:[{fullName:'X'}]}}
    ],prompts:[]};}
    dispatch(action){
      if(action.kind==='create-search')this.state.prompts=[
        new ChooseCardsPrompt(this.state.players[1])];
      return action.kind??action.constructor.name;
    }
  }
  const original=Store.prototype.dispatch;
  const evidence=withRootDispatchCounter(Store,(getOrdinal,getSearches)=>{
    const root=new Store(),sim=new Store();
    root.dispatch(new AddPlayerAction());
    sim.dispatch({kind:'create-search'});
    assert.equal(getSearches().observedWholeOwnerDeckSearches,0);
    root.dispatch({kind:'create-search'});
    assert.deepEqual(getSearches(),{
      observedWholeOwnerDeckSearches:1,
      first:{ordinal:2,turn:3},last:{ordinal:2,turn:3}
    });
    root.dispatch({kind:'repeat-prompt'});
    assert.equal(getSearches().observedWholeOwnerDeckSearches,1);
    return getSearches();
  });
  assert.equal(evidence.observedWholeOwnerDeckSearches,1);
  assert.strictEqual(Store.prototype.dispatch,original);
});


test('root-step boundary is observed even when no AI callback is made',()=>{
  class AddPlayerAction{}
  class PlayCardAction{}
  class Store{
    constructor(){this.state={turn:2,activePlayer:0,prompts:[],players:[
      {id:101,deck:{cards:[]}},{id:202,deck:{cards:[]}}
    ]}}
    dispatch(action){return action.constructor.name}
  }
  const evidence=withRootDispatchCounter(Store,(getOrdinal,getSearches,getBoundary)=>{
    const source=new Store();
    source.dispatch(new AddPlayerAction());
    source.dispatch(new PlayCardAction());
    assert.equal(getOrdinal(),2);
    return getBoundary();
  },0,1);
  assert.deepEqual(evidence,{
    rootStep:1,turn:2,activePlayer:0,
    dispatchedAction:'PlayCardAction',unresolvedPromptTypes:[]
  });
});


test('detached baseline parity is attested for a reproducible root policy',()=>{
  class FixedBot extends FakeBot {
    decodeNextAction(world) {
      return {top:world.players[1].deck.cards[0].fullName};
    }
  }
  const physical=state();
  const out=withRootHiddenOrderProbe(FixedBot,
    ()=>new FixedBot({id:202},{}).decodeNextAction(physical),
    structuredClone,{turn:27,seat:1,makeRandom:()=>()=>0.25});
  assert.equal(out.events.length,1);
  assert.equal(out.events[0].baselineActionMatchedActual,true);
  assert.equal(out.events[0].sourceDecisionSensitivityInterpretable,true);
  assert.equal(out.events[0].actionSensitiveToHiddenDeckOrder,true);
});

test('fresh reconstructed bot history mismatch fails source interpretation',()=>{
  class StatefulBot extends FakeBot {
    constructor(...args) {
      super(...args);
      this.calls=0;
    }
    decodeNextAction() {
      this.calls++;
      return {call:this.calls};
    }
  }
  const physical=state(),bot=new StatefulBot({id:202},{});
  bot.decodeNextAction(physical);
  const before=structuredClone(physical);
  const out=withRootHiddenOrderProbe(StatefulBot,
    ()=>bot.decodeNextAction(physical),
    structuredClone,{turn:27,seat:1,makeRandom:()=>()=>0.25});
  assert.equal(out.events.length,1);
  assert.equal(out.events[0].physicalOrder.data,'{"call":1}');
  assert.equal(out.events[0].originalSourceAction.data,'{"call":2}');
  assert.equal(out.events[0].baselineActionMatchedActual,false);
  assert.equal(out.events[0].sourceDecisionSensitivityInterpretable,false);
  assert.deepEqual(physical,before);
});

// Preserve the shared owner's bilateral information-boundary regressions in
// the existing manually dispatched pinned hidden-information CI suite.
require('./agent50-bilateral-hidden-order-audit.test.cjs');


test('isolated world policy encloses bot construction and scoring independently',()=>{
  const physical=state(),before=structuredClone(physical);
  const originalRandom=Math.random;
  let policyIsActive=false,enteredWorlds=0,constructedBots=0;
  const worldPolicy=work=>{
    assert.equal(policyIsActive,false,'World policy contexts cannot nest');
    policyIsActive=true;
    enteredWorlds++;
    try{return work();}
    finally{policyIsActive=false;}
  };
  const compared=compareHiddenDeckOrders(
    physical,202,
    ()=>{
      assert.equal(policyIsActive,true,
        'Policy must be installed before constructing any world bot');
      constructedBots++;
      return new FakeBot({id:202},{});
    },
    structuredClone,()=>()=>0.25,worldPolicy
  );
  assert.equal(enteredWorlds,2);
  assert.equal(constructedBots,2);
  assert.equal(policyIsActive,false);
  assert.equal(compared.actionSensitiveToHiddenDeckOrder,true);
  assert.equal(compared.physicalOrder.data,'{"top":"A","random":"L"}');
  assert.equal(compared.reversedOrder.data,'{"top":"B","random":"L"}');
  assert.deepEqual(physical,before);
  assert.strictEqual(Math.random,originalRandom);
});
