'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {firstActionDifference}=require('./agent7-same-root-pass-attack-pair.cjs');

const VERSION='agent7-preregistered-rank6-lone-active-KO-paired-census-v1';
const SOURCE_ERROR=new Set(['engine-error','engine-physical-invalid',
  'paper-supporter-quota-veto','setup-error']);

/**
 * The eight before-run CSPRNG seeds are fixed. Every attempt, censor and
 * native error stays in the denominator and in the output. Physical comparison
 * only applies when both arms actually have root ledgers and deal fingerprints.
 *
 * @param {object} control Frozen 16-arm original Store first-return report.
 * @param {object} selected Identical registration; public terminal preference.
 * @returns {object} Preregistered developer-only policy exposure census.
 */
function compareRegisteredRank6Panel(control,selected){
  for(const report of [control,selected]){
    assert.equal(report.attempted,16);
    assert.equal(report.rows?.length,16);
    assert.equal(report.competitiveQualifiedGames,0);
    assert.equal(report.winRateCertified,false);
    assert.equal(report.actorOnlyCompositionOptIn,true);
    assert.equal(report.sameRootProposalChoiceOptIn,true);
    assert.equal(report.sameRootPublicNoBenchTerminalOptIn,true);
    assert.equal(report.sameRootPassAttackProbeGlobalTurn,null);
    assert.equal(report.sameRootProbeAllOptIn,false);
    assert.equal(report.nativeAcceptedTargetsOptIn,true);
    assert.equal(report.preregisteredCohort,
      'agent7-registered-public-lone-active-ko-rank6-seed-panel-v1');
  }
  assert.equal(control.preregisteredMode,'control');
  assert.equal(selected.preregisteredMode,'selected');
  assert.equal(control.sameRootChoiceApplyOptIn,false);
  assert.equal(selected.sameRootChoiceApplyOptIn,true);
  assert.equal(control.preregisteredAt,selected.preregisteredAt);
  const summary={
    originalAttempts:16,pairedReady:0,uncomparable:0,
    unchanged:0,changed:0,sourceChanged:0,candidateChanged:0,
    nativeAttackChosen:0,settledAttacks:0,
    immediateLoneActiveKO:0,
    controlFinished:0,selectedFinished:0,
    controlCensored:0,selectedCensored:0,
    controlErrors:0,selectedErrors:0
  };
  const details=[];
  for(let i=0;i<16;i++){
    const a=control.rows[i],b=selected.rows[i];
    assert.equal(a.trial.id,b.trial.id);
    assert.equal(a.trial.rank,6);
    assert.equal(a.trial.seed,b.trial.seed);
    assert.equal(a.trial.candidateSlot,b.trial.candidateSlot);
    assert.equal(a.trial.candidateId,b.trial.candidateId);
    assert.equal(a.qualifiesForCompetitiveInference,false);
    assert.equal(b.qualifiesForCompetitiveInference,false);
    const key=a.trial.id;
    const status=value=>value.status??(value.finished?'terminal':
      value.endReason==='action-limit'?'censored':'unclassified');
    const stateA=status(a),stateB=status(b);
    summary.controlFinished+=Number(a.finished===true);
    summary.selectedFinished+=Number(b.finished===true);
    summary.controlCensored+=Number(stateA==='censored');
    summary.selectedCensored+=Number(stateB==='censored');
    summary.controlErrors+=Number(SOURCE_ERROR.has(stateA));
    summary.selectedErrors+=Number(SOURCE_ERROR.has(stateB));
    const ready=Array.isArray(a.rootActionLedger)&&
      Array.isArray(b.rootActionLedger)&&
      typeof a.fullPhysicalDealFingerprint==='string'&&
      typeof b.fullPhysicalDealFingerprint==='string';
    const entry={
      id:key,seed:a.trial.seed,candidateSlot:a.trial.candidateSlot,
      candidateId:a.trial.candidateId,
      ready,controlStatus:stateA,selectedStatus:stateB,
      controlWinner:a.winner??null,selectedWinner:b.winner??null,
      controlActions:a.actionCount??null,
      selectedActions:b.actionCount??null
    };
    if(!ready){
      summary.uncomparable++;
      entry.reason='One or both original Store arms lack a physical root ledger';
      details.push(entry);
      continue;
    }
    assert.equal(a.fullPhysicalDealFingerprint,
      b.fullPhysicalDealFingerprint);
    assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint);
    assert.equal(a.sourceDeckFingerprint,b.sourceDeckFingerprint);
    assert.equal(a.candidateDeckFingerprint,b.candidateDeckFingerprint);
    assert.equal(a.actualStarterSeat,b.actualStarterSeat);
    summary.pairedReady++;
    const index=firstActionDifference(a.rootActionLedger,b.rootActionLedger);
    entry.firstActionDifferenceIndex=index;
    if(index<0){
      assert.equal(a.rootActionLedgerSha256,b.rootActionLedgerSha256);
      assert.equal(a.finished,b.finished);
      assert.equal(a.winner,b.winner);
      assert.equal(a.endReason,b.endReason);
      summary.unchanged++;
      details.push(entry);
      continue;
    }
    const old=a.rootActionLedger[index],now=b.rootActionLedger[index];
    assert.ok(old&&now,'First changed actions must be genuine Store events');
    assert.equal(old.playerSlot,now.playerSlot);
    assert.equal(old.turnBefore,now.turnBefore);
    assert.equal(old.action,'PassTurnAction');
    assert.equal(now.action,'AttackAction');
    assert.equal(typeof now.attack,'string');
    assert.ok(now.attack.length>0);
    const audit=b.actorOnlyDecisionCoverage?.detailedComponentAudits
      ?.root?.sameRootProposalChoice;
    assert.ok(audit?.changedRoots>0,
      'Missing actor-root public terminal selection for native changed action');
    summary.changed++;
    if(now.playerSlot===b.sourceSeat)summary.sourceChanged++;
    else summary.candidateChanged++;
    summary.nativeAttackChosen++;
    const settlement=(now.playerSlot===b.sourceSeat?
      b.sourceAttackSettlement:b.candidateAttackSettlement)
      ?.attacks?.find(att=>att.attackName===now.attack&&
        att.turnBefore===now.turnBefore);
    if(settlement?.settledPromptChain===true)summary.settledAttacks++;
    const opposingSeat=1-now.playerSlot;
    const before=settlement?.publicBoardBefore?.[opposingSeat];
    const after=settlement?.publicBoardAfter?.[opposingSeat];
    const immediateTerminal=Boolean(settlement?.settledPromptChain===true &&
      before?.active&&before.bench?.length===0&&
      after?.active===null&&after.bench?.length===0&&
      b.finished===true&&b.winner===now.playerSlot);
    summary.immediateLoneActiveKO+=Number(immediateTerminal);
    const nextOpponentRoot=b.rootActionLedger.slice(index+1).find(event=>
      event.playerSlot===opposingSeat&&
      event.turnBefore>now.turnBefore&&
      event.action!=='ResolvePromptAction')??null;
    Object.assign(entry,{
      sourceOfChangedIntent:now.playerSlot===b.sourceSeat?'source':'candidate',
      publicTurn:now.turnBefore,attackerSeat:now.playerSlot,
      oldAction:old.action,newAction:now.action,
      attack:now.attack,
      prefixEventCount:index,
      settled:settlement?.settledPromptChain??false,
      defenderBefore:before??null,
      defenderAfter:after??null,
      immediateLoneActiveKO:immediateTerminal,
      nextOpponentRoot
    });
    details.push(entry);
  }
  assert.equal(summary.pairedReady+summary.uncomparable,16);
  assert.equal(summary.pairedReady,
    summary.unchanged+summary.changed);
  return {
    version:VERSION,
    panelCohort:control.preregisteredCohort,
    registeredAt:control.preregisteredAt,
    pinnedEngine:control.enginePin,
    controlSameRootChangedRoots:control.sameRootChangedRoots,
    selectedSameRootChangedRoots:selected.sameRootChangedRoots,
    summary,details,
    competitiveQualifiedGames:0,winRateCertified:false,
    caveat:'Frozen before-run rank6 seeds, both physical seats, two 60s; this measures native exposure and consequences only. Source rank6, candidate policies, physical-zone verification and paper-rule coverage are insufficient for field-wide competitive inference.'
  };
}

if(require.main===module){
  assert.equal(process.argv.length,4,
    'Usage: node scripts/agent7-public-no-bench-panel-pair.cjs CONTROL.json SELECTED.json');
  const parse=path=>JSON.parse(fs.readFileSync(path,'utf8'));
  const report=compareRegisteredRank6Panel(
    parse(process.argv[2]),parse(process.argv[3]));
  process.stdout.write('PUBLIC_NO_BENCH_PREREGISTERED_PANEL '+
    JSON.stringify(report)+'\n');
}

module.exports={VERSION,compareRegisteredRank6Panel};
