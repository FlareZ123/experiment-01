'use strict';

/**
 * Cross-card printed-text/printed-roster prerequisite audit, with no simulated
 * board or inferred game result. All playability statements are conditional.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { readCard } = require('./agent17-temple-five-lightning-originals.cjs');

const ROOT = path.resolve(__dirname, '..');

/** @param {object} deck @param {string} name @param {string} set @param {string} number @returns {number} */
function copies(deck, name, set, number) {
  return deck.cards.filter((card) =>
    card.name === name &&
    card.printing.set === set &&
    card.printing.number === number
  ).reduce((total, card) => total + card.count, 0);
}

/** @param {object} source @param {object} candidate @returns {object} */
function analyze(source, candidate) {
  assert.equal(source.decks.length, 29);
  assert.equal(copies(candidate, 'Temple of Sinnoh', 'ASR', '155'), 2);
  assert.equal(copies(candidate, 'Wobbuffet', 'PHF', '36'), 1);

  const temple = readCard('swsh10', 'swsh10-155');
  const wobbuffet = readCard('xy4', 'xy4-36');
  const marshadow = readCard('sm10', 'sm10-81');
  const electrode = readCard('sm7', 'sm7-48');
  const rope = readCard('swsh5', 'swsh5-125');
  const raichu = readCard('sm11', 'sm11-57');
  const reversal = readCard('sv2', 'sv2-192');
  const counter = readCard('sm4', 'sm4-100');

  assert.equal(temple.name, 'Temple of Sinnoh');
  assert.ok(temple.rules[0].includes('All Special Energy attached'));
  assert.ok(temple.rules[0].includes('provide Colorless Energy'));
  assert.deepEqual(wobbuffet.types, ['Psychic']);
  assert.match(wobbuffet.abilities[0].text, /except for Psychic Pokémon/);
  assert.deepEqual(marshadow.types, ['Psychic']);
  assert.match(marshadow.abilities[0].text, /if this Pokémon is on your Bench/);
  assert.match(marshadow.abilities[0].text, /discard any Stadium card in play/);
  assert.deepEqual(electrode.types, ['Lightning']);
  assert.match(electrode.abilities[0].text, /attach 5 Energy cards from your discard pile/);
  assert.match(electrode.abilities[0].text, /except Pokémon-GX or Pokémon-EX/);
  assert.match(electrode.abilities[0].text, /this Pokémon is Knocked Out/);
  assert.match(electrode.rules[0], /opponent takes 2 Prize cards/);
  assert.match(rope.rules[0], /Each player switches their Active Pokémon/);
  assert.match(rope.rules[0], /Your opponent switches first/);
  assert.match(reversal.rules[0], /provides Colorless Energy/);
  assert.match(reversal.rules[0], /more Prize cards remaining/);
  assert.match(reversal.rules[0], /Evolution Pokémon that doesn't have a Rule Box/);
  assert.match(reversal.rules[0], /provides only 3 Energy at a time/);
  assert.match(counter.rules[1], /more Prize cards remaining/);
  assert.match(counter.rules[1], /provides only 2 Energy at a time/);
  assert.equal(raichu.subtypes.includes('GX'), false);
  assert.ok(raichu.attacks.some((attack) =>
    attack.name === 'Electro Rain' &&
    attack.cost.includes('Lightning') &&
    attack.text.includes('Discard any amount of Lightning Energy')
  ));

  const originals = [4, 17].map((rank) => {
    const deck = source.decks.find((entry) => entry.rank === rank);
    assert.ok(deck);
    assert.equal(copies(deck, 'Electrode-GX', 'CES', '48'), 3);
    assert.equal(copies(deck, 'Alolan Raichu', 'UNM', '57'), 2);
    assert.equal(copies(deck, 'Escape Rope', 'BST', '125'), 3);
    assert.equal(copies(deck, 'Reversal Energy', 'PAL', '192'), 4);
    assert.equal(copies(deck, 'Counter Energy', 'CIN', '100'), 4);
    assert.equal(copies(deck, 'Unit Energy LPM', 'UPR', '138'), 4);
    assert.equal(copies(deck, 'Marshadow', 'UNB', '81'), rank === 17 ? 1 : 0);

    return {
      rank,
      sourcePlayer: deck.player,
      nonPsychicElectrodeGx: 3,
      escapeRope: 3,
      benchedPsychicMarshadowResettingHole: rank === 17 ? 1 : 0,
      printedRaichuElectroRain: 2,
      reversalEnergy: 4,
      counterEnergy: 4,
      candidateWobbuffetSuppressesElectrodeWhileActive: true,
      candidateWobbuffetPsychicExceptionLeavesMarshadowAbilityIntact: rank === 17,
      possibleConditionalCounterSequence: [
        'Source gets an eligible Alolan Raichu, Voltorb/Electrode-GX and discard Energy established',
        'When the candidate has a Benched Pokémon, source Escape Rope moves candidate Active Wobbuffet to Bench',
        rank === 17
          ? 'Source Benched Marshadow Psychic Resetting Hole can discard Temple despite Wobbuffet Psychic exemption'
          : 'Source has to replace Temple with Sky Field or another legal Stadium-removal effect',
        'Electrode-GX Extra Energy Bomb can then activate absent other Ability lock, attaching five discard Energy and self-Knocking Out for two opponent Prizes',
        'If source is now behind Prizes and a Rule-Box-free Alolan Raichu has the attached Reversal/Counter Energy, their printed typed multi-Energy bonuses can resume after Temple is removed',
        'Only if all game-state and payment requirements are fulfilled can Electro Rain be used'
      ]
    };
  });

  return {
    schema: 'agent17-temple-raichu-cross-lock-printed-conditions-v1',
    candidate: 'Temple Shadow Rider v1',
    checkedCandidateTempleCopies: 2,
    checkedCandidateWobbuffetCopies: 1,
    sourceOriginals: originals,
    bothSourceDecksContainThreeEscapeRopeAndThreeElectrodeGx: true,
    isNaturalGameWitness: false,
    competitivelyQualifiedGames: 0,
    observationBoundary: 'Printed card text and original roster only. Actual source hand, discard, Bench, Stadium access, action order, paper legality under other simultaneous locks and opponent response remain unobserved.'
  };
}

if (require.main === module) {
  const originals = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'results', 'aichi-2026', 'full-decklists.json'), 'utf8'
  ));
  const candidate = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'results', 'aichi-2026', 'candidate-temple-shadow-rider.json'), 'utf8'
  ));
  process.stdout.write(JSON.stringify(analyze(originals, candidate), null, 2) + '\n');
}

module.exports = { analyze, copies };
