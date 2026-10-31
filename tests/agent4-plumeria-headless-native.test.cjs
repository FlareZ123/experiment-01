'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {gameplayProjection}=
  require('../scripts/agent7-native-fallback-paircheck.cjs');

/**
 * Retrospective rank6 and rank11 source-first historical pairs.
 * This test is a read-only observer parity check, never an outcome experiment.
 */
test('Plumeria owner observer preserves four genuine source-first policy games',()=>{
  const original=process.env.AGENT4_PLUMERIA_OPPORTUNITY_DEV;
  const run=flag=>{
    process.env.AGENT4_PLUMERIA_OPPORTUNITY_DEV=flag?'true':'false';
    return runDevelopment({
      sourceFirstRetrospective:true,
      actorOnlyComposition:true
    });
  };
  let baseline,observed;
  try{
    baseline=run(false);
    observed=run(true);
  }finally{
    if(original===undefined)delete process.env.AGENT4_PLUMERIA_OPPORTUNITY_DEV;
    else process.env.AGENT4_PLUMERIA_OPPORTUNITY_DEV=original;
  }
  assert.equal(baseline.attempted,4);
  assert.equal(observed.attempted,4);
  assert.equal(baseline.competitiveQualifiedGames,0);
  assert.equal(observed.competitiveQualifiedGames,0);
  assert.deepEqual(gameplayProjection(observed),gameplayProjection(baseline));
  const totals={roots:0,heldSourceOwner:0,nativePositiveSourceOwner:0,
    acceptedPassNativePositive:0,played:0,settled:0,byRank:{},
    contestedOwnerRoots:0,contestedBothNativePlayableRoots:0,
    sourceContestedOwnerRoots:0,sourceBothNativePlayableRoots:0,
    sourceFirstContestedTurns:0,sourceFirstBothNativePlayableTurns:0};
  for(let i=0;i<observed.rows.length;i++){
    const row=observed.rows[i],control=baseline.rows[i];
    assert.equal(row.trial.id,control.trial.id);
    assert.equal(row.sourceDealFingerprint,control.sourceDealFingerprint);
    assert.equal(row.actualStarterSeat,control.actualStarterSeat);
    const a=row.actorOnlyDecisionCoverage?.ownerPlumeriaOpportunityAudit;
    assert.ok(a,'Missing genuine native Plumeria observer');
    assert.equal(a.competitiveQualified,false);
    assert.ok(a.nativeStores>0);
    assert.ok(a.actualOwnerRoots>0);
    assert.equal(
      control.actorOnlyDecisionCoverage?.ownerPlumeriaOpportunityAudit,
      null
    );
    const sourceSeat=1-(row.trial.candidateSlot==='A'?0:1);
    const examples=a.nativePositiveSamples.filter(x=>x.seat===sourceSeat);
    const rank=row.trial.rank;
    const byRank=totals.byRank[rank]??{
      roots:0,heldSourceOwner:0,nativePositiveSourceOwner:0,
      sourceOwnerPositivePass:0,
      sourceContestedOwnerRoots:0,sourceBothNativePlayableRoots:0,
      sourceFirstContestedTurns:0,sourceFirstBothNativePlayableTurns:0
    };
    byRank.roots+=a.actualOwnerRoots;
    byRank.heldSourceOwner+=examples.filter(x=>x.heldCopies>0).length;
    byRank.nativePositiveSourceOwner+=examples.filter(
      x=>x.paperScreenedCopies>0).length;
    byRank.sourceOwnerPositivePass+=a.acceptedPassSamples.filter(
      x=>x.seat===sourceSeat).length;
    totals.byRank[rank]=byRank;
    assert.equal(a.bySeat[0].ownerRoots+a.bySeat[1].ownerRoots,
      a.actualOwnerRoots);
    const s=a.bySeat[sourceSeat];
    byRank.sourceContestedOwnerRoots+=s.bothHeldRoots;
    byRank.sourceBothNativePlayableRoots+=s.bothNativePlayableRoots;
    byRank.sourceFirstContestedTurns+=s.bothHeldFirstTurns;
    byRank.sourceFirstBothNativePlayableTurns+=s.bothNativePlayableFirstTurns;
    totals.contestedOwnerRoots+=a.contestedOwnerRoots;
    totals.contestedBothNativePlayableRoots+=a.contestedBothNativePlayableRoots;
    totals.sourceContestedOwnerRoots+=s.bothHeldRoots;
    totals.sourceBothNativePlayableRoots+=s.bothNativePlayableRoots;
    totals.sourceFirstContestedTurns+=s.bothHeldFirstTurns;
    totals.sourceFirstBothNativePlayableTurns+=s.bothNativePlayableFirstTurns;
    totals.roots+=a.actualOwnerRoots;
    totals.heldSourceOwner+=examples.filter(x=>x.heldCopies>0).length;
    totals.nativePositiveSourceOwner+=examples.filter(
      x=>x.paperScreenedCopies>0).length;
    totals.acceptedPassNativePositive+=a.acceptedPassWithPlayable;
    totals.played+=a.acceptedPlumeria;
    totals.settled+=a.settledEnergyDiscards;
  }
  console.log('AGENT4_SOURCEFIRST_PLUMERIA_NATIVE_PARITY',
    JSON.stringify({...totals,retrospectiveArms:4,
      gameplayUnchanged:true,competitiveQualifiedGames:0}));
});
