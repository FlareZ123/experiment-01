'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {executeArm,scheduledArms,assertManifest}=
  require('./agent41-crossrank-actual-decisions.cjs');
const {planAichi}=require('./aichi-pilot.cjs');

const root=path.resolve(__dirname,'../..');
const trialId='6:2:A:champion-reference';

/**
 * Replay only the one previously archived Store-rejected root, preserving
 * the original seed, 60-card decks, policies, and pinned-engine flags.
 * The error witness contains the acting owner's hand and public board.
 * @returns {object}
 */
function run() {
  assertManifest();
  const trial=scheduledArms().find(row=>row.id===trialId);
  assert.ok(trial);
  assert.equal(trial.seed,2394734225);
  assert.equal(trial.candidateSlot,'A');
  assert.equal(trial.candidateId,'champion-reference');
  const source=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const reference=source.decks.find(deck=>deck.rank===1);
  assert.ok(reference);
  const prepared=new Map([['champion-reference',{
    plan:planAichi({label:'champion-reference',cards:reference.cards},{
      allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true
    })
  }]]);

  let failure=null;
  try {
    executeArm(trial,prepared,{captureRejectedActionEvidence:true});
  } catch(error) {
    failure=error;
  }
  assert.ok(failure,'The previously rejected Store action did not recur');
  assert.match(failure.message,/BLOCKED_BY_EFFECT/);
  const snapshot=failure.rejectedActionEvidence;
  assert.ok(snapshot,'Missing pre-dispatch owner-visible rejection witness');
  assert.equal(snapshot.schema,'rejected-root-owner-public-action-v1');
  assert.equal(snapshot.actionOrdinal,33);
  assert.equal(snapshot.actionName,'PlayCardAction');
  const sourceAudit=failure.rank6PolicyEvidence??null;
  return {
    schema:'agent6-crossrank-rejected-root-source-frozen-v1',
    trialId,seed:trial.seed,opponentRank:trial.rank,
    candidateId:trial.candidateId,physicalCandidateSlot:trial.candidateSlot,
    preregistration:'results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceArchiveRun:39193837824,
    replayIsHistoricalSelectedFailure:true,
    exactlyOneFrozenSourceDealReplayed:true,
    error:failure.message,rejection:snapshot,
    sourcePolicyAudit:sourceAudit,
    qualifiedCompetitiveGames:0,
    caveat:'One previously failing arm replay. The source, seed, 60s and policy are held fixed; the extra passive observer sees the acting own hand and both public boards.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
