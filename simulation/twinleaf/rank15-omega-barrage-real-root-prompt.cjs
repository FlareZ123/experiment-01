'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=
  require('./new-moon-lockbreak-source-diagnostic.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {withRank15PaidTmPoffin}=
  require('./rank15-paid-tm-poffin-source-policy.cjs');
const {withRank15OddishPoffinPrompt}=
  require('./rank15-poffin-oddish-prompt-fork.cjs');
const {withRank15BarragePromptWitness}=
  require('./rank15-barrage-root-confirm-observer.cjs');

const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const ARCHIVED_ODDISH_ROOT_LEDGER_SHA256=
  '02c7a7db738de179d7146efcb3e06642327a1bcb670aea41942a0c9ba96a11bc';

/** Unchanged original physical deal, plus root-only scalar prompt observation. */
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
  assert.equal(seed,3050400820);
  const request={
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
  let poffin,search;
  const observed=withRank15BarragePromptWitness(Store,1,()=>{
    const oddish=withRank15OddishPoffinPrompt(()=>{
      const native=withRank15PaidTmPoffin(()=>runMatch(request),1);
      poffin=native.audit;
      return native.result;
    },1);
    search=oddish.audit;
    return oddish.result;
  });
  const game=observed.result;
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.firstTurnSlot,0);
  assert.deepEqual(game.deckHashes.length,2);
  assert.equal(digest(game.rootActionLedger),ARCHIVED_ODDISH_ROOT_LEDGER_SHA256,
    'Read-only prompt witness changed or could not reproduce original source root decisions');
  assert.equal(poffin.attempts.length,1);
  assert.equal(search.attempts.length,1);
  assert.equal(game.attackDeclarationTrace.filter(x=>
    x.playerSlot===1&&x.attackName==='Evolution').length,1);
  return {
    schema:'rank15-omega-barrage-post-tm-real-root-prompt-witness-v1',
    sourceRank:15,seed,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    exactPriorOddishRootLedgerSHA256:ARCHIVED_ODDISH_ROOT_LEDGER_SHA256,
    genuinelyReadOnlyRootReplay:true,
    sourceFirst:game.firstTurnSlot===1,
    totalActualRootActions:game.actions,
    rootBarragePromptEvents:observed.events,
    sourceEvolutionDeclarations:game.attackDeclarationTrace.filter(x=>
      x.playerSlot===1&&x.attackName==='Evolution'),
    ownerPoffinAttempt:poffin.attempts,
    ownerOddishPromptChoice:search.attempts,
    qualifications:{mechanicsAndPolicyPromptDiagnosticOnly:true,
      competitiveGamesQualified:0}
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
