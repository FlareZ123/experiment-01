'use strict';

const assert=require('node:assert/strict');
const {scheduledArms}=require('./agent25-nine-omitted-archetypes-source-readiness.cjs');
const {runGroup}=require('./agent7-rank30-psychic-bench-stage-aba.cjs');
const {VERSION}=require(
  '../twinleaf/agent6-owner-public-skyliner-rondo-frontier.cjs');

/**
 * Scoped original source owner flag. Same registered opponent and candidate
 * cards, source seat, physical deal, actor composition and target staging.
 * @param {object[]} trials Registered original rank30 opponent cases.
 * @param {0|1} sourceSeat True source physical seat.
 * @param {boolean} treatment Canonical root Skyliner Rondo option.
 * @returns {object} Original native runDevelopment response.
 */
function runOption(trials,sourceSeat,treatment){
  const flag='AGENT6_SKYLINER_RONDO_ROOT_DEV';
  const seat='AGENT6_SKYLINER_RONDO_OWNER_SEAT';
  const old=process.env[flag],oldSeat=process.env[seat];
  try{
    process.env[flag]=treatment?'true':'false';
    process.env[seat]=String(sourceSeat);
    return runGroup(trials,sourceSeat,true);
  }finally{
    if(old===undefined)delete process.env[flag];
    else process.env[flag]=old;
    if(oldSeat===undefined)delete process.env[seat];
    else process.env[seat]=oldSeat;
  }
}

/** @param {object} game @param {0|1} seat @returns {object} */
function evidence(game,seat){
  const root=game.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
  const sourceRoots=(game.rootActionLedger??[]).filter(row=>
    row.playerSlot===seat&&row.turnBefore>=28&&row.turnBefore<=40);
  const opponentRoots=(game.rootActionLedger??[]).filter(row=>
    row.playerSlot!==seat&&row.turnBefore>=28&&row.turnBefore<=40);
  const retreats=sourceRoots.filter(row=>row.action==='RetreatAction');
  const rondos=sourceRoots.filter(row=>row.action==='AttackAction'&&
    row.attack==='Full Moon Rondo');
  return {id:game.trial.id,sourceSeat:seat,
    fullInitialPhysicalDeal:game.fullPhysicalDealFingerprint,
    sourcePhysicalDeal:game.sourceDealFingerprint,
    fixedCandidatePrinting60:game.candidateDeckFingerprint,
    fixedSourcePrinting60:game.sourceDeckFingerprint,
    actorChosenRetreats:root?.typedIntentCounts?.['skyliner-rondo-retreat']??0,
    nativePhysicallyConfirmedRetreats:root?.nativePhysicalConfirmedByIntent
      ?.['skyliner-rondo-retreat']??0,
    nativePhysicalUnconfirmedRetreats:root?.nativePhysicalUnconfirmedByIntent
      ?.['skyliner-rondo-retreat']??0,
    nativeRootAcceptedRetreatReceipts:(root?.nativeRootAcceptances??[])
      .filter(a=>a.kind==='skyliner-rondo-retreat'&&a.accepted===true),
    nativeRootRejectedRetreatReceipts:(root?.nativeRootAcceptances??[])
      .filter(a=>a.kind==='skyliner-rondo-retreat'&&a.accepted===false),
    canonicalRootAuditVersion:root?.version??null,
    sourceRetreats:retreats,sourceRondos:rondos,
    sourceRoots,opponentRoots,
    sourceAttackSettlement:game.sourceAttackSettlement,
    nativeTargetSidecar:game.nativeAcceptedTargetSidecar,
    sourceActuallyFirst:game.sourceActuallyFirst,
    winnerUnqualified:game.winner,finalPrizes:game.finalPrizes,
    status:game.status??(game.finished?'engine-terminal':'censored'),
    rowNativeError:game.error??null,
    nativeStoreCauseStack:game.nativeStoreCauseStack??null,
    nativeAbortEvidence:game.nativeAbortEvidence??null,
    originalRootLedgerHash:game.rootActionLedgerSha256,
    competitiveQualified:false};
}

/** @returns {object} Retrospective exact original 60, two-seat A/B comparison. */
function run(){
  const source=scheduledArms().filter(row=>row.rank===30);
  assert.equal(source.length,4);
  const groups=[];
  for(const slot of ['A','B']){
    const trials=source.filter(t=>t.candidateSlot===slot);
    assert.equal(trials.length,2);
    const sourceSeat=slot==='A'?1:0;
    const arms=[];
    for(const treatment of [false,true]){
      try{
        const result=runOption(trials,sourceSeat,treatment);
        assert.equal(result.rows.length,2);
        arms.push({treatment,status:'native-complete-or-capped',
          games:result.rows.map(g=>evidence(g,sourceSeat)),
          competitiveQualified:false});
      }catch(error){
        arms.push({treatment,status:'native-error',
          error:String(error?.stack??error).slice(0,2600),
          games:[],competitiveQualified:false});
      }
    }
    const equal=arms.every(a=>a.status==='native-complete-or-capped')&&
      arms[0].games.every((a,i)=>a.id===arms[1].games[i].id&&
        JSON.stringify(a.fullInitialPhysicalDeal)===
          JSON.stringify(arms[1].games[i].fullInitialPhysicalDeal));
    groups.push({slot,sourceSeat,exactSameFullInitialPhysicalDeals:equal,arms});
  }
  const games=groups.flatMap(g=>g.arms).flatMap(a=>a.games);
  return {version:VERSION,originalRank:30,exactOriginalSourceSixty:true,
    existingSourceSeedsRetrospectivelySelected:true,
    sourceBenchPsychicStagingHeldOnBothArms:true,
    sameCanonicalTwoPlayerCompositionExceptOneRootFlag:true,
    totalNativeAttempts:8,
    errors:groups.flatMap(g=>g.arms).filter(a=>a.status==='native-error').length,
    matchedPhysicalPairs:groups.filter(g=>g.exactSameFullInitialPhysicalDeals).length*2,
    nativeRowErrors:games.filter(g=>g.status==='engine-error').length,
    nativeActorChosenRetreats:games.reduce((n,g)=>n+g.actorChosenRetreats,0),
    realSourceRetreatRoots:games.reduce((n,g)=>n+g.sourceRetreats.length,0),
    sourceRondoAttackDeclarations:games.reduce((n,g)=>n+g.sourceRondos.length,0),
    settledSourceRondoAttacks:games.reduce((n,g)=>n+
      (g.sourceAttackSettlement?.attacks??[]).filter(a=>
        a.attackName==='Full Moon Rondo'&&
        a.settledPromptChain===true).length,0),
    nativeConfirmedRetreats:games.reduce((n,g)=>
      n+g.nativePhysicallyConfirmedRetreats,0),
    nativeUnconfirmedRetreats:games.reduce((n,g)=>
      n+g.nativePhysicalUnconfirmedRetreats,0),
    competitiveQualifiedGames:0,groups,
    caveat:'Retrospective source-policy development test. Exact paper rules, owner information safety across all fallback, tournament clock and competitive opponents remain unqualified.'};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,run};
