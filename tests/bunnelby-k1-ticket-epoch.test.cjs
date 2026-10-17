'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {build}=require('../simulation/twinleaf/ticket-k1-epoch-contrast.cjs');
const {installRedeemableTicketPaperOrderHook}=
  require('../simulation/twinleaf/redeemable-ticket-paper-hook.cjs');
const {createOwnerDeckKnowledgeEpoch}=
  require('../simulation/twinleaf/owner-deck-knowledge-epoch.cjs');
const {snapshotPrizeCardIdentities,invalidateAfterRootHiddenPrizeIngress}=
  require('../simulation/twinleaf/root-prize-knowledge-observer.cjs');
const {hasBenchEvolutionTarget,hasK0PossibleBenchEvolutionTarget}=
  require('../simulation/twinleaf/bunnelby-evolution-policy.cjs');

test('paper-corrected Store Ticket invalidates a prior genuine K1 epoch in both hidden-order worlds',()=>{
  const stages=[build(0),build(6)];
  const epochs=stages.map(()=>createOwnerDeckKnowledgeEpoch());
  for(const epoch of epochs)epoch.observeOwnerDeckSearch();
  const originalPrizes=stages.map(x=>x.previousPrizeNames);
  const before=stages.map(x=>snapshotPrizeCardIdentities(x.state));
  const restore=installRedeemableTicketPaperOrderHook();
  try{
    stages.forEach(stage=>stage.store.reduceEffect(stage.state,
      new stage.TrainerEffect(stage.a,stage.ticket)));
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
