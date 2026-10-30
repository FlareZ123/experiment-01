'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

/**
 * Pre-registered source rank6/rank11 bilateral after-Pass Plumeria study.
 * Output always retains the original trial denominator, errors, caps and
 * both real physical starting positions. No observed game is competitive.
 * @param {object} base Prior-frame control with original canonical decisions.
 * @param {object} treated Prior-frame identical-seed Plumeria actor branch.
 * @returns {object} Matched native Store observability rather than win rate.
 */
function censusPlumeria32(base,treated){
  assert.equal(base.schema,'agent38-postframe-plumeria-32-precommitted-contrast-v1');
  assert.equal(treated.schema,base.schema);
  assert.equal(base.intervention,'unchanged-canonical-control');
  assert.equal(treated.intervention,'plumeria-actor-after-pass');
  assert.equal(base.registrationPath,treated.registrationPath);
  assert.equal(base.registrationBlob,treated.registrationBlob);
  assert.equal(base.precommittedBeforeIntervention,true);
  assert.equal(treated.precommittedBeforeIntervention,true);
  assert.equal(base.registeredAttempts,32);
  assert.equal(treated.registeredAttempts,32);
  assert.equal(base.competitiveQualifiedGames,0);
  assert.equal(treated.competitiveQualifiedGames,0);
  assert.equal(base.result.rows.length,32);
  assert.equal(treated.result.rows.length,32);
  assert.equal(base.result.actorPlumeriaAfterPassOptIn,false);
  assert.equal(treated.result.actorPlumeriaAfterPassOptIn,true);

  const totals={
    attempted:32,actualFullPhysicalMatches:0,
    physicalMismatches:0,unverifiablePhysicalStarts:0,
    controlledNativeSuccess:0,treatmentNativeSuccess:0,
    controlledCaps:0,treatmentCaps:0,
    controlledEngineTerminals:0,treatmentEngineTerminals:0,
    treatedWithAudit:0,treatedWithoutAudit:0,
    plumeriaProposed:0,plumeriaAccepted:0,plumeriaSettled:0,
    promptedByGeneric:0,actorPromptChoices:0,
    rootHashDifferent:0,nativePromptHashDifferent:0,
    sameRootButDifferentPrompt:0
  };
  const pairs=[];
  for(let i=0;i<32;i++){
    const x=base.result.rows[i],y=treated.result.rows[i];
    assert.equal(x.trial.id,y.trial.id);
    assert.equal(x.trial.seed,y.trial.seed);
    assert.equal(x.trial.rank,y.trial.rank);
    assert.equal(x.trial.candidateSlot,y.trial.candidateSlot);
    assert.equal(x.trial.candidateId,y.trial.candidateId);
    assert.equal(x.qualifiesForCompetitiveInference,false);
    assert.equal(y.qualifiesForCompetitiveInference,false);
    const hasFullHashes=Boolean(x.fullPhysicalDealFingerprint&&
      y.fullPhysicalDealFingerprint&&x.sourceDealFingerprint&&
      y.sourceDealFingerprint&&
      Number.isInteger(x.actualStarterSeat)&&
      Number.isInteger(y.actualStarterSeat));
    const physicalMatch=hasFullHashes&&
      x.fullPhysicalDealFingerprint===y.fullPhysicalDealFingerprint&&
      x.sourceDealFingerprint===y.sourceDealFingerprint&&
      x.actualStarterSeat===y.actualStarterSeat;
    if(!hasFullHashes)totals.unverifiablePhysicalStarts++;
    else if(physicalMatch)totals.actualFullPhysicalMatches++;
    else totals.physicalMismatches++;
    const audit=y.actorOnlyDecisionCoverage?.ownerPlumeriaAfterPassAudit;
    if(audit){
      assert.equal(audit.anyGameCompetitivelyQualified,false);
      assert.equal(audit.policyStrategicallyValidated,false);
      totals.treatedWithAudit++;
      totals.plumeriaProposed+=audit.proposedPlumeria;
      totals.plumeriaAccepted+=audit.acceptedPlumeria;
      totals.plumeriaSettled+=audit.settledEnergyDiscards;
      totals.promptedByGeneric+=audit.genericPromptFallbacks;
      totals.actorPromptChoices+=audit.acceptedPrompts;
    }else totals.treatedWithoutAudit++;
    const oldNative=x.status===undefined,newNative=y.status===undefined;
    totals.controlledNativeSuccess+=Number(oldNative);
    totals.treatmentNativeSuccess+=Number(newNative);
    totals.controlledCaps+=Number(oldNative&&x.finished!==true);
    totals.treatmentCaps+=Number(newNative&&y.finished!==true);
    totals.controlledEngineTerminals+=Number(oldNative&&x.finished===true);
    totals.treatmentEngineTerminals+=Number(newNative&&y.finished===true);
    const rootDifferent=Boolean(x.rootActionLedgerSha256&&
      y.rootActionLedgerSha256&&
      x.rootActionLedgerSha256!==y.rootActionLedgerSha256);
    const promptDifferent=Boolean(x.nativePromptChoices?.sha256&&
      y.nativePromptChoices?.sha256&&
      x.nativePromptChoices.sha256!==y.nativePromptChoices.sha256);
    totals.rootHashDifferent+=Number(rootDifferent);
    totals.nativePromptHashDifferent+=Number(promptDifferent);
    totals.sameRootButDifferentPrompt+=Number(promptDifferent&&!rootDifferent);
    pairs.push({
      trial:x.trial.id,rank:x.trial.rank,
      candidateId:x.trial.candidateId,candidateSlot:x.trial.candidateSlot,
      seed:x.trial.seed,
      physicalMatch,fullPhysicalStartsVerified:hasFullHashes,
      actualSourceFirstControl:x.sourceActuallyFirst??null,
      actualSourceFirstIntervention:y.sourceActuallyFirst??null,
      controlStatus:x.status??x.endReason??null,
      treatedStatus:y.status??y.endReason??null,
      accepted: audit?.acceptedPlumeria??null,
      settled: audit?.settledEnergyDiscards??null,
      genericPromptFallbacks:audit?.genericPromptFallbacks??null,
      rootDifferent,promptDifferent,
      oldRootSha:x.rootActionLedgerSha256??null,
      newRootSha:y.rootActionLedgerSha256??null,
      oldPromptSha:x.nativePromptChoices?.sha256??null,
      newPromptSha:y.nativePromptChoices?.sha256??null,
      controlSourceAttacks:x.attackDeclarations?.source??null,
      treatedSourceAttacks:y.attackDeclarations?.source??null,
      controlCandidateAttacks:x.attackDeclarations?.candidate??null,
      treatedCandidateAttacks:y.attackDeclarations?.candidate??null,
      controlWinner:x.winner??null,treatedWinner:y.winner??null,
      gameQualified:false
    });
  }
  return {schema:'agent38-plumeria-32-prior-frozen-frame-native-pair-census-v1',
    registrationBlob:base.registrationBlob,
    totals,
    affectedPairs:pairs.filter(p=>p.accepted>0||p.rootDifferent||
      p.promptDifferent),
    pairs,competitiveQualifiedGames:0,
    sourceFieldRanks:[6,11],
    limits:'Earlier registered random frame but only two ranks and two provisional candidate lists, paper clock and strong policy missing. No win rate estimate.'};
}

if(require.main===module){
  assert.equal(process.argv.length,4);
  const base=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const treated=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
  process.stdout.write(JSON.stringify(censusPlumeria32(base,treated),null,2)+'\n');
}
module.exports={censusPlumeria32};
