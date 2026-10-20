'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Evaluate a physically offered Poffin choice only during the actor's genuine
 * own-deck search. This diagnostic selects the two printed Oddish if both
 * remain in that deck and the native prompt accepts them. It never inspects
 * hidden deck contents at an ordinary decision root.
 *
 * @param {object} state Pinned engine state.
 * @param {object} actor Acting player's own information and pending prompts.
 * @param {0|1} seat Actual source player seat.
 * @returns {{prompt:object,cards:object[]}|null}
 */
function oddishAtNativePoffinPrompt(state, actor, seat) {
  if (state.turn !== 16 || state.activePlayer !== seat) return null;
  if (actor.active.getPokemonCard()?.fullName !== 'Bunnelby PRC') return null;
  if (!actor.active.tools.some(t => t.fullName === 'Technical Machine: Evolution PAR') ||
      actor.active.energies.cards.length === 0) return null;
  if (actor.bench.filter(x => !x.getPokemonCard()).length < 2) return null;
  if (actor.bench.some(x => ['Oddish UNB', 'Gloom UNB'].includes(
    x.getPokemonCard()?.fullName))) return null;
  const prompt = state.prompts.find(p => p.result === undefined);
  if (!prompt || prompt.constructor.name !== 'ChooseCardsPrompt' ||
      prompt.playerId !== actor.id || prompt.cards !== actor.deck) return null;
  // Read the owner's deck only at the exact active actor-owned deck search.
  const oddish = prompt.cards.cards.filter(c => c.fullName === 'Oddish UNB');
  if (oddish.length !== 2 || !prompt.validate(oddish, state)) return null;
  return {prompt, cards:oddish};
}

/**
 * One prompt-local, reversible, source-specific owner-information-safe fork.
 * The caller must separately establish native root Item play and verify the
 * actual ResolvePromptAction and resulting public Bench in a live Store.
 *
 * @template T
 * @param {()=>T} execute Game/other policy execution.
 * @param {0|1} sourceSeat Exact printed source player's physical seat.
 * @returns {{result:T,audit:object}}
 */
function withRank15OddishPoffinPrompt(execute, sourceSeat) {
  assert.equal(typeof execute, 'function');
  assert.ok(sourceSeat === 0 || sourceSeat === 1);
  const {SimpleTacticsAi} = require(path.join(OUTPUT, 'simple-bot/simple-tactics-ai'));
  const {ResolvePromptAction} = require(path.join(OUTPUT,
    'game/store/actions/resolve-prompt-action'));
  const descriptor = Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype, 'decodeNextAction');
  assert.equal(typeof descriptor?.value, 'function');
  const clientId = sourceSeat === 0 ? 101 : 202;
  const attempts = [];
  let offered = false;
  function chooseOddish(state) {
    if (offered || this.client?.id !== clientId) {
      return descriptor.value.call(this, state);
    }
    const actor = state.players[sourceSeat];
    const choice = oddishAtNativePoffinPrompt(state, actor, sourceSeat);
    if (!choice) return descriptor.value.call(this, state);
    offered = true;
    attempts.push({
      turn:state.turn,
      promptId:String(choice.prompt.id),
      searchedOwnDeck:true,
      offeredPrintedChoices:choice.cards.map(c=>c.fullName),
      sourceBenchBefore:actor.bench.map(b=>b.getPokemonCard()?.fullName??null),
      sourceSearchStageCounts:{
        oddish:choice.prompt.cards.cards.filter(c=>c.fullName==='Oddish UNB').length,
        gloom:choice.prompt.cards.cards.filter(c=>c.fullName==='Gloom UNB').length,
        aor:choice.prompt.cards.cards.filter(c=>c.fullName==='Vileplume AOR').length,
        bus:choice.prompt.cards.cards.filter(c=>c.fullName==='Vileplume BUS').length
      }
    });
    return new ResolvePromptAction(choice.prompt.id,choice.cards);
  }
  Object.defineProperty(SimpleTacticsAi.prototype, 'decodeNextAction',
    {...descriptor, value:chooseOddish});
  try {
    return {result:execute(),audit:{
      schema:'rank15-retrospective-k1-native-oddish-prompt-fork-v1',
      attempts,competitivePolicyQualified:false
    }};
  } finally {
    Object.defineProperty(SimpleTacticsAi.prototype, 'decodeNextAction', descriptor);
  }
}

module.exports = {oddishAtNativePoffinPrompt,withRank15OddishPoffinPrompt};
