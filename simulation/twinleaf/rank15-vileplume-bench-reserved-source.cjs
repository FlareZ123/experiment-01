'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('./headless.cjs');
const {observeSourceLock}=require('./newmoon-rank15-source-duallock-census.cjs');
const {rootPolicyTrace}=require('./newmoon-rank15-bunnelby-policy-pair.cjs');
const {withRank15VileplumeBenchReservation}=
  require('./rank15-vileplume-bench-reservation.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=require('./new-moon-lockbreak-source-diagnostic.cjs');

const ROOT=path.resolve(__dirname,'../..');
const ANCHORS=path.join(ROOT,
  'results/aichi-2026/agent36-rank15-original-deal-anchors-v1.json');
const digest=value=>createHash('sha256').update(
  JSON.stringify(value)).digest('hex');

/**
 * Reuse eight completely frozen real source initial deals, one newly proposed
 * Bench-reserving source-policy variant on each. Original baseline + Bunnelby
 * comparisons live separately in archived CI 39245816323/12183891165.
 *
 * @returns {object} One honest attempt record per registered original deal.
 */
function run() {
  initializeCards();
  const {Store}=require(path.join(ROOT,
    'vendor/twinleaf/ptcg-server/output/game/store/store'));
  const frozen=JSON.parse(fs.readFileSync(ANCHORS,'utf8'));
  assert.equal(frozen.schema,'agent36-rank15-original-physical-deal-anchors-v1');
  assert.equal(frozen.pairs.length,8);
  const source=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true}).opponents.find(x=>x.rank===15);
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  const candidate=pairedCandidateSlots().lockbreak;
  assert.equal(candidate.length,60);
  const seen=new Set();
  const rows=[];

  for(const anchor of frozen.pairs){
    const key=anchor.repeat+':'+anchor.candidateSeat;
    assert.ok(!seen.has(key));seen.add(key);
    const candidateSeat=anchor.candidateSeat;
    assert.ok(candidateSeat===0||candidateSeat===1);
    const sourceSeat=1-candidateSeat;
    const request={
      deckA:candidateSeat===0?candidate:source.cards,
      deckB:candidateSeat===1?candidate:source.cards,
      seed:anchor.seed,maxActions:260,
      label:'rank15-original-deal-bunnelby-plus-bench-reserve-'+key,
      strictPromptValidation:true,
      forestSealSearchCorrection:true,
      supporterDecisionCorrection:true,
      leleEntryAbilityLockCorrection:true,
      entryDrawLockCorrection:true,
      isolatePolicyRandomness:true,
      pendingEndTurnSwitchCleanupCorrection:true,
      captureDecisionTrace:true,
      bunnelbyK0SafeEvolution:true,
      bunnelbyObservedK1:true,
      bunnelbyTargetAwareEvolution:true,
      bunnelbyGuzmaHalaMode1:true,
      bunnelbyGuzmaHalaSearch:true
    };
    try{
      const observed=observeSourceLock(Store,sourceSeat,candidateSeat,()=>
        withRank15VileplumeBenchReservation(
          ()=>runMatch(request),sourceSeat));
      const game=observed.result.result;
      const audit=observed.result.audit;
      assert.equal(game.verifiedByDrawLog,true);
      assert.equal(game.firstTurnSlot,anchor.actualFirstSlot);
      assert.deepEqual(game.deckHashes,
        frozen.deckHashesByCandidateSeat[String(candidateSeat)]);
      assert.equal(observed.firstNormalTurnZoneDigest,
        anchor.initialZoneDigestSha256,
        'Bench reservation changed prepolicy physical deal '+key);
      assert.equal(
        observed.firstNormalTurnPrizeGate.beforeTakingPrizesEligible,
        anchor.initialDualStagePrerequisitesEligible);
      assert.equal(game.rootActionLedger.length,game.actions);
      rows.push({
        repeat:anchor.repeat,candidateSeat,sourceSeat,
        seed:anchor.seed,status:'executed',
        sameOriginalPrepolicyPhysicalDeal:true,
        initialZoneDigestSha256:observed.firstNormalTurnZoneDigest,
        initialDualStagePrerequisitesEligible:
          observed.firstNormalTurnPrizeGate.beforeTakingPrizesEligible,
        actualFirstSlot:game.firstTurnSlot,
        actions:game.actions,finished:game.finished,
        endReason:game.endReason,
        first:observed.first,max:observed.max,
        sourceActions:rootPolicyTrace(game,sourceSeat),
        benchReservationTelemetry:{
          attemptedDeferrals:audit.events.length,
          eventsIncludeSpeculativeCalls:true,
          firstEvents:audit.events.slice(0,12)
        },
        rootLedgerSha256:digest(game.rootActionLedger)
      });
    }catch(error){
      rows.push({
        repeat:anchor.repeat,candidateSeat,sourceSeat,
        seed:anchor.seed,status:'engine-or-validation-error',
        error:String(error?.stack||error),
        competitiveGameQualified:false
      });
    }
  }
  assert.equal(rows.length,8);
  const real=rows.filter(x=>x.status==='executed');
  const count=name=>real.filter(x=>x.first[name]!==null).length;
  return {
    schema:'agent36-rank15-bench-reserving-source-development-v0',
    baselineArchive:'39245816323/12183891165',
    baselineArchiveSha256:frozen.archivedZipSha256,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceRank:15,candidate:'frozen New Moon Lockbreaker v1 proxy 60',
    policy:'source-aware Bunnelby K0/K1/TM/Guzma and Hala plus visible source Bench reservation',
    trialCount:rows.length,executed:real.length,
    errors:rows.length-real.length,
    matchedOriginalDeals:real.filter(
      x=>x.sameOriginalPrepolicyPhysicalDeal).length,
    aor:count('aor'),bus:count('bus'),dual:count('dual'),
    twoSourceStageLineSlots:count('twoSourceStageLineSlots'),
    fullSourceBenchBelowTwoStageLines:
      count('fullSourceBenchBelowTwoStageLines'),
    competitiveGamesQualified:0,winRateCertified:false,
    caveat:'Historical development seeds; winner counters discarded. Source decision policy and generic candidate bot unqualified. Board positions do not prove active Abilities or correctly resolved attacks.',
    rows
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
