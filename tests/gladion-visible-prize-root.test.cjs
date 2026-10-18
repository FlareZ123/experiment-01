'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {fixture}=require('../simulation/twinleaf/redeemable-ticket-paper-regression.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {makeGladionVisiblePrizeResolver}=
  require('../simulation/twinleaf/gladion-visible-prize-resolver.cjs');
const {createOwnerDeckKnowledgeEpoch}=
  require('../simulation/twinleaf/owner-deck-knowledge-epoch.cjs');
const {snapshotPrizeCardIdentities,invalidateAfterRootHiddenPrizeIngress,
  observeAfterRootFullPrizeReview}=
  require('../simulation/twinleaf/root-prize-knowledge-observer.cjs');
const engine=name=>require(path.resolve(__dirname,
  '../vendor/twinleaf/ptcg-server/output',name));

test('real Gladion Store reveal enables legal priority retrieval from later Prize',()=>{
  const f=fixture();
  const {Format}=engine('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ChoosePrizePromptResolver}=
    engine('simple-bot/prompt-resolver/choose-prize-prompt-resolver');
  const definitions=engine('simple-bot/simple-bot-definitions');
  const manager=initializeCards();
  const gladion=manager.getCardByName('Gladion CIN');
  const grandTree=manager.getCardByName('Grand Tree SCR');
  assert.ok(gladion&&grandTree);
  f.state.turn=2;
  f.state.gameSettings.format=Format.EXPANDED;
  f.a.prizes.forEach(p=>{p.isSecret=true});
  f.a.prizes[3].cards=[grandTree];
  f.a.hand.cards.push(gladion);
  const epoch=createOwnerDeckKnowledgeEpoch();
  const epochs=new Map([[f.a.id,epoch]]);
  const before=snapshotPrizeCardIdentities(f.state);
  f.store.dispatch(new PlayCardAction(f.a.id,
    f.a.hand.cards.indexOf(gladion),
    {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));

  const pending=f.state.prompts.find(p=>p.result===undefined);
  assert.equal(pending?.constructor.name,'ChoosePrizePrompt');
  assert.ok(f.a.prizes.every(p=>p.isSecret===false));
  assert.deepEqual(observeAfterRootFullPrizeReview(
    before,f.state,epochs),[f.a.id]);
  assert.equal(epoch.exactMembershipKnown(),true);

  const opts={scores:definitions.defaultStateScores,
    tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers};
  const generic=new ChoosePrizePromptResolver(opts)
    .resolvePrompt(f.state,f.a,pending);
  assert.equal(generic.result[0],f.a.prizes[0],
    'pinned generic resolver retrieves the first occupied slot');

  const Root=makeGladionVisiblePrizeResolver('Grand Tree SCR',
    (state,player,prompt)=>state===f.store.state&&
      f.store.state.players.includes(player)&&
      f.store.state.prompts.includes(prompt)&&prompt.result===undefined);
  const resolver=new Root(opts);
  const resolved=resolver.resolvePrompt(f.state,f.a,pending);
  assert.equal(resolved?.constructor.name,'ResolvePromptAction');
  assert.deepEqual(resolved.result,[f.a.prizes[3]]);
  assert.equal(pending.validate(resolved.result,f.state),true);
  const cloned={...f.state};
  assert.equal(resolver.resolvePrompt(cloned,f.a,pending),undefined,
    'a nonroot hypothetical state cannot use physically known Prize values');

  const beforeResolve=snapshotPrizeCardIdentities(f.state);
  f.store.dispatch(resolved);
  assert.ok(f.a.hand.cards.includes(grandTree));
  assert.ok(f.a.prizes.flatMap(p=>p.cards).includes(gladion));
  assert.deepEqual(invalidateAfterRootHiddenPrizeIngress(
    beforeResolve,f.state,epochs),[]);
  assert.equal(epoch.exactMembershipKnown(),true);
});
