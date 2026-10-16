'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedRaichu, providedEnergy} = require('./temple-raichu-board.cjs');
const {withElectroRainDamageHook} = require('./electro-rain-damage-hook.cjs');

const compiled = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(compiled, name));

/**
 * Run one actual pinned AttackAction from an already established, artificial
 * board. The six Energy cards are directly attached; Extra Energy Bomb and
 * the ordinary attachment are not enacted by these moves.
 *
 * @param {boolean} sixEnergy Add second Counter Energy as the "manual" card.
 * @returns {object}
 */
function raichuMixedBenchPrizeCase(sixEnergy) {
  const energies = [
    'Reversal Energy PAL', 'Reversal Energy PAL',
    'Reversal Energy PAL', 'Reversal Energy PAL',
    'Counter Energy CIN'
  ];
  if (sixEnergy) energies.push('Counter Energy CIN');
  const f = stagedRaichu(energies, null);
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {CardList} = load('game/store/state/card-list');
  const {CardType} = load('game/store/card/card-types');
  const {AttackAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {PlayerType, SlotType} = load('game/store/actions/play-card-action');

  /** @param {string} name */
  const bench = name => {
    const target = new PokemonCardList();
    target.cards.push(f.card(name));
    f.b.bench.push(target);
    return target;
  };
  const vmax = bench('Shadow Rider Calyrex VMAX CRE');
  const v = bench('Shadow Rider Calyrex V CRE');
  const vmaxCard = vmax.getPokemonCard();
  const vCard = v.getPokemonCard();
  f.a.active.tools.push(f.card('Telescopic Sight VIV'));

  for (const [player, prizeCount] of [[f.a, 6], [f.b, 4]]) {
    player.prizes = Array.from({length: prizeCount}, () => {
      const slot = new CardList();
      slot.cards.push(f.card('Psychic Energy SVE'));
      return slot;
    });
    player.deck.cards.push(f.card('Psychic Energy SVE'));
  }
  f.a.active.getPokemonCard().id = 1001;
  f.b.active.getPokemonCard().id = 2001;
  vmaxCard.id = 2002;
  vCard.id = 2003;
  f.attached.forEach((energy, index) => {energy.id = 1100 + index;});
  const provided = providedEnergy(f);
  const lightning = provided.reduce((total, row) =>
    total + row.provides.filter(e => e === CardType.LIGHTNING).length, 0);
  const before = f.a.getPrizeLeft();
  const events = [];
  const attack = () => {
    f.store.dispatch(new AttackAction(101, 'Electro Rain'));
    for (let i = 0; i < 35; i++) {
      const prompt = f.state.prompts.find(p => p.result === undefined);
      if (!prompt) break;
      let choice;
      const type = prompt.constructor.name;
      if (type === 'ChooseCardsPrompt') {
        choice = [...f.attached];
      } else if (type === 'PutDamagePrompt') {
        assert.equal(prompt.damage, sixEnergy ? 480 : 420);
        choice = sixEnergy ? [
          {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0},damage:300},
          {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:1},damage:180}
        ] : [
          {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0},damage:300},
          {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:1},damage:120}
        ];
      } else if (type === 'ChoosePrizePrompt') {
        choice = f.a.prizes.filter(prize => prize.cards.length).slice(0, prompt.options.count);
      } else if (type === 'WaitPrompt') {
        choice = null;
      } else {
        throw new Error('Unexpected six-Energy attack prompt: ' + type);
      }
      assert.ok(prompt.validate(choice, f.state), 'Rejected ' + type + ' choice');
      events.push({type,amount:prompt.damage||null,remainingPrizes:f.a.getPrizeLeft()});
      f.store.dispatch(new ResolvePromptAction(prompt.id, choice));
    }
    assert.ok(!f.state.prompts.some(p => p.result === undefined),
      'Unresolved attack/reward prompts after 35 prompts');
  };
  withElectroRainDamageHook(attack);
  const result = {
    sixEnergy, actualLightningUnits:lightning, printedEnergyCards:f.attached.length,
    prizesBefore:before, prizesAfter:f.a.getPrizeLeft(),
    prizesTaken:before-f.a.getPrizeLeft(),
    vmaxKnockedOut:f.b.discard.cards.some(card => card === vmaxCard),
    vKnockedOut:f.b.discard.cards.some(card => card === vCard),
    remainingVdamage:v.damage,
    events
  };
  return result;
}

function verify() {
  const five=raichuMixedBenchPrizeCase(false);
  const six=raichuMixedBenchPrizeCase(true);
  assert.equal(five.actualLightningUnits, 14);
  assert.equal(six.actualLightningUnits, 16);
  assert.equal(five.prizesTaken, 3);
  assert.equal(five.vmaxKnockedOut, true);
  assert.equal(five.vKnockedOut, false);
  assert.equal(six.prizesTaken, 5);
  assert.equal(six.vmaxKnockedOut, true);
  assert.equal(six.vKnockedOut, true);
  return {kind:'source-printed mixed-Bench conditional damage and Prize resolution',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    caveat:'Both board states are directly staged; no hand attachment, Electrode ability, evolution or game policy',
    five,six};
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(verify(), null, 2) + '\n');
}
module.exports = {raichuMixedBenchPrizeCase, verify};
