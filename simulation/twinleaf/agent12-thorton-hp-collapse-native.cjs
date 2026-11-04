'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { stagedPainfulSpoons } = require('./agent4-rank31-alakazam-movesource-native.cjs');
const { withPaperThortonSwap } = require('./agent12-thorton-paper-swap-hook.cjs');
const native = p => require(path.join(__dirname, '../../vendor/twinleaf/ptcg-server/output', p));

/**
 * Construct actual native Thorton with damaged Active ADP. This is a
 * conditional Store diagnostic, not a dealt opponent game.
 * @param {0|1} seat
 * @param {210|220|270} damage
 * @returns {object}
 */
function probe(seat, damage) {
  assert.ok(seat === 0 || seat === 1);
  assert.ok([210,220,270].includes(damage));
  const f = stagedPainfulSpoons(seat);
  const { PlayCardAction, PlayerType, SlotType } = native('game/store/actions/play-card-action');
  const { ResolvePromptAction } = native('game/store/actions/resolve-prompt-action');
  const adp = f.card('Arceus & Dialga & Palkia GX CEC');
  const regv = f.card('Regidrago V SIT');
  const dde = f.card('Double Dragon Energy ROS');
  const thorton = f.card('Thorton LOR');
  f.state.turn = 3;
  f.state.activePlayer = seat;
  f.source.active.cards.splice(0, 1, adp);
  f.source.active.damage = damage;
  f.source.active.pokemonPlayedTurn = 1;
  f.source.active.cards.push(dde);
  f.source.active.energies.cards.push(dde);
  f.source.bench[0].cards.push(f.card('Regidrago V SIT'));
  f.source.discard.cards.push(regv);
  f.source.hand.cards.push(thorton);
  const snap = () => ({
    active: f.source.active.getPokemonCard()?.fullName ?? null,
    damage: f.source.active.damage,
    energy: f.source.active.energies.cards.map(x => x.fullName),
    bench: f.source.bench.map(x => x.getPokemonCard()?.fullName ?? null),
    sourcePrizes: f.source.getPrizeLeft(),
    opponentPrizes: f.opponent.getPrizeLeft(),
    discard: f.source.discard.cards.map(x => x.fullName),
    pending: f.state.prompts.filter(p => p.result === undefined).map(p => p.constructor.name),
    supporterTurn: f.source.supporterTurn
  });
  const before = snap(), steps = [];
  let stage = 'start', error = null;
  withPaperThortonSwap(() => {
    try {
      stage = 'play';
      f.store.dispatch(new PlayCardAction(f.source.id, f.source.hand.cards.indexOf(thorton),
        { player: PlayerType.ANY, slot: SlotType.BOARD, index: 0 }));
      steps.push({ stage, snapshot: snap() });
      const p = f.state.prompts.find(x => x.result === undefined && x.constructor.name === 'ChoosePokemonPrompt');
      assert.ok(p);
      stage = 'target';
      f.store.dispatch(new ResolvePromptAction(p.id, [f.source.active]));
      steps.push({ stage, snapshot: snap() });
      const q = f.state.prompts.find(x => x.result === undefined && x.constructor.name === 'ChooseCardsPrompt');
      assert.ok(q);
      stage = 'donor';
      f.store.dispatch(new ResolvePromptAction(q.id, [regv]));
      steps.push({ stage, snapshot: snap() });
      stage = 'KO prompts';
      for (let n = 0; n < 12; n++) {
        const p = f.state.prompts.find(x => x.result === undefined);
        if (!p) break;
        const owner = f.state.players.find(x => x.id === p.playerId);
        assert.ok(owner);
        let answer = null;
        if (p.constructor.name === 'ChoosePrizePrompt')
          answer = owner.prizes.filter(x => x.cards.length).slice(0, p.options.count);
        else if (p.constructor.name === 'ChoosePokemonPrompt')
          answer = [owner.bench.find(x => x.getPokemonCard())];
        else assert.ok(['WaitPrompt','ShowCardsPrompt'].includes(p.constructor.name));
        assert.equal(p.validate(answer, f.state), true);
        f.store.dispatch(new ResolvePromptAction(p.id, answer));
        steps.push({ stage, reply: p.constructor.name, snapshot: snap() });
      }
      assert.equal(f.state.prompts.some(p => p.result === undefined), false);
    } catch (e) { error = String(e?.stack ?? e); }
  });
  return { seat, damage, expectedPaper: damage >= 220 ? 'KO' : 'survives',
    constructedBoard: true, qualifiedGames: 0, stage, error, before, after: snap(), steps };
}
module.exports = { probe };
if (require.main === module)
  for (const seat of [0,1])
    for (const damage of [210,220,270])
      console.log('ADP_REGV_HP_NATIVE ' + JSON.stringify(probe(seat, damage)));
