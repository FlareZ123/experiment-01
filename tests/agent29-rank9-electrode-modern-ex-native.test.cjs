'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../simulation/twinleaf/headless.cjs');
const { installElectrodeGXEnergyHook } = require('../simulation/twinleaf/electrode-gx-energy-hook.cjs');

const compiled = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native = name => require(path.join(compiled, name));
const { Store } = native('game/store/store');
const { Player } = native('game/store/state/player');
const { CardList } = native('game/store/state/card-list');
const { PokemonCardList } = native('game/store/state/pokemon-card-list');
const { GamePhase } = native('game/store/state/state');
const { CardTag, Format } = native('game/store/card/card-types');
const { UseAbilityAction, AttackAction } = native('game/store/actions/game-actions');
const { ResolvePromptAction } = native('game/store/actions/resolve-prompt-action');
const { PlayerType, SlotType } = native('game/store/actions/play-card-action');

let nextCardId = 29000;

/** Original rank-9 printed five-Energy subset, staged in discard after game play.
 * @param {0|1} seat
 */
function stage(seat) {
  const manager = initializeCards();
  /** @param {string} name */
  const card = name => {
    const selected = manager.getCardByName(name);
    assert.ok(selected, 'Missing pinned compiled card: ' + name);
    selected.id = nextCardId++;
    return selected;
  };
  const owner = new Player();
  const opponent = new Player();
  owner.id = 291;
  opponent.id = 292;
  owner.name = 'rank9-electrode-owner';
  opponent.name = 'rank9-electrode-defender';
  owner.bench = Array.from({ length: 5 }, () => new PokemonCardList());
  opponent.bench = Array.from({ length: 5 }, () => new PokemonCardList());

  // The pinned Mega Absol class advertises its original MEG set/number,
  // though its fullName uses M1L, so use that actual registered name.
  const mega = card('Mega Absol ex M1L');
  assert.equal(mega.set, 'MEG');
  assert.equal(mega.setNumber, '86');
  assert.equal(mega.hasTag(CardTag.POKEMON_ex), true);
  assert.equal(mega.hasTag(CardTag.POKEMON_EX), false);
  assert.equal(mega.hasTag(CardTag.POKEMON_GX), false);

  owner.active.cards.push(mega);
  owner.bench[0].cards.push(card('Voltorb ROS'), card('Electrode-GX CES'));
  owner.bench[1].cards.push(card('Unown AOR'));
  // Rank-10 original Regidrago V is a 220-HP neutral-Weakness attack recipient.
  opponent.active.cards.push(card('Regidrago V SIT'));
  opponent.hand.cards.push(card('Fog Crystal CRE'));

  const energy = [
    card('Prism Energy ASC'),
    card('Prism Energy ASC'),
    card('Prism Energy ASC'),
    card('Prism Energy ASC'),
    card('Darkness Energy SVE')
  ];
  owner.discard.cards.push(...energy);
  for (const player of [owner, opponent]) {
    for (let i = 0; i < 8; i++) player.deck.cards.push(card('Psychic Energy SVE'));
    player.prizes = Array.from({ length: 6 }, () => {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
  }

  const store = new Store({ onStateChange() {} });
  const state = store.state;
  state.players = seat === 0 ? [owner, opponent] : [opponent, owner];
  state.activePlayer = seat;
  state.turn = 4;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;
  return { store, state, owner, opponent, mega, energy };
}

/** @param {ReturnType<typeof stage>} s */
function activateAndPay(s) {
  s.store.dispatch(new UseAbilityAction(s.owner.id, 'Extra Energy Bomb', {
    player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0
  }));
  for (let i = 0; i < 5; i++) {
    const wait = s.state.prompts.find(p =>
      p.result === undefined && p.constructor.name === 'WaitPrompt');
    if (!wait) break;
    s.store.dispatch(new ResolvePromptAction(wait.id, null));
  }
  const prompt = s.state.prompts.find(p =>
    p.result === undefined && p.constructor.name === 'AttachEnergyPrompt');
  assert.ok(prompt, 'Native CES48 must expose physical attachment prompt');
  assert.equal(prompt.playerId, s.owner.id);
  const modernEx = { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 };
  assert.equal(prompt.options.blockedTo.some(t =>
    t.player === modernEx.player && t.slot === modernEx.slot &&
    t.index === modernEx.index), false,
  'Modern Pokémon ex must remain a legal recipient under printed CES48');
  const selection = prompt.decode(s.energy.map((energy, index) => ({
    to: modernEx, index
  })), s.state);
  assert.equal(prompt.validate(selection), true);
  s.store.dispatch(new ResolvePromptAction(prompt.id, selection));
  assert.equal(s.owner.active.energies.cards.length, 5);
  assert.deepEqual(new Set(s.owner.active.energies.cards),
    new Set(s.energy), 'All five source-representative physical Energy moved');
  assert.equal(s.energy.some(c => s.owner.discard.cards.includes(c)), false);
  assert.equal(s.owner.bench[0].getPokemonCard(), undefined,
    'Electrode self-KO occurs only after five paid physical attachments');
  // A self-KO is still a full Knock Out: opponent Prize prompts must resolve
  // before the same-turn attack becomes a legal native root.
  for (let i = 0; i < 12; i++) {
    const next = s.state.prompts.find(p => p.result === undefined);
    if (!next) break;
    let response;
    if (next.constructor.name === 'WaitPrompt') response = null;
    else if (next.constructor.name === 'ChoosePrizePrompt') {
      response = s.opponent.prizes.filter(p => p.cards.length).slice(0,next.options.count);
    } else if (next.constructor.name === 'ShuffleDeckPrompt') {
      response = Array.from({length:s.owner.deck.cards.length},(_,i)=>i);
    } else throw new Error('Unexpected post-Electrode prompt '+next.constructor.name);
    s.store.dispatch(new ResolvePromptAction(next.id,response));
  }
  assert.equal(s.state.prompts.some(p=>p.result===undefined),false);
  assert.equal(s.opponent.getPrizeLeft(),4,'Electrode-GX awards two Prize cards');
  return { selectionCount: selection.length, activeEnergyCount: 5, opponentPrizesAfterBomb:4 };
}


/** Settle the rank-9 Mega Absol payoff on the same owner turn.
 * @param {ReturnType<typeof stage>} s
 */
function attackAndDiscard(s) {
  const priorHandLength = s.opponent.hand.cards.length;
  assert.equal(priorHandLength,3,'One seeded hand card plus two self-KO Prizes');
  const priorDamage = s.opponent.active.damage;
  s.store.dispatch(new AttackAction(s.owner.id, 'Claw of Darkness'));
  for (let i = 0; i < 5; i++) {
    const wait = s.state.prompts.find(p =>
      p.result === undefined && p.constructor.name === 'WaitPrompt');
    if (!wait) break;
    s.store.dispatch(new ResolvePromptAction(wait.id, null));
  }
  const prompt = s.state.prompts.find(p =>
    p.result === undefined && p.constructor.name === 'ChooseCardsPrompt');
  assert.ok(prompt, 'Claw of Darkness must offer physical opponent-hand discard');
  assert.equal(prompt.playerId, s.owner.id);
  const fogIndex = s.opponent.hand.cards.findIndex(c => c.fullName === 'Fog Crystal CRE');
  assert.ok(fogIndex>=0);
  const selected = prompt.decode([fogIndex]);
  assert.equal(prompt.validate(selected), true);
  s.store.dispatch(new ResolvePromptAction(prompt.id, selected));
  assert.equal(s.opponent.active.damage, priorDamage + 200);
  assert.equal(s.opponent.hand.cards.length, priorHandLength-1);
  assert.equal(s.opponent.discard.cards.some(c => c.fullName === 'Fog Crystal CRE'), true);
  return { attacked: 'Claw of Darkness', damage: 200, opponentCardsDiscarded: 1 };
}

for (const seat of [0, 1]) {
  test('Pinned CES48 ability can attach to modern Mega Absol ex in seat ' + seat, () => {
    const s = stage(seat);
    const receipt = { ...activateAndPay(s), ...attackAndDiscard(s) };
    console.log('AGENT29_RANK9_NATIVE_MODERN_EX_ALLOWED', JSON.stringify({
      seat, ...receipt, originalRank: 9, usedFullOriginalEnergySubset: true,
      competitiveQualifiedGames: 0
    }));
  });
}

for (const seat of [0, 1]) {
  test('Paper correction preserves permitted Mega Absol ex payment seat ' + seat, () => {
    const restore = installElectrodeGXEnergyHook();
    try {
      const s = stage(seat);
      const receipt = { ...activateAndPay(s), ...attackAndDiscard(s) };
      console.log('AGENT29_RANK9_GUARDED_MODERN_EX_ALLOWED', JSON.stringify({
        seat, ...receipt, originalRank: 9, paperQualifiedFullGames: 0
      }));
    } finally {
      restore();
    }
  });
}
