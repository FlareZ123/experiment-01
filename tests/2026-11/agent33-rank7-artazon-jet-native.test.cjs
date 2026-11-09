'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../../simulation/twinleaf/headless.cjs');
const { actorObservation } = require('../../simulation/twinleaf/actor-observation-contract.cjs');
const { buildActorCardCatalog, chooseActorRootIntent } =
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const { choosePublicJetBenchSwitch } =
  require('../../simulation/twinleaf/agent40-public-jet-bench-frontier.cjs');
const { stagePrepared } =
  require('../../simulation/twinleaf/agent40-rank7-wobbuffet-hood-native-v2.cjs');
const { planAichi } =
  require('../../simulation/evaluation/aichi-pilot.cjs');

const OUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const native = name => require(path.join(OUT, name));
const JET = 'Jet Energy PAL';
const WOBB = 'Wobbuffet PHF';

/**
 * Native PokemonCardList.cards and .energies.cards are overlapping views
 * of the same attached physical object. Collapse overlays WITHIN each
 * Pokemon slot only, leaving cross-slot duplication detectable by id.
 * @param {object} owner
 * @returns {object[]}
 */
function physical(owner) {
  const cardsInSlot = slot => [...new Map([
    ...slot.cards, ...slot.energies.cards, ...slot.tools
  ].map(card => [card.id, card])).values()];
  return [
    ...cardsInSlot(owner.active),
    ...owner.bench.flatMap(cardsInSlot),
    ...owner.hand.cards, ...owner.deck.cards, ...owner.discard.cards,
    ...owner.lostzone.cards, ...owner.stadium.cards, ...owner.supporter.cards,
    ...owner.prizes.flatMap(slot => slot.cards)
  ];
}

/** @param {object} x */
function assertExactSixties(x) {
  const original = planAichi(7, {
    allowEquivalentBasicEnergies: true,
    allowBasicEnergyMirrorPrintings: true,
    allowJapanesePromoHooks: true
  }).candidate.cards;
  assert.equal(original.length, 60);
  for (const owner of [x.originalPlayer, x.candidatePlayer]) {
    const cards = physical(owner);
    assert.equal(cards.length, 60, 'Physical-card ledger must equal sixty');
    assert.equal(new Set(cards.map(c => c.id)).size, 60,
      'A physical card appears in multiple zones');
  }
  assert.deepEqual(physical(x.originalPlayer).map(c => c.fullName).sort(),
    original.slice().sort(), 'Original rank7 printed 60 changed');
}

/** @returns {object} */
function metadata() {
  const manager = initializeCards();
  return buildActorCardCatalog(manager.getAllCards(), {
    PokemonCard: native('game/store/card/pokemon-card').PokemonCard,
    EnergyCard: native('game/store/card/energy-card').EnergyCard,
    ...native('game/store/card/card-types'),
    PowerType: native('game/store/card/pokemon-types').PowerType
  });
}

/** @param {object} x */
function settleRoutine(x) {
  const { ResolvePromptAction } =
    native('game/store/actions/resolve-prompt-action');
  const seen = [];
  for (let count = 0; count < 16; count++) {
    const prompt = x.store.state.prompts.find(p => p.result === undefined);
    if (!prompt) return seen;
    let answer;
    if (prompt.type === 'Shuffle deck') {
      // Deterministic Fisher-Yates shuffle of the real remaining deck indices.
      answer = x.originalPlayer.deck.cards.map((_, i) => i);
      let seed = (20261109 + x.seat * 97 + count * 53) >>> 0;
      for (let i = answer.length - 1; i > 0; i--) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const j = seed % (i + 1);
        [answer[i], answer[j]] = [answer[j], answer[i]];
      }
    } else if (prompt.type === 'WaitPrompt') {
      answer = null;
    } else if (prompt.type === 'Show cards') {
      answer = true;
    } else {
      assert.fail('Unresolved owner decision requires explicit answer: ' +
        prompt.constructor.name + '/' + prompt.type);
    }
    assert.equal(prompt.playerId, x.originalPlayer.id,
      'Prompt must belong to the acting source owner');
    seen.push(prompt.constructor.name);
    x.store.dispatch(new ResolvePromptAction(prompt.id, answer));
  }
  assert.fail('Unexpected non-discretionary prompt overflow');
}

/**
 * Construct an intact, printed original rank7 versus Sentinel sixty.
 * The candidate's Artazon is already in play; source Wobbuffet starts in
 * its remaining deck and the exact source Jet is moved to its public hand.
 * This is a conditioned paper-state test, never a natural-game sample.
 * @param {0|1} seat
 * @param {boolean} hood
 */
function prepared(seat, hood) {
  const x = stagePrepared({ seat, wobbuffetActive: false, hood });
  const source = x.originalPlayer;
  const wobb = source.bench[0].cards.splice(0, 1)[0];
  assert.equal(wobb.fullName, WOBB);
  source.deck.cards.push(wobb);
  const jetIndex = source.deck.cards.findIndex(c => c.fullName === JET);
  assert.ok(jetIndex >= 0, 'Original rank7 Jet must be in source deck');
  const jet = source.deck.cards.splice(jetIndex, 1)[0];
  source.hand.cards.push(jet);
  assert.equal(source.hand.cards.some(c => c.fullName === 'Nest Ball SVI'), true);
  assert.equal(x.candidatePlayer.stadium.cards.some(c =>
    c.fullName === 'Artazon PAL'), true);
  assertExactSixties(x);
  return { ...x, wobb, jet };
}

/** @param {object} x @param {string} printing */
function searchExactBasic(x, printing) {
  const prompt = x.store.state.prompts.find(p => p.result === undefined);
  assert.equal(prompt?.constructor.name, 'ChooseCardsPrompt');
  assert.equal(prompt.playerId, x.originalPlayer.id);
  assert.equal(prompt.cards, x.originalPlayer.deck);
  const index = prompt.cards.cards.findIndex(c => c.fullName === printing);
  assert.ok(index >= 0, 'Original owner deck lacks requested Basic ' + printing);
  const card = prompt.cards.cards[index];
  assert.equal(prompt.validate([card], x.store.state), true,
    'Requested Basic not a legal real-Store search target');
  const { ResolvePromptAction } =
    native('game/store/actions/resolve-prompt-action');
  x.store.dispatch(new ResolvePromptAction(prompt.id, prompt.decode([index])));
  return { card, prompts: settleRoutine(x) };
}

for (const seat of [0, 1]) {
  for (const hood of [false, true]) {
    test('original rank7 Artazon -> Jet Wobbuffet -> Nest Ball, seat ' +
      seat + ', Hood ' + hood, () => {
      const x = prepared(seat, hood);
      const { UseStadiumAction } =
        native('game/store/actions/game-actions');
      // Initial Vileplume lock is active before the source's own Stadium use.
      const { IS_ABILITY_BLOCKED } = native('game/store/prefabs/prefabs');
      const lock = x.evolved.getPokemonCard();
      const power = lock.powers.find(p => p.name === 'Irritating Pollen');
      assert.ok(power);
      assert.equal(Boolean(IS_ABILITY_BLOCKED(
        x.store, x.store.state, x.candidatePlayer, lock, power)), false);
      x.store.dispatch(new UseStadiumAction(x.originalPlayer.id));
      const art = searchExactBasic(x, WOBB);
      assert.ok(x.originalPlayer.bench.some(b =>
        b.cards.some(c => c.id === art.card.id)),
      'Opposing Artazon must physically Bench source-owned Wobbuffet');
      assertExactSixties(x);

      const catalog = metadata();
      const view = actorObservation(x.store.state, seat);
      const direct = choosePublicJetBenchSwitch(view, catalog);
      const selected = chooseActorRootIntent(view, catalog, {
        jetBenchSwitchRoot: true
      });
      if (hood) {
        assert.equal(direct, null,
          'Hood-protected Vileplume must veto this Wobbuffet utility objective');
        assert.notEqual(selected.reason,
          'jet-promote-wobbuffet-suppress-unhooded-aor-item-lock');
        assertExactSixties(x);
        return;
      }
      assert.equal(direct?.reason,
        'jet-promote-wobbuffet-suppress-unhooded-aor-item-lock',
        'No attack is payable; the Jet line must be selected for Item access');
      assert.equal(selected?.reason, direct.reason,
        'Common actor decision must select the same observed utility root');
      assert.equal(selected.printing, JET);
      const { PlayCardAction, PlayerType, SlotType } =
        native('game/store/actions/play-card-action');
      x.store.dispatch(new PlayCardAction(x.originalPlayer.id,
        selected.handIndex, {
          player: PlayerType.BOTTOM_PLAYER,
          slot: SlotType.BENCH, index: selected.index
        }));
      const jetPrompts = settleRoutine(x);
      assert.equal(x.originalPlayer.active.getPokemonCard()?.fullName, WOBB);
      assert.equal(x.originalPlayer.active.energies.cards.some(c =>
        c.id === x.jet.id), true);
      assert.equal(Boolean(IS_ABILITY_BLOCKED(
        x.store, x.store.state, x.candidatePlayer, lock, power)), true,
      'Native Wobbuffet must suppress actual opposing Vileplume lock');
      assertExactSixties(x);
      const nestIndex = x.originalPlayer.hand.cards.findIndex(c =>
        c.fullName === 'Nest Ball SVI');
      assert.ok(nestIndex >= 0);
      x.store.dispatch(new PlayCardAction(x.originalPlayer.id, nestIndex, {
        player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
      }));
      const nest = searchExactBasic(x, 'Regirock XYP');
      assert.ok(x.originalPlayer.bench.some(b =>
        b.cards.some(c => c.id === nest.card.id)));
      assert.equal(x.originalPlayer.discard.cards.some(c =>
        c.fullName === 'Nest Ball SVI'), true);
      assertExactSixties(x);
      assert.equal(x.store.state.activePlayer, seat);
      assert.equal(x.store.hasPrompts(), false);
      console.log('AGENT33_SOURCE_ARTAZON_JET_NEST', JSON.stringify({
        seat, hood, direct, selected, artazonTarget: art.card.fullName,
        jetPrompts, nestTarget: nest.card.fullName, nestPrompts: nest.prompts,
        printedOwnerCards: physical(x.originalPlayer).length,
        opponentCards: physical(x.candidatePlayer).length,
        itemAcceptedAfterLockRemoval: true,
        originalSourceSixtyUnchanged: true, competitiveQualifiedGames: 0
      }));
    });
  }
}
