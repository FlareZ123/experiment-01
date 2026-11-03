'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {withOwnerCompressorPromptCustody} =
  require('../simulation/twinleaf/agent1-compressor-prompt-custody.cjs');

class AddPlayerAction {}
class PlayCardAction {
  constructor(id, handIndex) {this.id = id;this.handIndex = handIndex;}
}
class ResolvePromptAction {
  constructor(id, result) {this.id = id;this.result = result;}
}
class ChooseCardsPrompt {
  constructor(player, id) {
    this.player = player;this.id = id;this.cards = player.deck;
    this.result = undefined;
  }
  validate(cards) {return cards.length <= 3 &&
    cards.every(card => this.cards.cards.includes(card));}
}
function makeSource(sourceSeat) {
  const cards = [{name:'Counter Energy',fullName:'Counter Energy CIN',id:1},
    {name:'Reversal Energy',fullName:'Reversal Energy PAL',id:2},
    {name:'Crispin',fullName:'Crispin SCR',id:3}];
  const owner = {id: 1234,hand:{cards:[{name:'Battle Compressor',
    fullName:'Battle Compressor PHF',id:9}]},
    deck:{cards},discard:{cards:[]}};
  const other = {id: 4321,get deck(){throw Error('Opponent deck read');},
    get hand(){throw Error('Opponent hand read');}};
  const players = sourceSeat === 0 ? [owner,other] : [other,owner];
  class Store {
    constructor() {this.state={turn:1,players,prompts:[]};}
    dispatch(action) {
      if (action instanceof PlayCardAction) {
        if (action.id !== owner.id) return this.state;
        const original=owner.hand.cards.splice(action.handIndex,1)[0];
        owner.supporter={cards:[original]};
        this.state.prompts.push(new ChooseCardsPrompt(owner,44));
      }
      if (action instanceof ResolvePromptAction) {
        assert.equal(action.id,44);
        for (const card of action.result) {
          owner.deck.cards.splice(owner.deck.cards.indexOf(card),1);
          owner.discard.cards.push(card);
        }
        this.state.prompts[0].result=action.result;
        this.state.prompts=[];
      }
      return this.state;
    }
  }
  return {Store,owner,cards};
}
test('source-seat-1 real own prompt, physical per-copy deck and discard settlement', () => {
  const {Store,owner,cards}=makeSource(1);
  const original=Store.prototype.dispatch;
  const value=withOwnerCompressorPromptCustody(() => {
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(owner.id,0));
    store.dispatch(new ResolvePromptAction(44,[cards[0],cards[1]]));
    return store.state;
  },1,{Store});
  assert.equal(Store.prototype.dispatch,original);
  assert.equal(value.audit.selectedSourceCompressor,1);
  assert.equal(value.audit.ownerPromptSeen,1);
  assert.equal(value.audit.ownerPromptResolved,1);
  assert.equal(value.audit.verifiedPhysicalSelections,1);
  assert.equal(value.audit.completeNonemptyMoves,1);
  assert.deepEqual(value.audit.events[0].selectedCards.map(c=>c.id),[1,2]);
  assert.equal(value.audit.events[0].ownerDeckBefore,3);
  assert.equal(value.audit.events[0].ownerDeckAfter,1);
  assert.equal(value.audit.events[0].ownerDiscardBefore,0);
  assert.equal(value.audit.events[0].ownerDiscardAfter,2);
  assert.equal(value.audit.observesOpponentPrivateCards,false);
  assert.equal(value.audit.policyChanged,false);
});
test('empty owner selection does not count as verified nonempty physical transfer', () => {
  const {Store,owner}=makeSource(0);
  const output=withOwnerCompressorPromptCustody(() => {
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(owner.id,0));
    store.dispatch(new ResolvePromptAction(44,[]));
  },0,{Store});
  assert.equal(output.audit.ownerPromptResolved,1);
  assert.equal(output.audit.completeNonemptyMoves,0);
});
test('read-only wrapper restores original Store on native error', () => {
  const {Store}=makeSource(0);
  const original=Store.prototype.dispatch;
  assert.throws(()=>withOwnerCompressorPromptCustody(
    ()=>{throw Error('native crash');},0,{Store}),/native crash/);
  assert.equal(Store.prototype.dispatch,original);
});
test('source-owned observer ignores opponent's physically played Item', () => {
  const {Store,owner}=makeSource(1);
  const output=withOwnerCompressorPromptCustody(() => {
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(4321,0));
  },1,{Store});
  assert.equal(output.audit.selectedSourceCompressor,0);
});
