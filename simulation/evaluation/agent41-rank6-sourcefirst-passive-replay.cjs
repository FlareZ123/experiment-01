'use strict';

const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const fs=require('node:fs');
const path=require('node:path');
const {executeDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {loadNewMoonCandidate}=
  require('../../scripts/aichi-new-moon-candidate.cjs');

// The same already-used rank6 development seed, with physical candidate
// seat reversed. It is a NEW retrospective development deal, not an
// interchangeable continuation of the former 6:0:A physical source deck.
const SEED=407516727;
const CANDIDATE_SLOT='B';
const PAIR_LABEL='6:0:B:retrospective-passive-sourcefirst';

/** @returns {Map<string,object>} */
function prepare(){
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const rank1=roster.decks.find(deck=>deck.rank===1);
  assert.ok(rank1);
  const options={allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true};
  return new Map([
    ['champion-reference',{label:'champion-reference',cards:rank1.cards}],
    ['new-moon-lockbreaker-v1',{label:'new-moon-lockbreaker-v1',
      cards:loadNewMoonCandidate().cards}]
  ].map(([id,candidate])=>[id,{plan:planAichi(candidate,options)}]));
}

/** @returns {object} */
function run(){
  const prepared=prepare();
  const rows=[];
  const fields=['sourceDealFingerprint','actualStarterSeat',
    'rootActionLedgerSha256','actionCount','turns','endReason',
    'finished','winner','finalPrizes','finalBoard','attackDeclarations',
    'candidateAttackSettlement','sourceAudit','sourceLinePacket',
    'policyAudit','firstCandidatePostSourceRoot','candidateFollowupStatus',
    'candidatePassProbeSamples','candidatePerfectionPassSamples'];
  for(const candidateId of ['champion-reference','new-moon-lockbreaker-v1']){
    const trial={rank:6,repeat:0,seed:SEED,candidateSlot:CANDIDATE_SLOT,
      candidateId,id:PAIR_LABEL+':'+candidateId};
    const execute=extra=>{
      try{return executeDevelopment(trial,prepared,extra);}
      catch(error){return {status:'runner-exception',
        error:String(error?.stack??error).slice(0,3200)};}
    };
    const baseline=execute({});
    const observed=execute({initializationWindow:true});
    const failures=[];
    const check=(condition,message)=>{
      if(!condition)failures.push(message);
    };
    check(!baseline.error,'baseline Store error: '+(baseline.error??''));
    check(!observed.error,'observer Store error: '+(observed.error??''));
    check(baseline.sourceActuallyFirst===true,
      'seat-reversed seed unexpectedly lacks actual source-first start');
    check(observed.sourceActuallyFirst===true,
      'observer lacks actual source-first start');
    for(const key of fields){
      check(isDeepStrictEqual(baseline[key],observed[key]),
        'read-only observer changed actual game field '+key);
    }
    const pressure=observed.rank6PassivePressure??null;
    check(pressure?.pressureKind==='passive-ability-suppression',
      'missing typed passive native evidence');
    check(pressure?.sourceSeat===0&&pressure?.candidateSeat===1,
      'native pressure was not recorded for genuine source A and candidate B');
    // A legal source-first start may have no applicable in-play printed
    // candidate Power. Report such absence as evidence, not a game failure.
    rows.push({
      candidateId,seed:SEED,actualStarterSeat:observed.actualStarterSeat??null,
      baseline:{error:baseline.error??null,actions:baseline.actionCount??null,
        rootSha256:baseline.rootActionLedgerSha256??null,
        sourceDealSha256:baseline.sourceDealFingerprint??null,
        endReason:baseline.endReason??null},
      observed:{error:observed.error??null,actions:observed.actionCount??null,
        rootSha256:observed.rootActionLedgerSha256??null,
        sourceDealSha256:observed.sourceDealFingerprint??null,
        endReason:observed.endReason??null},
      firstCandidateRoot:pressure?.candidateTurnTwoFirstRoot??null,
      sourceEndTurnOneRoot:pressure?.sourceTurnOneEndRoot??null,
      sourceReturnTurnThreeRoot:pressure?.sourceTurnThreeFirstRoot??null,
      pressure,rawNativeWindow:observed.initializationWindowAudit??null,
      validation:{passed:failures.length===0,failures},
      qualifiesForCompetitiveInference:false
    });
  }
  return {
    schema:'agent41-rank6-sourcefirst-passive-native-paired-observer-v1',
    developmentOnly:true,retrospectiveAndSeatReversed:true,
    seed:SEED,sourceRank:6,candidateSeat:1,sourceSeat:0,
    evidenceType:'same-seed baseline-versus-observed within each unchanged candidate',
    fieldQualifiedGames:0,
    candidateSourcePhysicalDealsIdentical:rows.length===2 &&
      rows[0].baseline.sourceDealSha256===rows[1].baseline.sourceDealSha256,
    rows,validation:{
      passed:rows.every(row=>row.validation.passed),
      failures:rows.flatMap(row=>row.validation.failures.map(f=>
        row.candidateId+': '+f))
    },
    qualification:{prospectiveStrengthTrial:false,paperClockCalibrated:false,
      candidatePolicyInformationSetSafe:false,
      activeTacticalDenialVerified:false,competitiveGameQualified:false}
  };
}

if(require.main===module){
  let result;
  try{result=run();}
  catch(error){result={
    schema:'agent41-rank6-sourcefirst-passive-native-paired-observer-v1',
    error:String(error?.stack??error).slice(0,3200),
    validation:{passed:false,failures:['preparation-or-runner-exception']},
    qualification:{competitiveGameQualified:false}
  };}
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.validation.passed)process.exitCode=1;
}
module.exports={SEED,CANDIDATE_SLOT,PAIR_LABEL,prepare,run};
