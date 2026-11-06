'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {preflight:preflightV4}=require('./agent42-rank1-prospective-paid-v4.cjs');
const {summary}=require('./agent42-rank1-two-psychic-original-aba.cjs');
const {effectiveOptions,withSameRuntime}=require('./agent4-selected-v3-paper-funded-release.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {compareSafely}=require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {withTwoPsychicRetreatCustody}=require('../twinleaf/agent42-two-psychic-retreat-physical-custody-v2.cjs');
const {join}=require('./agent42-realstore-paid-retreat-join-v2.cjs');
const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent42-rank1-root-bound-paid-retreat-v2-replay-20261106-v2.json';
const BLOB='790f5dcb034ea4e1261f8c09f5de6b0ab9eb289c';
const OUTPUT='agent42-rank1-root-bound-paid-retreat-v2-replay-native.json';
const VERSION='agent42-rank1-root-bound-paid-retreat-v2-replay';
const read=p=>fs.readFileSync(path.join(ROOT,p));
function preflight(){
  const prior=preflightV4(),m=JSON.parse(read(REG));
  assert.equal(gitBlobHash(read(REG)),BLOB);
  assert.equal(m.registeredBeforeFirstNativeAttempt,true);
  assert.equal(m.observedTrialsBeforeRegistration,0);
  assert.equal(m.expectedNativeAttempts,24);
  assert.deepEqual(m.trials,prior.m.trials);
  assert.deepEqual(m.groups,prior.m.groups);
  assert.equal(m.pinnedTwinleaf,prior.pin);
  assert.equal(gitBlobHash(read(m.priorSeedSourceRegistration)),m.priorSeedSourceRegistrationBlob);
  for(const x of m.frozenInputs)assert.equal(gitBlobHash(read(x.path)),x.blob,'Changed '+x.path);
  assert.deepEqual(m.modes.map(x=>x.actorTwoUnitPaidRetreatRootV2),[false,true,false]);
  return {...prior,m};
}
function run(){
  const p=preflight(),modes=[];
  for(const mode of p.m.modes){
    const o=effectiveOptions({commonPolicy:{...p.old.selectedV3CommonPolicy,
      nativeRootActionLimit:p.m.actionCap},nativeActionCap:p.m.actionCap,
      registeredTrials:p.m.trials},p.selected);
    o.actorTwoUnitPaidRetreatRoot=false;o.actorTwoUnitPaidRetreatTargetTurn=null;
    o.actorTwoUnitPaidRetreatRootV2=mode.actorTwoUnitPaidRetreatRootV2;
    o.actorTwoUnitPaidRetreatTargetTurnV2=mode.actorTwoUnitPaidRetreatTargetTurnV2??null;
    o.registeredFrameName=VERSION+':'+mode.id;
    const observed=withTwoPsychicRetreatCustody(cb=>
      withSameRuntime(()=>runDevelopment({...o,...cb})));
    assert.equal(observed.result.attempted,8);
    const trialRows=observed.result.rows.map(row=>{
      const seat=row.trial.candidateSlot==='A'?1:0;
      const root=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??{};
      const concise={...summary(row),paidIntents:root.twoUnitPaidRetreatRootV2Selected??0,
        v2FloatStoneSelections:root.twoUnitPaidRetreatV2FreeToolSelected??0};
      const joined=Array.isArray(row.rootActionLedger)?join(row,observed.audit,seat):null;
      return {id:row.trial.id,sourceSeat:seat,concise,rootBoundJoin:joined,
        nativeFinished:row.finished===true,nativeError:row.error??null,
        rootLedgerLength:row.rootActionLedger?.length??null,paperQualified:false};
    });
    modes.push({id:mode.id,trialRows,custodyAudit:observed.audit,fullNative:observed.result});
  }
  const [a,b,c]=modes,ab=compareSafely(a.fullNative.rows,b.fullNative.rows);
  const ac=compareSafely(a.fullNative.rows,c.fullNative.rows);
  const same=x=>x.sameSeed&&x.sameSourceDeal&&x.sameFullDeal&&x.sameStart;
  const sameControls=a.trialRows.every((r,i)=>r.concise.ledgerHash!==null&&
    r.concise.ledgerHash===c.trialRows[i].concise.ledgerHash&&
    r.concise.status===c.trialRows[i].concise.status);
  const count=fn=>b.trialRows.filter(fn).map(x=>x.id);
  const verdict={method:'paired replay of already-observed v4 seeds; not independent',
    groups:4,candidateContexts:8,nativeAttempts:24,
    matchingOpeningAB:ab.filter(same).length,matchingOpeningAC:ac.filter(same).length,
    allOpeningsMatched:ab.every(same)&&ac.every(same),controlsRepeatedExactly:sameControls,
    v2PaidIntentTrialIds:count(x=>x.concise.paidIntents>0),
    v2FloatStoneAlternativeTrialIds:count(x=>x.concise.v2FloatStoneSelections>0),
    publicPaidTrialIds:count(x=>(x.rootBoundJoin?.certifiedRealStorePublicPaidRetreatRoots??0)>0),
    rootBoundCustodyTrialIds:count(x=>(x.rootBoundJoin?.physicallyCustodiedPaidRetreatRoots??0)>0),
    targetAttackIdentityTrialIds:count(x=>x.rootBoundJoin?.results?.some(y=>y.targetAttackIdentityConfirmed)),
    nativeTerminalTrialIds:count(x=>(x.rootBoundJoin?.paidRetreatWithNativeTerminalWin??0)>0),
    modes:modes.map(x=>({mode:x.id,attempted:x.fullNative.attempted,
      returned:x.fullNative.rows.length,finished:x.trialRows.filter(y=>y.nativeFinished).length,
      errors:x.trialRows.filter(y=>y.nativeError!==null).length,
      exactRootCustody:x.custodyAudit.exactPhysicalPaidRetreats,
      unrootedPhysical:x.custodyAudit.unrootedPhysicalPaymentObservations})),
    paperQualifiedGames:0,competitiveGamesQualified:0,fieldWinRate:null};
  return {schema:VERSION,registrationPath:REG,registrationBlob:BLOB,
    pinnedTwinleaf:p.pin,verdict,modes};
}
if(require.main===module){
  if(process.argv.includes('--preflight')){
    const p=preflight();
    process.stdout.write('AGENT42_ROOT_BOUND_V2_PREFLIGHT '+JSON.stringify({trials:p.m.trials.length,pin:p.pin})+'\n');
  }else{
    const out=run();
    require('./agent23-selected-joint-v2-release.cjs').writeAtomicLocked(OUTPUT,out);
    process.stdout.write('AGENT42_ROOT_BOUND_V2_REPLAY '+JSON.stringify(out.verdict)+'\n');
  }
}
module.exports={REG,BLOB,VERSION,OUTPUT,preflight,run};
