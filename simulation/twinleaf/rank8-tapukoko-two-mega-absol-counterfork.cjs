'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { runTest: replay } = require('./rank8-attach-energy-prompt-source.cjs');

/**
 * Source-specific opponent action counterfactual: target both revealed
 * Mega Absol ex rather than self-exiling Tapu Koko with Dance of the Ancients.
 * Only own Bench and own eligible discard pile are consulted at the choice.
 * @returns {object}
 */
function runTest() {
  initializeCards();
  const compiled = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  /** @param {string} p */
  const load = p => require(path.join(compiled, p));
  const { AttachEnergyPromptResolver } =
    load('simple-bot/prompt-resolver/attach-energy-prompt-resolver');
  const { AttachEnergyPrompt } =
    load('game/store/prompts/attach-energy-prompt');
  const { PlayerType, SlotType } =
    load('game/store/actions/play-card-action');
  const proto = AttachEnergyPromptResolver.prototype;
  const original = proto.resolvePrompt;
  const raw = replay();
  assert.equal(raw.status, 'invalid-attach-energy-proposal');
  assert.equal(raw.evidence?.promptId, 57);
  const sourceSelections = [];
  proto.resolvePrompt = function targetedMegaAbsolPrompt(state, player, prompt) {
    const action = original.call(this, state, player, prompt);
    if (!(prompt instanceof AttachEnergyPrompt) || prompt.id !== 57 ||
        prompt.message !== 'ATTACH_ENERGY_TO_ACTIVE' ||
        prompt.options.differentTargets !== true ||
        prompt.filter?.name !== 'Lightning Energy') return action;

    const megaAbsol = player.bench.flatMap((slot, index) =>
      slot.getPokemonCard()?.name === 'Mega Absol ex' ? [index] : []);
    assert.equal(megaAbsol.length, 2,
      'Source-known prompt must have two distinct Benched Mega Absol ex');
    const cards = prompt.cardList.filter(prompt.filter);
    assert.ok(cards.length >= 2, 'Source-known prompt must have two Lightning Energy');
    const choices = megaAbsol.map((index, i) => ({
      card: cards[i], to: {
        player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index
      }
    }));
    assert.equal(prompt.validate(choices, state), true);
    assert.equal(new Set(choices.map(x => x.card)).size, 2);
    action.result = choices;
    sourceSelections.push({
      promptId: prompt.id, message: prompt.message,
      assigned: choices.map(choice => ({
        card: choice.card.fullName || choice.card.name,
        target: {...choice.to}
      }))
    });
    return action;
  };
  let alternative;
  try {
    alternative = replay();
  } finally {
    proto.resolvePrompt = original;
  }
  assert.equal(proto.resolvePrompt, original);
  assert.equal(sourceSelections.length, 1,
    'One true root source Tapu Koko prompt must be overridden');
  assert.notEqual(alternative.evidence?.promptId, 57,
    'Legal, physical two-Mega-Absol selection must resolve source prompt 57');
  return {
    kind: 'rank8-dance-target-both-mega-absol-source-counterfork',
    seed: 3755937400, sourceRank: 8, candidatePhysicalSlot: 'A',
    opponentDecision: 'Tapu Koko TEU51 Dance of the Ancients: one Lightning to each Mega Absol ex',
    scope: 'one legal source-player hand/Bench/discard decision, policy-unqualified',
    noCompetitiveWinRateClaim: true,
    raw,
    alternate: alternative,
    chosenPhysicalTargets: sourceSelections,
    originalResolverRestored: true
  };
}

if (require.main === module) console.log(JSON.stringify(runTest(), null, 2));
module.exports = { runTest };
