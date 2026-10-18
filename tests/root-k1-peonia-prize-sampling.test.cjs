'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stageRank2SourceK0}=require('../simulation/twinleaf/rank2-full-source-k0-sampler.cjs');
const {createOwnerDeckKnowledgeEpoch}=
  require('../simulation/twinleaf/owner-deck-knowledge-epoch.cjs');
const {snapshotPrizeCardIdentities,invalidateAfterRootHiddenPrizeIngress}=
  require('../simulation/twinleaf/root-prize-knowledge-observer.cjs');
const {evaluateDetachedDeckSamples}=
  require('../simulation/twinleaf/detached-deck-sampling.cjs');
const {normalizeDeepClonePrototypes,assertVendorCloneCompatibleSource}=
  require('../simulation/twinleaf/normalize-deep-clone.cjs');
const {seededRandom,deckPermutation}=require('../simulation/twinleaf/headless.cjs');
const engine=name=>require(path.resolve(__dirname,
  '../vendor/twinleaf/ptcg-server/output',name));

test('source rank2 Tag Call search then Peonia leaves a known positional Prize subset',()=>{
  const f=stageRank2SourceK0(false);
  const player=f.player;
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {deepClone}=engine('utils');
  const {Card}=engine('game/store/card/card');
  const takeFromDeck=name=>{
    const index=player.deck.cards.findIndex(card=>card.fullName===name);
    assert.ok(index>=0,'Source deck lacks '+name);
    return player.deck.cards.splice(index,1)[0];
  };
  player.hand.cards.push(takeFromDeck('Peonia CRE'));
  player.prizes.forEach(slot=>{slot.isSecret=true});
  const sourceNames=()=>{
    return [
      ...player.active.cards,...player.active.tools,
      ...player.bench.flatMap(slot=>slot.cards),...player.hand.cards,
      ...player.deck.cards,...player.prizes.flatMap(slot=>slot.cards),
      ...player.discard.cards,...player.lostzone.cards,...player.supporter.cards
    ].map(card=>card.fullName).sort();
  };
  assert.deepEqual(sourceNames(),f.rank2.cardIds.slice().sort());
  const play=card=>f.store.dispatch(new PlayCardAction(
    player.id,player.hand.cards.indexOf(card),
    {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
  const resolve=result=>{
    const prompt=f.state.prompts.find(x=>x.result===undefined);
    assert.ok(prompt,'Expected an unresolved root Store prompt');
    f.store.dispatch(new ResolvePromptAction(prompt.id,result));
    return prompt;
  };
  const tagCall=player.hand.cards.find(c=>c.fullName==='Tag Call CEC');
  assert.ok(tagCall);
  play(tagCall);
  const deckPrompt=f.state.prompts.find(x=>x.result===undefined);
  assert.equal(deckPrompt?.constructor.name,'ChooseCardsPrompt');
  assert.equal(deckPrompt.cards,player.deck);
  const epoch=createOwnerDeckKnowledgeEpoch();
  // Record only after the genuine source Store exposed the owner deck.
  epoch.observeOwnerDeckSearch();
  assert.equal(deckPrompt.validate([]),true);
  resolve([]);
  const shuffle=f.state.prompts.find(x=>x.result===undefined);
  assert.equal(shuffle?.constructor.name,'ShuffleDeckPrompt');
  resolve(Array.from({length:player.deck.cards.length},(_,i)=>i));
  const animation=f.state.prompts.find(x=>x.result===undefined);
  assert.equal(animation?.constructor.name,'WaitPrompt');
  resolve(null);
  assert.equal(f.state.prompts.some(p=>p.result===undefined),false);
  assert.equal(epoch.exactMembershipKnown(),true);

  const peonia=player.hand.cards.find(c=>c.fullName==='Peonia CRE');
  const before=snapshotPrizeCardIdentities(f.state);
  play(peonia);
  const choosePrize=f.state.prompts.find(x=>x.result===undefined);
  assert.equal(choosePrize?.constructor.name,'ChoosePrizePrompt');
  const selected=player.prizes.slice(0,3);
  assert.equal(choosePrize.validate(selected,f.state),true);
  resolve(selected);
  const chooseHand=f.state.prompts.find(x=>x.result===undefined);
  assert.equal(chooseHand?.constructor.name,'ChooseCardsPrompt');
  const replacements=['Guzma & Hala CEC','Stealthy Hood UNB','Capture Energy RCL']
    .map(name=>player.hand.cards.find(c=>c.fullName===name));
  assert.ok(replacements.every(Boolean));
  assert.equal(chooseHand.validate(replacements),true);
  resolve(replacements);
  const order=f.state.prompts.find(x=>x.result===undefined);
  assert.equal(order?.constructor.name,'OrderCardsPrompt');
  assert.equal(order.validate([0,1,2]),true);
  resolve([0,1,2]);
  assert.equal(f.state.prompts.some(p=>p.result===undefined),false);
  assert.equal(player.prizes.flatMap(slot=>slot.cards).length,6);
  assert.deepEqual(invalidateAfterRootHiddenPrizeIngress(
    before,f.state,new Map([[player.id,epoch]])),[]);
  assert.equal(epoch.exactMembershipKnown(),true);
  assert.deepEqual(sourceNames(),f.rank2.cardIds.slice().sort());

  const ledger=[0,1,2].map(prizeIndex=>({
    prizeIndex,cardIndex:0,fullName:player.prizes[prizeIndex].cards[0].fullName
  }));
  assert.deepEqual(ledger.map(row=>row.fullName),
    replacements.map(card=>card.fullName));
  assertVendorCloneCompatibleSource(f.state);
  const cloned=normalizeDeepClonePrototypes(f.state,deepClone(f.state));
  const other=cloned.players.find(p=>p.id===player.id);
  [other.prizes[3].cards[0],other.prizes[5].cards[0]]=
    [other.prizes[5].cards[0],other.prizes[3].cards[0]];
  const score=source=>evaluateDetachedDeckSamples(
    source,player.id,{},0,world=>{
      const p=world.players.find(side=>side.id===player.id);
      ledger.forEach(row=>assert.equal(
        p.prizes[row.prizeIndex].cards[row.cardIndex].fullName,row.fullName));
      return p.prizes[3].cards[0].id;
    },null,current=>normalizeDeepClonePrototypes(current,deepClone(current)),{
      samples:12,seed:20261018,random:seededRandom,
      permutation:deckPermutation,isCard:card=>card instanceof Card,
      shuffleKnownPrizePositions:true,prizeCompositionKnownVerified:true,
      prizePositionsUnobservedVerified:true,
      observedPrizeSlots:ledger,prizeObservationLedgerComplete:true
    });
  const originalScore=score(f.state);
  const alternateScore=score(cloned);
  assert.equal(originalScore,alternateScore);
  assert.deepEqual(sourceNames(),f.rank2.cardIds.slice().sort());
});
