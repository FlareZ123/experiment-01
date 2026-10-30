'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {Store}=require('../vendor/twinleaf/ptcg-server/output/game/store/store');
const {Player}=require('../vendor/twinleaf/ptcg-server/output/game/store/state/player');
const {GamePhase}=require('../vendor/twinleaf/ptcg-server/output/game/store/state/state');
const {Card}=require('../vendor/twinleaf/ptcg-server/output/game/store/card/card');
const {CardList}=require('../vendor/twinleaf/ptcg-server/output/game/store/state/card-list');
const {PlayCardAction,PlayerType,SlotType}=
  require('../vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action');
const {Iono}=require('../vendor/twinleaf/ptcg-server/output/sets/10-scarlet-and-violet/set-paldea-evolved/iono');
const {Marnie}=require('../vendor/twinleaf/ptcg-server/output/sets/09-sword-and-shield/set-sword-and-shield/marnie');
const {withSoleShuffleDeckZeroCorrection}=
  require('../simulation/twinleaf/agent2-sole-shuffle-deckzero-hook.cjs');

function prize(){
  const list=new CardList();
  list.cards.push(new Card());
  return list;
}

/**
 * Original pinned Store dispatch, with opponent hand but zero cards in
 * owner's deck. No fake Store reducer or fake native action is injected.
 * The pending WaitPrompt is audited without speculative bot decisions.
 * @param {typeof Iono} CardType
 */
function dispatchSoleSupporter(CardType){
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const owner=new Player(),opponent=new Player();
  owner.id=101;opponent.id=202;
  owner.name='Owner';opponent.name='Opponent';
  owner.prizes=[prize(),prize(),prize()];
  opponent.prizes=[prize(),prize()];
  const supporter=new CardType();
  supporter.id=21;
  owner.hand.cards.push(supporter);
  const opposingCard=new Card();
  opposingCard.id=22;
  opponent.hand.cards.push(opposingCard);
  state.players=[owner,opponent];
  state.turn=5;
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=0;
  assert.equal(supporter.canPlay(store,state,owner),false);
  const initial={ownerDeck:owner.deck.cards.length,
    ownerHand:owner.hand.cards.length,opponentHand:opponent.hand.cards.length};
  const dispatched=withSoleShuffleDeckZeroCorrection(()=>{
    assert.equal(supporter.canPlay(store,state,owner),true);
    return store.dispatch(new PlayCardAction(owner.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
  });
  assert.strictEqual(dispatched,state);
  assert.deepEqual(initial,{ownerDeck:0,ownerHand:1,opponentHand:1});
  assert.equal(owner.supporterTurn,1);
  assert.equal(owner.hand.cards.length,0);
  assert.equal(opponent.hand.cards.length,0);
  assert.equal(opponent.deck.cards.length,1);
  assert.equal(state.prompts.some(p=>p.type==='WaitPrompt'),true);
  assert.equal(supporter.canPlay(store,state,owner),false);
  return {supporterRoots:state.logs.filter(x=>x.params?.card===supporter.name).length,
    pendingWaitPrompts:state.prompts.filter(x=>x.type==='WaitPrompt').length};
}
for(const [name,CardType] of [['Iono',Iono],['Marnie',Marnie]]){
  test(name+' physical native root dispatch invokes narrow zero-deck hook',()=>{
    const result=dispatchSoleSupporter(CardType);
    assert.ok(result.supporterRoots>=1);
    assert.ok(result.pendingWaitPrompts>=1);
  });
}
