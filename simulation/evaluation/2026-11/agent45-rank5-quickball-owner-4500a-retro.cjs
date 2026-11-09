'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const reg=require('../../../results/aichi-2026/registrations/agent45-source-funded-hood-vs-champion-rank5-20261109.json');
const {runNativeBatch}=require('../agent32-fresh-perfection-field.cjs');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const source=require('./agent8-source-mew-funding-v6.cjs');
const {withPaperSemanticsProfileV1}=require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {withQuickBallOwnerPaymentContinuation}=
  require('../../twinleaf/agent45-quickball-owner-payment-prompt.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const OUTPUT=path.join(ROOT,'artifacts/agent45-rank5-4500a-quickball-owner-retro.json');
const VERSION='agent45-rank5-4500a-quickball-paper-payment-retrospective-v1';

/** @returns {object[]} Exactly two exposed, frozen, source-funded contenders. */
function retrospective(){
  const rows=reg.batches.filter(b=>b.sourceFunded===true)
    .map(batch=>({...batch,registeredTrials:batch.registeredTrials
      .filter(t=>t.repeat===4500&&t.candidateSlot==='A')}));
  assert.deepEqual(rows.map(x=>x.candidateId),
    ['champion-reference','hood-shield-v1']);
  assert.ok(rows.every(x=>x.registeredTrials.length===1));
  assert.ok(rows.every(x=>x.registeredTrials[0].seed===2124883768));
  return rows;
}

/** @returns {object} */
function run(){
  const hood=require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');
  assert.equal(hood.cards.reduce((n,c)=>n+c.count,0),60);
  const batches=[];
  for(const batch of retrospective()){
    let audit=null;
    const output=runNativeBatch(false,base=>{
      return withPaperSemanticsProfileV1(()=>{
        const corrected=withQuickBallOwnerPaymentContinuation(
          ()=>runDevelopment({
            ...base,...source.options(true),
            registeredCandidateDecks:{
              'hood-shield-v1':{label:'hood-shield-v1',cards:hood.cards}
            },
            paperQuickBallPayment:true,
            paperSupporterQuota:true,paperSameTargetAttachEnergy:true,
            physicalZoneGate:true,isolatePolicyRandomness:true,
            isolatePhysicalShuffleRandomnessAfterSetup:true,
            nativeRootActionLimit:reg.rootCap
          }));
        audit=corrected.audit;
        return corrected.result;
      },reg.sameJointPaperSemanticsProfile).result;
    },{
      registeredTrials:batch.registeredTrials,
      registeredFrameName:VERSION+':'+batch.candidateId,
      nativeRootActionLimit:reg.rootCap,
      singleHistoricalReplay:true,
      vipAfterPass:true,vipPreferMewtwoDonor:true
    });
    assert.ok(audit);
    const row=output.selected.rawDevelopment.rows[0];
    const roots=row.rootActionLedger??
      row.nativeAbortEvidence?.rootActionLedger??[];
    batches.push({candidateId:batch.candidateId,
      trial:batch.registeredTrials[0],promptAudit:audit,
      actualStarterSeat:row.actualStarterSeat??null,
      sourceDealFingerprint:row.sourceDealFingerprint??null,
      fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
      finished:row.finished===true,winner:row.winner??null,
      error:row.error??null,roots:roots.length,
      sourceNativeRoot185OrLater:roots.length>=185,
      quickBallAcceptedRoots:roots.filter(x=>
        x.action==='PlayCardAction'&&x.card==='Quick Ball').length,
      rootActionLedger:roots,rawNativeAttempt:row});
  }
  const report={schema:VERSION,
    retrospectiveOnPreviouslyExposedSourceErrors:true,
    sameOriginalPhysicalSourceAsPrior:true,
    originalPrintedSource60Unchanged:true,
    championAndHoodSixtiesUnchanged:true,
    extraPaymentPolicy:'both-seat owner-visible Quick Ball mandatory discard',
    originalErrorRoot:183,originalErrorTurn:38,
    qualifiedPaperGames:0,batches};
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    const f=fs.openSync(temp,'r');try{fs.fsyncSync(f);}finally{fs.closeSync(f);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
  return report;
}
if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    process.stdout.write(JSON.stringify({schema:VERSION,
      attempts:retrospective().length,seed:2124883768,
      qualifiedPaperGames:0})+'\n');
  }else{
    const out=run();
    process.stdout.write('AGENT45_QUICKBALL_OWNER_RETRO '+
      JSON.stringify(out.batches.map(x=>({
        candidate:x.candidateId,roots:x.roots,finished:x.finished,
        error:x.error,quickBallNativeAudit:x.promptAudit})))+'\n');
  }
}
module.exports={VERSION,retrospective,run};
