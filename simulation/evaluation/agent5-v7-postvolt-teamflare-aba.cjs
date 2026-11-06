'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const headless=require('../twinleaf/headless.cjs');
const {runStewardCommonVoltV7}=
  require('./agent36-issue25-common-v7.cjs');
const {withTargetedTeamFlareNative}=
  require('../twinleaf/agent17-targeted-owner-teamflare-native.cjs');
const {withOriginalFlarePhysicalWitness,VERSION:WITNESS}=
  require('../twinleaf/agent5-v7-teamflare-physical-witness.cjs');
const reg=require('../../results/aichi-2026/registrations/agent5-v7-postvolt-teamflare-aba-20261106.json');

const VERSION='agent5-v7-original-postvolt-teamflare-retro-aba-v1';
const PREFIX='agent41-bilateral-v2-common-policy-development-';

/** @param {object} nativeRow */
function nativeSummary(nativeRow) {
  const id=nativeRow.trial?.id??null;
  return {
    id,status:nativeRow.status??(nativeRow.finished?
      'native-terminal-unqualified':nativeRow.endReason??'unknown'),
    nativeRoots:nativeRow.rootActionLedger?.length??null,
    sourceSeat:nativeRow.sourceSeat??null,
    sourcePhysical:nativeRow.sourceDealFingerprint??null,
    entirePhysical:nativeRow.fullPhysicalDealFingerprint??null,
    initialSourceDeck:nativeRow.sourceDeckFingerprint??null,
    initialCandidateDeck:nativeRow.candidateDeckFingerprint??null,
    originalPublicLedgerSha:nativeRow.rootActionLedgerSha256??null,
    originalPublicRoots:nativeRow.rootActionLedger??[],
    sourceAttackSettlement:nativeRow.sourceAttackSettlement??null,
    sourceLastPrizes:nativeRow.finalPrizes??null,
    nativeFinished:nativeRow.finished===true,
    nativeWinner:nativeRow.winner??null,
    competitiveQualified:false
  };
}

/**
 * Three full frozen original-v7 8-arm cohorts; change only a single
 * preregistered native source owner Pass in the B treatment. Reuse an
 * already reviewed physical card selector from Agent17, independently
 * observe the exact original opposing Energy object's disposition.
 *
 * @param {{runner?:Function,headless?:{runMatch:Function},
 *   targetHook?:Function,physicalHook?:Function}} [deps]
 */
function run(deps={}){
  const runner=deps.runner??runStewardCommonVoltV7;
  const runtime=deps.headless??headless;
  const targetHook=deps.targetHook??withTargetedTeamFlareNative;
  const physicalHook=deps.physicalHook??withOriginalFlarePhysicalWitness;
  assert.equal(typeof runtime.runMatch,'function');
  assert.equal(reg.schema,'agent5-v7-original-rank6-postvolt-teamflare-aba-retro-v1');
  const expected=new Set(require(
    '../../results/aichi-2026/registrations/agent36-issue25-common-v6-96root-20261106.json'
  ).trials.map(x=>x.id));
  assert.equal(expected.size,8);
  const attemptAudits=[];
  function phase(mode){
    const prior=runtime.runMatch;
    function wrapped(request){
      const label=String(request?.label??'');
      assert.ok(label.startsWith(PREFIX),'Original registered trial label required');
      const id=label.slice(PREFIX.length);
      assert.ok(expected.has(id),'Unexpected native original trial');
      if(mode!=='B'||id!==reg.target.id)return prior(request);
      try{
        const witness=physicalHook(()=>targetHook(()=>prior(request),{
          targetSeat:reg.target.sourceSeat,targetTurn:reg.target.sourceTurn
        }),{seat:reg.target.sourceSeat,
          turn:reg.target.sourceTurn,trialId:id});
        attemptAudits.push({id,mode,native:'returned',
          physical:witness.audit,selection:witness.result.audit});
        return witness.result.result;
      }catch(error){
        attemptAudits.push({id,mode,native:'engine-aborted',
          physical:error?.agent5V7FlarePhysicalAudit??null,
          selection:null,error:String(error?.message??error).slice(0,300)});
        throw error;
      }
    }
    runtime.runMatch=wrapped;
    try{
      const result=runner({headless:runtime});
      const rows=result.rawDevelopment?.rows??[];
      assert.equal(rows.length,8);
      const seen=new Set(rows.map(row=>row.trial.id));
      assert.deepEqual(seen,expected);
      return {manifest:result.manifest,
        audit:result.diagnostic,rows:rows.map(nativeSummary)};
    }finally{
      assert.strictEqual(runtime.runMatch,wrapped);
      runtime.runMatch=prior;
    }
  }

  const a=phase('A');
  const b=phase('B');
  const again=phase('A');
  const aBy=new Map(a.rows.map(row=>[row.id,row]));
  const bBy=new Map(b.rows.map(row=>[row.id,row]));
  const repeatedBy=new Map(again.rows.map(row=>[row.id,row]));
  const publicKey=row=>JSON.stringify(row?.originalPublicRoots??[]);
  const compare=a.rows.map(x=>{
    const y=bBy.get(x.id),z=repeatedBy.get(x.id);
    const target=x.id===reg.target.id;
    const unchangedDeal=[x,y,z].every(r=>r.sourcePhysical===x.sourcePhysical&&
      r.entirePhysical===x.entirePhysical)&&
      x.sourcePhysical!==null&&x.entirePhysical!==null;
    const exactRepeat=publicKey(x)===publicKey(z);
    const beforePass=r=>JSON.stringify(r.originalPublicRoots.filter(root=>
      root.actionOrdinal<reg.target.originalPassRootOrdinal));
    const prefix=target?beforePass(x)===beforePass(y):null;
    const sameTape=publicKey(x)===publicKey(y);
    return {id:x.id,target,unchangedEntireInitialDeal:unchangedDeal,
      repeatedControlPublicActionTapeExact:exactRepeat,
      unchangedNonTargetPublicTape:target?null:sameTape,
      targetPrePassSameAcceptedPublicPrefix:prefix,
      originalSourceSeat:x.sourceSeat,originalStatuses:{
        A:x.status,B:y.status,ARepeat:z.status},
      nativeRoots:{A:x.nativeRoots,B:y.nativeRoots,ARepeat:z.nativeRoots},
      rootSha:{A:x.originalPublicLedgerSha,B:y.originalPublicLedgerSha,
        ARepeat:z.originalPublicLedgerSha},
      originalSourcePrizes:{A:x.sourceLastPrizes,B:y.sourceLastPrizes,
        ARepeat:z.sourceLastPrizes},
      observedNativeWinner:{A:x.nativeWinner,B:y.nativeWinner,
        ARepeat:z.nativeWinner},
      originalRootWindow:target?x.originalPublicRoots.filter(root=>
        root.actionOrdinal>=28&&root.actionOrdinal<=38):[],
      treatedRootWindow:target?y.originalPublicRoots.filter(root=>
        root.actionOrdinal>=28&&root.actionOrdinal<=43):[],
      originalSourceAttackSettlements:{
        A:x.sourceAttackSettlement?.attacks?.length??null,
        B:y.sourceAttackSettlement?.attacks?.length??null,
        ARepeat:z.sourceAttackSettlement?.attacks?.length??null},
      competitiveQualified:false};
  });
  const targetA=aBy.get(reg.target.id);
  const targetB=bBy.get(reg.target.id);
  const physical=attemptAudits.find(x=>x.id===reg.target.id&&
    x.mode==='B');
  return {schema:VERSION,registration:reg,
    original24NativeAttempts:24,original8UniqueRegisteredTrials:8,
    numberOfTargetedCounterfactualDecisions:1,
    pinnedTwinleaf:reg.pinnedTwinleaf,
    targetBaselinePhysicalMatchesFrozen:targetA.sourcePhysical===
      reg.target.sourceDealFingerprint&&
      targetA.entirePhysical===reg.target.fullPhysicalDealFingerprint,
    targetBaselineRootDigestMatchesFrozen:
      targetA.originalPublicLedgerSha===reg.target.baselineRootLedgerSha256,
    targetTreatmentPhysicalSameAsControl:
      targetA.sourcePhysical===targetB.sourcePhysical&&
      targetA.entirePhysical===targetB.entirePhysical,
    repeatedControlsIdentical:compare.every(x=>
      x.repeatedControlPublicActionTapeExact),
    allSourceAndEntirePhysicalDealsIdentical:compare.every(x=>
      x.unchangedEntireInitialDeal),
    sevenNontargetPublicRootTapesIdentical:compare.filter(x=>
      !x.target).every(x=>x.unchangedNonTargetPublicTape),
    targetRootPrefixMatched:compare.find(x=>x.target)
      .targetPrePassSameAcceptedPublicPrefix,
    targetPhysicalStoreWitness:physical??null,
    byId:compare,phases:{A:a,B:b,ARepeat:again},
    competitiveQualifiedGames:0,winRateEstimate:null};
}
function writeLocked(filename,data){
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const fd=fs.openSync(filename+'.lock','wx');
  const tmp=filename+'.'+process.pid+'.tmp',side=tmp+'.sha256';
  try{
    const body=JSON.stringify(data,null,2)+'\n';
    fs.writeFileSync(tmp,body,{flag:'wx'});
    const sha=createHash('sha256').update(body).digest('hex');
    fs.writeFileSync(side,sha+'  '+path.basename(filename)+'\n',{flag:'wx'});
    fs.renameSync(tmp,filename);
    fs.renameSync(side,filename+'.sha256');
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    if(fs.existsSync(side))fs.unlinkSync(side);
    fs.closeSync(fd);fs.unlinkSync(filename+'.lock');
  }
}
module.exports={VERSION,run,nativeSummary,writeLocked};
if(require.main===module){
  const folder=process.env.AGENT5_V7_TEAMFLARE_ABA_DIR;
  assert.ok(folder,'Set AGENT5_V7_TEAMFLARE_ABA_DIR');
  const result=run();
  writeLocked(path.join(folder,'agent5-v7-teamflare-aba.json'),result);
  process.stdout.write(JSON.stringify({
    schema:VERSION,attempts:result.original24NativeAttempts,
    sourceParity:result.allSourceAndEntirePhysicalDealsIdentical,
    sourcePrefix:result.targetRootPrefixMatched,
    controlRepeat:result.repeatedControlsIdentical,
    nontargetParity:result.sevenNontargetPublicRootTapesIdentical,
    physical:result.targetPhysicalStoreWitness,
    target:result.byId.find(x=>x.target),
    competitiveQualifiedGames:0})+'\n');
}
