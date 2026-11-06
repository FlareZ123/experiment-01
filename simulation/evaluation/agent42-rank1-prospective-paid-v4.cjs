'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {summary}=require('./agent42-rank1-two-psychic-original-aba.cjs');
const {effectiveOptions,withSameRuntime}=
  require('./agent4-selected-v3-paper-funded-release.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {compareSafely}=
  require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {withTwoPsychicRetreatCustody}=
  require('../twinleaf/agent42-two-psychic-retreat-physical-custody.cjs');
const {join}=require('./agent42-realstore-paid-retreat-join.cjs');
const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent42-rank1-prospective-paid-v4-20261106.json';
const BLOB='09582e7cb7e27eadcd083e17150cda8bf043006f';
const OUTPUT='agent42-rank1-prospective-paid-v4-native.json';
const VERSION='agent42-rank1-source-fresh-24attempt-paid-retreat-v4';
const read=rel=>fs.readFileSync(path.join(ROOT,rel));

/** Recheck unseen registered seeds, paired source lists and live code pins. */
function preflight(){
  assert.equal(gitBlobHash(read(REG)),BLOB);
  const m=JSON.parse(read(REG));
  assert.equal(m.registeredBeforeFirstNativeAttempt,true);
  assert.equal(m.observedTrialsBeforeRegistration,0);
  for(const x of m.frozenInputs)
    assert.equal(gitBlobHash(read(x.path)),x.blob,'Source changed '+x.path);
  assert.equal(m.groups.length,4);
  assert.equal(m.trials.length,8);
  assert.equal(m.expectedNativeAttempts,24);
  assert.equal(new Set(m.groups.map(g=>g.seed)).size,4);
  for(let i=0;i<m.groups.length;i++){
    const g=m.groups[i];
    assert.equal(g.rank,1);
    const p=m.trials.slice(i*2,i*2+2);
    assert.deepEqual(p.map(t=>t.candidateId),
      ['champion-reference','new-moon-lockbreaker-v1']);
    assert.ok(p.every(t=>t.rank===g.rank&&t.seed===g.seed&&
      t.repeat===g.repeat&&t.candidateSlot===g.candidateSlot&&
      t.id===[t.rank,t.repeat,t.candidateSlot,t.candidateId].join(':')));
  }
  assert.deepEqual(m.modes.map(x=>x.actorTwoUnitPaidRetreatRoot),
    [false,true,false]);
  const old=JSON.parse(read(m.baseSelectedPolicySource));
  const selected=old.modes.find(x=>x.id===m.selectedModeId);
  assert.equal(selected?.actorFundedShadowRiderFloatStoneRoot,true);
  const pin=execFileSync('git',['rev-parse','HEAD'],{
    cwd:path.join(ROOT,'vendor/twinleaf'),encoding:'utf8'
  }).trim();
  assert.equal(pin,m.pinnedTwinleaf);
  return {m,old,selected,pin};
}

/** Execute all genuine registered source+candidate groups in A/B/A modes. */
function run(){
  const p=preflight(),modes=[];
  for(const mode of p.m.modes){
    const options=effectiveOptions({
      commonPolicy:{...p.old.selectedV3CommonPolicy,
        nativeRootActionLimit:p.m.actionCap},
      nativeActionCap:p.m.actionCap,registeredTrials:p.m.trials
    },p.selected);
    options.actorTwoUnitPaidRetreatRoot=mode.actorTwoUnitPaidRetreatRoot;
    options.actorTwoUnitPaidRetreatTargetTurn=null;
    options.registeredFrameName=VERSION+':'+mode.id;
    const observed=withTwoPsychicRetreatCustody(()=>
      withSameRuntime(()=>runDevelopment(options)));
    assert.equal(observed.result.attempted,8);
    assert.deepEqual(observed.result.rows.map(r=>r.trial?.id),
      p.m.trials.map(t=>t.id));
    const trialRows=observed.result.rows.map(row=>{
      const seat=row.trial.candidateSlot==='A'?1:0;
      const validRoots=Array.isArray(row.rootActionLedger);
      return {id:row.trial.id,sourceSeat:seat,
        concise:summary(row),
        realAcceptedRootJoin:validRoots?join(row,observed.audit,seat):null,
        absentRootLedger:!validRoots,
        nativeFinished:row.finished===true,
        nativeError:row.error??null,
        paperQualified:false};
    });
    modes.push({id:mode.id,trialRows,
      globalPrototypeCustody:observed.audit,
      fullNative:observed.result});
  }
  const [a,b,c]=modes;
  const ab=compareSafely(a.fullNative.rows,b.fullNative.rows);
  const ac=compareSafely(a.fullNative.rows,c.fullNative.rows);
  const sameDeal=x=>x.sameSeed&&x.sameSourceDeal&&
    x.sameFullDeal&&x.sameStart;
  const sameControl=a.trialRows.every((r,i)=>
    r.concise.ledgerHash!==null&&
    r.concise.ledgerHash===c.trialRows[i].concise.ledgerHash&&
    r.concise.status===c.trialRows[i].concise.status);
  const publicPaid=b.trialRows.filter(r=>
    (r.realAcceptedRootJoin?.certifiedRealStorePublicPaidRetreatRoots??0)>0);
  const selected=b.trialRows.filter(r=>r.concise.paidIntents>0);
  const status=modes.map(mode=>({
    mode:mode.id,attempted:mode.fullNative.attempted,
    returned:mode.fullNative.rows.length,
    settledNative:mode.trialRows.filter(x=>x.nativeFinished).length,
    engineErrors:mode.trialRows.filter(x=>x.nativeError!==null).length,
    wrapperPaid:mode.globalPrototypeCustody.exactPhysicalPaidRetreats,
    publicRealRoots:mode.trialRows.reduce((n,r)=>
      n+(r.realAcceptedRootJoin?.certifiedRealStorePublicPaidRetreatRoots??0),0)
  }));
  const verdict={
    method:'fresh precommitted four seedgroups, both starting seats',
    groups:4,candidateContexts:8,nativeAttempts:24,
    matchingOpeningAB:ab.filter(sameDeal).length,
    matchingOpeningAC:ac.filter(sameDeal).length,
    allOpeningsMatched:ab.every(sameDeal)&&ac.every(sameDeal),
    controlsRepeatedExactly:sameControl,
    actualPublicPaidRoots:publicPaid.map(x=>({
      id:x.id,details:x.realAcceptedRootJoin.results
    })),
    paidIntentTrialIds:selected.map(x=>x.id),
    actualPublicPaidTrialCount:publicPaid.length,
    status,
    fullPaperPolicyQualified:false,
    competitiveGamesQualified:0,fieldWinRate:null
  };
  return {schema:VERSION,registrationPath:REG,registrationBlob:BLOB,
    pinnedTwinleaf:p.pin,verdict,modes};
}
if(require.main===module){
  if(process.argv.includes('--preflight')){
    const p=preflight();
    process.stdout.write('AGENT42_PROSPECTIVE_PREFLIGHT '+
      JSON.stringify({trials:p.m.trials.length,pin:p.pin})+'\n');
  }else{
    const out=run();
    require('./agent23-selected-joint-v2-release.cjs')
      .writeAtomicLocked(OUTPUT,out);
    process.stdout.write('AGENT42_PROSPECTIVE_PAID '+
      JSON.stringify(out.verdict)+'\n');
  }
}
module.exports={REG,BLOB,VERSION,OUTPUT,preflight,run};
