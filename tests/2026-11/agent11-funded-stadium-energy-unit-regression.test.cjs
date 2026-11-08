'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  VERSION, estimatedAttackDamage, publicEnergyContext,
  chooseFundedStadiumAttack, attachedEnergyUnits
} = require('../../simulation/twinleaf/agent7-funded-stadium-attack-planner.cjs');

const types = {
  GRASS: 1, FIRE: 2, WATER: 3, LIGHTNING: 4,
  PSYCHIC: 5, FIGHTING: 6, DARK: 7, METAL: 8,
  COLORLESS: 9, FAIRY: 10, DRAGON: 11
};
const refs = {
  cardTypes: types, stageBasic: 2,
  specialConditions: {ASLEEP: 3, PARALYZED: 4},
  trainerCatalog: new Map([
    ['Dimension Valley PHF', {name: 'Dimension Valley', type: 'Stadium'}]
  ])
};

/** @param {string[]} opposingEnergies @returns {object} */
function sourceView(opposingEnergies) {
  return {
    decisionKind: 'owner-root',
    actorSeat: 0,
    globalTurn: 16,
    ownHand: ['Dimension Valley PHF'],
    ownPublic: {
      active: {
        name: 'Tapu Lele-GX',
        printing: 'Tapu Lele-GX GRI',
        printed: {stage: 2, types: [types.PSYCHIC]},
        energies: ['Psychic Energy SVE'],
        attacks: [{
          name: 'Energy Drive', cost: [types.COLORLESS, types.COLORLESS],
          damage: 0, gxAttack: false
        }],
        publicRestrictions: {cannotUseAttacksNextTurn: []},
        specialConditions: []
      },
      stadium: [], prizeCount: 6,
      publicTurnRestrictions: {attackLockTurnsRemaining: 0}
    },
    opponentPublic: {
      active: {
        name: 'Latias ex', printing: 'Latias ex SSP',
        printed: {stage: 2, types: [types.PSYCHIC]},
        energies: opposingEnergies, hp: 210, damage: 0
      },
      stadium: [], prizeCount: 6
    },
    ownTurnResources: {
      stadiumPlayLocked: false,
      stadiumPlayedTurn: 0
    }
  };
}

/** @param {object} view @returns {number|null} */
function damage(view) {
  return estimatedAttackDamage(
    view.ownPublic.active.attacks[0], view.ownPublic.active,
    view.opponentPublic.active, view, refs
  );
}

test('source-shaped single-unit Energy Drive stays 80', () => {
  assert.equal(VERSION, 'agent7-owner-funded-attack-stadium-paper-preflight-v3');
  const view = sourceView([
    'Psychic Energy SVE', 'Psychic Energy SVE', 'Psychic Energy SVE'
  ]);
  assert.equal(damage(view), 80);
  assert.equal(chooseFundedStadiumAttack(view, refs).baseDamage, 80);
});

test('two opposing Double Colorless cards supply four Energy units', () => {
  const view = sourceView([
    'Double Colorless Energy NXD', 'Double Colorless Energy NXD'
  ]);
  assert.equal(view.opponentPublic.active.energies.length, 2);
  assert.equal(damage(view), 100);
  const proposal = chooseFundedStadiumAttack(view, refs);
  assert.equal(proposal?.baseDamage, 100);
  assert.equal(proposal?.damageModel, 'energy-drive-20x-energy-units-both-actives');
});

test('one opposing Double Colorless supplies two Energy units, below 80 floor', () => {
  const view = sourceView(['Double Colorless Energy NXD']);
  assert.equal(damage(view), 60);
  assert.equal(chooseFundedStadiumAttack(view, refs), null);
});

test('unknown Special Energy gives no optimistic damage proposal', () => {
  const view = sourceView(['Undocumented Energy XYZ']);
  assert.equal(damage(view), null);
  assert.equal(chooseFundedStadiumAttack(view, refs), null);
});

test('conditional opposing Reversal Energy uses the opposing Prize perspective', () => {
  const view = sourceView(['Reversal Energy PAL']);
  view.opponentPublic.active.name = 'Exeggutor';
  view.opponentPublic.active.printed.stage = 3;
  view.ownPublic.prizeCount = 4;
  view.opponentPublic.prizeCount = 6;
  const opposingContext = publicEnergyContext(
    {ownPublic: view.opponentPublic, opponentPublic: view.ownPublic},
    view.opponentPublic.active, types, refs.stageBasic
  );
  assert.equal(opposingContext.hasRuleBox, false);
  assert.equal(opposingContext.isPokemonGXorEX, false);
  assert.equal(opposingContext.behindOnPrizes, true);
  assert.equal(attachedEnergyUnits(view.opponentPublic.active, opposingContext), 3);
  assert.equal(damage(view), 80);
  assert.equal(chooseFundedStadiumAttack(view, refs)?.baseDamage, 80);
  view.ownPublic.prizeCount = 6;
  view.opponentPublic.prizeCount = 4;
  assert.equal(damage(view), 40);
});

test('Exeggutor is no Pokemon-EX; Counter Energy double is possible behind', () => {
  const view = sourceView(['Counter Energy CIN']);
  view.opponentPublic.active.name = 'Exeggutor';
  view.opponentPublic.active.printed.stage = 3;
  view.ownPublic.prizeCount = 4;
  view.opponentPublic.prizeCount = 6;
  assert.equal(damage(view), 60);
  view.opponentPublic.active.name = 'Regidrago-GX';
  assert.equal(damage(view), 40);
});

test('Evolution Rule Box stops Reversal triple unit even when behind', () => {
  const view = sourceView(['Reversal Energy PAL']);
  view.opponentPublic.active.name = 'Regidrago VSTAR';
  view.opponentPublic.active.printed.stage = 3;
  view.ownPublic.prizeCount = 4;
  view.opponentPublic.prizeCount = 6;
  const context = publicEnergyContext(
    {ownPublic: view.opponentPublic, opponentPublic: view.ownPublic},
    view.opponentPublic.active, types, refs.stageBasic
  );
  assert.equal(context.hasRuleBox, true);
  assert.equal(damage(view), 40);
});

test('actual Basic Radiant Pokémon is recognized as having a Rule Box', () => {
  const view = sourceView(['Psychic Energy SVE']);
  view.opponentPublic.active.name = 'Radiant Gardevoir';
  const context = publicEnergyContext(
    {ownPublic: view.opponentPublic, opponentPublic: view.ownPublic},
    view.opponentPublic.active, types, refs.stageBasic
  );
  assert.equal(context.isBasic, true);
  assert.equal(context.hasRuleBox, true);
});
