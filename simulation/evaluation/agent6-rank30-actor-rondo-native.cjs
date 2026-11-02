'use strict';

const assert=require('node:assert/strict');
const {scheduledArms}=require('./agent25-nine-omitted-archetypes-source-readiness.cjs');
const {runGroup}=require('./agent7-rank30-psychic-bench-stage-aba.cjs');
const {withRank30ActorRondoRetreat,VERSION}=
  require('../twinleaf/agent6-rank30-actor-rondo-retreat.cjs');

/** @param {object} game @param {0|1} seat @returns {object} */
function extract(game,seat){
  const sourceRoots=(game.rootActionLedger??[]).filter(row=>
    row.playerSlot===seat&&row.turnBefore>=28&&row.turnBefore<=35);
  const opponentRoots=(game.rootActionLedger??[]).filter(row=>
    row.playerSlot!==seat&&row.turnBefore>=28&&row.turnBefore<=35);
  return {
    id:game.trial.id,
    initialFullPhysicalDeal:game.fullPhysicalDealFingerprint,
    sourcePhysicalDeal:game.sourceDealFingerprint,
    originalSourceSixty:game.sourceDeckFingerprint,
    fixedCandidateSixty:game.candidateDeckFingerprint,
    sourceActuallyFirst:game.sourceActuallyFirst,
    status:game.status??(game.finished?'engine-terminal':'censored'),
    finished:game.finished,winnerUnqualified:game.winner,
    finalPrizes:game.finalPrizes,
    sourceRoots,opponentRoots,
    nativeTargetSidecar:game.nativeAcceptedTargetSidecar,
    sourceAttackSettlement:game.sourceAttackSettlement,
    candidateAttackSettlement:game.candidateAttackSettlement,
    rootActionLedgerSha256:game.rootActionLedgerSha256,
    competitiveQualified:false
  };
}

/**
 * Exact historical source-deal, both candidate, both physical seat A/B.
 * The control and treatment share the same source Psychic Bench staging;
 * the change is in the actor's true returned root choice, not Store.dispatch.
 *
 * @returns {object} Full eight-arm archive with all native failures.
 */
function run(){
  const source=scheduledArms().filter(row=>row.rank===30);
  assert.equal(source.length,4);
  const groups=[];
  for(const slot of ['A','B']){
    const trials=source.filter(t=>t.candidateSlot===slot);
    assert.equal(trials.length,2);
    const sourceSeat=slot==='A'?1:0;
    const targetTurn=slot==='A'?30:33;
    const arms=[];
    for(const treatment of [false,true]){
      try{
        const observed=withRank30ActorRondoRetreat(()=>
          runGroup(trials,sourceSeat,true),{sourceSeat,targetTurn,treatment});
        assert.equal(observed.result.rows.length,2);
        arms.push({treatment,status:'native-complete-or-capped',
          actorAudit:observed.audit,
          games:observed.result.rows.map(g=>extract(g,sourceSeat)),
          competitiveQualified:false});
      }catch(error){
        arms.push({treatment,status:'native-error',
          error:String(error?.stack??error).slice(0,2600),
          actorAudit:error?.agent6Rank30ActorRondoAudit??null,
          games:[],competitiveQualified:false});
      }
    }
    const paired=arms.every(a=>a.status==='native-complete-or-capped')&&
      arms[0].games.every((game,i)=>
        game.id===arms[1].games[i].id&&
        JSON.stringify(game.initialFullPhysicalDeal)===
          JSON.stringify(arms[1].games[i].initialFullPhysicalDeal));
    groups.push({slot,sourceSeat,targetTurn,
      sameFullPhysicalDeals:paired,arms});
  }
  const attempts=groups.flatMap(g=>g.arms).flatMap(a=>a.games);
  return {version:VERSION,originalSourceRank:30,
    sourceRank30ExactPrintedSixty:true,
    retrospectiveSourceSeedSelection:true,
    sameOriginalBenchFundingPolicyBothArms:true,
    frozenCandidateSixties:2,sourceSeedSeatGroups:2,
    attemptedGames:8,
    nativeGroupErrors:groups.flatMap(g=>g.arms).filter(a=>
      a.status==='native-error').length,
    physicallyMatchedPairs:groups.filter(g=>g.sameFullPhysicalDeals).length*2,
    actorSelectedRetreats:groups.flatMap(g=>g.arms).reduce((sum,arm)=>
      sum+(arm.actorAudit?.selectedRetreatRoots??0),0),
    acceptedRetreatRoots:attempts.reduce((sum,g)=>
      sum+g.sourceRoots.filter(r=>r.action==='RetreatAction').length,0),
    competitiveQualifiedGames:0,
    groups,
    caveat:'Historical unqualified development comparison only. Root-choice changes and Store settlements must be checked separately; no paper-clock or human opponent policy certification.'};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,run};
