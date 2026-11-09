'use strict';
const assert=require('node:assert/strict');
const registration=require('../../results/aichi-2026/registrations/agent32-prospective-29rank-116native-20261109.json');
const {runNativeBatch}=require('./agent32-fresh-perfection-field.cjs');
const {withRegisteredFourthSourcePassAudit}=
  require('../twinleaf/agent45-original-source-pass-audit.cjs');
const VERSION='agent45-actual-rank14-source-pass-first-consequential-fork-v1';
const TARGET='14:3029:B:new-moon-lockbreaker-v1';

/**
 * Actual original source-bot Pass owner-visible, post-decision census.
 * Reuses the same original rank14 physical deal and three prerequisite
 * runner rows, no rewrites to policy or to either printed 60.
 */
function run(deps={}){
  const group=registration.groups.find(row=>row.id===TARGET);
  assert.ok(group);
  const registered=[...registration.groups.slice(0,3),group]
    .map(row=>({...row}));
  const execute=deps.batch??runNativeBatch;
  const wrap=deps.observe??withRegisteredFourthSourcePassAudit;
  const arms=[];
  for(const pivot of [false,true]){
    const wrapped=wrap(()=>execute(true,undefined,{
      registeredTrials:registered,
      registeredFrameName:registration.schema,
      nativeRootActionLimit:registration.nativeRootLimit,
      vipAfterPass:true,vipPreferMewtwoDonor:true,
      perfectionTransition:pivot
    }));
    const row=wrapped.result.selected.rawDevelopment.rows[3];
    assert.equal(row.trial.id,TARGET);
    const audit=wrapped.audit;
    const summarize=e=>({
      turn:e.globalTurn,rootOrdinal:e.rootActionOrdinal,
      nativePassTransitionVerified:e.nativePassTransitionVerified,
      ownerHand:e.actorHandPrintings,
      active:e.actorPublic?.active??null,
      bench:e.actorPublic?.bench??null,
      ownerDeckCount:e.actorPublic?.deckCount??null,
      ownerDiscard:e.actorPublic?.discard??[],
      opponentActive:e.opponentPublic?.active??null,
      ownTurnResources:e.actorTurnResources
    });
    const events=audit.events.map(summarize);
    arms.push({
      candidatePivot:pivot,sourceSeat:0,
      nativeFinished:row.finished===true,winnerSeat:row.winner??null,
      originalFullDealSha:row.fullPhysicalDealFingerprint??null,
      sourceDealSha:row.sourceDealFingerprint??null,
      nativeTargetRootLinked:row.nativeAcceptedTargetSidecar?.rootOrdinalLinked===true,
      passEvents:audit.count,passRootsLinked:audit.rootOrdinalLinked,
      nativePassesSettled:audit.verifiedNativeTurnTransitions,
      capturedStoreGames:audit.gameCount,observedGameOrdinal:audit.gameOrdinal,
      observedGameId:audit.gameId,events,competitiveQualified:false
    });
  }
  const identicalDeals=arms.every(x=>x.originalFullDealSha&&x.sourceDealSha&&
    x.originalFullDealSha===arms[0].originalFullDealSha&&
    x.sourceDealSha===arms[0].sourceDealSha);
  const passesAllLinked=arms.every(x=>
    x.nativeTargetRootLinked&&x.passRootsLinked&&
    x.nativePassesSettled===x.passEvents&&
    x.observedGameId===TARGET&&x.capturedStoreGames===4);
  const result={version:VERSION,registeredDeal:TARGET,
    originalSource60Unchanged:true,candidate60Unchanged:true,
    originalSeed:group.seed,identicalDeals,passesAllLinked,arms,
    retrospectiveOwnerObservationOnly:true,competitiveGamesQualified:0};
  process.stdout.write('AGENT45_RANK14_SOURCE_PASS '+JSON.stringify(result)+'\n');
  if(!identicalDeals||!passesAllLinked)process.exitCode=1;
  return result;
}
if(require.main===module)run();
module.exports={VERSION,TARGET,run};
