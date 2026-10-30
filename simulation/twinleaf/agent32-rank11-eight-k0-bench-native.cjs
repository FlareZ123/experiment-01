'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {createHash} = require('node:crypto');
const frame = require('../../results/aichi-2026/registrations/agent32-rank11-eight-k0-bench-followup-20261030.json');

/** @param {any} data @returns {string} */
function sha256(data) {
  return createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Confirm the immutable eight-index historical frame before any native state
 * is inspected. Seed and own-hand hash were precommitted from earlier source
 * archive, without inspecting Bench outcomes.
 */
function verifyFrame() {
  const {frameSha256, ...payload} = frame;
  assert.equal(sha256(payload),frameSha256,'Frozen frame digest mismatch');
  assert.equal(frame.schema,
    'agent32-rank11-retrospective-original-source-K0-bench-followup-v1');
  assert.equal(frame.engineRevision,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(frame.expectedSeedCount,8);
  assert.equal(frame.sourceRank,11);
  assert.equal(frame.sourceSeat,0);
  assert.equal(frame.candidateRank,1);
  assert.equal(frame.candidateSeat,1);
  const {seedFor,verifyRegistration} =
    require('../evaluation/rank11-conditional-k0-screen-run.cjs');
  verifyRegistration();
  const seen=new Set();
  for(const row of frame.preselectedSeeds){
    assert.ok(Number.isInteger(row.index)&&row.index>=0&&row.index<512);
    assert.equal(seedFor(row.index),row.seed,
      'Selected seed no longer matches precommitted original source cohort');
    assert.equal(typeof row.sourceFirstOwnerHandSha256,'string');
    assert.equal(row.sourceFirstOwnerHandSha256.length,64);
    assert.ok(!seen.has(row.index),'Duplicate original screen index');
    seen.add(row.index);
  }
  assert.equal(seen.size,8);
  return true;
}

/**
 * Pure, owner-observable classification of a pre-first-action original
 * source turn. Does not inspect secret Prizes, unknown deck contents, or
 * any opponent-private hand. A live Store is the source of these fields.
 * @param {object} view Frozen actorObservation for the current player.
 */
function classifyOriginalK0(view) {
  assert.equal(view.decisionKind,'owner-root');
  const hand=view.ownHand;
  const own=view.ownPublic;
  const active=own.active?.name??null;
  const bench=own.bench.map(slot=>slot?.printing??null);
  const occupied=bench.filter(Boolean);
  const handShake=hand.some(printing=>printing==='Boost Shake EVS');
  const handTrubbish=hand.some(printing=>printing==='Trubbish FST');
  const handVip=hand.some(printing=>printing==='Battle VIP Pass FST');
  const benchTrubbish=occupied.some(p=>p.startsWith('Trubbish FST'));
  const candidateHandCondition=active==='Oranguru V'&&
    handShake&&!handTrubbish&&!handVip;
  const knownBothGarbodor=hand.filter(p=>p==='Garbodor BKP').length>=2;
  // At the first normal decision: 7-card starting hand plus ordinary draw
  // includes all still-held cards and Active+Benched Basics; any excess
  // implies additional setup draws, e.g. opponent mulligan bonus.
  const ownerAccessibleAtFirstRoot=hand.length+1+occupied.length;
  return {
    sourceActive:own.active?.printing??null,
    sourceBench:bench,
    sourceOwnHandCount:hand.length,
    sourceOccupiedBenchCount:occupied.length,
    ownerAccessibleAtFirstRoot,
    ordinaryEightOnly:ownerAccessibleAtFirstRoot===8,
    candidateHandCondition,
    benchedTrubbish:benchTrubbish,
    noTrubbishKnownInHandOrBench:candidateHandCondition&&!benchTrubbish,
    originalEightCardK0Branch:candidateHandCondition&&
      !benchTrubbish&&ownerAccessibleAtFirstRoot===8,
    knownBothGarbodor,
    qualifiedCompetitiveGame:false
  };
}

/**
 * Run eight independently frozen original 60-card setup deals, and abort
 * each at the first genuine native bot decision. No Trainer, Ability,
 * attack, or opponent response is executed.
 * @returns {object}
 */
function run() {
  verifyFrame();
  const {resolvedPrintedDecks}=require('../evaluation/rank11-conditional-k0-screen-run.cjs');
  const decks=resolvedPrintedDecks();
  assert.equal(decks.deckA.length,60);
  assert.equal(decks.deckB.length,60);
  assert.equal(decks.engineRevision,frame.engineRevision);
  const {runMatch}=require('./headless.cjs');
  const {screenRank11FirstTurn}=require('./rank11-first-turn-screen.cjs');
  const {actorObservation}=require('./actor-observation-contract.cjs');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=require(path.join(output,'simple-bot/simple-tactics-ai'));
  const {GamePhase}=require(path.join(output,'game/store/state/state'));
  const attempts=[];
  for(const selected of frame.preselectedSeeds) {
    let ownerView=null;
    const record={index:selected.index,seed:selected.seed};
    try {
      const screen=screenRank11FirstTurn({
        sourceSeat:0,SimpleTacticsAi,
        playerTurnPhase:GamePhase.PLAYER_TURN,
        openingOpportunity:(state,owner,seat,phase)=>{
          assert.equal(seat,0);
          assert.equal(owner,state.players[0]);
          assert.equal(state.turn,1);
          assert.equal(state.phase,phase);
          ownerView=actorObservation(state,seat);
          // The archived older K0 opener was a different, narrower study.
          // The callback exists only to capture an owner-observable root.
          return false;
        },
        runMatch:()=>runMatch({
          ...decks,seed:selected.seed,
          label:'rank11-conditional-K0-screen-v1:'+selected.index,
          maxActions:frame.replaySettings.maxSetupActions,
          strictPromptValidation:frame.replaySettings.strictPromptValidation,
          forestSealSearchCorrection:frame.replaySettings.forestSealSearchCorrection,
          battleCompressorPositiveSelectionCorrection:
            frame.replaySettings.battleCompressorPositiveSelectionCorrection,
          isolatePolicyRandomness:frame.replaySettings.isolatePolicyRandomness
        })
      });
      assert.equal(screen.actualFirstPlayerSeat,0);
      assert.equal(screen.verifiedByDrawLog,true);
      assert.equal(screen.sourceFirst,true);
      assert.equal(screen.sourceStarter,'Oranguru V');
      assert.ok(ownerView,'Source-first native callback was not called');
      assert.deepEqual(ownerView.ownHand,screen.sourceOwnHandPrintings);
      const handSha=sha256(ownerView.ownHand);
      assert.equal(handSha,selected.sourceFirstOwnerHandSha256,
        'Native source owner hand differs from original frozen source-deal hand');
      const classified=classifyOriginalK0(ownerView);
      assert.equal(classified.candidateHandCondition,true,
        'Registered original hand-only opportunity not reproduced');
      Object.assign(record,{
        status:'native-first-owner-root-exact-hand-replayed',
        firstDrawVerified:true,sourceOwnHandSha256:handSha,
        originalStoreInitialBench:classified.sourceBench,
        ...classified
      });
    } catch(error) {
      record.status='blocked';
      record.error=String(error?.stack??error).slice(0,1500);
    }
    attempts.push(record);
  }
  const passed=attempts.filter(x=>x.status.startsWith('native-'));
  const blocked=attempts.filter(x=>x.status==='blocked');
  return {
    schema:'agent32-original-source-rank11-eight-k0-bench-native-v1',
    registrationSha256:frame.frameSha256,
    originalSourceArtifactSha256:frame.inputProvenance.originalZipSha256,
    pinnedEngineRevision:frame.engineRevision,
    sourceRank:11,sourceSeat:0,candidateRank:1,candidateSeat:1,
    scheduled:frame.preselectedSeeds.length,attempted:attempts.length,
    archivedHandAndOrderReplayPassed:passed.length,
    blocked:blocked.length,
    actuallyNoBenchTrubbish:passed.filter(x=>x.noTrubbishKnownInHandOrBench).length,
    exactlyEightCardsAccessibleAndNoTrubbish:
      passed.filter(x=>x.originalEightCardK0Branch).length,
    attempts,
    competitiveQualifiedGames:0,
    limitation:'Selected original hand-only eight K0 source roots; no native action continuation, post-Prize target verification, opponent decisions, or competitive strength.'
  };
}
if(require.main===module) {
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.blocked>0)process.exitCode=1;
}
module.exports={sha256,verifyFrame,classifyOriginalK0,run};
