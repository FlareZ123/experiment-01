'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {stage} = require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards,seededRandom,deckPermutation} = require('../simulation/twinleaf/headless.cjs');
const {actorObservation} = require('../simulation/twinleaf/actor-observation-contract.cjs');
const {chooseActorRootIntent} = require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {withOwnerTreasurePromptContinuation} = require('../simulation/twinleaf/agent49-mysterious-treasure-prompt-continuation.cjs');
const source60 = require('../results/aichi-2026/full-decklists.json');
const path = require('node:path');
const native = file => require(path.join(__dirname,'../vendor/twinleaf/ptcg-server/output',file));
const {SimpleTacticsAi} = native('simple-bot/simple-tactics-ai');
const {PlayCardAction,PlayerType,SlotType} = native('game/store/actions/play-card-action');
const {ResolvePromptAction} = native('game/store/actions/resolve-prompt-action');
const rank13 = source60.decks.find(d=>d.rank===13).cards.flatMap(c=>Array(c.count).fill(c.name+' '+c.printing.set));
assert.equal(rank13.length,60);
for(const seat of [0,1]) test('early original rank13 Treasure paid V access seat '+seat,()=>{
  const x=stage(seat),mgr=initializeCards();
  const card=n=>{const c=mgr.getCardByName(n); assert.ok(c,n);return c;};
  const item=card('Mysterious Treasure FLI');
  const donor=card('Salamence ex JTG');
  const v=card('Regidrago V SIT');
  x.owner.bench[1].cards.length=0;
  x.owner.hand.cards.splice(0,x.owner.hand.cards.length,item,donor);
  x.owner.deck.cards.push(v);
  const opts={mysteriousTreasureEarlyRegistered:true,ownRegisteredSixty:rank13};
  const first=chooseActorRootIntent(actorObservation(x.state,seat),x.catalog,opts);
  assert.equal(first.kind,'play-mysterious-treasure');
  assert.equal(first.discardPrinting,donor.fullName);
  const {audit}=withOwnerTreasurePromptContinuation(()=>{
    x.store.dispatch(new PlayCardAction(x.owner.id,first.handIndex,{player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
    const bot={client:{id:x.owner.id}};
    for(const zone of [x.owner.hand,x.owner.deck]){
      const p=x.state.prompts.find(q=>q.result===undefined);
      assert.equal(p.constructor.name,'ChooseCardsPrompt');
      assert.strictEqual(p.cards,zone);
      x.store.dispatch(SimpleTacticsAi.prototype.decodeNextAction.call(bot,x.state));
    }
    for(let n=0;n<8;n++){
      const p=x.state.prompts.find(q=>q.result===undefined);
      if(!p)break;
      assert.ok(['ShowCardsPrompt','ShuffleDeckPrompt','WaitPrompt'].includes(p.constructor.name));
      const answer=p.constructor.name==='ShuffleDeckPrompt'?deckPermutation(x.owner.deck.cards.length,seededRandom(50000+seat)):null;
      x.store.dispatch(new ResolvePromptAction(p.id,answer));
    }
    assert.equal(x.store.hasPrompts(),false);
  },{initialLiveStore:x.store,earlyRegistered:true,ownRegisteredSixtiesBySeat:{[seat]:rank13}});
  assert.equal(audit.completedPhysicalChains,1);
  assert.equal(audit.nativeItemFinalized,1);
  assert.equal(audit.failedOrRejectedReplies,0);
  assert.ok(x.owner.discard.cards.includes(donor));
  assert.ok(x.owner.discard.cards.includes(item));
  assert.ok(x.owner.hand.cards.includes(v));
  const bench=chooseActorRootIntent(actorObservation(x.state,seat),x.catalog,opts);
  assert.equal(bench.kind,'bench-basic');
  assert.equal(bench.printing,v.fullName);
  x.store.dispatch(new PlayCardAction(x.owner.id,bench.handIndex,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:bench.benchIndex}));
  assert.equal(x.owner.bench[bench.benchIndex].getPokemonCard().name,'Regidrago V');
  assert.equal(x.owner.hand.cards.includes(v),false);
  assert.equal(audit.competitiveQualifiedGames,0);
});