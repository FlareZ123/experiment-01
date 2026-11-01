'use strict';

const assert=require('node:assert/strict');
const {scheduledArms}=
  require('./agent25-nine-omitted-archetypes-source-readiness.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {BASE}=require('./agent7-rank30-psychic-bench-stage-aba.cjs');
const {withRank30FundedRondoPassFork}=
  require('../twinleaf/agent6-rank30-real-store-rondo-pass-fork.cjs');

const VERSION='agent6-retrospective-original-rank30-actual-rondo-v1';

/**
 * Preserve original rank30 exact source physical printed 60 and already
 * used source deal; Stage is the same existing source-only treatment from
 * Agent7 on both arms. The only new fork is an owner-authorized real
 * Store source PassTurnAction when the exact printed Clefairy has 2 Psychic.
 */
function run(){
  const scheduled=scheduledArms().filter(x=>x.rank===30);
  assert.equal(scheduled.length,4);
  const out=[];
  for(const trial of scheduled){
    const seat=trial.candidateSlot==='A'?1:0;
    const turn=trial.candidateSlot==='A'?30:33;
    const arms=[];
    for(const treatment of [false,true]){
      const oldFlag=process.env.AGENT7_RONDO_PSYCHIC_BENCH_DEV;
      const oldSeat=process.env.AGENT7_RONDO_PSYCHIC_BENCH_OWNER_SEAT;
      try{
        process.env.AGENT7_RONDO_PSYCHIC_BENCH_DEV='true';
        process.env.AGENT7_RONDO_PSYCHIC_BENCH_OWNER_SEAT=String(seat);
        const observed=withRank30FundedRondoPassFork(()=>
          runDevelopment({...BASE,registeredTrials:[trial],
            registeredFrameName:VERSION+'-'+trial.id}),{
            sourceSeat:seat,targetTurn:turn,treatment
          });
        assert.equal(observed.result.attempted,1);
        const game=observed.result.rows[0];
        const ownRoots=(game.rootActionLedger??[])
          .filter(r=>r.playerSlot===seat &&
            r.turnBefore>=turn&&r.turnBefore<=turn+3);
        const enemyRoots=(game.rootActionLedger??[])
          .filter(r=>r.playerSlot===1-seat &&
            r.turnBefore>=turn&&r.turnBefore<=turn+3);
        arms.push({status:'native-complete-or-capped',treatment,
          sourceSeat:seat,seed:trial.seed,id:trial.id,
          sourcePhysicalDeal:game.sourceDealFingerprint,
          fullPhysicalDeal:game.fullPhysicalDealFingerprint,
          actualFirstSeat:game.actualStarterSeat,
          nativePassAudit:observed.audit,
          nativeAcceptedTargets:game.nativeAcceptedTargetSidecar,
          sourceRootActions:ownRoots,
          opponentRootActions:enemyRoots,
          sourceSettledAttacks:game.sourceAttackSettlement,
          opponentAttacks:game.attackDeclarations?.candidate??null,
          sourceAttacks:game.attackDeclarations?.source??null,
          sourcePrizeEnd:game.finalPrizes?.source??null,
          finalPrizeCounts:game.finalPrizes,
          finished:game.finished,winnerUnqualified:game.winner,
          rootCount:game.rootActionCount,
          completeNativeRootLedger:game.rootActionLedger,
          qualified:false});
      }catch(error){
        arms.push({status:'native-error',treatment,
          seed:trial.seed,id:trial.id,sourceSeat:seat,
          error:String(error?.stack??error).slice(0,2800),
          audit:error?.agent6Rank30RondoAudit??null,qualified:false});
      }finally{
        if(oldFlag===undefined)delete process.env.AGENT7_RONDO_PSYCHIC_BENCH_DEV;
        else process.env.AGENT7_RONDO_PSYCHIC_BENCH_DEV=oldFlag;
        if(oldSeat===undefined)delete process.env.AGENT7_RONDO_PSYCHIC_BENCH_OWNER_SEAT;
        else process.env.AGENT7_RONDO_PSYCHIC_BENCH_OWNER_SEAT=oldSeat;
      }
    }
    out.push({id:trial.id,sourceSeat:seat,seed:trial.seed,
      samePhysicalDeals:arms.every(a=>a.status!=='native-error')&&
        arms[0].fullPhysicalDeal===arms[1].fullPhysicalDeal,
      arms});
  }
  return {version:VERSION,sourceRank:30,
    originallyRegisteredSeeds:true,sourcePsychicBenchStageBothArms:true,
    actualOriginalStoreAttempts:out.flatMap(x=>x.arms).length,
    nativeErrors:out.flatMap(x=>x.arms).filter(x=>x.status==='native-error').length,
    matchedPhysicalPairs:out.filter(x=>x.samePhysicalDeals).length,
    competitiveQualifiedGames:0,rows:out,
    caveat:'Retrospective native Store development fork. Execution-time Pass replacement has synthetic-root mismatch with bot root ledger; instrumented audit is Store-observed; no paper qualification or win-rate inference.'};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,run};
