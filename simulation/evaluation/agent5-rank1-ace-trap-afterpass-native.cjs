'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {preflight:basePreflight}=
  require('./agent42-v3-known-witness-reply-v2.cjs');
const {effectiveOptions,withSameRuntime}=
  require('./agent4-selected-v3-paper-funded-release.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withRank1AceTrapFork,MODES}=require(
  '../twinleaf/agent5-rank1-ace-trap-native-fork.cjs');
const {writeAtomicLocked}=require(
  './agent23-selected-joint-v2-release.cjs');

const VERSION='agent5-rank1-guzma-ace-trap-v1-retro-native-fourarm';
const REG='results/aichi-2026/registrations/agent5-rank1-guzma-ace-trap-source-t37-v1-20261104.json';
const ROOT=path.resolve(__dirname,'../..');
const OUTPUT='agent5-rank1-twoitem-ace-trap-native-fourarms.json';
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

/** Freeze preregistered historical deal, runner and scenario before Store. */
function preflight(){
  const payload=fs.readFileSync(path.join(ROOT,REG));
  const registration=JSON.parse(payload);
  assert.equal(registration.schema,
    'agent5-native-ranked-r1-ace-trap-after-native-pass-development-v1');
  assert.equal(registration.engine_revision,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(registration.physical_seed,1122744069);
  assert.equal(registration.action_cap,240);
  assert.equal(registration.original_source_rank,1);
  assert.equal(registration.candidate_seat,0);
  assert.equal(registration.source_seat,1);
  assert.equal(registration.fixed_scenario_first_divergence.expected_native_owner_pass,182);
  assert.deepEqual(registration.variants.map(v=>v.id),MODES);
  const {r:old,original:previous}=basePreflight();
  const trial=old.trials.find(t=>
    t.id===registration.existing_authentic_archive.trial_id);
  assert.ok(trial);
  assert.equal(trial.seed,registration.physical_seed);
  assert.equal(trial.candidateSlot,'A');
  assert.equal(trial.rank,1);
  const mode=previous.modes.find(m=>
    m.id===registration.mode);
  assert.ok(mode);
  const vendor=execFileSync('git',['rev-parse','HEAD'],{
    cwd:path.join(ROOT,'vendor/twinleaf'),encoding:'utf8'
  }).trim();
  assert.equal(vendor,registration.engine_revision);
  return {registration,registrationGitBlob:gitBlobHash(payload),
    trial,mode,previous,vendor};
}

/** Stable unprivileged Store root identity, used within the same trial. */
function rootProjection(root){
  return {
    turnBefore:root.turnBefore,turnAfter:root.turnAfter,
    playerSlot:root.playerSlot,action:root.action,
    card:root.card??null,attack:root.attack??null,
    pendingPrompt:root.pendingPrompt??null
  };
}
function firstDifference(control,other){
  const a=control.map(rootProjection),b=other.map(rootProjection);
  for(let i=0;i<Math.min(a.length,b.length);i++){
    if(JSON.stringify(a[i])!==JSON.stringify(b[i]))
      return {ordinal:i,control:a[i],treatment:b[i]};
  }
  return a.length===b.length?null:{
    ordinal:Math.min(a.length,b.length),
    control:a[Math.min(a.length,b.length)]??null,
    treatment:b[Math.min(a.length,b.length)]??null
  };
}
function sourceTurn38(row){
  const seq=(row.rootActionLedger??[]).filter(x=>
    x.playerSlot===1&&x.turnBefore===38&&
    x.action!=='ResolvePromptAction');
  return {
    firstNonPrompt:seq[0]??null,
    roots:seq.map(x=>({ordinal:x.actionOrdinal,action:x.action,
      card:x.card??null,ability:x.ability??null,attack:x.attack??null})),
    paidMaxGeistSeen:seq.some(x=>
      x.action==='AttackAction'&&x.attack==='Max Geist')
  };
}
/** One source original rank1 physical deal, four developmental counterfactual arms. */
function run(){
  const inputs=preflight();
  const {registration,previous,mode,trial}=inputs;
  const common={...previous.selectedV3CommonPolicy,
    nativeRootActionLimit:registration.action_cap};
  const opts=effectiveOptions({
    commonPolicy:common,nativeActionCap:registration.action_cap,
    registeredTrials:[trial]
  },mode);
  const arms=[];
  for(const variant of registration.variants){
    const options={...opts,
      registeredFrameName:VERSION+':'+variant.id};
    let execution;
    try{
      execution=withSameRuntime(()=>withRank1AceTrapFork(()=>
        runDevelopment(options),variant.id));
      const full=execution.result;
      assert.equal(full.attempted,1);
      assert.equal(full.rows.length,1);
      assert.equal(full.rows[0].trial.id,trial.id);
      arms.push({mode:variant.id,status:'executed',
        audit:execution.audit,row:full.rows[0]});
    }catch(error){
      arms.push({mode:variant.id,status:'runner-error',
        error:String(error?.stack??error),
        audit:error?.agent5Rank1AceTrapAudit??null,
        row:null});
    }
  }
  const baseline=arms[0].row;
  const repeat=arms[3].row;
  const seals=registration.existing_authentic_archive;
  const deal=arms.map(a=>({
    mode:a.mode,status:a.status,
    sourcePhysical:a.row?.sourceDealFingerprint??null,
    fullPhysical:a.row?.fullPhysicalDealFingerprint??null,
    matchesHistoricalSource:
      a.row?.sourceDealFingerprint===seals.source_deal_sha256,
    matchesHistoricalFull:
      a.row?.fullPhysicalDealFingerprint===seals.full_deal_sha256,
    nativeStatus:a.row?.status??null,
    nativeFinished:a.row?.finished??null,
    nativeWinner:a.row?.winner??null,
    finalPrizes:a.row?.finalPrizes??null,
    receipt:a.audit,
    firstDifference:baseline&&a.row?
      firstDifference(baseline.rootActionLedger,
        a.row.rootActionLedger):null,
    sourceTurn38:a.row?sourceTurn38(a.row):null,
    rootActionCount:a.row?.rootActionCount??null,
    rootHash:a.row?.rootActionLedgerSha256??null,
    competitiveQualified:false
  }));
  const matchingControlReplay=Boolean(baseline&&repeat&&
    baseline.rootActionLedgerSha256===repeat.rootActionLedgerSha256&&
    baseline.status===repeat.status);
  const matchingSourceDeals=arms.every(a=>a.row&&
    a.row.sourceDealFingerprint===seals.source_deal_sha256&&
    a.row.fullPhysicalDealFingerprint===seals.full_deal_sha256);
  const summary={
    historicalSingleTrial:trial.id,attempts:4,
    matchingSourceDeals,matchingControlReplay,
    controlBeforeRoot182Replayed:baseline?.rootActionLedger?.[182]
      ?.action==='PassTurnAction',
    historicalSourceWin:baseline?.finished===true&&baseline?.winner===1,
    acceptedSelectedActions:arms.map(a=>({
      mode:a.mode,selected:a.audit?.selectedItemCount??null,
      accepted:a.audit?.storeAccepted??null,
      targetedPromptAccepted:a.audit?.targetedPromptAccepted??null,
      stage:a.audit?.stageAfterRun??null
    })),
    statuses:deal.map(({mode,nativeStatus,nativeFinished,
      nativeWinner,finalPrizes,firstDifference,sourceTurn38})=>({
      mode,nativeStatus,nativeFinished,nativeWinner,finalPrizes,
      firstDifference,sourceTurn38
    })),
    competitivelyQualifiedGames:0,
    selectedFixedDeck:false,fieldWinRate:null
  };
  return {schema:VERSION,runHead:process.env.GITHUB_SHA??null,
    frozenRegistration:REG,registrationGitBlob:inputs.registrationGitBlob,
    pinnedEngineRevision:inputs.vendor,original60sUnchanged:true,
    exactlyOneHistoricalPositiveSourceDeal:true,
    nativeStorePaperQualificationIncomplete:true,
    policySelectedForCompetitiveDeployment:false,
    summary,arms,deal,archiveSha256:sha(arms.map(a=>
      ({mode:a.mode,rowRootHash:a.row?.rootActionLedgerSha256??null})))};
}
if(require.main===module){
  if(process.argv.includes('--preflight')){
    const x=preflight();
    process.stdout.write('AGENT5_RANK1_TRAP_PREFLIGHT '+JSON.stringify({
      registrationGitBlob:x.registrationGitBlob,trial:x.trial.id,
      modes:x.registration.variants.map(v=>v.id),
      vendor:x.vendor})+'\n');
  }else{
    const result=run();
    writeAtomicLocked(OUTPUT,result);
    process.stdout.write('AGENT5_RANK1_TRAP '+JSON.stringify(result.summary)+'\n');
    if(!result.summary.matchingSourceDeals||
       !result.summary.matchingControlReplay||
       result.arms.some(a=>a.status==='runner-error'))
      process.exitCode=1;
  }
}
module.exports={VERSION,REG,OUTPUT,preflight,firstDifference,
  rootProjection,sourceTurn38,run};
