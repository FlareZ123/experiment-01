'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {makeFixture, observation} = require('./rank11-hidden-opponent-hand-poltergeist.cjs');
const {initializeCards} = require('./headless.cjs');
const load = name => require(path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output', name));

/** Compare attacks from two states with the same actor observation. */
function run() {
  const {AttackTactic} = load('simple-bot/simple-tactics/attack-tactic');
  const defs = load('simple-bot/simple-bot-definitions');
  const options = {tactics:defs.allSimpleTactics,promptResolvers:defs.allPromptResolvers,scores:defs.defaultStateScores,arbiter:defs.defaultArbiterOptions};
  /** @param {number} damage @param {boolean} gxUsed */
  function pair(damage,gxUsed) {
    const samples=[makeFixture(false),makeFixture(true)];
    const cards=initializeCards();
    for(const sample of samples){
      sample.defender.active.damage=damage;sample.attacker.usedGX=gxUsed;
      for(let i=0;i<39;i++){
        const energy=cards.getCardByName('Psychic Energy MEE');
        assert.ok(energy);
        energy.id=5000+i;
        sample.attacker.deck.cards.push(energy);
      }
      assert.equal(sample.attacker.deck.cards.length+sample.attacker.active.cards.length+
        sample.attacker.prizes.length,60);
    }
    assert.deepEqual(observation(samples[0]),observation(samples[1]));
    assert.equal(samples[0].sourceDigest,samples[1].sourceDigest);
    return samples;
  }
  const selected=sample=>new AttackTactic(options).useTactic(sample.state,sample.attacker)?.name??null;
  const rows=[];
  for(const damage of [0,40,80,120,160,200]) for(const gxUsed of [false,true]) {
    const choice=pair(damage,gxUsed).map(selected);
    rows.push({damage,gxUsed,energyHand:choice[0],trainerHand:choice[1],changed:choice[0]!==choice[1]});
  }
  const {installOpponentHiddenPoolAttackSampling}=
    require('./opponent-hidden-pool-attack-sampling.cjs');
  const restore=installOpponentHiddenPoolAttackSampling({
    seed:20261019,samples:24,
    hiddenPoolKnownVerified:true,opponentHandUnobservedVerified:true,
    opponentDeckOrderUnobservedVerified:true,opponentPrizeIdentityUnobservedVerified:true
  });
  // This diagnostic compares all 12 observation-equivalent scenarios, not
  // merely the one successful example. Every opponent-hidden partition and
  // candidate attack is evaluated under the same deterministic sampled pool.
  const sampledRows=[];
  try {
    for (const damage of [0,40,80,120,160,200]) {
      for (const gxUsed of [false,true]) {
        const samples=pair(damage,gxUsed);
        const choices=samples.map(selected);
        sampledRows.push({
          damage,gxUsed,energyHand:choices[0],trainerHand:choices[1],
          changed:choices[0]!==choices[1]
        });
      }
    }
  } finally {
    restore();
  }
  const sampledChoices=[sampledRows[0].energyHand,sampledRows[0].trainerHand];
  assert.equal(sampledChoices[0],sampledChoices[1],
    'Blinded zero-damage action must not depend on unseen partition');
  return {schema:'rank11-observation-equivalent-attack-choice-v2',sourceRank:11,sourceCards:60,pairs:rows.length,reversals:rows.filter(x=>x.changed).length,
    sampledChoices,sampledReversals:sampledRows.filter(x=>x.changed).length,
    sampledRows,rows,certifiedGames:0};
}
if(require.main===module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
