'use strict';

// Offline-only diagnostic projection. This module serializes private card zones
// and must never be imported by or passed to a player policy/actor observation.
const assert = require('node:assert/strict');
const { printing, visiblePokemon, publicPlayer } = require('./actor-observation-contract.cjs');

const DIAGNOSTIC_SCHEMA = 'twinleaf-full-state-diagnostic-v1';
const PRIVATE_VISIBILITY = 'private-offline-diagnostic-only';

function zoneCards(zone) {
  if (Array.isArray(zone)) return zone;
  if (Array.isArray(zone?.cards)) return zone.cards;
  return [];
}

function cardPrintings(zone) {
  return zoneCards(zone).map(printing);
}

function projectDiagnosticValue(value, seen = new WeakSet(), depth = 0) {
  if (value === null || value === undefined || typeof value === 'string' ||
      typeof value === 'number' || typeof value === 'boolean') return value ?? null;
  if (typeof value === 'bigint') return String(value);
  if (typeof value === 'symbol') return String(value);
  if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value.fullName === 'string') return { fullName: value.fullName };
  if (depth >= 6) return '[MaxDepth]';
  if (seen.has(value)) return '[Circular]';
  seen.add(value);
  let projected;
  if (Array.isArray(value)) {
    projected = value.map(item => projectDiagnosticValue(item, seen, depth + 1));
  } else if (value instanceof Map) {
    projected = [...value.entries()].map(([key, item]) => [
      projectDiagnosticValue(key, seen, depth + 1),
      projectDiagnosticValue(item, seen, depth + 1),
    ]);
  } else if (value instanceof Set) {
    projected = [...value.values()].map(item => projectDiagnosticValue(item, seen, depth + 1));
  } else {
    projected = {};
    for (const key of Object.keys(value).sort()) {
      if (['parent', 'store', 'dispatcher', 'eventEmitter', 'listeners', 'observer'].includes(key)) continue;
      const item = value[key];
      if (typeof item === 'function') continue;
      projected[key] = projectDiagnosticValue(item, seen, depth + 1);
    }
  }
  seen.delete(value);
  return projected;
}

function snapshotPrizeSlots(prizes) {
  assert.ok(Array.isArray(prizes), 'player.prizes must be an array of physical Prize slots');
  return prizes.map((slot, index) => ({
    slot: index + 1,
    cards: cardPrintings(slot),
  }));
}

function snapshotPrompt(prompt) {
  let perspectivePlayerId = null;
  if (typeof prompt?.getPerspectivePlayerId === 'function') {
    try { perspectivePlayerId = prompt.getPerspectivePlayerId(); }
    catch (error) { perspectivePlayerId = `[Error: ${String(error?.message ?? error)}]`; }
  }
  const fields = {};
  for (const key of [
    'message', 'text', 'min', 'max', 'minCards', 'maxCards', 'allowCancel',
    'cards', 'options', 'choices', 'targets', 'availableCards', 'eligibleCards',
    'selectedCards', 'result', 'playerId', 'id', 'type',
  ]) {
    if (Object.prototype.hasOwnProperty.call(prompt ?? {}, key)) {
      fields[key] = projectDiagnosticValue(prompt[key]);
    }
  }
  return {
    promptType: prompt?.constructor?.name ?? 'UnknownPrompt',
    id: prompt?.id ?? null,
    playerId: prompt?.playerId ?? perspectivePlayerId,
    pending: prompt?.result === undefined,
    perspectivePlayerId,
    fields,
  };
}

function snapshotPlayer(player, seat) {
  const publicView = publicPlayer(player);
  const zones = {
    // This is Twinleaf's native CardList.cards order. The serializer does not
    // assume whether index 0 is the top or bottom of the deck.
    deckArrayOrder: cardPrintings(player.deck),
    hand: cardPrintings(player.hand),
    prizes: snapshotPrizeSlots(player.prizes),
    discard: cardPrintings(player.discard),
    lostZone: cardPrintings(player.lostzone),
    stadium: cardPrintings(player.stadium),
    resolvingSupporter: cardPrintings(player.supporter),
  };
  return {
    seat,
    playerId: player.id ?? null,
    name: player.name ?? null,
    board: {
      active: visiblePokemon(player.active),
      bench: player.bench.map((slot, index) => ({ slot: index + 1, pokemon: visiblePokemon(slot) })),
    },
    zones,
    turnResources: {
      supporterPlayedTurn: player.supporterTurn ?? null,
      energyPlayedTurn: player.energyPlayedTurn ?? null,
      retreatedTurn: player.retreatedTurn ?? null,
      stadiumPlayedTurn: player.stadiumPlayedTurn ?? null,
      stadiumUsedTurn: player.stadiumUsedTurn ?? null,
      usedGX: player.usedGX === true,
      usedVSTAR: player.usedVSTAR === true,
    },
    publicTurnRestrictions: publicView.publicTurnRestrictions,
    counts: {
      deck: zones.deckArrayOrder.length,
      hand: zones.hand.length,
      prizes: zones.prizes.reduce((sum, slot) => sum + slot.cards.length, 0),
      discard: zones.discard.length,
      lostZone: zones.lostZone.length,
    },
  };
}

function snapshotFullGameState(state, context = {}) {
  assert.ok(state && Array.isArray(state.players) && state.players.length === 2,
    'full diagnostic requires the real two-player Twinleaf Store state');
  assert.ok(Array.isArray(state.prompts), 'Twinleaf state.prompts must be an array');
  const winnerPlayerId = state.winner && typeof state.winner === 'object' ?
    (state.winner.id ?? null) : (state.winner ?? null);
  let winnerSeat = state.players.findIndex(player => player.id === winnerPlayerId);
  if (winnerSeat === -1 && (state.winner === 0 || state.winner === 1)) winnerSeat = state.winner;
  return {
    schema: DIAGNOSTIC_SCHEMA,
    visibility: PRIVATE_VISIBILITY,
    context: projectDiagnosticValue(context),
    turn: state.turn ?? null,
    phase: state.phase ?? null,
    activePlayerSeat: state.activePlayer ?? null,
    activePlayerId: state.players[state.activePlayer]?.id ?? null,
    activePlayerName: state.players[state.activePlayer]?.name ?? null,
    firstPlayerSeat: context.actualFirstPlayerSeat ?? context.firstPlayerSeat ?? null,
    winnerPlayerId,
    winnerSeat,
    gameSettings: projectDiagnosticValue(state.gameSettings ?? null),
    rules: projectDiagnosticValue(state.rules ?? state.gameSettings?.rules ?? null),
    players: state.players.map((player, seat) => snapshotPlayer(player, seat)),
    prompts: state.prompts.map(snapshotPrompt),
  };
}

function formatFullGameStateText(snapshot) {
  assert.equal(snapshot?.schema, DIAGNOSTIC_SCHEMA, 'unsupported full-state diagnostic schema');
  assert.equal(snapshot?.visibility, PRIVATE_VISIBILITY,
    'full-state diagnostics must retain their private/offline marker');
  const lines = [
    `STATE turn=${snapshot.turn} phase=${snapshot.phase} activeSeat=${snapshot.activePlayerSeat} activePlayerId=${snapshot.activePlayerId}`,
    `VISIBILITY ${snapshot.visibility}`,
    `FIRST PLAYER SEAT ${snapshot.firstPlayerSeat}`,
    `WINNER playerId=${snapshot.winnerPlayerId} seat=${snapshot.winnerSeat}`,
  ];
  if (snapshot.context && Object.keys(snapshot.context).length) {
    lines.push(`CONTEXT ${JSON.stringify(snapshot.context)}`);
  }
  for (const player of snapshot.players) {
    lines.push('');
    lines.push(`PLAYER seat=${player.seat} id=${player.playerId} name=${player.name}`);
    lines.push(`ACTIVE ${JSON.stringify(player.board.active)}`);
    lines.push(`BENCH ${JSON.stringify(player.board.bench)}`);
    lines.push(`HAND (${player.counts.hand}) ${JSON.stringify(player.zones.hand)}`);
    lines.push(`DECK native-array-order (${player.counts.deck}) ${JSON.stringify(player.zones.deckArrayOrder)}`);
    lines.push(`PRIZES (${player.counts.prizes}) ${JSON.stringify(player.zones.prizes)}`);
    lines.push(`DISCARD (${player.counts.discard}) ${JSON.stringify(player.zones.discard)}`);
    lines.push(`LOST ZONE (${player.counts.lostZone}) ${JSON.stringify(player.zones.lostZone)}`);
    lines.push(`STADIUM ${JSON.stringify(player.zones.stadium)}`);
    lines.push(`RESOLVING SUPPORTER ${JSON.stringify(player.zones.resolvingSupporter)}`);
    lines.push(`TURN RESOURCES ${JSON.stringify(player.turnResources)}`);
    lines.push(`RESTRICTIONS ${JSON.stringify(player.publicTurnRestrictions)}`);
  }
  lines.push('');
  lines.push(`PROMPTS ${JSON.stringify(snapshot.prompts)}`);
  lines.push(`GAME SETTINGS ${JSON.stringify(snapshot.gameSettings)}`);
  lines.push(`RULES ${JSON.stringify(snapshot.rules)}`);
  return lines.join('\\n');
}

function formatFixtureGameTraceText(game) {
  const lines = [
    'TWINLEAF FIXTURE GAME DIAGNOSTIC',
    `schema=${DIAGNOSTIC_SCHEMA}`,
    `visibility=${PRIVATE_VISIBILITY}`,
    `fixtureOnly=${game?.fixtureOnly === true}`,
    `admissionEligible=${game?.admissionEligible === true}`,
    `competitiveGameQualified=${game?.competitiveGameQualified === true}`,
    `trialId=${game?.trialId ?? game?.trial?.trialId ?? 'unknown'}`,
    `engineCommit=${game?.vendorCommitSha ?? game?.trial?.vendorCommitSha ?? 'unknown'}`,
    `researchRevision=${game?.researchRevisionSha ?? game?.trial?.researchRevisionSha ?? 'unknown'}`,
    `seed=${game?.seed ?? 'unknown'}`,
    `actualFirstPlayerSeat=${game?.actualFirstPlayerSeat ?? 'unknown'}`,
    `finished=${game?.finished === true}`,
    `endReason=${game?.endReason ?? 'unknown'}`,
    `actions=${game?.actions ?? game?.decisionTrace?.length ?? 'unknown'}`,
    `turns=${game?.turns ?? 'unknown'}`,
    `winnerSeat=${game?.winnerSeat ?? 'unknown'}`,
  ];
  for (const row of game?.decisionTrace ?? []) {
    lines.push('');
    lines.push(`ACTION #${row.actionOrdinal} turn=${row.turnBefore} seat=${row.actingSeat} playerId=${row.actingPlayerId} phase=${row.phaseBefore} name=${row.actionName} root=${row.isRootDecision}`);
    if (row.selectedCardIdentity) lines.push(`SELECTED CARD ${JSON.stringify(row.selectedCardIdentity)}`);
    if (row.promptResolution) lines.push(`PROMPT RESOLUTION ${JSON.stringify(row.promptResolution)}`);
    if (row.actionPayloadSha256) lines.push(`ACTION PAYLOAD SHA256 ${row.actionPayloadSha256}`);
    if (row.actionPayload) lines.push(`ACTION PAYLOAD ${JSON.stringify(row.actionPayload)}`);
    if (row.fullStateBefore) {
      lines.push('--- BEFORE ---');
      lines.push(formatFullGameStateText(row.fullStateBefore));
    }
    if (row.fullStateAfter) {
      lines.push('--- AFTER ---');
      lines.push(formatFullGameStateText(row.fullStateAfter));
    }
  }
  if (game?.failure) {
    lines.push('');
    lines.push(`FAILURE ${JSON.stringify(game.failure)}`);
  }
  return lines.join('\\n');
}

module.exports = {
  DIAGNOSTIC_SCHEMA,
  PRIVATE_VISIBILITY,
  snapshotFullGameState,
  formatFullGameStateText,
  formatFixtureGameTraceText,
};
