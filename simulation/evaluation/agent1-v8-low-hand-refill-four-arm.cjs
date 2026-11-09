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

const VERSION='agent1-v8-low-hand-refill-native-four-arm-v2-deal-parity';
const OUTPUT=path.resolve(__dirname,
  '../../artifacts/agent43-v8-snaptrap-owner-root/agent1-low-hand-refill-four-arm.json');
const MECHANICAL=new Set(['PassTurnAction','WaitPromptAction',
  'ResolvePromptAction','WaitForOpponentAction']);

/**
 * Genuine opponent action and later own-turn decision after paid Supporter.
 * @param {object} paid Tagged native root
 * @param {object[]} tape Same physical game's Store action ledger
 * @returns {object}
 */
function continuation(paid,tape){
  const index=tape.findIndex(row=>row.ordinal===paid.ordinal&&
    row.ownerHeldRefillAction===true);
  assert.ok(index>=0,'tagged action must be native Store recorded');
  const later=tape.slice(index+1);
  const opponent=later.find(row=>row.seat!==paid.seat&&
    !MECHANICAL.has(row.action))??null;
  const source=opponent?later.find(row=>row.seat===paid.seat&&
    row.turn>opponent.turn&&!MECHANICAL.has(row.action))??null:null;
  return {opponent:opponent?{ordinal:opponent.ordinal,turn:opponent.turn,
      action:opponent.action}:null,
    source:source?{ordinal:source.ordinal,turn:source.turn,
      action:source.action}:null,
    passed:Boolean(opponent&&source)};
}

/** @param {object} result Atomic, exclusive and hashed native A/B ledger */
function save(result){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const data=Buffer.from(JSON.stringify(result,null,2)+'\n');
  const digest=crypto.createHash('sha256').update(data).digest('hex');
  const fd=fs.openSync(OUTPUT+'.lock','wx');
  const tmp=OUTPUT+'.'+process.pid+'.'+crypto.randomUUID()+'.tmp';
  const sha=OUTPUT+'.sha256',shaTmp=sha+'.'+process.pid+'.'+crypto.randomUUID()+'.tmp';
  try {
    fs.writeFileSync(tmp,data,{flag:'wx'});fs.renameSync(tmp,OUTPUT);
    fs.writeFileSync(shaTmp,digest+'  '+path.basename(OUTPUT)+'\n',{flag:'wx'});
    fs.renameSync(shaTmp,sha);
  } finally {
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    if(fs.existsSync(shaTmp))fs.unlinkSync(shaTmp);
    fs.closeSync(fd);fs.unlinkSync(OUTPUT+'.lock');
  }
  return OUTPUT;
}

/** @returns {object} Frozen original-source A/B on both physical seats */
function run(){
  assert.equal(REGISTRATION.trials.length,4);
  assert.deepEqual(new Set(REGISTRATION.trials.map(x=>x.seed)),
    new Set([2404595552,948758444]));
  assert.deepEqual(new Set(REGISTRATION.trials.map(x=>x.sourceSeat)),
    new Set([0,1]));
  const common={ownerAbilityConfirm:true,ownerMailAfterPass:true,
    captureRootTape:true};
  const baseline=runNative(common);
  const treatment=runNative({...common,followHeldRefillSupporter:true});
  const ids=REGISTRATION.trials.map(x=>x.id);
  assert.deepEqual(baseline.exactOriginalTrialIds,ids);
  assert.deepEqual(treatment.exactOriginalTrialIds,ids);
  assert.equal(baseline.preservedNativeRootCap,260);
  assert.equal(treatment.preservedNativeRootCap,260);
  const audit=treatment.ownerMailAudit;
  assert.ok(audit);
  assert.deepEqual(audit.registeredTrialIds,ids);
  assert.equal(audit.opponentPrivateZonesRead,false);
  assert.equal(audit.heldRefillRejected,0,
    'real Store may only receive native canPlay-accepted Supporters');
  assert.equal(audit.heldRefillAccepted,audit.heldRefillEvents.length);
  const arms=REGISTRATION.trials.map(trial=>{
    const before=baseline.attempts.find(x=>x.id===trial.id);
    const after=treatment.attempts.find(x=>x.id===trial.id);
    assert.ok(before&&after);
    assert.equal(before.seed,trial.seed);assert.equal(after.seed,trial.seed);
    const beforeTape=baseline.publicRootTape.filter(row=>row.trialId===trial.id);
    const afterTape=treatment.publicRootTape.filter(row=>row.trialId===trial.id);
    const roots=afterTape.filter(row=>row.ownerHeldRefillAction===true);
    const receipts=audit.heldRefillEvents.filter(row=>row.trialId===trial.id);
    assert.equal(roots.length,receipts.length,
      'all accepted held-refill actions must join a physical Store receipt');
    for(const root of roots){
      assert.ok(receipts.some(x=>x.seat===root.seat&&x.turnBefore===root.turn));
    }
    return {
      id:trial.id,seed:trial.seed,sourceSeat:trial.sourceSeat,
      candidateSeat:trial.candidateSeat,
      physicalDealMatched:physicalDealsMatch(before,after),
      sourceDealSha256:{
        control:before.sourceDealFingerprint??null,
        treatment:after.sourceDealFingerprint??null
      },
      fullPhysicalDealSha256:{
        control:before.fullPhysicalDealFingerprint??null,
        treatment:after.fullPhysicalDealFingerprint??null
      },
      firstNativeDivergence:firstDivergence(beforeTape,afterTape),
      before:{nativeStatus:before.nativeStatus,finished:before.nativeFinished,
        winner:before.nativeWinner,endReason:before.nativeEndReason,
        finalPrizes:before.nativeFinalPrizes,roots:before.nativeActionCount,
        failure:before.nativeFailureDiagnostic??null},
      after:{nativeStatus:after.nativeStatus,finished:after.nativeFinished,
        winner:after.nativeWinner,endReason:after.nativeEndReason,
        finalPrizes:after.nativeFinalPrizes,roots:after.nativeActionCount,
        failure:after.nativeFailureDiagnostic??null},
      actualRefillRoots:roots.map(root=>({ordinal:root.ordinal,
        turn:root.turn,seat:root.seat,continuation:continuation(root,afterTape)})),
      paidRefillReceipts:receipts
    };
  });
  const accepted=arms.reduce((n,r)=>n+r.actualRefillRoots.length,0);
  const physicalMatches=arms.filter(r=>r.physicalDealMatched).length;
  return {
    schema:VERSION,gitHead:process.env.GITHUB_SHA??null,
    fixedSource60:REGISTRATION.cardsUnchanged,
    nativePinned:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    registeredTrials:ids,rootCap:260,
    physicalDealPairsMatched:physicalMatches,
    fullPhysicalPanelValid:physicalMatches===ids.length,
    controlOptions:common,
    treatmentOptions:{...common,followHeldRefillSupporter:true},
    offers:audit.heldRefillOffers,accepted,rejected:audit.heldRefillRejected,
    strictContinuations:arms.reduce((n,r)=>n+r.actualRefillRoots
      .filter(x=>x.continuation.passed).length,0),
    arms,
    status:physicalMatches!==ids.length?
      'INVALID_OR_MISSING_PHYSICAL_DEAL_PARITY':
      accepted>0?'NATIVE_HELD_REFILL_SUPPORTER_ACCEPTED_DEVELOPMENTAL':
      'NO_REFILL_SUPPORTER_ENCOUNTERED',
    qualifiedCompetentGames:0,winRate:null,selectedFinalFixedSixty:false
  };
}

if(require.main===module){
  let result;
  try{result=run();}
  catch(e){
    result={schema:VERSION,status:'NATIVE_OR_CONTRACT_ERROR',
      failure:{name:e.name,message:e.message,stack:String(e.stack).slice(0,1200)},
      qualifiedCompetentGames:0,winRate:null};
    process.exitCode=1;
  }
  const saved=save(result);
  process.stdout.write(JSON.stringify({file:saved,status:result.status,
    offers:result.offers??0,accepted:result.accepted??0,
    strictContinuations:result.strictContinuations??0,
    arms:result.arms?.map(x=>({id:x.id,refills:x.paidRefillReceipts,
      before:x.before.endReason,after:x.after.endReason,
      beforePrizes:x.before.finalPrizes,afterPrizes:x.after.finalPrizes}))??null,
    failure:result.failure??null},null,2)+'\n');
}
module.exports={VERSION,REGISTRATION,continuation,run,save};
