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
    // An Item moving a public discard Supporter to hand may trigger a
    // read-only opponent announcement. Never answer an opponent's hidden or
    // strategic prompt through the acting owner's settlement helper.
    assert.ok(prompt.playerId === x.originalPlayer.id ||
      ['WaitPrompt', 'ShowCardsPrompt'].includes(prompt.constructor.name),
    'Only non-decision opponent display prompts may be settled');
    seen.push(prompt.constructor.name + ':' + prompt.playerId);
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
        // Adversarial forced Jet: a public protected AOR Item lock still
        // forbids the Nest payoff when Wobbuffet becomes Active.
        const {PlayCardAction,PlayerType,SlotType} =
          native('game/store/actions/play-card-action');
        const jetIndex=x.originalPlayer.hand.cards.findIndex(c=>
          c.id===x.jet.id);
        const benchIndex=x.originalPlayer.bench.findIndex(b=>
          b.cards.some(c=>c.fullName===WOBB));
        assert.ok(jetIndex>=0&&benchIndex>=0);
        x.store.dispatch(new PlayCardAction(x.originalPlayer.id,
          jetIndex,{player:PlayerType.BOTTOM_PLAYER,
            slot:SlotType.BENCH,index:benchIndex}));
        settleRoutine(x);
        assert.equal(x.originalPlayer.active.getPokemonCard()?.fullName,WOBB);
        const postRoot=chooseActorRootIntent(
          actorObservation(x.store.state,seat),metadata(),{
            rank7FabaJetBridge:true,jetPostRoboContinuation:true
          });
        assert.notEqual(postRoot.kind,'play-nest-after-jet');
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
      const postJetRoot=chooseActorRootIntent(
        actorObservation(x.store.state,seat),metadata(),{
          rank7FabaJetBridge:true,jetPostRoboContinuation:true
        });
      assert.equal(postJetRoot?.kind,'play-nest-after-jet',
        'Common owner policy must autonomously spend newly unlocked Nest');
      assert.equal(postJetRoot.handIndex,nestIndex);
      x.store.dispatch(new PlayCardAction(x.originalPlayer.id,
        postJetRoot.handIndex, {
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


/**
 * Prepare an additional distinct payoff: source-held VS Seeker can retrieve
 * an original Faba which is physically already in the source discard.
 * No Nest Ball is held, so the existing Nest-only option cannot cover this.
 * @param {0|1} seat
 * @param {boolean} hood
 */
function preparedVsSeeker(seat, hood) {
  const x = prepared(seat, hood);
  const source = x.originalPlayer;
  const nestIndex = source.hand.cards.findIndex(c =>
    c.fullName === 'Nest Ball SVI');
  assert.ok(nestIndex >= 0);
  source.deck.cards.push(source.hand.cards.splice(nestIndex, 1)[0]);
  const take = name => {
    const index = source.deck.cards.findIndex(c => c.fullName === name);
    assert.ok(index >= 0, 'Original rank7 source lacks ' + name);
    return source.deck.cards.splice(index, 1)[0];
  };
  const seeker = take('VS Seeker PHF');
  const faba = take('Faba LOT');
  source.hand.cards.push(seeker);
  source.discard.cards.push(faba);
  assert.equal(source.hand.cards.some(c =>
    c.fullName.startsWith('Nest Ball ')), false);
  assertExactSixties(x);
  return {...x, seeker, faba};
}

for (const seat of [0, 1]) {
  for (const hood of [false, true]) {
    test('original rank7 Artazon Jet unlocks VS Seeker Faba, seat ' +
      seat + ' Hood ' + hood, () => {
      const x = preparedVsSeeker(seat, hood);
      const {UseStadiumAction} =
        native('game/store/actions/game-actions');
      x.store.dispatch(new UseStadiumAction(x.originalPlayer.id));
      searchExactBasic(x, WOBB);
      assertExactSixties(x);
      const view = actorObservation(x.store.state, seat);
      const catalog = metadata();
      const direct = choosePublicJetBenchSwitch(view, catalog);
      const selected = chooseActorRootIntent(view, catalog, {
        jetBenchSwitchRoot:true
      });
      if (hood) {
        assert.equal(direct, null,
          'Hood-protected Vileplume cannot be suppressed for VS Seeker');
        assert.notEqual(selected.reason,
          'jet-promote-wobbuffet-enable-public-vs-seeker');
        return;
      }
      assert.equal(direct?.reason,
        'jet-promote-wobbuffet-enable-public-vs-seeker');
      assert.equal(selected?.reason, direct.reason);
      assert.equal(selected.plannedItem, 'VS Seeker PHF');
      assert.equal(selected.plannedSupporter, 'Faba LOT');
      assert.equal(selected.slot, 'bench');
      const {PlayCardAction, PlayerType, SlotType} =
        native('game/store/actions/play-card-action');
      x.store.dispatch(new PlayCardAction(x.originalPlayer.id,
        selected.handIndex, {
          player:PlayerType.BOTTOM_PLAYER, slot:SlotType.BENCH,
          index:selected.index
        }));
      settleRoutine(x);
      assert.equal(x.originalPlayer.active.getPokemonCard()?.fullName, WOBB);
      assert.equal(x.originalPlayer.active.energies.cards.some(c =>
        c.id === x.jet.id), true);
      assertExactSixties(x);

      const {IS_ABILITY_BLOCKED} = native('game/store/prefabs/prefabs');
      const lock = x.evolved.getPokemonCard();
      const power = lock.powers.find(p => p.name === 'Irritating Pollen');
      assert.equal(Boolean(IS_ABILITY_BLOCKED(
        x.store,x.store.state,x.candidatePlayer,lock,power)), true);
      const seekerIndex = x.originalPlayer.hand.cards.findIndex(c =>
        c.id === x.seeker.id);
      assert.ok(seekerIndex >= 0);
      x.store.dispatch(new PlayCardAction(x.originalPlayer.id, seekerIndex, {
        player:PlayerType.ANY, slot:SlotType.BOARD, index:0
      }));
      const prompt = x.store.state.prompts.find(p =>
        p.result === undefined);
      assert.equal(prompt?.constructor.name, 'ChooseCardsPrompt',
        'VS Seeker must search the original owner discard');
      assert.equal(prompt.playerId, x.originalPlayer.id);
      assert.equal(prompt.cards, x.originalPlayer.discard);
      const target = prompt.cards.cards.findIndex(c => c.id === x.faba.id);
      assert.ok(target >= 0);
      const {ResolvePromptAction} =
        native('game/store/actions/resolve-prompt-action');
      assert.equal(prompt.validate([x.faba], x.store.state), true);
      x.store.dispatch(new ResolvePromptAction(prompt.id,
        prompt.decode([target])));
      const follow = settleRoutine(x);
      assert.equal(x.originalPlayer.hand.cards.some(c =>
        c.id === x.faba.id), true);
      assert.equal(x.originalPlayer.discard.cards.some(c =>
        c.id === x.seeker.id), true);
      assert.equal(x.originalPlayer.discard.cards.some(c =>
        c.id === x.faba.id), false);
      assert.equal(x.store.hasPrompts(), false);
      assertExactSixties(x);
      console.log('AGENT33_RANK7_ARTAZON_JET_VSSEEKER',JSON.stringify({
        seat,hood,selected,searchResult:'Faba LOT',follow,
        nativeItemSettled:true,sourceDistinctCards:60,
        sentinelDistinctCards:60,qualifiedGames:0
      }));
    });
  }

  test('original rank7 VS Seeker alone is not a payable Jet utility without discarded Faba seat ' +
    seat, () => {
    const x = preparedVsSeeker(seat, false);
    const source = x.originalPlayer;
    const index = source.discard.cards.findIndex(c =>
      c.id === x.faba.id);
    assert.ok(index >= 0);
    source.deck.cards.push(source.discard.cards.splice(index, 1)[0]);
    x.store.dispatch(new (native('game/store/actions/game-actions')
      .UseStadiumAction)(source.id));
    searchExactBasic(x, WOBB);
    const selected = choosePublicJetBenchSwitch(
      actorObservation(x.store.state,seat), metadata());
    assert.equal(selected, null);
    assertExactSixties(x);
  });
}


/**
 * Original rank7's Robo Substitute is a held Item capable of creating a
 * 30-HP prize-less Bench body. Staged hand changes conserve exact source 60.
 * @param {0|1} seat
 * @param {boolean} hood
 */
function preparedRobo(seat, hood) {
  const x = prepared(seat, hood);
  const source = x.originalPlayer;
  const nest = source.hand.cards.findIndex(c =>
    c.fullName === 'Nest Ball SVI');
  assert.ok(nest >= 0);
  source.deck.cards.push(source.hand.cards.splice(nest, 1)[0]);
  const robo = source.deck.cards.findIndex(c =>
    c.fullName === 'Robo Substitute PHF');
  assert.ok(robo >= 0, 'Original rank7 requires Robo Substitute PHF');
  const physicalCard = source.deck.cards.splice(robo, 1)[0];
  source.hand.cards.push(physicalCard);
  assertExactSixties(x);
  return {...x, robo:physicalCard};
}

for (const seat of [0, 1]) {
  for (const hood of [false, true]) {
    test('original rank7 native Robo Substitute Item becomes payable after Artazon Jet Wobb seat ' +
      seat + ' Hood ' + hood, () => {
      const x = preparedRobo(seat, hood);
      x.store.dispatch(new (native('game/store/actions/game-actions')
        .UseStadiumAction)(x.originalPlayer.id));
      searchExactBasic(x,WOBB);
      assertExactSixties(x);
      const view = actorObservation(x.store.state,seat);
      const direct = choosePublicJetBenchSwitch(view, metadata());
      const selected = chooseActorRootIntent(view, metadata(), {
        jetBenchSwitchRoot:true
      });
      if (hood) {
        assert.equal(direct, null,
          'Hood leaves the AOR lock protected against this Item payoff');
        assert.notEqual(selected.reason,
          'jet-promote-wobbuffet-enable-robo-substitute');
        // Adversarial forced Jet attachment: the owner policy must still
        // refuse to follow up with Robo because protected Irritating Pollen
        // continues to prohibit Items after Wobbuffet becomes Active.
        const {PlayCardAction,PlayerType,SlotType} =
          native('game/store/actions/play-card-action');
        const jetIndex=x.originalPlayer.hand.cards.findIndex(c=>
          c.id===x.jet.id);
        const wobbIndex=x.originalPlayer.bench.findIndex(b=>
          b.cards.some(c=>c.fullName===WOBB));
        assert.ok(jetIndex>=0&&wobbIndex>=0);
        x.store.dispatch(new PlayCardAction(x.originalPlayer.id,jetIndex,{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
          index:wobbIndex
        }));
        settleRoutine(x);
        assert.equal(x.originalPlayer.active.getPokemonCard()?.fullName,WOBB);
        const following=chooseActorRootIntent(
          actorObservation(x.store.state,seat),metadata(),{
            jetPostRoboContinuation:true
          });
        assert.notEqual(following.kind,'play-robo-after-jet');
        assertExactSixties(x);
        return;
      }
      assert.equal(direct?.reason,
        'jet-promote-wobbuffet-enable-robo-substitute');
      assert.equal(selected?.reason, direct.reason);
      assert.equal(selected.plannedItem,'Robo Substitute PHF');
      const {PlayCardAction,PlayerType,SlotType} =
        native('game/store/actions/play-card-action');
      x.store.dispatch(new PlayCardAction(x.originalPlayer.id,
        selected.handIndex,{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
          index:selected.index
        }));
      settleRoutine(x);
      assert.equal(x.originalPlayer.active.getPokemonCard()?.fullName, WOBB);
      const {IS_ABILITY_BLOCKED} = native('game/store/prefabs/prefabs');
      const lock=x.evolved.getPokemonCard();
      const power=lock.powers.find(p=>p.name==='Irritating Pollen');
      assert.equal(Boolean(IS_ABILITY_BLOCKED(
        x.store,x.store.state,x.candidatePlayer,lock,power)),true);
      assertExactSixties(x);
      const index=x.originalPlayer.hand.cards.findIndex(c=>
        c.id===x.robo.id);
      assert.ok(index>=0);
      const slot=x.originalPlayer.bench.findIndex(b=>b.cards.length===0);
      assert.ok(slot>=0,'Robo requires an available Bench slot');
      const followView=actorObservation(x.store.state,seat);
      const followRoot=chooseActorRootIntent(followView,metadata(),{
        jetPostRoboContinuation:true
      });
      assert.equal(followRoot?.kind,'play-robo-after-jet',
        'Common owner policy must autonomously propose the paid Item payoff');
      assert.equal(followRoot.printing,'Robo Substitute PHF');
      assert.equal(followRoot.handIndex,index);
      assert.equal(followRoot.benchIndex,slot);
      x.store.dispatch(new PlayCardAction(x.originalPlayer.id,
        followRoot.handIndex,{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
          index:followRoot.benchIndex
        }));
      const follow=settleRoutine(x);
      assert.ok(x.originalPlayer.bench.some(b=>b.cards.some(c=>
        c.id===x.robo.id)), 'Printed Robo Substitute must occupy the Bench');
      assert.ok(!x.originalPlayer.hand.cards.some(c=>
        c.id===x.robo.id));
      assert.equal(x.store.hasPrompts(),false);
      assertExactSixties(x);
      console.log('AGENT33_RANK7_ARTAZON_JET_ROBO', JSON.stringify({
        seat,hood,selected,followRoot,follow,sourceDistinctCards:60,
        opponentDistinctCards:60,roboBenched:true,qualifiedGames:0
      }));
    });
  }
}
