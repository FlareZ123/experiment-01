'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const SCHEMA='agent50-rank11-both-seat-known-dead-retrospective-v1';
const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION='results/aichi-2026/registrations/agent16-balanced-native-rank6-rank11-coins-20261101.json';
const PROFILE='simulation/evaluation/agent41-frozen-bilateral-development-v2.json';
const EXPECTED=Object.freeze({A:3821563342,B:1326071353});
const FIXED_INPUT_FIELDS=Object.freeze([
  'seed','sourceSeat','candidateSeat','actualStarterSeat',
  'sourceDeckFingerprint','candidateDeckFingerprint',
  'sourceDealFingerprint','fullPhysicalDealFingerprint'
]);

/**
 * Select two previously inspected source-deal groups, each with both fixed
 * candidate sixties. Never select a trial by outcome or policy exposure.
 * @param {object[]} trials Original registered physical trials.
 * @returns {object[]} Four immutable source/candidate arms.
 */
function selectOriginalRank11Pairs(trials){
  assert.ok(Array.isArray(trials));
  const selected=trials.filter(row=>row.rank===11&&row.repeat===2);
  assert.equal(selected.length,4,'Expected two candidate sixties on each of two original deals');
  const seen=new Set();
  for(const row of selected){
    assert.ok(['A','B'].includes(row.candidateSlot));
    assert.ok(['champion-reference','new-moon-lockbreaker-v1'].includes(row.candidateId));
    assert.equal(row.seed,EXPECTED[row.candidateSlot],
      'Original registered source deal changed');
    const key=row.candidateSlot+':'+row.candidateId;
    assert.ok(!seen.has(key),'Duplicate original candidate-deal arm');
    seen.add(key);
  }
  return selected;
}

/** @param {object} row @returns {object} */
function compactGame(row){
  const roots=row.rootActionLedger??row.nativePublicRootArchive?.rootActionLedger??[];
  const candidateSeat=row.candidateSeat??(row.trial.candidateSlot==='A'?0:1);
  const sourceSeat=row.sourceSeat??1-candidateSeat;
  const attackActions=roots.filter(x=>x.action==='AttackAction');
  const byName=(name,seat)=>attackActions.filter(x=>
    x.attack===name&&x.playerSlot===seat).length;
  const settlement=(record,seat)=>({
    seat,
    declarations:record?.declarations??null,
    settled:record?.settled??null,
    withVerifiedReturn:record?.withVerifiedSameEpochSourceReturn??null,
    attacks:record?.attacks??[]
  });
  return {
    id:row.trial.id,rank:row.trial.rank,sourceSeat,candidateSeat,
    seed:row.trial.seed,actualStarterSeat:row.actualStarterSeat??null,
    sourceDeckFingerprint:row.sourceDeckFingerprint??null,
    candidateDeckFingerprint:row.candidateDeckFingerprint??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    verifiedFirstTurn:row.verifiedFirstTurn??null,
    status:row.status??null,finished:row.finished===true,
    winner:row.finished===true?row.winner:null,
    finalPrizes:row.finalPrizes??null,
    actionCount:row.actionCount??null,
    sourceAttackCount:attackActions.filter(x=>x.playerSlot===sourceSeat).length,
    candidateAttackCount:attackActions.filter(x=>x.playerSlot===candidateSeat).length,
    sourceDeadTerminal:byName('Terminal Period',sourceSeat),
    sourceCorrectedClaw:byName('Claw of Darkness',sourceSeat),
    sourceDeadCall:byName('Call for Family',sourceSeat),
    sourceCorrectedPoison:byName('Super Poison Breath',sourceSeat),
    candidateDeadGetLost:byName('Get Lost',candidateSeat),
    candidateCorrectedMindShock:byName('Mind Shock',candidateSeat),
    attacksBySeat:{
      source:settlement(row.sourceAttackSettlement,sourceSeat),
      candidate:settlement(row.candidateAttackSettlement,candidateSeat)
    },
    roots
  };
}

/**
 * Preserve all arms, errors and cap outcomes. The same physical deal is
 * required for a causal comparison but mismatches remain visible as vetoes.
 * @param {object[]} controlRows Native baseline rows.
 * @param {object[]} treatmentRows Symmetric policy rows.
 * @returns {object} Four paired cases and qualification vetoes.
 */
function compareOriginalRank11Pairs(controlRows,treatmentRows){
  assert.equal(controlRows.length,4);
  assert.equal(treatmentRows.length,4);
  const baseline=new Map(controlRows.map(x=>[x.trial.id,compactGame(x)]));
  const treated=new Map(treatmentRows.map(x=>[x.trial.id,compactGame(x)]));
  assert.equal(baseline.size,4);assert.equal(treated.size,4);
  const pairs=[];
  for(const [id,a] of baseline){
    const b=treated.get(id);
    assert.ok(b,'Missing treatment row for '+id);
    const unmatchedInputs=FIXED_INPUT_FIELDS.filter(key=>a[key]!==b[key]);
    const len=Math.min(a.roots.length,b.roots.length);
    let firstRootDifference=null;
    for(let i=0;i<len;i++){
      if(JSON.stringify(a.roots[i])!==JSON.stringify(b.roots[i])){
        firstRootDifference={index:i,baseline:a.roots[i],
          treatment:b.roots[i]};
        break;
      }
    }
    if(!firstRootDifference&&a.roots.length!==b.roots.length)
      firstRootDifference={index:len,baseline:a.roots[len]??null,
        treatment:b.roots[len]??null};
    const changedSameRootAttacks=[];
    for(let i=0;i<len;i++){
      const left=a.roots[i],right=b.roots[i];
      if(left.action==='AttackAction'&&right.action==='AttackAction'&&
         left.playerSlot===right.playerSlot&&left.attack!==right.attack){
        const owner=left.playerSlot===a.sourceSeat?'source':'candidate';
        const attackReport=(record,root)=>record.attacksBySeat[owner].attacks
          .find(x=>x.actionOrdinal===root.actionOrdinal)??null;
        changedSameRootAttacks.push({
          index:i,owner,baselineAttack:left.attack,treatmentAttack:right.attack,
          baselineSettlement:attackReport(a,left),
          treatmentSettlement:attackReport(b,right)
        });
      }
    }
    const {roots:ar,...original}=a;
    const {roots:br,...knownDeadBothSeats}=b;
    pairs.push({id,sourceSeat:a.sourceSeat,candidateSeat:a.candidateSeat,
      seed:a.seed,unmatchedInputs,samePhysicalInput:unmatchedInputs.length===0,
      original,knownDeadBothSeats,firstRootDifference,changedSameRootAttacks,
      attemptRetained:true,competitiveQualified:false});
  }
  return {
    schema:SCHEMA,physicalGroups:2,fixed60Arms:4,nativeGameAttempts:8,
    samePhysicalInputPairs:pairs.filter(x=>x.samePhysicalInput).length,
    mismatchedPhysicalInputPairs:pairs.filter(x=>!x.samePhysicalInput).length,
    pairs,
    competitiveQualifiedGames:0,
    caveat:'Retrospective original rank11 source deals; generic two-player policy, paper prompts and official 25-minute clock remain unqualified.'
  };
}

/**
 * An opt-in one-factor comparison under the previously frozen v2 options.
 * This deliberately changes the transitive source closure and is a NEW
 * unqualified profile; it never claims the prior frozen source SHA.
 * @returns {object} Complete 8-game original native execution packet.
 */
function run(){
  const profile=JSON.parse(fs.readFileSync(path.join(ROOT,PROFILE),'utf8'));
  const registrationBytes=fs.readFileSync(path.join(ROOT,REGISTRATION));
  const blob=createHash('sha1')
    .update('blob '+registrationBytes.length+'\\0')
    .update(registrationBytes).digest('hex');
  assert.equal(blob,profile.registrationGitBlobSha);
  const {registeredTrials,assertNoUnreviewedAmbientAgentEnvironment}=
    require('./agent41-frozen-bilateral-development-v1.cjs');
  const {runDevelopment}=
    require('./agent41-bilateral-v2-development.cjs');
  assertNoUnreviewedAmbientAgentEnvironment(process.env,profile);
  const trials=selectOriginalRank11Pairs(registeredTrials(profile));
  const common={...profile.policyOptions,registeredTrials:trials,
    registeredFrameName:SCHEMA+':original-rank11-repeat2'};
  assert.equal(common.actorOnlyComposition,true);
  assert.equal(common.bilateralKnownDeadAttackRoot,undefined);
  const saved={};
  for(const [key,value] of Object.entries(profile.injectedResearchEnvironment)){
    saved[key]=process.env[key];process.env[key]=value;
  }
  try{
    const baseline=runDevelopment(common);
    const treatment=runDevelopment({...common,bilateralKnownDeadAttackRoot:true});
    const comparison=compareOriginalRank11Pairs(baseline.rows,treatment.rows);
    return {...comparison,priorDevelopmentProfile:profile.schema,
      priorProfileSourceClosureIsUnchanged:false,
      originalRegistration:REGISTRATION,
      originalRegistrationGitBlobSha:blob,
      sourceOptionDelta:{bilateralKnownDeadAttackRoot:true},
      nativeAttemptsComplete:baseline.attemptedComplete===true&&
        treatment.attemptedComplete===true,
      raw:{baseline,treatment}};
  }finally{
    for(const [key,value] of Object.entries(saved)){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}

if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\\n');
  if(!result.nativeAttemptsComplete||
     result.mismatchedPhysicalInputPairs>0)process.exitCode=1;
}
module.exports={SCHEMA,EXPECTED,selectOriginalRank11Pairs,compactGame,
  compareOriginalRank11Pairs,run};
