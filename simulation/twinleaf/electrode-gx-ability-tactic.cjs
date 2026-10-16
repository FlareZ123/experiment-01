'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedRaichu} = require('./temple-raichu-board.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

/** @returns {object} */
function evaluateBombTactic() {
  const f = stagedRaichu([], null);
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {CardList} = load('game/store/state/card-list');
  const {PlayerType, SlotType} = load('game/store/actions/play-card-action');
  const {UseAbilityAction} = load('game/store/actions/game-actions');
  const {UseAbilityTactic} = load('simple-bot/simple-tactics/use-ability-tactic');
  const {StateScore} = load('simple-bot/state-score/state-score');
  const definitions = load('simple-bot/simple-bot-definitions');
  const {BotFlipMode, BotShuffleMode} = load('game/bots/bot-arbiter');
  const electrode = new PokemonCardList();
  electrode.cards.push(f.card('Electrode-GX CES'));
  f.a.bench.push(electrode);
  for (const player of [f.a,f.b]) {
    player.prizes = Array.from({length:6}, () => {
      const prize = new CardList();
      prize.cards.push(f.card('Psychic Energy SVE'));
      return prize;
    });
    player.deck.cards.push(f.card('Psychic Energy SVE'));
  }
  f.a.discard.cards.push(...[
    'Reversal Energy PAL','Counter Energy CIN','Unit Energy LPM UPR',
    'Reversal Energy PAL','Counter Energy CIN'
  ].map(f.card));
  const options = {
    tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers,
    scores:definitions.defaultStateScores,
    arbiter:{flipMode:BotFlipMode.RANDOM,shuffleMode:BotShuffleMode.RANDOM}
  };
  const tactic = new UseAbilityTactic(options);
  const scorer = new StateScore(options);
  const before = scorer.getScore(f.state,101);
  const target = {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0};
  const simulated = tactic.simulateAction(f.state,
    new UseAbilityAction(101,'Extra Energy Bomb',target));
  assert.ok(simulated,'Pinned simulator must be able to resolve the Ability');
  const after = scorer.getScore(simulated,101);
  const recommended = tactic.useTactic(f.state,f.a);
  const result = {
    sourceRanks:[4,17],beforeScore:before,afterScore:after,
    scoreChange:after-before,
    stockUseAbilityTactic:recommended?.name ?? null,
    prizesBefore:f.b.getPrizeLeft(),
    simulatedPrizesAfter:simulated.players[1].getPrizeLeft()
  };
  console.log(JSON.stringify(result,null,2));
  assert.equal(result.stockUseAbilityTactic,null,
    'Stock heuristic declines Extra Energy Bomb on otherwise ready board');
  assert.ok(result.scoreChange < -1000,'Two-Prize penalty overwhelms Energy utility');
  return result;
}
if(require.main===module) evaluateBombTactic();
module.exports={evaluateBombTactic};
