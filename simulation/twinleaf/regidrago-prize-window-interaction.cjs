'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { preparedRegidrago } = require('./apex-attack-action.cjs');
const { createRegidragoPrizeWindowResolver } = require('./regidrago-prize-window-resolver.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

/** A deliberately chosen state where copied Bench counters are decisive. */
function runReadyBoardChoice(usePrizeResolver) {
  const manager = initializeCards();
  const get = name => manager.getCardByName(name);
  const { AttackAction } = load('game/store/actions/game-actions');
  const { ResolvePromptAction } = load('game/store/actions/resolve-prompt-action');
  const { PlayerType, SlotType } = load('game/store/actions/play-card-action');
  const { ChooseAttackPromptResolver } = load('simple-bot/prompt-resolver/choose-attack-prompt-resolver');
  const { defaultStateScores } = load('simple-bot/simple-bot-definitions');
  const ready = preparedRegidrago();
  ready.attachFire();
  ready.defending.active.cards.length = 0;
  const mimikyu = get('Mimikyu PAL');
  const budew = get('Budew ASC');
  const dragapult = get('Dragapult ex TWM');
  const goodra = get('Hisuian Goodra VSTAR LOR');
  assert.ok(mimikyu && budew && dragapult && goodra);
  ready.defending.active.cards.push(mimikyu);
  const bench = ready.defending.bench[0];
  bench.cards.push(budew);
  ready.attacking.discard.cards.push(dragapult, goodra);
  const prizesBefore = ready.attacking.prizes.length;

  ready.store.dispatch(new AttackAction(ready.attacking.id, 'Apex Dragon'));
  const prompt = ready.state.prompts.find(p => p.result === undefined && p.constructor.name === 'ChooseAttackPrompt');
  assert.ok(prompt);
  const Baseline = new ChooseAttackPromptResolver({ scores: defaultStateScores });
  const Resolver = createRegidragoPrizeWindowResolver();
  const proposed = new Resolver({});
  const chosen = usePrizeResolver ?
    proposed.resolvePrompt(ready.state, ready.attacking, prompt) :
    Baseline.resolvePrompt(ready.state, ready.attacking, prompt);
  assert.ok(chosen?.result, 'Copied attack must be chosen');
  ready.store.dispatch(chosen);
  const damagePrompt = ready.state.prompts.find(p => p.result === undefined && p.constructor.name === 'PutDamagePrompt');
  if (damagePrompt) {
    ready.store.dispatch(new ResolvePromptAction(damagePrompt.id, [{
      target: { player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index: 0 },
      damage: 60
    }]));
  }
  const prizesAfter = ready.attacking.prizes.length;
  const budewKnockedOut = ready.defending.discard.cards.includes(budew);
  return {
    chosen: chosen.result.name,
    safeguardDamage: ready.defending.active.damage,
    budewKnockedOut,
    benchRemainingCard: bench.getPokemonCard()?.fullName || null,
    benchDamage: bench.damage,
    prizesTaken: prizesBefore - prizesAfter,
    scope: 'Injected established board with active Mimikyu PAL and benched 30HP Budew; one normal AttackAction'
  };
}

function compareReadyBoardChoices() {
  const baseline = runReadyBoardChoice(false);
  const experiment = runReadyBoardChoice(true);
  assert.equal(baseline.chosen, 'Rolling Iron');
  assert.equal(experiment.chosen, 'Phantom Dive');
  assert.equal(baseline.safeguardDamage, 0, 'Mimikyu Safeguard must prevent the VSTAR damage');
  assert.equal(experiment.safeguardDamage, 0, 'Mimikyu Safeguard must prevent copied VSTAR damage');
  assert.equal(baseline.budewKnockedOut, false);
  assert.equal(experiment.budewKnockedOut, true, 'Phantom Dive should KO vulnerable Budew');
  assert.equal(experiment.prizesTaken, 1, 'Bench KO should yield one Prize card');
  return { baseline, experiment,
    evidenceLevel: 'Tactical counterexample under deterministic injected board, no representative matches' };
}
if (require.main === module) console.log(JSON.stringify(compareReadyBoardChoices(), null, 2));
module.exports = { compareReadyBoardChoices };
