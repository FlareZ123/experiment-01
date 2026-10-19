'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {makeFixture,observation}=require('./rank11-hidden-opponent-hand-poltergeist.cjs');
const {initializeCards}=require('./headless.cjs');
const {installOpponentHiddenPoolAttackSampling}=require('./opponent-hidden-pool-attack-sampling.cjs');
const load=name=>require(path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output',name));

/** Construct a full-60 staged Mewtwo Perfection copy of discarded Gengar. */
function makePerfectionFixture(trainersInHand){
  const sample=makeFixture(trainersInHand);
  const owner=sample.attacker;
  // The shared baseline fixture has only 21 owner cards; complete its
  // synthetic 60 before replacing one Energy with Mewtwo & Mew-GX.
  const cards=initializeCards();
  for(let i=0;i<39;i++){
    const energy=cards.getCardByName('Psychic Energy MEE');
    assert.ok(energy);
    energy.id=5000+i;
    owner.deck.cards.push(energy);
  }
  owner.usedGX=true;
  const gengar=owner.active.cards.shift();
  assert.equal(gengar.name,'Gengar & Mimikyu-GX');
  owner.discard.cards.push(gengar);
  const mewtwo=initializeCards().getCardByName('Mewtwo & Mew-GX UNM');
  assert.ok(mewtwo);
  mewtwo.id=70000;
  owner.active.cards.unshift(mewtwo);
  const removed=owner.deck.cards.pop();
  assert.equal(removed.name,'Psychic Energy');
  assert.equal(owner.active.cards.length+owner.discard.cards.length+
    owner.deck.cards.length+owner.prizes.reduce((n,p)=>n+p.cards.length,0),60);
  return sample;
}

/** @returns {object} Does sampled speculative scoring cover delegated Perfection? */
function run(){
  const samples=[makePerfectionFixture(false),makePerfectionFixture(true)];
  assert.deepEqual(observation(samples[0]),observation(samples[1]));
  assert.equal(samples[0].sourceDigest,samples[1].sourceDigest);
  const {UseAbilityTactic}=load('simple-bot/simple-tactics/use-ability-tactic');
  const {UseAbilityAction}=load('game/store/actions/game-actions');
  const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const defs=load('simple-bot/simple-bot-definitions');
  const options={tactics:defs.allSimpleTactics,promptResolvers:defs.allPromptResolvers,
    scores:defs.defaultStateScores,arbiter:defs.defaultArbiterOptions};
  const evaluate=s=>new UseAbilityTactic(options).evaluateAction(
    s.state,s.attacker.id,new UseAbilityAction(s.attacker.id,'Perfection',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
  const original=samples.map(evaluate);
  assert.ok(original.every(Number.isFinite),'Perfection must resolve in both staged source partitions');
  const flags={seed:20261019,samples:24,hiddenPoolKnownVerified:true,
    opponentHandUnobservedVerified:true,opponentDeckOrderUnobservedVerified:true,
    opponentPrizeIdentityUnobservedVerified:true};
  const restoreNative=installOpponentHiddenPoolAttackSampling(flags);
  let nativeOnly;
  try {nativeOnly=samples.map(evaluate);} finally {restoreNative();}
  assert.deepEqual(nativeOnly,original,'Native-attack-only sampler must leave Perfection untreated');
  const restorePerfection=installOpponentHiddenPoolAttackSampling({
    ...flags,includePerfectionAbility:true
  });
  let sampled;
  try {sampled=samples.map(evaluate);} finally {restorePerfection();}
  assert.ok(sampled.every(Number.isFinite));
  assert.equal(sampled[0],sampled[1],
    'Full source multiset and equal owner observations must imply the same Perfection score');
  assert.deepEqual(samples.map(evaluate),original,'Sampling must restore original scoring');
  return {schema:'perfection-hidden-pool-ability-score-v1',original,
    nativeOnly,sampled,originalLeak:original[0]!==original[1],
    observedSourceRank:11,sourceCards:60,ownerDeckCards:60,
    certifiedGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,makePerfectionFixture};
