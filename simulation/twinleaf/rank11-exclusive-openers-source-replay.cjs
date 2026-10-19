'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runArm}=require('./new-moon-second-start-paired.cjs');
const {runMatch}=require('./headless.cjs');
const {withRank11DirectBoostShake}=
  require('./rank11-direct-boostshake.cjs');
const {withRank11HeldSeal}=require('./rank11-held-seal-policy.cjs');
const {withRank11ExclusiveOpeners}=
  require('./rank11-exclusive-openers.cjs');

const CASES=Object.freeze([
  {kind:'held-seal',sourceSeat:0,sourceFirst:true,
    seed:1097193676,candidate:'lockbreak'},
  {kind:'held-seal',sourceSeat:0,sourceFirst:true,
    seed:188431119,candidate:'lockbreak'},
  {kind:'direct',sourceSeat:0,sourceFirst:true,
    seed:1325646358,candidate:'source'},
  {kind:'direct',sourceSeat:0,sourceFirst:false,
    seed:1769876458,candidate:'source'},
  {kind:'direct',sourceSeat:1,sourceFirst:true,
    seed:4188921502,candidate:'source'},
  {kind:'direct',sourceSeat:1,sourceFirst:false,
    seed:1050426099,candidate:'source'}
]);

/** @param {object} game @param {0|1} seat @param {number} turn */
function ownerActions(game,seat,turn) {
  return game.rootActionLedger.filter(row=>
    row.playerSlot===seat && row.turnBefore===turn).map(row=>({
      action:row.action,card:row.card??null,ability:row.ability??null,
      attack:row.attack??null,prompt:row.pendingPrompt??null
    }));
}

/** Test only preselected mechanical controls. No rate inference. */
function run() {
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const opponent=plan.opponents.find(row=>row.rank===11);
  assert.equal(opponent?.status,'ready');
  const candidates=pairedCandidateSlots();
  const rows=[];
  for(const fixture of CASES) {
    const {sourceSeat,seed,kind,sourceFirst}=fixture;
    const list=candidates[fixture.candidate];
    assert.equal(list.length,60);
    const play=()=>runArm(list,opponent.cards,1-sourceSeat,seed,110,true);
    const baseline=kind==='direct' ?
      withRank11DirectBoostShake(sourceSeat,play,{
        k0AvoidAllGarbodorHeld:true,k1AvoidMissingGarbodor:true
      }) : withRank11HeldSeal(sourceSeat,play);
    const combined=withRank11ExclusiveOpeners(sourceSeat,play);
    const b=baseline.result,g=combined.result;
    assert.equal(b.verifiedByDrawLog,true);
    assert.equal(g.verifiedByDrawLog,true);
    assert.equal(b.firstTurnSlot,g.firstTurnSlot);
    assert.equal(b.firstTurnSlot,sourceFirst?sourceSeat:1-sourceSeat);
    assert.deepEqual(b.deckHashes,g.deckHashes);
    assert.equal(baseline.policyAudit.completed,true,
      'Archived standalone positive control did not complete');
    assert.equal(combined.policyAudit.selected?.kind,kind,
      'Exclusive branch differs from verified standalone route');
    const audit=combined.policyAudit[kind==='direct'?'direct':'held'];
    assert.equal(audit.completed,true,
      'Exclusive opening did not complete');
    const turn=baseline.policyAudit.opportunityTurn;
    const bActions=ownerActions(b,sourceSeat,turn);
    const cActions=ownerActions(g,sourceSeat,turn);
    assert.deepEqual(cActions,bActions,
      'Exclusive opening changed source first-own-turn root actions');
    rows.push({kind,sourceSeat,sourceActuallyFirst:sourceFirst,
      seed,candidate:fixture.candidate,turn,sourceRootActionsEqual:true,
      firstOwnTurnSourceActionCount:bActions.length,
      blockedOtherRoute:combined.policyAudit.blockedOtherRoute,
      competing:combined.policyAudit.competing,
      selected:combined.policyAudit.selected,
      baselineCompleted:baseline.policyAudit.completed,
      exclusiveCompleted:audit.completed});
  }
  const negativeSeed=207674218;
  const sourceSeat=0;
  const playNegative=()=>runMatch({
    deckA:opponent.cards,deckB:plan.candidate.cards,seed:negativeSeed,
    label:'rank11-direct-source-probe-v1',maxActions:48,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true
  });
  // Preserve the original unguarded negative control. Its aborted line is
  // evidence about the historical decoder, not about later K0/K1 guards.
  const legacy=withRank11DirectBoostShake(sourceSeat,playNegative);
  assert.equal(legacy.policyAudit.aborted?.step,'garbodor-search',
    'The original unguarded Garbodor search control changed');
  assert.equal(legacy.policyAudit.aborted?.ownerDeckSearch,true);
  const guarded=withRank11DirectBoostShake(sourceSeat,playNegative,{
    k0AvoidAllGarbodorHeld:true,k1AvoidMissingGarbodor:true
  });
  const exclusive=withRank11ExclusiveOpeners(sourceSeat,playNegative);
  for(const trial of [legacy,guarded,exclusive]) {
    assert.equal(trial.result.verifiedByDrawLog,true);
    assert.equal(trial.result.firstTurnSlot,sourceSeat);
    assert.deepEqual(trial.result.deckHashes,legacy.result.deckHashes);
  }
  const guardedAudit=guarded.policyAudit;
  const selected=exclusive.policyAudit.selected;
  const sameRoute=selected?.kind==='direct' ||
    (selected===null && guardedAudit.opportunityTurn===null);
  let sourceRootActionsEqual=null;
  if(sameRoute) {
    for(const turn of [1,2]) assert.deepEqual(
      ownerActions(guarded.result,sourceSeat,turn),
      ownerActions(exclusive.result,sourceSeat,turn));
    sourceRootActionsEqual=true;
  }
  if(selected?.kind==='direct') {
    assert.deepEqual(exclusive.policyAudit.direct.actions,guardedAudit.actions,
      'Exclusive policy changed direct route planned actions');
    assert.deepEqual(exclusive.policyAudit.direct.aborted,guardedAudit.aborted,
      'Exclusive policy changed direct route's abort');
  }
  const negative={sourceSeat,sourceActuallyFirst:true,seed:negativeSeed,
    legacyAbort:legacy.policyAudit.aborted,
    guardedOpportunityTurn:guardedAudit.opportunityTurn,
    guardedAbort:guardedAudit.aborted,
    guardedCompleted:guardedAudit.completed,
    selected,
    exclusiveDirectAbort:exclusive.policyAudit.direct.aborted,
    exclusiveHeldCompleted:exclusive.policyAudit.held.completed,
    sameRoute,sourceRootActionsEqual,
    legacyAndGuardedSameOpening:
      legacy.policyAudit.opportunityTurn===guardedAudit.opportunityTurn,
    qualified:false};
  return {schema:'rank11-exclusive-opener-retrospective-seven-fixture-v3',
    twinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceRank:11,tested:rows.length+1,rows,negative,
    prospective:false,qualifiedCompetitiveGames:0,
    boundary:'Six selected authentic positive controls and one historical unguarded abort compared to revised guarded policies. No win-rate inference'};

}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={CASES,run};
