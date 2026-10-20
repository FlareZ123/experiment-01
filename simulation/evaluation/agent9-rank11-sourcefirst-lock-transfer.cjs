'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {assertManifest}=require('./agent41-crossrank-actual-decisions.cjs');
const {executeDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
const {candidateAttackSettlement}=
  require('./agent37-candidate-attack-settlement.cjs');
const headless=require('../twinleaf/headless.cjs');

// Previously selected because rank11 source A genuinely began first and its
// held Boost Shake + Tool line completed against rank1 reference B. This is
// a RETROSPECTIVE mechanical-pressure transfer fixture, not a new trial draw.
// See results/aichi-2026/rank11-direct-shake-decorrelated-both-start.md.
const SOURCE_LOCK_SEEDS=Object.freeze([
  1325646358,3316498962,482443328,3861968885
]);

/** @param {object} game @param {0|1} seat */
function captureCandidate(game,seat){
  return {
    attackSettlement:candidateAttackSettlement(game,seat),
    settledAttackCount:(game.publicAttackTransitions??[])
      .filter(row=>row.settled?.after).length,
    sourceRootCount:(game.rootActionLedger??[])
      .filter(row=>row.playerSlot===1-seat).length
  };
}

/** Reuse canonical bilateral actors, source policy and physical printed 60s. */
function main(){
  assertManifest();
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const reference=roster.decks.find(deck=>deck.rank===1);
  assert.ok(reference);
  const candidates=new Map([
    ['champion-reference',{label:'champion-reference',cards:reference.cards}],
    ['new-moon-lockbreaker-v1',{label:'new-moon-lockbreaker-v1',
      cards:loadNewMoonCandidate().cards}]
  ].map(([id,manifest])=>[id,{
    plan:planAichi(manifest,{allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true})
  }]));
  const rows=[];
  for(let repeat=0;repeat<SOURCE_LOCK_SEEDS.length;repeat++){
    const seed=SOURCE_LOCK_SEEDS[repeat];
    for(const candidateId of ['champion-reference','new-moon-lockbreaker-v1']){
      const trial={rank:11,repeat,seed,candidateSlot:'B',candidateId,
        id:['11','sourcefirst-mechanic',repeat,'B',candidateId].join(':')};
      const original=headless.runMatch;
      let capture=null;
      function withPostChoiceObservation(request){
        const game=original({...request,capturePoltergeistEffectTrace:true});
        capture=captureCandidate(game,1);
        return game;
      }
      headless.runMatch=withPostChoiceObservation;
      let row;
      try{
        row=executeDevelopment(trial,candidates,{
          compressorPayload:true,lateCompressorPayload:true
        });
      }catch(error){
        row={trial,status:'engine-error',
          error:String(error?.stack??error).slice(0,1800),
          qualifiesForCompetitiveInference:false};
      }finally{
        assert.strictEqual(headless.runMatch,withPostChoiceObservation,
          'Canonical source policy replaced the root match adapter');
        headless.runMatch=original;
      }
      rows.push({
        ...row,
        actorOwnedAttackSettlement:capture,
        originalSeedSelection:'source-first held-Shake success against rank1',
        selectedForCandidateOutcome:false,
        competitiveGameQualified:false
      });
    }
  }
  assert.equal(rows.length,8);
  const pairs=SOURCE_LOCK_SEEDS.map(seed=>{
    const here=rows.filter(row=>row.trial.seed===seed);
    const first=here[0],second=here[1];
    return {
      seed,actualFirstSeats:here.map(row=>row.actualStarterSeat??null),
      sourceLockCompleted:here.map(row=>row.sourceAudit?.completed??false),
      sourceLockTurn:here.map(row=>row.sourceAudit?.opportunityTurn??null),
      sourceDealFingerprints:here.map(row=>row.sourceDealFingerprint??null),
      matchingSourceDeal:Boolean(first.sourceDealFingerprint&&
        first.sourceDealFingerprint===second.sourceDealFingerprint),
      sourceFirstBoth:here.every(row=>row.sourceActuallyFirst===true),
      rootLedgerHashes:here.map(row=>row.rootActionLedgerSha256??null),
      gameErrors:here.filter(row=>row.status==='engine-error').map(row=>row.error)
    };
  });
  const result={
    schema:'agent9-rank11-real-sourcefirst-boostshake-transfer-fixture-v1',
    evidenceType:'retrospectively selected previously successful source-first lock seeds; no game strength',
    publishedOpponentRank:11,
    candidates:['champion-reference','new-moon-lockbreaker-v1'],
    originalSourceFirstSuccessSeeds:SOURCE_LOCK_SEEDS,
    sourceSeat:0,candidateSeat:1,
    originalSourceSuccessSource:'results/aichi-2026/rank11-direct-shake-decorrelated-both-start.md',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5',
    researchRevision:process.env.GITHUB_SHA??null,
    originalCandidatePolicy:'agent41-bilateral-common-resource-policy-v0 + late14 donor option',
    rows,pairs,attempted:rows.length,
    competitiveQualifiedGames:0,qualifiedWinRate:null,
    caveat:'Original seeds selected because source already completed an early lock against a different candidate in a prior study. Changing candidate 60 can shift mulligans and source deal. Every outcome is conditional and retrospective. Source and candidate bots are unqualified.'
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}
if(require.main===module)main();
module.exports={SOURCE_LOCK_SEEDS,main};
