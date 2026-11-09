'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { stagePrepared, PIN } =
  require('../../simulation/twinleaf/agent40-rank7-wobbuffet-hood-native-v2.cjs');

const OUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const native = file => require(path.join(OUT, file));
const VERSION = 'agent40-source-rank7-faba-jet-wobb-item-chain-v1';

/** Count all real owned cards, including active attachment and temporary Trainer zones.
 * @param {object} player
 * @returns {number}
 */
function physicalCount(player) {
  // PokemonCardList.cards is an inclusive physical container. Native
  // attached Energy can also appear in slot.energies.cards as a secondary
  // reference to the *same* card, so count physical ids once per slot.
  const slotCount = slot => new Set([
    ...slot.cards, ...slot.tools, ...slot.energies.cards
  ].map(c => c.id)).size;
  return slotCount(player.active) +
    player.bench.reduce((n, slot) => n + slotCount(slot), 0) +
    player.hand.cards.length + player.deck.cards.length +
    player.discard.cards.length + player.lostzone.cards.length +
    player.prizes.reduce((n, slot) => n + slot.cards.length, 0) +
    player.supporter.cards.length + player.stadium.cards.length;
}

/**
 * Resolve actual original-owner Nest Ball prompts using only its own physical
 * deck selection. The staged Basic target is specified independently of
 * opponent hidden information; the Store handles all moves and shuffling.
 * @param {object} store
 * @param {number} sourceId
 * @param {number} regirockId
 * @param {0|1} seat
 * @returns {string[]}
 */
function settleNest(store, sourceId, regirockId, seat) {
  const { ResolvePromptAction } =
    native('game/store/actions/resolve-prompt-action');
  const prompts = [];
  for (let step = 0; step < 8; step++) {
    const pending = store.state.prompts.find(p => p.result === undefined);
    if (!pending) break;
    assert.equal(pending.playerId, sourceId);
    prompts.push(pending.type);
    let answer = null;
    if (pending.type === 'Choose cards') {
      const index = pending.cards.cards.findIndex(c => c.id === regirockId);
      assert.ok(index >= 0, 'Original printed Regirock exists in source-owned search');
      answer = pending.decode([index]);
    } else if (pending.type === 'Shuffle deck') {
      const source = store.state.players.find(p => p.id === sourceId);
      answer = Array.from({ length: source.deck.cards.length }, (_, i) => i);
      let random = (20261109 + seat * 431) >>> 0;
      for (let i = answer.length - 1; i > 0; i--) {
        random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
        const j = random % (i + 1);
        [answer[i], answer[j]] = [answer[j], answer[i]];
      }
    } else {
      assert.equal(pending.type, 'WaitPrompt');
    }
    store.dispatch(new ResolvePromptAction(pending.id, answer));
  }
  assert.equal(store.state.prompts.filter(p => p.result === undefined).length, 0);
  return prompts;
}

/** @param {0|1} seat */
function probe(seat) {
  const x = stagePrepared({
    seat, wobbuffetActive: false, hood: true, vileplumePresent: true
  });
  const { PlayCardAction, PlayerType, SlotType } =
    native('game/store/actions/play-card-action');
  const { ResolvePromptAction } =
    native('game/store/actions/resolve-prompt-action');
  const { GameMessage } = native('game/game-message');
  const { IS_ABILITY_BLOCKED } = native('game/store/prefabs/prefabs');
  const sourceId = x.originalPlayer.id;
  const candidateId = x.candidatePlayer.id;
  const source = () => x.store.state.players.find(p => p.id === sourceId);
  const candidate = () => x.store.state.players.find(p => p.id === candidateId);
  const handFromDeck = printing => {
    const card = source().deck.cards.find(c => c.fullName === printing);
    assert.ok(card, 'Original source deck must contain ' + printing);
    source().deck.moveCardTo(card, source().hand);
    return card;
  };
  const faba = handFromDeck('Faba LOT');
  const jet = handFromDeck('Jet Energy PAL');
  const nest = x.nest;
  const target = source().deck.cards.find(c => c.fullName === 'Regirock XYP');
  assert.ok(target, 'Original Basic remains in staged source deck');
  const wobb = source().bench[0].getPokemonCard();
  assert.equal(wobb.fullName, 'Wobbuffet PHF');
  assert.equal(source().active.getPokemonCard().fullName, 'Mimikyu PAL');
  const vileplume = candidate().bench[0].getPokemonCard();
  const ability = vileplume.powers.find(p => p.name === 'Irritating Pollen');
  assert.ok(ability);
  const blocked = () => Boolean(IS_ABILITY_BLOCKED(
    x.store, x.store.state, candidate(), vileplume, ability
  ));
  assert.equal(blocked(), false, 'Protected opposing Vileplume remains functional');
  const hoodId = candidate().bench[0].tools[0].id;

  // A real original-source Supporter, owned and paid by the source actor.
  const fabaIndex = source().hand.cards.findIndex(c => c.id === faba.id);
  x.store.dispatch(new PlayCardAction(sourceId, fabaIndex, {
    player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
  }));
  const selection = x.store.state.prompts.find(p =>
    p.result === undefined && p.playerId === sourceId && p.type === 'Select');
  assert.ok(selection);
  x.store.dispatch(new ResolvePromptAction(selection.id,
    selection.values.indexOf(GameMessage.CHOICE_TOOL)));
  const targetPrompt = x.store.state.prompts.find(p =>
    p.result === undefined && p.playerId === sourceId && p.type === 'Choose pokemon');
  assert.ok(targetPrompt);
  x.store.dispatch(new ResolvePromptAction(targetPrompt.id,
    targetPrompt.decode([{
      player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index: 0
    }], x.store.state)));
  assert.ok(candidate().lostzone.cards.some(c => c.id === hoodId),
    'Faba physically moves opponent Hood to opponent-owned Lost Zone');
  assert.equal(blocked(), false,
    'Removing Hood alone does not activate Benched Wobbuffet');

  // Select the Jet response from the actual detached source-owner view.
  // The shared default-off root uses this same chooser; never consult
  // opponent concealed cards or unrevealed original Prize identities.
  const { actorObservation } =
    require('../../simulation/twinleaf/actor-observation-contract.cjs');
  const { choosePublicJetBenchSwitch } =
    require('../../simulation/twinleaf/agent40-public-jet-bench-frontier.cjs');
  const observed = actorObservation(x.store.state, seat);
  const proposal = choosePublicJetBenchSwitch(observed, {
    specialEnergies: new Set(['Jet Energy PAL']),
    specialConditions: {}
  }, { payable: () => false });
  assert.ok(proposal, 'Actual public board must reach utility Jet root');
  assert.equal(proposal.reason,
    'jet-promote-wobbuffet-suppress-unhooded-aor-item-lock');
  assert.equal(proposal.slot, 'bench');
  assert.equal(proposal.index, 0);
  assert.equal(observed.ownHand[proposal.handIndex], 'Jet Energy PAL');
  assert.equal(source().hand.cards[proposal.handIndex].id, jet.id);
  // The actual typed owner proposal now dispatches to pinned native Store.
  x.store.dispatch(new PlayCardAction(sourceId, proposal.handIndex, {
    player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH,
    index: proposal.index
  }));
  for (let i = 0; i < 6; i++) {
    const pending = x.store.state.prompts.find(p => p.result === undefined);
    if (!pending) break;
    assert.equal(pending.playerId, sourceId);
    assert.equal(pending.type, 'WaitPrompt');
    x.store.dispatch(new ResolvePromptAction(pending.id, null));
  }
  assert.equal(source().active.getPokemonCard().fullName, 'Wobbuffet PHF');
  assert.ok(source().active.energies.cards.some(c => c.id === jet.id));
  assert.equal(source().bench[0].getPokemonCard().fullName, 'Mimikyu PAL');
  assert.equal(blocked(), true, 'Unhooded AOR must lose Item lock with Wobbuffet Active');

  // Follow through on the concrete Item that the utility promotion unlocked.
  const nestIndex = source().hand.cards.findIndex(c => c.id === nest.id);
  x.store.dispatch(new PlayCardAction(sourceId, nestIndex, {
    player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
  }));
  const prompts = settleNest(x.store, sourceId, target.id, seat);
  assert.deepEqual(prompts, ['Choose cards', 'Shuffle deck', 'WaitPrompt']);
  assert.ok(source().bench.some(slot => slot.cards.some(c => c.id === target.id)));
  assert.ok(source().discard.cards.some(c => c.id === nest.id));
  // Audit every physical zone after native Jet promotion. The pinned Store
  // may retain a card in a temporary list even after moving its attachment.
  // Preserve the exact duplicate IDs instead of hiding an extra physical card.
  const entries = player => {
    const rows = [];
    const add = (zone, cards) => cards.forEach(c =>
      rows.push({ zone, id: c.id, printing: c.fullName }));
    const pokemon = (zone, slot) => {
      add(zone + '.pokemon', slot.cards);
      add(zone + '.tools', slot.tools);
      add(zone + '.energies', slot.energies.cards);
    };
    pokemon('active', player.active);
    player.bench.forEach((slot, i) => pokemon('bench' + i, slot));
    for (const zone of ['hand', 'deck', 'discard', 'lostzone', 'stadium', 'supporter'])
      add(zone, player[zone].cards);
    player.prizes.forEach((slot, i) => add('prize' + i, slot.cards));
    return rows;
  };
  const sourceEntries = entries(source());
  const candidateEntries = entries(candidate());
  const physical = rows => {
    const zones = new Map();
    const aliases = [];
    for (const row of rows) {
      const previous = zones.get(row.id);
      if (previous) {
        // A second view of the same native card is allowed only inside the
        // same PokemonCardList, where cards is the inclusive container and
        // energies/tools is an attachment index. Never ignore cross-zone
        // duplicates such as a card held in hand and attached in play.
        const currentSlot = row.zone.split('.')[0];
        const priorSlot = previous.zone.split('.')[0];
        assert.equal(currentSlot, priorSlot, 'Cross-zone duplicate physical card ' + row.id);
        assert.ok(row.zone.endsWith('.energies') || row.zone.endsWith('.tools'),
          'Unexpected duplicate inside native PokemonCardList');
        aliases.push(row);
      } else {
        zones.set(row.id, row);
      }
    }
    return { count: zones.size, aliases };
  };
  const sourcePhysical = physical(sourceEntries);
  const candidatePhysical = physical(candidateEntries);
  console.log('AGENT40_FABA_JET_PHYSICAL_DIAGNOSTIC', JSON.stringify({
    seat, counts: [sourcePhysical.count, candidatePhysical.count],
    attachedIndexAliases: sourcePhysical.aliases,
    jetLocations: sourceEntries.filter(x => x.id === jet.id),
    fabaLocations: sourceEntries.filter(x => x.id === faba.id),
    nestLocations: sourceEntries.filter(x => x.id === nest.id)
  }));
  assert.equal(sourcePhysical.count, 60, 'Every source card has exactly one physical zone');
  assert.equal(candidatePhysical.count, 60);

  return {
    version: VERSION, pin: PIN, seat, originalSourceRank: 7,
    fabaLostZoneHood: true, jetPromotedWobbuffet: true,
    sourceOwnerPublicJetProposal: proposal.reason,
    sourceItemResolvedAfterUtility: true, sourceItemPrompts: prompts,
    physicalCounts: [physicalCount(source()), physicalCount(candidate())],
    stagedOnly: true, naturalSourceDeals: 0, qualifiedCompetitiveGames: 0
  };
}

for (const seat of [0, 1]) {
  test('source rank7 Faba then Jet Wobb then Nest Ball actual Store, seat ' + seat, () => {
    const row = probe(seat);
    assert.equal(row.jetPromotedWobbuffet, true);
    assert.equal(row.sourceItemResolvedAfterUtility, true);
    console.log('AGENT40_FABA_JET_ITEM_UNLOCK', JSON.stringify(row));
  });
}
