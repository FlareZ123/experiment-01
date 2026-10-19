'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {makeFixture,observation}=
  require('./rank11-hidden-opponent-hand-poltergeist.cjs');
const {installOpponentHiddenPoolAttackSampling}=
  require('./opponent-hidden-pool-attack-sampling.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} filename */
const load=filename=>require(path.join(output,filename));

/** @param {ReturnType<typeof makeFixture>} sample */
function sourceSignature(sample){
  return JSON.stringify({
    seen:observation(sample),
    hand:sample.defender.hand.cards.map(c=>[c.id,c.fullName]),
    deck:sample.defender.deck.cards.map(c=>[c.id,c.fullName]),
    prizes:sample.defender.prizes.map(p=>p.cards.map(c=>[c.id,c.fullName]))
  });
}

/** Reproduce score invariance in an opponent hidden-hand conditional world. */
function run(){
  const variants=[makeFixture(false),makeFixture(true)];
  assert.deepEqual(observation(variants[0]),observation(variants[1]));
  assert.equal(variants[0].sourceDigest,variants[1].sourceDigest);
  const signatures=variants.map(sourceSignature);
  const {AttackTactic}=load('simple-bot/simple-tactics/attack-tactic');
  const {AttackAction}=load('game/store/actions/game-actions');
  const definitions=load('simple-bot/simple-bot-definitions');
  const options={
    tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers,
    scores:definitions.defaultStateScores,
    arbiter:definitions.defaultArbiterOptions
  };
  const evaluate=sample=>new AttackTactic(options).evaluateAction(
    sample.state,sample.attacker.id,
    new AttackAction(sample.attacker.id,'Poltergeist'));
  const unsampled=variants.map(evaluate);
  assert.deepEqual(unsampled,[83,407],
    'Pinned full-state diagnostic must reproduce measured score differential');
  const restore=installOpponentHiddenPoolAttackSampling({
    seed:20261019,samples:24,
    hiddenPoolKnownVerified:true,
    opponentHandUnobservedVerified:true,
    opponentDeckOrderUnobservedVerified:true,
    opponentPrizeIdentityUnobservedVerified:true
  });
  let sampled;
  try{sampled=variants.map(evaluate);}
  finally{restore();}
  assert.equal(typeof sampled[0],'number');
  assert.equal(sampled[0],sampled[1],
    'Blinded scores must be identical for the same actor observation and full source multiset');
  assert.deepEqual(variants.map(sourceSignature),signatures,
    'Detached opponent hidden-pool sampling must leave both original States unchanged');
  const restored=variants.map(evaluate);
  assert.deepEqual(restored,unsampled,
    'Restoring the hook must recover pinned clairvoyant baseline');
  return{
    schema:'rank11-blind-opponent-hand-poltergeist-score-v1',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceRank:11, sourceInventoryCards:60,
    unchangedObserverState:true,unchangedSourceMultiset:true,
    speculativeRawScores:unsampled,
    speculativeBlindedScores:sampled,
    fixedSeed:20261019,samples:24,
    scope:'Staged native printed Gengar attack scoring. Not source-dealt game or general policy qualification; other tactics remain uncorrected.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,sourceSignature};
