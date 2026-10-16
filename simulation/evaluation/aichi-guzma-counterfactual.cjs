'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { planAichi } = require('./aichi-pilot.cjs');
const { runMatch } = require('../twinleaf/headless.cjs');

/**
 * Reproduce the source-locked Hood-versus-rank-6 turn-two decision at seed
 * 20367161. Both runs use the same initial decks and game seed; diverging
 * play can subsequently alter physical random-event order.
 *
 * @param {object} options A compiled, initialized Twinleaf research runner.
 * @returns {object} Restricted chronological comparison.
 */
function compareGuzmaDecision(options = {}) {
  const root = path.resolve(__dirname, '../../results/aichi-2026');
  const hood = JSON.parse(fs.readFileSync(
    path.join(root, 'candidate-hood-shadow-rider.json'), 'utf8'));
  const plan = planAichi({label:'hood-shield-v1',cards:hood.cards}, {
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent = plan.opponents.find(row => row.rank === 6);
  if (!plan.candidate.cards || !opponent || opponent.status !== 'ready') {
    throw new Error('Fixed rank-6 source deck failed printing resolution.');
  }
  const play = options.runMatch || runMatch;
  const observations = [];
  for (const guard of [false,true]) {
    const game = play({
      deckA: opponent.cards,
      deckB: plan.candidate.cards,
      seed: 20367161,
      maxActions: 100,
      label: guard ? 'hood-rank6-guarded' : 'hood-rank6-baseline',
      strictPromptValidation:true,
      forestSealSearchCorrection:true,
      doubleDragonRecovery:true,
      supporterDecisionCorrection:true,
      isolatePolicyRandomness:true,
      captureDecisionTrace:true,
      guzmaSelfSwitchGuard:guard
    });
    const trace = game.decisionTrace || [];
    const early = trace.filter(row => row.turnBefore <= 4 &&
      (row.playerSlot === 1 || row.card === 'Guzma'));
    observations.push({
      guzmaSelfSwitchGuard:guard,
      engine:game.engine, seed:game.seed,
      policy:game.policy,
      actionBudget:game.actions, terminal:game.finished,
      actualFirstTurnSlot:game.firstTurnSlot,
      candidateEarlyActions:early.map(row => ({
        turn:row.turnBefore,action:row.action,
        card:row.card || null,attack:row.attack || null,
        candidateActiveAtPass:row.action==='PassTurnAction' ?
          row.publicBoardBeforePass?.[1]?.active?.name || null : null
      }))
    });
  }
  return {experiment:'exact-rank6-hood-self-Guzma-replay-v1',
    targetSourceRank:6, candidate:'hood-shield-v1',
    observations, winRateClaimPermitted:false};
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(compareGuzmaDecision(), null, 2) + '\n');
}
module.exports = {compareGuzmaDecision};
