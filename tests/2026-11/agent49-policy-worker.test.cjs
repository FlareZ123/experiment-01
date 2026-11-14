'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const readline = require('node:readline');
const { spawn } = require('node:child_process');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const { attachPreviousOpponentTurnReceipt } = require('../../simulation/twinleaf/agent7-copycat-history-root.cjs');
const { actorObservation } = require('../../simulation/twinleaf/actor-observation-contract.cjs');

const WORKER_SOURCE = path.resolve(__dirname,
  '../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const POLICY_VERSION = 'agent49-test-policy-v2';
function policySource(version = POLICY_VERSION) {
  const versionLiteral = JSON.stringify(version);
  return [
    "'use strict';",
    'const POLICY_VERSION=' + versionLiteral + ';',
    'async function createPolicy(context){return {async decide(request){',
    "if(request.requestId==='force-unknown') return {kind:'select-action',token:'not-in-frontier'};",
    "if(request.requestId==='force-action-on-prompt') return {kind:'select-action',token:'action-1'};",
    "if(request.requestId==='force-choice-on-root') return {kind:'select-choice',token:'choice-1'};",
    "if(request.requestId==='force-rng'){context.rng();return {kind:'abstain',reasonCode:'TEST_RNG'};}",
    "if(request.requestId==='multi-select') return {kind:'select-choices',tokens:['multi-1','multi-0']};",
    "if(request.prompt){const choice=request.prompt.choices[0];return choice?{kind:'select-choice',token:choice.token}:{kind:'abstain',reasonCode:'NO_VISIBLE_CHOICE'};}",
    "const action=request.actionFrontier.items[0];return action?{kind:'select-action',token:action.token}:{kind:'abstain',reasonCode:'NO_LEGAL_ACTION'};",
    '}};}',
    'module.exports={POLICY_VERSION,createPolicy};'
  ].join('\n');
}

function publicRestrictions() {
  return {
    gxUsed: false, vstarUsed: false, attackLockTurnsRemaining: 0,
    attackMaxEnergy: null, attackMaxEnergyTurnsRemaining: 0,
    ignoreAttackCostCardTypes: [], ignoreAttackCostTurnsRemaining: 0,
    cannotUseGXAttacks: false, pokemonPlayLocked: false,
    abilityPokemonPlayLocked: false, evolutionPlayLocked: false,
    itemPlayLocked: false, supporterPlayLocked: false,
    stadiumPlayLocked: false, toolPlayLocked: false,
    energyPlayLocked: false, specialEnergyPlayLocked: false,
    stadiumAndToolHaveNoEffectTurnsRemaining: null
  };
}
function publicPlayer() {
  return {
    active: null, bench: [null, null, null, null, null], stadium: [], discard: [],
    lostZone: [], resolvingSupporter: [], publicHand: null, prizeSlots: [],
    publicTurnRestrictions: publicRestrictions(), handCount: 0, deckCount: 10, prizeCount: 6
  };
}
function pokemonRestrictions() {
  return {
    cannotAttackNextTurn: false, cannotUseAttacksNextTurn: [],
    blockedAttackNameNextTurn: null, blockedAttackNameUntilLeavesActive: null,
    onlyAllowedAttackNameNextTurn: null, attackCostIncreaseNextTurn: 0,
    attackCostIncreaseWhileActive: 0, cannotRetreat: false,
    cannotRetreatNextTurn: false, cannotRetreatWhileActive: false,
    cannotEvolveNextTurn: false
  };
}
function visiblePokemon() {
  return {
    printing: 'Shadow Rider Calyrex VMAX CRE', name: 'Shadow Rider Calyrex VMAX',
    hp: 320, damage: 0, lastPlayedOrEvolvedTurn: 1,
    printed: { stage: 'VMAX', subtypes: [], types: ['Psychic'], retreatCost: [],
      weakness: [{ type: 'Fighting', value: '×2' }], resistance: [] },
    specialConditions: [], publicRestrictions: pokemonRestrictions(),
    evolutionPrintings: ['Shadow Rider Calyrex V CRE'],
    energies: ['Psychic Energy SVE'], tools: [],
    attacks: [{ name: 'Max Geist', cost: [1, 1, 1], damage: '10+30',
      damageCalculation: null, text: null, gxAttack: false, barrage: false }],
    abilities: ['Underworld Door'],
    abilityDetails: [{ name: 'Underworld Door', powerType: 'ABILITY', text: 'Once during your turn.' }],
    abilitySuppressions: [{ abilityName: 'Underworld Door', suppressed: true,
      reasonCode: 'PATH_TO_THE_PEAK', sourcePrinting: 'Path to the Peak CES' }]
  };
}
function mimikyuPokemon() {
  return {
    ...visiblePokemon(), printing: 'Mimikyu GRI', name: 'Mimikyu', hp: 70,
    attacks: [{ name: 'Copycat', cost: [], damage: null, damageCalculation: null,
      text: 'Use a previous opponent attack', gxAttack: false, barrage: false }],
    abilities: [], abilityDetails: [], abilitySuppressions: []
  };
}
function observation(seat, decisionKind = 'owner-root', promptType = null) {
  return {
    actorSeat: seat, globalTurn: 1, phase: 2, decisionKind,
    pendingPromptType: promptType, pendingOwnerDeckSearch: false,
    ownHand: ['Shadow Rider Calyrex V CRE'], ownPublic: publicPlayer(),
    opponentPublic: publicPlayer(),
    ownTurnResources: {
      supporterPlayedTurn: 0, retreatedTurn: 0, extraTurnActive: false,
      energyPlayedTurn: false, stadiumPlayedTurn: false, stadiumUsedTurn: false,
      vstarUsed: false, pokemonPlayLocked: false, abilityPokemonPlayLocked: false,
      evolutionPlayLocked: false, itemPlayLocked: false, supporterPlayLocked: false,
      stadiumPlayLocked: false, toolPlayLocked: false, energyPlayLocked: false,
      specialEnergyPlayLocked: false
    },
    ownerK1: null
  };
}
function fixtureCard(fullName, extra = {}) { return { fullName, ...extra }; }
function emptyEngineSlot() {
  return { cards: [], getPokemonCard: () => null, energies: { cards: [] }, tools: [],
    damage: 0, pokemonPlayedTurn: null, specialConditions: [] };
}
function enginePokemonSlot(pokemon) {
  return { cards: [pokemon], getPokemonCard: () => pokemon, energies: { cards: [] }, tools: [],
    damage: 0, pokemonPlayedTurn: 0, specialConditions: [],
    cannotAttackNextTurn: false, cannotUseAttacksNextTurn: [],
    blockedAttackNameNextTurn: null, blockedAttackNameUntilLeavesActive: null,
    onlyAllowedAttackNameNextTurn: null, attackCostIncreaseNextTurn: 0,
    attackCostIncreaseWhileActive: 0, cannotRetreat: false,
    cannotRetreatNextTurn: false, cannotRetreatWhileActive: false,
    cannotEvolveNextTurn: false };
}
function enginePlayer(id) {
  return {
    id, active: emptyEngineSlot(), bench: Array.from({ length: 5 }, emptyEngineSlot),
    stadium: { cards: [] }, discard: { cards: [] }, lostzone: { cards: [] },
    supporter: { cards: [] }, hand: { cards: [], isPublic: false },
    prizes: Array.from({ length: 6 }, () => ({ cards: [], faceUpPrize: false })),
    deck: { cards: Array.from({ length: 60 }, () => fixtureCard('Basic Energy SVE')) },
    usedGX: false, usedVSTAR: false, cannotAttackTurnsRemaining: 0,
    cannotAttackMaxEnergy: null, cannotAttackMaxEnergyTurnsRemaining: 0,
    ignoreAttackCostCardTypes: [], ignoreAttackCostTurnsRemaining: 0,
    cannotUseGXAttacks: false, cannotPlayPokemonCards: false,
    cannotPlayPokemonWithAbilities: false, cannotEvolvePokemonCards: false,
    cannotPlayItemCards: false, cannotPlaySupporterCards: false,
    cannotPlayStadiumCards: false, cannotPlayToolCards: false,
    cannotPlayEnergyCards: false, cannotPlaySpecialEnergyCards: false,
    supporterTurn: 0, retreatedTurn: 0, usedTurnSkip: false,
    energyPlayedTurn: false, stadiumPlayedTurn: false, stadiumUsedTurn: false
  };
}
function engineMimikyu() {
  return {
    ...fixtureCard('Mimikyu GRI'), name: 'Mimikyu', hp: 70, stage: 'Basic',
    subtypes: ['Basic'], cardType: ['Psychic'], retreat: [], weakness: [], resistance: [],
    attacks: [{ name: 'Copycat', cost: [], damage: null, damageCalculation: null,
      text: 'Copy a previous opponent attack', gxAttack: false, barrage: false }],
    powers: []
  };
}

function initFor(role = 'candidate', seat = 0, digest = 'a', version = POLICY_VERSION) {
  return {
    schema: protocol.INIT_SCHEMA, type: 'init', role, seat,
    policyVersion: version, bundleSha256: digest.repeat(64), config: {}
  };
}
function request(sequence, role = 'candidate', seat = 0, overrides = {}) {
  return {
    schema: protocol.REQUEST_SCHEMA, type: 'decision',
    requestId: 'req-' + sequence, sequence, role, seat,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: observation(seat), prompt: null, publicEventReceipt: null,
    actionFrontier: {
      schema: protocol.FRONTIER_SCHEMA,
      items: [{ token: 'action-' + sequence, kind: 'attack', attackName: 'Max Geist',
        publicMetadata: { damage: 250, stadiumEffectLive: true } }]
    },
    ...overrides
  };
}
function writeLine(stream, value) { stream.write(JSON.stringify(value) + '\n'); }

function startWorker(init = initFor()) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent49-worker-test-'));
  fs.copyFileSync(WORKER_SOURCE, path.join(dir, 'worker.cjs'));
  fs.writeFileSync(path.join(dir, 'policy.cjs'), policySource(init.policyVersion));
  const child = spawn(process.execPath, [path.join(dir, 'worker.cjs')], {
    stdio: ['pipe', 'pipe', 'pipe'], env: { PATH: process.env.PATH || '/usr/bin:/bin' }
  });
  const lines = [];
  let stderr = '';
  const rl = readline.createInterface({ input: child.stdout });
  rl.on('line', line => { try { lines.push(JSON.parse(line)); } catch { lines.push({ invalidJson: line }); } });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', chunk => { stderr += chunk; });
  return { child, dir, lines, get stderr() { return stderr; }, rl, init };
}
async function waitForCount(worker, count, timeoutMs = 3000) {
  const started = Date.now();
  while (worker.lines.length < count) {
    if (worker.child.exitCode !== null) throw new Error('worker exited early (' + worker.child.exitCode + '): ' + worker.stderr);
    if (Date.now() - started > timeoutMs) throw new Error('worker response timeout');
    await new Promise(resolve => setTimeout(resolve, 5));
  }
}
async function waitForClose(worker) {
  if (worker.child.exitCode !== null) return;
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('worker close timeout')), 3000);
    worker.child.once('close', (...args) => { clearTimeout(timer); resolve(args); });
    worker.child.once('error', error => { clearTimeout(timer); reject(error); });
  });
}
async function dispose(worker) {
  if (worker.child.exitCode === null) { worker.child.stdin.end(); await waitForClose(worker); }
  worker.rl.close();
  fs.rmSync(worker.dir, { recursive: true, force: true });
}
async function expectFailure(message, code, init = initFor()) {
  const worker = startWorker(init);
  try {
    writeLine(worker.child.stdin, init);
    await waitForCount(worker, 1);
    writeLine(worker.child.stdin, message);
    worker.child.stdin.end();
    await waitForClose(worker);
    assert.notEqual(worker.child.exitCode, 0);
    assert.match(worker.stderr, new RegExp(code));
  } finally {
    worker.rl.close();
    fs.rmSync(worker.dir, { recursive: true, force: true });
  }
}

test('persistent worker accepts ordered decisions without RNG seed IPC', async () => {
  const worker = startWorker();
  try {
    writeLine(worker.child.stdin, worker.init);
    await waitForCount(worker, 1);
    assert.deepEqual(worker.lines[0], {
      schema: protocol.READY_SCHEMA, type: 'ready', role: 'candidate', seat: 0,
      policyVersion: POLICY_VERSION, bundleSha256: worker.init.bundleSha256,
      policyStreamProtocol:'worker-local-independent-crypto-stream-v1',policyDrawCount:0
    });
    writeLine(worker.child.stdin, request(1)); await waitForCount(worker, 2);
    writeLine(worker.child.stdin, request(2)); await waitForCount(worker, 3);
    assert.deepEqual(worker.lines[1].decision, { kind: 'select-action', token: 'action-1' });
    assert.deepEqual(worker.lines[2].decision, { kind: 'select-action', token: 'action-2' });
    assert.equal(worker.lines[1].requestId, 'req-1');
    assert.equal(worker.lines[2].sequence, 2);
    assert.doesNotMatch(JSON.stringify(worker.lines), /policySeed|physicalSeed|rngState/i);
  } finally { await dispose(worker); }
});

test('both roles and both physical seats receive concurrent isolated role-bound workers', async () => {
  const combos = [
    ['candidate', 0, 'a'], ['opponent', 1, 'b'],
    ['candidate', 1, 'c'], ['opponent', 0, 'd']
  ];
  const workers = combos.map(([role, seat, digest]) => {
    const version = 'agent49-' + role + '-seat' + seat + '-test-v2';
    const init = initFor(role, seat, digest, version);
    return { role, seat, version, init, worker: startWorker(init) };
  });
  try {
    for (const row of workers) writeLine(row.worker.child.stdin, row.init);
    for (const row of workers) await waitForCount(row.worker, 1);
    for (const row of workers) {
      assert.equal(row.worker.lines[0].role, row.role);
      assert.equal(row.worker.lines[0].seat, row.seat);
      assert.equal(row.worker.lines[0].policyVersion, row.version);
      assert.equal(row.worker.lines[0].bundleSha256, row.init.bundleSha256);
    }
    for (const row of workers) writeLine(row.worker.child.stdin, request(1, row.role, row.seat));
    for (const row of workers) await waitForCount(row.worker, 2);
    for (const row of workers) {
      assert.equal(row.worker.lines[1].role, row.role);
      assert.equal(row.worker.lines[1].seat, row.seat);
    }
    assert.equal(new Set(workers.map(row => row.worker.child.pid)).size, 4);
  } finally {
    await Promise.all(workers.map(row => dispose(row.worker)));
  }
});

test('strict actor, prompt, event and metadata schemas reject nested aliases', async () => {
  const view = observation(0);
  assert.throws(() => protocol.validateActorObservation({ ...view, opponentPrivate: { hand: ['hidden'] } }, 0), /UNKNOWN_FIELD/);
  assert.throws(() => protocol.validateActorObservation({ ...view, opponentPublic: { ...view.opponentPublic, hand: ['hidden'] } }, 0), /UNKNOWN_FIELD/);
  assert.throws(() => protocol.validateActorObservation({ ...view, ownDeckOrder: ['hidden'] }, 0), /UNKNOWN_FIELD/);
  assert.throws(() => protocol.validateActorObservation({ ...view, globalTurn: -1 }, 0), /BAD_ACTOR_OBSERVATION/);
  assert.throws(() => protocol.validateActorObservation({ ...view, decisionKind: 'owner-prompt', pendingPromptType: 'UseAbilityPrompt', pendingOwnerDeckSearch: true }, 0), /BAD_OWNER_DECK_SEARCH_FLAG/);
  const badPlayerRestriction = observation(0);
  badPlayerRestriction.ownPublic.publicTurnRestrictions.gxUsed = 'false';
  assert.throws(() => protocol.validateActorObservation(badPlayerRestriction, 0), /BAD_PLAYER_RESTRICTION/);
  const missingAbilitySuppressions=observation(0);
  missingAbilitySuppressions.ownPublic.active=visiblePokemon();
  delete missingAbilitySuppressions.ownPublic.active.abilitySuppressions;
  assert.throws(()=>protocol.validateActorObservation(missingAbilitySuppressions,0),/MISSING_FIELD/);
  const unknownAbilitySuppressions=observation(0);
  unknownAbilitySuppressions.ownPublic.active={...visiblePokemon(),abilitySuppressions:null};
  assert.doesNotThrow(()=>protocol.validateActorObservation(unknownAbilitySuppressions,0));
  const missingStadiumEpoch=observation(0);
  delete missingStadiumEpoch.ownPublic.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining;
  assert.throws(()=>protocol.validateActorObservation(missingStadiumEpoch,0),/MISSING_FIELD/);
  const unknownStadiumEpoch=observation(0);
  unknownStadiumEpoch.ownPublic.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining=null;
  assert.doesNotThrow(()=>protocol.validateActorObservation(unknownStadiumEpoch,0));
  const badPokemonRestriction = observation(0);
  badPokemonRestriction.ownPublic.active = visiblePokemon();
  badPokemonRestriction.ownPublic.active.publicRestrictions.cannotAttackNextTurn = 'false';
  assert.throws(() => protocol.validateActorObservation(badPokemonRestriction, 0), /BAD_POKEMON_RESTRICTION/);
  const badPrizeIndex = observation(0);
  badPrizeIndex.ownPublic.prizeSlots = [{ index: 6 }];
  assert.throws(() => protocol.validateActorObservation(badPrizeIndex, 0), /BAD_PRIZE_SLOT/);
  assert.throws(() => protocol.validateFlatMetadata({ opponentHand: ['hidden'] }, ['damage'], 'BAD_META'), /UNKNOWN_FIELD/);
  assert.throws(() => protocol.validateInit({ ...initFor(), config: { opponentDecklist: [] } }), /UNKNOWN_FIELD/);
  assert.throws(() => protocol.validateInit({ ...initFor(), config: { policySeed: 123 } }), /UNKNOWN_FIELD/);
  const badPrompt = request(1, 'candidate', 0, {
    observation: observation(0, 'owner-prompt', 'ChooseCardsPrompt'),
    prompt: { schema: protocol.PROMPT_SCHEMA, actingSeat: 0, promptType: 'ChooseCardsPrompt',
      description: 'test', source: { classification: 'actor-choice', sourceKind: 'card-effect', sourcePrinting: 'Quick Ball FST', effectName: 'Quick Ball' },
      choices: [{ token: 'c1', kind: 'payment', publicMetadata: { opponentHand: [] } }] }
  });
  assert.throws(() => protocol.validateRequest(badPrompt, initFor(), 1, new Set()), /UNKNOWN_FIELD/);
  const badFrontier = request(1, 'candidate', 0, {
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items: [{ token: 'a1', kind: 'attack',
      publicMetadata: { opponentHand: [] } }] }
  });
  assert.throws(() => protocol.validateRequest(badFrontier, initFor(), 1, new Set()), /UNKNOWN_FIELD/);

  const visibleView = observation(0);
  visibleView.ownPublic.active = visiblePokemon();
  protocol.validateActorObservation(visibleView, 0);
  const incompleteSuppressionView = observation(0);
  incompleteSuppressionView.ownPublic.active = { ...visiblePokemon(), abilitySuppressions: [] };
  assert.throws(() => protocol.validateActorObservation(incompleteSuppressionView, 0), /INCOMPLETE_ABILITY_SUPPRESSION_VIEW/);
  const unattributedSuppressionView = observation(0);
  unattributedSuppressionView.ownPublic.active = { ...visiblePokemon(), abilitySuppressions: [{ abilityName: 'Underworld Door', suppressed: true, reasonCode: 'PATH_TO_THE_PEAK', sourcePrinting: null }] };
  assert.throws(() => protocol.validateActorObservation(unattributedSuppressionView, 0), /MISSING_ABILITY_SUPPRESSION_SOURCE/);
  const badSuppressionView = observation(0);
  badSuppressionView.ownPublic.active = { ...visiblePokemon(), abilitySuppressions: [{ abilityName: 'Underworld Door', suppressed: true, reasonCode: 'PATH_TO_THE_PEAK', sourcePrinting: 'Path to the Peak CES', opponentHand: [] }] };
  assert.throws(() => protocol.validateActorObservation(badSuppressionView, 0), /UNKNOWN_FIELD/);
  const eventRow = { turn: 0, sourcePrinting: 'Trevenant & Dusknoir-GX',
    attackName: 'Night Watch', gxAttack: false, copycatAttack: false };
  const reorderedCopycatRow = { copycatAttack: false, attackName: 'Night Watch', turn: 0,
    sourcePrinting: 'Trevenant & Dusknoir-GX', gxAttack: false };
  const copycatView = observation(0);
  copycatView.ownPublic.active = mimikyuPokemon();
  const receipt = {
    version: protocol.EVENT_RECEIPT_VERSION, actorSeat: 0, turn: 1,
    ownerActive: { printing: 'Mimikyu GRI', movedFromBenchToActiveThisTurn: false, knownAbilityUse: [] }, ownerBench: [null, null, null, null, null],
    priorOpponentTurnKO: { any: null, byAttack: null },
    opponentLastTurnAttack: null, opponentLastTurnTurn: 0,
    opponentLastTurnAttacks: [eventRow], opponentCopycatChoices: [reorderedCopycatRow],
    mimikyuCopycatCompatible: true
  };
  protocol.validatePublicEventReceipt(receipt, copycatView);
  const baseReceipt = { ...receipt };
  delete baseReceipt.opponentCopycatChoices;
  delete baseReceipt.mimikyuCopycatCompatible;
  protocol.validatePublicEventReceipt(baseReceipt, copycatView);
  assert.throws(() => protocol.validatePublicEventReceipt({
    ...baseReceipt, opponentCopycatChoices: null
  }, copycatView), /INCOMPLETE_COPYCAT_RECEIPT/);
  assert.throws(() => protocol.validatePublicEventReceipt({
    ...receipt, opponentLastTurnAttacks: [{ ...eventRow, opponentHand: ['hidden'] }]
  }, copycatView), /UNKNOWN_FIELD/);
  assert.throws(() => protocol.validatePublicEventReceipt({
    ...receipt, ownerActive: { printing: 'Pikachu VMAX VIV', movedFromBenchToActiveThisTurn: false, knownAbilityUse: [] }
  }, copycatView), /EVENT_OWNER_ACTIVE_MISMATCH/);
  assert.throws(() => protocol.validatePublicEventReceipt({
    ...receipt, ownerActive: { ...receipt.ownerActive, knownAbilityUse: [{ name: 'Unknown Ability', usedThisTurn: true }] }
  }, copycatView), /BAD_EVENT_ABILITY/);
  assert.throws(() => protocol.validatePublicEventReceipt({
    ...receipt, opponentLastTurnAttacks: [{ ...eventRow, turn: 1 }]
  }, copycatView), /EVENT_ATTACK_TURN_MISMATCH/);
  assert.throws(() => protocol.validatePublicEventReceipt({
    ...receipt, opponentCopycatChoices: [{ ...eventRow, attackName: 'Different Attack' }]
  }, copycatView), /COPYCAT_CHOICE_NOT_IN_HISTORY/);
  assert.throws(() => protocol.validatePublicEventReceipt({
    ...receipt, opponentLastTurnAttacks: [{ ...eventRow, gxAttack: true }],
    opponentCopycatChoices: [{ ...eventRow, gxAttack: true }]
  }, copycatView), /INELIGIBLE_COPYCAT_ATTACK/);
  const barrageFirst = { ...eventRow, attackName: 'Barrage One', barragePairIndex: 0, barragePairRole: 'first' };
  const barrageSecond = { ...eventRow, attackName: 'Barrage Two', barragePairIndex: 0, barragePairRole: 'second' };
  protocol.validatePublicEventReceipt({ ...receipt,
    opponentLastTurnAttacks: [barrageFirst, barrageSecond],
    opponentCopycatChoices: [barrageFirst, barrageSecond]
  }, copycatView);
  const independentSecond = { ...eventRow, turn: 0, sourcePrinting: 'Other Attacker', attackName: 'Other Attack' };
  protocol.validatePublicEventReceipt({ ...receipt,
    opponentLastTurnAttacks: [eventRow, independentSecond],
    opponentCopycatChoices: [eventRow, independentSecond]
  }, copycatView);
  assert.throws(() => protocol.validatePublicEventReceipt({ ...receipt,
    opponentLastTurnAttacks: [{ ...eventRow, barragePairIndex: 0 }],
    opponentCopycatChoices: [{ ...eventRow, barragePairIndex: 0 }]
  }, copycatView), /INCOMPLETE_BARRAGE_PAIR/);
});

test('production actorObservation projection matches the closed worker schema and visibility gates', () => {
  const owner = enginePlayer(0);
  const opponent = enginePlayer(1);
  const mimikyu = engineMimikyu();
  owner.active = enginePokemonSlot(mimikyu);
  const state = { players: [owner, opponent], activePlayer: 0, turn: 1, phase: 2, prompts: [] };
  const view = actorObservation(state, 0, { ownerK1Snapshot: {
    epoch: 1, exactMembershipKnown: true,
    knownPrintings: [{ printing: 'Shadow Rider Calyrex V CRE', copies: 4 }],
    invalidationReason: null
  } });
  protocol.validateActorObservation(view, 0);
  assert.equal(view.ownPublic.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining,null);
  assert.deepEqual(view.ownPublic.active.abilitySuppressions,[]);
  assert.equal(view.ownPublic.active.printing, 'Mimikyu GRI');
  assert.equal(view.ownerK1.knownPrintings[0].copies, 4);

  const secretInHand = fixtureCard('SECRET OPPONENT HAND');
  const faceDownPrize = fixtureCard('SECRET FACE-DOWN PRIZE');
  const faceUpPrize = fixtureCard('PUBLIC FACE-UP PRIZE');
  opponent.hand.cards = [secretInHand];
  opponent.hand.isPublic = false;
  opponent.prizes[0] = { cards: [faceDownPrize], faceUpPrize: false };
  opponent.prizes[1] = { cards: [faceUpPrize], faceUpPrize: true };
  opponent.bench[0] = enginePokemonSlot(engineMimikyu());
  state.phase = 0;
  const setupView = actorObservation(state, 0);
  protocol.validateActorObservation(setupView, 0);
  assert.equal(setupView.opponentPublic.publicHand, null);
  assert.deepEqual(setupView.opponentPublic.prizeSlots, [
    { index: 0 }, { index: 1, printing: 'PUBLIC FACE-UP PRIZE' }
  ]);
  assert.deepEqual(setupView.opponentPublic.bench[0], { concealed: true });
  assert.doesNotMatch(JSON.stringify(setupView.opponentPublic), /SECRET OPPONENT HAND|SECRET FACE-DOWN PRIZE/);
  opponent.hand.cards = [fixtureCard('PUBLIC OPPONENT HAND')];
  opponent.hand.isPublic = true;
  const publicHandView = actorObservation(state, 0);
  protocol.validateActorObservation(publicHandView, 0);
  assert.deepEqual(publicHandView.opponentPublic.publicHand, ['PUBLIC OPPONENT HAND']);
  state.phase = 2;
  state.activePlayer = 1;
  state.prompts = [{ constructor: { name: 'ChooseCardsPrompt' }, playerId: 0, cards: owner.deck }];
  const pendingOwnerView = actorObservation(state, 0);
  protocol.validateActorObservation(pendingOwnerView, 0);
  assert.equal(pendingOwnerView.decisionKind, 'owner-prompt');
  assert.equal(pendingOwnerView.pendingPromptType, 'ChooseCardsPrompt');
  assert.equal(pendingOwnerView.pendingOwnerDeckSearch, true);
});

test('actual Agent7/Agent8 public event receipt passes the worker schema', () => {
  const view = observation(0);
  view.ownPublic.active = mimikyuPokemon();
  const nativeMimikyu = { fullName: 'Mimikyu GRI', name: 'Mimikyu', abilities: [] };
  const activeSlot = { getPokemonCard: () => nativeMimikyu };
  const emptySlot = { getPokemonCard: () => null };
  const owner = {
    id: 0, active: activeSlot, bench: [emptySlot, emptySlot, emptySlot, emptySlot, emptySlot],
    movedToActiveThisTurn: [], marker: { hasMarker: () => false },
    pokemonKnockedOutDuringOpponentsLastTurn: false,
    pokemonKnockedOutByAttackDuringOpponentsLastTurn: false,
    usedSquawkAndSeizeThisTurn: false, usedTableTurner: false
  };
  const opponent = { id: 1 };
  const state = { activePlayer: 0, turn: 1, players: [owner, opponent] };
  const previousAttack = {
    turn: 0, playerId: 1, sourceCardFullName: 'Trevenant & Dusknoir-GX',
    attackName: 'Night Watch', gxAttack: false, copycatAttack: false
  };
  const tracker = {
    getPreviousTurnSnapshot: () => ({ turn: 0, attacks: [previousAttack] }),
    getCopycatChoices: () => [previousAttack]
  };
  const augmented = attachPreviousOpponentTurnReceipt(view, state, 0, tracker);
  protocol.validatePublicEventReceipt(augmented.publicEventReceipt, augmented);
  assert.equal(augmented.publicEventReceipt.mimikyuCopycatCompatible, true);
  assert.equal(augmented.publicEventReceipt.opponentCopycatChoices[0].attackName, 'Night Watch');
  const baseAugmented = attachPreviousOpponentTurnReceipt(view, state, 0, {
    getPreviousTurnSnapshot: () => ({ turn: 0, attacks: [previousAttack] })
  });
  protocol.validatePublicEventReceipt(baseAugmented.publicEventReceipt, baseAugmented);
  assert.equal(baseAugmented.publicEventReceipt.opponentCopycatChoices, null);
  assert.equal(baseAugmented.publicEventReceipt.mimikyuCopycatCompatible, null);
});

test('prompt/root decision mismatch and untrusted policy choices fail closed', async () => {
  const promptView = observation(0, 'owner-prompt', 'ChooseCardsPrompt');
  const prompt = {
    schema: protocol.PROMPT_SCHEMA, actingSeat: 0, promptType: 'ChooseCardsPrompt',
    description: 'Select an owner-visible card',
    source: { classification: 'actor-choice', sourceKind: 'card-effect', sourcePrinting: 'Quick Ball FST', effectName: 'Quick Ball' },
    choices: [{ token: 'choice-1', kind: 'payment', printing: 'Psychic Energy SVE',
      publicMetadata: { sourceZone: 'hand', isOwnerVisible: true } }]
  };
  const promptReq = request(1, 'candidate', 0, {
    observation: promptView, prompt,
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items: [] }
  });
  const worker = startWorker();
  try {
    writeLine(worker.child.stdin, worker.init); await waitForCount(worker, 1);
    writeLine(worker.child.stdin, promptReq); await waitForCount(worker, 2);
    assert.deepEqual(worker.lines[1].decision, { kind: 'select-choice', token: 'choice-1' });
  } finally { await dispose(worker); }

  const rootWithPending = { ...observation(0), pendingPromptType: 'ChooseCardsPrompt' };
  assert.throws(() => protocol.validateActorObservation(rootWithPending, 0), /ROOT_HAS_PENDING_PROMPT/);
  await expectFailure({ ...promptReq, requestId: 'force-action-on-prompt' }, 'ACTION_DURING_PROMPT');
  await expectFailure({ ...request(1), requestId: 'force-choice-on-root' }, 'CHOICE_DURING_ROOT');
  await expectFailure({ ...request(1), requestId: 'force-unknown' }, 'POLICY_SELECTED_UNKNOWN_ACTION');
  const physicalRandomPrompt = { ...promptReq, requestId: 'night-watch', prompt: { ...prompt, source: { classification: 'physical-random', sourceKind: 'card-effect', sourcePrinting: 'Trevenant & Dusknoir-GX', effectName: 'Night Watch' } } };
  assert.throws(() => protocol.validateRequest(physicalRandomPrompt, initFor(), 1, new Set()), /NON_ACTOR_PROMPT_CLASS/);
  const misclassifiedNightWatch = { ...promptReq, requestId: 'misclassified-night-watch', prompt: { ...prompt, source: { classification: 'actor-choice', sourceKind: 'card-effect', sourcePrinting: 'Trevenant & Dusknoir-GX', effectName: 'Night Watch' } } };
  assert.throws(() => protocol.validateRequest(misclassifiedNightWatch, initFor(), 1, new Set()), /HOST_ONLY_PHYSICAL_PROMPT/);
  const unknownSourcePrompt = { ...promptReq, prompt: { ...prompt, source: { classification: 'actor-choice', sourceKind: 'card-effect', sourcePrinting: null, effectName: 'Quick Ball' } } };
  assert.throws(() => protocol.validateRequest(unknownSourcePrompt, initFor(), 1, new Set()), /UNKNOWN_PROMPT_SOURCE/);
  const engineSetupPrompt = { ...promptReq, requestId: 'engine-setup', prompt: { ...prompt, source: { classification: 'actor-choice', sourceKind: 'engine', sourcePrinting: null, effectName: 'ChooseStartingPokemonPrompt' } } };
  protocol.validateRequest(engineSetupPrompt, initFor(), 1, new Set());
  const misattributedEnginePrompt = { ...promptReq, requestId: 'bad-engine-source', prompt: { ...prompt, source: { classification: 'actor-choice', sourceKind: 'engine', sourcePrinting: 'Quick Ball FST', effectName: 'ChooseStartingPokemonPrompt' } } };
  assert.throws(() => protocol.validateRequest(misattributedEnginePrompt, initFor(), 1, new Set()), /BAD_ENGINE_PROMPT_SOURCE/);
  const engineWithCopiedSource = { ...promptReq, requestId: 'engine-copy-source', prompt: { ...prompt, source: { classification: 'actor-choice', sourceKind: 'engine', sourcePrinting: null, effectName: 'ChooseStartingPokemonPrompt', copiedSourcePrinting: 'Trevenant & Dusknoir-GX', copiedAttackName: 'Pale Moon-GX' } } };
  assert.throws(() => protocol.validateRequest(engineWithCopiedSource, initFor(), 1, new Set()), /BAD_ENGINE_PROMPT_SOURCE/);
  const copiedNightWatch = { ...promptReq, requestId: 'copied-night-watch', prompt: { ...prompt, source: { classification: 'actor-choice', sourceKind: 'card-effect', sourcePrinting: 'Mimikyu GRI', effectName: 'Copycat', copiedSourcePrinting: 'Trevenant & Dusknoir-GX', copiedAttackName: 'Night Watch' } } };
  assert.throws(() => protocol.validateRequest(copiedNightWatch, initFor(), 1, new Set()), /HOST_ONLY_PHYSICAL_PROMPT/);
  const copiedPaleMoon = { ...promptReq, requestId: 'copied-pale-moon', prompt: { ...prompt, source: { classification: 'actor-choice', sourceKind: 'card-effect', sourcePrinting: 'Mimikyu GRI', effectName: 'Copycat', copiedSourcePrinting: 'Trevenant & Dusknoir-GX', copiedAttackName: 'Pale Moon-GX' } } };
  protocol.validateRequest(copiedPaleMoon, initFor(), 1, new Set());
  const incompleteCopycat = { ...promptReq, requestId: 'incomplete-copycat', prompt: { ...prompt, source: { classification: 'actor-choice', sourceKind: 'card-effect', sourcePrinting: 'Mimikyu GRI', effectName: 'Copycat' } } };
  assert.throws(() => protocol.validateRequest(incompleteCopycat, initFor(), 1, new Set()), /COPYCAT_SOURCE_MISSING/);
  const partialCopiedSource = { ...promptReq, requestId: 'partial-copycat', prompt: { ...prompt, source: { classification: 'actor-choice', sourceKind: 'card-effect', sourcePrinting: 'Quick Ball FST', effectName: 'Quick Ball', copiedSourcePrinting: 'Trevenant & Dusknoir-GX', copiedAttackName: null } } };
  assert.throws(() => protocol.validateRequest(partialCopiedSource, initFor(), 1, new Set()), /INCOMPLETE_COPIED_PROMPT_SOURCE/);
  assert.throws(() => protocol.validateRequest({ ...request(1), policyRngSeed: 123 }, initFor(), 1, new Set()), /UNKNOWN_FIELD/);
});

test('init binds the exact policy module version and bundle digest shape', async () => {
  assert.throws(() => protocol.validateInit({ ...initFor(), bundleSha256: 'not-a-sha256' }), /BAD_BUNDLE_DIGEST/);
  assert.throws(() => protocol.validateInit({ ...initFor(), role: 'spectator' }), /BAD_ROLE/);
  assert.throws(() => protocol.validateInit({ ...initFor(), seat: 2 }), /BAD_SEAT/);
  const init = initFor('candidate', 0, 'a', 'expected-policy-v2');
  const worker = startWorker(init);
  try {
    fs.writeFileSync(path.join(worker.dir, 'policy.cjs'), policySource('wrong-policy-v2'));
    writeLine(worker.child.stdin, init);
    worker.child.stdin.end();
    await waitForClose(worker);
    assert.notEqual(worker.child.exitCode, 0);
    assert.match(worker.stderr, /POLICY_MODULE_MISMATCH/);
  } finally {
    worker.rl.close();
    fs.rmSync(worker.dir, { recursive: true, force: true });
  }
});

test('sequence, duplicate ID, role drift and oversized NDJSON fail closed', async () => {
  await expectFailure(request(1, 'opponent', 0), 'ROLE_SEAT_CHANGED');
  await expectFailure(request(1, 'candidate', 1), 'ROLE_SEAT_CHANGED');
  await expectFailure(request(2), 'BAD_SEQUENCE');
  const worker = startWorker();
  try {
    writeLine(worker.child.stdin, worker.init); await waitForCount(worker, 1);
    writeLine(worker.child.stdin, request(1)); await waitForCount(worker, 2);
    writeLine(worker.child.stdin, request(2, 'candidate', 0, { requestId: 'req-1' }));
    worker.child.stdin.end(); await waitForClose(worker);
    assert.notEqual(worker.child.exitCode, 0);
    assert.match(worker.stderr, /DUPLICATE_REQUEST_ID/);
  } finally { worker.rl.close(); fs.rmSync(worker.dir, { recursive: true, force: true }); }

  const oversized = startWorker();
  try {
    oversized.child.stdin.write('x'.repeat(protocol.LIMITS.maxLineBytes + 1));
    oversized.child.stdin.end(); await waitForClose(oversized);
    assert.notEqual(oversized.child.exitCode, 0);
    assert.match(oversized.stderr, /LINE_TOO_LARGE/);
  } finally { oversized.rl.close(); fs.rmSync(oversized.dir, { recursive: true, force: true }); }
});

test('public prompt and frontier validators enforce actor-relative metadata contracts', () => {
  assert.equal(typeof protocol.validatePrompt, 'function');
  assert.equal(typeof protocol.validateFrontier, 'function');

  const prompt = {
    schema: protocol.PROMPT_SCHEMA,
    actingSeat: 0,
    promptType: 'ChooseCardsPrompt',
    description: 'Select an owner-visible card',
    source: {
      classification: 'actor-choice',
      sourceKind: 'card-effect',
      sourcePrinting: 'Quick Ball FST',
      effectName: 'Quick Ball'
    },
    choices: [{
      token: 'prompt-0',
      kind: 'card',
      publicMetadata: { ownerSeat: 'actor', selectionIndex: 0, isOwnerVisible: true }
    }, { token: 'cancel-0', kind: 'cancel', label: 'Cancel selection' }],
    publicMetadata: {
      ownerSeat: 'mixed',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: true,
      isSecret: false,
      selectionType: 'card-combination'
    }
  };
  assert.equal(protocol.validatePrompt(prompt, 0), prompt);
  assert.throws(() => protocol.validatePrompt(prompt), /BAD_SEAT/);
  assert.throws(() => protocol.validatePrompt(prompt, 1), /BAD_PROMPT_PROJECTION/);
  assert.throws(() => protocol.validatePrompt({
    ...prompt,
    publicMetadata: { ...prompt.publicMetadata, privateState: true }
  }, 0), /BAD_PROMPT_METADATA/);
  assert.throws(() => protocol.validatePrompt({
    ...prompt,
    publicMetadata: { ...prompt.publicMetadata, ownerSeat: 'seat-1' }
  }, 0), /BAD_PROMPT_METADATA/);
  assert.throws(() => protocol.validatePrompt({
    ...prompt,
    choices: [{ ...prompt.choices[0], publicMetadata: { ownerSeat: 'seat-1' } }]
  }, 0), /BAD_PROMPT_METADATA/);
  assert.doesNotThrow(() => protocol.validatePrompt({
    ...prompt, publicMetadata: { count: protocol.LIMITS.maxArrayItems }
  }, 0));
  assert.throws(() => protocol.validatePrompt({
    ...prompt, publicMetadata: { count: protocol.LIMITS.maxArrayItems + 1 }
  }, 0), /BAD_PROMPT_METADATA/);
  assert.throws(() => protocol.validatePrompt({
    ...prompt, publicMetadata: { selectionIndex: protocol.LIMITS.maxArrayItems }
  }, 0), /BAD_PROMPT_METADATA/);

  const frontier = {
    schema: protocol.FRONTIER_SCHEMA,
    items: [{
      token: 'act-0',
      kind: 'use-ability',
      publicMetadata: {
        ownerSeat: 'actor',
        targetSeat: 'opponent',
        sourceSeat: 'actor',
        targetIndex: 1,
        sourceIndex: 0
      }
    }]
  };
  assert.equal(protocol.validateFrontier(frontier).has('act-0'), true);
  assert.throws(() => protocol.validateFrontier({
    ...frontier,
    items: [{ ...frontier.items[0], publicMetadata: { ...frontier.items[0].publicMetadata, targetSeat: 'bottom' } }]
  }), /BAD_ACTION_SEAT_METADATA/);
  assert.throws(() => protocol.validateFrontier({
    ...frontier,
    items: [{ ...frontier.items[0], publicMetadata: { ...frontier.items[0].publicMetadata, sourceSeat: 'mixed' } }]
  }), /BAD_ACTION_SEAT_METADATA/);
  assert.throws(() => protocol.validateFrontier({
    ...frontier,
    items: [{ ...frontier.items[0], publicMetadata: { ...frontier.items[0].publicMetadata, targetIndex: -1 } }]
  }), /BAD_ACTION_INDEX_METADATA/);
  assert.throws(() => protocol.validateFrontier({
    ...frontier,
    items: [{ ...frontier.items[0], publicMetadata: { ...frontier.items[0].publicMetadata, sourceIndex: 1.5 } }]
  }), /BAD_ACTION_INDEX_METADATA/);
  assert.throws(() => protocol.validateFrontier({
    ...frontier,
    items: [{ ...frontier.items[0], publicMetadata: { ...frontier.items[0].publicMetadata, sourceIndex: undefined } }]
  }), /BAD_ACTION_METADATA/);
});

test('analysis-only projected attack rows cannot be selected as native actions', () => {
  const frontier = {
    schema: protocol.FRONTIER_SCHEMA,
    items: [
      { token: 'native-0', kind: 'attack', attackName: 'Max Geist' },
      { token: 'projection-0', kind: 'projected-attack', attackName: 'Projected Max Geist', publicMetadata: { ownerSeat: 'opponent', targetSeat: 'opponent', sourceSeat: 'actor', targetIndex: 0, sourceIndex: 0, isOwnerVisible: true } }
    ]
  };
  const actionTokens = protocol.validateFrontier(frontier);
  assert.equal(actionTokens.has('native-0'), true);
  assert.equal(actionTokens.has('projection-0'), false);
  assert.throws(() => protocol.validateDecision({
    kind: 'select-action', token: 'projection-0'
  }, null, actionTokens), /POLICY_SELECTED_UNKNOWN_ACTION/);
  assert.throws(() => protocol.validateFrontier({
    schema: protocol.FRONTIER_SCHEMA,
    items: [{ token: 'unknown-0', kind: 'made-up-action' }]
  }), /BAD_ACTION_KIND/);
});

test('typed multi-select decisions enforce unique item tokens, bounds, cancel and order semantics', () => {
  assert.equal(protocol.RESPONSE_SCHEMA, 'aichi-policy-response-v3');
  const source = {
    classification: 'actor-choice',
    sourceKind: 'card-effect',
    sourcePrinting: 'Quick Ball FST',
    effectName: 'Quick Ball'
  };
  const makePrompt = (selectionType, publicMetadata, choices) => ({
    schema: protocol.PROMPT_SCHEMA,
    actingSeat: 0,
    promptType: 'ChooseCardsPrompt',
    description: 'Choose visible items',
    source,
    choices,
    publicMetadata: { selectionType, ...publicMetadata }
  });

  const cardPrompt = makePrompt('card-combination', {
    minimumCount: 1, maximumCount: 2, allowCancel: true
  }, [
    { token: 'card-0', kind: 'card', printing: 'Card A' },
    { token: 'card-1', kind: 'card', printing: 'Card B' },
    { token: 'card-2', kind: 'card', printing: 'Card C' },
    { token: 'cancel-0', kind: 'cancel', label: 'Cancel selection' }
  ]);
  protocol.validatePrompt(cardPrompt, 0);
  assert.throws(() => protocol.validatePrompt(makePrompt('card-combination', {
    minimumCount: 1, maximumCount: 2, allowCancel: false
  }, [{ token: 'combo-0', kind: 'card-set' }]), 0), /BAD_MULTI_SELECT_ITEM_KIND/);
  assert.deepEqual(protocol.validateDecision({
    kind: 'select-choices', tokens: ['card-2', 'card-0']
  }, cardPrompt, new Set()), {
    kind: 'select-choices', tokens: ['card-2', 'card-0']
  });
  assert.throws(() => protocol.validateDecision({
    kind: 'select-choices', tokens: ['card-0', 'card-0']
  }, cardPrompt, new Set()), /DUPLICATE_MULTI_SELECT_TOKEN/);
  assert.throws(() => protocol.validateDecision({
    kind: 'select-choices', tokens: ['card-0', 'missing']
  }, cardPrompt, new Set()), /POLICY_SELECTED_UNKNOWN_CHOICE/);
  assert.throws(() => protocol.validateDecision({
    kind: 'select-choices', tokens: ['card-0', 'card-1', 'card-2']
  }, cardPrompt, new Set()), /BAD_MULTI_SELECT_COUNT/);
  assert.throws(() => protocol.validateDecision({
    kind: 'select-choices', tokens: []
  }, cardPrompt, new Set()), /BAD_MULTI_SELECT_TOKENS/);
  assert.throws(() => protocol.validateDecision({
    kind: 'select-choice', token: 'card-0'
  }, cardPrompt, new Set()), /MULTI_SELECT_REQUIRES_SELECT_CHOICES/);
  assert.deepEqual(protocol.validateDecision({
    kind: 'select-choice', token: 'cancel-0'
  }, cardPrompt, new Set()), { kind: 'select-choice', token: 'cancel-0' });
  assert.throws(() => protocol.validateDecision({
    kind: 'select-choices', tokens: ['card-0', 'cancel-0']
  }, cardPrompt, new Set()), /SPECIAL_CHOICE_IN_MULTI_SELECT/);
  assert.throws(() => protocol.validatePrompt({
    ...cardPrompt, choices: cardPrompt.choices.filter(choice => choice.kind !== 'cancel')
  }, 0), /BAD_MULTI_SELECT_CANCEL_CHOICE/);

  const emptyPrompt = makePrompt('card-combination', {
    minimumCount: 0, maximumCount: 2, allowCancel: false
  }, [
    { token: 'card-0', kind: 'card' },
    { token: 'card-1', kind: 'card' },
    { token: 'empty-0', kind: 'empty-selection', label: 'Choose no cards' }
  ]);
  protocol.validatePrompt(emptyPrompt, 0);
  assert.deepEqual(protocol.validateDecision({
    kind: 'select-choice', token: 'empty-0'
  }, emptyPrompt, new Set()), { kind: 'select-choice', token: 'empty-0' });
  assert.throws(() => protocol.validatePrompt({
    ...emptyPrompt, choices: emptyPrompt.choices.filter(choice => choice.kind !== 'empty-selection')
  }, 0), /BAD_MULTI_SELECT_EMPTY_CHOICE/);

  const zeroCancelablePrompt = makePrompt('card-combination', {
    minimumCount: 0, maximumCount: 1, allowCancel: true
  }, [
    { token: 'card-0', kind: 'card' },
    { token: 'empty-0', kind: 'empty-selection' },
    { token: 'cancel-0', kind: 'cancel' }
  ]);
  protocol.validatePrompt(zeroCancelablePrompt, 0);
  assert.deepEqual(protocol.validateDecision({
    kind: 'select-choice', token: 'empty-0'
  }, zeroCancelablePrompt, new Set()), { kind: 'select-choice', token: 'empty-0' });
  assert.deepEqual(protocol.validateDecision({
    kind: 'select-choice', token: 'cancel-0'
  }, zeroCancelablePrompt, new Set()), { kind: 'select-choice', token: 'cancel-0' });

  const clampedPrompt = makePrompt('card-combination', {
    minimumCount: 1, maximumCount: 3, allowCancel: false
  }, [
    { token: 'available-0', kind: 'card' },
    { token: 'available-1', kind: 'card' }
  ]);
  protocol.validatePrompt(clampedPrompt, 0);
  assert.deepEqual(protocol.validateDecision({
    kind: 'select-choices', tokens: ['available-0', 'available-1']
  }, clampedPrompt, new Set()), {
    kind: 'select-choices', tokens: ['available-0', 'available-1']
  });
  assert.throws(() => protocol.validatePrompt(makePrompt('card-combination', {
    minimumCount: 3, maximumCount: 4, allowCancel: false
  }, [
    { token: 'available-0', kind: 'card' },
    { token: 'available-1', kind: 'card' }
  ]), 0), /BAD_MULTI_SELECT_BOUNDS/);

  const orderPrompt = makePrompt('card-order', {
    count: 3, allowCancel: false
  }, [
    { token: 'order-0', kind: 'card-order-item' },
    { token: 'order-1', kind: 'card-order-item' },
    { token: 'order-2', kind: 'card-order-item' }
  ]);
  protocol.validatePrompt(orderPrompt, 0);
  assert.deepEqual(protocol.validateDecision({
    kind: 'select-choices', tokens: ['order-2', 'order-0', 'order-1']
  }, orderPrompt, new Set()), {
    kind: 'select-choices', tokens: ['order-2', 'order-0', 'order-1']
  });

  const pokemonPrompt = makePrompt('pokemon', {
    minimumCount: 1, maximumCount: 2, allowCancel: false
  }, [
    { token: 'pokemon-0', kind: 'pokemon' },
    { token: 'pokemon-1', kind: 'pokemon' },
    { token: 'pokemon-2', kind: 'pokemon' }
  ]);
  protocol.validatePrompt(pokemonPrompt, 0);
  assert.deepEqual(protocol.validateDecision({
    kind: 'select-choices', tokens: ['pokemon-2', 'pokemon-1']
  }, pokemonPrompt, new Set()), {
    kind: 'select-choices', tokens: ['pokemon-2', 'pokemon-1']
  });

  const energyPrompt = makePrompt('energy-payment', {
    count: 3, energyCount: 3, allowCancel: false
  }, [
    { token: 'energy-0', kind: 'energy' },
    { token: 'energy-1', kind: 'energy' },
    { token: 'energy-2', kind: 'energy' }
  ]);
  protocol.validatePrompt(energyPrompt, 0);
  assert.deepEqual(protocol.validateDecision({
    kind: 'select-choices', tokens: ['energy-1']
  }, energyPrompt, new Set()), { kind: 'select-choices', tokens: ['energy-1'] });

  const prizePrompt = makePrompt('prize-slots', {
    requiredCount: 2, allowCancel: false
  }, [
    { token: 'prize-0', kind: 'prize' },
    { token: 'prize-1', kind: 'prize' },
    { token: 'prize-2', kind: 'prize' }
  ]);
  protocol.validatePrompt(prizePrompt, 0);
  assert.throws(() => protocol.validateDecision({
    kind: 'select-choices', tokens: ['prize-0']
  }, prizePrompt, new Set()), /BAD_MULTI_SELECT_COUNT/);
});

test('persistent worker emits response-v3 ordered multi-select decisions', async () => {
  const worker = startWorker();
  try {
    writeLine(worker.child.stdin, worker.init);
    await waitForCount(worker, 1);
    const prompt = {
      schema: protocol.PROMPT_SCHEMA,
      actingSeat: 0,
      promptType: 'ChooseCardsPrompt',
      description: 'Choose one or two visible cards',
      source: {
        classification: 'actor-choice',
        sourceKind: 'card-effect',
        sourcePrinting: 'Quick Ball FST',
        effectName: 'Quick Ball'
      },
      choices: [
        { token: 'multi-0', kind: 'card', printing: 'Card A' },
        { token: 'multi-1', kind: 'card', printing: 'Card B' },
        { token: 'cancel-0', kind: 'cancel', label: 'Cancel selection' }
      ],
      publicMetadata: {
        selectionType: 'card-combination',
        minimumCount: 1,
        maximumCount: 2,
        allowCancel: true
      }
    };
    const message = request(1, 'candidate', 0, {
      requestId: 'multi-select',
      observation: observation(0, 'owner-prompt', 'ChooseCardsPrompt'),
      prompt
    });
    writeLine(worker.child.stdin, message);
    await waitForCount(worker, 2);
    assert.equal(worker.lines[1].schema, 'aichi-policy-response-v3');
    assert.equal(worker.lines[1].type, 'response');
    assert.deepEqual(worker.lines[1].decision, {
      kind: 'select-choices', tokens: ['multi-1', 'multi-0']
    });
  } finally { await dispose(worker); }
});



test('worker-local policy RNG is independent, reported, and rejects unapproved draws',async()=>{
  const first=protocol.createWorkerLocalPolicyStream();
  const second=protocol.createWorkerLocalPolicyStream();
  assert.equal(first.protocol,'worker-local-independent-crypto-stream-v1');
  assert.equal(first.drawCount,0);
  assert.equal(second.drawCount,0);
  const firstValue=first.next();
  assert.ok(firstValue>=0&&firstValue<1);
  assert.equal(first.drawCount,1);
  assert.equal(second.drawCount,0,'one role worker must not advance another role worker stream');

  const worker=startWorker();
  try {
    writeLine(worker.child.stdin,worker.init);
    await waitForCount(worker,1);
    assert.equal(worker.lines[0].policyDrawCount,0);
    assert.equal(worker.lines[0].policyStreamProtocol,first.protocol);
    writeLine(worker.child.stdin,request(1,'candidate',0,{requestId:'force-rng'}));
    worker.child.stdin.end();
    await waitForClose(worker);
    assert.notEqual(worker.child.exitCode,0);
    assert.match(worker.stderr,/POLICY_RANDOM_DRAWS_UNREPLAYABLE/);
    assert.equal(worker.lines.length,1,'a stochastic policy decision must never reach the host');
  } finally {
    worker.rl.close();
    fs.rmSync(worker.dir,{recursive:true,force:true});
  }
});
