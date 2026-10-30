'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const {createHash} = require('node:crypto');

const ROOT = path.resolve(__dirname, '../..');
const SOURCE_RANK = 6;
const REPEAT = 3;
const SEED = 861838028;
const CANDIDATE_SLOT = 'B';
const CANDIDATES = Object.freeze([
  'champion-reference', 'new-moon-lockbreaker-v1'
]);
const RESEARCH_SCOPE = 'read-only-setup-only-followup-not-common-policy-replay';
const ORIGINAL_SOURCE_DIGESTS = Object.freeze({
  'champion-reference':
    'e57fb601c6a81c7db88b4b469fc8b3246a04e43e2e942141ada30b7a6f8806ce',
  'new-moon-lockbreaker-v1':
    'a811d26b25cc712f765f891ec60c0a16dda7a8f438f3ba794cc461c5fe348da3'
});

/** @param {object} registration Original immutable Agent41 registration. */
function selectedFrozenPair(registration) {
  const {plannedTrials} = require('./agent41-prospective-canonical-scout.cjs');
  const pair = plannedTrials(registration).filter(t =>
    t.rank===SOURCE_RANK && t.repeat===REPEAT &&
    t.seed===SEED && t.candidateSlot===CANDIDATE_SLOT);
  assert.deepEqual(pair.map(t=>t.candidateId), CANDIDATES);
  return pair;
}

/**
 * Read-only, matched-seed setup-only reproduction. Run on compiled pinned
 * engine. The generic two-seat replay and the full retrospective canonical
 * actor composition have DIFFERENT setup decision policies; differences from
 * original archived digests are informative, not a protocol error.
 * @returns {object} All two setup arms and separate native setup-mulligan audit.
 */
function run() {
  const {loadCampaignInputs} =
    require('./aichi-campaign-runner.cjs');
  const {planAichi} = require('./aichi-pilot.cjs');
  const {runMatch, initializeCards} =
    require('../twinleaf/headless.cjs');
  const {oneSetup} = require('../twinleaf/setup-audit.cjs');
  const {captureSetupOnly} =
    require('./aichi-setup-only-capture.cjs');
  const {openingInventoriesMatch} =
    require('../twinleaf/opening-setup-zones.cjs');
  const {Store} = require(path.resolve(ROOT,
    'vendor/twinleaf/ptcg-server/output/game/store/store'));
  const {plannedTrials,REGISTRATION_BLOB} =
    require('./agent41-prospective-canonical-scout.cjs');

  const name='results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';
  const bytes=fs.readFileSync(path.resolve(ROOT,name));
  const blob=createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
  assert.equal(blob,REGISTRATION_BLOB,
    'Frozen source test registration must not change');
  const registration=JSON.parse(bytes.toString('utf8'));
  assert.equal(registration.enginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const pair=selectedFrozenPair(registration);
  assert.equal(pair.length,2);
  assert.ok(plannedTrials(registration).length===32);

  const inputs=loadCampaignInputs();
  const settings={
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  };
  const plans=new Map(CANDIDATES.map(id=>{
    const source=inputs.candidates.find(x=>x.id===id);
    assert.ok(source);
    return [id,planAichi({label:id,cards:source.cards},settings)];
  }));
  const original=plans.get(CANDIDATES[0]);
  const source=original.opponents.find(x=>x.rank===SOURCE_RANK);
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  for(const candidate of CANDIDATES){
    const plan=plans.get(candidate);
    assert.equal(plan.engineRevision,registration.enginePin);
    assert.equal(plan.candidate.cards.length,60);
    const corresponding=plan.opponents.find(o=>o.rank===SOURCE_RANK);
    assert.deepEqual(corresponding.cards,source.cards,
      'Original source engine 60 must remain fixed between candidates');
  }
  initializeCards();
  const attempts=[];
  for(const candidateId of CANDIDATES){
    const deckA=source.cards;
    const deckB=plans.get(candidateId).candidate.cards;
    const mulligan=oneSetup(deckA,deckB,SEED);
    const observation=captureSetupOnly(Store,()=>runMatch({
      deckA,deckB,seed:SEED,maxActions:150,
      strictPromptValidation:true,isolatePolicyRandomness:true,
      label:'agent26-original-frozen32-mismatch-setup-'+candidateId
    }),{sourceSeat:0,captureFirstTurnEvidence:true});
    assert.equal(observation.stoppedAtFirstTurn,true);
    assert.ok(openingInventoriesMatch(
      observation.setupZones?.seats,[deckA,deckB]));
    assert.equal(observation.sourcePhysicalDeal?.seat,0);
    assert.equal(observation.firstTurnEvidence?.verifiedByDrawLog,true);
    const sourceZones=observation.setupZones.seats[0];
    const active=sourceZones.active;
    const bench=sourceZones.bench.filter(cards=>cards.length>0)
      .map(cards=>cards[0]);
    attempts.push({
      candidateId,rank:SOURCE_RANK,repeat:REPEAT,
      seed:SEED,sourceSeat:0,candidateSeat:1,
      firstTurnSeat:observation.firstTurnEvidence.firstTurnSlot,
      sourceStartingActive:active,sourceStartingBench:bench,
      sourceStartingPokemonCount:active.length+bench.length,
      sourcePhysicalDealDigest:observation.sourcePhysicalDeal.digestSha256,
      matchesOriginalFullPolicySourceDigest:
        observation.sourcePhysicalDeal.digestSha256===
          ORIGINAL_SOURCE_DIGESTS[candidateId],
      originalCanonicalFullPolicySourceDigest:
        ORIGINAL_SOURCE_DIGESTS[candidateId],
      independentSetupMulligans:mulligan.mulligans,
      independentSetupBonusOffered:mulligan.bonusOffered,
      independentSetupBonusSelected:mulligan.bonusSelected,
      independentSetupBonusDrawn:mulligan.bonusDrawn,
      independentSetupFirstSeat:mulligan.firstSeat,
      // Separate setup-only resolutions don't reuse the full-game policy.
      fullCanonicalPolicyReplayed:false,
      actualMatchCompleted:false,qualifiedCompetitiveGame:false
    });
  }
  assert.equal(attempts.length,2);
  return {
    schema:'agent26-ranked6-frozen32-mismatch-seed-setup-followup-v1',
    scope:RESEARCH_SCOPE,
    originalRegistration:name,registrationBlob:blob,
    enginePin:registration.enginePin,selectedPair:pair,
    attempts,attemptedSetupArms:attempts.length,
    originalFullPolicyMatchedSourceDigests:attempts.filter(a=>
      a.matchesOriginalFullPolicySourceDigest).length,
    sourceStartingPokemonCountContrast:attempts.map(a=>
      a.sourceStartingPokemonCount),
    competitorMulliganCounts:attempts.map(a=>
      a.independentSetupMulligans),
    completedFullGames:0,competitiveQualifiedGames:0,
    caveat:'The two generic Store setup-only reproductions and independent oneSetup mulligan audits retain fixed engine decks, source position and seed. These do not run the entire frozen native actor policy; do not equate different source hashes with a replay failure or claim candidate strength.'
  };
}
if(require.main===module){
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
}
module.exports={SOURCE_RANK,REPEAT,SEED,CANDIDATE_SLOT,
  ORIGINAL_SOURCE_DIGESTS,selectedFrozenPair,run};
