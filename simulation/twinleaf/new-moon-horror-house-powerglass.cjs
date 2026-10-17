'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(output, modulePath));

/**
 * A conditioned, source-print-specific Store test of Horror House-GX
 * followed by Powerglass at the end of the attacking turn.
 *
 * This deliberately pre-establishes the Active and discard. It tests actual
 * reducers/prompts, not the chance of finding these resources from 60.
 *
 * @returns {object}
 */
function horrorHousePowerglassContract() {
  const cards = initializeCards();
  let uid = 1000;
  /** @param {string} printing */
  const card = printing => {
    const found = cards.getCardByName(printing);
    assert.ok(found, 'Missing pinned card ' + printing);
    found.id = uid++;
    return found;
  };
  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {CardList} = load('game/store/state/card-list');
  const {GamePhase} = load('game/store/state/state');
  const {Format} = load('game/store/card/card-types');
  const {UseAbilityAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType} = load('game/store/actions/play-card-action');

  const store = new Store({onStateChange() {}});
  const state = store.state;
  state.activePlayer = 0;
  state.turn = 2;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;

  const mew = new Player(), other = new Player();
  mew.id = 101;
  mew.name = 'New Moon source attacker';
  other.id = 202;
  other.name = 'Opponent';
  state.players = [mew, other];

  const attacker = card('Mewtwo & Mew-GX UNM');
  const payload = card('Gengar & Mimikyu-GX TEU');
  const activeEnergy = card('Psychic Energy MEE');
  const reserveEnergy = card('Psychic Energy MEE');
  const glass = card('Powerglass SFA');
  mew.active.cards.push(attacker, activeEnergy, glass);
  mew.active.energies.cards.push(activeEnergy);
  mew.active.tools.push(glass);
  mew.discard.cards.push(payload, reserveEnergy);
  other.active.cards.push(card('Shadow Rider Calyrex V CRE'));

  for (const player of state.players) {
    for (let i = 0; i < 8; i++) player.deck.cards.push(card('Psychic Energy MEE'));
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
  }
  const opponentStartingHand = 3;
  for (let i = 0; i < opponentStartingHand; i++) {
    other.hand.cards.push(card('Psychic Energy MEE'));
  }
  const before = {
    attackerEnergy:mew.active.energies.cards.length,
    sourceInDiscard:mew.discard.cards.includes(payload),
    discardBasicAvailable:mew.discard.cards.includes(reserveEnergy),
    opposingHand:other.hand.cards.length,
    candidateHand:mew.hand.cards.length
  };
  assert.equal(before.attackerEnergy, 1);
  assert.ok(before.sourceInDiscard);
  assert.ok(before.discardBasicAvailable);
  store.dispatch(new UseAbilityAction(mew.id, 'Perfection', {
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  const abilityWait = state.prompts.find(p => p.result === undefined &&
    p.constructor.name === 'WaitPrompt');
  assert.ok(abilityWait, 'Perfection Ability activation emits an animation WaitPrompt');
  store.dispatch(new ResolvePromptAction(abilityWait.id, null));
  const chosen = state.prompts.find(p => p.result === undefined &&
    p.constructor.name === 'ChooseAttackPrompt');
  assert.ok(chosen, 'Perfection must offer a real source attack-selection prompt');
  assert.ok(chosen.cards.includes(payload),
    'The discarded printed TAG TEAM must appear as an attack source');
  assert.equal(chosen.validate(payload.attacks[1]), true,
    'One Psychic must pay Horror House-GX through Perfection');
  store.dispatch(new ResolvePromptAction(chosen.id, payload.attacks[1]));

  const afterAttack = {
    usedGX:mew.usedGX,
    attackingHand:mew.hand.cards.length,
    opposingHand:other.hand.cards.length,
    energyCount:mew.active.energies.cards.length,
    powerglassEnergyStillDiscarded:mew.discard.cards.includes(reserveEnergy),
    pending:state.prompts.filter(p => p.result === undefined).map(p => p.constructor.name)
  };
  assert.equal(mew.usedGX, true, 'Horror House must consume the GX allowance');
  assert.equal(other.hand.cards.length, opponentStartingHand,
    'One paid Psychic must not grant the extra Psychic draw-to-seven clause');
  assert.equal(mew.active.energies.cards.length, 1,
    'Powerglass must not accelerate during attack damage/effect resolution');

  let powerglassPrompt = null;
  const promptTrace = [];
  for (let step = 0; step < 16; step++) {
    const pending = state.prompts.find(p => p.result === undefined);
    if (!pending) break;
    promptTrace.push(pending.constructor.name);
    if (pending.constructor.name === 'AttachEnergyPrompt') {
      powerglassPrompt = pending;
      break;
    }
    assert.equal(pending.constructor.name, 'WaitPrompt',
      'Unexpected source prompt ahead of Powerglass: ' + pending.constructor.name);
    store.dispatch(new ResolvePromptAction(pending.id, null));
  }
  assert.ok(powerglassPrompt, 'Actual attack did not reach an end-turn Powerglass prompt');
  const selection = [{
    card:reserveEnergy,
    to:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}
  }];
  assert.equal(powerglassPrompt.validate(selection, state), true);
  store.dispatch(new ResolvePromptAction(powerglassPrompt.id, selection));

  assert.ok(mew.active.energies.cards.includes(reserveEnergy),
    'End-turn acceleration did not attach discarded physical Basic Energy');
  assert.equal(other.hand.cards.length, opponentStartingHand,
    'Post-attack attachment cannot retroactively activate extra GX draw');
  assert.equal(mew.active.energies.cards.length,2);
  return {
    sourcePrints:{attacker:attacker.fullName,payload:payload.fullName,tool:glass.fullName},
    before,afterAttack,promptTrace,
    after:{energyCount:mew.active.energies.cards.length,
      recoveredBasic:!mew.discard.cards.includes(reserveEnergy),
      opponentHand:other.hand.cards.length,
      usedGX:mew.usedGX},
    scope:'Conditioned board, real declared attack and end-turn reducer; opponent next-turn restrictions and full 60 setup untested'
  };
}

if (require.main === module) console.log(JSON.stringify(horrorHousePowerglassContract(), null, 2));
module.exports = {horrorHousePowerglassContract};
