'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runWithResearchProfile,EXPANDED_SOURCE_PROFILE}=
  require('./policy-profiles.cjs');

const SEED=20261024;
const SOURCE_SEAT=1;
const ROOT_CHOICE_ORDINAL=47;

/** @param {unknown} value */
const digest=value=>createHash('sha256').update(
  JSON.stringify(value)).digest('hex');

/**
 * Development-only replay of an already observed source-dealt choice.
 * The second arm adds owner-visible read-only context to the original
 * Gladion root observer. The exact full decks, seed, policies and actions
 * are otherwise unchanged. This was selected retrospectively and cannot
 * enter a competitive outcome denominator.
 * @returns {object}
 */
function runAudit(){
  const file=path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json');
  const source=resolveManifestFile(file,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const decks=new Map(source.decks.map(row=>[row.rank,row]));
  const reference=decks.get(1),rank2=decks.get(2);
  assert.ok(reference?.playableUnderEngine&&rank2?.playableUnderEngine);
  assert.equal(rank2.cardIds.length,60);
  assert.equal(reference.cardIds.length,60);

  const request={
    deckA:reference.cardIds,deckB:rank2.cardIds,
    seed:SEED,maxActions:300,
    strictPromptValidation:true,grandTreeFirstTurnCorrection:true,
    captureDecisionTrace:true,captureGladionRootPrizeChoices:true,
    label:'Frozen source rank2 Gladion root exposure'
  };
  const baseline=runWithResearchProfile(
    request,EXPANDED_SOURCE_PROFILE);
  const observed=runWithResearchProfile({
    ...request,captureGladionRootChoiceContext:true
  },EXPANDED_SOURCE_PROFILE);

  const fields=[
    'deckHashes','firstTurnSlot','verifiedByDrawLog','rootActionLedger',
    'cardsPlayedBySeat','attackDeclarationTrace',
    'actions','turns','finished','winner','endReason','prizesRemaining'
  ];
  for(const field of fields){
    assert.deepEqual(observed[field],baseline[field],
      'A read-only context observer changed live result field '+field);
  }
  const stripped=observed.gladionRootPrizeChoices.map((choice)=>{
    const {ownerVisibleContext,...same}=choice;
    return same;
  });
  assert.deepEqual(stripped,baseline.gladionRootPrizeChoices,
    'Existing root Prize-choice evidence changed when context added');
  assert.equal(observed.firstTurnSlot,SOURCE_SEAT);
  const context=observed.gladionRootPrizeChoices.find(choice=>
    choice.actionOrdinal===ROOT_CHOICE_ORDINAL);
  assert.ok(context,'Original first source turn-5 Gladion event is missing');
  assert.equal(context.seat,SOURCE_SEAT);
  assert.equal(context.turn,5);
  assert.equal(context.selectedPrinting,'Relicanth TEF');
  assert.ok(context.revealedPrizes.some(prize=>
    prize.printing==='Technical Machine: Evolution PAR'));
  assert.ok(context.ownerVisibleContext,'Root owner context is missing');

  const beforeRoot=observed.rootActionLedger.filter(row=>
    row.actionOrdinal<ROOT_CHOICE_ORDINAL &&
    row.playerSlot===SOURCE_SEAT &&
    row.action!=='ResolvePromptAction');
  const earlierLillipupPlays=beforeRoot.filter(row=>
    row.card==='Lillipup');
  const afterRoot=observed.rootActionLedger.filter(row=>
    row.actionOrdinal>ROOT_CHOICE_ORDINAL);
  const nextOwnAction=afterRoot.find(row=>
    row.playerSlot===SOURCE_SEAT&&
    row.action!=='ResolvePromptAction');
  const nextOpponentAction=afterRoot.find(row=>
    row.playerSlot!==SOURCE_SEAT&&
    row.action!=='ResolvePromptAction');

  return {
    schema:'agent24-rank2-actual-gladion-owner-context-development-v1',
    mode:'retrospectively-selected-physical-source-development-only',
    seed:SEED,sourceSeat:SOURCE_SEAT,
    originalRank1PrintingCount:reference.cardIds.length,
    originalRank2PrintingCount:rank2.cardIds.length,
    sourceDeckHashes:observed.deckHashes,
    actualFirstTurnSlot:observed.firstTurnSlot,
    engine:observed.engine,profile:observed.researchPolicyProfile,
    observedActionOrdinal:context.actionOrdinal,
    observedTurn:context.turn,
    chosenPrize:context.selectedPrinting,
    visiblePrizeAlternatives:context.revealedPrizes,
    ownerVisibleContext:context.ownerVisibleContext,
    ownPriorRootActions:beforeRoot,
    priorLillipupPlayActions:earlierLillipupPlays,
    immediateNextOwnNonpromptAction:nextOwnAction??null,
    firstSubsequentOpponentNonpromptAction:nextOpponentAction??null,
    fullRootActionLedgerSha256:digest(baseline.rootActionLedger),
    matchedUntouchedRootLedger:true,
    matchedUntouchedOutcome:true,
    gameEngineFinished:baseline.finished,
    rootActionCount:baseline.actions,
    qualifiedCompetitiveGames:0,
    caveat:'Owner-known hand/public board at a retrospectively selected source-dealt Gladion root. This neither establishes a better Prize choice nor fixes the generic opponent policy, match clock or printing fidelity.'
  };
}
if(require.main===module){
  process.stdout.write(JSON.stringify(runAudit(),null,2)+'\n');
}
module.exports={runAudit,SEED,SOURCE_SEAT,ROOT_CHOICE_ORDINAL};
