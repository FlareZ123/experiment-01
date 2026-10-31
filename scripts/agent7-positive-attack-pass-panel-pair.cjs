'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {firstActionDifference}=require('./agent7-same-root-pass-attack-pair.cjs');

const VERSION='agent7-preregistered-positive-print-attack-pass-original-store-pair-v1';

/**
 * Compare all preregistered physical deals, including native errors,
 * unchanged controls, censors, selected attacks and first opponent responses.
 * Control/selected candidate inventory is frozen on every matched seed.
 * No engine outcome is interpreted as a verified competitive win.
 *
 * @param {object} control Original Store first-return
 * @param {object} selected Same Store code with selected paid Attack > Pass
 * @returns {object}
 */
function comparePositiveAttackPanel(control,selected,options={}){
  const cohort=options.cohort??
    'agent7-registered-positive-print-attack-over-pass-rank6-v1';
  const flag=options.policyFlag??'sameRootPositiveAttackOverPassOptIn';
  const version=options.version??VERSION;
  for(const rep of [control,selected]){
    assert.equal(rep.attempted,16);
    assert.equal(rep.rows?.length,16);
    assert.equal(rep.competitiveQualifiedGames,0);
    assert.equal(rep.winRateCertified,false);
    assert.equal(rep.actorOnlyCompositionOptIn,true);
    assert.equal(rep.sameRootProposalChoiceOptIn,true);
    assert.equal(rep[flag],true);
    assert.equal(rep.sameRootPassAttackProbeGlobalTurn,null);
    assert.equal(rep.sameRootPublicNoBenchTerminalOptIn,false);
    assert.equal(rep.sameRootProbeAllOptIn,false);
    assert.equal(rep.nativeAcceptedTargetsOptIn,true);
  }
  assert.equal(control.preregisteredCohort,cohort);
  assert.equal(selected.preregisteredCohort,control.preregisteredCohort);
  assert.equal(selected.preregisteredAt,control.preregisteredAt);
  assert.equal(control.preregisteredMode,'control');
  assert.equal(selected.preregisteredMode,'selected');
  assert.equal(control.sameRootChoiceApplyOptIn,false);
  assert.equal(selected.sameRootChoiceApplyOptIn,true);
  assert.equal(control.sameRootChangedRoots,0);
  const stats={
    originalSeeds:8,attemptsPerMode:16,
    pairedWithPhysicalRootLedger:0,uncomparable:0,
    unchanged:0,changed:0,sourceFirstChanges:0,candidateFirstChanges:0,
    acceptedAttackFirstChanges:0,promptSettledFirstAttacks:0,
    changedSourceWins:0,changedCandidateWins:0,
    unchangedFinished:0,unchangedCensored:0,
    selectedFinished:0,selectedCensored:0,
    originalFinished:0,originalCensored:0
  };
  const details=[];
  const status=r=>r.status??(r.finished?'terminal':
    r.endReason==='action-limit'?'censored':'unclassified');
  for(let i=0;i<16;i++){
    const a=control.rows[i],b=selected.rows[i];
    assert.equal(a.trial.id,b.trial.id);
    assert.equal(a.trial.rank,6);
    assert.equal(a.trial.seed,b.trial.seed);
    assert.equal(a.trial.candidateSlot,b.trial.candidateSlot);
    assert.equal(a.trial.candidateId,b.trial.candidateId);
    const datum={
      id:a.trial.id,seed:a.trial.seed,
      sourceSeat:a.sourceSeat??null,candidateSeat:a.candidateSeat??null,
      actualStarterSeat:a.actualStarterSeat??null,
      originalStatus:status(a),selectedStatus:status(b),
      originalWinner:a.winner??null,selectedWinner:b.winner??null,
      originalFinished:a.finished??false,selectedFinished:b.finished??false,
      originalActionCount:a.actionCount??null,
      selectedActionCount:b.actionCount??null,
      originalEndReason:a.endReason??null,
      selectedEndReason:b.endReason??null
    };
    stats.originalFinished+=Number(a.finished===true);
    stats.selectedFinished+=Number(b.finished===true);
    stats.originalCensored+=Number(a.endReason==='action-limit');
    stats.selectedCensored+=Number(b.endReason==='action-limit');
    const ready=Array.isArray(a.rootActionLedger)&&
      Array.isArray(b.rootActionLedger)&&
      typeof a.fullPhysicalDealFingerprint==='string'&&
      typeof b.fullPhysicalDealFingerprint==='string';
    datum.pairedPhysicalLedger=ready;
    if(!ready){
      stats.uncomparable++;
      datum.reason='No authentic dual original Store physical ledger';
      details.push(datum);
      continue;
    }
    stats.pairedWithPhysicalRootLedger++;
    assert.equal(a.fullPhysicalDealFingerprint,b.fullPhysicalDealFingerprint);
    assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint);
    assert.equal(a.sourceDeckFingerprint,b.sourceDeckFingerprint);
    assert.equal(a.candidateDeckFingerprint,b.candidateDeckFingerprint);
    assert.equal(a.actualStarterSeat,b.actualStarterSeat);
    assert.equal(a.qualifiesForCompetitiveInference,false);
    assert.equal(b.qualifiesForCompetitiveInference,false);
    const k=firstActionDifference(a.rootActionLedger,b.rootActionLedger);
    datum.firstDivergenceIndex=k;
    if(k<0){
      stats.unchanged++;
      assert.equal(a.rootActionLedgerSha256,b.rootActionLedgerSha256);
      assert.equal(a.finished,b.finished);
      assert.equal(a.winner,b.winner);
      assert.equal(a.endReason,b.endReason);
      stats.unchangedFinished+=Number(a.finished===true);
      stats.unchangedCensored+=Number(a.endReason==='action-limit');
      details.push(datum);
      continue;
    }
    stats.changed++;
    const prev=a.rootActionLedger[k],next=b.rootActionLedger[k];
    assert.ok(prev&&next,
      'First genuine Store divergence must have a source and selected action');
    assert.equal(prev.action,'PassTurnAction');
    assert.equal(next.action,'AttackAction');
    assert.equal(prev.playerSlot,next.playerSlot);
    assert.equal(prev.turnBefore,next.turnBefore);
    assert.ok(typeof next.attack==='string'&&next.attack.length>0);
    const actorAudit=b.actorOnlyDecisionCoverage?.detailedComponentAudits
      ?.root?.sameRootProposalChoice;
    assert.ok(actorAudit?.changedRoots>0,
      'Accepted native action must have same-root owner selector receipt');
    if(next.playerSlot===b.sourceSeat)stats.sourceFirstChanges++;
    else stats.candidateFirstChanges++;
    stats.acceptedAttackFirstChanges++;
    const settlement=(next.playerSlot===b.sourceSeat?
      b.sourceAttackSettlement:b.candidateAttackSettlement)
      ?.attacks?.find(att=>att.attackName===next.attack &&
        att.turnBefore===next.turnBefore);
    const settled=settlement?.settledPromptChain===true;
    stats.promptSettledFirstAttacks+=Number(settled);
    const opponentSeat=1-next.playerSlot;
    const nextOpponent=b.rootActionLedger.slice(k+1).find(event=>
      event.playerSlot===opponentSeat &&
      event.turnBefore>next.turnBefore &&
      event.action!=='ResolvePromptAction')??null;
    stats.changedSourceWins+=Number(b.finished===true&&
      b.winner===b.sourceSeat);
    stats.changedCandidateWins+=Number(b.finished===true&&
      b.winner===b.candidateSeat);
    Object.assign(datum,{
      firstDivergenceActionIndex:k,originalFirstEvent:prev,
      selectedFirstEvent:next,firstSelectedAttackSettled:settled,
      firstSelectedAttackSettlement:settlement??null,
      subsequentOpponentFirstRoot:nextOpponent,
      selectedActorRootCount:actorAudit.ownerRoots,
      selectedActorChangedRootCount:actorAudit.changedRoots
    });
    details.push(datum);
  }
  assert.equal(stats.pairedWithPhysicalRootLedger+stats.uncomparable,16);
  assert.equal(stats.pairedWithPhysicalRootLedger,
    stats.changed+stats.unchanged);
  return {
    version,pinnedEngine:control.enginePin,
    preregisteredAt:control.preregisteredAt,
    preregisteredCohort:control.preregisteredCohort,
    controlChangedRootCount:control.sameRootChangedRoots,
    treatmentChangedRootCount:selected.sameRootChangedRoots,
    stats,details,
    competitiveQualifiedGames:0,winRateCertified:false,
    caveat:'All 8 registered seed clusters and 16 original 60 pairs are included; Store decisions and engine outcomes are uncalibrated development observations with incomplete paper rules and weak opponent policies.'
  };
}

if(require.main===module){
  assert.equal(process.argv.length,4,
    'Usage: node scripts/agent7-positive-attack-pass-panel-pair.cjs CONTROL.json SELECTED.json');
  const parse=path=>JSON.parse(fs.readFileSync(path,'utf8'));
  const result=comparePositiveAttackPanel(
    parse(process.argv[2]),parse(process.argv[3]));
  process.stdout.write('REGISTERED_NATIVE_PRINTED_ATTACK_PASS_PAIR '+
    JSON.stringify(result)+'\n');
}

module.exports={VERSION,comparePositiveAttackPanel};
