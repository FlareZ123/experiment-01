'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {Store}=require('../vendor/twinleaf/ptcg-server/output/game/store/store');
const {Player}=require('../vendor/twinleaf/ptcg-server/output/game/store/state/player');
const {GamePhase}=require('../vendor/twinleaf/ptcg-server/output/game/store/state/state');
const {Card}=require('../vendor/twinleaf/ptcg-server/output/game/store/card/card');
const {CardList}=require('../vendor/twinleaf/ptcg-server/output/game/store/state/card-list');
const {TrainerEffect}=require('../vendor/twinleaf/ptcg-server/output/game/store/effects/play-card-effects');
const {ResolvePromptAction}=require('../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');
const {Iono}=require('../vendor/twinleaf/ptcg-server/output/sets/10-scarlet-and-violet/set-paldea-evolved/iono');
const {Marnie}=require('../vendor/twinleaf/ptcg-server/output/sets/09-sword-and-shield/set-sword-and-shield/marnie');
const {Milotic}=require('../vendor/twinleaf/ptcg-server/output/sets/09-sword-and-shield/set-evolving-skies/milotic');
const {PokemonCardList}=require('../vendor/twinleaf/ptcg-server/output/game/store/state/pokemon-card-list');
const {withSoleShuffleDeckZeroCorrection}=
  require('../simulation/twinleaf/agent2-sole-shuffle-deckzero-hook.cjs');

/** @param {number} count @returns {CardList[]} */
function prizes(count){
  return Array.from({length:count},()=>{
    const prize=new CardList();
    prize.cards.push(new Card());
    return prize;
  });
}
for(const [name,CardType] of [['Iono',Iono],['Marnie',Marnie]]){
  test('native original Store stages and resolves '+name+' opponent-only bottom return',()=>{
    const store=new Store({onStateChange:()=>{}});
    const state=store.state;
    const owner=new Player(),opponent=new Player();
    owner.id=101;opponent.id=202;
    owner.name='A';opponent.name='B';
    owner.prizes=prizes(3);opponent.prizes=prizes(2);
    const card=new CardType();
    owner.supporter.cards.push(card);
    opponent.hand.cards.push(new Card());
    state.players=[owner,opponent];
    state.activePlayer=0;
    state.phase=GamePhase.SETUP;
    state.turn=5;
    assert.equal(owner.deck.cards.length,0);
    assert.equal(opponent.hand.cards.length,1);
    assert.equal(card.canPlay(store,state,owner),false);
    withSoleShuffleDeckZeroCorrection(()=>{
      assert.equal(card.canPlay(store,state,owner),true);
      store.reduceEffect(state,new TrainerEffect(owner,card));
      assert.equal(opponent.hand.cards.length,0);
      assert.equal(opponent.deck.cards.length,1);
      const prompt=state.prompts.find(x=>x.type==='WaitPrompt');
      assert.ok(prompt,'pinned native hand-to-deck wait is present');
      store.dispatch(new ResolvePromptAction(prompt.id,null));
      assert.equal(opponent.hand.cards.length,1);
      assert.equal(opponent.deck.cards.length,0);
      assert.equal(owner.hand.cards.length,0);
      assert.equal(owner.deck.cards.length,0);
    });
    assert.equal(card.canPlay(store,state,owner),false,
      'original native class method has been restored');
  });
}

test('pinned Marnie currently draws owner despite protected opponent-only hand',()=>{
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const owner=new Player(),opponent=new Player();
  owner.id=101;opponent.id=202;
  owner.name='A';opponent.name='B';
  owner.prizes=prizes(3);opponent.prizes=prizes(2);
  const card=new Marnie();
  owner.supporter.cards.push(card);
  owner.deck.cards.push(new Card());
  opponent.hand.cards.push(new Card());
  const protectedBench=new PokemonCardList();
  protectedBench.cards.push(new Milotic());
  opponent.bench.push(protectedBench);
  state.players=[owner,opponent];
  state.activePlayer=0;state.phase=GamePhase.SETUP;state.turn=5;
  assert.equal(card.canPlay(store,state,owner),true);
  store.reduceEffect(state,new TrainerEffect(owner,card));
  assert.equal(opponent.hand.cards.length,1,
    'Milotic EVS Dew Guard prevents the native hand move');
  assert.equal(opponent.deck.cards.length,0);
  assert.equal(owner.hand.cards.length,1,
    'Observed pinned violation: native onMovePrevented still draws owner');
  assert.equal(owner.deck.cards.length,0);
});

for(const [name,CardType] of [['Iono',Iono],['Marnie',Marnie]]){
  test(name+' corrected opponent-only Dew Guard leaves owner draw untouched',()=>{
    const store=new Store({onStateChange(){}});
    const state=store.state;
    const owner=new Player(),opponent=new Player();
    owner.id=101;opponent.id=202;
    owner.name='A';opponent.name='B';
    owner.prizes=prizes(3);opponent.prizes=prizes(2);
    const supporter=new CardType();
    owner.supporter.cards.push(supporter);
    owner.deck.cards.push(new Card());
    opponent.hand.cards.push(new Card());
    const protectedBench=new PokemonCardList();
    protectedBench.cards.push(new Milotic());
    opponent.bench.push(protectedBench);
    state.players=[owner,opponent];
    state.activePlayer=0;state.phase=GamePhase.SETUP;state.turn=5;
    assert.equal(supporter.canPlay(store,state,owner),true);
    withSoleShuffleDeckZeroCorrection(()=>{
      store.reduceEffect(state,new TrainerEffect(owner,supporter));
    });
    assert.equal(opponent.hand.cards.length,1,
      'Opponent remains protected by Dew Guard');
    assert.equal(opponent.deck.cards.length,0);
    assert.equal(owner.hand.cards.length,0,
      'Neither player returned cards; printed draw must be suppressed');
    assert.equal(owner.deck.cards.length,1);
    assert.equal(supporter.canPlay(store,state,owner),true,
      'The reversible opt-in restored the pinned class');
  });
}
