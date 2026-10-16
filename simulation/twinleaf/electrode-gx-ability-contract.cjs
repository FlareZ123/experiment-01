'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedRaichu} = require('./temple-raichu-board.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

/**
 * Staged Extra Energy Bomb prompt and self-KO check.
 * @param {number} count Number of the five discarded cards to attach.
 * @param {boolean} noRecipient Whether all own Pokémon are GX.
 */
function runCase(count, noRecipient = false) {
  const f = stagedRaichu([], null);
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {CardList} = load('game/store/state/card-list');
  const {PlayerType, SlotType} = load('game/store/actions/play-card-action');
  const {UseAbilityAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const electrode = new PokemonCardList();
  electrode.cards.push(f.card('Electrode-GX CES'));
  f.a.bench.push(electrode);
  if (noRecipient) f.a.active.cards.splice(0, 1, f.card('Electrode-GX CES'));
  for (const player of [f.a, f.b]) {
    player.prizes = Array.from({length:6}, () => {
      const prize = new CardList();
      prize.cards.push(f.card('Psychic Energy SVE'));
      return prize;
    });
    player.deck.cards.push(f.card('Psychic Energy SVE'));
  }
  const candidates = ['Reversal Energy PAL','Counter Energy CIN',
    'Unit Energy LPM UPR','Reversal Energy PAL','Counter Energy CIN'].map(f.card);
  f.a.discard.cards.push(...candidates);
  const before = f.b.getPrizeLeft();
  f.store.dispatch(new UseAbilityAction(101, 'Extra Energy Bomb', {
    player:PlayerType.BOTTOM_PLAYER, slot:SlotType.BENCH, index:0
  }));
  // Activated in-play Abilities show an animation WaitPrompt before their effect.
  for (let i = 0; i < 3; i++) {
    const next = f.state.prompts.find(p => p.result === undefined);
    if (!next || next.constructor.name !== 'WaitPrompt') break;
    f.store.dispatch(new ResolvePromptAction(next.id, null));
  }
  const prompt = f.state.prompts.find(p => p.result === undefined);
  assert.ok(prompt, 'Expected Extra Energy Bomb attachment prompt');
  assert.equal(prompt.constructor.name, 'AttachEnergyPrompt');
  const to = {player:PlayerType.BOTTOM_PLAYER, slot:SlotType.ACTIVE,index:0};
  const transfers = candidates.slice(0,count).map(card => ({card,to}));
  const promptAccepted = prompt.validate(transfers);
  f.store.dispatch(new ResolvePromptAction(prompt.id,transfers));
  return {
    count,noRecipient,promptAccepted,min:prompt.options.min,max:prompt.options.max,
    remainingEnergy:f.a.discard.cards.filter(card => candidates.includes(card)).length,
    opponentPrizesTaken:before-f.b.getPrizeLeft(),
    electrodeInDiscard:f.a.discard.cards.some(card => card.fullName === 'Electrode-GX CES')
  };
}
function verify() {
  const cases = [runCase(5),runCase(4),runCase(0),runCase(0,true)];
  console.log(JSON.stringify({engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    scope:'staged Store actions, illegal inputs deliberately supplied',cases},null,2));
  assert.equal(cases[0].remainingEnergy,0);
  assert.equal(cases[0].opponentPrizesTaken,2);
  assert.equal(cases[1].promptAccepted,true,'Pinned prompt accepts four of five');
  assert.equal(cases[2].promptAccepted,true,'Pinned prompt accepts zero of five');
  return cases;
}
if (require.main===module) verify();
module.exports={runCase,verify};
