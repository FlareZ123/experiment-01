'use strict';
// Shared strict V3 worker contract, native-shaped decisions, no native Store/CI.
const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const { POLICY_VERSION, createPolicy } =
  require('../../simulation/evaluation/2026-11/agent45-rank2-vileplume-control-opponent-policy-v2.cjs');
const suite = require('../../simulation/evaluation/2026-11/agent45-rank2-vileplume-control-challenge-suite-v2.json');
const template = suite.actorViews['mode0-grandtree-root'];
const copy = x => JSON.parse(JSON.stringify(x));
function pokemon(printing, hp, stage, energies = [], retreat = ['Colorless'], abilities = []) {
  const p = copy(template.ownPublic.active);
  p.printing = printing; p.name = printing.split(' ').slice(0, -2).join(' ');
  p.hp = hp; p.damage = 0; p.lastPlayedOrEvolvedTurn = 1;
  p.printed.stage = stage; p.printed.subtypes =
    [stage === 'BASIC' ? 'Basic' : stage === 'STAGE1' ? 'Stage 1' : 'Stage 2'];
  p.printed.retreatCost = retreat; p.energies = energies; p.tools = [];
  p.abilities = abilities;
  p.abilityDetails = abilities.map(name => ({ name, powerType: 'ABILITY',
    text: 'Printed public ability' }));
  p.abilitySuppressions = abilities.map(abilityName =>
    ({ abilityName, suppressed: false, reasonCode: null, sourcePrinting: null }));
  return p;
}
function makeView(seat, kind, options = {}) {
  const v = copy(template); v.actorSeat = seat; v.globalTurn = 4;
  v.ownHand = ['Guzma BUS 115', 'Cassius XY 123']; v.ownPublic.handCount = 2;
  v.ownPublic.active = pokemon('Bunnelby PRC 121', 60, 'BASIC');
  v.ownPublic.bench = [
    pokemon('Stoutland BCR 122', 140, 'STAGE2', [], ['Colorless', 'Colorless'], ['Sentinel']),
    pokemon('Vileplume AOR 3', 130, 'STAGE2', [], ['Colorless'], ['Irritating Pollen']),
    pokemon('Bunnelby PRC 121', 60, 'BASIC'), null, null
  ];
  v.ownPublic.publicTurnRestrictions.itemPlayLocked = true;
  v.ownTurnResources.itemPlayLocked = true;
  v.opponentPublic.active = pokemon('Shadow Rider Calyrex VMAX CRE 75', 320,
    'STAGE1', ['Psychic Energy MEE 13'], ['Colorless', 'Colorless', 'Colorless']);
  v.opponentPublic.bench = [
    pokemon('Shadow Rider Calyrex V CRE 74', 210, 'BASIC',
      ['Psychic Energy MEE 13'], ['Colorless', 'Colorless']),
    pokemon('Shadow Rider Calyrex V CRE 74', 210, 'BASIC',
      [], ['Colorless', 'Colorless']), null, null, null
  ];
  v.opponentPublic.publicTurnRestrictions.itemPlayLocked = true;
  v.opponentPublic.publicTurnRestrictions.supporterPlayLocked = false;
  if (options.latias) {
    const l = pokemon('Latias ex SSP 76', 210, 'BASIC', [],
      ['Colorless', 'Colorless'], ['Skyliner']);
    if (options.latias === 'suppressed') {
      l.abilitySuppressions[0] = { abilityName: 'Skyliner', suppressed: true,
        reasonCode: 'KNOWN_PUBLIC_LOCK', sourcePrinting: 'Other visible lock' };
    }
    v.opponentPublic.bench[2] = l;
  }
  v.decisionKind = kind === 'root' ? 'owner-root' : 'owner-prompt';
  v.pendingPromptType = kind === 'root' ? null : 'ChoosePokemonPrompt';
  return v;
}
function request(seat, kind, options = {}) {
  const observation = makeView(seat, kind, options);
  const items = kind === 'root' ? [
    { token: 'pass', kind: 'pass', label: 'Pass turn' },
    { token: 'guzma', kind: 'play-card', label: 'Play Guzma',
      actorPrinting: 'Guzma BUS 115', publicMetadata: { cardType: 'trainer', handIndex: 0 } },
    { token: 'cassius', kind: 'play-card', label: 'Play Cassius',
      actorPrinting: 'Cassius XY 123', publicMetadata: { cardType: 'trainer', handIndex: 1 } }
  ] : [];
  let prompt = null;
  if (kind !== 'root') {
    const ownerSeat = kind === 'own' ? 'actor' : 'opponent';
    const bench = kind === 'own' ? observation.ownPublic.bench : observation.opponentPublic.bench;
    const choices = bench.flatMap((p, index) => {
      if (!p) return [];
      const publicMetadata = {
        selectionType: 'pokemon', selectionIndex: index, selectedCount: 1,
        ownerSeat, targetZone: 'bench', isOwnerVisible: true
      };
      if (!options.noPhysicalIndex) publicMetadata.benchIndex = index;
      return [{ token: 'slot-' + index, kind: 'pokemon',
        printing: p.printing, label: p.printing, publicMetadata }];
    });
    prompt = {
      schema: protocol.PROMPT_SCHEMA, actingSeat: seat, promptType: 'ChoosePokemonPrompt',
      description: 'Choose one Benched Pokémon',
      source: { classification: 'actor-choice', sourceKind: 'card-effect',
        sourcePrinting: 'Guzma BUS 115', effectName: 'Guzma' },
      choices,
      // Native Guzma is a one-target choice, NOT max = number of visible options.
      publicMetadata: { minimumCount: 1, maximumCount: 1, allowCancel: false,
        isSecret: false, selectionType: 'pokemon', targetZone: 'bench' }
    };
  }
  return {
    schema: protocol.REQUEST_SCHEMA, type: 'decision',
    requestId: 'a25-' + seat + '-' + kind + '-' + (options.latias ?? 'plain') +
      (options.noPhysicalIndex ? '-ambiguous' : ''),
    sequence: 1, role: 'opponent', seat,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation, prompt, publicEventReceipt: null,
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items }
  };
}
function checked(seat, kind, options = {}) {
  const init = protocol.validateInit({
    schema: protocol.INIT_SCHEMA, type: 'init', role: 'opponent', seat,
    policyVersion: POLICY_VERSION, bundleSha256: 'a'.repeat(64), config: {}
  });
  const r = request(seat, kind, options);
  const validation = protocol.validateRequest(r, init, 1, new Set());
  const decision = createPolicy({ role: init.role, seat: init.seat,
    policyVersion: init.policyVersion, config: init.config }).decide(r);
  return protocol.validateDecision(decision, validation.prompt, validation.actionTokens);
}
for (const seat of [0, 1]) {
  test('seat ' + seat + ': untargeted Guzma root validates under real worker contract', () => {
    assert.deepEqual(checked(seat, 'root'), { kind: 'select-action', token: 'guzma' });
  });
  test('seat ' + seat + ': opponent Gust targets second same-print Basic', () => {
    assert.deepEqual(checked(seat, 'opponent'), { kind: 'select-choices', tokens: ['slot-1'] });
  });
  test('seat ' + seat + ': actor switch targets Stoutland', () => {
    assert.deepEqual(checked(seat, 'own'), { kind: 'select-choices', tokens: ['slot-0'] });
  });
  test('seat ' + seat + ': live Latias Skyliner blocks the proposal', () => {
    assert.deepEqual(checked(seat, 'root', { latias: 'live' }),
      { kind: 'select-action', token: 'cassius' });
  });
  test('seat ' + seat + ': suppressed Latias Skyliner permits the proposal', () => {
    assert.deepEqual(checked(seat, 'root', { latias: 'suppressed' }),
      { kind: 'select-action', token: 'guzma' });
  });
  test('seat ' + seat + ': ambiguous identical printing abstains with codebook-valid reason', () => {
    assert.deepEqual(checked(seat, 'opponent', { noPhysicalIndex: true }),
      { kind: 'abstain', reasonCode: 'NO_SUPPORTED_POKEMON_CHOICE' });
  });
}
