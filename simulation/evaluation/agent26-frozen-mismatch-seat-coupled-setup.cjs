'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const {plannedTrials,REGISTRATION_BLOB}=
  require('./agent41-prospective-canonical-scout.cjs');
const {loadCampaignInputs}=require('./aichi-campaign-runner.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {captureSetupOnly}=require('./aichi-setup-only-capture.cjs');
const {openingInventoriesMatch}=
  require('../twinleaf/opening-setup-zones.cjs');
const {withPerSeatSetupShuffleStreams}=
  require('./agent26-per-seat-setup-shuffle-streams.cjs');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION='results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';
const {Store}=require(path.resolve(ROOT,
  'vendor/twinleaf/ptcg-server/output/game/store/store'));
const SOURCE_RANK=6, REPEAT=3,SEED=861838028,CANDIDATE_SLOT='B';

/** Bounded setup-only alternative coupling. Does not change archived games. */
function run(){
  const bytes=fs.readFileSync(path.resolve(ROOT,REGISTRATION));
  const hash=createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
  assert.equal(hash,REGISTRATION_BLOB);
  const reg=JSON.parse(bytes.toString('utf8'));
  const trials=plannedTrials(reg).filter(t=>t.rank===SOURCE_RANK &&
    t.repeat===REPEAT && t.seed===SEED &&
    t.candidateSlot===CANDIDATE_SLOT);
  assert.deepEqual(trials.map(t=>t.candidateId),
    ['champion-reference','new-moon-lockbreaker-v1']);
  const field=loadCampaignInputs();
  const opts={
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true
  };
  const prepared=new Map(trials.map(t=>{
    const candidate=field.candidates.find(c=>c.id===t.candidateId);
    assert.ok(candidate);
    const plan=planAichi({label:t.candidateId,cards:candidate.cards},opts);
    assert.equal(plan.engineRevision,reg.enginePin);
    return [t.candidateId,plan];
  }));
  const reference=prepared.get('champion-reference');
  const source=reference.opponents.find(x=>x.rank===SOURCE_RANK);
  assert.equal(source?.status,'ready');
  const deckA=source.cards;
  assert.equal(deckA.length,60);
  initializeCards();
  const rows=[];
  for(const trial of trials){
    const candidate=prepared.get(trial.candidateId);
    const own= candidate.candidate.cards;
    assert.equal(own.length,60);
    assert.deepEqual(candidate.opponents.find(x=>x.rank===SOURCE_RANK).cards,
      deckA);
    const native=withPerSeatSetupShuffleStreams(Store,SEED,
      ()=>captureSetupOnly(Store,()=>runMatch({
        deckA,deckB:own,seed:SEED,maxActions:150,
        strictPromptValidation:true,isolatePolicyRandomness:true,
        label:'agent26-separate-seat-setup-shuffle-counterfactual-'+trial.id
      }),{sourceSeat:0,captureFirstTurnEvidence:true}));
    const observed=native.result;
    assert.equal(observed.stoppedAtFirstTurn,true);
    assert.ok(openingInventoriesMatch(observed.setupZones?.seats,
      [deckA,own]));
    assert.equal(observed.firstTurnEvidence?.verifiedByDrawLog,true);
    assert.equal(observed.firstTurnEvidence.firstTurnSlot,0);
    const sourceSeat=observed.setupZones.seats[0];
    const ownSeat=observed.setupZones.seats[1];
    const tape=native.shuffleTape;
    const sourceShuffles=tape.filter(s=>s.seat===0);
    const candidateShuffles=tape.filter(s=>s.seat===1);
    assert.ok(sourceShuffles.length>=1);
    assert.ok(candidateShuffles.length>=1);
    const bench=sourceSeat.bench.filter(xs=>xs.length>0).map(xs=>xs[0]);
    rows.push({
      trialId:trial.id,candidateId:trial.candidateId,
      sourcePhysicalDealSha256:
        observed.sourcePhysicalDeal.digestSha256,
      sourceActive:sourceSeat.active,sourceBench:bench,
      sourceMulliganCount:sourceShuffles.length-1,
      candidateMulliganCount:candidateShuffles.length-1,
      sourceShufflePermutations:sourceShuffles,
      candidateShufflePermutations:candidateShuffles,
      setupVerified:true,completedFullGames:0
    });
  }
  const compared=rows.length===2;
  return {
    schema:'agent26-per-seat-shuffle-rank6-original-seed-counterfactual-v1',
    status:'new-explicit-setup-only-coupling-not-frozen-original',
    sourceRank:SOURCE_RANK,seed:SEED,candidateSlot:CANDIDATE_SLOT,
    enginePin:reg.enginePin,registrationBlob:hash,
    sourcePhysicalDealsEqual:compared?
      rows[0].sourcePhysicalDealSha256===
        rows[1].sourcePhysicalDealSha256:null,
    sourceStartingBoardsEqual:compared?
      JSON.stringify([rows[0].sourceActive,rows[0].sourceBench])===
      JSON.stringify([rows[1].sourceActive,rows[1].sourceBench]):null,
    sourceShufflePermutationsEqual:compared?
      JSON.stringify(rows[0].sourceShufflePermutations.map(s=>
        s.permutationSha256))===
      JSON.stringify(rows[1].sourceShufflePermutations.map(s=>
        s.permutationSha256)):null,
    originalSharedStreamSourceDealsEqual:false,
    rows,attemptedSourceSetups:rows.length,
    fullGamesPlayed:0,competitiveQualifiedGames:0,
    caveat:'This is a deliberately NEW comparison coupling: owner-specific ShuffleDeckPrompt permutations from fixed, per-seat seeded streams. A source mulligan bonus prompted by candidate redraws remains legitimate. Global headless game RNG is still consumed for the original proposed shuffle before the Store overwrites its native action. This is not an original 32-arm outcome or a paper-strength test.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
