'use strict';

function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k)) throw new TypeError('choose requires integers');
  if (k < 0 || k > n || n < 0) return 0;
  let value = 1;
  for (let i = 1; i <= Math.min(k, n - k); i += 1) value = value * (n - i + 1) / i;
  return value;
}

function hypergeometricDraw(energyInDeck, nonEnergyInDeck, drawCount) {
  const deckSize = energyInDeck + nonEnergyInDeck;
  const drawn = Math.min(drawCount, deckSize);
  if (drawn === 0) return [{ energy: 0, nonEnergy: 0, probability: 1 }];
  const denominator = choose(deckSize, drawn);
  const outcomes = [];
  for (let energy = Math.max(0, drawn - nonEnergyInDeck); energy <= Math.min(drawn, energyInDeck); energy += 1) {
    const nonEnergy = drawn - energy;
    outcomes.push({ energy, nonEnergy, probability: choose(energyInDeck, energy) * choose(nonEnergyInDeck, nonEnergy) / denominator });
  }
  return outcomes;
}

function addState(map, state, probability) {
  const key = [state.handEnergy, state.deckEnergy, state.deckNonEnergy, state.attached].join('|');
  map.set(key, (map.get(key) || 0) + probability);
}

function decodeState(key, probability) {
  const [handEnergy, deckEnergy, deckNonEnergy, attached] = key.split('|').map(Number);
  return { handEnergy, deckEnergy, deckNonEnergy, attached, probability };
}

function drawFromStates(states, drawCount) {
  const next = new Map();
  for (const [key, probability] of states) {
    const state = decodeState(key, probability);
    for (const outcome of hypergeometricDraw(state.deckEnergy, state.deckNonEnergy, drawCount)) {
      addState(next, {
        handEnergy: state.handEnergy + outcome.energy,
        deckEnergy: state.deckEnergy - outcome.energy,
        deckNonEnergy: state.deckNonEnergy - outcome.nonEnergy,
        attached: state.attached
      }, probability * outcome.probability);
    }
  }
  return next;
}

function exactUnderworldDoorEnergyRace(options = {}) {
  const {
    totalCardsAfterBoard = 57,
    energyCountAfterBoard = 11,
    handSize = 7,
    prizeCount = 6,
    doorCounts = [2, 2],
    initialAttached = 0,
    targetAttached = 5,
    guaranteedEnergySearchBeforeTurn2 = false
  } = options;
  const values = [totalCardsAfterBoard, energyCountAfterBoard, handSize, prizeCount, initialAttached, targetAttached];
  if (values.some(x => !Number.isInteger(x) || x < 0) ||
      energyCountAfterBoard > totalCardsAfterBoard ||
      initialAttached > 1 ||
      initialAttached > energyCountAfterBoard ||
      initialAttached > totalCardsAfterBoard ||
      typeof guaranteedEnergySearchBeforeTurn2 !== 'boolean' ||
      !Array.isArray(doorCounts) || doorCounts.length !== 2 ||
      doorCounts.some(x => !Number.isInteger(x) || x < 0 || x > 4)) {
    throw new Error('Invalid energy-race configuration');
  }

  const unknownCards = totalCardsAfterBoard - initialAttached;
  const unknownEnergy = energyCountAfterBoard - initialAttached;
  if (handSize + prizeCount > unknownCards) throw new Error('Hand and Prize sizes exceed the unknown population');

  const initial = new Map();
  const handDenominator = choose(unknownCards, handSize);
  const remainingAfterHand = unknownCards - handSize;
  const prizeDenominator = choose(remainingAfterHand, prizeCount);

  for (let handEnergy = Math.max(0, handSize - (unknownCards - unknownEnergy));
    handEnergy <= Math.min(handSize, unknownEnergy); handEnergy += 1) {
    const handProbability = choose(unknownEnergy, handEnergy) *
      choose(unknownCards - unknownEnergy, handSize - handEnergy) / handDenominator;
    const remainingEnergy = unknownEnergy - handEnergy;
    const remainingNonEnergy = unknownCards - unknownEnergy - (handSize - handEnergy);
    const minPrizeEnergy = Math.max(0, prizeCount - remainingNonEnergy);
    const maxPrizeEnergy = Math.min(prizeCount, remainingEnergy);

    for (let prizeEnergy = minPrizeEnergy; prizeEnergy <= maxPrizeEnergy; prizeEnergy += 1) {
      const prizeProbability = choose(remainingEnergy, prizeEnergy) *
        choose(remainingNonEnergy, prizeCount - prizeEnergy) / prizeDenominator;
      addState(initial, {
        handEnergy,
        deckEnergy: remainingEnergy - prizeEnergy,
        deckNonEnergy: remainingNonEnergy - (prizeCount - prizeEnergy),
        attached: initialAttached
      }, handProbability * prizeProbability);
    }
  }

  const initialMass = [...initial.values()].reduce((a, b) => a + b, 0);
  if (Math.abs(initialMass - 1) > 1e-10) throw new Error('Initial deal mass is ' + initialMass + ', expected 1');

  let states = initial;
  if (guaranteedEnergySearchBeforeTurn2) {
    const afterSearch = new Map();
    for (const [key, probability] of states) {
      const state = decodeState(key, probability);
      if (state.deckEnergy > 0) {
        state.deckEnergy -= 1;
        state.handEnergy += 1;
      }
      addState(afterSearch, state, probability);
    }
    states = afterSearch;
  }

  for (const doors of doorCounts) {
    states = drawFromStates(states, 1);
    for (let use = 0; use < doors; use += 1) {
      const next = new Map();
      for (const [key, probability] of states) {
        const state = decodeState(key, probability);
        if (state.handEnergy === 0) {
          addState(next, state, probability);
          continue;
        }
        const afterAttach = {
          handEnergy: state.handEnergy - 1,
          deckEnergy: state.deckEnergy,
          deckNonEnergy: state.deckNonEnergy,
          attached: state.attached + 1
        };
        for (const outcome of hypergeometricDraw(afterAttach.deckEnergy, afterAttach.deckNonEnergy, 2)) {
          addState(next, {
            handEnergy: afterAttach.handEnergy + outcome.energy,
            deckEnergy: afterAttach.deckEnergy - outcome.energy,
            deckNonEnergy: afterAttach.deckNonEnergy - outcome.nonEnergy,
            attached: afterAttach.attached
          }, probability * outcome.probability);
        }
      }
      states = next;
    }
    const afterManual = new Map();
    for (const [key, probability] of states) {
      const state = decodeState(key, probability);
      if (state.handEnergy > 0) {
        state.handEnergy -= 1;
        state.attached += 1;
      }
      addState(afterManual, state, probability);
    }
    states = afterManual;
  }

  const finalMass = [...states.values()].reduce((a, b) => a + b, 0);
  if (Math.abs(finalMass - 1) > 1e-10) throw new Error('Final deal mass is ' + finalMass + ', expected 1');

  const distribution = {};
  let meanAttached = 0;
  let probabilityAtLeastTarget = 0;
  for (const [key, probability] of states) {
    const state = decodeState(key, probability);
    distribution[state.attached] = (distribution[state.attached] || 0) + probability;
    meanAttached += state.attached * probability;
    if (state.attached >= targetAttached) probabilityAtLeastTarget += probability;
  }

  return {
    config: {
      totalCardsAfterBoard, energyCountAfterBoard, handSize, prizeCount,
      doorCounts: [...doorCounts], initialAttached, targetAttached,
      unknownCards, unknownEnergy, startingDeckSize: unknownCards - handSize - prizeCount,
      guaranteedEnergySearchBeforeTurn2
    },
    distribution: Object.fromEntries(Object.entries(distribution).sort((a, b) => Number(a[0]) - Number(b[0]))),
    meanAttached,
    probabilityAtLeastTarget,
    evidenceClass: 'exact finite-population conditional submodel; not a game or matchup result'
  };
}

if (require.main === module) {
  const scenarios = [
    { label: 'no FSS; H6 A0', totalCardsAfterBoard: 57, handSize: 6, initialAttached: 0, guaranteedEnergySearchBeforeTurn2: false },
    { label: 'no FSS; H5 A1', totalCardsAfterBoard: 57, handSize: 5, initialAttached: 1, guaranteedEnergySearchBeforeTurn2: false },
    { label: 'FSS already attached and usable; H5 A0', totalCardsAfterBoard: 56, handSize: 5, initialAttached: 0, guaranteedEnergySearchBeforeTurn2: true },
    { label: 'FSS already attached and usable; H4 A1', totalCardsAfterBoard: 56, handSize: 4, initialAttached: 1, guaranteedEnergySearchBeforeTurn2: true }
  ];
  for (const scenario of scenarios) {
    const baseline = exactUnderworldDoorEnergyRace({
      totalCardsAfterBoard: scenario.totalCardsAfterBoard,
      energyCountAfterBoard: 11,
      handSize: scenario.handSize,
      initialAttached: scenario.initialAttached,
      guaranteedEnergySearchBeforeTurn2: scenario.guaranteedEnergySearchBeforeTurn2,
      doorCounts: [2, 2]
    });
    const fourVMAX = exactUnderworldDoorEnergyRace({
      totalCardsAfterBoard: scenario.totalCardsAfterBoard,
      energyCountAfterBoard: 11,
      handSize: scenario.handSize,
      initialAttached: scenario.initialAttached,
      guaranteedEnergySearchBeforeTurn2: scenario.guaranteedEnergySearchBeforeTurn2,
      doorCounts: [4, 4]
    });
    console.log(JSON.stringify({
      scenario: scenario.label,
      twoVMAXEachTurn: baseline.probabilityAtLeastTarget,
      fourVMAXEachTurn: fourVMAX.probabilityAtLeastTarget,
      meanAttachedWithTwo: baseline.meanAttached
    }));
  }
}
module.exports = { choose, hypergeometricDraw, exactUnderworldDoorEnergyRace };
