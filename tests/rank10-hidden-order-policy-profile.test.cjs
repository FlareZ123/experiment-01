'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {sourcePolicyForOrdinal,withRootDispatchCounter}=require('../simulation/twinleaf/rank10-hidden-order-live-probe.cjs');

test('archived root uses historical v3 and turn 2 uses current v4',()=>{
  assert.deepEqual(sourcePolicyForOrdinal(),{
    doubleDragonRecovery:true,doubleDragonArchiveV3:false
  });
  assert.deepEqual(sourcePolicyForOrdinal(215),{
    doubleDragonRecovery:true,doubleDragonArchiveV3:true,
    mimikyuApexTimelessPolicy:true,mimikyuApexTimelessPolicySeat:1,
    mimikyuTurn27SetupSeat:1
  });
  assert.throws(()=>sourcePolicyForOrdinal(216));
});

test('K1 whole-deck-search evidence is scoped to observed actor seat',()=>{
  class AddPlayerAction {}
  class ChooseCardsPrompt {
    constructor(owner) {
      this.id=17;this.playerId=owner.id;
      this.cards=owner.deck;this.result=undefined;
    }
  }
  class Store {
    constructor() {
      this.state={turn:2,prompts:[],players:[
        {id:101,deck:{cards:[]}},
        {id:202,deck:{cards:[]}}
      ]};
    }
    dispatch(action) {
      if(action==='search-seat0')
        this.state.prompts.push(new ChooseCardsPrompt(this.state.players[0]));
      return null;
    }
  }
  const seen=withRootDispatchCounter(Store,(ordinal,searches)=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch('search-seat0');
    assert.equal(ordinal(),2);
    return searches();
  },0);
  assert.equal(seen.observedWholeOwnerDeckSearches,1);
  assert.deepEqual(seen.first,{ordinal:2,turn:2});
});

test('root-boundary digest is captured once from the actual Store state',()=>{
  class AddPlayerAction {}
  class OtherAction {}
  class Store {
    constructor(){this.state={turn:2,activePlayer:0,prompts:[]};}
    dispatch(action){this.state.turn+=action instanceof OtherAction?1:0;}
  }
  let seen=0;
  const out=withRootDispatchCounter(Store,(ordinal,searches,boundary)=>{
    const physical=new Store();
    physical.dispatch(new AddPlayerAction());
    physical.dispatch(new OtherAction());
    const shadow=new Store();
    shadow.dispatch(new OtherAction());
    assert.equal(ordinal(),2);
    return boundary();
  },0,1,state=>{seen++;return 'source-turn-'+state.turn;},
    state=>'history-turn-'+state.turn);
  assert.equal(seen,1);
  assert.deepEqual(out,{
    rootStep:1,turn:2,activePlayer:0,dispatchedAction:'OtherAction',
    zoneDigestBefore:'source-turn-2',
    continuityDigestBefore:'history-turn-2',unresolvedPromptTypes:[]
  });
});
