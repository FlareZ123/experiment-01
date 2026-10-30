'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

/**
 * Matched original-60 Plumeria discard mode comparison. The single optional
 * intervention replaces only a >18-card native owner discard choice. Every
 * game remains a retrospective development trace with unqualified outcomes.
 * @param {object} baseline Original after-Pass policy with large hand OFF.
 * @param {object} candidate Same policy with large hand ON.
 * @returns {object} Physical-deal matched, failure-inclusive audit.
 */
function compareLargeHandPlumeria(baseline,candidate){
  assert.equal(baseline.attempted,4);
  assert.equal(candidate.attempted,4);
  assert.equal(baseline.rows.length,4);
  assert.equal(candidate.rows.length,4);
  assert.equal(baseline.competitiveQualifiedGames,0);
  assert.equal(candidate.competitiveQualifiedGames,0);
  assert.equal(baseline.actorPlumeriaAfterPassOptIn,true);
  assert.equal(candidate.actorPlumeriaAfterPassOptIn,true);
  let matched=0,exposed=0,selected=0,distinctPromptLedgers=0;
  let sameRootWithChangedPrompt=0;
  const pairs=baseline.rows.map((before,i)=>{
    const after=candidate.rows[i];
    assert.equal(before.trial.id,after.trial.id);
    assert.equal(before.trial.seed,after.trial.seed);
    assert.equal(before.trial.candidateSlot,after.trial.candidateSlot);
    assert.equal(before.qualifiesForCompetitiveInference,false);
    assert.equal(after.qualifiesForCompetitiveInference,false);
    const sameFullPhysicalStart=
      Boolean(before.fullPhysicalDealFingerprint&&
        before.fullPhysicalDealFingerprint===after.fullPhysicalDealFingerprint&&
        before.sourceDealFingerprint===after.sourceDealFingerprint&&
        before.actualStarterSeat===after.actualStarterSeat);
    if(sameFullPhysicalStart)matched++;
    const oldAudit=before.actorOnlyDecisionCoverage?.
      ownerPlumeriaAfterPassAudit??null;
    const newAudit=after.actorOnlyDecisionCoverage?.
      ownerPlumeriaAfterPassAudit??null;
    const oldPrompt=before.nativePromptChoices?.sha256??null;
    const newPrompt=after.nativePromptChoices?.sha256??null;
    const promptChanged=oldPrompt!==null&&newPrompt!==null&&
      oldPrompt!==newPrompt;
    const rootsEqual=before.rootActionLedgerSha256!==undefined&&
      before.rootActionLedgerSha256===after.rootActionLedgerSha256;
    if(promptChanged){
      distinctPromptLedgers++;
      if(rootsEqual)sameRootWithChangedPrompt++;
    }
    if(oldAudit&&newAudit){
      assert.equal(oldAudit.largeHandOptIn,false);
      assert.equal(newAudit.largeHandOptIn,true);
      exposed++;
      selected+=newAudit.largeHandNativeSelections;
    }
    return {
      id:before.trial.id,rank:before.trial.rank,
      candidateSlot:before.trial.candidateSlot,
      sameFullPhysicalStart,
      oldStatus:before.status??before.endReason??null,
      newStatus:after.status??after.endReason??null,
      oldPlumeriaAccepted:oldAudit?.acceptedPlumeria??null,
      newPlumeriaAccepted:newAudit?.acceptedPlumeria??null,
      oldPlumeriaSettled:oldAudit?.settledEnergyDiscards??null,
      newPlumeriaSettled:newAudit?.settledEnergyDiscards??null,
      oldGenericPromptFallbacks:oldAudit?.genericPromptFallbacks??null,
      newGenericPromptFallbacks:newAudit?.genericPromptFallbacks??null,
      newLargeHandNativeSelections:newAudit?.largeHandNativeSelections??null,
      newSelectedPrintings:newAudit?.log?.filter(
        item=>item.kind==='plumeria-large-hand-native-choice')??null,
      oldRootLedger:before.rootActionLedgerSha256??null,
      newRootLedger:after.rootActionLedgerSha256??null,
      rootChanged:before.rootActionLedgerSha256!==after.rootActionLedgerSha256,
      oldPromptLedger:oldPrompt,newPromptLedger:newPrompt,
      promptChanged,
      sameRootWithChangedPrompt:Boolean(rootsEqual&&promptChanged),
      combinedObservedDecisionChange:Boolean(
        before.rootActionLedgerSha256!==after.rootActionLedgerSha256||
        promptChanged),
      oldCandidateAttacks:before.attackDeclarations?.candidate??null,
      newCandidateAttacks:after.attackDeclarations?.candidate??null,
      oldSourceAttacks:before.attackDeclarations?.source??null,
      newSourceAttacks:after.attackDeclarations?.source??null,
      oldWinner:before.winner??null,newWinner:after.winner??null,
      competitiveGameQualified:false
    };
  });
  return {schema:'agent38-large-hand-vs-generic-plumeria-4arm-v1',
    registeredAttempts:4,matchedFullPhysicalStarts:matched,
    auditedPairs:exposed,largeHandNativeSelections:selected,
    distinctPromptLedgers,sameRootWithChangedPrompt,
    pairs,competitiveQualifiedGames:0,
    conclusionScope:'Root ledger excludes actual prompt payload; preserve both native prompt and root ledgers. Retrospective policy divergence gives no competitive strength or win rate inference'};
}

if(require.main===module){
  assert.equal(process.argv.length,4);
  const off=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const on=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
  process.stdout.write(JSON.stringify(compareLargeHandPlumeria(off,on),null,2)+'\n');
}
module.exports={compareLargeHandPlumeria};
