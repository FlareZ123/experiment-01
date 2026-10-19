'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runWithResearchProfile,RANK11_AUTONOMOUS_PROFILE}=
  require('./policy-profiles.cjs');
const {withNewMoonBlowerAutonomy}=
  require('./newmoon-garbotoxin-blower-autonomy.cjs');
const {withOwnerDeckSearchWitness}=require('./owner-deck-search-witness.cjs');

/**
 * Retrospective read-only actual source replay. Reports owner hand, public
 * board and search targets only after the owner receives a legal full-deck
 * ChooseCardsPrompt. No candidate policy actions are changed.
 */
function run(){
  const candidate=loadNewMoonCandidate();
  const plan=planAichi({label:candidate.id,cards:candidate.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(row=>row.rank===11);
  assert.equal(source?.status,'ready');
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(source.cards.length,60);
  const seed=deriveSlotSeeds(20261018,'pilot',11,1).B;
  assert.equal(seed,599726095);
  const request={
    deckA:source.cards,deckB:plan.candidate.cards,seed,maxActions:200,
    rank11SourceSeat:0,strictPromptValidation:true,
    forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    captureCopycatTurnStartSeat:1,newMoonOpeningHorrorHouseSeat:1,
    newMoonAttackPayloadCompressorSeat:1,
    label:'newmoon-rank11-CompressorPayload-v1'
  };
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(output,'game/store/store'));
  const traced=withOwnerDeckSearchWitness(Store,1,[
    'Mewtwo & Mew-GX UNM','Gengar & Mimikyu-GX TEU',
    'Trevenant & Dusknoir-GX SMP'
  ],()=>withNewMoonBlowerAutonomy(1,()=>
    runWithResearchProfile(request,RANK11_AUTONOMOUS_PROFILE)));
  const game=traced.result.result;
  assert.equal(game.seed,seed);
  assert.equal(game.verifiedByDrawLog,true);
  assert.deepEqual(game.rules?.format,'EXPANDED');
  const firstOwnTurn=(game.copycatTurnStartEvidence||[]).find(
    row=>row.turn===2);
  const ownDecisions=game.decisionTrace.filter(row=>
    row.playerSlot===1&&row.turnBefore<=4).map(row=>({
      ordinal:row.actionOrdinal,turn:row.turnBefore,
      action:row.action,card:row.card??null,
      ownHandBefore:row.decisionHandBefore?.ownHandPrintings??null,
      selectedCards:row.cardSelection?.selectedCards??null
    }));
  return {
    schema:'agent47-rank11-owner-search-readonly-repeat1-v1',
    evidenceClass:'post-hoc historical source-state diagnostic',
    qualifiedForCompetitiveInference:false,
    sourceRank:11,physicalSourceSeat:0,candidateSeat:1,seed,
    enginePin:plan.engineRevision,printedCandidateHash:candidate.proxyIdCountHash,
    sourcePrintedDeckHashes:game.deckHashes,
    actualStartingSeat:game.firstTurnSlot,
    firstOwnTurn: firstOwnTurn?{
      turn:firstOwnTurn.turn,ownHand:firstOwnTurn.candidateHand,
      active:firstOwnTurn.board[1]?.active?.name??null,
      bench:firstOwnTurn.board[1]?.bench?.map(slot=>slot?.name??null)??[],
      ownDiscard:firstOwnTurn.candidateDiscard
    }:null,
    legalOwnerDeckSearches:traced.events,
    ownTurn2And4Decisions:ownDecisions,
    gameOutcomeUnqualified:{finished:game.finished,winner:game.winner,
      actions:game.actions,prizesRemaining:game.prizesRemaining},
    caveat:'Owner-deck printing counts only inspected during authentic unresolved ChooseCardsPrompt; this is not a policy intervention or proof of alternative optimal play.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
