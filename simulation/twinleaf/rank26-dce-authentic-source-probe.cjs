'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {initializeCards} = require('./headless.cjs');
const {RANK26_PROPAGATION_PROFILE,runWithResearchProfile} =
  require('./policy-profiles.cjs');
const {SOURCE} = require('./rank26-cologne-autonomous-source-regression.cjs');
const {withRank26DceReservation} = require('./rank26-dce-reservation.cjs');
const {withMailScout} = require('./rank26-mail-recovery.cjs');

/** @returns {object} */
function compare() {
  initializeCards();
  const plan = planAichi(SOURCE.rank, {
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source = plan.candidate.cards;
  const opponent = plan.opponents.find(o => o.rank===SOURCE.opponentRank);
  assert.equal(source.length,60);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  const request = {
    deckA:opponent.cards,deckB:source,
    rank26SourceSeat:SOURCE.rank26Seat,seed:SOURCE.seed,
    maxActions:100,strictPromptValidation:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    forestSealSearchCorrection:true,
    leleEntryAbilityLockCorrection:true,
    entryDrawLockCorrection:true,
    label:'rank26-actual-source-first-DCE-attachment-diagnostic'
  };

  /** @param {object} g */
  function summarize(g) {
    assert.equal(g.seed,SOURCE.seed);
    assert.equal(g.firstTurnSlot,SOURCE.rank26Seat);
    assert.equal(g.verifiedByDrawLog,true);
    assert.equal(g.researchPolicyProfile,RANK26_PROPAGATION_PROFILE);
    const first=(g.decisionTrace||[]).filter(a=>
      a.playerSlot===SOURCE.rank26Seat && a.turnBefore===1);
    assert.equal(first[0]?.card,'Canceling Cologne');
    return {
      sourceFirstDecisions:first.slice(0,60),
      sourceFirstActionCount:first.length,
      sourceCardsPlayed:g.cardsPlayedBySeat[SOURCE.rank26Seat],
      sourceBasicLightningChoices:first.filter(a=>a.card==='Lightning Energy').length,
      sourceDceChoices:first.filter(a=>a.card==='Double Colorless Energy').length,
      firstTurnPasses:first.filter(a=>a.action==='PassTurnAction').length,
      finished:g.finished===true,winner:g.winner??null,
      actions:g.actions
    };
  }

  const baseline=summarize(runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE));
  const dce=withRank26DceReservation(SOURCE.rank26Seat,()=>
    runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE));
  const candidate=summarize(dce.result);
  assert.ok(dce.policyAudit.decisions.length>0,
    'No actually selected Lightning decision was intercepted');
  assert.equal(candidate.sourceBasicLightningChoices,0,
    'Deferred first-turn basic Lightning must not be emitted by root bot');
  const assisted=withRank26DceReservation(SOURCE.rank26Seat,()=>
    withMailScout(SOURCE.rank26Seat,()=>
      runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE)));
  const mailCandidate=summarize(assisted.result.result);
  assert.ok(assisted.policyAudit.decisions.length>0,
    'Mail-assisted DCE policy did not encounter ordinary Lightning');
  return {
    schema:'rank26-authentic-source-firstturn-dce-reservation-v1',
    seed:SOURCE.seed,sourceSeat:SOURCE.rank26Seat,sourceRank:26,
    opponentRank:SOURCE.opponentRank,printedSource60s:[source.length,opponent.cards.length],
    engineRevision:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sameOriginalDealSeed:true,firstTurnDrawLogVerified:true,
    baseline,
    reservation:{firstTurn:candidate,policy:dce.policyAudit},
    mailAndReservation:{
      firstTurn:mailCandidate,policy:assisted.policyAudit,
      mailPolicy:assisted.result.policyAudit
    },
    prospectiveRandomTrial:false,
    gamePolicyQualified:false,
    competitiveGameQualified:false,
    qualificationLimits:[
      'One retrospectively selected source seed, not a performance sample',
      'First-turn decisions and engine actions, no human strategic policy certification',
      'Held DCE replacement is locally checked; all other search choices remain generic',
      'Full Crisis Punch combo and adversarial opponent response remain unproven'
    ]
  };
}

if (require.main===module)
  process.stdout.write(JSON.stringify(compare(),null,2)+'\n');
module.exports={compare};
