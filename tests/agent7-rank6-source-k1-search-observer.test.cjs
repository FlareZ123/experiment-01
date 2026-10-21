'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  sourceK1SearchSnapshot,withSourceOwnerK1SearchObserver
}=require('../simulation/twinleaf/agent7-rank6-source-k1-search-observer.cjs');

/** @param {string} name @returns {object} */
const card=name=>({name,fullName:name+' TEST'});

/** Build an authentic-shape owner search fixture without exposing prizes. */
function fixture({missingDce=false,validPair=true}={}) {
  const deckCards=[card('Thunder Mountain Prism Star'),
    ...(missingDce?[]:[card('Double Colorless Energy')])];
  const owner={
    id:'source-actor',
    hand:{cards:[card('Iron Thorns ex')]},
    deck:{cards:deckCards},
    discard:{cards:[]},
    lostzone:{cards:[]},
    supporter:{cards:[card('Guzma & Hala')]},
    active:{energies:{cards:[]}},
    bench:Array.from({length:5},()=>({energies:{cards:[]}})),
    stadium:{cards:[]}
  };
  Object.defineProperty(owner,'prizes',{get(){
    throw new Error('Hidden Prize zone must never be read by K1 owner observer');
  }});
  class ChooseCardsPrompt {
    constructor() {
      this.id='guzma-search';
      this.cards=owner.deck;
      this.playerId=owner.id;
      this.message='CHOOSE_CARD_TO_HAND';
      this.result=undefined;
    }
    validate(cards) {
      return cards.length===(validPair?2:3)&&
        cards.every(c=>this.cards.cards.includes(c));
    }
  }
  const prompt=new ChooseCardsPrompt();
  const state={players:[owner,{id:'opponent'}],activePlayer:0,
    turn:3,prompts:[prompt]};
  const observe=()=>({
    decisionKind:'owner-prompt',pendingOwnerDeckSearch:true,
    ownHand:['Iron Thorns ex TEST'],
    ownPublic:{active:{printing:'Iron Thorns ex TEST'}}
  });
  return {state,prompt,owner,observe};
}

test('native pair-validity and target absence are independent K1 facts',()=>{
  const yes=fixture();
  const v=sourceK1SearchSnapshot(yes.state,0,yes.prompt,yes.observe);
  assert.equal(v.bothTargetsAvailableInOwnerDeck,true);
  assert.equal(v.intendedPairNativePromptValid,true);
  assert.equal(v.prizeIdentitiesInspected,false);
  assert.equal(v.opponentConcealedIdentitiesInspected,false);
  assert.deepEqual(v.resolvingSupporters,['Guzma & Hala']);

  const pairRejected=fixture({validPair:false});
  const j=sourceK1SearchSnapshot(pairRejected.state,0,
    pairRejected.prompt,pairRejected.observe);
  assert.equal(j.bothTargetsAvailableInOwnerDeck,true);
  assert.equal(j.intendedPairNativePromptValid,false);

  const missing=fixture({missingDce:true});
  const m=sourceK1SearchSnapshot(missing.state,0,
    missing.prompt,missing.observe);
  assert.equal(m.bothTargetsAvailableInOwnerDeck,false);
  assert.equal(m.intendedPairNativePromptValid,null);
  assert.equal(m.expectedTargets[1].ownerDeck,0);
});

test('the read-only live Store owner hook restores methods without changing action',()=>{
  const data=fixture();
  class Store {
    constructor(state){this.state=state;}
    dispatch(action){return action;}
  }
  class SimpleTacticsAi {
    constructor(){this.client={id:'source-actor'};}
    decodeNextAction(){return 'original-bot-decision';}
  }
  class AddPlayerAction {}
  const priorBot=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,
    'decodeNextAction');
  const priorStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const observed=withSourceOwnerK1SearchObserver(()=>{
    const store=new Store(data.state), bot=new SimpleTacticsAi();
    store.dispatch(new AddPlayerAction());
    assert.equal(bot.decodeNextAction(store.state),'original-bot-decision');
    assert.equal(bot.decodeNextAction(store.state),'original-bot-decision');
    return 'original-execution-result';
  },{sourceSeat:0,sourceTurn:3,SimpleTacticsAi,Store,
    observe:(state,seat,prompt)=>
      sourceK1SearchSnapshot(state,seat,prompt,data.observe)});
  assert.equal(observed.result,'original-execution-result');
  assert.equal(observed.audit.authenticPromptsSeen,1);
  assert.equal(observed.audit.expectedGuzmaHalaSearches,1);
  assert.equal(observed.audit.decisionChanges,0);
  assert.equal(observed.audit.storeDispatchChanges,0);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction'),priorBot);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch'),priorStore);
});

test('genuine owner K1 snapshot records source one-unit Energy without Prize reads',()=>{
  const data=fixture({missingDce:true});
  data.owner.deck.cards.push(card('Speed Lightning Energy'));
  data.owner.deck.cards.push(card('Capture Energy'));
  data.owner.hand.cards.push(card('Spiky Energy'));
  data.owner.active.energies.cards.push(card('Capture Energy'));
  data.owner.discard.cards.push(card('Speed Lightning Energy'));
  const snapshot=sourceK1SearchSnapshot(
    data.state,0,data.prompt,data.observe);
  assert.equal(snapshot.expectedTargets[1].ownerDeck,0);
  assert.deepEqual(snapshot.oneUnitEnergyTargets.map(x=>x.name),[
    'Speed Lightning Energy','Capture Energy','Spiky Energy'
  ]);
  assert.equal(snapshot.oneUnitEnergyTargets[0].ownerDeck,1);
  assert.equal(snapshot.oneUnitEnergyTargets[0].ownerDiscard,1);
  assert.equal(snapshot.oneUnitEnergyTargets[1].ownerDeck,1);
  assert.equal(snapshot.oneUnitEnergyTargets[1].ownerActiveAttached,1);
  assert.equal(snapshot.oneUnitEnergyTargets[2].ownerHand,1);
  assert.equal(snapshot.prizeIdentitiesInspected,false);
  assert.equal(snapshot.opponentConcealedIdentitiesInspected,false);
});

test('K1 native G&H validates Stadium plus one-unit Special Energy without Prize lookup',()=>{
  const source=fixture();
  for(const name of ['Speed Lightning Energy','Capture Energy','Spiky Energy']){
    source.owner.deck.cards.push(card(name));
  }
  const snapshot=sourceK1SearchSnapshot(
    source.state,0,source.prompt,source.observe);
  assert.equal(snapshot.intendedPairNativePromptValid,true);
  assert.equal(snapshot.oneUnitEnergyTargets.length,3);
  assert.deepEqual(snapshot.oneUnitEnergyTargets.map(x=>
    x.pairedThunderSearchNativeValid),[true,true,true]);
  assert.equal(snapshot.prizeIdentitiesInspected,false);

  const refused=fixture({validPair:false});
  refused.owner.deck.cards.push(card('Speed Lightning Energy'));
  const negative=sourceK1SearchSnapshot(refused.state,0,
    refused.prompt,refused.observe);
  assert.deepEqual(negative.oneUnitEnergyTargets.map(x=>
    x.pairedThunderSearchNativeValid),[false,null,null]);

  const noThunder=fixture();
  noThunder.owner.deck.cards.splice(0,1);
  noThunder.owner.deck.cards.push(card('Speed Lightning Energy'));
  const absent=sourceK1SearchSnapshot(noThunder.state,0,
    noThunder.prompt,noThunder.observe);
  assert.equal(absent.oneUnitEnergyTargets[0].pairedThunderSearchNativeValid,null);
});
