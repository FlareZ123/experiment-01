'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {withRoxieDiscardEffectType}=
  require('./roxie-discard-type-hook.cjs');
const {withRoxieKoffingConfirmation}=
  require('./roxie-koffing-confirmation-policy.cjs');
const {roxieExposure}=require('./roxie-selection-evidence.cjs');
const {withPaperPromptContractPortfolio,VERSION:PAPER_VERSION}=
  require('./agent41-paper-prompt-contract-portfolio.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');

const VERSION='agent15-rank31-source-v8-retrospective-v1';
const SEED=1098062414;

/**
 * An archived seed deliberately known to reach real source rank31 Roxie.
 * Both arms keep all 60 printed cards, seed, actors and the 240-root cap.
 * Do not use these retrospective trials as independent matchup evidence.
 */
function replay() {
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const rank1=roster.decks.find(x=>x.rank===1);
  const rank31=roster.decks.find(x=>x.rank===31);
  assert(rank1&&rank31);
  assert.equal(deriveSlotSeeds(20261016,'published-field',31,0).A,SEED);
  assert.equal(rank31.cards.find(x=>x.name==='Roxie').count,4);
  assert.equal(rank31.cards.find(x=>x.name==='Koffing').count,3);
  initializeCards();
  const setup=planAichi({label:'champion-reference',cards:rank1.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=setup.opponents.find(x=>x.rank===31);
  assert.equal(setup.candidate.cards.length,60);
  assert.equal(source.status,'ready');
  assert.equal(source.cards.length,60);
  const request={
    deckA:setup.candidate.cards,deckB:source.cards,seed:SEED,
    label:VERSION,maxActions:240,strictPromptValidation:true,
    isolatePolicyRandomness:true,forestSealSearchCorrection:true,
    doubleDragonRecovery:true,supporterDecisionCorrection:true,
    leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
    entryDrawLockCorrection:true,grandTreeFirstTurnCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    captureDecisionTrace:true,captureRootConfirmationTrace:true
  };

  const rows=[];
  for(const mode of ['generic-decline','koffing-accept']) {
    let audited=null;
    try {
      const treatment=withPaperPromptContractPortfolio(()=>
        withRoxieDiscardEffectType(()=>mode==='koffing-accept'
          ?withRoxieKoffingConfirmation(()=>runMatch(request))
          :runMatch(request)),{
        requireLiveStore:true,
        currentTrialId:()=>mode,
        exampleLimit:32
      });
      audited=treatment.audit;
      const game=mode==='koffing-accept'
        ?treatment.result.value:treatment.result;
      const selection=roxieExposure(game,1);
      rows.push({mode,status:'returned-native-Store',paper:{
        schema:audited.schema,attempted:audited.resolvedNativeReplies,
        accepted:audited.nativeAccepted,invalid:audited.vetoedBeforeDispatch,
        roxiePaymentPrompts:audited.inspectedRoxiePaymentPrompts,
        statusCounts:audited.statusCounts,byFamily:audited.byFamily,
        liveSourceTrialCount:audited.liveSourceTrialCount,
        auxiliaryPromptAttempts:audited.auxiliaryPromptAttempts,
        examplesTruncated:audited.examplesTruncated,
        examples:audited.examples,
      },printedSourceSeed:SEED,sourcePhysicalSeat:1,
      candidatePhysicalSeat:0,firstTurnSlot:game.firstTurnSlot,
      deckHashes:game.deckHashes,sourceRoxieRootPlays:selection.roxiePlays,
      sourceKoffingHandDiscards:selection.koffingHandDiscards,
      actualKoffingConfirmation:game.rootConfirmationTrace
        .filter(x=>x.seat===1&&x.turn===7&&
          x.message==='WANT_TO_USE_ABILITY'),
      completed:game.finished,actions:game.actions,turns:game.turns,
      prizesRemaining:game.prizesRemaining,
      winnerUnqualified:game.winner??null});
    } catch(error) {
      audited=error?.agent41UnifiedPaperPromptPortfolio??null;
      rows.push({mode,status:'paper-veto-or-native-abort',
        error:String(error?.message??error),
        paper:audited?{
          schema:audited.schema,attempted:audited.resolvedNativeReplies,
          accepted:audited.nativeAccepted,invalid:audited.vetoedBeforeDispatch,
          roxiePaymentPrompts:audited.inspectedRoxiePaymentPrompts,
          statusCounts:audited.statusCounts,byFamily:audited.byFamily,
          liveSourceTrialCount:audited.liveSourceTrialCount,
          auxiliaryPromptAttempts:audited.auxiliaryPromptAttempts,
          firstByStatus:audited.firstByStatus
        }:null,
        printedSourceSeed:SEED,sourcePhysicalSeat:1,
        competitiveQualified:false});
    }
  }
  const completedNativeRows=rows.filter(x=>x.status==='returned-native-Store');
  return {version:VERSION,paperPortfolioVersion:PAPER_VERSION,
    historicalSourceMechanism:'agent43-rank31-koffing-root-confirmation-pair',
    preregistered:false,retrospective:true,
    sourceRank:31,referenceRank:1,
    unchangedSourcePrinted60:true,unchangedCandidatePrinted60:true,
    rows,returnedNativeRows:completedNativeRows.length,
    paperQualifiedGames:0,competitiveQualifiedGames:0,
    status:completedNativeRows.length===2&&
      completedNativeRows.every(x=>
        x.sourceKoffingHandDiscards.length===1&&
        x.paper.roxiePaymentPrompts>=1)?
      'historical-source-v8-payment-reached':'historical-source-v8-incomplete',
    caveat:'Retrospective selected original-source Store root; real submitted prompts checked by opt-in v8, with all other paper, opponent-policy and clock gates open.'};
}

if(require.main===module) {
  const out=replay();
  process.stdout.write(JSON.stringify(out,null,2)+'\n');
  if(out.status!=='historical-source-v8-payment-reached')
    process.exitCode=2;
}
module.exports={VERSION,replay};
