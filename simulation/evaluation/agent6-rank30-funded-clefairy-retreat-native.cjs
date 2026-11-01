'use strict';

const assert=require('node:assert/strict');
const {scheduledArms}=
  require('./agent25-nine-omitted-archetypes-source-readiness.cjs');
const {runGroup}=require('./agent7-rank30-psychic-bench-stage-aba.cjs');
const {withRank30FundedRondoPassFork}=
  require('../twinleaf/agent6-rank30-real-store-rondo-pass-fork.cjs');

const VERSION='agent6-retrospective-original-rank30-actual-rondo-v2';

function gameEvidence(game,sourceSeat){
  const sourceRoots=(game.rootActionLedger??[]).filter(x=>
    x.playerSlot===sourceSeat&&
    x.turnBefore>=29&&x.turnBefore<=36);
  const opponentRoots=(game.rootActionLedger??[]).filter(x=>
    x.playerSlot!==sourceSeat&&
    x.turnBefore>=29&&x.turnBefore<=36);
  return {
    id:game.trial.id,sourceSeat,
    sourcePhysicalDeal:game.sourceDealFingerprint,
    fullPhysicalDeal:game.fullPhysicalDealFingerprint,
    sourceFirst:game.sourceActuallyFirst,
    acceptedSourceRootsAfterWindow:sourceRoots,
    acceptedOpponentRootsAfterWindow:opponentRoots,
    acceptedNativeEnergyTargets:game.nativeAcceptedTargetSidecar?.events
      ?.filter(x=>x.playerSlot===sourceSeat&&
        x.declared?.ownerHandPrinting?.startsWith('Psychic Energy '))??[],
    settledSourceAttacks:game.sourceAttackSettlement,
    candidateSettledAttacks:game.candidateAttackSettlement,
    sourceAttacks:game.attackDeclarations?.source??null,
    finalPrizes:game.finalPrizes,
    winnerUnqualified:game.winner,
    finished:game.finished,
    rootActionLedger:game.rootActionLedger,
    rootLedgerHash:game.rootActionLedgerSha256,
    unqualified:true
  };
}

/** Retrospective exactly two original deal groups, each with two fixed 60s. */
function run(){
  const source=scheduledArms().filter(x=>x.rank===30);
  assert.equal(source.length,4);
  const groups=[];
  for(const slot of ['A','B']){
    const trials=source.filter(x=>x.candidateSlot===slot);
    assert.equal(trials.length,2);
    const sourceSeat=slot==='A'?1:0;
    const targetTurn=slot==='A'?30:33;
    const arms=[];
    for(const treatment of [false,true]){
      try{
        const observed=withRank30FundedRondoPassFork(()=>
          runGroup(trials,sourceSeat,true),{
            sourceSeat,targetTurn,treatment
          });
        assert.equal(observed.result.rows.length,2);
        arms.push({treatment,status:'native-complete-or-capped',
          realStoreAudit:observed.audit,
          games:observed.result.rows.map(g=>gameEvidence(g,sourceSeat)),
          unqualified:true});
      }catch(error){
        arms.push({treatment,status:'native-error',
          error:String(error?.stack??error).slice(0,2500),
          realStoreAudit:error?.agent6Rank30RondoAudit??null,
          games:[],unqualified:true});
      }
    }
    const equal=arms.every(x=>x.status==='native-complete-or-capped')&&
      arms[0].games.every((g,i)=>
        g.id===arms[1].games[i].id&&
        g.fullPhysicalDeal===arms[1].games[i].fullPhysicalDeal);
    groups.push({slot,sourceSeat,targetTurn,
      sameOriginalFullPhysicalDeals:equal,arms});
  }
  const arms=groups.flatMap(g=>g.arms);
  return {version:VERSION,sourceRank:30,
    originalSourceSeedSelectionRetrospective:true,
    sourcePsychicBenchStageBothArms:true,
    actualOriginalStoreAttempts:arms.length*2,
    nativeGroupErrors:arms.filter(a=>a.status==='native-error').length,
    matchedPhysicalPairs:groups.reduce((n,g)=>
      n+(g.sameOriginalFullPhysicalDeals?2:0),0),
    competitiveQualifiedGames:0,groups,
    caveat:'Original Store execution-time Pass override is instrumented separately from headless nominal root ledger. Neither virtual bot root labels nor untimed winners certify the actual accepted move or paper game.'};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,run};
