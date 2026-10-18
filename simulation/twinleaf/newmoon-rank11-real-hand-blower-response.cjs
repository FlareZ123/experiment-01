'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {loadNewMoonCandidate} = require('../../scripts/aichi-new-moon-candidate.cjs');
const {runWithResearchProfile, RANK11_AUTONOMOUS_PROFILE} =
  require('./policy-profiles.cjs');

const SEED = 1244180408;
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/** @param {string} name */
const engine = name => require(path.join(OUTPUT, name));

/**
 * A single reproducible, owner-information-set source-response fork.
 * Ordinary decisions still belong to the pinned bots. Only one exact
 * first-turn Blower PlayCardAction and its legal target prompt are selected.
 * No hand/deck/prize edits or cards from outside the actual 60 take place.
 *
 * @template T
 * @param {0|1} candidateSeat
 * @param {()=>T} execute
 */
function withFirstAvailableBlower(candidateSeat, execute) {
  const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
  const {GamePhase} = engine('game/store/state/state');
  const {PlayCardAction,PlayerType,SlotType} =
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    engine('game/store/actions/resolve-prompt-action');
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const candidateId = candidateSeat === 0 ? 101 : 202;
  const sourceSeat = 1 - candidateSeat;
  let stage = 0;
  const selected = [];
  let firstOwnHand = null;
  let targetStillEquipped = null;

  /** @param {object} state */
  const targetSlot = state => state.players[sourceSeat].bench.find(slot =>
    slot.getPokemonCard()?.name === 'Garbodor' &&
    slot.tools.some(tool => tool.name === 'Float Stone'));

  SimpleTacticsAi.prototype.decodeNextAction = function response(state) {
    const own = state.players.find(p => p.id === this.client?.id);
    if (!own || own.id !== candidateId) {
      return original.call(this, state);
    }
    if (stage === 0 && state.turn === 2 &&
        state.activePlayer === candidateSeat &&
        state.phase === GamePhase.PLAYER_TURN &&
        !state.prompts.some(prompt => prompt.result === undefined)) {
      const index = own.hand.cards.findIndex(card => card.name === 'Field Blower');
      const target = targetSlot(state);
      if (index >= 0 && target) {
        firstOwnHand = own.hand.cards.map(card => card.fullName);
        stage = 1;
        selected.push({turn:state.turn,kind:'real-hand-Item',
          card:own.hand.cards[index].fullName,target:'Garbodor with Float Stone'});
        return new PlayCardAction(own.id,index,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0
        });
      }
    }
    if (stage === 1) {
      const prompt = state.prompts.find(p => p.result === undefined);
      if (prompt?.constructor.name === 'ChoosePokemonPrompt' &&
          prompt.playerId === own.id) {
        const target = targetSlot(state);
        if (target && prompt.validate([target],state)) {
          stage = 2;
          selected.push({turn:state.turn,kind:'owner-prompt-Tool-selection',
            selected:'Garbodor with Float Stone'});
          return new ResolvePromptAction(prompt.id,[target]);
        }
      }
    }
    if (stage === 2 && state.turn === 2 &&
        state.activePlayer === candidateSeat &&
        !state.prompts.some(p => p.result === undefined)) {
      targetStillEquipped = Boolean(targetSlot(state));
      stage = 3;
    }
    return original.call(this,state);
  };

  try {
    const result = execute();
    return {result,audit:{
      version:'newmoon-own-hand-blower-first-response-v1',
      candidateSeat,sourceSeat,firstOwnHand,
      selectedActions:selected,completed:stage===3,
      garbodorFloatStoneStillAttached:targetStillEquipped,
      qualification:'One selected source-dealt Item response, never a competitive or autonomous candidate-policy certificate'
    }};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction = original;
  }
}

/** @param {object} game @param {number} seat @returns {object} */
function summary(game,seat) {
  return {
    sourceFirstTurn:game.firstTurnSlot,
    verifiedByDrawLog:game.verifiedByDrawLog,
    actions:game.actions,turns:game.turns,finished:game.finished,
    winner:game.winner,prizes:game.prizesRemaining,
    cardsPlayed:game.cardsPlayedBySeat[seat],
    candidateAttacks:game.attackTrace.filter(row => row.seat === seat),
    firstCandidateDecisions:game.decisionTrace.filter(row =>
      row.playerSlot === seat && row.turnBefore === 2).slice(0,25)
      .map(row => ({ordinal:row.actionOrdinal,action:row.action,
        card:row.card??null,ability:row.ability??null,
        selection:row.cardSelection?.selectedCards??null,
        hand:row.decisionHandBefore?.ownHandPrintings??null,
        boardBeforePass:row.action==='PassTurnAction'?
          row.publicBoardBeforePass??null:null}))
  };
}

function run() {
  const raw = loadNewMoonCandidate();
  const opts = {allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true};
  const plan = planAichi({label:raw.id,cards:raw.cards},opts);
  const opponent = plan.opponents.find(x => x.rank === 11);
  assert.equal(opponent?.status,'ready');
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(opponent.cards.length,60);
  const request = {
    deckA:opponent.cards,deckB:plan.candidate.cards,
    seed:SEED,maxActions:450,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    label:'newmoon-rank11-genuine-initial-Blower-response-v1',
    rank11SourceSeat:0
  };
  const baseline = runWithResearchProfile(request,RANK11_AUTONOMOUS_PROFILE);
  const altered = withFirstAvailableBlower(1,() =>
    runWithResearchProfile(request,RANK11_AUTONOMOUS_PROFILE));
  const after = altered.result;
  assert.equal(baseline.firstTurnSlot,0);
  assert.equal(baseline.verifiedByDrawLog,true);
  assert.equal(after.firstTurnSlot,0);
  assert.equal(after.verifiedByDrawLog,true);
  assert.deepEqual(after.deckHashes,baseline.deckHashes);
  assert.equal(baseline.rank11AutonomousPolicy?.completeAtDecisionBoundary,true);
  assert.equal(after.rank11AutonomousPolicy?.completeAtDecisionBoundary,true);
  assert.equal(altered.audit.selectedActions.length,2);
  assert.equal(altered.audit.completed,true);
  assert.equal(altered.audit.garbodorFloatStoneStillAttached,false);
  const opening = game => game.decisionTrace.filter(row =>
    row.turnBefore <= 1);
  assert.deepEqual(opening(after),opening(baseline),
    'Opt-in opponent-response did not preserve the actual first-turn source prefix');
  const baselineFirst = baseline.decisionTrace.filter(row =>
    row.playerSlot === 1 && row.turnBefore === 2);
  assert.ok(baselineFirst.some(row =>
    row.action === 'PassTurnAction' &&
    row.decisionHandBefore?.ownHandPrintings?.includes('Field Blower GRI')),
    'Natural candidate policy did not pass while holding the printed answer');
  return {
    study:'authentic rank11 autonomous Garbotoxin versus New Moon held-Field-Blower counterfactual',
    sourceRank:11,sourceSeed:SEED,candidate:raw.id,
    candidateIdCountHash:raw.proxyIdCountHash,
    engineRevision:plan.engineRevision,
    sourceFirstTurnUnchanged:true,sourceFirstTurnLineComplete:true,
    deckHashes:baseline.deckHashes,
    baseline:summary(baseline,1),
    oneResponse:summary(after,1),
    intervention:altered.audit,
    competitiveGamesQualified:0,paperRuleFidelityCertified:false,
    botCompetenceCertified:false,
    caveat:'One candidate-opt-in Item action from a true held card and one owner-valid Tool target; subsequent gameplay reverts to weak pinned bots; no win inference.'
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports = {run,withFirstAvailableBlower,SEED};
