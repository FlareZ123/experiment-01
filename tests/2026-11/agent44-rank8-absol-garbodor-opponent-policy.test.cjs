'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const policy = require('../../simulation/evaluation/2026-11/agent44-rank8-absol-garbodor-opponent-policy.cjs');
const {
  POLICY_VERSION, SOURCE_RANK, SOURCE_LIST_BLOB_SHA1, SOURCE_ENTRY_JSON_SHA256,
  CANDIDATE_ENTRY_JSON_SHA256, WORKER_PROTOCOL_BLOB_SHA1, ENGINE_PIN,
  SOURCE_INVENTORY, createPolicy
} = policy;
const root = path.resolve(__dirname, '../..');
const config = {};
const policyPath = path.join(root, 'simulation/evaluation/2026-11/agent44-rank8-absol-garbodor-opponent-policy.cjs');
const bundleSha256 = crypto.createHash('sha256').update(fs.readFileSync(policyPath)).digest('hex');
const P = {
  mega: 'Mega Absol ex MEG 86', trubbish: 'Trubbish PAR 116', garbodor: 'Garbodor LTR 68',
  tapuKoko: 'Tapu Koko ♢ TEU 51', dedenne: 'Dedenne-GX UNB 57', crobat: 'Crobat V DAA 104',
  squawk: 'Squawkabilly ex PAL 169', tapuLele: 'Tapu Lele-GX GRI 60', budew: 'Budew ASC 16',
  vip: 'Battle VIP Pass FST 225', quick: 'Quick Ball FST 237', ultra: 'Ultra Ball MEG 131',
  darkPatch: 'Dark Patch ASR 139', boost: 'Boost Shake EVS 142', secret: 'Secret Box TWM 163',
  float: 'Float Stone BKT 137', forest: 'Forest Seal Stone SIT 156', muscle: 'Muscle Band XY 121',
  dark: 'Darkness Energy MEE 15', lightning: 'Lightning Energy MEE 12',
  guzma: 'Guzma BUS 115', carmine: 'Carmine TWM 145', iono: 'Iono PAL 185',
  roxanne: 'Roxanne ASR 150', lillie: "Lillie's Determination MEG 119",
  crispin: 'Crispin SCR 133', wally: 'Wally ROS 94', karen: 'Karen XYP 177',
  vs: 'VS Seeker PHF 109', night: 'Night Stretcher ASC 196'
};
function restrictions() {
  return { cannotAttackNextTurn: false, cannotUseAttacksNextTurn: [], blockedAttackNameNextTurn: null,
    blockedAttackNameUntilLeavesActive: null, onlyAllowedAttackNameNextTurn: null, attackCostIncreaseNextTurn: 0,
    attackCostIncreaseWhileActive: 0, cannotRetreat: false, cannotRetreatNextTurn: false,
    cannotRetreatWhileActive: false, cannotEvolveNextTurn: false };
}
function publicRestrictions(extra = {}) {
  return { gxUsed: false, vstarUsed: false, attackLockTurnsRemaining: 0, attackMaxEnergy: null,
    attackMaxEnergyTurnsRemaining: 0, ignoreAttackCostCardTypes: [], ignoreAttackCostTurnsRemaining: 0,
    cannotUseGXAttacks: false, pokemonPlayLocked: false, abilityPokemonPlayLocked: false,
    evolutionPlayLocked: false, itemPlayLocked: false, supporterPlayLocked: false, stadiumPlayLocked: false,
    toolPlayLocked: false, energyPlayLocked: false, specialEnergyPlayLocked: false,
    stadiumAndToolHaveNoEffectTurnsRemaining: null, ...extra };
}
function pokemon(printing, options = {}) {
  const abilities = options.abilities ?? [];
  return { printing, name: options.name ?? printing.split(' ').slice(0, -2).join(' '),
    hp: options.hp ?? 180, damage: options.damage ?? 0, lastPlayedOrEvolvedTurn: options.lastPlayedOrEvolvedTurn ?? 1,
    printed: { stage: options.stage ?? 'BASIC', subtypes: options.subtypes ?? ['Basic'],
      types: options.types ?? ['Darkness'], retreatCost: options.retreatCost ?? ['Colorless'], weakness: [], resistance: [] },
    specialConditions: [], publicRestrictions: restrictions(), evolutionPrintings: options.evolutionPrintings ?? [],
    energies: options.energies ?? [], tools: options.tools ?? [], attacks: options.attacks ?? [], abilities,
    abilityDetails: abilities.map(name => ({ name, powerType: 'ABILITY', text: 'Once during your turn.' })),
    abilitySuppressions: null };
}
function player(options = {}) {
  const bench = (options.bench ?? []).slice(0, 5);
  while (bench.length < 5) bench.push(null);
  return { active: options.active ?? null, bench, stadium: options.stadium ?? [], discard: options.discard ?? [],
    lostZone: [], resolvingSupporter: [], publicHand: null, prizeSlots: [],
    publicTurnRestrictions: publicRestrictions(options.publicTurnRestrictions ?? {}),
    handCount: options.handCount ?? 0, deckCount: options.deckCount ?? 30, prizeCount: options.prizeCount ?? 6 };
}
function turnResources(extra = {}) {
  return { supporterPlayedTurn: 0, retreatedTurn: 0, extraTurnActive: false, energyPlayedTurn: false,
    stadiumPlayedTurn: false, stadiumUsedTurn: false, vstarUsed: false, pokemonPlayLocked: false,
    abilityPokemonPlayLocked: false, evolutionPlayLocked: false, itemPlayLocked: false,
    supporterPlayLocked: false, stadiumPlayLocked: false, toolPlayLocked: false, energyPlayLocked: false,
    specialEnergyPlayLocked: false, ...extra };
}
function observation(options = {}) {
  return { actorSeat: options.actorSeat ?? 0, globalTurn: options.globalTurn ?? 3, phase: 2,
    decisionKind: options.prompt ? 'owner-prompt' : 'owner-root', pendingPromptType: options.prompt?.promptType ?? null,
    pendingOwnerDeckSearch: false, ownHand: options.ownHand ?? [], ownPublic: options.ownPublic ?? player(),
    opponentPublic: options.opponentPublic ?? player(), ownTurnResources: options.ownTurnResources ?? turnResources(),
    ownerK1: null };
}
function rootRequest(options = {}) {
  const seat = options.seat ?? 0;
  return { schema: protocol.REQUEST_SCHEMA, type: 'decision', requestId: options.requestId ?? 'agent44-root-1',
    sequence: 1, role: 'opponent', seat, observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: observation({ ...options, actorSeat: seat }), prompt: null, publicEventReceipt: null,
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items: options.items ?? [{ token: 'pass', kind: 'pass', label: 'Pass turn' }] } };
}
function source(printing, effect) {
  return { classification: 'actor-choice', sourceKind: 'card-effect', sourcePrinting: printing, effectName: effect };
}
function card(token, printing, zone = 'deck', owner = 'actor') {
  return { token, kind: 'card', printing, label: printing,
    publicMetadata: { sourceZone: zone, ownerSeat: owner } };
}
function poke(token, printing, owner = 'actor', zone = 'bench', index = 0) {
  return { token, kind: 'pokemon', printing, label: printing,
    publicMetadata: { ownerSeat: owner, targetZone: zone, benchIndex: index, isOwnerVisible: true } };
}
function promptRequest(options = {}) {
  const seat = options.seat ?? 0;
  const prompt = { schema: protocol.PROMPT_SCHEMA, actingSeat: seat, promptType: options.promptType,
    description: options.description ?? 'Choose a legal option',
    source: options.source ?? source('Test source TEST 1', 'Test effect'),
    choices: options.choices ?? [], ...(options.publicMetadata ? { publicMetadata: options.publicMetadata } : {}) };
  return { schema: protocol.REQUEST_SCHEMA, type: 'decision', requestId: options.requestId ?? 'agent44-prompt-1',
    sequence: 1, role: 'opponent', seat, observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: observation({ ...options, actorSeat: seat, prompt }), prompt, publicEventReceipt: null,
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items: [] } };
}
function makePolicy(seat = 0) {
  return createPolicy({ role: 'opponent', seat, policyVersion: POLICY_VERSION, config });
}
function checked(request, seat = 0) {
  const init = { schema: protocol.INIT_SCHEMA, type: 'init', role: 'opponent', seat,
    policyVersion: POLICY_VERSION, bundleSha256, config };
  protocol.validateInit(init);
  const validated = protocol.validateRequest(request, init, request.sequence, new Set());
  const decision = makePolicy(seat).decide(request);
  protocol.validateDecision(decision, validated.prompt, validated.actionTokens);
  return decision;
}
function gitBlobSha1(value) {
  return crypto.createHash('sha1').update('blob ' + Buffer.byteLength(value, 'utf8') + '\0' + value, 'utf8').digest('hex');
}
function sha256(value) { return crypto.createHash('sha256').update(value, 'utf8').digest('hex'); }

test('policy source satisfies Agent36 V3 one-file loader constraints', () => {
  const sourceText = fs.readFileSync(policyPath, 'utf8');
  assert.match(sourceText, /\bconst\s+POLICY_VERSION\s*=\s*(['"])[^'"]+\1\s*;/);
  assert.match(sourceText, /module\.exports\s*=/);
  assert.doesNotMatch(sourceText, /\b(?:require|import|process|globalThis|fetch|setTimeout|setInterval)\b|Math\.random/,
    'worker policy must be a deterministic, inert one-file asset');
});
test('dependency manifest binds policy, worker protocol, source, candidate and pinned Twinleaf', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'results/aichi-2026/2026-11/agent44-rank8-opponent-policy-v1-dependencies.json'), 'utf8'));
  const policyText = fs.readFileSync(policyPath, 'utf8');
  const testText = fs.readFileSync(__filename, 'utf8');
  const gitmodules = fs.readFileSync(path.join(root, '.gitmodules'), 'utf8');
  assert.equal(manifest.policy.gitBlobSha1, gitBlobSha1(policyText));
  assert.equal(manifest.test.gitBlobSha1, gitBlobSha1(testText));
  assert.equal(manifest.workerProtocol.gitBlobSha1, WORKER_PROTOCOL_BLOB_SHA1);
  assert.equal(manifest.source.listGitBlobSha1, SOURCE_LIST_BLOB_SHA1);
  assert.equal(manifest.source.entryJsonSha256, SOURCE_ENTRY_JSON_SHA256);
  assert.equal(manifest.candidate.entryJsonSha256, CANDIDATE_ENTRY_JSON_SHA256);
  assert.equal(manifest.engine.pinnedRevision, ENGINE_PIN);
  assert.equal(manifest.engine.submodulePath, 'vendor/twinleaf');
  assert.ok(gitmodules.includes(manifest.engine.remote));
  assert.equal(manifest.evidenceClass, 'synthetic-only');
});
test('rank-8 source inventory is the exact published 60', () => {
  assert.equal(SOURCE_RANK, 8);
  assert.equal(SOURCE_INVENTORY.reduce((total, row) => total + row[1], 0), 60);
  const text = fs.readFileSync(path.join(root, 'results/aichi-2026/full-decklists.json'), 'utf8');
  assert.equal(gitBlobSha1(text), SOURCE_LIST_BLOB_SHA1);
  const entry = JSON.parse(text).decks.find(row => row.rank === 8);
  assert.ok(entry);
  assert.equal(sha256(JSON.stringify(entry)), SOURCE_ENTRY_JSON_SHA256);
  assert.deepEqual(entry.cards.map(card => [card.name + ' ' + card.printing.set + ' ' + card.printing.number, card.count]), SOURCE_INVENTORY);
});
test('candidate fingerprint binds the unchanged Hood Shadow Rider JSON', () => {
  const text = fs.readFileSync(path.join(root, 'results/aichi-2026/candidate-hood-shadow-rider.json'), 'utf8');
  assert.equal(sha256(JSON.stringify(JSON.parse(text))), CANDIDATE_ENTRY_JSON_SHA256);
});
test('worker protocol pin matches the exact validator blob', () => {
  const text = fs.readFileSync(path.join(root, 'simulation/evaluation/2026-11/agent49-policy-worker.cjs'), 'utf8');
  assert.equal(gitBlobSha1(text), WORKER_PROTOCOL_BLOB_SHA1);
});
test('policy init obeys the worker empty-config contract', () => {
  assert.throws(() => createPolicy({ role: 'opponent', seat: 0, policyVersion: POLICY_VERSION, config: { rank: 8 } }));
  assert.throws(() => createPolicy({ role: 'candidate', seat: 0, policyVersion: POLICY_VERSION, config }));
  assert.throws(() => createPolicy({ role: 'opponent', seat: 0, policyVersion: 'wrong', config }));
  assert.ok(makePolicy(0));
  assert.ok(makePolicy(1));
});
test('first-turn VIP Pass searches Trubbish and Mega Absol before other basics', () => {
  const request = promptRequest({ promptType: 'ChooseCardsPrompt', source: source(P.vip, 'Battle VIP Pass'),
    globalTurn: 1, publicMetadata: { selectionType: 'card-combination', minimumCount: 2, maximumCount: 2, allowCancel: false },
    choices: [card('absol', P.mega), card('trubbish', P.trubbish), card('dedenne', P.dedenne), card('crobat', P.crobat)] });
  assert.deepEqual(checked(request), { kind: 'select-choices', tokens: ['trubbish', 'absol'] });
});
test('Boost Shake chooses Garbodor only with Trubbish and no existing Garbodor', () => {
  const own = player({ active: pokemon(P.mega), bench: [pokemon(P.trubbish)] });
  const request = promptRequest({ promptType: 'ChooseCardsPrompt', source: source(P.boost, 'Boost Shake'),
    ownPublic: own, choices: [card('garbodor', P.garbodor)] });
  assert.deepEqual(checked(request), { kind: 'select-choice', token: 'garbodor' });
  const blocked = promptRequest({ promptType: 'ChooseCardsPrompt', source: source(P.boost, 'Boost Shake'),
    ownPublic: player({ bench: [pokemon(P.trubbish), pokemon(P.garbodor)] }), choices: [card('garbodor', P.garbodor)] });
  assert.equal(checked(blocked).kind, 'abstain');
});
test('Quick Ball cost protects Secret Box and live Guzma, discarding a late VIP Pass', () => {
  const opponent = player({ bench: [pokemon('Shadow Rider Calyrex V CRE 74', { subtypes: ['Basic', 'V'] })] });
  const request = promptRequest({ promptType: 'ChooseCardsPrompt', source: source(P.quick, 'Quick Ball'),
    globalTurn: 4, ownHand: [P.secret, P.guzma, P.vip, P.dark], opponentPublic: opponent,
    publicMetadata: { selectionType: 'single', minimumCount: 1, maximumCount: 1, allowCancel: false },
    choices: [card('secret', P.secret, 'hand'), card('guzma', P.guzma, 'hand'),
      card('vip', P.vip, 'hand'), card('dark', P.dark, 'hand')] });
  assert.deepEqual(checked(request), { kind: 'select-choice', token: 'vip' });
});
test('Ultra Ball cost selects two expendable cards and preserves one-of resources', () => {
  const request = promptRequest({ promptType: 'ChooseCardsPrompt', source: source(P.ultra, 'Ultra Ball'),
    globalTurn: 4, ownHand: [P.secret, P.vip, P.quick, P.dark, P.lightning],
    publicMetadata: { selectionType: 'card-combination', minimumCount: 2, maximumCount: 2, allowCancel: false },
    choices: [card('secret', P.secret, 'hand'), card('vip', P.vip, 'hand'),
      card('quick', P.quick, 'hand'), card('dark', P.dark, 'hand'), card('lightning', P.lightning, 'hand')] });
  assert.deepEqual(checked(request), { kind: 'select-choices', tokens: ['vip', 'quick'] });
});
test('Dark Patch targets a benched Mega Absol missing Energy', () => {
  const own = player({ bench: [pokemon(P.mega, { energies: [P.dark, P.dark] })], discard: [P.dark] });
  const request = promptRequest({ promptType: 'ChoosePokemonPrompt', source: source(P.darkPatch, 'Dark Patch'),
    ownPublic: own, choices: [poke('absol', P.mega, 'actor', 'bench', 0)] });
  assert.deepEqual(checked(request), { kind: 'select-choice', token: 'absol' });
});
test('Dedechange is selected before Garbotoxin when the hand is small and expendable', () => {
  const own = player({ active: pokemon(P.dedenne, { abilities: ['Dedechange'] }) });
  const request = rootRequest({ ownPublic: own, ownHand: [P.dark],
    items: [{ token: 'dedechange', kind: 'use-ability', actorPrinting: P.dedenne,
      publicMetadata: { abilityName: 'Dedechange' } }, { token: 'pass', kind: 'pass' }] });
  assert.deepEqual(checked(request), { kind: 'select-action', token: 'dedechange' });
});
test('Dedechange is suppressed by own Garbotoxin', () => {
  const own = player({ active: pokemon(P.dedenne, { abilities: ['Dedechange'] }), bench: [pokemon(P.garbodor)] });
  const request = rootRequest({ ownPublic: own, ownHand: [P.dark],
    items: [{ token: 'dedechange', kind: 'use-ability', actorPrinting: P.dedenne,
      publicMetadata: { abilityName: 'Dedechange' } }, { token: 'pass', kind: 'pass' }] });
  assert.deepEqual(checked(request), { kind: 'select-action', token: 'pass' });
});
test('Dedechange confirmation is accepted only before Garbotoxin', () => {
  const before = promptRequest({ promptType: 'ConfirmPrompt', source: source(P.dedenne, 'Dedechange'),
    ownHand: [P.dark], choices: [{ token: 'yes', kind: 'choice', label: 'Yes' }, { token: 'no', kind: 'choice', label: 'No' }] });
  assert.deepEqual(checked(before), { kind: 'select-choice', token: 'yes' });
  const after = promptRequest({ promptType: 'ConfirmPrompt', source: source(P.dedenne, 'Dedechange'),
    ownHand: [P.dark], ownPublic: player({ bench: [pokemon(P.garbodor)] }),
    choices: [{ token: 'yes', kind: 'choice', label: 'Yes' }, { token: 'no', kind: 'choice', label: 'No' }] });
  assert.deepEqual(checked(after), { kind: 'select-choice', token: 'no' });
});
test('Squawkabilly Motivate attacks, targets Mega Absol, and selects Darkness Energy', () => {
  const own = player({ bench: [pokemon(P.mega), pokemon(P.trubbish)], discard: [P.dark, P.dark] });
  const attack = rootRequest({ ownPublic: own, items: [
    { token: 'motivate', kind: 'attack', actorPrinting: P.squawk, attackName: 'Motivate',
      publicMetadata: { attackCostPayable: true } }, { token: 'pass', kind: 'pass' }
  ] });
  assert.deepEqual(checked(attack), { kind: 'select-action', token: 'motivate' });
  const target = promptRequest({ promptType: 'ChoosePokemonPrompt', source: source(P.squawk, 'Motivate'),
    ownPublic: own, choices: [poke('absol', P.mega, 'actor', 'bench', 0), poke('trubbish', P.trubbish, 'actor', 'bench', 1)] });
  assert.deepEqual(checked(target), { kind: 'select-choice', token: 'absol' });
  const energy = promptRequest({ promptType: 'ChooseCardsPrompt', source: source(P.squawk, 'Motivate'),
    ownPublic: own, publicMetadata: { selectionType: 'card-combination', minimumCount: 1, maximumCount: 2, allowCancel: false },
    choices: [card('dark1', P.dark, 'discard'), card('dark2', P.dark, 'discard')] });
  assert.deepEqual(checked(energy), { kind: 'select-choices', tokens: ['dark1', 'dark2'] });
});
test('Mega Absol Terminal Period selects only at exactly six damage counters (60 damage)', () => {
  const candidate = damage => rootRequest({
    opponentPublic: player({ active: pokemon('Shadow Rider Calyrex VMAX CRE 75',
      { hp: 320, damage, subtypes: ['VMAX'] }) }), items: [
      { token: 'terminal', kind: 'attack', attackName: 'Terminal Period',
        publicMetadata: { attackCostPayable: true, targetDamage: damage } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checked(candidate(60)), { kind: 'select-action', token: 'terminal' });
  for (const damage of [0, 50, 70, 290, 300]) {
    assert.deepEqual(checked(candidate(damage)), { kind: 'select-action', token: 'pass' },
      'six counters are 60 damage, not 300: '+damage);
  }
});
test('Claw of Darkness chooses a high-value revealed opponent card', () => {
  const request = promptRequest({ promptType: 'ChooseCardsPrompt', source: source(P.mega, 'Claw of Darkness'),
    choices: [
      { token: 'psychic', kind: 'card', printing: P.dark, label: P.dark,
        publicMetadata: { sourceZone: 'hand', ownerSeat: 'opponent' } },
      { token: 'field-blower', kind: 'card', printing: 'Field Blower GRI 125', label: 'Field Blower GRI 125',
        publicMetadata: { sourceZone: 'hand', ownerSeat: 'opponent' } },
      { token: 'hood', kind: 'card', printing: 'Stealthy Hood UNB 186', label: 'Stealthy Hood UNB 186',
        publicMetadata: { sourceZone: 'hand', ownerSeat: 'opponent' } }
    ] });
  assert.deepEqual(checked(request), { kind: 'select-choice', token: 'field-blower' });
});
test('Forest Seal Stone is attached to Crobat V, not Tapu Lele-GX', () => {
  const own = player({ bench: [pokemon(P.crobat), pokemon(P.tapuLele)] });
  const request = promptRequest({ promptType: 'ChoosePokemonPrompt', source: source(P.forest, 'Forest Seal Stone'),
    ownPublic: own, choices: [poke('crobat', P.crobat, 'actor', 'bench', 0), poke('lele', P.tapuLele, 'actor', 'bench', 1)] });
  assert.deepEqual(checked(request), { kind: 'select-choice', token: 'crobat' });
});
test('rank-8 Trubbish does not inherit rank-11 Call for Family', () => {
  const request = rootRequest({ ownPublic: player({ active: pokemon(P.trubbish) }), items: [
    { token: 'call', kind: 'attack', actorPrinting: P.trubbish, attackName: 'Call for Family',
      publicMetadata: { attackCostPayable: true } }, { token: 'pass', kind: 'pass' }
  ] });
  assert.deepEqual(checked(request), { kind: 'select-action', token: 'pass' });
});
test('Tapu Koko two-recipient prompt remains explicitly held out', () => {
  const request = promptRequest({ promptType: 'ChooseCardsPrompt', source: source(P.tapuKoko, 'Dance of the Ancients'),
    publicMetadata: { selectionType: 'card-combination', minimumCount: 2, maximumCount: 2, allowCancel: false },
    choices: [card('lightning1', P.lightning, 'discard'), card('lightning2', P.lightning, 'discard')] });
  assert.deepEqual(checked(request), { kind: 'abstain', reasonCode: 'RANK8_TAPU_KOKO_PROMPT_HELD_OUT' });
});
test('Crispin linked energy choices remain explicitly held out', () => {
  const request = promptRequest({ promptType: 'ChooseCardsPrompt', source: source(P.crispin, 'Crispin'),
    publicMetadata: { selectionType: 'card-combination', minimumCount: 2, maximumCount: 2, allowCancel: false },
    choices: [card('dark', P.dark), card('lightning', P.lightning)] });
  assert.deepEqual(checked(request), { kind: 'abstain', reasonCode: 'RANK8_MULTI_STEP_PROMPT_HELD_OUT' });
});
test('Quick Ball search chooses Trubbish for the open Garbodor line', () => {
  const request = promptRequest({ promptType: 'ChooseCardsPrompt', source: source(P.quick, 'Quick Ball'),
    ownPublic: player(), choices: [card('absol', P.mega), card('trubbish', P.trubbish)] });
  assert.deepEqual(checked(request), { kind: 'select-choice', token: 'trubbish' });
});
test('Ultra Ball search chooses Mega Absol after the Trubbish line is full', () => {
  const own = player({ active: pokemon(P.trubbish), bench: [pokemon(P.trubbish)] });
  const request = promptRequest({ promptType: 'ChooseCardsPrompt', source: source(P.ultra, 'Ultra Ball'),
    ownPublic: own, choices: [card('absol', P.mega), card('crobat', P.crobat)] });
  assert.deepEqual(checked(request), { kind: 'select-choice', token: 'absol' });
});
test('VS Seeker recovers a live Guzma over Iono', () => {
  const opponent = player({ bench: [pokemon('Shadow Rider Calyrex V CRE 74', { subtypes: ['Basic', 'V'] })] });
  const request = promptRequest({ promptType: 'ChooseCardsPrompt', source: source(P.vs, 'VS Seeker'),
    opponentPublic: opponent, ownPublic: player({ discard: [P.guzma, P.iono] }),
    choices: [card('iono', P.iono, 'discard'), card('guzma', P.guzma, 'discard')] });
  assert.deepEqual(checked(request), { kind: 'select-choice', token: 'guzma' });
});
test('Tapu Lele Wonder Tag selects a live supporter target', () => {
  const opponent = player({ bench: [pokemon('Shadow Rider Calyrex V CRE 74', { subtypes: ['Basic', 'V'] })] });
  const request = promptRequest({ promptType: 'ChooseCardsPrompt', source: source(P.tapuLele, 'Wonder Tag'),
    opponentPublic: opponent, choices: [card('iono', P.iono), card('guzma', P.guzma), card('carmine', P.carmine)] });
  assert.deepEqual(checked(request), { kind: 'select-choice', token: 'guzma' });
});
test('unvalidated recovery and multi-target items are not initiated from the root policy', () => {
  const items = [
    [P.secret, 'secret'], [P.night, 'night'], ['Super Rod PAL 188', 'rod'],
    ['Field Blower GRI 125', 'blower'], ['Adventure Bag LOT 167', 'bag']
  ].map(([actorPrinting, token]) => ({ token, kind: 'play-card', actorPrinting, publicMetadata: { cardType: 'item' } }));
  items.push({ token: 'pass', kind: 'pass' });
  const request = rootRequest({ globalTurn: 4, ownHand: [P.secret, P.vip, P.quick, P.dark], items });
  assert.deepEqual(checked(request), { kind: 'select-action', token: 'pass' });
});
test('wrong actor seat fails closed', () => {
  assert.deepEqual(makePolicy(0).decide(rootRequest({ seat: 1 })),
    { kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH' });
});
test('forbidden seed and hidden-state fields are rejected by the real worker validator', () => {
  const request = rootRequest();
  request.observation.seed = 123;
  const init = { schema: protocol.INIT_SCHEMA, type: 'init', role: 'opponent', seat: 0,
    policyVersion: POLICY_VERSION, bundleSha256, config };
  protocol.validateInit(init);
  assert.throws(() => protocol.validateRequest(request, init, 1, new Set()));
});
