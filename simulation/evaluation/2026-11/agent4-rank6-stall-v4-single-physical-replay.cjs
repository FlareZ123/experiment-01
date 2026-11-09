'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {manifestWithDriftAudit}=
  require('../agent4-v3-two-unknown-power-readout.cjs');
const {withSameRuntime,effectiveOptions}=
  require('../agent4-selected-v3-paper-funded-release.cjs');
const {runDevelopment}=
  require('../agent41-bilateral-v2-development.cjs');
const {withHeldHoodToolPriority,withProtectedHoodUnderworld}=
  require('../../twinleaf/2026-11/agent4-hood-protected-underworld-owner-exception.cjs');
const {withImmediateFundedHoodOnly}=
  require('../../twinleaf/2026-11/agent4-immediate-hood-psychic-budget.cjs');
const {writeAtomicLocked}=
  require('../agent20-frozen-rank6-canary-v1.cjs');
const reg=require('../../../results/aichi-2026/registrations/agent4-hood-immediate-psychic-reserve-v4-20261109.json');
const candidate=require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');
const SELECTED='6:1208:A:hood-shield-v1';
const VERSION='agent4-retrospective-real-physical-rank6-zero-attack-bottleneck-v1';

/**
 * Retrospectively reproduce the actual previously registered candidate-zero-
 * attack physical deal with exactly the same native game and selected v4
 * policy. Expose owner/public board and attack opportunities for actionable
 * stall diagnosis, never treating this selected losing case as a holdout.
 *
 * @param {{run?:Function}} [deps]
 * @returns {object}
 */
function runCase(deps={}){
  const selected=reg.trialRows.find(t=>t.id===SELECTED);
  assert.ok(selected);
  assert.equal(reg.enginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const checked=manifestWithDriftAudit();
  const mode=checked.manifest.modes.find(m=>
    m.id==='selected-v3-paper-plus-funded-mobility');
  assert.ok(mode);
  const opts={
    ...effectiveOptions(checked.manifest,mode),
    registeredFrameName:VERSION,
    registeredTrials:[selected],
    registeredCandidateDecks:{'hood-shield-v1':candidate},
    allowSingleCandidatePerGroup:true,
    allowAdditionalOriginalSourceRanks:true
  };
  const execute=deps.run??runDevelopment;
  const wrapped=withSameRuntime(()=>
    withHeldHoodToolPriority(()=>
      withImmediateFundedHoodOnly(()=>
        withProtectedHoodUnderworld(()=>execute(opts)))));
  assert.equal(wrapped.result.attempted,1);
  const game=wrapped.result.rows[0];
  assert.equal(game.trial.id,SELECTED);
  const candidateSeat=selected.candidateSlot==='A'?0:1;
  const sourceSeat=1-candidateSeat;
  const roots=game.rootActionLedger??[];
  const candidateRoots=roots.filter(root=>
    root.playerSlot===candidateSeat);
  const sourceRoots=roots.filter(root=>
    root.playerSlot===sourceSeat);
  const candidateAttack=game.candidateAttackSettlement??null;
  return {
    schema:VERSION,
    retrospectiveSelectedId:SELECTED,
    selectionReason:'prior preregistered v4 native result had zero candidate attacks and six original-rank6 source attacks',
    enginePin:reg.enginePin,
    unchangedCandidate:'hood-shield-v1',
    matchedPreviouslyPublishedPhysicalStart:
      game.fullPhysicalDealFingerprint??null,
    candidateSeat,sourceSeat,
    ownerOnlyPolicyHook:{...wrapped.audit,samples:wrapped.audit.samples.slice(0,6)},
    nativeStatus:game.status,
    nativeError:game.error??null,
    nativeFinished:game.finished===true,
    nativeEndReason:game.endReason??null,
    publicFinalBoard:game.finalBoard??null,
    nativeFinalPrizes:game.finalPrizes??null,
    actualRootCount:roots.length,
    candidateAcceptedRoots:candidateRoots.length,
    sourceAcceptedRoots:sourceRoots.length,
    candidateAcceptedAttacks:candidateRoots.filter(r=>
      r.action==='AttackAction').length,
    sourceAcceptedAttacks:sourceRoots.filter(r=>
      r.action==='AttackAction').length,
    lastCandidateRoots:candidateRoots.slice(-24).map(r=>({
      ordinal:r.actionOrdinal,turn:r.turnBefore,
      action:r.action,card:r.card??null,
      attack:r.attack??null,ability:r.ability??null
    })),
    lastSourceRoots:sourceRoots.slice(-12).map(r=>({
      ordinal:r.actionOrdinal,turn:r.turnBefore,
      action:r.action,card:r.card??null,
      attack:r.attack??null,ability:r.ability??null
    })),
    candidatePrintedAttackSettlements:
      candidateAttack?.attacks?.map(a=>({
        ordinal:a.actionOrdinal,
        attack:a.attackName,turn:a.turnBefore,
        prizesBefore:a.prizesBefore,prizesAfter:a.prizesAfter,
        verifiedSameEpochSourceReturn:a.nextSourceSameEpochProven
      }))??[],
    boundedOwnerPassEvidence:game.candidatePostChoicePassEvidence??null,
    paperQualified:false
  };
}
if(require.main===module){
  const output=process.env.AGENT4_RANK6_STALL_REPLAY_OUTPUT;
  assert.ok(output,'Specify atomic locked destination path');
  const result=runCase();
  const serialized=JSON.stringify(result,null,2)+'\n';
  fs.mkdirSync(path.dirname(output),{recursive:true});
  writeAtomicLocked(output,serialized);
  writeAtomicLocked(output+'.sha256',
    createHash('sha256').update(serialized).digest('hex')+
    '  '+path.basename(output)+'\n');
  process.stdout.write('AGENT4_RANK6_REAL_STALL '+JSON.stringify({
    game:result.retrospectiveSelectedId,
    enginePin:result.enginePin,
    nativeStatus:result.nativeStatus,
    nativeFinished:result.nativeFinished,
    nativeFinalPrizes:result.nativeFinalPrizes,
    candidateAcceptedAttacks:result.candidateAcceptedAttacks,
    sourceAcceptedAttacks:result.sourceAcceptedAttacks,
    publicFinalBoard:result.publicFinalBoard,
    lastCandidateRoots:result.lastCandidateRoots,
    candidatePrintedAttackSettlements:
      result.candidatePrintedAttackSettlements,
    ownerPassCount:
      result.boundedOwnerPassEvidence?.summary?.observedCandidatePasses??null,
    paperQualified:false
  })+'\n');
}
module.exports={VERSION,SELECTED,runCase};
