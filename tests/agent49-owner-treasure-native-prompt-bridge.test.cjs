'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withOwnerTreasurePromptContinuation}=
  require('../simulation/twinleaf/agent49-mysterious-treasure-prompt-continuation.cjs');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUTPUT,name));
const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
const {Store}=native('game/store/store');
const {PlayCardAction,PlayerType,SlotType}=native('game/store/actions/play-card-action');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');

for(const seat of [0,1]){
  test('same owner-private Treasure donor and real VSTAR search prompts seat '+seat,()=>{
    const x=stage(seat),manager=initializeCards();
    let id=30000;
    const make=name=>{
      const card=manager.getCardByName(name);
      assert.ok(card,'Pinned card missing '+name);
      card.id=id++;return card;
    };
    const item=make('Mysterious Treasure FLI');
    const donor=make('Dragapult ex TWM');
    const target=make('Regidrago VSTAR SIT');
    x.owner.hand.cards.length=0;
    x.owner.hand.cards.push(item,donor);
    x.owner.deck.cards.push(target);
    x.state.turn=3;
    const beforeBot=SimpleTacticsAi.prototype.decodeNextAction;
    const beforeStore=Store.prototype.dispatch;
    const {audit}=withOwnerTreasurePromptContinuation(()=>{
      x.store.dispatch(new PlayCardAction(x.owner.id,0,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
      const first=x.state.prompts.find(p=>p.result===undefined);
      assert.equal(first?.constructor?.name,'ChooseCardsPrompt');
      assert.strictEqual(first.cards,x.owner.hand);
      const fakeBot={client:{id:x.owner.id}};
      const firstAction=SimpleTacticsAi.prototype.decodeNextAction.call(
        fakeBot,x.state);
      assert.ok(firstAction instanceof ResolvePromptAction);
      assert.equal(firstAction.id,first.id);
      x.store.dispatch(firstAction);
      const second=x.state.prompts.find(p=>p.result===undefined);
      assert.equal(second?.constructor?.name,'ChooseCardsPrompt');
      assert.strictEqual(second.cards,x.owner.deck);
      const secondAction=SimpleTacticsAi.prototype.decodeNextAction.call(
        fakeBot,x.state);
      assert.ok(secondAction instanceof ResolvePromptAction);
      assert.equal(secondAction.id,second.id);
      x.store.dispatch(secondAction);
      return x.state;
    },{initialLiveStore:x.store});
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,beforeBot);
    assert.strictEqual(Store.prototype.dispatch,beforeStore);
    assert.equal(audit.observedAcceptedItemRoots,1);
    assert.equal(audit.plannedSourceSafeRoots,1);
    assert.equal(audit.costPromptAccepted,1);
    assert.equal(audit.searchPromptAccepted,1);
    assert.equal(audit.physicalCostDiscards,1);
    assert.equal(audit.physicalTargetRetrievals,1);
    assert.equal(audit.completedPhysicalChains,1);
    assert.equal(audit.bySeat[seat],1);
    assert.equal(x.owner.discard.cards.includes(donor),true);
    assert.equal(x.owner.hand.cards.includes(target),true);
    assert.equal(x.owner.hand.cards.includes(item),false);
    assert.equal(x.opponent.hand.cards.length,0);
    assert.equal(audit.competitiveQualifiedGames,0);
  });
}
