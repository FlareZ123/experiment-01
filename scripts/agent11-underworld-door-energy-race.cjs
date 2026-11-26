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
  for (const scenario of [
    { label: 'natural FSS direct-only; H6 A0', handSize: 6, initialAttached: 0, allowArvenSearch: false },
    { label: 'natural FSS direct-only; H5 A1', handSize: 5, initialAttached: 1, allowArvenSearch: false },
    { label: 'natural FSS plus Arven; H6 A0', handSize: 6, initialAttached: 0, allowArvenSearch: true },
    { label: 'natural FSS plus Arven; H5 A1', handSize: 5, initialAttached: 1, allowArvenSearch: true }
  ]) {
    const result = exactUnderworldDoorEnergyRaceWithFSSAccess({
      handSize: scenario.handSize,
      initialAttached: scenario.initialAttached,
      allowArvenSearch: scenario.allowArvenSearch,
      doorCounts: [2, 2]
    });
    console.log(JSON.stringify({
      scenario: scenario.label,
      probabilityAtLeastFive: result.probabilityAtLeastTarget,
      probabilityFssUsedForEnergy: result.probabilityFssUsed,
      meanAttached: result.meanAttached
    }));
  }
}
module.exports = { choose, hypergeometricDraw, exactUnderworldDoorEnergyRace, exactUnderworldDoorEnergyRaceWithFSSAccess };


function multivariateDraw(deckCounts, drawCount) {
  const deckSize = deckCounts.reduce((a, b) => a + b, 0);
  const drawn = Math.min(drawCount, deckSize);
  if (drawn === 0) return [{ energy: 0, fss: 0, arven: 0, other: 0, probability: 1 }];
  const denominator = choose(deckSize, drawn);
  const outcomes = [];
  const [deckEnergy, deckFss, deckArven, deckOther] = deckCounts;
  for (let energy = 0; energy <= Math.min(drawn, deckEnergy); energy += 1) {
    for (let fss = 0; fss <= Math.min(drawn - energy, deckFss); fss += 1) {
      for (let arven = 0; arven <= Math.min(drawn - energy - fss, deckArven); arven += 1) {
        const other = drawn - energy - fss - arven;
        if (other < 0 || other > deckOther) continue;
        outcomes.push({
          energy, fss, arven, other,
          probability: choose(deckEnergy, energy) * choose(deckFss, fss) *
            choose(deckArven, arven) * choose(deckOther, other) / denominator
        });
      }
    }
  }
  return outcomes;
}

function addFssAccessState(map, state, probability) {
  const key = [state.handEnergy, state.handFss, state.handArven,
    state.deckEnergy, state.deckFss, state.deckArven, state.deckOther,
    state.attached, state.fssUsed].join('|');
  map.set(key, (map.get(key) || 0) + probability);
}

function decodeFssAccessState(key, probability) {
  const [handEnergy, handFss, handArven, deckEnergy, deckFss,
    deckArven, deckOther, attached, fssUsed] = key.split('|').map(Number);
  return { handEnergy, handFss, handArven, deckEnergy, deckFss,
    deckArven, deckOther, attached, fssUsed, probability };
}

function drawFssAccessStates(states, drawCount) {
  const next = new Map();
  for (const [key, probability] of states) {
    const state = decodeFssAccessState(key, probability);
    for (const outcome of multivariateDraw([
      state.deckEnergy, state.deckFss, state.deckArven, state.deckOther
    ], drawCount)) {
      addFssAccessState(next, {
        handEnergy: state.handEnergy + outcome.energy,
        handFss: state.handFss + outcome.fss,
        handArven: state.handArven + outcome.arven,
        deckEnergy: state.deckEnergy - outcome.energy,
        deckFss: state.deckFss - outcome.fss,
        deckArven: state.deckArven - outcome.arven,
        deckOther: state.deckOther - outcome.other,
        attached: state.attached,
        fssUsed: state.fssUsed
      }, probability * outcome.probability);
    }
  }
  return next;
}

function useFssForEnergyIfAvailable(state, allowArvenSearch = true) {
  if (state.fssUsed || state.deckEnergy === 0) return state;
  if (state.handFss > 0) {
    return {
      ...state,
      handEnergy: state.handEnergy + 1,
      handFss: state.handFss - 1,
      deckEnergy: state.deckEnergy - 1,
      fssUsed: 1
    };
  }
  if (allowArvenSearch && state.handArven > 0 && state.deckFss > 0) {
    return {
      ...state,
      handEnergy: state.handEnergy + 1,
      handArven: state.handArven - 1,
      deckEnergy: state.deckEnergy - 1,
      deckFss: state.deckFss - 1,
      fssUsed: 1
    };
  }
  return state;
}

function exactUnderworldDoorEnergyRaceWithFSSAccess(options = {}) {
  const {
    totalCardsAfterBoard = 57,
    energyCountAfterBoard = 11,
    handSize = 6,
    prizeCount = 6,
    doorCounts = [2, 2],
    initialAttached = 0,
    targetAttached = 5,
    fssCount = 1,
    arvenCount = 1,
    allowArvenSearch = true
  } = options;
  const values = [totalCardsAfterBoard, energyCountAfterBoard, handSize,
    prizeCount, initialAttached, targetAttached, fssCount, arvenCount];
  if (values.some(x => !Number.isInteger(x) || x < 0) ||
      energyCountAfterBoard > totalCardsAfterBoard || initialAttached > 1 ||
      initialAttached > energyCountAfterBoard ||
      typeof allowArvenSearch !== 'boolean' ||
      !Array.isArray(doorCounts) || doorCounts.length !== 2 ||
      doorCounts.some(x => !Number.isInteger(x) || x < 0 || x > 4)) {
    throw new Error('Invalid FSS-access energy-race configuration');
  }

  const unknownCards = totalCardsAfterBoard - initialAttached;
  const unknownEnergy = energyCountAfterBoard - initialAttached;
  const unknownOther = unknownCards - unknownEnergy - fssCount - arvenCount;
  if (unknownOther < 0 || handSize + prizeCount > unknownCards) {
    throw new Error('Hand, Prizes, and card categories exceed the unknown population');
  }

  const initial = new Map();
  const handDenominator = choose(unknownCards, handSize);
  const prizeDenominator = choose(unknownCards - handSize, prizeCount);
  for (let handEnergy = 0; handEnergy <= Math.min(handSize, unknownEnergy); handEnergy += 1) {
    for (let handFss = 0; handFss <= Math.min(fssCount, handSize - handEnergy); handFss += 1) {
      for (let handArven = 0; handArven <= Math.min(arvenCount, handSize - handEnergy - handFss); handArven += 1) {
        const handOther = handSize - handEnergy - handFss - handArven;
        if (handOther < 0 || handOther > unknownOther) continue;
        const pHand = choose(unknownEnergy, handEnergy) *
          choose(fssCount, handFss) * choose(arvenCount, handArven) *
          choose(unknownOther, handOther) / handDenominator;
        const remEnergy = unknownEnergy - handEnergy;
        const remFss = fssCount - handFss;
        const remArven = arvenCount - handArven;
        const remOther = unknownOther - handOther;
        for (let prizeEnergy = 0; prizeEnergy <= Math.min(prizeCount, remEnergy); prizeEnergy += 1) {
          for (let prizeFss = 0; prizeFss <= Math.min(remFss, prizeCount - prizeEnergy); prizeFss += 1) {
            for (let prizeArven = 0; prizeArven <= Math.min(remArven, prizeCount - prizeEnergy - prizeFss); prizeArven += 1) {
              const prizeOther = prizeCount - prizeEnergy - prizeFss - prizeArven;
              if (prizeOther < 0 || prizeOther > remOther) continue;
              const pPrize = choose(remEnergy, prizeEnergy) *
                choose(remFss, prizeFss) * choose(remArven, prizeArven) *
                choose(remOther, prizeOther) / prizeDenominator;
              addFssAccessState(initial, {
                handEnergy, handFss, handArven,
                deckEnergy: remEnergy - prizeEnergy,
                deckFss: remFss - prizeFss,
                deckArven: remArven - prizeArven,
                deckOther: remOther - prizeOther,
                attached: initialAttached,
                fssUsed: 0
              }, pHand * pPrize);
            }
          }
        }
      }
    }
  }

  const initialMass = [...initial.values()].reduce((a, b) => a + b, 0);
  if (Math.abs(initialMass - 1) > 1e-10) {
    throw new Error('FSS-access initial deal mass is ' + initialMass + ', expected 1');
  }

  let states = initial;
  for (const doors of doorCounts) {
    states = drawFssAccessStates(states, 1);
    const afterNormalTutor = new Map();
    for (const [key, probability] of states) {
      addFssAccessState(afterNormalTutor,
        useFssForEnergyIfAvailable(decodeFssAccessState(key, probability), allowArvenSearch), probability);
    }
    states = afterNormalTutor;

    for (let use = 0; use < doors; use += 1) {
      const next = new Map();
      for (const [key, probability] of states) {
        const state = useFssForEnergyIfAvailable(decodeFssAccessState(key, probability));
        if (state.handEnergy === 0) {
          addFssAccessState(next, state, probability);
          continue;
        }
        const afterAttach = {
          ...state,
          handEnergy: state.handEnergy - 1,
          attached: state.attached + 1
        };
        for (const outcome of multivariateDraw([
          afterAttach.deckEnergy, afterAttach.deckFss,
          afterAttach.deckArven, afterAttach.deckOther
        ], 2)) {
          const drawn = useFssForEnergyIfAvailable({
            ...afterAttach,
            handEnergy: afterAttach.handEnergy + outcome.energy,
            handFss: afterAttach.handFss + outcome.fss,
            handArven: afterAttach.handArven + outcome.arven,
            deckEnergy: afterAttach.deckEnergy - outcome.energy,
            deckFss: afterAttach.deckFss - outcome.fss,
            deckArven: afterAttach.deckArven - outcome.arven,
            deckOther: afterAttach.deckOther - outcome.other
          });
          addFssAccessState(next, drawn, probability * outcome.probability);
        }
      }
      states = next;
    }

    const afterManual = new Map();
    for (const [key, probability] of states) {
      const state = useFssForEnergyIfAvailable(decodeFssAccessState(key, probability));
      if (state.handEnergy > 0) {
        state.handEnergy -= 1;
        state.attached += 1;
      }
      addFssAccessState(afterManual, state, probability);
    }
    states = afterManual;
  }

  const finalMass = [...states.values()].reduce((a, b) => a + b, 0);
  if (Math.abs(finalMass - 1) > 1e-10) {
    throw new Error('FSS-access final deal mass is ' + finalMass + ', expected 1');
  }
  let probabilityAtLeastTarget = 0;
  let probabilityFssUsed = 0;
  let meanAttached = 0;
  const distribution = {};
  for (const [key, probability] of states) {
    const state = decodeFssAccessState(key, probability);
    if (state.attached >= targetAttached) probabilityAtLeastTarget += probability;
    if (state.fssUsed) probabilityFssUsed += probability;
    meanAttached += state.attached * probability;
    distribution[state.attached] = (distribution[state.attached] || 0) + probability;
  }
  return {
    config: { totalCardsAfterBoard, energyCountAfterBoard, handSize,
      prizeCount, doorCounts: [...doorCounts], initialAttached,
      targetAttached, fssCount, arvenCount, allowArvenSearch, unknownCards, unknownEnergy,
      startingDeckSize: unknownCards - handSize - prizeCount },
    distribution: Object.fromEntries(Object.entries(distribution)
      .sort((a, b) => Number(a[0]) - Number(b[0]))),
    meanAttached, probabilityAtLeastTarget, probabilityFssUsed,
    evidenceClass: 'exact finite-population conditional model with natural FSS/Arven access; not a game or matchup result'
  };
}
