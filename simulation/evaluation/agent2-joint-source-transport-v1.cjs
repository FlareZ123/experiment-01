'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {inspectProfile,gitBlobSha}=require('./agent41-joint-source-r5-r11-v1.cjs');
const {classifyNativeAttempt}=require('./agent41-native-attempt-disposition.cjs');

const ROOT=path.resolve(__dirname,'../..');
const PROFILE=require('./agent41-joint-source-r5-r11-v1.json');
const REGISTRATION=require('../../results/aichi-2026/registrations/agent2-joint-rank5-rank11-transport-v1-20261103.json');
const VERSION='agent2-joint-r5-r11-exact-deal-2x2-source-policy-transport-v1';

/** @param {unknown} value @returns {string} */
const sha256=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Atomically preserve every completed experimental factor while holding an
 * exclusive run-local lock. Interrupted CI must keep the previous arm receipt.
 * @param {string} basename
 * @param {object} data
 */
function save(basename,data){
  const final=path.join(ROOT,basename);
  const lock=final+'.lock',temp=final+'.tmp.'+process.pid;
  const fd=fs.openSync(lock,'wx',0o600);
  try{
    const bytes=JSON.stringify(data,null,2)+'\n';
    fs.writeFileSync(temp,bytes,{flag:'wx'});
    const read=fs.openSync(temp,'r');
    try{fs.fsyncSync(read);}finally{fs.closeSync(read);}
    fs.renameSync(temp,final);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

/** @returns {object} */
function inspect(){
  const parent=inspectProfile();
  assert.equal(REGISTRATION.schema,'agent2-joint-selected-rank5-rank11-owner-action-transport-v1');
  assert.equal(REGISTRATION.immutableParentGitCommit,
    '20d095b3126a767ac60b40f048fa4579b3a04c99');
  assert.equal(REGISTRATION.parentProfileGitBlobSha,parent.profileGitBlob);
  assert.equal(REGISTRATION.vendorPin,PROFILE.pinnedVendor);
  assert.equal(REGISTRATION.rosterBlobSha,PROFILE.sourceRosterGitBlobSha);
  assert.deepEqual(REGISTRATION.registeredTrialIds,PROFILE.registeredTrials.map(r=>r.id));
  assert.deepEqual(Object.keys(REGISTRATION.factors),[
    'baseline','searchOnly','discardOnly','searchAndDiscard'
  ]);
  assert.equal(REGISTRATION.registeredNativeAttemptCount,32);
  for(const [name,factor] of Object.entries(REGISTRATION.factors)){
    assert.deepEqual(Object.keys(factor).sort(),
      ['actorHandDiscard','actorOnlySingleSearch']);
    for(const value of Object.values(factor))assert.equal(typeof value,'boolean');
    if(name==='baseline')assert.deepEqual(factor,{
      actorOnlySingleSearch:false,actorHandDiscard:false
    });
  }
  assert.equal(PROFILE.policyOptions.actorOnlySingleSearch,false);
  assert.equal(PROFILE.policyOptions.actorHandDiscard,false);
  return {
    version:VERSION,originalPinnedInspection:parent,
    registrationGitBlobSha:gitBlobSha(fs.readFileSync(path.join(ROOT,
      'results/aichi-2026/registrations/agent2-joint-rank5-rank11-transport-v1-20261103.json'))),
    comparisonType:REGISTRATION.comparisonType,
    trialCount:PROFILE.registeredTrials.length,
    factorCount:Object.keys(REGISTRATION.factors).length,
    expectedNativeAttempts:REGISTRATION.registeredNativeAttemptCount,
    competitiveQualifiedGames:0
  };
}

/** @param {object} row @returns {object} */
function nativeSummary(row){
  const sourceSeat=row.sourceSeat;
  const roots=row.rootActionLedger??[];
  const attacks=roots.filter(r=>r.playerSlot===sourceSeat&&r.action==='AttackAction');
  const settled=row.sourceAttackSettlement?.attacks??[];
  const effects=settled.filter(a=>a.settledPromptChain===true);
  return {
    id:row.trial?.id??null,
    originalRank:row.trial?.rank??null,
    candidateId:row.trial?.candidateId??null,
    sourceSeat,candidateSeat:row.candidateSeat,
    sourcePrinted60:row.sourceDeckFingerprint??null,
    candidatePrinted60:row.candidateDeckFingerprint??null,
    sourcePhysicalDeal:row.sourceDealFingerprint??null,
    fullPhysicalDeal:row.fullPhysicalDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    nativeDisposition:classifyNativeAttempt(row).kind,
    actionCount:row.actionCount??null,
    endReason:row.endReason??null,error:row.error??null,
    sourceAttackDeclarations:attacks.map(a=>({
      turn:a.turnBefore,ordinal:a.actionOrdinal,name:a.attack
    })),
    settledSourceAttacks:effects.map(a=>({
      turn:a.turnBefore,name:a.attackName,
      prizesBefore:a.prizesBefore??null,prizesAfter:a.prizesAfter??null,
      nextOpponentRoot:a.nextSourceRoot??null
    })),
    allPromptAndPaperPaymentsQualified:false,
    competitiveQualified:false
  };
}

/** @param {object[]} left @param {object[]} right @returns {number|null} */
function firstDifference(left,right){
  const n=Math.min(left.length,right.length);
  for(let i=0;i<n;i++){
    if(JSON.stringify(left[i])!==JSON.stringify(right[i]))return i;
  }
  return left.length===right.length?null:n;
}

/** @param {object} a @param {object} b @returns {object} */
function compare(a,b){
  const equal={
    sourcePrinted60:a.sourceDeckFingerprint===b.sourceDeckFingerprint,
    candidatePrinted60:a.candidateDeckFingerprint===b.candidateDeckFingerprint,
    sourcePhysicalDeal:a.sourceDealFingerprint===b.sourceDealFingerprint,
    fullTwoPlayerPhysicalDeal:a.fullPhysicalDealFingerprint===b.fullPhysicalDealFingerprint,
    actualStarterSeat:a.actualStarterSeat===b.actualStarterSeat
  };
  assert.ok(Object.values(equal).every(Boolean),
    'Original printed/deal parity failure on '+a.trial?.id);
  const x=a.rootActionLedger??[],y=b.rootActionLedger??[];
  const d=firstDifference(x,y);
  const sourceX=x.filter(r=>r.playerSlot===a.sourceSeat);
  const sourceY=y.filter(r=>r.playerSlot===b.sourceSeat);
  const ds=firstDifference(sourceX,sourceY);
  return {
    exactOriginalCandidateAndDealParity:equal,
    firstGlobalDifferentOrdinal:d===null?null:Math.min(d,x.length-1),
    baselineFirstDifferentRoot:d===null?null:x[d]??null,
    treatmentFirstDifferentRoot:d===null?null:y[d]??null,
    firstSourceRelativeDifference:ds,
    baselineFirstDifferentSourceRoot:ds===null?null:sourceX[ds]??null,
    treatmentFirstDifferentSourceRoot:ds===null?null:sourceY[ds]??null,
    noOpportunityVersusNoProposalUnresolved:true
  };
}

/**
 * Exactly the eight previously selected rank5 and rank11 source pairs.
 * Every arm executes on the frozen shared runner and same printed 60s.
 */
function run(){
  const preflight=inspect();
  const before=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  assert.equal(before,undefined);
  const original=PROFILE.injectedResearchEnvironment.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=original;
  const factors={};
  try{
    const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
    for(const [name,toggles] of Object.entries(REGISTRATION.factors)){
      const raw=runDevelopment({...PROFILE.policyOptions,...toggles,
        registeredTrials:PROFILE.registeredTrials,
        registeredFrameName:VERSION+'-'+name});
      assert.equal(raw.attempted,8,'Incomplete native attempts '+name);
      assert.equal(raw.rows.length,8,'Missing rows '+name);
      assert.deepEqual(raw.rows.map(r=>r.trial?.id),REGISTRATION.registeredTrialIds);
      const output={
        schema:VERSION+'-raw-factor',preflight,
        factor:name,toggles,
        originalSelectedTrials:REGISTRATION.registeredTrialIds,
        native:raw,competitiveQualifiedGames:0,
        caveat:'Development-only genuine Store rows, include caps, errors and native terminals; source strategic competence, game clock and paper fidelity not qualified'
      };
      save('agent2-joint-transport-'+name+'.json',output);
      factors[name]=raw;
      process.stdout.write(JSON.stringify({
        factor:name,nativeAttemptCount:raw.attempted,
        status:raw.rows.map(r=>({id:r.trial.id,
          declaredSourceAttacks:(r.rootActionLedger??[])
            .filter(z=>z.playerSlot===r.sourceSeat&&z.action==='AttackAction').length,
          firstSourceAttack:(r.rootActionLedger??[])
            .find(z=>z.playerSlot===r.sourceSeat&&z.action==='AttackAction')?.attack??null,
          disposition:classifyNativeAttempt(r).kind}))
      })+'\n');
    }
  }finally{
    if(before===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=before;
  }
  const rows=[];
  for(let i=0;i<8;i++){
    const baseline=factors.baseline.rows[i];
    const others={};
    for(const [name,raw] of Object.entries(factors)){
      const row=raw.rows[i];
      others[name]={
        ...nativeSummary(row),
        comparison:compare(baseline,row)
      };
    }
    rows.push({id:baseline.trial.id,sourceRank:baseline.trial.rank,
      candidatePhysicalSeat:baseline.candidateSeat,
      originalSourcePhysicalSeed:baseline.trial.seed,
      factors:others});
  }
  const summary={
    schema:VERSION+'-comparison-summary',
    preflight,allSameSourceAndBothPrintedSixties:true,
    registeredTrialCount:8,actualNativeAttempts:32,
    factorFlags:REGISTRATION.factors,rows,
    qualification:{
      competitiveQualifiedGames:0,
      noDemonstrated99point5Percent:true,
      sourceCompetenceAndPaperPaymentsUnverified:true
    }
  };
  save('agent2-joint-transport-v1-summary.json',summary);
  assert.equal(summary.rows.length,8);
  assert.equal(summary.actualNativeAttempts,32);
  return summary;
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    process.stdout.write(JSON.stringify(inspect(),null,2)+'\n');
  }else{
    const x=run();
    process.stdout.write(JSON.stringify({
      schema:x.schema,attempts:x.actualNativeAttempts,
      trialCount:x.registeredTrialCount,
      allSameSourceAndBothPrintedSixties:x.allSameSourceAndBothPrintedSixties,
      sourceAttackCountsByFactor:Object.fromEntries(Object.keys(REGISTRATION.factors)
        .map(name=>[name,x.rows.reduce((n,r)=>
          n+r.factors[name].sourceAttackDeclarations.length,0)])),
      competitiveQualifiedGames:0
    })+'\n');
  }
}
module.exports={VERSION,inspect,nativeSummary,compare,run};
