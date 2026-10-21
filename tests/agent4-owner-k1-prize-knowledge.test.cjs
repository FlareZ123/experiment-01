'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  captureOwnerK1, advanceOwnerK1, assessRequiredDeckPrinting,
  knownOutsideDeck
} = require('../simulation/twinleaf/owner-k1-prize-knowledge.cjs');

const THUNDER = 'Thunder Mountain Prism Star LOT';
const HAND = Array.from({length:7}, (_, i) => 'Hand '+i);
const DECK = Array.from({length:46}, (_, i) => 'Deck '+i);
const PRIZES = Array.from({length:6}, (_, i) => 'Prize '+i);
const REGISTERED = Object.freeze([...HAND, ...DECK, ...PRIZES, THUNDER]);

/** @param {boolean} thunderInDeck @param {0|1} ownerSeat */
function ownerSearch(thunderInDeck, ownerSeat = 0) {
  class ChooseCardsPrompt {}
  const deck = {cards: [...DECK, thunderInDeck ? THUNDER : PRIZES[0]]
    .map(fullName => ({fullName}))};
  const owner = {
    id: 42 + ownerSeat, deck,
    prizes: Array.from({length:6}, () => ({cards:[{}]}))
  };
  const enemy = {id: 99 - ownerSeat,
    deck: new Proxy({}, {get(){throw Error('Opposing deck accessed');}})};
  const players = ownerSeat === 0 ? [owner,enemy] : [enemy,owner];
  const prompt = new ChooseCardsPrompt();
  Object.assign(prompt, {playerId:owner.id,id:12,cards:deck,
    result:undefined});
  const state={turn:3,players,prompts:[prompt]};
  const view = {
    actorSeat:ownerSeat,decisionKind:'owner-prompt',
    pendingOwnerDeckSearch:true,ownHand:[...HAND],
    ownPublic:{prizeCount:6,stadium:[],discard:[],lostZone:[],
      resolvingSupporter:[],active:null,bench:[null,null,null,null,null]},
    opponentPublic:{handCount:6}
  };
  return {state,view,owner,prompt};
}

test('owner first search preserves K0 and infers a genuinely Prized singleton',()=>{
  for(const seat of [0,1]){
    const {state,view,prompt}=ownerSearch(false,seat);
    state.prompts=[];
    assert.throws(()=>captureOwnerK1(state,seat,REGISTERED,null,()=>view),
      /ChooseCardsPrompt/);
    state.prompts=[prompt];
    const k1=captureOwnerK1(state,seat,REGISTERED,null,()=>view);
    assert.equal(k1.epoch,1);
    assert.equal(k1.prizeInferenceCertified,true);
    assert.equal(k1.knownPrized.find(x=>x.printing===THUNDER).copies,1);
    assert.equal(assessRequiredDeckPrinting(k1,THUNDER),'known-prized');
    assert.equal(assessRequiredDeckPrinting(null,THUNDER),'unknown');
    assert.equal(k1.knownPrintings.some(x=>x.printing===THUNDER),false);
  }
});

test('source deck actually containing singleton prevents false Prize veto',()=>{
  const {state,view}=ownerSearch(true);
  const k1=captureOwnerK1(state,0,REGISTERED,null,()=>view);
  assert.equal(k1.prizeInferenceCertified,true);
  assert.equal(k1.knownPrintings.some(x=>x.printing===THUNDER),true);
  assert.equal(assessRequiredDeckPrinting(k1,THUNDER),'unknown');
  assert.equal(k1.knownPrized.find(x=>x.printing===PRIZES[0]).copies,1);
  const dualRegistered=[...REGISTERED];
  dualRegistered[dualRegistered.indexOf(PRIZES[1])]=THUNDER;
  const dual=captureOwnerK1(state,0,dualRegistered,null,()=>view);
  assert.equal(dual.prizeInferenceCertified,true);
  assert.equal(dual.knownPrized.find(x=>x.printing===THUNDER)?.copies,1);
  assert.equal(dual.registeredPrintings.find(x=>x.printing===THUNDER)?.copies,2);
  assert.equal(assessRequiredDeckPrinting(dual,THUNDER),'unknown');
});

test('opponent secrets and hidden deck order cannot affect owner's K1 evidence',()=>{
  const source=ownerSearch(false);
  const before=captureOwnerK1(source.state,0,REGISTERED,null,()=>source.view);
  source.state.players[1].hiddenHand=['secret variant'];
  source.state.players[1].prizes=[{cards:[{fullName:'Forbidden'}]}];
  source.state.players[0].deck.cards.reverse();
  source.view.opponentPublic.hiddenHand=['different concealed hand'];
  const after=captureOwnerK1(source.state,0,REGISTERED,null,()=>source.view);
  assert.deepEqual(before.knownPrintings,after.knownPrintings);
  assert.deepEqual(before.knownPrized,after.knownPrized);
});

test('missing owner zone forces fail-closed unknown Prize composition',()=>{
  const {state,view}=ownerSearch(false);
  view.ownHand.pop();
  const incomplete=captureOwnerK1(state,0,REGISTERED,null,()=>view);
  assert.equal(incomplete.prizeInferenceCertified,false);
  assert.equal(incomplete.knownPrized,null);
  assert.equal(assessRequiredDeckPrinting(incomplete,THUNDER),'unknown');
});

test('deck draw stales deck membership; Prize taking or swap invalidates Prize belief',()=>{
  const {state,view}=ownerSearch(false);
  const original=captureOwnerK1(state,0,REGISTERED,null,()=>view);
  assert.strictEqual(advanceOwnerK1(original,{currentOwnPrizeCount:6,
    deckMayHaveChanged:false,prizeCompositionMayHaveChanged:false}),original);
  const moved=advanceOwnerK1(original,{currentOwnPrizeCount:6,
    deckMayHaveChanged:true,prizeCompositionMayHaveChanged:false});
  assert.equal(moved.exactMembershipKnown,false);
  assert.equal(assessRequiredDeckPrinting(moved,THUNDER),'known-prized');
  const taken=advanceOwnerK1(moved,{currentOwnPrizeCount:5,
    deckMayHaveChanged:false,prizeCompositionMayHaveChanged:false});
  assert.equal(taken.prizeInferenceCertified,false);
  assert.equal(taken.exactMembershipKnown,false);
  assert.equal(assessRequiredDeckPrinting(taken,THUNDER),'unknown');
  const swapped=advanceOwnerK1(original,{currentOwnPrizeCount:6,
    deckMayHaveChanged:false,prizeCompositionMayHaveChanged:true});
  assert.equal(swapped.prizeInferenceCertified,false);
  assert.equal(assessRequiredDeckPrinting(swapped,THUNDER),'unknown');
  assert.throws(()=>advanceOwnerK1(original,{currentOwnPrizeCount:6,
    deckMayHaveChanged:false}),/boolean/);
});

test('wrong owner, a copied deck zone or prompt mismatch blocks deck access',()=>{
  const {state,view,prompt,owner}=ownerSearch(false);
  assert.throws(()=>captureOwnerK1(state,1,REGISTERED,null,()=>view),
    /ChooseCardsPrompt/);
  prompt.cards={cards:owner.deck.cards};
  assert.throws(()=>captureOwnerK1(state,0,REGISTERED,null,()=>view),
    /ChooseCardsPrompt/);
  prompt.cards=owner.deck;
  view.pendingOwnerDeckSearch=false;
  assert.throws(()=>captureOwnerK1(state,0,REGISTERED,null,()=>view));
});

test('evolution layers, Tools, Energy and resolving Supporter count in owner zones',()=>{
  const pokemon={
    evolutionPrintings:['Basic SET','Stage1 SET'],
    energies:['Psychic Energy MEE'],tools:['Stealthy Hood UNB']
  };
  const view={ownHand:['Canceling Cologne ASR'],ownPublic:{
    active:pokemon,bench:[null,pokemon],
    stadium:['Risky Ruins MEG'],discard:['Ultra Ball SUM'],
    lostZone:['Tapu Koko Prism Star TEU'],
    resolvingSupporter:['Guzma & Hala CEC']
  }};
  const zones=knownOutsideDeck(view);
  assert.equal(zones.filter(s=>s==='Stealthy Hood UNB').length,2);
  assert.ok(zones.includes('Basic SET'));
  assert.ok(zones.includes('Tapu Koko Prism Star TEU'));
});
