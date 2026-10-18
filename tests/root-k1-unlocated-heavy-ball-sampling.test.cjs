'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const nodePath=require('node:path');
const {fixture}=require('../simulation/twinleaf/redeemable-ticket-paper-regression.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {installHisuianHeavyBallPrizeShuffleHook}=
  require('../simulation/twinleaf/hisuian-heavy-ball-prize-hook.cjs');
const {createOwnerDeckKnowledgeEpoch}=
  require('../simulation/twinleaf/owner-deck-knowledge-epoch.cjs');
const {snapshotPrizeCardIdentities,observeAfterRootFullPrizeReview,
  invalidateAfterRootHiddenPrizeIngress}=
  require('../simulation/twinleaf/root-prize-knowledge-observer.cjs');
const {evaluateDetachedDeckSamples}=
  require('../simulation/twinleaf/detached-deck-sampling.cjs');
const {normalizeDeepClonePrototypes,assertVendorCloneCompatibleSource}=
  require('../simulation/twinleaf/normalize-deep-clone.cjs');
const {seededRandom,deckPermutation}=
  require('../simulation/twinleaf/headless.cjs');
const engine=name=>require(nodePath.resolve(__dirname,
  '../vendor/twinleaf/ptcg-server/output',name));

test('real Heavy Ball root actions establish K1 before face-down positional sampling',()=>{
  const f=fixture(16);
  const {Format}=engine('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {deepClone}=engine('utils');
  const {Card}=engine('game/store/card/card');
  f.state.turn=2;
  f.state.gameSettings.format=Format.EXPANDED;
  const manager=initializeCards();
  const basic=manager.getCardByName('Shadow Rider Calyrex V CRE');
  const ball=manager.getCardByName('Hisuian Heavy Ball ASR');
  assert.ok(basic&&ball);
  basic.id=11001;
  ball.id=11002;
  f.a.prizes[0].cards=[basic];
  f.a.prizes.forEach(slot=>{slot.isSecret=true});
  f.a.hand.cards.push(ball);
  const epoch=createOwnerDeckKnowledgeEpoch();
  const epochs=new Map([[f.a.id,epoch]]);
  const restore=installHisuianHeavyBallPrizeShuffleHook();
  try{
    const before=snapshotPrizeCardIdentities(f.state);
    f.store.dispatch(new PlayCardAction(f.a.id,f.a.hand.cards.indexOf(ball),
      {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
    const prompt=f.state.prompts.find(p=>p.result===undefined);
    assert.equal(prompt?.constructor.name,'ChooseCardsPrompt');
    assert.ok(f.a.prizes.every(slot=>slot.isSecret===false));
    assert.deepEqual(observeAfterRootFullPrizeReview(before,f.state,epochs),
      [f.a.id]);
    assert.equal(epoch.exactMembershipKnown(),true);
    const beforeResolve=snapshotPrizeCardIdentities(f.state);
    assert.equal(prompt.validate([basic],f.state),true);
    f.store.dispatch(new ResolvePromptAction(prompt.id,[basic]));
    assert.ok(f.a.prizes.every(slot=>slot.isSecret===true));
    assert.ok(f.a.prizes.flatMap(slot=>slot.cards).includes(ball));
    assert.deepEqual(invalidateAfterRootHiddenPrizeIngress(
      beforeResolve,f.state,epochs),[]);
    assert.equal(epoch.exactMembershipKnown(),true);

    const names=player=>player.prizes.flatMap(slot=>slot.cards)
      .map(card=>card.fullName).sort();
    const expected=names(f.a);
    const original=expected.slice();
    assertVendorCloneCompatibleSource(f.state);
    const second=normalizeDeepClonePrototypes(f.state,deepClone(f.state));
    const pair=second.players.find(p=>p.id===f.a.id);
    // Physically distinct post-shuffle deals with identical K1 knowledge.
    const a=pair.prizes[0].cards[0];
    pair.prizes[0].cards[0]=pair.prizes[3].cards[0];
    pair.prizes[3].cards[0]=a;
    const opts={samples:12,seed:20261018,
      permutation:deckPermutation,random:seededRandom,
      isCard:card=>card instanceof Card,
      shuffleKnownPrizePositions:true,
      prizeCompositionKnownVerified:epoch.exactMembershipKnown(),
      prizePositionsUnobservedVerified:true};
    const score=state=>evaluateDetachedDeckSamples(
      state,f.a.id,{},0,copy=>{
        const owner=copy.players.find(p=>p.id===f.a.id);
        assert.deepEqual(names(owner),expected);
        return Number(owner.prizes[0].cards[0].fullName==='Hisuian Heavy Ball ASR');
      },null,current=>normalizeDeepClonePrototypes(current,deepClone(current)),
      opts);
    const firstScore=score(f.state);
    const secondScore=score(second);
    assert.equal(firstScore,secondScore);
    assert.deepEqual(names(f.a),original);
    assert.deepEqual(names(pair),original);
    assert.equal(epoch.exactMembershipKnown(),true);
  }finally{restore();}
});
