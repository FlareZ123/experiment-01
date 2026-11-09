'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {manifestWithDriftAudit} =
  require('../agent4-v3-two-unknown-power-readout.cjs');
const {withSameRuntime,effectiveOptions} =
  require('../agent4-selected-v3-paper-funded-release.cjs');
const {runDevelopment} =
  require('../agent41-bilateral-v2-development.cjs');
const {withProtectedHoodUnderworld,VERSION:EXCEPTION} =
  require('../../twinleaf/2026-11/agent4-hood-protected-underworld-owner-exception.cjs');
const {writeAtomicLocked} =
  require('../agent20-frozen-rank6-canary-v1.cjs');
const REG = require('../../../results/aichi-2026/registrations/agent4-hood-shield-rank6-prospective-owner-exception-20261109.json');
const HOOD = require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');

const VERSION = 'agent4-hood-shield-original-rank6-32-native-owner-exception-v1';
const sha256 = value => createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/** @param {object} result Full native Store result. @returns {object} */
function rowSummary(result) {
  const roots = Array.isArray(result.rootActionLedger)
    ? result.rootActionLedger : [];
  const underworld = roots.filter(root =>
    root.action === 'UseAbilityAction' &&
    JSON.stringify(root).includes('Underworld Door'));
  return {
    trialId:result.trial?.id ?? null,
    nativeStatus:result.status ?? null,
    naturalTerminal:result.finished === true,
    endReason:result.endReason ?? null,
    acceptedNativeRootCount:roots.length,
    rootLedgerSha256:result.rootActionLedgerSha256 ?? null,
    samePhysicalStartNeeded:true,
    fullPhysicalStart:result.fullPhysicalDealFingerprint ?? null,
    originalSourcePhysicalStart:result.sourceDealFingerprint ?? null,
    finalPrizes:result.finalPrizes ?? null,
    actualUnderworldAcceptedRootCount:underworld.length,
    acceptedUnderworldRoots:underworld.slice(0,8),
    anyNativeError:result.status === 'engine-error',
    paperQualified:false
  };
}

/**
 * Paired owner-policy causal replay, one unchanged genuine 60-card Hood Shield
 * against the exact original Aichi rank-6 Iron Thorns 60, sixteen
 * prospectively registered physical deals, both physical candidate seats.
 * This experiment measures real bot-policy activation, not paper win rate.
 *
 * @param {{runner?:Function,runtime?:Function,guard?:Function,
 *   manifest?:Function}} [deps]
 * @returns {object}
 */
function run(deps={}) {
  const registration = REG;
  assert.equal(registration.schema,
    'agent4-hood-vs-rank6-prospective-owner-exception-v1');
  assert.equal(registration.enginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(registration.trialRows.length,16);
  assert.equal(new Set(registration.independentSeedDraws).size,8);
  assert.equal(HOOD.cards.reduce((sum,card)=>sum+card.count,0),60);
  const checked=(deps.manifest??manifestWithDriftAudit)();
  const manifest=checked.manifest;
  const mode=manifest.modes.find(x=>x.id==='selected-v3-paper-plus-funded-mobility');
  assert.ok(mode);
  assert.equal(manifest.nativeActionCap,registration.nativeRootCap);
  const options = {
    ...effectiveOptions(manifest,mode),
    registeredFrameName:VERSION,
    registeredTrials:registration.trialRows,
    registeredCandidateDecks:{'hood-shield-v1':HOOD},
    allowSingleCandidatePerGroup:true,
    allowAdditionalOriginalSourceRanks:true
  };
  const native = deps.runner??runDevelopment;
  const runtime = deps.runtime??withSameRuntime;
  const guard = deps.guard??withProtectedHoodUnderworld;
  const baseline = runtime(()=>native(options));
  const treated = runtime(()=>guard(()=>native(options)));
  assert.equal(baseline.attempted,16);
  assert.equal(treated.result.attempted,16);

  const control=baseline.rows.map(rowSummary);
  const intervention=treated.result.rows.map(rowSummary);
  const pairs=control.map((a,i)=>{
    const b=intervention[i];
    const trial=registration.trialRows[i];
    assert.equal(a.trialId,trial.id);
    assert.equal(b.trialId,trial.id);
    const rootsA=baseline.rows[i].rootActionLedger??[];
    const rootsB=treated.result.rows[i].rootActionLedger??[];
    const projection=r=>({
      action:r.action,card:r.card,attack:r.attack,
      ability:r.ability,power:r.power,playerSlot:r.playerSlot
    });
    let firstDifference=null;
    for(let j=0;j<Math.max(rootsA.length,rootsB.length);j++){
      const left=rootsA[j]?projection(rootsA[j]):null;
      const right=rootsB[j]?projection(rootsB[j]):null;
      if(JSON.stringify(left)!==JSON.stringify(right)){
        firstDifference={
          ordinal:j,left:left??null,right:right??null
        };
        break;
      }
    }
    return {
      id:trial.id,seed:trial.seed,candidateSlot:trial.candidateSlot,
      sameSourcePhysicalDeal:
        a.originalSourcePhysicalStart!==null &&
        JSON.stringify(a.originalSourcePhysicalStart)===
          JSON.stringify(b.originalSourcePhysicalStart),
      sameFullPhysicalDeal:
        a.fullPhysicalStart!==null &&
        JSON.stringify(a.fullPhysicalStart)===
          JSON.stringify(b.fullPhysicalStart),
      baseline:a,protected:b,firstAcceptedRootDivergence:firstDifference
    };
  });
  const gates={
    thirtyTwoNativeAttempts:
      baseline.attempted===16&&treated.result.attempted===16,
    unchangedOriginalAndCandidateDeck:
      registration.candidateRosterGitBlob==='24ace2d6feb9ce5d9056bcf271827cfe31b7357b' &&
      treated.audit.originalSixtiesChanged===false,
    ownerOnlyProtectedChoice:
      treated.audit.privateOpponentRead===false &&
      treated.audit.schema===EXCEPTION,
    allRegisteredPhysicalStartsPresent:
      pairs.every(x=>x.baseline.fullPhysicalStart!==null &&
        x.protected.fullPhysicalStart!==null)
  };
  return {
    schema:VERSION,registration:registration.schema,
    pinnedTwinleaf:registration.enginePin,
    nativeGameAttempts:baseline.attempted+treated.result.attempted,
    candidateInventory:'results/aichi-2026/candidate-hood-shadow-rider.json',
    frozenCandidateId:'hood-shield-v1',sourceRank:6,
    sourceOriginalInventoryUnchanged:true,candidateSixtyUnchanged:true,
    registeredIndependentSeedCount:8,physicalDealGroups:16,
    nativeRootCap:registration.nativeRootCap,
    controlNativeTerminals:control.filter(x=>x.naturalTerminal).length,
    interventionNativeTerminals:intervention.filter(x=>x.naturalTerminal).length,
    controlNativeErrors:control.filter(x=>x.anyNativeError).length,
    interventionNativeErrors:intervention.filter(x=>x.anyNativeError).length,
    protectedUnderworldSelected:treated.audit.protectedSelected,
    ownerExceptionAudit:treated.audit,
    historicallyFrozenProfileDrift:checked.audit,
    gates,pairs,paperQualifiedGames:0,
    estimatedPaperFieldWinRate:null
  };
}

if(require.main===module){
  const output=process.env.AGENT4_HOOD_OWNER_FRESH_OUTPUT;
  assert.ok(output,'Specify locked atomic output artifact path');
  const result=run();
  const contents=JSON.stringify(result,null,2)+'\n';
  fs.mkdirSync(path.dirname(output),{recursive:true});
  writeAtomicLocked(output,contents);
  writeAtomicLocked(output+'.sha256',
    createHash('sha256').update(contents).digest('hex')+
    '  '+path.basename(output)+'\n');
  process.stdout.write('AGENT4_HOOD_RANK6_OWNER32 '+
    JSON.stringify({
      gates:result.gates,
      protectedSelected:result.protectedUnderworldSelected,
      controlTerminals:result.controlNativeTerminals,
      treatedTerminals:result.interventionNativeTerminals,
      controlErrors:result.controlNativeErrors,
      treatedErrors:result.interventionNativeErrors,
      sameFullStarts:result.pairs.filter(p=>p.sameFullPhysicalDeal).length,
      divergences:result.pairs.filter(p=>p.firstAcceptedRootDivergence!==null)
        .map(p=>({id:p.id,first:p.firstAcceptedRootDivergence})),
      paperQualifiedGames:0
    })+'\n');
  if(!Object.values(result.gates).every(Boolean))process.exitCode=1;
}

module.exports={VERSION,run,rowSummary};
