'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Capture acting-player resources that can explain an Energy-less attack
 * board. No deck identities, hidden Prizes or opponent private zones are read.
 *
 * This is an availability snapshot and cannot certify that an action was
 * legally playable against every lock and restriction in the current game.
 *
 * @param {object} state Actual actor-observable game state.
 * @param {object} owner The acting player.
 * @param {{superTypeEnergy:number,energyTypeBasic:number}} enums
 * @returns {object}
 */
function ownerEnergySnapshot(state, owner, enums) {
  const isEnergy = card => card?.superType === enums.superTypeEnergy;
  const printable = card => card?.fullName ?? card?.name ?? null;
  const energyNames = cards => cards.filter(isEnergy).map(printable);
  const active = owner.active;
  const activePokemon = active.getPokemonCard();
  const activeTools = active.tools.map(printable);
  const discardBasicEnergy = owner.discard.cards.filter(card =>
    isEnergy(card) && card.energyType === enums.energyTypeBasic);
  return {
    turn: state.turn,
    activePokemon: printable(activePokemon),
    activePowerglass: activeTools.some(name => name?.startsWith('Powerglass')),
    activeToolNames: activeTools,
    activeEnergyNames: energyNames(active.cards),
    heldEnergyNames: energyNames(owner.hand.cards),
    discardedBasicEnergyNames: discardBasicEnergy.map(printable),
    lastManualAttachmentTurn: owner.energyPlayedTurn,
    manualAttachmentUnspentByTurnFlag: owner.energyPlayedTurn < state.turn,
    nominalPowerglassResourceWindow: activeTools.some(name =>
      name?.startsWith('Powerglass')) && discardBasicEnergy.length > 0,
    ownerZonesOnly: true,
    canActuallyAttachOrAttack: 'unverified'
  };
}

/**
 * Preserve public attached-Energy occupancy of every owner's board slot.
 * Moving Energy between slots is different from reducing attached card count.
 *
 * @param {object} owner Acting player's public board.
 * @param {{superTypeEnergy:number}} enums
 * @returns {{slot:string,pokemon:string|null,energyNames:string[]}[]}
 */
function ownerBoardEnergy(owner, enums) {
  const slot = (location, pokemonList) => ({
    slot: location,
    pokemon: pokemonList.getPokemonCard()?.fullName ?? null,
    energyNames: pokemonList.cards.filter(c =>
      c?.superType === enums.superTypeEnergy).map(c => c.fullName)
  });
  return [slot('active', owner.active), ...owner.bench.map((x, index) =>
    slot('bench-' + index, x))];
}

/**
 * A genuinely dispatched Powerglass-looking native discard-attachment prompt
 * is distinguished from speculative prompt rescoring. This signature does
 * not prove which reducer created the prompt if a second card grants the
 * same action while Powerglass happens to be attached.
 *
 * @param {object} state The real Store state before the accepted root.
 * @param {object} action An intended native ResolvePromptAction.
 * @param {object} owner The acting owner.
 * @param {{slotActive:number,messageAttachActive:any}} enums
 * @returns {object|null}
 */
function powerglassPromptSnapshot(state, action, owner, enums) {
  if (action?.constructor?.name !== 'ResolvePromptAction') return null;
  if (!owner.active.tools.some(card => card?.name === 'Powerglass')) return null;
  const prompt = state.prompts.find(p => p.id === action.id &&
    p.playerId === owner.id && p.cardList === owner.discard &&
    p.message === enums.messageAttachActive &&
    p.slots?.includes(enums.slotActive));
  if (!prompt) return null;
  return {
    turn: state.turn, promptId: prompt.id, playerId: owner.id,
    discardBasicBefore: owner.discard.cards.filter(c =>
      c?.superType === enums.superTypeEnergy &&
      c.energyType === enums.energyTypeBasic).map(c => c.fullName),
    chosenEnergyNames: Array.isArray(action.result) ?
      action.result.map(choice => choice.card?.fullName ?? null) : [],
    selectedCount: Array.isArray(action.result) ? action.result.length : 0,
    sourceReducerIdentified: false,
    genuineNativeRoot: true
  };
}

/**
 * Install reversible, read-only root observation across both real normal-turn
 * decisions and accepted native Energy/Powerglass-like prompt outcomes.
 * Never changes the selected action, Store reducer or decision policy.
 *
 * @template T
 * @param {0|1} candidateSeat Real physical candidate seat.
 * @param {()=>T} execute Synchronous pinned headless game.
 * @param {{SimpleTacticsAi?:Function,Store?:Function,GamePhase?:object,
 *   SuperType?:object,EnergyType?:object,SlotType?:object,
 *   GameMessage?:object}} [deps] Test-only real-interface seam.
 * @returns {{result:T,audit:object}}
 */
function withOwnerEnergyWindowAudit(candidateSeat, execute, deps = {}) {
  assert.ok(candidateSeat === 0 || candidateSeat === 1);
  assert.equal(typeof execute, 'function');
  const engine = name => require(path.join(OUTPUT, name));
  const SimpleTacticsAi = deps.SimpleTacticsAi ??
    engine('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store = deps.Store ?? engine('game/store/store').Store;
  const GamePhase = deps.GamePhase ?? engine('game/store/state/state').GamePhase;
  const cardTypes = deps.SuperType && deps.EnergyType ? deps :
    engine('game/store/card/card-types');
  const SlotType = deps.SlotType ??
    engine('game/store/actions/play-card-action').SlotType;
  const GameMessage = deps.GameMessage ??
    engine('game/game-message').GameMessage;
  const enums = {
    superTypeEnergy: cardTypes.SuperType.ENERGY,
    energyTypeBasic: cardTypes.EnergyType.BASIC,
    slotActive: SlotType.ACTIVE,
    messageAttachActive: GameMessage.ATTACH_ENERGY_TO_ACTIVE
  };
  const originalDecode = SimpleTacticsAi.prototype.decodeNextAction;
  const originalDispatch = Object.getOwnPropertyDescriptor(Store.prototype,
    'dispatch');
  assert.equal(typeof originalDecode, 'function');
  assert.equal(typeof originalDispatch?.value, 'function');
  const ownerId = candidateSeat === 0 ? 101 : 202;
  const decisions = [];
  const nativeManualEnergy = [];
  const likelyPowerglassPrompts = [];
  const publicEnergyTransitions = [];
  let actual = null;

  function captureOwnerDecision(state) {
    const owner = state.players.find(p => p.id === this.client?.id);
    if (state === actual?.state && owner?.id === ownerId &&
        state.activePlayer === candidateSeat &&
        state.phase === GamePhase.PLAYER_TURN &&
        !state.prompts.some(p => p.result === undefined)) {
      decisions.push(ownerEnergySnapshot(state, owner, enums));
    }
    return originalDecode.call(this, state);
  }

  function captureRealDispatch(action) {
    if (!actual && action?.constructor?.name === 'AddPlayerAction') actual = this;
    const before = this === actual ? this.state : null;
    const turnBefore = before?.turn;
    const actorSeatBefore = before?.activePlayer;
    const owner = before?.players.find(p => p.id === ownerId);
    const boardEnergyBefore = owner ? ownerBoardEnergy(owner, enums) : null;
    const manual = before?.activePlayer === candidateSeat &&
      action?.constructor?.name === 'PlayCardAction' &&
      action.id === ownerId &&
      owner?.hand.cards[action.handIndex]?.superType === enums.superTypeEnergy ?
      {
        turn: before.turn,
        energyName: owner.hand.cards[action.handIndex].fullName,
        target: action.target,
        before: ownerEnergySnapshot(before, owner, enums)
      } : null;
    const likelyPrompt = owner && powerglassPromptSnapshot(
      before, action, owner, enums);
    const result = originalDispatch.value.call(this, action);
    if (boardEnergyBefore) {
      const afterOwner = this.state.players.find(p => p.id === ownerId);
      const boardEnergyAfter = ownerBoardEnergy(afterOwner, enums);
      if (JSON.stringify(boardEnergyBefore) !== JSON.stringify(boardEnergyAfter)) {
        const count = board => board.reduce((total, slot) =>
          total + slot.energyNames.length, 0);
        publicEnergyTransitions.push({
          turnBefore,
          actorSeat: actorSeatBefore,
          nativeAction: action.constructor.name,
          sourceCardAttribution: 'unverified-public-root-join-required',
          attachedCardDelta: count(boardEnergyAfter) - count(boardEnergyBefore),
          before: boardEnergyBefore,
          after: boardEnergyAfter,
          realStoreOnly: true
        });
      }
    }
    if (manual) {
      nativeManualEnergy.push({
        ...manual,
        after: ownerEnergySnapshot(this.state,
          this.state.players.find(p => p.id === ownerId), enums)
      });
    }
    if (likelyPrompt) {
      const afterOwner = this.state.players.find(p => p.id === ownerId);
      likelyPowerglassPrompts.push({
        ...likelyPrompt,
        discardBasicAfter: afterOwner.discard.cards.filter(c =>
          c.superType === enums.superTypeEnergy &&
          c.energyType === enums.energyTypeBasic).map(c => c.fullName),
        activeEnergyAfter: afterOwner.active.cards.filter(c =>
          c.superType === enums.superTypeEnergy).map(c => c.fullName)
      });
    }
    return result;
  }

  SimpleTacticsAi.prototype.decodeNextAction = captureOwnerDecision;
  Object.defineProperty(Store.prototype, 'dispatch',
    {...originalDispatch, value: captureRealDispatch});
  try {
    return {
      result: execute(),
      audit: {
        version: 'owner-energy-window-authentic-store-readonly-v1',
        candidateSeat,
        ownerRootDecisions: decisions.length,
        candidateOwnTurns: new Set(decisions.map(row => row.turn)).size,
        nativeManualEnergyAccepted: nativeManualEnergy.length,
        likelyPowerglassPromptAccepted: likelyPowerglassPrompts.length,
        publicEnergyTransitions: publicEnergyTransitions.length,
        decisions, nativeManualEnergy, likelyPowerglassPrompts,
        publicEnergyTransitionsLedger: publicEnergyTransitions,
        ownerHiddenPrizeAndDeckIdsRead: false,
        changesPolicyOrStore: false,
        qualifiesForCompetitiveInference: false
      }
    };
  } finally {
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,
      captureOwnerDecision, 'Lost owner decision hook');
    assert.equal(Store.prototype.dispatch, captureRealDispatch,
      'Lost authentic Store hook');
    SimpleTacticsAi.prototype.decodeNextAction = originalDecode;
    Object.defineProperty(Store.prototype, 'dispatch', originalDispatch);
  }
}

module.exports = {
  ownerEnergySnapshot,
  powerglassPromptSnapshot,
  ownerBoardEnergy,
  withOwnerEnergyWindowAudit
};
