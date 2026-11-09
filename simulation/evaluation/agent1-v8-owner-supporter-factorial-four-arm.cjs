'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {run:runNative}=
  require('./agent43-v8-snaptrap-exact-prompt-blocker.cjs');
const {REGISTRATION,firstDivergence}=
  require('./agent38-v8-owner-mail-pass-four-arm.cjs');
const {physicalDealsMatch}=
  require('./agent1-v8-held-handiwork-four-arm.cjs');

const VERSION='agent1-v8-owner-supporter-contention-four-arm-factorial-v2-parity';
const OUTPUT=path.resolve(__dirname,
  '../../artifacts/agent43-v8-snaptrap-owner-root/agent1-supporter-factorial.json');
const MODES=Object.freeze({
  B:Object.freeze({}),
  H:Object.freeze({followHeldHandiwork:true}),
  R:Object.freeze({followHeldRefillSupporter:true}),
  HR:Object.freeze({followHeldHandiwork:true,followHeldRefillSupporter:true})
});
const MECHANICAL=new Set(['PassTurnAction','WaitPromptAction',
  'ResolvePromptAction','WaitForOpponentAction']);

/**
 * Audited actual owner strategic root, opposing response and source next turn.
 * @param {object} taggedRoot Registered native Store action with immutable ordinal.
 * @param {object[]} tape Public root tape from same physical match.
 * @returns {object}
 */
function continuation(taggedRoot,tape){
  const i=tape.findIndex(r=>r.ordinal===taggedRoot.ordinal&&
    r.seat===taggedRoot.seat&&r.turn===taggedRoot.turn);
  assert.ok(i>=0);
  const following=tape.slice(i+1);
  const opponent=following.find(r=>r.seat!==taggedRoot.seat&&
    !MECHANICAL.has(r.action))??null;
  const source=opponent?following.find(r=>r.seat===taggedRoot.seat&&
    r.turn>opponent.turn&&!MECHANICAL.has(r.action))??null:null;
  const minimal=r=>r?{ordinal:r.ordinal,turn:r.turn,action:r.action}:null;
  return {opponent:minimal(opponent),sourceOwnNextTurn:minimal(source),
    passed:Boolean(opponent&&source)};
}

/** @param {object} artifact Persist full, atomic and locked JSON+digest. */
function save(artifact){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const buffer=Buffer.from(JSON.stringify(artifact,null,2)+'\n');
  const digest=crypto.createHash('sha256').update(buffer).digest('hex');
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx');
  const suffix='.'+process.pid+'.'+crypto.randomUUID()+'.tmp';
  const tmp=OUTPUT+suffix,sha=OUTPUT+'.sha256',shaTmp=sha+suffix;
  try{
    fs.writeFileSync(tmp,buffer,{flag:'wx'});fs.renameSync(tmp,OUTPUT);
    fs.writeFileSync(shaTmp,digest+'  '+path.basename(OUTPUT)+'\n',
      {flag:'wx'});fs.renameSync(shaTmp,sha);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    if(fs.existsSync(shaTmp))fs.unlinkSync(shaTmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
  return OUTPUT;
}

/** @returns {object} Exact preregistered B/H/R/HR frozen physical experiment. */
function run(){
  assert.equal(REGISTRATION.trials.length,4);
  assert.deepEqual(new Set(REGISTRATION.trials.map(r=>r.seed)),
    new Set([2404595552,948758444]));
  assert.deepEqual(new Set(REGISTRATION.trials.map(r=>r.sourceSeat)),
    new Set([0,1]));
  const common={ownerAbilityConfirm:true,ownerMailAfterPass:true,
    captureRootTape:true};
  /** @type {Record<string,object>} */
  const byMode={};
  for(const [name,changes] of Object.entries(MODES))
    byMode[name]=runNative({...common,...changes});
  const ids=REGISTRATION.trials.map(r=>r.id);
  for(const result of Object.values(byMode)){
    assert.deepEqual(result.exactOriginalTrialIds,ids);
    assert.equal(result.preservedNativeRootCap,260);
    assert.ok(result.ownerMailAudit);
    assert.deepEqual(result.ownerMailAudit.registeredTrialIds,ids);
    assert.equal(result.ownerMailAudit.opponentPrivateZonesRead,false);
    assert.equal(result.ownerMailAudit.handiworkFromHandRejected,0);
    assert.equal(result.ownerMailAudit.heldRefillRejected,0);
  }
  const panel=REGISTRATION.trials.map(trial=>{
    const baselineTape=byMode.B.publicRootTape.filter(r=>r.trialId===trial.id);
    const baselineRow=byMode.B.attempts.find(r=>r.id===trial.id);
    assert.ok(baselineRow);
    const arms={};
    for(const name of Object.keys(MODES)){
      const data=byMode[name];
      const row=data.attempts.find(r=>r.id===trial.id);
      assert.ok(row);assert.equal(row.seed,trial.seed);
      const tape=data.publicRootTape.filter(r=>r.trialId===trial.id);
      const audit=data.ownerMailAudit;
      const held=tape.filter(r=>r.ownerHeldHandiworkAction===true);
      const refill=tape.filter(r=>r.ownerHeldRefillAction===true);
      const mill=audit.handiworkFromHandDeferredSettlements
        .filter(r=>r.trialId===trial.id);
      const paid=audit.heldRefillEvents.filter(r=>r.trialId===trial.id);
      assert.equal(held.length,audit.handiworkFromHandNativeDeckChanges
        .filter(r=>r.trialId===trial.id).length);
      assert.equal(refill.length,paid.length);
      arms[name]={
        physicalDealMatchedWithB:physicalDealsMatch(baselineRow,row),
        sourceDealSha256:row.sourceDealFingerprint??null,
        fullPhysicalDealSha256:row.fullPhysicalDealFingerprint??null,
        firstDivergenceFromB:firstDivergence(baselineTape,tape),
        status:row.nativeStatus,finished:row.nativeFinished,
        winner:row.nativeWinner,endReason:row.nativeEndReason,
        prizes:row.nativeFinalPrizes,roots:row.nativeActionCount,
        error:row.nativeFailureDiagnostic??null,
        heldHandiwork:held.map(r=>({ordinal:r.ordinal,seat:r.seat,turn:r.turn,
          continuation:continuation(r,tape)})),
        heldRefill:refill.map(r=>({ordinal:r.ordinal,seat:r.seat,turn:r.turn,
          continuation:continuation(r,tape)})),
        paidRefillReceipts:paid,
        deferredMillReceipts:mill,
        totalOpponentCardsMilled:mill.reduce((n,r)=>n+r.deckCardsMoved,0),
        nativeSettledHeldCount:mill.length,
        nativeAcceptedHeldCount:held.length,
        nativeAcceptedRefillCount:refill.length
      };
    }
    return {trialId:trial.id,seed:trial.seed,sourceSeat:trial.sourceSeat,
      candidateSeat:trial.candidateSeat,arms};
  });
  const modeSummaries=Object.fromEntries(Object.keys(MODES).map(name=>{
    const rows=panel.map(p=>p.arms[name]);
    return [name,{
      acceptedHeld:rows.reduce((n,r)=>n+r.nativeAcceptedHeldCount,0),
      settledHeld:rows.reduce((n,r)=>n+r.nativeSettledHeldCount,0),
      totalCardsMilled:rows.reduce((n,r)=>n+r.totalOpponentCardsMilled,0),
      acceptedRefill:rows.reduce((n,r)=>n+r.nativeAcceptedRefillCount,0),
      strictContinuations:rows.reduce((n,r)=>n+[
        ...r.heldHandiwork,...r.heldRefill]
        .filter(x=>x.continuation.passed).length,0),
      caps:rows.filter(r=>r.endReason==='action-limit').length,
      nativeTerminals:rows.filter(r=>r.finished===true).length,
      failures:rows.filter(r=>r.status==='engine-error').length
    }];
  }));
  const fullPhysicalDealComparisonsMatched=panel.reduce((n,p)=>
    n+Object.values(p.arms).filter(a=>a.physicalDealMatchedWithB).length,0);
  return {
    schema:VERSION,gitHead:process.env.GITHUB_SHA??null,
    physicalDealComparisonsMatched:fullPhysicalDealComparisonsMatched,
    fullPhysicalPanelValid:fullPhysicalDealComparisonsMatched===
      REGISTRATION.trials.length*Object.keys(MODES).length,
    status:fullPhysicalDealComparisonsMatched===
      REGISTRATION.trials.length*Object.keys(MODES).length?
      'NATIVE_FACTORIAL_FULL_PHYSICAL_PARITY':
      'INVALID_OR_MISSING_PHYSICAL_DEAL_PARITY',
    preregistrationPath:
      'results/methodology/registrations/agent1-v8-owner-supporter-contention-factorial-20261109.md',
    pinnedVendor:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    registeredTrialIds:ids,sourceAndCandidate60:REGISTRATION.cardsUnchanged,
    rootsPerArm:260,commonOptions:common,modeOptions:MODES,
    modeSummaries,panel,
    qualifiedCompetitiveGames:0,finalFixed60:null,winRate:null
  };
}

if(require.main===module){
  let result;
  try{result=run();}
  catch(error){
    result={schema:VERSION,status:'NATIVE_OR_CONTRACT_ERROR',
      failure:{name:error.name,message:error.message,
        stack:String(error.stack).slice(0,1200)},
      qualifiedCompetitiveGames:0,winRate:null};
    process.exitCode=1;
  }
  const file=save(result);
  process.stdout.write(JSON.stringify({file,
    status:result.status??'NATIVE_FACTORIAL_COMPLETED',
    modes:result.modeSummaries??null,
    panel:result.panel?.map(p=>({trialId:p.trialId,
      modes:Object.fromEntries(Object.entries(p.arms).map(([name,r])=>[
        name,{held:r.nativeAcceptedHeldCount,
          refill:r.nativeAcceptedRefillCount,
          cardsMilled:r.totalOpponentCardsMilled,
          end:r.endReason,prizes:r.prizes,roots:r.roots}
      ]))}))??null,
    failure:result.failure??null},null,2)+'\n');
  if(result.fullPhysicalPanelValid===false)process.exitCode=1;
}
module.exports={VERSION,MODES,REGISTRATION,continuation,run,save};
