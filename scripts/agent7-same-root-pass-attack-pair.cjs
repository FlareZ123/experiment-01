'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const VERSION='agent7-native-bounded-pass-to-print-attack-pair-v1';

/**
 * Treat native Store action records as immutable public choices. Find the
 * earliest actual action divergence while preserving the complete original
 * setup and action-prefix provenance; no Game State or hidden hand is used.
 * @param {object[]} control
 * @param {object[]} treatment
 * @returns {number}
 */
function firstActionDifference(control,treatment){
  for(let i=0;i<Math.min(control.length,treatment.length);i++){
    if(JSON.stringify(control[i])!==JSON.stringify(treatment[i]))return i;
  }
  return control.length===treatment.length?-1:
    Math.min(control.length,treatment.length);
}

/**
 * @param {object} control Frozen original Store first-return report.
 * @param {object} treatment Same source/deal with one-turn print attack choice.
 * @returns {object} Original Store causal development evidence, never a game win.
 */
function compareNativePassAttackPair(control,treatment){
  for(const report of [control,treatment]){
    assert.equal(report.attempted,4);
    assert.equal(report.rows?.length,4);
    assert.equal(report.competitiveQualifiedGames,0);
    assert.equal(report.winRateCertified,false);
    assert.equal(report.actorOnlyCompositionOptIn,true);
    assert.equal(report.sameRootProposalChoiceOptIn,true);
    assert.equal(report.sameRootPassAttackProbeGlobalTurn,4);
    assert.equal(report.sameRootProbeAllOptIn,false);
    assert.equal(report.nativeAcceptedTargetsOptIn,true);
    assert.equal(report.sameRootProposalAuditedArms,4);
  }
  assert.equal(control.sameRootChoiceApplyOptIn,false);
  assert.equal(control.sameRootChangedRoots,0);
  assert.equal(treatment.sameRootChoiceApplyOptIn,true);
  const rows=[];
  let changedArms=0,changedTurn4PassToAttack=0,sourceChanged=0;
  for(let i=0;i<4;i++){
    const a=control.rows[i],b=treatment.rows[i];
    assert.equal(a.trial.id,b.trial.id);
    assert.equal(a.sourceDeckFingerprint,b.sourceDeckFingerprint);
    assert.equal(a.candidateDeckFingerprint,b.candidateDeckFingerprint);
    assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint);
    assert.equal(a.fullPhysicalDealFingerprint,b.fullPhysicalDealFingerprint);
    assert.equal(a.actualStarterSeat,b.actualStarterSeat);
    assert.equal(a.verifiedFirstTurn,true);
    assert.equal(b.verifiedFirstTurn,true);
    assert.equal(a.qualifiesForCompetitiveInference,false);
    assert.equal(b.qualifiesForCompetitiveInference,false);
    assert.ok(Array.isArray(a.rootActionLedger));
    assert.ok(Array.isArray(b.rootActionLedger));
    const at=firstActionDifference(a.rootActionLedger,b.rootActionLedger);
    const oldEvent=at<0?null:a.rootActionLedger[at]??null;
    const newEvent=at<0?null:b.rootActionLedger[at]??null;
    if(at>=0){
      changedArms++;
      assert.ok(oldEvent&&newEvent,'First change must be an accepted Store action');
      assert.equal(oldEvent.turnBefore,4);
      assert.equal(newEvent.turnBefore,4);
      assert.equal(oldEvent.playerSlot,newEvent.playerSlot,
        'First divergence must be the same owning player');
      assert.equal(oldEvent.action,'PassTurnAction');
      assert.equal(newEvent.action,'AttackAction');
      assert.equal(typeof newEvent.attack,'string');
      assert.ok(newEvent.attack.length>0);
      changedTurn4PassToAttack++;
      if(newEvent.playerSlot===a.sourceSeat)sourceChanged++;
    }else assert.equal(a.rootActionLedgerSha256,b.rootActionLedgerSha256);
    const nextOpponentRoot=newEvent?
      b.rootActionLedger.slice(at+1).find(event=>
        event.playerSlot!==newEvent.playerSlot &&
        event.turnBefore>newEvent.turnBefore &&
        event.action!=='ResolvePromptAction')??null:null;
    const rootAudit=b.actorOnlyDecisionCoverage?.detailedComponentAudits
      ?.root?.sameRootProposalChoice;
    assert.ok(rootAudit&&rootAudit.ownerRoots>0);
    if(at>=0)assert.ok(rootAudit.changedRoots>0,
      'An accepted attack change must have a recorded owner choice');
    rows.push({id:a.trial.id,sourceSeat:a.sourceSeat,
      candidateSeat:a.candidateSeat,
      firstDivergenceIndex:at,
      prefixNativeActionsPreserved:at<0?a.rootActionLedger.length:at,
      firstOriginalAction:oldEvent,
      firstSelectedAction:newEvent,
      chosenRootChanges:rootAudit.changedRoots,
      opponentNextRoot:nextOpponentRoot,
      controlOutcome:{status:a.status??null,
        finished:a.finished,winner:a.winner,
        endReason:a.endReason,actions:a.actionCount},
      treatmentOutcome:{status:b.status??null,
        finished:b.finished,winner:b.winner,
        endReason:b.endReason,actions:b.actionCount},
      originalSourceDeck:a.sourceDeckFingerprint,
      originalPhysicalDeal:a.fullPhysicalDealFingerprint,
      controlRootSha:a.rootActionLedgerSha256,
      treatmentRootSha:b.rootActionLedgerSha256});
  }
  assert.ok(changedArms>=1,
    'No real Store Pass-to-Attack choice changed in predeclared four-arm trial');
  assert.ok(sourceChanged>=1,
    'No authentic source actor changed from Pass to printed attack');
  return {
    version:VERSION,pinnedTwinleaf:control.enginePin,
    nativeOriginalStoreArms:4,changedArms,sourceChanged,
    changedTurn4PassToAttack,
    physicalSetupAndFullDecksIdentical:true,
    sourceAndCandidateActionsSymmetricallyScored:true,
    rows,competitiveQualifiedGames:0,winRateCertified:false,
    caution:'A changed accepted Store root and next root are a development-only causal policy contrast. Opponent behavior and paper rules remain uncertified.'
  };
}

if(require.main===module){
  assert.equal(process.argv.length,4,
    'Usage: node scripts/agent7-same-root-pass-attack-pair.cjs CONTROL.json TREATMENT.json');
  const parse=path=>JSON.parse(fs.readFileSync(path,'utf8'));
  const result=compareNativePassAttackPair(
    parse(process.argv[2]),parse(process.argv[3]));
  process.stdout.write('BOUNDED_PASS_ATTACK_NATIVE_PAIR '+
    JSON.stringify(result)+'\n');
}

module.exports={VERSION,firstActionDifference,compareNativePassAttackPair};
