'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runArm}=require('./new-moon-second-start-paired.cjs');
const {withRank11HeldSeal}=require('./rank11-held-seal-policy.cjs');
const {withRank11DirectBoostShake}=require('./rank11-direct-boostshake.cjs');
const {FIXTURES}=require('./rank11-held-seal-newmoon-coupled-reply.cjs');

/**
 * Retrospective falsification of naive prototype-wrapper nesting. This is a
 * regression design inquiry; do not use selected positive trials to estimate
 * the rate at which these actions arise from new physical deals.
 */
function run() {
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const source=plan.opponents.find(row=>row.rank===11);
  assert.equal(source?.status,'ready');
  const contender=pairedCandidateSlots().lockbreak;
  assert.equal(contender.length,60);
  const rows=[];
  for(const fixture of FIXTURES) {
    const play=()=>runArm(contender,source.cards,1,fixture.seed,110,true);
    const alone=withRank11HeldSeal(0,play);
    const outer=withRank11DirectBoostShake(0,
      ()=>withRank11HeldSeal(0,play));
    const held=outer.result;
    const aloneGame=alone.result;
    const nestedGame=held.result;
    assert.equal(aloneGame.verifiedByDrawLog,true);
    assert.equal(nestedGame.verifiedByDrawLog,true);
    assert.equal(aloneGame.firstTurnSlot,0);
    assert.equal(nestedGame.firstTurnSlot,0);
    assert.deepEqual(aloneGame.deckHashes,nestedGame.deckHashes);
    const actions=game=>game.rootActionLedger.filter(row=>
      row.playerSlot===0 && row.turnBefore===1).map(row=>({
        action:row.action,card:row.card??null,ability:row.ability??null,
        prompt:row.pendingPrompt??null
      }));
    const baseActions=actions(aloneGame);
    const nestedActions=actions(nestedGame);
    rows.push({
      trial:fixture.trial,seed:fixture.seed,preselectedPositive:true,
      standaloneHeld:alone.policyAudit,
      nestedHeld:held.policyAudit,
      nestedDirect:outer.policyAudit,
      sourceActionsIdentical:JSON.stringify(baseActions)===
        JSON.stringify(nestedActions),
      standaloneSourceActions:baseActions,
      nestedSourceActions:nestedActions,
      competitiveQualified:false
    });
  }
  return {schema:'rank11-naive-dual-decoder-retrospective-falsification-v1',
    sourceRank:11,candidate:'frozen New Moon Lockbreaker v1',
    tested:rows.length,rows,competitiveQualifiedGames:0,
    boundary:'Five retrospectively preselected source Seal-positive starts; no prospective access or win-rate inference'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
