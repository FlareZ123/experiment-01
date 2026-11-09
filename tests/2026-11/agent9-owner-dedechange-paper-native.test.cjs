'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {withOwnerAbilityConfirmPolicy}=
  require('../../simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs');

const ENGINE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(ENGINE,name));

/**
 * Build an actual pinned Store with original printed Dedenne and independent
 * physical Energy instances. Only a pending native owner Confirm is automated.
 * @param {0|1} seat
 * @param {'low-hand'|'protected-hand'|'low-deck'|'expired-vip'} scenario
 * @returns {object}
 */
function fixture(seat,scenario){
  initializeCards();
  const {Store}=load('game/store/store');
  const {State,GamePhase}=load('game/store/state/state');
  const {Player}=load('game/store/state/player');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {CardList}=load('game/store/state/card-list');
  const {CardManager}=load('game/cards/card-manager');
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const manager=CardManager.getInstance();
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing native printing '+name);
    return c;
  };
  const actor=new Player(),opponent=new Player();
  actor.id=9001;actor.name='actual-ability-owner';
  opponent.id=9002;opponent.name='native-test-opponent';
  actor.bench=Array.from({length:5},()=>new PokemonCardList());
  opponent.bench=Array.from({length:5},()=>new PokemonCardList());
  actor.active.cards.push(card('Snorlax PGO'));
  opponent.active.cards.push(card('Regidrago V SIT'));
  const dedenne=card('Dedenne GX UNB');
  actor.hand.cards.push(dedenne);
  const held=scenario==='protected-hand'?card('Secret Box TWM'):
    card('Fire Energy SVE');
  actor.hand.cards.push(held);
  if(scenario==='expired-vip')
    for(let i=0;i<3;i++)actor.hand.cards.push(card('Battle VIP Pass FST'));
  const deckLength=scenario==='low-deck'?6:12;
  for(let i=0;i<deckLength;i++)actor.deck.cards.push(card('Psychic Energy SVE'));
  for(let i=0;i<12;i++)opponent.deck.cards.push(card('Psychic Energy SVE'));
  for(const player of [actor,opponent]){
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
  }
  const state=new State();
  state.players=seat===0?[actor,opponent]:[opponent,actor];
  state.turn=4;state.activePlayer=seat;state.phase=GamePhase.PLAYER_TURN;
  const store=new Store({onStateChange(){}});
  store.state=state;
  const bot=new SimpleTacticsAi({id:actor.id},{tactics:[],promptResolvers:[]},null);
  return {store,bot,actor,dedenne,held,PlayCardAction,PlayerType,SlotType,
    deckLength};
}

for(const seat of [0,1]){
  for(const scenario of ['low-hand','protected-hand','low-deck','expired-vip']){
    test('actual pinned Store Dedechange '+scenario+' physical seat '+seat,()=>{
      const x=fixture(seat,scenario);
      const {result,audit}=withOwnerAbilityConfirmPolicy(()=>{
        const beforeCount=x.actor.deck.cards.length;
        x.store.dispatch(new x.PlayCardAction(x.actor.id,0,{
          player:x.PlayerType.BOTTOM_PLAYER,slot:x.SlotType.BENCH,index:0
        }));
        const prompt=x.store.state.prompts.find(p=>p.result===undefined&&
          p.constructor.name==='ConfirmPrompt'&&p.playerId===x.actor.id);
        assert.ok(prompt,'native Dedechange owner Confirm must exist');
        const action=x.bot.decodeNextAction(x.store.state);
        assert.equal(action.constructor.name,'ResolvePromptAction');
        assert.equal(action.id,prompt.id);
        x.store.dispatch(action);
        return {answer:action.result,promptSettled:prompt.result===action.result,
          physicallyBenched:x.actor.bench[0].cards.includes(x.dedenne),
          physicalHeldInHand:x.actor.hand.cards.includes(x.held),
          heldDiscarded:x.actor.discard.cards.includes(x.held),
          handSize:x.actor.hand.cards.length,
          deckDelta:beforeCount-x.actor.deck.cards.length};
      },{enableDedechange:true});
      assert.equal(result.physicallyBenched,true);
      assert.equal(result.promptSettled,true);
      assert.equal(audit.confirmSettled,1);
      assert.equal(audit.dedechangeUnsettled,0);
      if(scenario==='low-hand'||scenario==='expired-vip'){
        assert.equal(result.answer,true);
        assert.equal(result.physicalHeldInHand,false);
        assert.equal(result.heldDiscarded,true);
        assert.equal(result.handSize,6);
        assert.equal(result.deckDelta,6);
        assert.equal(audit.dedechangeSettlements.length,1);
        assert.equal(audit.dedechangeSettlements[0].settled,true);
        assert.equal(audit.dedechangeSettlements[0].discardedCount,
          scenario==='expired-vip'?4:1);
      }else{
        assert.equal(result.answer,false);
        assert.equal(result.physicalHeldInHand,true);
        assert.equal(result.heldDiscarded,false);
        assert.equal(result.handSize,1);
        assert.equal(result.deckDelta,0);
        assert.equal(audit.dedechangeSettlements.length,0);
      }
      console.log('AGENT9_NATIVE_DEDECHANGE',JSON.stringify({
        seat,scenario,...result,confirmReason:audit.confirmEvents[0].reason,
        physicalSettlement:audit.dedechangeSettlements[0]?.settled??null,
        competitiveGamesQualified:0
      }));
    });
  }
}
