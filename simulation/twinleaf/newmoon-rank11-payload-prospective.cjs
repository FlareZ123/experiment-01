'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {loadNewMoonCandidate} =
  require('../../scripts/aichi-new-moon-candidate.cjs');
const {deriveSlotSeeds} =
  require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runWithResearchProfile,RANK11_AUTONOMOUS_PROFILE} =
  require('./policy-profiles.cjs');
const {withNewMoonBlowerAutonomy} =
  require('./newmoon-garbotoxin-blower-autonomy.cjs');

const RANK = 11;
const CANDIDATE_SEAT = 1;
const SOURCE_SEAT = 0;
const SEED_BASE = 20261018;
const REPEATS = 12;

/** @param {object} game @returns {object} */
function observations(game) {
  const own = game.decisionTrace.filter(row =>
    row.playerSlot === CANDIDATE_SEAT);
  return {
    actualStartingSeat:game.firstTurnSlot,
    verifiedByDrawLog:game.verifiedByDrawLog,
    deckHashes:game.deckHashes,
    rootActions:game.actions,turns:game.turns,
    finished:game.finished,engineWinner:game.winner,
    prizesRemaining:game.prizesRemaining,
    sourceOpener:game.rank11AutonomousPolicy,
    compressorPlays:own.filter(row=>row.action==='PlayCardAction' &&
      row.card==='Battle Compressor').map(row=>({
        ordinal:row.actionOrdinal,turn:row.turnBefore
      })),
    payloadDiscards:own.filter(row=>row.action==='ResolvePromptAction' &&
      row.cardSelection?.selectedCards?.some(name =>
        name.startsWith('Gengar & Mimikyu-GX') ||
        name.startsWith('Trevenant & Dusknoir-GX'))).map(row=>({
        ordinal:row.actionOrdinal,turn:row.turnBefore,
        cards:row.cardSelection.selectedCards
      })),
    nativeOrCopiedAttacks:game.attackDeclarationTrace.filter(row =>
      row.playerSlot===CANDIDATE_SEAT).map(row=>({
        turn:row.turnBefore,action:row.triggerAction,
        name:row.attackName,result:row.resolutionStatus
      })),
    firstOwnTurnStates:(game.copycatTurnStartEvidence||[]).slice(0,5)
      .map(row=>({
        turn:row.turn,
        active:row.board[CANDIDATE_SEAT]?.active?.name??null,
        gengarAccessible:row.candidateDiscard?.some(name=>
          name.startsWith('Gengar & Mimikyu-GX')) ||
          row.board[CANDIDATE_SEAT]?.bench?.some(slot =>
            slot.name==='Gengar & Mimikyu-GX') || false,
        heldCompressor:row.candidateHand?.some(name=>
          name.startsWith('Battle Compressor')) || false
      })),
    policy:game.policy
  };
}

/** @param {string[]} candidate @param {string[]} opponent @param {number} seed @param {boolean} payload */
function arm(candidate,opponent,seed,payload) {
  const request={
    deckA:opponent,deckB:candidate,seed,maxActions:200,
    rank11SourceSeat:SOURCE_SEAT,
    strictPromptValidation:true,
    forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true,
    captureCopycatTurnStartSeat:CANDIDATE_SEAT,
    newMoonOpeningHorrorHouseSeat:CANDIDATE_SEAT,
    ...(payload ? {newMoonAttackPayloadCompressorSeat:CANDIDATE_SEAT} : {}),
    label:payload?'newmoon-rank11-CompressorPayload-v1':'newmoon-rank11-samePolicyControl-v1'
  };
  const run=()=>runWithResearchProfile(request,RANK11_AUTONOMOUS_PROFILE);
  try {
    const {result,policyAudit}=withNewMoonBlowerAutonomy(CANDIDATE_SEAT,run);
    return {ok:true,observations:observations(result),blowerAudit:{
      selected:policyAudit.opportunitySelections,
      removed:policyAudit.confirmedToolRemovals
    }};
  } catch(error) {
    return {ok:false,error:String(error?.stack||error),
      qualifiedForCompetitiveInference:false};
  }
}

function run() {
  const candidate=loadNewMoonCandidate();
  const plan=planAichi({label:candidate.id,cards:candidate.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(x=>x.rank===RANK);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  assert.equal(plan.candidate.cards.length,60);
  const rows=[];
  for(let repeat=0;repeat<REPEATS;repeat++) {
    const seed=deriveSlotSeeds(SEED_BASE,'pilot',RANK,repeat).B;
    const control=arm(plan.candidate.cards,opponent.cards,seed,false);
    const payload=arm(plan.candidate.cards,opponent.cards,seed,true);
    if(control.ok&&payload.ok) {
      assert.deepEqual(control.observations.deckHashes,
        payload.observations.deckHashes,
        'Physical input order drift between policy arms');
      assert.equal(control.observations.actualStartingSeat,
        payload.observations.actualStartingSeat,
        'Same source deal changed who genuinely starts');
    }
    rows.push({repeat,seed,control,payload,
      qualifiedForCompetitiveInference:false});
  }
  return {
    schema:'newmoon-rank11-prospective-compressor-attack-source-v1',
    printedSourceRank:RANK,candidateSeat:CANDIDATE_SEAT,
    sourceSeat:SOURCE_SEAT,seedBase:SEED_BASE,repeats:REPEATS,
    seedProtocol:'decorrelated-slots-v3; fixed repeats 0 through 11, all retained',
    candidatePrintHash:candidate.proxyIdCountHash,
    engineRevision:plan.engineRevision,
    policyComparison:'same printed 60, same source/opponent policy, same opener seed; only candidate Compressor payload tactic differs',
    notes:'Potential Store/copy errors, opponent action quality and clock unqualified. No seed-screening, no competitive win-rate claim.',
    qualifiedCompetitiveGames:0,
    rows
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,observations,arm};
