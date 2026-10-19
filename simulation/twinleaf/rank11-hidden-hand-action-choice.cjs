'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {makeFixture, observation} = require('./rank11-hidden-opponent-hand-poltergeist.cjs');
const load = name => require(path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output', name));

/** Compare attacks from two states with the same actor observation. */
function run() {
  const {AttackTactic} = load('simple-bot/simple-tactics/attack-tactic');
  const defs = load('simple-bot/simple-bot-definitions');
  const options = {tactics:defs.allSimpleTactics,promptResolvers:defs.allPromptResolvers,scores:defs.defaultStateScores,arbiter:defs.defaultArbiterOptions};
  const rows=[];
  for(const damage of [0,40,80,120,160,200]) for(const gxUsed of [false,true]) {
    const samples=[makeFixture(false),makeFixture(true)];
    for(const s of samples){s.defender.active.damage=damage;s.attacker.usedGX=gxUsed;}
    assert.deepEqual(observation(samples[0]),observation(samples[1]));
    assert.equal(samples[0].sourceDigest,samples[1].sourceDigest);
    const choice=samples.map(s=>{const action=new AttackTactic(options).useTactic(s.state,s.attacker);return action?.name??null;});
    rows.push({damage,gxUsed,energyHand:choice[0],trainerHand:choice[1],changed:choice[0]!==choice[1]});
  }
  return {schema:'rank11-observation-equivalent-attack-choice-v1',sourceRank:11,sourceCards:60,pairs:rows.length,reversals:rows.filter(x=>x.changed).length,rows,certifiedGames:0};
}
if(require.main===module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
