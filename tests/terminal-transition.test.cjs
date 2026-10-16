'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {publicSnapshot, observeTerminalTransition, advanceActionLineage} = require('../simulation/twinleaf/terminal-transition.cjs');

const FINISHED = 99;
function state({phase=2,turn=8,activePlayer=0,winner=null,decks=[3,4],
  prizes=[2,3],active=[true,true],bench=[1,2]}={}) {
  return {
    phase,turn,activePlayer,winner,
    players: [0,1].map(i => ({
      deck:{cards:Array(decks[i]).fill({})},
      hand:{cards:[{},{}]},
      prizes:Array.from({length:prizes[i]},()=>({cards:[{}]})),
      active:{getPokemonCard:()=>active[i]?{}:undefined},
      bench:Array.from({length:bench[i]},()=>({getPokemonCard:()=>({})}))
    }))
  };
}

test('a turn-ending action and empty deck are preserved without declaring deck-out',()=>{
  const before=publicSnapshot(state({decks:[3,0]}));
  const after=publicSnapshot(state({phase:FINISHED,winner:0,decks:[3,0],turn:9,activePlayer:1}));
  const observed=observeTerminalTransition(before,after,
    {name:'PassTurnAction',playerSlot:0,pendingPrompt:null},FINISHED);
  assert.equal(observed.evidenceType,'observed-engine-terminal-transition-v1');
  assert.equal(observed.actionName,'PassTurnAction');
  assert.equal(observed.after.players[1].deckRemaining,0);
  assert.equal(observed.before.players[1].inPlayPokemon,3);
  assert.equal(Object.hasOwn(observed,'cause'),false);
});

test('multiple simultaneous terminal markers remain visible',()=>{
  const before=publicSnapshot(state());
  const after=publicSnapshot(state({phase:FINISHED,winner:0,prizes:[0,3],active:[true,false],bench:[1,0]}));
  const result=observeTerminalTransition(before,after,
    {name:'AttackAction',playerSlot:0,pendingPrompt:null},FINISHED);
  assert.equal(result.after.players[0].prizesRemaining,0);
  assert.equal(result.after.players[1].inPlayPokemon,0);
  assert.equal(result.actionName,'AttackAction');
});

test('nonterminal dispatch and already-finished states yield no transition',()=>{
  const inProgress=publicSnapshot(state());
  const finished=publicSnapshot(state({phase:FINISHED}));
  const context={name:'PlayCardAction',playerSlot:1,pendingPrompt:'ChooseCardsPrompt'};
  assert.equal(observeTerminalTransition(inProgress,inProgress,context,FINISHED),null);
  assert.equal(observeTerminalTransition(finished,finished,context,FINISHED),null);
});

test('snapshot is detached and excludes all hidden card identities',()=>{
  const original=state();
  original.players[0].deck.cards[0]={name:'Hidden Draw'};
  const snapshot=publicSnapshot(original);
  original.players[0].deck.cards.length=0;
  assert.equal(snapshot.players[0].deckRemaining,3);
  assert.doesNotMatch(JSON.stringify(snapshot),/Hidden Draw/);
});

test('the initiating pass survives a chain of terminal prompt resolutions',()=>{
  const pass = advanceActionLineage(null,
    {actionOrdinal:31,name:'PassTurnAction',playerSlot:1,pendingPrompt:null});
  const first = advanceActionLineage(pass,
    {actionOrdinal:32,name:'ResolvePromptAction',playerSlot:0,pendingPrompt:'WaitPrompt'});
  const last = advanceActionLineage(first,
    {actionOrdinal:33,name:'ResolvePromptAction',playerSlot:0,pendingPrompt:'WaitPrompt'});
  assert.deepEqual(last.initiatingAction, {
    actionOrdinal:31,actionName:'PassTurnAction',playerSlot:1
  });
  assert.deepEqual(last.promptChain.map(step=>step.actionOrdinal),[32,33]);
  assert.equal(last.promptChain[0].pendingPrompt,'WaitPrompt');
  assert.deepEqual(pass.promptChain,[]);
});

test('the next real action resets origin and prior prompt chain',()=>{
  const chain = advanceActionLineage(
    advanceActionLineage(null,
      {actionOrdinal:1,name:'AttackAction',playerSlot:0,pendingPrompt:null}),
    {actionOrdinal:2,name:'ResolvePromptAction',playerSlot:0,pendingPrompt:'ChoosePrompt'}
  );
  const reset=advanceActionLineage(chain,
    {actionOrdinal:3,name:'PlayCardAction',playerSlot:1,pendingPrompt:null});
  assert.deepEqual(reset.promptChain,[]);
  assert.equal(reset.initiatingAction.actionName,'PlayCardAction');
  assert.equal(chain.initiatingAction.actionName,'AttackAction');
});

test('orphan prompt chains are explicit without inventing an initiating action',()=>{
  const orphan=advanceActionLineage(null,
    {actionOrdinal:0,name:'ResolvePromptAction',playerSlot:0,pendingPrompt:'CoinFlipPrompt'});
  assert.equal(orphan.initiatingAction,null);
  assert.equal(orphan.promptChain.length,1);
});
