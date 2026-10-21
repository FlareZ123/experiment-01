'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedRaichu, providedEnergy} = require('./temple-raichu-board.cjs');
const {withElectroRainDamageHook} = require('./electro-rain-damage-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName @returns {any} */
const load = moduleName => require(path.join(output, moduleName));

/**
 * Reconstruct the public *relevant* board at historical New Moon B root 183.
 * Opponent Bench ordering and identities, source attacker and attached Energy,
 * Sky Field, printed cards, and 6:4 Prizes are drawn from the unchanged
 * archived pre-attack public snapshot. Hidden hand/deck and turn history are
 * not reconstructed; this is an injected-Store attack test, NOT a fork of
 * the actual historical game.
 *
 * @returns {ReturnType<typeof stagedRaichu>}
 */
function publicRoot183Fixture() {
  const f = stagedRaichu(
    ['Reversal Energy PAL', 'Counter Energy CIN'], 'Sky Field ROS');
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {CardList} = load('game/store/state/card-list');

  f.b.active.cards.splice(0, f.b.active.cards.length, f.card('Mewtwo & Mew-GX UNM'));
  const benchPrintings = [
    "Lillie's Clefairy ex JTG",
    'Gengar & Mimikyu-GX TEU',
    'Latias ex SSP',
    'Tapu Lele-GX GRI',
    'Dusclops SFA',
    'Unown AOR',
    'Galarian Articuno V CRE',
    'Unown AOR'
  ];
  for (const printing of benchPrintings) {
    const slot = new PokemonCardList();
    slot.cards.push(f.card(printing));
    f.b.bench.push(slot);
  }

  for (const [side, count] of [[f.a, 6], [f.b, 4]]) {
    side.prizes = Array.from({length:count}, () => {
      const slot = new CardList();
      slot.cards.push(f.card('Psychic Energy SVE'));
      return slot;
    });
    // A real attack can resolve Prize prompts against these arbitrary,
    // deliberately uninspected physical prize-card placeholders.
    side.deck.cards.push(f.card('Psychic Energy SVE'));
  }
  let physicalId = 1000;
  for (const side of [f.a, f.b]) {
    for (const slot of [side.active, ...side.bench, ...side.prizes]) {
      for (const card of slot.cards) card.id = physicalId++;
    }
    for (const card of side.deck.cards) card.id = physicalId++;
  }
  assert.equal(f.b.bench.length, 8);
  assert.deepEqual([f.b.bench[5], f.b.bench[7]].map(
    slot => [slot.getPokemonCard().name, slot.getPokemonCard().hp]),
  [['Unown', 60], ['Unown', 60]]);
  return f;
}

/**
 * Use a genuine pinned Store AttackAction. For Electro Rain, select a
 * declared 60/60/30 attack-damage allocation: two Unown and opposing Active.
 * Use actual native damage prompts, native KO/Prize resolution, and the
 * existing opt-in attack-damage correction (upstream models Rain as counters).
 * The control Electric Ball attack is resolved on a separate identical
 * staged public board, with identical physical initial slot IDs.
 *
 * @param {'Electric Ball'|'Electro Rain'} name Printed attack.
 * @returns {object}
 */
function runNativeStagedAttack(name) {
  const f = publicRoot183Fixture();
  const {AttackAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} =
    load('game/store/actions/resolve-prompt-action');
  const {PlayerType, SlotType} =
    load('game/store/actions/play-card-action');
  const {CardType} = load('game/store/card/card-types');
  const provided = providedEnergy(f);
  const units = provided.reduce((total, row) =>
    total + row.provides.filter(type =>
      type === CardType.ANY || type === CardType.LIGHTNING).length, 0);
  assert.deepEqual(provided.map(row => row.provides.length), [3, 2]);
  assert.equal(units, 5);

  const before = {
    prizes: f.a.getPrizeLeft(),
    activeDamage: f.b.active.damage,
    unownDamage: [f.b.bench[5].damage, f.b.bench[7].damage]
  };
  const promptTypes = [];
  let packetBudget = null;
  const resolve = () => {
    f.store.dispatch(new AttackAction(f.a.id, name));
    for (let i=0;i<35;i++) {
      const prompt = f.state.prompts.find(row => row.result === undefined);
      if (!prompt) break;
      const type = prompt.constructor.name;
      let choice;
      if (type === 'ChooseCardsPrompt') {
        choice = f.attached.slice();
      } else if (type === 'PutDamagePrompt') {
        packetBudget = prompt.damage;
        assert.equal(prompt.damage, 150);
        choice = [
          {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:5},damage:60},
          {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:7},damage:60},
          {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.ACTIVE,index:0},damage:30}
        ];
      } else if (type === 'ChoosePrizePrompt') {
        choice = f.a.prizes.filter(slot => slot.cards.length)
          .slice(0, prompt.options.count);
      } else if (type === 'WaitPrompt') {
        choice = null;
      } else {
        throw new Error('Unknown native attack prompt '+type);
      }
      assert.ok(prompt.validate(choice, f.state),
        'Native prompt rejected '+type);
      promptTypes.push(type);
      f.store.dispatch(new ResolvePromptAction(prompt.id, choice));
    }
    assert.ok(!f.state.prompts.some(row => row.result === undefined),
      'Unsettled attack prompt after 35 responses');
  };
  if (name === 'Electro Rain') withElectroRainDamageHook(resolve);
  else resolve();

  const after = {
    prizes: f.a.getPrizeLeft(),
    activeDamage: f.b.active.damage,
    unownDamage: [f.b.bench[5].damage, f.b.bench[7].damage],
    sourceEnergy: f.a.active.energies.cards.map(card => card.fullName),
    discardedUnown: f.b.discard.cards.filter(card =>
      card.name === 'Unown').length,
    opponentBenchOccupied: f.b.bench.filter(slot =>
      slot.getPokemonCard()).length
  };
  return {
    name,printedLightningUnits:units,before,after,
    prizeGain:before.prizes-after.prizes,
    packetBudget,promptTypes,
    qualification:'staged-real-Store-public-board-attack-only',
    context:'Historical Aichi rank4 versus New Moon B root183, not a live game replay'
  };
}

/** @returns {object} */
function verify() {
  const electricBall=runNativeStagedAttack('Electric Ball');
  const rain=runNativeStagedAttack('Electro Rain');
  assert.equal(electricBall.prizeGain, 0);
  assert.equal(electricBall.after.activeDamage, 90);
  assert.equal(electricBall.after.discardedUnown, 0);
  assert.equal(rain.packetBudget, 150);
  assert.equal(rain.prizeGain, 2);
  assert.equal(rain.after.discardedUnown, 2);
  assert.equal(rain.after.activeDamage, 30);
  assert.deepEqual(rain.after.sourceEnergy, []);
  return {
    schema:'agent45-historical-public-root183-native-attack-choice-v1',
    rank:4, opponent:'New Moon Lockbreaker v1',
    actualHistoricalAttack:'Electric Ball',
    prerequisite:'6 to 4 source Prize deficit, attached PAL Reversal + CIN Counter',
    electricBall,rain,competitiveQualified:false
  };
}

if (require.main === module) console.log(JSON.stringify(verify(), null, 2));
module.exports={publicRoot183Fixture,runNativeStagedAttack,verify};
