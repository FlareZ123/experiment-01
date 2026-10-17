'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {stagedRaichu} = require('./temple-raichu-board.cjs');
const {withRaichuSightToolPolicy} = require('./raichu-sight-tool-tactic.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

/** @returns {object} */
function verifySightReservation() {
  const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), 'utf8'));
  for (const rank of [4, 17]) {
    const deck = manifest.decks.find(row => row.rank === rank);
    assert.ok(deck);
    assert.equal(deck.cards.filter(row =>
      row.name === 'Telescopic Sight').reduce((n, row) => n + row.count, 0), 1);
    assert.equal(deck.cards.filter(row =>
      row.name === 'Alolan Raichu').reduce((n, row) => n + row.count, 0), 2);
  }
  const definitions = load('simple-bot/simple-bot-definitions');
  const originalTactics = definitions.allSimpleTactics;
  const options = {
    tactics: originalTactics,
    promptResolvers: definitions.allPromptResolvers,
    scores: definitions.defaultStateScores,
    arbiter: definitions.defaultArbiterOptions
  };
  const configured = withRaichuSightToolPolicy(options);
  assert.equal(options.tactics, originalTactics);
  assert.notEqual(configured.tactics, originalTactics);
  assert.equal(originalTactics.some(t => t.name === 'RaichuSightAttachToolTactic'), false);
  const cls = configured.tactics.find(t => t.name === 'RaichuSightAttachToolTactic');
  assert.ok(cls);

  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {PlayerType, SlotType} =
    load('game/store/actions/play-card-action');
  const sight = 'Telescopic Sight VIV';
  const raichu = 'Alolan Raichu UNM';

  // If Raichu is ready, Sight goes on the attacker and is actually playable.
  const ready = stagedRaichu(['Unit Energy LPM UPR'], null);
  ready.a.hand.cards.push(ready.card(sight));
  const readyVictim = new PokemonCardList();
  readyVictim.cards.push(ready.card('Shadow Rider Calyrex V CRE'));
  ready.b.bench.push(readyVictim);
  const action = new cls(configured).useTactic(ready.state, ready.a);
  assert.ok(action);
  assert.equal(action.handIndex, 0);
  assert.deepEqual(action.target, {
    player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0
  });
  ready.store.dispatch(action);
  assert.equal(ready.a.active.tools[0].fullName, sight);

  // Early game: a Crobat V cannot consume the singleton before Raichu evolves.
  const early = stagedRaichu([], null);
  early.a.active.cards.splice(0, 1, early.card('Crobat V DAA'));
  early.a.hand.cards.push(early.card(sight));
  assert.equal(new cls(configured).useTactic(early.state, early.a), undefined);
  assert.equal(early.a.active.tools.length, 0);

  // Raichu on the Bench is still the chosen carrier, not Crobat in Active.
  const benched = stagedRaichu([], null);
  const raichuCard = benched.a.active.cards.shift();
  assert.equal(raichuCard.fullName, raichu);
  const bench = new PokemonCardList();
  bench.cards.push(raichuCard);
  benched.a.bench.push(bench);
  benched.a.active.cards.push(benched.card('Crobat V DAA'));
  benched.a.hand.cards.push(benched.card(sight));
  const benchVictim = new PokemonCardList();
  benchVictim.cards.push(benched.card('Shadow Rider Calyrex V CRE'));
  benched.b.bench.push(benchVictim);
  const benchAction = new cls(configured).useTactic(benched.state, benched.a);
  assert.deepEqual(benchAction.target, {
    player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0
  });
  benched.store.dispatch(benchAction);
  assert.equal(bench.tools[0].fullName, sight);
  assert.equal(benched.a.active.tools.length, 0);

  // Even an established Raichu must save Sight when only Active targets exist.
  const inactive = stagedRaichu([], null);
  inactive.a.hand.cards.push(inactive.card(sight));
  assert.equal(new cls(configured).useTactic(inactive.state, inactive.a), undefined);

  // Other Tools can still be selected without removing/reordering the hand.
  const alternative = stagedRaichu([], null);
  alternative.a.active.cards.splice(0, 1, alternative.card('Crobat V DAA'));
  alternative.a.hand.cards.push(alternative.card(sight));
  alternative.a.hand.cards.push(alternative.card('U-Turn Board UNM'));
  const handBefore = alternative.a.hand.cards.slice();
  const tactic = new cls(configured);
  tactic.getStateScore = () =>
    alternative.a.active.tools.some(t => t.fullName === 'U-Turn Board UNM') ? 100 : 0;
  const anotherAction = tactic.useTactic(alternative.state, alternative.a);
  assert.ok(anotherAction);
  assert.equal(anotherAction.handIndex, 1);
  assert.equal(anotherAction.target.slot, SlotType.ACTIVE);
  assert.deepEqual(alternative.a.hand.cards, handBefore);
  assert.equal(alternative.a.active.tools.length, 0);

  return {
    sources: [4, 17],
    preservedSingletonBeforeEvolution: true,
    preservedWithoutBenchedVGX: true,
    sightAttachedToActiveRaichu: ready.a.active.tools[0].fullName === sight,
    sightAttachedToBenchedRaichu: bench.tools[0].fullName === sight,
    otherToolStillSelectable: anotherAction.handIndex === 1,
    vendorTacticsUnmodified: definitions.allSimpleTactics === originalTactics,
    claim: 'Conditional source-policy action fidelity only; no wins sampled'
  };
}
if (require.main === module) console.log(JSON.stringify(verifySightReservation(), null, 2));
module.exports = {verifySightReservation};
