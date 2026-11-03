'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent36-profile-provenance-gate.cjs');
const {withRegisteredBehindResponse}=
  require('../twinleaf/agent14-behind-counter-response-native.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent14-rank11-native-floatstone-reply-20261103.json';
const REG_BLOB='1aa4f3631c1ba2759791a00ca540c9ba3bde53b0';
const OUTPUT='agent14-rank11-native-floatstone-return-two.json';
const read=file=>fs.readFileSync(path.join(ROOT,file));

/** Pre-native provenance gate for the exact precommitted double-candidate source. */
function preflight(){
  assert.equal(gitBlobHash(read(REG)),REG_BLOB);
  const reg=JSON.parse(read(REG).toString('utf8'));
  assert.equal(gitBlobHash(read(reg.frozenPriorProfile)),
    reg.frozenPriorProfileBlob);
  assert.equal(gitBlobHash(read(reg.frozenNativeResponseModule)),
    reg.frozenNativeResponseBlob);
  const profile=JSON.parse(read(reg.frozenPriorProfile).toString('utf8'));
  assert.equal(reg.expectedAttempts,2);
  assert.equal(reg.trials.length,2);
  assert.equal(reg.previousSeed,2171744612);
  assert.equal(reg.sourceRank,11);
  assert.equal(reg.actualOriginalSourceStarterSeat,1);
  assert.equal(reg.fixedEnginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  for(const trial of reg.trials){
    assert.equal(trial.rank,11);
    assert.equal(trial.seed,reg.previousSeed);
    assert.equal(trial.candidateSlot,'A');
  }
  assert.deepEqual(reg.trials.map(x=>x.candidateId),
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(profile.policyOptions.actorOnlyComposition,true);
  assert.equal(profile.policyOptions.nativeRootActionLimit,260);
  return {reg,profile};
}

/**
 * Inject exactly one independently implemented actor-only option into each
 * genuine native Actor34 root, retaining the existing Counter Catcher
 * treatment and every other frozen policy setting. Applies to both seats.
 *
 * @template T
 * @param {()=>T} run
 * @param {object} [deps] Pure testing seam.
 * @returns {T}
 */
function withSymmetricFloatStone(run,deps={}){
  const root=deps.root??require('../twinleaf/agent34-actor-only-root-policy.cjs');
  const before=Object.getOwnPropertyDescriptor(root,'withActorOnlyRootPolicy');
  assert.equal(typeof before?.value,'function');
  let count=0;
  function patched(execute,options){
    count++;
    return before.value.call(root,execute,{
      ...options,floatStoneMobility:true,floatStoneMobilityOwnerSeat:null
    });
  }
  Object.defineProperty(root,'withActorOnlyRootPolicy',{
    ...before,value:patched});
  try{
    const result=run();
    assert.ok(count>0,'No actual actor-owned Store compositions were augmented');
    return result;
  }finally{
    assert.strictEqual(root.withActorOnlyRootPolicy,patched);
    Object.defineProperty(root,'withActorOnlyRootPolicy',before);
  }
}

/**
 * A single two-candidate native rereplay. The earlier control and Catcher
 * artifact is a fixed external comparison, not a win-rate denominator.
 * @param {(opts:object)=>object} [runner]
 */
function runFalsification(runner=require('./agent41-bilateral-v2-development.cjs')
  .runDevelopment){
  const {reg,profile}=preflight();
  const beforeVip=process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV;
  const beforePayment=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  try{
    process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV='true';
    process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
    const wrapped=withSymmetricFloatStone(()=>
      withRegisteredBehindResponse(()=>runner({
        ...profile.policyOptions,registeredTrials:reg.trials,
        registeredFrameName:'agent14-rank11-catcher-and-floatstone-original'
      }),reg.trials,'catcher'));
    const result=wrapped.result;
    assert.equal(result.rows.length,reg.expectedAttempts);
    assert.deepEqual(result.rows.map(x=>x.trial.id),
      reg.trials.map(x=>x.id));
    const summaries=result.rows.map(row=>{
      const sourceRoots=(row.rootActionLedger??[])
        .filter(e=>e.playerSlot===1&&e.turnBefore>=32);
      return {
        trialId:row.trial.id,sourceDeal:row.sourceDealFingerprint??null,
        sourceActuallyFirst:row.actualStarterSeat===1,
        afterT32SourceFloatStonePlays:sourceRoots.filter(e=>
          e.action==='PlayCardAction'&&e.card==='Float Stone'),
        afterT32SourceRetreats:sourceRoots.filter(e=>
          e.action==='RetreatAction'),
        afterT32SourceGuzma:sourceRoots.filter(e=>
          e.action==='PlayCardAction'&&e.card==='Guzma'),
        sourceClawTurns:(row.sourceAttackSettlement?.attacks??[])
          .filter(e=>e.attackName==='Claw of Darkness')
          .map(e=>e.turnBefore),
        sourcePassTurns:sourceRoots.filter(e=>
          e.action==='PassTurnAction').map(e=>e.turnBefore),
        nativeStatus:row.status??null,
        error:row.error??null,
        endReason:row.endReason??null,finished:row.finished??null,
        finalPrizes:row.finalPrizes??null,
        competitivelyQualified:false
      };
    });
    return {
      schema:reg.schema,enginePin:reg.fixedEnginePin,
      preregistrationGitBlob:REG_BLOB,
      historicalSourceArtifactId:reg.priorSourceArtifactId,
      symmetricFloatStoneRoot:true,
      commonMode:'native-catcher-plus-symmetric-floatstone',
      immutableSourceSixties:true,
      results:result,adapterAudit:wrapped.audit,summaries,
      originalSourceDealUnchanged:summaries.every(x=>
        x.sourceDeal===reg.sourcePhysicalDealFingerprint&&
        x.sourceActuallyFirst),
      anyAcceptedSourceFloatStone:summaries.some(x=>
        x.afterT32SourceFloatStonePlays.length>0),
      anySourceRetreat:summaries.some(x=>
        x.afterT32SourceRetreats.length>0),
      competitiveGameQualified:false
    };
  }finally{
    if(beforeVip===undefined)delete process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV;
    else process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV=beforeVip;
    if(beforePayment===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=beforePayment;
  }
}

/** Exclusively locked atomic artifact write. */
function main(){
  const result=runFalsification();
  const dest=path.join(ROOT,OUTPUT),lock=dest+'.lock';
  const fd=fs.openSync(lock,'wx');
  try{
    const tmp=dest+'.pending';
    const out=fs.openSync(tmp,'wx');
    try{
      fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
      fs.fsyncSync(out);
    }finally{fs.closeSync(out);}
    fs.renameSync(tmp,dest);
  }finally{fs.closeSync(fd);fs.unlinkSync(lock);}
  process.stdout.write('FLOATSTONE_RETURN '+JSON.stringify({
    originalSourceDealUnchanged:result.originalSourceDealUnchanged,
    anyAcceptedSourceFloatStone:result.anyAcceptedSourceFloatStone,
    anySourceRetreat:result.anySourceRetreat,
    summaries:result.summaries.map(x=>({
      id:x.trialId,
      sourceFloatStone:x.afterT32SourceFloatStonePlays.map(z=>z.turnBefore),
      sourceRetreats:x.afterT32SourceRetreats.map(z=>z.turnBefore),
      sourceClaws:x.sourceClawTurns,sourcePasses:x.sourcePassTurns.slice(0,8),
      end:x.endReason,prizes:x.finalPrizes}))
  })+'\n');
  assert.equal(result.originalSourceDealUnchanged,true,
    'The native actual original source deal or starter diverged from prior control');
  return result;
}
if(require.main===module)main();
module.exports={preflight,withSymmetricFloatStone,runFalsification,main};
