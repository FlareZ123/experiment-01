'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {fixture}=require('../simulation/twinleaf/redeemable-ticket-paper-regression.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {installHisuianHeavyBallPrizeShuffleHook}=
  require('../simulation/twinleaf/hisuian-heavy-ball-prize-hook.cjs');
const {createOwnerDeckKnowledgeEpoch}=
  require('../simulation/twinleaf/owner-deck-knowledge-epoch.cjs');
const {snapshotPrizeCardIdentities,invalidateAfterRootHiddenPrizeIngress,
  observeAfterRootFullPrizeReview}=
  require('../simulation/twinleaf/root-prize-knowledge-observer.cjs');
const engine=name=>require(path.resolve(__dirname,
  '../vendor/twinleaf/ptcg-server/output',name));

test('real Hisuian Heavy Ball reveals all own Prizes, and known Ball swap retains exact membership',()=>{
  const f=fixture(16);
  const {Format}=engine('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  f.state.turn=2;
  f.state.gameSettings.format=Format.EXPANDED;
  const manager=initializeCards();
  const basic=manager.getCardByName('Shadow Rider Calyrex V CRE');
  const ball=manager.getCardByName('Hisuian Heavy Ball ASR');
  assert.ok(basic&&ball);
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
    const pending=f.state.prompts.find(p=>p.result===undefined);
    assert.equal(pending?.constructor.name,'ChooseCardsPrompt');
    assert.ok(f.a.prizes.every(slot=>slot.isSecret===false));
    assert.deepEqual(invalidateAfterRootHiddenPrizeIngress(
      before,f.state,epochs),[]);
    assert.deepEqual(observeAfterRootFullPrizeReview(
      before,f.state,epochs),[f.a.id]);
    assert.equal(epoch.exactMembershipKnown(),true);
    const beforeResolution=snapshotPrizeCardIdentities(f.state);
    assert.equal(pending.validate([basic],f.state),true);
    f.store.dispatch(new ResolvePromptAction(pending.id,[basic]));
    assert.equal(f.a.prizes.flatMap(slot=>slot.cards).includes(ball),true);
    assert.ok(f.a.prizes.every(slot=>slot.isSecret));
    assert.deepEqual(invalidateAfterRootHiddenPrizeIngress(
      beforeResolution,f.state,epochs),[],
      'Replacing a known Prize with previously held Heavy Ball is fully observable');
    assert.deepEqual(observeAfterRootFullPrizeReview(
      beforeResolution,f.state,epochs),[]);
    assert.deepEqual(epoch.snapshot(),{
      exactMembership:true,epoch:1,liveSearches:0,fullPrizeReviews:1,
      hiddenPrizeRedeals:0
    });
  }finally{restore();}
});
