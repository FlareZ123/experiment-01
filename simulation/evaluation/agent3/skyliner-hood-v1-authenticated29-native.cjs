'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const reg=require('../../../results/aichi-2026/registrations/2026-11/agent3-skyliner-hood-v1-authenticated29-20261109.json');
const deck=require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const {SOURCE_POLICY}=require('./hood-consistency-v2-targeted-native.cjs');
const {nativeReceipt}=require('./skyliner-public-free-native-prospective.cjs');
const {saveAtomic}=require('./hood-v2-flexible-paid-retreat-native.cjs');
const {runDevelopment,validateRegisteredTrialGroups}=
  require('../agent41-bilateral-v2-development.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF,VERSION:PAPER_PROFILE}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const VERSION='agent3-skyliner-hood-v1-authenticated29-prospective-v1';
const OUTPUT=process.env.AGENT3_SKYLINER_HOOD_V1_ALL29_OUTPUT??
  path.join(ROOT,'artifacts/agent3-skyliner-hood-v1-all29-prospective.json');
const PROFILE_FLAGS=Object.freeze({
  celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true
});

/** @param {string} file Repository-relative. @returns {string} Git blob hash. */
function gitBlob(file){
  const buf=fs.readFileSync(path.join(ROOT,file));
  return createHash('sha1').update('blob '+buf.length+'\\0')
    .update(buf).digest('hex');
}

/** @returns {object} Fully frozen, candidate/source, and API compatibility. */
function preflight(){
  assert.equal(reg.schema,VERSION);
  assert.equal(reg.status,'FROZEN BEFORE FIRST NATIVE GAME');
  assert.equal(reg.pinnedTwinleaf,PINNED_TWINLEAF);
  assert.equal(reg.paperSemanticsProfile,PAPER_PROFILE);
  assert.equal(frozen.pinnedVendorRevision,PINNED_TWINLEAF);
  assert.equal(gitBlob(reg.candidateExactFile),reg.candidateExactGitBlobSha);
  assert.equal(gitBlob(reg.originalRoster),reg.originalRosterGitBlobSha);
  assert.equal(gitBlob(reg.frozenCommon),reg.frozenCommonGitBlobSha);
  for(const item of reg.policySourceHashes)
    assert.equal(gitBlob(item.path),item.sha,
      'Policy source drift: '+item.path);
  assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(reg.sourceRanks.length,29);
  assert.deepEqual(reg.missingExactSourceRanks,[23,25,28]);
  assert.equal(reg.registeredGroups,58);
  assert.equal(reg.registeredNativeAttempts,116);
  assert.equal(reg.registeredTrials.length,116);
  assert.equal(reg.registeredSourceGroups.length,58);
  assert.equal(new Set(reg.registeredSourceGroups.map(r=>r.seed)).size,58);
  assert.ok(reg.registeredSourceGroups.every(g=>g.sample==='PROSPECTIVE'));
  assert.equal(reg.rootActionCap,260);
  assert.deepEqual(reg.arms,['baseline-v1','skyliner-v1']);
  assert.deepEqual(reg.treatmentOnlyFlags,
    {actorSkylinerFundedBenchRetreatRoot:true});
  const roster=require('../../../results/aichi-2026/full-decklists.json');
  const ranks=require('../agent25-authenticated-source-admission.cjs')
    .authenticatedSourceRanks(roster,true);
  assert.deepEqual(reg.sourceRanks,ranks);
  for(const arm of reg.arms)
    validateRegisteredTrialGroups(reg.registeredTrials.filter(t=>
      t.candidateId===arm),ranks,false,true);
  for(const group of reg.registeredSourceGroups){
    const pair=reg.registeredTrials.filter(t=>
      t.rank===group.rank&&t.candidateSlot===group.candidateSlot&&
      t.repeat===group.repeat);
    assert.deepEqual(pair.map(t=>t.candidateId),reg.arms);
    assert.ok(pair.every(t=>t.seed===group.seed));
  }
  return {originalSourceRanks:ranks,completePairs:58,attempts:116};
}

/** @param {object[]} receipts One observed row per preregistered game. */
function compare(receipts){
  assert.equal(receipts.length,116);
  const byId=new Map(receipts.map(r=>[r.id,r]));
  assert.equal(byId.size,116);
  const pairs=reg.registeredSourceGroups.map(g=>{
    const key=[g.rank,g.repeat,g.candidateSlot].join(':');
    const a=byId.get(key+':baseline-v1');
    const b=byId.get(key+':skyliner-v1');
    assert.ok(a&&b,'Missing original rank group '+key);
    const matched=Boolean(a.fullPhysicalDealFingerprint&&
      a.fullPhysicalDealFingerprint===b.fullPhysicalDealFingerprint&&
      a.sourceDealFingerprint&&
      a.sourceDealFingerprint===b.sourceDealFingerprint&&
      a.actualStarterSeat!==null&&
      a.actualStarterSeat===b.actualStarterSeat);
    const al=a.terminal?Number(a.candidateNativeWin):null;
    const bl=b.terminal?Number(b.candidateNativeWin):null;
    return {rank:g.rank,slot:g.candidateSlot,repeat:g.repeat,seed:g.seed,
      key,physicalMatched:matched,
      bothTerminal:matched&&a.terminal&&b.terminal,
      witnessedWinDifference:matched&&a.terminal&&b.terminal?bl-al:null,
      sharpBounds:matched?{
        lower:(bl??0)-(al??1),
        upper:(bl??1)-(al??0)
      }:{lower:null,upper:null},
      control:a,treatment:b,independentPaperQualified:false};
  });
  const matched=pairs.filter(p=>p.physicalMatched);
  const arm=name=>{
    const rows=receipts.filter(r=>r.candidateId===name);
    const sum=k=>rows.reduce((n,r)=>n+(r[k]??0),0);
    return {attempts:rows.length,nativeTerminals:rows.filter(r=>r.terminal).length,
      candidateNativeWins:rows.filter(r=>r.candidateNativeWin).length,
      actionCaps:rows.filter(r=>r.status==='ACTION_CAP').length,
      engineAborts:rows.filter(r=>r.status==='NATIVE_ABORT').length,
      candidateRetreatRoots:sum('candidatePaidRetreats'),
      sourceRetreatRoots:sum('sourceRetreatRoots'),
      skylinerPolicySelectedRoots:sum('skylinerRootSelected'),
      candidateFilchDeclarations:sum('candidateFilch'),
      candidateNightWatchDeclarations:sum('candidateNightWatch'),
      candidateMaxGeistDeclarations:sum('candidateMaxGeist')};
  };
  const perRank=reg.sourceRanks.map(rank=>{
    const rows=pairs.filter(p=>p.rank===rank);
    return {rank,pairedSeats:rows.map(p=>p.slot),
      physicalMatched:rows.filter(p=>p.physicalMatched).length,
      bothTerminal:rows.filter(p=>p.bothTerminal).length,
      observedTreatmentNativeWinGains:rows.filter(p=>
        p.witnessedWinDifference===1).length,
      observedTreatmentNativeWinLosses:rows.filter(p=>
        p.witnessedWinDifference===-1).length,
      controlNativeTerminals:rows.filter(p=>p.control.terminal).length,
      treatmentNativeTerminals:rows.filter(p=>p.treatment.terminal).length,
      controlCandidateNativeWins:rows.filter(p=>
        p.control.candidateNativeWin).length,
      treatmentCandidateNativeWins:rows.filter(p=>
        p.treatment.candidateNativeWin).length,
      observedActorSkylinerSelected:rows.reduce((n,p)=>
        n+(p.treatment.skylinerRootSelected??0),0),
      sharpBounds:{
        lower:rows.filter(p=>p.physicalMatched)
          .reduce((n,p)=>n+p.sharpBounds.lower,0),
        upper:rows.filter(p=>p.physicalMatched)
          .reduce((n,p)=>n+p.sharpBounds.upper,0)
      }};
  });
  const summary={registeredPairs:58,attemptedNativeGames:116,
    originalRanks:29,missingSourceDecks:[23,25,28],
    physicalPairsMatched:matched.length,
    bothTerminalMatched:matched.filter(p=>p.bothTerminal).length,
    observedNativeWinGains:matched.filter(p=>
      p.witnessedWinDifference===1).length,
    observedNativeWinLosses:matched.filter(p=>
      p.witnessedWinDifference===-1).length,
    sharpCensoredNativeWinDifference:{
      lower:matched.reduce((n,p)=>n+p.sharpBounds.lower,0),
      upper:matched.reduce((n,p)=>n+p.sharpBounds.upper,0)
    },
    control:arm(reg.arms[0]),treatment:arm(reg.arms[1]),
    independentlyPaperQualifiedGames:0,
    claim99Point5:false};
  return {summary,perRank,pairs};
}

/** @param {{runner?:Function,profile?:Function}} [deps] Test seams. */
function run({runner=runDevelopment,profile=withPaperSemanticsProfileV1}={}){
  const admission=preflight();
  const prev=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  let wrapped;
  try{
    wrapped=profile(()=>{
      const all=[];
      for(const id of reg.arms){
        const result=runner({...frozen.policyOptions,...SOURCE_POLICY,
          ...(id===reg.arms[1]?reg.treatmentOnlyFlags:{}),
          registeredCandidateDecks:Object.fromEntries(reg.arms.map(name=>
            [name,{label:name,cards:deck.cards}])),
          registeredTrials:reg.registeredTrials.filter(t=>t.candidateId===id),
          registeredFrameName:VERSION+':'+id,
          allowSingleCandidatePerGroup:true,
          allowAdditionalOriginalSourceRanks:true,
          nativeRootActionLimit:reg.rootActionCap,
          isolatePolicyRandomness:true,
          isolatePhysicalShuffleRandomnessAfterSetup:true
        });
        assert.equal(result.attempted,58);
        assert.equal(result.rows.length,58);
        all.push(...result.rows);
      }
      const map=new Map(all.map(x=>[x.trial.id,x]));
      assert.equal(map.size,116);
      return reg.registeredTrials.map(t=>{
        const row=map.get(t.id);
        assert.ok(row,'Missing preregistered game '+t.id);
        return row;
      });
    },PROFILE_FLAGS);
  }finally{
    if(prev===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=prev;
  }
  const analysis=compare(wrapped.result.map(nativeReceipt));
  return {schema:VERSION,admission,registration:reg,
    engineRevision:PINNED_TWINLEAF,
    researchRevision:process.env.GITHUB_SHA??null,
    paperSemanticsAudit:wrapped.audit,
    exactCandidatePrintedSixtyUnchanged:true,
    controlSameActorFlags:SOURCE_POLICY,
    treatmentOnlyFlag:reg.treatmentOnlyFlags,
    summary:analysis.summary,perRank:analysis.perRank,pairs:analysis.pairs,
    fullNativeRows:wrapped.result,paperQualifiedGames:0};
}

if(require.main===module){
  const result=run();
  saveAtomic(OUTPUT,result);
  process.stdout.write('AGENT3_SKYLINER_HOOD_V1_ALL29 '+
    JSON.stringify({summary:result.summary,artifact:OUTPUT})+'\\n');
  if(result.summary.physicalPairsMatched!==58)process.exitCode=1;
}
module.exports={VERSION,preflight,compare,run};
