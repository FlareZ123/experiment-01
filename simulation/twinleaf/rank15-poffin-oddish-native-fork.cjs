'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {initializeCards, runMatch} = require('./headless.cjs');
const {observeSourceLock} =
  require('./newmoon-rank15-source-duallock-census.cjs');
const {withOwnerRootChoiceWindow} =
  require('./owner-root-choice-window.cjs');
const {withRank15PaidTmPoffin} =
  require('./rank15-paid-tm-poffin-source-policy.cjs');
const {withRank15OddishPoffinPrompt} =
  require('./rank15-poffin-oddish-prompt-fork.cjs');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots} =
  require('./new-moon-lockbreak-source-diagnostic.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');

const sha = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * Compare two prompt policies on exactly the same original selected deal:
 * generic native Poffin search versus choosing both offered Oddish.
 * Neither policy gets to inspect source deck before genuine K1 search.
 * The result is a mechanical causal probe, never a win-rate observation.
 *
 * @returns {object} Source-owned root actions and prompt consequences.
 */
function run() {
  initializeCards();
  const {Store} = require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const source = planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true}).opponents.find(x=>x.rank===15);
  const candidate = pairedCandidateSlots().lockbreak;
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  assert.equal(candidate.length,60);
  const seed = deriveSlotSeeds(20261018,'pilot',15,0).A;
  assert.equal(seed,3050400820);
  const request = {
    deckA:candidate,deckB:source.cards,seed,maxActions:260,
    label:'rank15-retrospective-same-poffin-two-owner-search-choices',
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,leleEntryAbilityLockCorrection:true,
    entryDrawLockCorrection:true,isolatePolicyRandomness:true,
    pendingEndTurnSwitchCleanupCorrection:true,captureDecisionTrace:true,
    bunnelbyK0SafeEvolution:true,bunnelbyObservedK1:true,
    bunnelbyTargetAwareEvolution:true,bunnelbyGuzmaHalaMode1:true,
    bunnelbyGuzmaHalaSearch:true
  };
  function arm(changePrompt) {
    let itemAudit, promptAudit=null;
    const observed = observeSourceLock(Store,1,0,()=>
      withOwnerRootChoiceWindow(Store,1,()=>{
        const playItem = () => {
          const r = withRank15PaidTmPoffin(()=>runMatch(request),1);
          itemAudit=r.audit;
          return r.result;
        };
        if (!changePrompt) return playItem();
        const changed = withRank15OddishPoffinPrompt(playItem,1);
        promptAudit=changed.audit;
        return changed.result;
      },{turnStart:16,turnEnd:16}));
    const game=observed.result.result;
    assert.equal(game.verifiedByDrawLog,true);
    assert.equal(game.firstTurnSlot,0);
    assert.equal(game.rootActionLedger.length,game.actions);
    return {
      game,
      sourceFirstNormalTurnZoneDigest:observed.firstNormalTurnZoneDigest,
      initialPrizes:observed.firstNormalTurnPrizeGate,
      sourceOddishFirst:observed.first.sourceOddishOnBench,
      sourceAORFirst:observed.first.aor,
      sourceBUSFirst:observed.first.bus,
      sourceBUSActiveFirst:observed.first.busActive,
      sourceDualFirst:observed.first.dual,
      sourceStageLineCountMax:observed.max.sourceStageLineSlots,
      trace:observed.result.trace,itemAudit,promptAudit
    };
  }
  const original=arm(false),oddish=arm(true);
  assert.equal(original.sourceFirstNormalTurnZoneDigest,
    oddish.sourceFirstNormalTurnZoneDigest);
  assert.deepEqual(original.initialPrizes,oddish.initialPrizes);
  assert.deepEqual(original.game.deckHashes,oddish.game.deckHashes);
  assert.equal(original.itemAudit.attempts.length,1);
  assert.equal(oddish.itemAudit.attempts.length,1);
  assert.equal(original.itemAudit.attempts[0].valid,true);
  assert.equal(oddish.itemAudit.attempts[0].valid,true);
  assert.equal(oddish.promptAudit.attempts.length,1,
    'No actual native owner-deck Oddish prompt substitution');
  assert.deepEqual(oddish.promptAudit.attempts[0].offeredPrintedChoices,
    ['Oddish UNB','Oddish UNB']);
  assert.deepEqual(oddish.promptAudit.attempts[0].sourceSearchStageCounts,
    {oddish:2,gloom:2,aor:2,bus:1});
  const ownerSearch = x => x.trace.find(e=>
    e.promptWasOwnDeck&&e.previousPrompt==='ChooseCardsPrompt');
  const searchA=ownerSearch(original),searchB=ownerSearch(oddish);
  assert.ok(searchA&&searchB);
  assert.deepEqual(searchA.selectedPrintedCards,['Budew ASC','Buneary M2']);
  assert.deepEqual(searchB.selectedPrintedCards,['Oddish UNB','Oddish UNB']);
  assert.equal(searchA.rootOrdinal,searchB.rootOrdinal,
    'First native owner search shifted before prompt intervention');
  const beforeSearch=x=>x.trace.filter(e=>e.rootOrdinal<searchA.rootOrdinal);
  assert.deepEqual(beforeSearch(original),beforeSearch(oddish),
    'Prompt fork changed authentic Store prefix before K1 choice');
  assert.deepEqual(searchA.before,searchB.before);
  assert.ok(searchB.after.bench.filter(name=>name==='Oddish UNB').length===2,
    'Two real Oddish must enter the source Bench via native Poffin');
  const summarize=x=>({
    rootActions:x.game.actions,finished:x.game.finished,
    rootLedgerSHA256:sha(x.game.rootActionLedger),
    exactSourceTurnWindow:x.trace,
    firstOddishOnBench:x.sourceOddishFirst,
    aor:x.sourceAORFirst,bus:x.sourceBUSFirst,
    busActive:x.sourceBUSActiveFirst,dual:x.sourceDualFirst,
    maxSourceEvolutionSlots:x.sourceStageLineCountMax,
    sourceEvolutionDeclarations:x.game.attackDeclarationTrace.filter(e=>
      e.playerSlot===1&&e.attackName==='Evolution'),
    sourceHandPoffinOption:x.itemAudit.attempts,
    oddishOwnerPromptSubstitution:x.promptAudit?.attempts??[]
  });
  return {
    schema:'rank15-native-owner-k1-two-oddish-causal-prompt-fork-v1',
    evidence:'retrospective original-source exact physical same-deal native Store',
    sourceRank:15, sourceSeat:1,candidateSeat:0,seed,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourcePrintingCounts:source.cards.length,
    candidatePrintingCounts:candidate.length,
    identicalPrepolicyPhysicalZones:true,
    initialPrizes:original.initialPrizes,
    originalGenericPoffinPrompt:summarize(original),
    bothOddishAtOwnedPrompt:summarize(oddish),
    qualifications:{
      sourceDealRetrospectivelySelected:true,
      sourceBotCompetitivelyQualified:false,
      challengerBotCompetitivelyQualified:false,
      noCompetitiveWinMeasurements:true
    }
  };
}
if (require.main===module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
