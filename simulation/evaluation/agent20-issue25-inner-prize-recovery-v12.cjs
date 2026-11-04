'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const VERSION='agent20-issue25-v12-innermost-owner-prize-development';
const SOURCE='simulation/evaluation/agent20-issue25-inner-prize-recovery-v12.cjs';
const BASELINE='results/aichi-2026/registrations/agent3-issue25-v6-readonly-opportunity-pressure-retro-20261104.json';
const ROOT=path.resolve(__dirname,'../..');
const sha256=value=>createHash('sha256').update(value).digest('hex');

/**
 * Add the existing owner-occupied Prize resolver at the ACTUAL native
 * runMatch boundary. This executes after canonical actor wrappers install
 * their decoders; the resolver is therefore innermost and sees the genuine
 * owner-facing pending prompt. Exactly one reversible module export is
 * patched and restored even when a native game aborts.
 *
 * @template T
 * @param {()=>T} execute Synchronous selected Issue25 native runner.
 * @param {{headless?:{runMatch:Function},ownerPrizeChoice?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withInnermostOwnerPrize(execute,deps={}){
  assert.equal(typeof execute,'function');
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const choice=deps.ownerPrizeChoice??
    require('../twinleaf/agent21-owner-first-prize-reveal.cjs')
      .withOwnerFirstPrizeReveal;
  assert.equal(typeof choice,'function');
  const prior=headless.runMatch;
  assert.equal(typeof prior,'function');
  const evidence=[];
  const wrapper=function runMatchWithInnerOwnerPrize(request){
    assert.ok(request&&typeof request==='object');
    try{
      const observed=choice(()=>prior(request));
      const roots=observed?.result?.rootActionLedger;
      evidence.push({
        nativeMatchLabel:request.label??null,
        status:'returned-native-unqualified',
        ownerPrizeAudit:observed.audit??null,
        actualStoreAcceptedPrizePromptRoots:Array.isArray(roots)?
          roots.filter(root=>root.action==='ResolvePromptAction'&&
            root.pendingPrompt==='ChoosePrizePrompt').length:null,
        unqualified:true
      });
      return observed.result;
    }catch(error){
      evidence.push({
        nativeMatchLabel:request.label??null,
        status:'native-aborted-unqualified',
        ownerPrizeAudit:error?.agent21OwnerPrizeAudit??null,
        actualStoreAcceptedPrizePromptRoots:null,
        unqualified:true
      });
      throw error;
    }
  };
  headless.runMatch=wrapper;
  try{
    return {result:execute(),audit:{
      version:VERSION,
      patchRestoredOnExit:true,
      actualNativeAttempts:evidence.length,
      nativePrizePrompts:evidence,
      ownerPrivateCardFacesCaptured:false,
      sourceStrategyChanged:false,
      competitiveGamesQualified:0
    }};
  }finally{
    assert.strictEqual(headless.runMatch,wrapper,
      'A competing wrapper altered the patched runMatch export');
    headless.runMatch=prior;
  }
}

/** @param {object} row @returns {string|null} */
function nativeTrialId(row){return row?.trial?.id??row?.id??null;}

/**
 * Execute eight historical source-deal-identified mirrors with the v6
 * policy unchanged except the nested owner-safe Prize prompt responder.
 * Each row remains a development-only native attempt; any failure stays
 * in its registered denominator. No original source policy is promoted.
 *
 * @param {{runner?:Function,headless?:object,ownerPrizeChoice?:Function}} [deps]
 * @returns {object}
 */
function runIssue25InnerPrizeV12(deps={}){
  const runner=deps.runner??require('./agent1-issue25-mirrored-r6-r11-v6.cjs')
    .runMirroredIssue25V6;
  const observed=withInnermostOwnerPrize(runner,{
    headless:deps.headless,ownerPrizeChoice:deps.ownerPrizeChoice
  });
  const selected=observed.result;
  assert.ok(Array.isArray(selected?.diagnostic?.attemptedRows));
  const baseline=JSON.parse(fs.readFileSync(path.join(ROOT,BASELINE),'utf8'));
  const archived=baseline.baselineRecordedRows;
  assert.equal(archived.length,8);
  const attempted=selected.diagnostic.attemptedRows;
  const raw=selected.rawDevelopment?.rows??[];
  const sourceParity=archived.map(expected=>{
    const row=attempted.find(value=>value.id===expected.id);
    const native=raw.find(value=>nativeTrialId(value)===expected.id);
    const roots=native?.rootActionLedger??
      native?.nativeAbortEvidence?.rootActionLedger??null;
    const rootBefore25=Array.isArray(roots)&&roots.length>=25?
      sha256(JSON.stringify(roots.slice(0,25))):null;
    return {
      id:expected.id,
      returnedExactlyOnce:attempted.filter(x=>x.id===expected.id).length===1,
      originalSourceSeat:row?.originalSourceSeat??
        row?.nativeAbortProvenance?.sourceSeat??null,
      physicalSourceMatched:row?.sourceDealFingerprint===
        expected.sourceDealFingerprint,
      fullPhysicalDealMatched:row?.fullPhysicalDealFingerprint===
        expected.fullPhysicalDealFingerprint,
      controlStatus:expected.status,
      treatmentStatus:row?.status??null,
      controlAcceptedRootCount:expected.nativeRootCount,
      treatmentAcceptedRootCount:row?.nativeRootActionCount??null,
      root25ControlPrefixSha256:expected.id==='11:102:A:champion-reference'?
        expected.publicRootLedgerSha256:null,
      root25TreatmentPrefixSha256:expected.id==='11:102:A:champion-reference'?
        rootBefore25:null,
      root25PrefixMatched:expected.id==='11:102:A:champion-reference'?
        (rootBefore25===expected.publicRootLedgerSha256):null,
      candidateAcceptedPrizePromptRoots:Array.isArray(roots)?
        roots.filter(x=>x.action==='ResolvePromptAction'&&
          x.pendingPrompt==='ChoosePrizePrompt'&&x.playerSlot===0).length:null,
      candidateEonBladeRoot23:roots?.[23]?.action==='AttackAction'&&
        roots[23]?.attack==='Eon Blade'
    };
  });
  return {
    schema:VERSION,
    sourceBranch:'research/agent20-issue25-inner-prize-recovery-20261104',
    deliberateOnlyPolicyChange:'owner-first-occupied-ordinary-ko-prizes-in-native-innermost-decoder',
    baselineV6Artifact:13353289881,
    baselineV6JsonSha256:baseline.baselineJsonSha256,
    originalRegistration:baseline.baselineTrialRegistration,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    originalEntrypoint:SOURCE,
    sourceHash:sha256(fs.readFileSync(path.join(ROOT,SOURCE))),
    ownerPrizeModuleHash:sha256(fs.readFileSync(path.join(ROOT,
      'simulation/twinleaf/agent21-owner-first-prize-reveal.cjs'))),
    manifest:selected.manifest,
    actualAttempts:attempted,
    originalRawOutcomeCount:raw.length,
    comparedById:sourceParity,
    sameFullDealCount:sourceParity.filter(row=>row.fullPhysicalDealMatched).length,
    sameSourceDealCount:sourceParity.filter(row=>row.physicalSourceMatched).length,
    root25PrefixReproduced:sourceParity.find(
      row=>row.id==='11:102:A:champion-reference')?.root25PrefixMatched??null,
    innerPrizeNativeAudit:observed.audit,
    nativeErrors:attempted.filter(row=>row.status==='engine-error').length,
    nativeFinished:attempted.filter(row=>row.finished===true).length,
    claimedQualifiedGames:0,
    verdict:'UNQUALIFIED-native-development-only'
  };
}

module.exports={VERSION,withInnermostOwnerPrize,runIssue25InnerPrizeV12};
