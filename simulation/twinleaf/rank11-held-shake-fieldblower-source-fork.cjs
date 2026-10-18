'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');
const {withRank11HeldShake} = require('./rank11-held-shake-opener.cjs');
const {schedule} = require('./rank11-held-shake-source-screen.cjs');

const SOURCE_TRIAL_INDEX = 112;
const SOURCE_TRIAL = schedule(80, 160)[SOURCE_TRIAL_INDEX - 80];
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/** @param {string} name */
const engine = name => require(path.join(OUTPUT, name));

/**
 * Candidate player policy limited to a genuine first own turn with Field
 * Blower already in hand and a publicly equipped opposing Garbodor.
 * Never inspects either hidden deck, Prize cards or opponent hand.
 *
 * @template T
 * @param {0|1} candidateSeat
 * @param {()=>T} execute
 * @returns {{result:T,audit:object}}
 */
function withActualFieldBlower(candidateSeat, execute) {
  const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
  const {GamePhase} = engine('game/store/state/state');
  const {PlayCardAction, PlayerType, SlotType} =
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    engine('game/store/actions/resolve-prompt-action');
  const previous = SimpleTacticsAi.prototype.decodeNextAction;
  const candidateId = candidateSeat === 0 ? 101 : 202;
  const sourceSeat = 1 - candidateSeat;
  const actions = [];
  let stage = 0;
  let firstOwnHand = null;
  let sourceToolAtInitialSelection = null;
  let sourceToolStillAttachedAfter = null;
  let ownFieldBlowerInDiscardAfter = null;
  let abort = null;

  /** @param {object} state */
  const sourceGarbo = state => state.players[sourceSeat].bench.find(slot =>
    slot.getPokemonCard()?.name === 'Garbodor' && slot.tools.length > 0);

  SimpleTacticsAi.prototype.decodeNextAction = function chosenBlower(state) {
    const own = state.players.find(p => p.id === this.client?.id);
    if (!own || own.id !== candidateId) return previous.call(this, state);
    const pending = state.prompts.find(p => p.result === undefined);

    if (stage === 0 && state.turn === 2 &&
        state.activePlayer === candidateSeat &&
        state.phase === GamePhase.PLAYER_TURN && !pending) {
      const index = own.hand.cards.findIndex(card => card.name === 'Field Blower');
      const target = sourceGarbo(state);
      if (index >= 0 && target) {
        firstOwnHand = own.hand.cards.map(card => card.fullName);
        sourceToolAtInitialSelection = target.tools.map(c => c.fullName);
        stage = 1;
        actions.push({turn: state.turn, kind: 'actual-own-hand-Item',
          card: own.hand.cards[index].fullName,
          publicTarget: 'opponent Benched Tool-Garbodor'});
        return new PlayCardAction(own.id, index, {
          player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
        });
      }
    }
    if (stage === 1 && pending?.constructor.name === 'ChoosePokemonPrompt' &&
        pending.playerId === own.id) {
      const target = sourceGarbo(state);
      if (target && pending.validate([target], state) === true) {
        stage = 2;
        actions.push({turn:state.turn, kind:'real-owner-prompt-selection',
          selected: target.getPokemonCard()?.fullName,
          attachedTools: target.tools.map(c => c.fullName)});
        return new ResolvePromptAction(pending.id, [target]);
      }
      abort = {turn:state.turn, reason:'invalid-or-missing-public-garbo-target'};
    }
    if (stage === 2 && !pending && state.turn === 2) {
      sourceToolStillAttachedAfter = Boolean(sourceGarbo(state));
      ownFieldBlowerInDiscardAfter = own.discard.cards.some(c =>
        c.name === 'Field Blower');
      stage = 3;
    }
    return previous.call(this, state);
  };

  try {
    const result = execute();
    return {result, audit: {
      sourceSeat, candidateSeat, firstOwnHand, sourceToolAtInitialSelection,
      chosenRootActions:actions, completed:stage===3, abort,
      sourceToolStillAttachedAfter, ownFieldBlowerInDiscardAfter,
      qualifier:'Actual-source held-Item one-response counterfactual; ordinary actions remain weak pinned bots'
    }};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction = previous;
  }
}

/** @param {object} game @param {number} seat @param {number} turn */
function turnActions(game, seat, turn) {
  return game.decisionTrace.filter(row =>
    row.playerSlot === seat && row.turnBefore === turn).map(row => ({
    ordinal:row.actionOrdinal, turn:row.turnBefore,
    action:row.action, card:row.card ?? null,
    ability:row.ability ?? null, attack:row.attack ?? null,
    chosenCards:row.cardSelection?.selectedCards ?? null,
    ownHand:row.decisionHandBefore?.ownHandPrintings ?? null,
    boardAtPass:row.action==='PassTurnAction' ?
      row.publicBoardBeforePass ?? null : null
  }));
}

/** @param {object} game */
function terminal(game) {
  return {finished:game.finished,winner:game.winner,actions:game.actions,
    turns:game.turns,prizesRemaining:game.prizesRemaining,
    endReason:game.endReason??null};
}

/**
 * Same original pre-outcome source schedule, one source-dealt Item selected
 * from actual hand at observed legal candidate decision, no hidden-zone edit.
 */
function run() {
  assert.equal(SOURCE_TRIAL.trialId, 'held-shake:112');
  assert.equal(SOURCE_TRIAL.seed, 1496158721);
  assert.equal(SOURCE_TRIAL.sourceSeat, 0);
  const plan = planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source = plan.opponents.find(d => d.rank === 11);
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  assert.equal(plan.candidate.cards.length,60);
  const request = {
    deckA:source.cards, deckB:plan.candidate.cards,seed:SOURCE_TRIAL.seed,
    maxActions:170,strictPromptValidation:true,
    forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    label:'rank11-held-shake-source-112-Blower-one-Item-fork'
  };
  const controlWrapped = withRank11HeldShake(0,() => runMatch(request));
  const control=controlWrapped.result;
  const interventionWrapped=withRank11HeldShake(0,
    () => withActualFieldBlower(1, () => runMatch(request)));
  const intervened=interventionWrapped.result.result;
  const audit=interventionWrapped.result.audit;

  assert.equal(control.firstTurnSlot,0);
  assert.equal(intervened.firstTurnSlot,0);
  assert.equal(control.verifiedByDrawLog,true);
  assert.equal(intervened.verifiedByDrawLog,true);
  assert.deepEqual(intervened.deckHashes,control.deckHashes);
  assert.equal(controlWrapped.policyAudit.completeAtDecisionBoundary,true);
  assert.equal(interventionWrapped.policyAudit.completeAtDecisionBoundary,true);
  assert.deepEqual(intervened.decisionTrace.filter(r=>r.turnBefore<=1),
    control.decisionTrace.filter(r=>r.turnBefore<=1),
    'The genuine source opening and all its prompt decisions must stay unchanged');
  const first=turnActions(control,1,2);
  assert.ok(first.some(e=>e.action==='PassTurnAction' &&
    e.ownHand?.includes('Field Blower GRI')),
    'Original generic bot must pass with source-dealt Field Blower still held');
  assert.equal(audit.firstOwnHand?.includes('Field Blower GRI'),true);
  assert.deepEqual(audit.sourceToolAtInitialSelection,
    ['Forest Seal Stone SIT']);
  assert.equal(audit.chosenRootActions.length,2);
  assert.equal(audit.completed,true);
  assert.equal(audit.sourceToolStillAttachedAfter,false);
  assert.equal(audit.ownFieldBlowerInDiscardAfter,true);

  return {
    study:'same-source rank11 Tool-Garbodor versus one genuine printed rank1 Field Blower',
    sourceTrial:SOURCE_TRIAL,
    sourceManifestDigest:plan.manifestDigest,
    referenceDeckDigest:plan.candidateDigest,
    engineRevision:plan.engineRevision,
    controlDeckHashes:control.deckHashes,
    firstTurnIdentical:true,
    sourceFirstTurnLockWitness:interventionWrapped.policyAudit.witness,
    controlFirstCandidate: first,
    responseFirstCandidate:turnActions(intervened,1,2),
    sourceNextTurnControl:turnActions(control,0,3),
    sourceNextTurnIntervention:turnActions(intervened,0,3),
    originalEngineTerminal:terminal(control),
    oneItemEngineTerminal:terminal(intervened),
    intervention:audit,
    qualifiedForCompetitiveInference:false,
    caveat:'Conditional single-source actual Store Item/play and owner-target witness; '+
      'cannot infer best response or win rate from weak policy continuation'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={withActualFieldBlower,SOURCE_TRIAL,run};
