'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {makePerfectionFixture}=require('./perfection-hidden-pool-ability-audit.cjs');
const {observation}=require('./rank11-hidden-opponent-hand-poltergeist.cjs');
const {installOpponentHiddenPoolAttackSampling}=require('./opponent-hidden-pool-attack-sampling.cjs');
const load=name=>require(path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output',name));

/** Inspect owner-observation-equivalent Perfection choices at the actual tactic threshold. */
function run(){
  const samples=[makePerfectionFixture(false),makePerfectionFixture(true)];
  assert.deepEqual(observation(samples[0]),observation(samples[1]));
  const {UseAbilityTactic}=load('simple-bot/simple-tactics/use-ability-tactic');
  const defs=load('simple-bot/simple-bot-definitions');
  const opts={tactics:defs.allSimpleTactics,promptResolvers:defs.allPromptResolvers,
    scores:defs.defaultStateScores,arbiter:defs.defaultArbiterOptions};
  const baseline=samples.map(s=>new UseAbilityTactic(opts).getStateScore(s.state,s.attacker.id));
  assert.equal(baseline[0],baseline[1],'Actor baseline score must be observation-equivalent');
  const selected=samples.map(s=>new UseAbilityTactic(opts).useTactic(s.state,s.attacker));
  const raw=selected.map(a=>a?.name??null);
  const restore=installOpponentHiddenPoolAttackSampling({
    seed:20261019,samples:24,includePerfectionAbility:true,
    hiddenPoolKnownVerified:true,opponentHandUnobservedVerified:true,
    opponentDeckOrderUnobservedVerified:true,opponentPrizeIdentityUnobservedVerified:true
  });
  let sampled;
  try{
    sampled=samples.map(s=>new UseAbilityTactic(opts).useTactic(s.state,s.attacker)?.name??null);
  }finally{restore();}
  assert.equal(sampled[0],sampled[1],'Owner-observation-equivalent choices must match');
  assert.deepEqual(samples.map(s=>new UseAbilityTactic(opts).useTactic(s.state,s.attacker)?.name??null),raw,
    'Restoration must recover the same original choices');
  return {schema:'perfection-hidden-state-use-ability-choice-v1',
    baseline,raw,sampled,rawActionLeak:raw[0]!==raw[1],
    sampledActionLeak:sampled[0]!==sampled[1],
    sourceRank:11,ownerCards:60,opponentCards:60,qualifiedGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
