'use strict';

const assert=require('node:assert/strict');
const {scheduledArms}=require('./agent25-nine-omitted-archetypes-source-readiness.cjs');
const {runGroup}=require('./agent7-rank30-psychic-bench-stage-aba.cjs');
const {withRank30FilchVsRondoFork,VERSION}=
  require('../twinleaf/agent6-rank30-native-filch-rondo-fork.cjs');

/** @param {object} row @returns {object} Evidence after genuine native Store. */
function evidence(row){
  const sourceSeat=0;
  return {id:row.trial.id,
    fullPhysicalDeal:row.fullPhysicalDealFingerprint??null,
    originalSourceDeal:row.sourceDealFingerprint??null,
    originalSource60:row.sourceDeckFingerprint??null,
    candidate60:row.candidateDeckFingerprint??null,
    engineError:row.error??null,
    nativeStoreCauseStack:row.nativeStoreCauseStack??null,
    nativeAbortEvidence:row.nativeAbortEvidence??null,
    sourceSettlements:row.sourceAttackSettlement??null,
    sourceRoots:(row.rootActionLedger??[]).filter(e=>
      e.playerSlot===sourceSeat&&e.turnBefore>=29&&e.turnBefore<=36),
    opponentRoots:(row.rootActionLedger??[]).filter(e=>
      e.playerSlot!==sourceSeat&&e.turnBefore>=29&&e.turnBefore<=36),
    finalPublicBoard:row.finalBoard??null,
    sourceActualAttackDeclarations:row.attackDeclarations?.source??null,
    rootActionLedgerHash:row.rootActionLedgerSha256??null,
    winnerUnqualified:row.winner??null,finalPrizes:row.finalPrizes??null,
    status:row.status??(row.finished?'untimed-engine-terminal':'censored'),
    competitiveQualified:false};
}

/** @returns {object} Exact physical seed and fixed candidate panel. */
function run(){
  const trials=scheduledArms().filter(t=>
    t.rank===30&&t.candidateSlot==='B');
  assert.equal(trials.length,2);
  const arms=[];
  for(const treatment of [false,true]){
    try{
      const observed=withRank30FilchVsRondoFork(()=>
        runGroup(trials,0,true),{
          sourceSeat:0,targetTurn:33,treatment
        });
      assert.equal(observed.result.rows.length,2);
      arms.push({treatment,status:'native-complete-or-capped',
        realStoreAudit:observed.audit,
        games:observed.result.rows.map(evidence),
        competitiveQualified:false});
    }catch(error){
      arms.push({treatment,status:'native-error',
        error:String(error?.stack??error).slice(0,2500),
        realStoreAudit:error?.agent6FilchRondoAudit??null,
        games:[],competitiveQualified:false});
    }
  }
  const paired=arms.every(a=>a.status==='native-complete-or-capped')&&
    arms[0].games.every((g,i)=>g.id===arms[1].games[i].id&&
      g.fullPhysicalDeal!==null&&
      JSON.stringify(g.fullPhysicalDeal)===
        JSON.stringify(arms[1].games[i].fullPhysicalDeal));
  return {version:VERSION,originalSourceRank:30,
    originalSourceSeat:0,originalGlobalTurn:33,
    historicalOriginalSourceSeed:233633536,
    retrospectiveSelectedSourceDeal:true,
    physicalPairCount:paired?2:0,
    nativeErrors:arms.filter(a=>a.status==='native-error').length,
    nativeRowErrors:arms.flatMap(a=>a.games).filter(g=>
      g.status==='engine-error').length,
    actualStoreRetreats:arms.reduce((sum,a)=>
      sum+(a.realStoreAudit?.actualRetreatsAccepted??0),0),
    actualNativeAttempts:4,
    competitiveQualifiedGames:0,
    arms,
    caveat:'Counterfactual replacement of source proposed Filch attack, not a native actor-root policy; headless original root ledger retains proposed Filch even when Store executes Retreat. Native Store audit and settled board must be independently inspected.'};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,run};
