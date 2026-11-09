'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const reg=require('../../../results/aichi-2026/registrations/2026-11/agent3-skyliner-public-free-native-20261109.json');
const printed=require('../../../results/aichi-2026/candidate-hood-consistency-v2.json');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const {SOURCE_POLICY}=require('./hood-consistency-v2-targeted-native.cjs');
const {receipt,saveAtomic}=require('./hood-v2-flexible-paid-retreat-native.cjs');
const {runDevelopment,validateRegisteredTrialGroups}=
  require('../agent41-bilateral-v2-development.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF,VERSION:PROFILE}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const VERSION='agent3-skyliner-public-native-prospective-v1';
const OUTPUT=process.env.AGENT3_SKYLINER_PROSPECTIVE_OUTPUT??
  path.join(ROOT,'artifacts/agent3-skyliner-public-free-prospective.json');
const PAPER_PROFILE=Object.freeze({
  celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true
});

/** @param {string} filename Repository-relative file. @returns {string} */
function blob(filename){
  const buf=fs.readFileSync(path.join(ROOT,filename));
  return createHash('sha1').update('blob '+buf.length+'\0')
    .update(buf).digest('hex');
}

/** @returns {object} Registered exact-print, policy, and group membership. */
function preflight(){
  assert.equal(reg.schema,VERSION);
  assert.equal(reg.status,'FROZEN BEFORE FIRST NATIVE GAME');
  assert.equal(reg.pinnedTwinleaf,PINNED_TWINLEAF);
  assert.equal(reg.paperSemanticsProfile,PROFILE);
  assert.equal(frozen.pinnedVendorRevision,PINNED_TWINLEAF);
  assert.equal(blob(reg.printedFixed60),reg.printedFixed60GitBlobSha);
  assert.equal(blob(reg.originalRosterPath),reg.originalRosterGitBlobSha);
  assert.equal(blob(reg.frozenPolicyPath),reg.frozenPolicyGitBlobSha);
  for(const source of reg.policySourceHashes)
    assert.equal(blob(source.path),source.sha,'Frozen policy drift: '+source.path);
  assert.equal(printed.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(reg.registeredGroups,16);
  assert.equal(reg.registeredNativeAttempts,32);
  assert.equal(reg.nativeRootLimit,260);
  assert.deepEqual(reg.arms,['baseline-public','skyliner-public']);
  assert.deepEqual(reg.originalRanks,[5,6,7,11]);
  assert.equal(reg.registeredTrials.length,32);
  assert.equal(reg.sourceGroups.length,16);
  assert.equal(new Set(reg.sourceGroups.map(g=>g.seed)).size,16);
  assert.ok(reg.sourceGroups.every(g=>g.sample==='PROSPECTIVE'));
  const admitted=require('../agent25-authenticated-source-admission.cjs')
    .authenticatedSourceRanks(
      require('../../../results/aichi-2026/full-decklists.json'),true);
  for(const id of reg.arms){
    const trials=reg.registeredTrials.filter(t=>t.candidateId===id);
    assert.equal(trials.length,16);
    validateRegisteredTrialGroups(trials,admitted,false,true);
  }
  for(const group of reg.sourceGroups){
    const pair=reg.registeredTrials.filter(x=>
      x.rank===group.rank&&x.repeat===group.repeat&&
      x.candidateSlot===group.candidateSlot);
    assert.deepEqual(pair.map(x=>x.candidateId),reg.arms);
    assert.ok(pair.every(x=>x.seed===group.seed));
  }
  assert.deepEqual(reg.treatmentOnlyFlags,
    {actorSkylinerFundedBenchRetreatRoot:true});
  return {registeredProspectiveGroups:16,registeredNativeAttempts:32,
    printedSixtyUnchanged:true,policySourceHashes:reg.policySourceHashes};
}

/**
 * Preserve exact owner-split native retreat and attack declarations with an
 * explicitly distinct Skyliner actor-policy root audit.
 * @param {object} row Native Store result.
 * @returns {object} Root outcome receipt.
 */
function nativeReceipt(row){
  const r=receipt(row);
  const roots=r.roots;
  const sourceSeat=1-r.seat;
  const audit=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
  return {...r,
    sourceRetreatRoots:roots.filter(x=>x.playerSlot===sourceSeat&&
      x.action==='RetreatAction').length,
    sourceAttackDeclarations:roots.filter(x=>x.playerSlot===sourceSeat&&
      x.action==='AttackAction').length,
    skylinerRootSelected:audit?.skylinerFundedBenchRetreatSelected??null,
    skylinerPolicyOptIn:audit?.skylinerFundedBenchRetreatRootOptIn??null,
    nativeTruePaperQualified:false
  };
}

/** @param {object[]} records Registered trial receipts. @returns {object} */
function compare(records){
  assert.equal(records.length,32);
  const byId=new Map(records.map(r=>[r.id,r]));
  assert.equal(byId.size,32);
  const groups=reg.sourceGroups.map(g=>{
    const key=[g.rank,g.repeat,g.candidateSlot].join(':');
    const a=byId.get(key+':baseline-public');
    const b=byId.get(key+':skyliner-public');
    assert.ok(a&&b,'Missing native fixed-sixty pair '+key);
    const matched=Boolean(a.fullPhysicalDealFingerprint&&
      b.fullPhysicalDealFingerprint&&a.sourceDealFingerprint&&
      b.sourceDealFingerprint&&
      a.fullPhysicalDealFingerprint===b.fullPhysicalDealFingerprint&&
      a.sourceDealFingerprint===b.sourceDealFingerprint&&
      a.actualStarterSeat!==null&&
      a.actualStarterSeat===b.actualStarterSeat);
    const al=a.terminal?(a.candidateNativeWin?1:0):null;
    const bl=b.terminal?(b.candidateNativeWin?1:0):null;
    const firstRootDifference=(()=>{
      const len=Math.max(a.roots.length,b.roots.length);
      const shape=x=>x?[x.playerSlot,x.action,x.attack??null,
        x.card??null,x.turnBefore]:null;
      for(let i=0;i<len;i++)if(JSON.stringify(shape(a.roots[i]??null))!==
        JSON.stringify(shape(b.roots[i]??null)))return i;
      return null;
    })();
    return {key,rank:g.rank,slot:g.candidateSlot,seed:g.seed,
      fullPhysicalAndStarterMatched:matched,
      bothTerminal:a.terminal&&b.terminal,
      nativeWinDifference:matched&&a.terminal&&b.terminal?bl-al:null,
      possibleNativeWinDifference:matched?
        {lower:(bl??0)-(al??1),upper:(bl??1)-(al??0)}:
        {lower:null,upper:null},
      firstRootDifference,
      controlFirstDifferentRoot:firstRootDifference===null?null:
        a.roots[firstRootDifference]??null,
      treatmentFirstDifferentRoot:firstRootDifference===null?null:
        b.roots[firstRootDifference]??null,
      control:a,treatment:b,paperQualified:false};
  });
  const matched=groups.filter(g=>g.fullPhysicalAndStarterMatched);
  const sum=(rows,name)=>rows.reduce((n,r)=>n+(r[name]??0),0);
  const arm=id=>{
    const a=records.filter(r=>r.candidateId===id);
    return {attempts:a.length,nativeTerminal:a.filter(r=>r.terminal).length,
      nativeCandidateWins:a.filter(r=>r.candidateNativeWin).length,
      actionCaps:a.filter(r=>r.status==='ACTION_CAP').length,
      engineAborts:a.filter(r=>r.status==='NATIVE_ABORT').length,
      candidateRetreatRoots:sum(a,'candidatePaidRetreats'),
      sourceRetreatRoots:sum(a,'sourceRetreatRoots'),
      filch:sum(a,'candidateFilch'),
      nightWatch:sum(a,'candidateNightWatch'),
      maxGeist:sum(a,'candidateMaxGeist'),
      skylinerActorSelected:sum(a,'skylinerRootSelected')};
  };
  const summary={
    registeredProspectiveGroups:16,nativeAttempts:32,
    physicallyComparableGroups:matched.length,
    matchedBothTerminal:matched.filter(g=>g.bothTerminal).length,
    treatmentWinGains:matched.filter(g=>g.nativeWinDifference===1).length,
    treatmentWinLosses:matched.filter(g=>g.nativeWinDifference===-1).length,
    prospectiveSharpNativeWinCountDifference:{
      lower:matched.reduce((n,g)=>n+g.possibleNativeWinDifference.lower,0),
      upper:matched.reduce((n,g)=>n+g.possibleNativeWinDifference.upper,0)
    },
    baseline:arm('baseline-public'),
    treatment:arm('skyliner-public'),
    independentPaperQualifiedGames:0
  };
  return {groups,summary};
}

/** @param {{runner?:Function,profile?:Function}} deps Experimental seams. */
function run({runner=runDevelopment,profile=withPaperSemanticsProfileV1}={}){
  const registry=preflight();
  const prior=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  let wrapped;
  try{
    wrapped=profile(()=>{
      const output=[];
      for(const id of reg.arms){
        const trial=runner({...frozen.policyOptions,...SOURCE_POLICY,
          ...(id==='skyliner-public'?reg.treatmentOnlyFlags:{}),
          registeredCandidateDecks:Object.fromEntries(reg.arms.map(name=>
            [name,{label:name,cards:printed.cards}])),
          registeredTrials:reg.registeredTrials.filter(t=>t.candidateId===id),
          registeredFrameName:VERSION+':'+id,
          allowSingleCandidatePerGroup:true,
          allowAdditionalOriginalSourceRanks:true,
          nativeRootActionLimit:reg.nativeRootLimit,
          isolatePolicyRandomness:true,
          isolatePhysicalShuffleRandomnessAfterSetup:true
        });
        assert.equal(trial.attempted,16);
        assert.equal(trial.rows.length,16);
        output.push(...trial.rows);
      }
      const keyed=new Map(output.map(x=>[x.trial.id,x]));
      assert.equal(keyed.size,32);
      return reg.registeredTrials.map(t=>{
        const row=keyed.get(t.id);
        assert.ok(row,'Missing registered native result '+t.id);
        return row;
      });
    },PAPER_PROFILE);
  }finally{
    if(prior===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=prior;
  }
  const comparison=compare(wrapped.result.map(nativeReceipt));
  return {schema:VERSION,registry,registration:reg,
    pinnedTwinleaf:PINNED_TWINLEAF,
    codeRevision:process.env.GITHUB_SHA??null,
    paperProfileAudit:wrapped.audit,
    unchangedCandidatePrinted60:true,
    treatmentOnlyFlag:reg.treatmentOnlyFlags,
    summary:comparison.summary,comparison:comparison.groups,
    fullNativeRows:wrapped.result,competitiveAdmission:false};
}
if(require.main===module){
  const result=run();
  saveAtomic(OUTPUT,result);
  process.stdout.write('AGENT3_SKYLINER_PROSPECTIVE '+
    JSON.stringify({summary:result.summary,artifact:OUTPUT})+'\n');
  if(result.summary.physicallyComparableGroups!==16)process.exitCode=1;
}
module.exports={VERSION,PAPER_PROFILE,preflight,nativeReceipt,compare,run};
