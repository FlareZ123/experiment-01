'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {stageSourceBunnelbyBoard} = require('./bunnelby-tm-policy-replay.cjs');
const {initializeCards} = require('./headless.cjs');
const {inspectTmEvolutionPass} = require('./tm-evolution-pass-evidence.cjs');

const compiled = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(compiled, name));

/**
 * Source-printing conditioned reconstruction of the rank-2 turn-56 public
 * Bunnelby/Gloom attack resource state. Hidden deck and Prize ordering was
 * not archived; this is a staged feasibility control, not an exact replay.
 */
function stageTurn56Evolution() {
  const {fixture: f} = stageSourceBunnelbyBoard();
  const manager = initializeCards();
  /** @param {string} printing */
  const get = printing => {
    const card = manager.getCardByName(printing);
    assert.ok(card, 'Pinned printing missing: ' + printing);
    return card;
  };
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  f.state.turn = 56;
  f.attacker.bench.splice(0, f.attacker.bench.length);
  const groups = [
    ['Budew ASC'],
    ['Pidgey MEW', 'Pidgeotto TEU', 'Pidgeot ex OBF'],
    ['Jirachi XYP'],
    ['Bunnelby PRC'],
    ['Oddish UNB', 'Gloom UNB']
  ];
  for (const printings of groups) {
    const slot = new PokemonCardList();
    slot.cards.push(...printings.map(get));
    f.attacker.bench.push(slot);
  }
  f.attacker.bench[4].pokemonPlayedTurn = 56;
  f.attacker.hand.cards.splice(0, f.attacker.hand.cards.length,
    ...['Vileplume-GX CEC', 'Cassius XY', 'Vileplume AOR'].map(get));
  // Ten otherwise plausible cards mimic the remaining deck count. Exactly
  // one live matching Stage 2 is a *measured* condition of the original pass.
  const deckNames = ['Vileplume AOR', 'Artazon PAL', 'Grass Energy MEE',
    'Tag Call CEC', 'Plumeria BUS', 'Karen XYP', 'Faba LOT',
    'Lusamine CIN', 'Fan Rotom SCR', 'Stealthy Hood UNB'];
  f.attacker.deck.cards.splice(0, f.attacker.deck.cards.length,
    ...deckNames.map(get));
  const evidence = inspectTmEvolutionPass(f.attacker);
  assert.equal(evidence.targetCount, 1);
  assert.deepEqual(evidence.possibleBenchTargets[4].evolutionPrintings,
    ['Vileplume AOR']);
  let cardId = 50000;
  for (const zone of [f.attacker.active, f.attacker.hand, f.attacker.deck,
    ...f.attacker.bench]) {
    for (const card of zone.cards) card.id = ++cardId;
  }
  for (const tool of f.attacker.active.tools) tool.id = ++cardId;
  return {fixture: f, evidence};
}

/**
 * Validate that the actual pinned Store accepts the Tool attack and permits
 * this-turn Gloom to evolve using one known remaining Stage 2 target.
 */
function testTurn56Evolution() {
  const {fixture: f, evidence} = stageTurn56Evolution();
  const {AttackAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {CheckPokemonAttacksEffect} =
    load('game/store/effects/check-effects');
  const attacks = new CheckPokemonAttacksEffect(f.attacker).attacks;
  assert.ok(attacks.some(attack => attack.name === 'Evolution'),
    'Tool-provided Evolution attack must be listed');
  f.store.dispatch(new AttackAction(f.attacker.id, 'Evolution'));
  const prompts = [];
  for (let i = 0; i < 30; i++) {
    if (f.attacker.bench[4].getPokemonCard()?.name === 'Vileplume') break;
    const prompt = f.store.state.prompts.find(p => p.result === undefined);
    assert.ok(prompt, 'Evolution attack resolution requires next prompt');
    const kind = prompt.constructor.name;
    let choice;
    if (kind === 'WaitPrompt') choice = null;
    else if (kind === 'ChoosePokemonPrompt') {
      choice = [f.attacker.bench[4]];
    } else if (kind === 'ChooseCardsPrompt') {
      choice = f.attacker.deck.cards.filter(card => card.fullName === 'Vileplume AOR');
      assert.equal(choice.length, 1, 'Need one target Stage 2 in deck');
    } else if (kind === 'ShuffleDeckPrompt') {
      choice = Array.from({length:f.attacker.deck.cards.length},(_,i)=>i);
    } else {
      throw new Error('Unexpected pinned prompt: ' + kind);
    }
    prompts.push(kind);
    f.store.dispatch(new ResolvePromptAction(prompt.id, choice));
  }
  assert.equal(f.attacker.bench[4].getPokemonCard()?.name, 'Vileplume');
  return {
    acceptedAttack: 'Evolution',
    publicResourceCondition: 'Active Bunnelby + Jet Energy + TM Evolution, Benched Gloom',
    targetPrinting: 'Vileplume AOR',
    stagedGloomJustEvolvedThisTurn: true,
    targetCount: evidence.targetCount,
    prompts,
    caveat: 'Conditioned Store feasibility control, NOT exact turn-56 hidden state or complete-game policy replay'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(testTurn56Evolution(), null, 2) + '\n');
}
module.exports = {stageTurn56Evolution, testTurn56Evolution};
