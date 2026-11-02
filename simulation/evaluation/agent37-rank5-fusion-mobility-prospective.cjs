'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {classifyNativeAttempt}=
  require('./agent13-v3-rank5-original-release.cjs');

const VERSION='agent37-rank5-prospective-fusion-mobility-native-v1';
const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION='results/aichi-2026/registrations/agent37-rank5-native-fusion-mobility-20261102.json';
const SOURCE_SHA='a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05';

/** @param {object} row Genuine Store development attempt. */
function sourceSummary(row){
  const sourceSeat=row.trial.candidateSlot==='A'?1:0;
  const accepted=Array.isArray(row.rootActionLedger)?
    row.rootActionLedger.filter(x=>x.playerSlot===sourceSeat):[];
  return {
    nativeDisposition:classifyNativeAttempt(row),
    sourceSeat,sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    sourceAttackDeclarations:row.attackDeclarations?.source??null,
    sourceAcceptedRootCount:accepted.length,
    sourceAcceptedAbilityRoots:accepted.filter(x=>
      x.action==='UseAbilityAction').length,
    sourceAcceptedPaidRetreatRoots:accepted.filter(x=>
      x.action==='RetreatAction').length,
    sourceAcceptedEvolutionRoots:accepted.filter(x=>
      x.action==='PlayCardAction'&&
      x.card?.startsWith('Mew VMAX')).length,
    rawNativeActions:row.actionCount??null,
    competitiveGameQualified:false
  };
}

/**
 * Execute exactly eight preregistered native attempts. Store raw rows alongside
 * concise source summary, preserve all native errors/action caps as outcomes,
 * and never treat engine terminal as a competitive game.
 */
function run({quickBallScope='none',actorHandDiscard=false}={}){
  assert.ok(['none','source','candidate'].includes(quickBallScope));
  assert.equal(typeof actorHandDiscard,'boolean');
  const bytes=fs.readFileSync(path.join(ROOT,REGISTRATION));
  const reg=JSON.parse(bytes.toString('utf8'));
  assert.equal(reg.status,'pre-outcome-frozen-source-two-seat-policy-development');
  assert.equal(reg.originalRank,5);
  assert.equal(reg.originalSourcePrinted60Sha256,SOURCE_SHA);
  const sourceAdmission=require('../../results/aichi-2026/original-printed60-admission-v1.json');
  const original=sourceAdmission.rows.find(x=>x.rank===5);
  assert.equal(original?.physicalCards,60);
  assert.equal(original.printed60Sha256,SOURCE_SHA);
  assert.equal(reg.plannedNativeAttempts,8);
  assert.equal(reg.registeredGroups.length,2);
  assert.deepEqual(reg.registeredGroups.map(g=>g.candidateSlot),['A','B']);
  assert.equal(new Set(reg.registeredGroups.map(g=>g.seed)).size,2);
  assert.deepEqual(reg.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  const baseline=require('./agent41-frozen-bilateral-development-v2.json')
    .policyOptions;
  assert.equal(baseline.actorOnlyComposition,true);
  const options={...baseline,actorNaturalEvolutionRoot:true,
    actorMewGenesectTechnoBlast:true,
    ...(quickBallScope==='source'?{sourceScopedQuickBallRoot:true}:{}),
    ...(quickBallScope==='candidate'?{candidateScopedQuickBallRoot:true}:{}),
    ...(actorHandDiscard?{actorHandDiscard:true}:{})};
  const modes={
    integratedV3Control:options,
    integratedV3FusionMobility:{
      ...options,actorDceMewMobilityRoot:true,
      actorGenesectFusionDrawRoot:true
    }
  };
  const trials=reg.registeredGroups.flatMap(g=>reg.candidateIds.map(
    candidateId=>({...g,candidateId,
      id:[g.rank,g.repeat,g.candidateSlot,candidateId].join(':')})));
  assert.equal(trials.length,4);
  const results={};
  for(const [mode,policy] of Object.entries(modes)){
    try{
      const data=runDevelopment({...policy,
        registeredTrials:trials,
        registeredFrameName:VERSION+'-'+mode,
        allowAdditionalOriginalSourceRanks:true});
      assert.equal(data.attempted,4);
      assert.deepEqual(data.rows.map(x=>x.trial.id),
        trials.map(x=>x.id));
      results[mode]={attempts:data.rows.map(row=>({
        trial:row.trial,summary:sourceSummary(row),rawNativeRow:row
      })),nativeReport:data};
    }catch(error){
      results[mode]={batchError:String(error?.stack??error),
        attempts:trials.map(trial=>({
          trial,summary:{nativeDisposition:'NATIVE_ERROR',
            nativeError:String(error?.message??error),
            competitiveGameQualified:false},rawNativeRow:null
        }))};
    }
  }
  const comparison=trials.map((trial,index)=>{
    const a=results.integratedV3Control.attempts[index];
    const b=results.integratedV3FusionMobility.attempts[index];
    const sourceDealPairing=a.summary.sourceDealFingerprint &&
      b.summary.sourceDealFingerprint?
      a.summary.sourceDealFingerprint===b.summary.sourceDealFingerprint?
        'EXACT_SOURCE_DEAL_MATCH':'DIFFERENT_SOURCE_DEAL':'UNVERIFIED';
    return {trial,sourceDealPairing,control:a.summary,treatment:b.summary,
      sameDealNativeAttackDelta:sourceDealPairing==='EXACT_SOURCE_DEAL_MATCH'&&
        Number.isSafeInteger(a.summary.sourceAttackDeclarations)&&
        Number.isSafeInteger(b.summary.sourceAttackDeclarations)?
        b.summary.sourceAttackDeclarations-a.summary.sourceAttackDeclarations:null};
  });
  return {schema:VERSION,
    preregistrationSha256:createHash('sha256').update(bytes).digest('hex'),
    originalSourcePrinted60Sha256:SOURCE_SHA,
    frozenBaselineModule:'simulation/evaluation/agent41-frozen-bilateral-development-v2.json',
    requestedNativeAttempts:8,
    registeredBeforeNativeExecution:true,
    zeroPostOutcomeExclusions:true,
    trials:trials.map(x=>x.id),comparison,modes:results,
    competitiveQualifiedGames:0,certifiedWinRate:null,
    caveats:reg.explicitQualificationVetoes};
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={VERSION,REGISTRATION,sourceSummary,run};
