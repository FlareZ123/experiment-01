'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/** @param {string} name */
const engine = name => require(path.join(output, name));

const MEWTWO = 'Mewtwo & Mew-GX UNM';
const BLOWER = 'Field Blower GRI';
const GARBODOR = 'Garbodor BKP';

/**
 * A deliberately narrow public/own-hand decision predicate. It does not
 * inspect the opposing hand, deck, or Prize cards, and makes no win claim.
 *
 * @param {object} state
 * @param {object} own
 * @param {object} opponent
 * @param {0|1} seat
 * @param {number} playerTurnPhase
 * @returns {boolean}
 */
function blowerOpportunity(state, own, opponent, seat, playerTurnPhase) {
  return state.activePlayer === seat &&
    state.phase === playerTurnPhase &&
    !state.prompts.some(prompt => prompt.result === undefined) &&
    own.active.getPokemonCard()?.fullName === MEWTWO &&
    own.hand.cards.some(card => card.fullName === BLOWER) &&
    opponent.bench.some(slot =>
      slot.getPokemonCard()?.fullName === GARBODOR &&
      slot.tools.length > 0);
}

/** @param {object} opponent */
function tooledGarbodor(opponent) {
  return opponent.bench.find(slot =>
    slot.getPokemonCard()?.fullName === GARBODOR &&
    slot.tools.length > 0);
}

/**
 * Versioned automatic, information-set-limited New Moon response to an
 * opposing Tool-dependent Garbotoxin board. It is invoked on every eligible
 * candidate decision, with no hard-coded seed, turn, or selected hand.
 * The original pinned bot decides all other actions. A selected action
 * passes the upstream Simulator legality filter before live Store dispatch.
 *
 * @template T
 * @param {0|1} candidateSeat
 * @param {()=>T} execute
 * @returns {{result:T,policyAudit:object}}
 */
function withNewMoonBlowerAutonomy(candidateSeat, execute) {
  if (![0,1].includes(candidateSeat) || typeof execute !== 'function') {
    throw new TypeError('Need candidate physical seat and synchronous game runner');
  }
  const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType} =
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    engine('game/store/actions/resolve-prompt-action');
  const {GamePhase} = engine('game/store/state/state');
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const candidateId = candidateSeat === 0 ? 101 : 202;
  const events = [];
  let phase = 'idle';
  let activeSelection = null;
  let lastObservedCandidateTurn = -1;

  const newMoonBlowerDecision = function (state) {
    const own = state.players.find(player => player.id === this.client?.id);
    if (!own || own.id !== candidateId) {
      return original.call(this, state);
    }
    const opponent = state.players[1-candidateSeat];
    const pending = state.prompts.find(prompt => prompt.result === undefined);
    if (state.activePlayer === candidateSeat &&
        state.phase === GamePhase.PLAYER_TURN && state.turn <= 8 &&
        state.turn !== lastObservedCandidateTurn && !pending) {
      lastObservedCandidateTurn = state.turn;
      const garbodor = opponent.bench.find(slot =>
        slot.getPokemonCard()?.fullName === GARBODOR);
      const payload = card => card?.fullName === 'Gengar & Mimikyu-GX TEU';
      events.push({
        turn: state.turn, kind: 'read-only-own-turn-board',
        garbodorVisible: Boolean(garbodor),
        garbodorToolPrintings: (garbodor?.tools || []).map(card => card.fullName),
        ownActive: own.active.getPokemonCard()?.fullName ?? null,
        ownActiveEnergyPrintings: own.active.energies.cards.map(card => card.fullName),
        ownGengarOnBench: own.bench.some(slot => payload(slot.getPokemonCard())),
        ownGengarInDiscard: own.discard.cards.some(payload)
      });
    }
    if (phase === 'choose') {
      const target = tooledGarbodor(opponent);
      if (pending?.constructor.name === 'ChoosePokemonPrompt' &&
          pending.playerId === own.id && target &&
          pending.validate([target], state)) {
        events.push({turn:state.turn,kind:'selected-own-prompt',
          card:'Field Blower',target:GARBODOR});
        phase = 'verify';
        return new ResolvePromptAction(pending.id,[target]);
      }
      if (!pending) {
        events.push({turn:state.turn,kind:'unresolved-Tool-prompt'});
        phase = 'idle';
      }
      return original.call(this,state);
    }
    if (phase === 'verify' && !pending) {
      events.push({turn:state.turn,kind:'public-Tool-check',
        garbodorToolRemoved:!tooledGarbodor(opponent)});
      phase = 'idle';
    }
    if (blowerOpportunity(state,own,opponent,candidateSeat,
      GamePhase.PLAYER_TURN)) {
      const index=own.hand.cards.findIndex(card => card.fullName === BLOWER);
      const action=new PlayCardAction(own.id,index,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      });
      if (this.isValidAction(state,action)) {
        activeSelection = {turn:state.turn,seat:candidateSeat,
          printedCard:own.hand.cards[index].fullName,
          opponentToolCount:tooledGarbodor(opponent).tools.length};
        events.push({turn:state.turn,kind:'autonomous-legal-Item',
          ...activeSelection});
        phase='choose';
        return action;
      }
      events.push({turn:state.turn,kind:'refused-by-pinned-legality-check',
        card:BLOWER});
    }
    return original.call(this,state);
  };
  SimpleTacticsAi.prototype.decodeNextAction = newMoonBlowerDecision;
  try {
    const result=execute();
    return {result,policyAudit:{
      version:'newmoon-garbotoxin-blower-autonomous-v1',
      candidateSeat,opponentSeat:1-candidateSeat,
      opportunitySelections:events.filter(x=>
        x.kind==='autonomous-legal-Item').length,
      confirmedToolRemovals:events.filter(x=>
        x.kind==='public-Tool-check'&&x.garbodorToolRemoved).length,
      phaseAtEnd:phase,events,
      targetInformation:'candidate own hand and opponent public Tool-bearing Garbodor only',
      strengthQualified:false
    }};
  } finally {
    if (SimpleTacticsAi.prototype.decodeNextAction !==
        newMoonBlowerDecision) {
      throw new Error('New Moon response adapter lost prototype ownership');
    }
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

module.exports={blowerOpportunity,tooledGarbodor,
  withNewMoonBlowerAutonomy,MEWTWO,BLOWER,GARBODOR};
