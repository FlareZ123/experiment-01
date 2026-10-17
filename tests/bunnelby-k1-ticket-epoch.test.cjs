'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {build}=require('../simulation/twinleaf/ticket-k1-epoch-contrast.cjs');
const {installRedeemableTicketPaperOrderHook}=
  require('../simulation/twinleaf/redeemable-ticket-paper-hook.cjs');
const {createOwnerDeckKnowledgeEpoch}=
  require('../simulation/twinleaf/owner-deck-knowledge-epoch.cjs');
const {snapshotPrizeCardIdentities,invalidateAfterRootHiddenPrizeIngress}=
  require('../simulation/twinleaf/root-prize-knowledge-observer.cjs');
const {hasBenchEvolutionTarget,hasK0PossibleBenchEvolutionTarget}=
  require('../simulation/twinleaf/bunnelby-evolution-policy.cjs');

test('root PlayCardAction for paper-corrected Ticket invalidates K1 in both hidden-order worlds',()=>{
  const engine=name=>require(path.resolve(__dirname,
    '../vendor/twinleaf/ptcg-server/output',name));
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {Format}=engine('game/store/card/card-types');
  const stages=[build(0),build(6)];
  const epochs=stages.map(()=>createOwnerDeckKnowledgeEpoch());
  for(const epoch of epochs)epoch.observeOwnerDeckSearch();
  const originalPrizes=stages.map(x=>x.previousPrizeNames);
  const before=stages.map(x=>snapshotPrizeCardIdentities(x.state));
  const restore=installRedeemableTicketPaperOrderHook();
  try{
    stages.forEach(stage=>{
      stage.state.gameSettings.format=Format.EXPANDED;
      stage.state.turn=2;
      const index=stage.a.hand.cards.indexOf(stage.ticket);
      assert.ok(index>=0);
      stage.store.dispatch(new PlayCardAction(stage.a.id,index,
        {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
      assert.ok(stage.a.discard.cards.includes(stage.ticket));
    });
  }finally{restore();}
  assert.deepEqual(originalPrizes[0],originalPrizes[1]);
  assert.deepEqual(stages.map(x=>hasBenchEvolutionTarget(x.a)),[false,true],
    'The two physical resulting hidden partitions differ');
  for(let i=0;i<stages.length;i++){
    const stage=stages[i],epoch=epochs[i];
    assert.deepEqual(invalidateAfterRootHiddenPrizeIngress(
      before[i],stage.state,new Map([[stage.a.id,epoch]])),[stage.a.id]);
    assert.equal(epoch.exactMembershipKnown(),false);
    assert.equal(epoch.snapshot().hiddenPrizeRedeals,1);
    assert.equal(hasK0PossibleBenchEvolutionTarget(
      stage.a,stage.sourcePrints),true);
    assert.ok(stage.a.prizes.every(slot=>slot.isSecret));
  }
  assert.deepEqual(epochs.map(e=>e.snapshot()),
    [epochs[0].snapshot(),epochs[0].snapshot()]);
});
