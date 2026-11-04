'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withGuard:withGuzmaHalaPayment}=
  require('../simulation/twinleaf/agent1-ghala-paper-payment-guard.cjs');
const {withRadiantZeroGateHook}=
  require('../simulation/twinleaf/agent1-radiant-zero-gate-hook.cjs');
const {probeGuzmaHalaPayment}=
  require('../simulation/twinleaf/agent30-guzma-hala-optional-payment-native.cjs');
const {probeZeroClimacticGate}=
  require('../simulation/twinleaf/agent1-radiant-zero-gate-native.cjs');

/**
 * Sequential real native prepared Store fixtures under both possible active
 * reversible guard nesting orders. One common wrapper lifetime must not cause
 * source misattribution, missing payment custody, or a missing turn ending.
 * They are separate fixtures; not one original dealt match.
 * @param {0|1} seat
 * @param {'gh-outside'|'radiant-outside'} order
 */
function probeComposition(seat,order){
  const run=()=>({
    gh:probeGuzmaHalaPayment(seat,2,{prismStarCost:true}),
    radiant:probeZeroClimacticGate(seat,0)
  });
  if(order==='gh-outside'){
    const outside=withGuzmaHalaPayment(
      ()=>withRadiantZeroGateHook(run));
    return {result:outside.result.result,
      ghAudit:outside.audit,radiantAudit:outside.result.audit};
  }
  const outside=withRadiantZeroGateHook(
    ()=>withGuzmaHalaPayment(run));
  return {result:outside.result.result,
    ghAudit:outside.result.audit,radiantAudit:outside.audit};
}

test('G&H two-card Prism and Radiant zero VMAX repairs compose without source collision',()=>{
  for(const order of ['gh-outside','radiant-outside'])
    for(const seat of [0,1]){
      const row=probeComposition(seat,order);
      console.log('AGENT1_PAPER_HOOK_COMPOSITION '+JSON.stringify({
        order,seat,ghAudit:row.ghAudit,
        radiantAudit:row.radiantAudit,
        radiantAfter:row.result.radiant.after
      }));
      assert.equal(row.result.gh.paymentError,null);
      assert.equal(row.result.gh.retrievalError,null);
      assert.deepEqual(row.result.gh.physicalPaymentCards
        .map(c=>c.inLostZone),[false,true]);
      assert.equal(row.ghAudit.observedPayments,1);
      assert.equal(row.ghAudit.settledPhysicalPayments,1);
      assert.equal(row.ghAudit.unresolvedPhysicalPayments,0);
      assert.equal(row.result.radiant.after.turn,5);
      assert.equal(row.result.radiant.after.activePlayer,1-seat);
      assert.deepEqual(row.result.radiant.pendingPrompts,[]);
      assert.equal(row.result.radiant.events
        .filter(x=>x.prompt==='ShuffleDeckPrompt').length,1);
      assert.equal(row.radiantAudit.observedUseConfirmations,1);
      assert.equal(row.radiantAudit.zeroSelections,1);
      assert.equal(row.radiantAudit.repairedTurnEnds,1);
      assert.equal(row.ghAudit.paperQualifiedGames,0);
      assert.equal(row.radiantAudit.paperQualifiedGames,0);
    }
});
