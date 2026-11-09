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

const VERSION='agent1-v8-original-held-arven-search-four-arm-v2-deal-parity';
const OUTPUT=path.resolve(__dirname,
  '../../artifacts/agent43-v8-snaptrap-owner-root/agent1-original-held-arven.json');
const MECHANICAL=new Set(['PassTurnAction','WaitPromptAction',
  'ResolvePromptAction','WaitForOpponentAction']);

/**
 * Strict owner-current-turn action -> opponent next strategic root -> source
 * own future turn, excluding same-turn defensive acknowledgements.
 * @param {object} root Exact accepted Store root.
 * @param {object[]} tape Same native match root tape.
 * @returns {object}
 */
function continuation(root,tape){
  const at=tape.findIndex(row=>row.ordinal===root.ordinal&&
    row.ownerHeldArvenAction===true);
  assert.ok(at>=0,'native tagged Arven root absent');
  const after=tape.slice(at+1);
  const opponent=after.find(row=>
    row.seat!==root.seat&&!MECHANICAL.has(row.action))??null;
  const source=opponent?after.find(row=>
    row.seat===root.seat&&row.turn>opponent.turn&&
    !MECHANICAL.has(row.action))??null:null;
  const compact=row=>row?{ordinal:row.ordinal,turn:row.turn,
    action:row.action}:null;
  return {opponent:compact(opponent),sourceOwnTurn:compact(source),
    passed:Boolean(opponent&&source)};
}

/** @param {object} result Atomic exclusive output + SHA256 sidecar */
function save(result){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const bytes=Buffer.from(JSON.stringify(result,null,2)+'\n');
  const digest=crypto.createHash('sha256').update(bytes).digest('hex');
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx');
  const suffix='.'+process.pid+'.'+crypto.randomUUID()+'.tmp';
  const tmp=OUTPUT+suffix,sha=OUTPUT+'.sha256',shaTmp=sha+suffix;
  try{
    fs.writeFileSync(tmp,bytes,{flag:'wx'});fs.renameSync(tmp,OUTPUT);
    fs.writeFileSync(shaTmp,digest+'  '+path.basename(OUTPUT)+'\n',
      {flag:'wx'});fs.renameSync(shaTmp,sha);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    if(fs.existsSync(shaTmp))fs.unlinkSync(shaTmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
  return OUTPUT;
}

/** @returns {object} Fixed prospective original source-60 native A/B. */
function run(){
  assert.equal(REGISTRATION.trials.length,4);
  assert.deepEqual(new Set(REGISTRATION.trials.map(r=>r.seed)),
    new Set([2404595552,948758444]));
  assert.deepEqual(new Set(REGISTRATION.trials.map(r=>r.sourceSeat)),
    new Set([0,1]));
  const common={ownerAbilityConfirm:true,ownerMailAfterPass:true,
    captureRootTape:true};
  const control=runNative(common);
  const treatment=runNative({...common,followHeldArven:true});
  const ids=REGISTRATION.trials.map(r=>r.id);
  assert.deepEqual(control.exactOriginalTrialIds,ids);
  assert.deepEqual(treatment.exactOriginalTrialIds,ids);
  assert.equal(control.preservedNativeRootCap,260);
  assert.equal(treatment.preservedNativeRootCap,260);
  const audit=treatment.ownerMailAudit;
  assert.ok(audit);
  assert.deepEqual(audit.registeredTrialIds,ids);
  assert.equal(audit.opponentPrivateZonesRead,false);
  assert.equal(audit.arvenFromHandRejected,0);
  assert.equal(audit.arvenFromHandAccepted,
    audit.arvenPlayEvents.filter(x=>x.origin==='held').length);
  const panel=REGISTRATION.trials.map(trial=>{
    const before=control.attempts.find(r=>r.id===trial.id);
    const after=treatment.attempts.find(r=>r.id===trial.id);
    assert.ok(before&&after);
    assert.equal(before.seed,trial.seed);
    assert.equal(after.seed,trial.seed);
    const first=control.publicRootTape.filter(r=>r.trialId===trial.id);
    const tape=treatment.publicRootTape.filter(r=>r.trialId===trial.id);
    const held=tape.filter(r=>r.ownerHeldArvenAction===true);
    const ownerPlays=audit.arvenPlayEvents.filter(r=>
      r.trialId===trial.id&&r.origin==='held');
    const search=audit.arvenFromHandSearchEvents.filter(r=>
      r.trialId===trial.id);
    assert.equal(held.length,ownerPlays.length);
    for(const r of held){
      assert.ok(ownerPlays.some(x=>x.seat===r.seat&&x.turnBefore===r.turn));
    }
    const slim=r=>({
      status:r.nativeStatus,finished:r.nativeFinished,
      winner:r.nativeWinner,endReason:r.nativeEndReason,
      prizes:r.nativeFinalPrizes,roots:r.nativeActionCount,
      failure:r.nativeFailureDiagnostic??null
    });
    return {
      trialId:trial.id,seed:trial.seed,sourceSeat:trial.sourceSeat,
      physicalDealMatched:physicalDealsMatch(before,after),
      sourceDealSha256:{
        control:before.sourceDealFingerprint??null,
        treatment:after.sourceDealFingerprint??null
      },
      fullPhysicalDealSha256:{
        control:before.fullPhysicalDealFingerprint??null,
        treatment:after.fullPhysicalDealFingerprint??null
      },
      firstDivergence:firstDivergence(first,tape),
      control:slim(before),treatment:slim(after),
      acceptedHeldArvenRoots:held.map(r=>({ordinal:r.ordinal,
        seat:r.seat,turn:r.turn,continuation:continuation(r,tape)})),
      paidSupporterReceipts:ownerPlays,
      physicalItemToolSearchReceipts:search,
      physicallySettledSearches:search.filter(r=>
        r.physicalOwnerDeckToHand===true).length
    };
  });
  const accepted=panel.reduce((n,r)=>n+r.acceptedHeldArvenRoots.length,0);
  const settled=panel.reduce((n,r)=>n+r.physicallySettledSearches,0);
  const physicallyMatched=panel.filter(r=>r.physicalDealMatched).length;
  return {
    schema:VERSION,gitHead:process.env.GITHUB_SHA??null,
    registrationPath:
      'results/methodology/registrations/agent1-v8-original-held-arven-native-four-arm-20261109.md',
    nativePinned:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    originalSourceSixties:REGISTRATION.cardsUnchanged,
    registeredOriginalTrialIds:ids,
    nativeRootCap:260,
    physicalDealPairsMatched:physicallyMatched,
    fullPhysicalPanelValid:physicallyMatched===ids.length,
    controlOptions:common,
    treatmentOptions:{...common,followHeldArven:true},
    acceptedHeldArven:accepted,physicallySettledSearches:settled,
    unaccountedSearches:audit.arvenSearchUnsettled,
    searchNoPrompt:audit.arvenNoSearchPrompt,
    nativeOffers:audit.arvenFromHandOffers,
    nativeRejections:audit.arvenFromHandRejected,
    laterStrategicContinuations:panel.reduce((n,r)=>
      n+r.acceptedHeldArvenRoots.filter(x=>x.continuation.passed).length,0),
    panel,
    status:physicallyMatched!==ids.length?
      'INVALID_OR_MISSING_PHYSICAL_DEAL_PARITY':
      accepted>0?'NATIVE_HELD_ARVEN_ACCEPTED_DEVELOPMENTAL':
      'NO_HELD_ARVEN_ACTION_ENCOUNTERED',
    qualifiedCompetitiveGames:0,winRate:null,finalFixedSixty:null
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
  process.stdout.write(JSON.stringify({
    file,status:result.status,
    accepted:result.acceptedHeldArven??0,
    physicallySettled:result.physicallySettledSearches??0,
    strictContinuations:result.laterStrategicContinuations??0,
    nativeRejections:result.nativeRejections??null,
    panels:result.panel?.map(r=>({
      id:r.trialId,sourceSeat:r.sourceSeat,
      played:r.paidSupporterReceipts,
      searched:r.physicalItemToolSearchReceipts,
      controlEnd:r.control.endReason,treatmentEnd:r.treatment.endReason,
      beforePrizes:r.control.prizes,afterPrizes:r.treatment.prizes
    }))??null,failure:result.failure??null
  },null,2)+'\n');
}
module.exports={VERSION,REGISTRATION,continuation,run,save};
