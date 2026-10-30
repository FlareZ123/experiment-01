'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {chooseTreasureRootIntent}=
  require('../simulation/twinleaf/agent49-mysterious-treasure-frontier.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {PlayCardAction,PlayerType,SlotType}=require(
  '../vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action');
const {ResolvePromptAction}=require(
  '../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');

for(const seat of [0,1]){
  test('native Regidrago Treasure discards Dragon and searches VSTAR on seat '+seat,()=>{
    const x=stage(seat),manager=initializeCards();
    let uid=200000;
    const make=name=>{
      const c=manager.getCardByName(name);
      assert.ok(c,'Missing pinned native print '+name);c.id=uid++;return c;
    };
    const item=make('Mysterious Treasure FLI');
    const donor=make('Dragapult ex TWM');
    const target=make('Regidrago VSTAR SIT');
    x.owner.hand.cards.length=0;
    x.owner.hand.cards.push(item,donor);
    x.owner.deck.cards.push(target);
    x.state.turn=3;
    const view=actorObservation(x.state,seat);
    assert.equal(view.ownPublic.bench[1].name,'Regidrago V');
    const planned=chooseTreasureRootIntent(view,x.catalog);
    assert.equal(planned.kind,'play-mysterious-treasure');
    assert.equal(planned.discardPrinting,donor.fullName);
    const oldOpponentHand=x.opponent.hand.cards.slice();
    x.store.dispatch(new PlayCardAction(x.owner.id,planned.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
    const discard=x.state.prompts.find(p=>p.result===undefined);
    assert.equal(discard?.constructor?.name,'ChooseCardsPrompt');
    assert.equal(discard.playerId,x.owner.id);
    assert.equal(discard.cards,x.owner.hand);
    assert.equal(discard.validate([donor],x.state),true);
    x.store.dispatch(new ResolvePromptAction(discard.id,[donor]));
    const search=x.state.prompts.find(p=>p.result===undefined);
    assert.equal(search?.constructor?.name,'ChooseCardsPrompt');
    assert.equal(search.playerId,x.owner.id);
    assert.equal(search.cards,x.owner.deck,
      'Deck identities only usable from an actual owner-deck prompt');
    assert.equal(search.validate([target],x.state),true);
    x.store.dispatch(new ResolvePromptAction(search.id,[target]));
    for(let i=0;i<6;i++){
      const pending=x.state.prompts.find(p=>p.result===undefined);
      if(!pending)break;
      assert.ok(['WaitPrompt','ShowCardsPrompt','ShuffleDeckPrompt'].includes(
        pending.constructor.name),
        'Unexpected post-search native prompt '+pending.constructor.name);
      x.store.dispatch(new ResolvePromptAction(pending.id,null));
    }
    assert.equal(x.owner.hand.cards.includes(target),true);
    assert.equal(x.owner.discard.cards.includes(item),true);
    assert.equal(x.owner.discard.cards.includes(donor),true);
    assert.equal(x.owner.deck.cards.includes(target),false);
    assert.deepEqual(x.opponent.hand.cards,oldOpponentHand);
    assert.equal(x.state.activePlayer,seat);
    assert.equal(x.store.hasPrompts(),false);
  });
}
