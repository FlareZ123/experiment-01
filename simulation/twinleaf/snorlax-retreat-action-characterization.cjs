'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { installToolJammerHook } = require('./tool-jammer-hook.cjs');
const { installSnorlaxRetreatStartHook } = require('./snorlax-retreat-start-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const engine = modulePath => require(path.join(output, modulePath));

/**
 * Characterize both real pinned Store retreat interfaces on the same legal
 * staged board, against an opposing solo PGO Snorlax. A normal retreat should
 * be forbidden by Block unless an applicable Hood protects the Active.
 * Opposing Active Tool Jammer should suppress Hood.
 *
 * @param {{hood:boolean,jammer:boolean,interface:'direct'|'start',startBlockCorrection?:boolean}} options
 */
function characterizeRetreat(options) {
  const manager = initializeCards();
  const { Store } = engine('game/store/store');
  const { Player } = engine('game/store/state/player');
  const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
  const { CardList } = engine('game/store/state/card-list');
  const { GamePhase } = engine('game/store/state/state');
  const { Format } = engine('game/store/card/card-types');
  const { RetreatAction, RetreatStartAction } = engine('game/store/actions/game-actions');
  const { ResolvePromptAction } = engine('game/store/actions/resolve-prompt-action');
  const { CheckRetreatCostEffect } = engine('game/store/effects/check-effects');

  /** @param {string} name */
  function card(name) {
    const found = manager.getCardByName(name);
    assert.ok(found, 'Pinned engine lacks card ' + name);
    return found;
  }
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const candidate = new Player(), stall = new Player();
  candidate.id = 101; candidate.name = 'Shadow Rider';
  stall.id = 202; stall.name = 'Solo Snorlax';
  state.players = [candidate, stall];
  state.turn = 3;
  state.activePlayer = 0;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;
  for (const player of state.players) {
    player.prizes = Array.from({length:6}, () => {
      const slot = new CardList();
      slot.cards.push(card('Dratini OBF'));
      return slot;
    });
    player.deck.cards.push(card('Psychic Energy MEE'));
  }

  candidate.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const partner = new PokemonCardList();
  partner.cards.push(card('Latias ex SSP'));
  candidate.bench.push(partner);
  if (options.hood) candidate.active.tools.push(card('Stealthy Hood UNB'));
  stall.active.cards.push(card('Snorlax PGO'));
  if (options.jammer) stall.active.tools.push(card('Tool Jammer BST'));

  // Latias Skyliner makes the Basic Active's retreat cost zero.
  // This checks payment preconditions, NOT permission to retreat.
  const cost = new CheckRetreatCostEffect(candidate);
  store.reduceEffect(state, cost);
  assert.deepEqual(cost.cost, [], 'The test requires a zero-energy legal retreat payment');

  const restoreJammer = installToolJammerHook();
  const restoreBlock = options.startBlockCorrection ? installSnorlaxRetreatStartHook() : () => {};
  let error = null;
  let promptKind = null;
  try {
    try {
      store.dispatch(options.interface === 'direct' ?
        new RetreatAction(101,0) : new RetreatStartAction(101));
      const pending = state.prompts.find(p=>p.result===undefined);
      if (pending) {
        promptKind = pending.constructor.name;
        assert.equal(promptKind, 'ChoosePokemonPrompt');
        store.dispatch(new ResolvePromptAction(pending.id,[candidate.bench[0]]));
      }
    } catch (failure) {
      error = String(failure?.message || failure);
    }
    const activeAfter = candidate.active.getPokemonCard()?.name || null;
    const success = activeAfter === 'Latias ex';
    return {
      ...options,
      zeroEnergyRetreatCost:true,
      switched:success,
      activeAfter,
      exception:error,
      promptKind,
      pendingPrompts:state.prompts.filter(p=>p.result===undefined).map(p=>p.constructor.name),
      phase:state.phase
    };
  } finally {
    restoreBlock();
    restoreJammer();
  }
}

/** @returns {object} Engine-observed state-level characterizations. */
function characterizeAll() {
  const configs=[
    {hood:false,jammer:false},
    {hood:true,jammer:false},
    {hood:true,jammer:true},
    {hood:false,jammer:true}
  ];
  const cases=[];
  for(const config of configs) {
    for(const retreatInterface of ['direct','start']) {
      cases.push(characterizeRetreat({...config,interface:retreatInterface}));
    }
  }
  const correctedCases=[];
  for (const config of configs) {
    for (const retreatInterface of ['direct','start']) {
      correctedCases.push(characterizeRetreat({
        ...config,interface:retreatInterface,startBlockCorrection:true
      }));
    }
  }
  return {
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    scenario:'Shadow Rider Calyrex V Active + Latias ex Bench versus solo Snorlax PGO',
    purpose:'distinguish direct RetreatAction from interactive RetreatStartAction; tests legal permission, not just cost',
    cases, correctedCases,
    competitiveClaim:false
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(characterizeAll(),null,2)+'\n');
module.exports={characterizeRetreat,characterizeAll};
