'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {isDeepStrictEqual} = require('node:util');
const {makePerfectionFixture} = require('./perfection-hidden-pool-ability-audit.cjs');
const {observation} = require('./rank11-hidden-opponent-hand-poltergeist.cjs');
const {seededRandom} = require('./headless.cjs');
const {installOpponentHiddenPoolAttackSampling} =
  require('./opponent-hidden-pool-attack-sampling.cjs');

const load = name => require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output', name));

/** @param {object|null|undefined} action */
function signature(action) {
  return action ? {
    type: action.constructor.name,
    serialized: JSON.stringify(action)
  } : null;
}

/**
 * Dispatch all registered simple tactics, including delegated Perfection,
 * from the owner-visible matched staged state. Reset an independent policy
 * PRNG on every decision so a random draw cannot explain a difference.
 * @param {ReturnType<typeof makePerfectionFixture>} sample
 * @returns {object|null}
 */
function fullBotAction(sample) {
  const {SimpleTacticsAi} = load('simple-bot/simple-tactics-ai');
  const defs = load('simple-bot/simple-bot-definitions');
  const options = {
    tactics: defs.allSimpleTactics,
    promptResolvers: defs.allPromptResolvers,
    scores: defs.defaultStateScores,
    arbiter: defs.defaultArbiterOptions
  };
  const prior = Math.random;
  Math.random = seededRandom(20261019);
  try {
    const bot = new SimpleTacticsAi({id:sample.attacker.id}, options, null);
    return signature(bot.decodeNextAction(sample.state));
  } finally {
    Math.random = prior;
  }
}

/**
 * All twelve paired worlds conserve the printed opposing rank-11 physical 60.
 * The own-deck reversal is deliberately observationally invisible, but the
 * synthetic owner's K0/K1 history is unavailable, so no legitimate
 * known-top-card claims can be inferred from this fixture.
 * @returns {Array<object>}
 */
function compareGrid() {
  const rows = [];
  for (const reverseOwnDeck of [false, true]) {
    for (const activeDamage of [0, 80, 160]) {
      const variants = [makePerfectionFixture(false), makePerfectionFixture(true)];
      for (const variant of variants) {
        variant.defender.active.damage = activeDamage;
        if (reverseOwnDeck) variant.attacker.deck.cards.reverse();
        assert.equal(variant.sourceRank, 11);
        assert.equal(variant.sourceDigest, variants[0].sourceDigest);
        assert.equal(variant.attacker.active.cards.length +
          variant.attacker.discard.cards.length +
          variant.attacker.deck.cards.length +
          variant.attacker.prizes.reduce((n,p)=>n+p.cards.length,0), 60);
      }
      assert.deepEqual(observation(variants[0]), observation(variants[1]),
        'Paired actor-visible observations diverged');
      rows.push({
        activeDamage,reverseOwnDeck,
        energyHand:fullBotAction(variants[0]),
        trainerHand:fullBotAction(variants[1])
      });
    }
  }
  return rows.map(row => ({
    ...row,
    actionReversal:!isDeepStrictEqual(row.energyHand,row.trainerHand)
  }));
}

/**
 * Diagnostic of the entire pinned root bot choice, with or without the
 * reversible *partial* native/Perfection hidden-hand scorer. The patch does
 * not cover Trainer, Energy, prompt or other tactics and is not a whole-bot
 * information-set solution. Preserve every scenario, including null actions.
 */
function run() {
  const raw=compareGrid();
  const restore=installOpponentHiddenPoolAttackSampling({
    seed:20261019,samples:8,includePerfectionAbility:true,
    hiddenPoolKnownVerified:true,opponentHandUnobservedVerified:true,
    opponentDeckOrderUnobservedVerified:true,
    opponentPrizeIdentityUnobservedVerified:true
  });
  let partlyBlinded;
  try { partlyBlinded=compareGrid(); }
  finally { restore(); }
  const restored=compareGrid();
  assert.deepEqual(restored,raw,
    'The reversible scorer must restore the original complete-bot behavior');
  const paired=(rows)=>rows.filter(row=>row.actionReversal).length;
  return {
    schema:'rank11-full-bot-hidden-hand-paired-grid-v1',
    scope:'All default root tactics; staged full 60 vs exact published rank-11 60',
    sourceRank:11,opponentCards:60,ownerCards:60,
    pairedWorlds:raw.length,
    rawReversals:paired(raw),
    partiallyBlindedReversals:paired(partlyBlinded),
    raw,partlyBlinded,
    restorationMatchesRaw:true,
    informationSetCertified:false,
    qualifiedCompetitiveGames:0,
    limitations:'Synthetic owner and unavailable K0/K1/known-top history. The partial sampler handles only AttackAction and delegated Perfection scores. Full runner, prompt choices, dynamic knowledge, opponent policy and official game clocks are unqualified.'
  };
}
if (require.main === module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={signature,fullBotAction,compareGrid,run};
