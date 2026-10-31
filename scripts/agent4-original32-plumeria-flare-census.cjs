'use strict';
const assert=require('node:assert/strict');
const {runPreregisteredPlumeria,FRAME}=
  require('../simulation/evaluation/agent38-plumeria-preregistered-32.cjs');

const VERSION='agent4-original32-owner-plumeria-flare-pass-choice-census-v2';

/**
 * All 32 PREVIOUSLY registered original Store games, without changing the
 * native action policy. The only new intervention is the exact-both-seat,
 * owner-private read-only Plumeria/Team Flare opportunity monitor.
 *
 * Does not qualify win rates or use an outcome to select a trial.
 */
function runSourceOriginal32ContestCensus(){
  const key='AGENT4_PLUMERIA_OPPORTUNITY_DEV';
  const previous=process.env[key];
  process.env[key]='true';
  let parent;
  try{parent=runPreregisteredPlumeria('control');}
  finally{
    if(previous===undefined)delete process.env[key];
    else process.env[key]=previous;
  }
  assert.equal(parent.result.attempted,32);
  assert.equal(parent.result.rows.length,32);
  assert.equal(parent.registrationPath,FRAME);
  assert.equal(parent.intervention,'unchanged-canonical-control');
  assert.equal(parent.competitiveQualifiedGames,0);
  const byRank={};
  const rows=parent.result.rows.map(row=>{
    const rank=row.trial.rank;
    const stats=byRank[rank]??{
      rank,originalGames:0,sourceAudits:0,unobservedSourceAudits:0,
      sourceOwnerRoots:0,sourceFirstOwnerTurns:0,
      bothHeldSourceRoots:0,bothNativePlayableSourceRoots:0,
      bothHeldSourceFirstTurns:0,
      bothNativePlayableSourceFirstTurns:0,
      bothNativePlayableSourcePassRoots:0,
      bothNativePlayableSourceFirstTurnPassRoots:0,
      sourceGamesWithBothNativePlayablePass:0
    };
    byRank[rank]=stats;
    stats.originalGames++;
    const sourceSeat=row.trial.candidateSlot==='A'?1:0;
    if(row.sourceSeat!==undefined)
      assert.equal(row.sourceSeat,sourceSeat);
    assert.equal(row.qualifiesForCompetitiveInference,false);
    const audit=row.actorOnlyDecisionCoverage?.ownerPlumeriaOpportunityAudit;
    if(!audit?.bySeat?.[sourceSeat]){
      stats.unobservedSourceAudits++;
      return {id:row.trial.id,rank,sourceSeat,
        sourceDeckFingerprint:row.sourceDeckFingerprint??null,
        sourceDealFingerprint:row.sourceDealFingerprint??null,
        status:row.status??null,ownerAuditStatus:'missing-or-error',
        anyNativeContest:false,contestRoots:0,sourceOwnerRoots:null,
        sourceFirstOwnerTurns:null,sourceExamples:[]};
    }
    assert.ok(audit.passive&&audit.competitiveQualified===false);
    assert.match(audit.version,/^agent4-plumeria-native-owner-opportunity-v2/);
    assert.equal(audit.bySeat[0].ownerRoots+audit.bySeat[1].ownerRoots,
      audit.actualOwnerRoots);
    const s=audit.bySeat[sourceSeat];
    stats.sourceAudits++;
    stats.sourceOwnerRoots+=s.ownerRoots;
    stats.sourceFirstOwnerTurns+=s.firstOwnerTurns;
    stats.bothHeldSourceRoots+=s.bothHeldRoots;
    stats.bothNativePlayableSourceRoots+=s.bothNativePlayableRoots;
    stats.bothHeldSourceFirstTurns+=s.bothHeldFirstTurns;
    stats.bothNativePlayableSourceFirstTurns+=s.bothNativePlayableFirstTurns;
    stats.bothNativePlayableSourcePassRoots+=s.bothPlayablePassRoots;
    stats.bothNativePlayableSourceFirstTurnPassRoots+=
      s.firstTurnBothPlayablePassRoots;
    if(s.bothPlayablePassRoots>0)
      stats.sourceGamesWithBothNativePlayablePass++;
    const examples=audit.contestedOwnerSamples.filter(
      sample=>sample.seat===sourceSeat).slice(0,8);
    const positiveExamples=audit.contestedOwnerSamples.filter(
      sample=>sample.seat===sourceSeat&&
        sample.paperScreenedBothPlayable).slice(0,8);
    const passExamples=audit.bothPlayablePassSamples.filter(
      sample=>sample.seat===sourceSeat).slice(0,8);
    return {
      id:row.trial.id,rank,sourceSeat,
      sourceDeckFingerprint:row.sourceDeckFingerprint??null,
      sourceDealFingerprint:row.sourceDealFingerprint??null,
      status:row.status??null,
      ownerAuditStatus:'actual-original-store',
      sourceOwnerRoots:s.ownerRoots,sourceFirstOwnerTurns:s.firstOwnerTurns,
      bothHeldSourceRoots:s.bothHeldRoots,
      bothNativePlayableSourceRoots:s.bothNativePlayableRoots,
      bothHeldSourceFirstTurns:s.bothHeldFirstTurns,
      bothNativePlayableSourceFirstTurns:s.bothNativePlayableFirstTurns,
      bothNativePlayableSourcePassRoots:s.bothPlayablePassRoots,
      bothNativePlayableSourceFirstTurnPassRoots:
        s.firstTurnBothPlayablePassRoots,
      auditSamplesMayBeTruncated:
        audit.contestedOwnerRoots>audit.contestedOwnerSamples.length,
      sourceExamples:examples,
      positiveExamples,passExamples
    };
  });
  assert.deepEqual(Object.keys(byRank).map(Number).sort((a,b)=>a-b),
    [6,11]);
  assert.equal(Object.values(byRank)
    .reduce((n,s)=>n+s.originalGames,0),32);
  return {version:VERSION,registeredFrame:FRAME,
    frozenBeforeThisObserver:true,pinnedEngine:parent.result.enginePin,
    auditedPolicy:'unchanged-original-Store-first-return',
    sourceOwnerReadOnly:true,nativeCardCanPlayChecksOnly:true,
    sameRootNativeDispatchCounterfactual:false,
    fullPhysicalCardConservationUnverified:true,
    gameWinRateQualified:false,competitiveQualifiedGames:0,
    sampleLimits:'At most 8 contested, 8 positive, 8 positive Pass samples per arm; original underlying audit caps 128 samples per kind.',
    byRank,rows};
}

module.exports={VERSION,runSourceOriginal32ContestCensus};
if(require.main===module)
  process.stdout.write(JSON.stringify(runSourceOriginal32ContestCensus(),null,2)+'\n');
