'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=
  require('./headless.cjs');
const {observeSourceLock}=
  require('./newmoon-rank15-source-duallock-census.cjs');
const {withOwnerRootChoiceWindow}=
  require('./owner-root-choice-window.cjs');
const {withRank15PaidTmPoffin}=
  require('./rank15-paid-tm-poffin-source-policy.cjs');
const {withRank15OddishPoffinPrompt}=
  require('./rank15-poffin-oddish-prompt-fork.cjs');
const {withNativeRank15BarrageConsent,VERSION:CONSENT_VERSION}=
  require('./agent40-rank15-native-barrage-consent-fork.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=
  require('./new-moon-lockbreak-source-diagnostic.cjs');
const {deriveSlotSeeds}=
  require('../../scripts/aichi-decorrelated-seeds.cjs');

const VERSION='agent40-rank15-retrospective-oddish-barrage-paired-fork-v1';
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * One authentic original rank15 source deal with both comparators making
 * identical owner-legal Item and K1 two-Oddish choices; only the native
 * Barrage Confirm prompt response differs. Retrospectively selected seed.
 * @returns {object}
 */
function run(){
  const manager=initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const field=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const source=field.opponents.find(x=>x.rank===15);
  const candidate=pairedCandidateSlots().lockbreak;
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  assert.equal(candidate.length,60);
  const sourceCards=source.cards.map(name=>manager.getCardByName(name));
  assert.ok(sourceCards.every(Boolean));
  const seed=deriveSlotSeeds(20261018,'pilot',15,0).A;
  assert.equal(seed,3050400820);
  const request={
    deckA:candidate,deckB:source.cards,seed,maxActions:260,
    label:'agent40-rank15-original-same-deal-native-omega-barrage-confirm',
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,leleEntryAbilityLockCorrection:true,
    entryDrawLockCorrection:true,isolatePolicyRandomness:true,
    pendingEndTurnSwitchCleanupCorrection:true,captureDecisionTrace:true,
    bunnelbyK0SafeEvolution:true,bunnelbyObservedK1:true,
    bunnelbyTargetAwareEvolution:true,bunnelbyGuzmaHalaMode1:true,
    bunnelbyGuzmaHalaSearch:true
  };

  function arm(consent){
    let itemAudit=null,oddishAudit=null,consentAudit=null;
    const observed=observeSourceLock(Store,1,0,()=>
      withOwnerRootChoiceWindow(Store,1,()=>{
        const action=()=>{
          const r=withRank15PaidTmPoffin(()=>runMatch(request),1);
          itemAudit=r.audit;
          return r.result;
        };
        const ownedPrompt=()=>{
          const r=withRank15OddishPoffinPrompt(action,1);
          oddishAudit=r.audit;
          return r.result;
        };
        if(!consent)return ownedPrompt();
        const r=withNativeRank15BarrageConsent(ownedPrompt,1,sourceCards);
        consentAudit=r.audit;
        return r.result;
      },{turnStart:16,turnEnd:16}));
    const game=observed.result.result;
    assert.equal(game.verifiedByDrawLog,true);
    assert.equal(game.firstTurnSlot,0);
    assert.equal(game.rootActionLedger.length,game.actions);
    assert.equal(itemAudit.attempts.length,1);
    assert.equal(itemAudit.attempts[0].valid,true);
    assert.equal(oddishAudit.attempts.length,1);
    const sourceEvolution=game.attackDeclarationTrace.filter(
      x=>x.playerSlot===1&&x.attackName==='Evolution');
    return {
      game,
      identicalFirstNormalTurnZoneDigest:
        observed.firstNormalTurnZoneDigest,
      initialSourcePrizeGate:observed.firstNormalTurnPrizeGate,
      trace:observed.result.trace,
      stages:{
        oddish:observed.first.sourceOddishOnBench,
        aor:observed.first.aor,bus:observed.first.bus,
        busActive:observed.first.busActive,dual:observed.first.dual
      },
      sourceEvolution,
      itemAudit,oddishAudit,consentAudit
    };
  }
  const defaultConsent=arm(false),affirmative=arm(true);
  assert.equal(defaultConsent.identicalFirstNormalTurnZoneDigest,
    affirmative.identicalFirstNormalTurnZoneDigest);
  assert.deepEqual(defaultConsent.initialSourcePrizeGate,
    affirmative.initialSourcePrizeGate);
  assert.deepEqual(defaultConsent.game.deckHashes,affirmative.game.deckHashes);
  assert.deepEqual(
    defaultConsent.oddishAudit.attempts,
    affirmative.oddishAudit.attempts,
    'Genuine own-deck K1 two-Oddish selection changed between arms');
  assert.ok(affirmative.consentAudit);
  assert.equal(affirmative.consentAudit.proposed,1);
  assert.equal(affirmative.consentAudit.accepted,1);
  const summarize=r=>({
    capActions:260,finished:r.game.finished,
    nativeActionCount:r.game.actions,
    rootLedgerSHA256:sha(r.game.rootActionLedger),
    initialZoneDigest:r.identicalFirstNormalTurnZoneDigest,
    firstSourceStageTurns:r.stages,
    sourceEvolution:r.sourceEvolution,
    ownerPoffinAttempt:r.itemAudit.attempts,
    ownerOddishDecision:r.oddishAudit.attempts,
    ownerBarrageConsent:r.consentAudit,
    firstTurnSourceContext:r.trace,
    zeroCompetitiveQualifiedGames:true
  });
  return {
    schema:VERSION,consentPolicy:CONSENT_VERSION,
    sourceRank:15,sourceSeat:1,candidateSeat:0,seed,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceSixtyVerified:60,candidateSixtyVerified:60,
    sameActualOriginalSourceDeal:true,
    originalBotConsent:summarize(defaultConsent),
    affirmativeOwnerBarrage:summarize(affirmative),
    evidenceClass:'retrospectively selected one-deal actual native Store policy counterfactual',
    competitiveQualifiedGames:0,
    caveat:'Unqualified source and candidate bot; T16 retrospectively selected; two small actor-owned prompt interventions shared and only consent differs; no matchup win-rate inference.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,run};
