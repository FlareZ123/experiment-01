'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const {planAichi} = require('../simulation/evaluation/aichi-pilot.cjs');
const {loadNewMoonCandidate} = require('../scripts/aichi-new-moon-candidate.cjs');
const {
  ALLOWED_PROFILES, RANK11_AUTONOMOUS_PROFILE,
  RANK11_SUPPORTER_PROFILE, runWithResearchProfile
} = require('../simulation/twinleaf/policy-profiles.cjs');

const output = path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const {PlaySupporterTactic} = require(path.join(output,
  'simple-bot/simple-tactics/play-supporter-tactic'));

/** @returns {object} */
function sourceRequest() {
  const candidate = loadNewMoonCandidate();
  const plan = planAichi({label:candidate.id,cards:candidate.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent = plan.opponents.find(row=>row.rank===11);
  assert.equal(opponent.status,'ready');
  return {
    deckA:opponent.cards,deckB:plan.candidate.cards,
    seed:1244180408,maxActions:85,rank11SourceSeat:0,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true
  };
}

test('rank11 opener and Supporter correction compose with real source 60s',()=>{
  assert.ok(ALLOWED_PROFILES.includes(RANK11_SUPPORTER_PROFILE));
  const previous=PlaySupporterTactic.prototype.useTactic;
  const input=sourceRequest();
  const control=runWithResearchProfile(input,RANK11_AUTONOMOUS_PROFILE);
  const corrected=runWithResearchProfile(input,RANK11_SUPPORTER_PROFILE);
  assert.equal(PlaySupporterTactic.prototype.useTactic,previous);
  assert.equal(control.firstTurnSlot,0);
  assert.equal(corrected.firstTurnSlot,0);
  assert.equal(corrected.verifiedByDrawLog,true);
  assert.deepEqual(control.deckHashes,corrected.deckHashes);
  assert.equal(control.rank11AutonomousPolicy.completeAtDecisionBoundary,true);
  assert.equal(corrected.rank11AutonomousPolicy.completeAtDecisionBoundary,true);
  assert.equal(control.supporterDecisionCorrection,false);
  assert.equal(corrected.supporterDecisionCorrection,true);
  assert.equal(corrected.researchPolicyProfile,RANK11_SUPPORTER_PROFILE);
  assert.ok(corrected.experimentalTactics.includes('SupporterDecisionGuard-v1'));
  assert.match(corrected.policy,/SupporterDecisionGuard-v1/);
  const sourceFirst=game=>game.decisionTrace.filter(row=>row.turnBefore<=1);
  assert.deepEqual(sourceFirst(control),sourceFirst(corrected),
    'Adding Supporter correction must preserve registered source first-turn actions');
});

test('rank11 combined policy requires explicit immutable source seat',()=>{
  const input=sourceRequest();
  delete input.rank11SourceSeat;
  assert.throws(()=>runWithResearchProfile(input,RANK11_SUPPORTER_PROFILE),
    /actual source seat/);
});
