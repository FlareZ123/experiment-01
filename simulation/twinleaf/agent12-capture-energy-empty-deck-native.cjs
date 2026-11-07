'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedPainfulSpoons} =
  require('./agent4-rank31-alakazam-movesource-native.cjs');

const native = p => require(path.join(__dirname,
  '../../vendor/twinleaf/ptcg-server/output', p));

/**
 * Reproduce the pinned original Store after a player's own deck becomes empty
 * during their turn. The rule does not impose immediate deckout until the
 * beginning-of-turn draw is required. This constructed state is a narrow
 * card-effect fidelity fixture, not a dealt source or qualified match.
 *
 * @param {0|1} seat Actual source physical seat.
 * @param {0|1} deckCards Physical original owner deck length.
 * @returns {object} Live Store-accepted/rejected action and physical custody.
 */
function probe(seat, deckCards) {
  assert.ok(seat === 0 || seat === 1);
  assert.ok(deckCards === 0 || deckCards === 1);
  const f = stagedPainfulSpoons(seat);
  const {PlayCardAction, PlayerType, SlotType} =
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    native('game/store/actions/resolve-prompt-action');
  const capture = f.card('Capture Energy RCL');
  f.state.turn = 3;
  f.state.activePlayer = seat;
  // A deck empty after the turn's draw has not yet failed deckout.
  f.source.deck.cards.splice(0);
  const basic = f.card('Shadow Rider Calyrex V CRE');
  if (deckCards === 1) f.source.deck.cards.push(basic);
  f.source.hand.cards.push(capture);
  const snap = () => ({
    handHasCapture: f.source.hand.cards.includes(capture),
    activeContainsCapture: f.source.active.cards.includes(capture),
    activeEnergyContainsCapture: f.source.active.energies.cards.includes(capture),
    energyPlayedTurn: f.source.energyPlayedTurn,
    deckCount: f.source.deck.cards.length,
    deckHasBasic: f.source.deck.cards.includes(basic),
    benchHasBasic: f.source.bench.some(p => p.cards.includes(basic)),
    active: f.source.active.getPokemonCard()?.fullName ?? null,
    pending: f.state.prompts.filter(p => p.result === undefined)
      .map(p => ({type: p.constructor.name, sourceZone:
        p.cards === f.source.deck ? 'source-deck' : null,
        message: String(p.message ?? ''), ownerId: p.playerId}))
  });
  const before = snap();
  let thrown = null;
  try {
    f.store.dispatch(new PlayCardAction(f.source.id,
      f.source.hand.cards.indexOf(capture),
      {player: PlayerType.ANY, slot: SlotType.ACTIVE, index: 0}));
  } catch (error) {
    thrown = {name: error?.constructor?.name ?? null,
      message: String(error?.message ?? error)};
  }
  const afterAttach = snap();
  const answers = [];
  for (let i = 0; i < 8; i++) {
    const pending = f.state.prompts.find(p => p.result === undefined);
    if (!pending) break;
    let answer;
    if (pending.constructor.name === 'WaitPrompt') answer = null;
    else if (pending.constructor.name === 'ChooseCardsPrompt' &&
             pending.cards === f.source.deck) {
      answer = deckCards === 1 ? [basic] : [];
      assert.equal(pending.validate(answer, f.state), true,
        'A real native owner deck search must validate its physical Basic');
    } else {
      throw new Error('Unexpected actual Capture Energy prompt ' +
        pending.constructor.name);
    }
    f.store.dispatch(new ResolvePromptAction(pending.id, answer));
    answers.push({type:pending.constructor.name,
      resultCount:Array.isArray(answer)?answer.length:null});
  }
  return {seat, deckCards, context:'constructed-native-owner-turn',
    paperGameQualified:false, before, thrown, afterAttach,
    afterPrompts:snap(), answers};
}

module.exports = {probe};
if (require.main === module) {
  for (const seat of [0, 1])
    for (const deckCards of [0, 1])
      console.log('CAPTURE_ENERGY_NATIVE ' +
        JSON.stringify(probe(seat, deckCards)));
}
