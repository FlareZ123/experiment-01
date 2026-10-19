'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('./headless.cjs');
const {observeSourceLock}=
  require('./newmoon-rank15-source-duallock-census.cjs');
const {withRank15PaidTmPoffin}=
  require('./rank15-paid-tm-poffin-source-policy.cjs');
const {withOwnerRootChoiceWindow}=
  require('./owner-root-choice-window.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=
  require('./new-moon-lockbreak-source-diagnostic.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');

const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * One expressly retrospective, source-selected paid-TM Poffin opportunity.
 * It is a narrow native Item and next-Bench-action falsification, with no
 * use of untimed engine winning outcomes as competitive observations.
 *
 * @returns {object} Source-dealt baseline and printed Item alternative.
 */
function run(){
  initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const source=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true}).opponents.find(x=>x.rank===15);
  const candidate=pairedCandidateSlots().lockbreak;
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  assert.equal(candidate.length,60);
  const seed=deriveSlotSeeds(20261018,'pilot',15,0).A;
  assert.equal(seed,3050400820,
    'Original published source paid-TM fixture changed');
  const request={
    deckA:candidate,deckB:source.cards,seed,maxActions:260,
    label:'rank15-retrospective-owned-poffin-after-paid-tm-original-source',
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
  const baseline=observeSourceLock(Store,1,0,()=>runMatch(request));
  const alternative=observeSourceLock(Store,1,0,()=>
    withOwnerRootChoiceWindow(Store,1,()=>
      withRank15PaidTmPoffin(()=>runMatch(request),1),
      {turnStart:16,turnEnd:16}));
  const a=baseline.result,b=alternative.result.result.result;
  assert.ok(a.verifiedByDrawLog&&b.verifiedByDrawLog);
  assert.equal(a.firstTurnSlot,0);
  assert.equal(a.firstTurnSlot,b.firstTurnSlot);
  assert.deepEqual(a.deckHashes,b.deckHashes);
  assert.equal(a.rootActionLedger.length,a.actions);
  assert.equal(b.rootActionLedger.length,b.actions);
  assert.equal(baseline.firstNormalTurnZoneDigest,
    alternative.firstNormalTurnZoneDigest,
    'Policy changed hidden physical deal before root decisions');
  assert.deepEqual(baseline.firstNormalTurnPrizeGate,
    alternative.firstNormalTurnPrizeGate);
  const original=baseline.first.sourceBunnelbyActiveWithTMAndEnergy;
  assert.ok(original,'Frozen source paid-TM opportunity was not reproduced');
  assert.equal(original.turn,16);
  assert.equal(original.ordinal,125);
  assert.deepEqual(original.sourceOwnerHandNames,
    ['Buddy-Buddy Poffin TEF','Tag Call CEC']);
  const pCount=game=>Object.entries(game.cardsPlayedBySeat[1])
    .filter(([card])=>card.startsWith('Buddy-Buddy Poffin'))
    .reduce((sum,[,n])=>sum+n,0);
  const summary=(observed,game)=>({
    actions:game.actions,finished:game.finished,
    rootLedgerSHA256:sha(game.rootActionLedger),
    firstOwnedPaidTM:observed.first.sourceBunnelbyActiveWithTMAndEnergy,
    firstOddishOnSourceBench:observed.first.sourceOddishOnBench,
    actualRootPoffinItemPlays:pCount(game),
    nativeEvolutionDeclarations:game.attackDeclarationTrace.filter(
      e=>e.playerSlot===1&&e.attackName==='Evolution').length,
    sourceRootWindow:game.rootActionLedger.slice(119,151).filter(
      e=>e.playerSlot===1)
  });
  return {
    schema:'rank15-retrospective-true-source-paid-tm-poffin-fork-v2',
    sourceRank:15,sourceSeat:1,candidateSeat:0,
    source:'Ryotaro Nozawa exact Aichi rank15 60',
    candidate:'frozen New Moon Lockbreaker v1 printed mechanics proxy 60',
    seed,actualFirstSeat:0,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    identicalOriginalPrepolicyPhysicalDeal:true,
    sourceInitialPrizeGate:baseline.firstNormalTurnPrizeGate,
    policy:'single owner-visible, native-validated Poffin candidate in exact paid TM state',
    original:summary(baseline,a),
    poffinAlternative:summary(alternative,b),
    policyAttempts:alternative.result.result.audit.attempts,
    originalRootChoiceWindow:alternative.result.trace,
    totalStoreRootCallsInAlternative:alternative.result.rootActionCount,
    qualifications:{
      sourceDealWasRetrospectivelySelected:true,
      competitiveGamesQualified:0,
      winRateCertified:false,
      promptResolutionNotIndependentOfGenericBot:true,
      legalActionRequiresNativeDispatchWitness:true
    }
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
