'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {makePerfectionFixture}=require('./perfection-hidden-pool-ability-audit.cjs');
const {observation}=require('./rank11-hidden-opponent-hand-poltergeist.cjs');
const {installOpponentHiddenPoolAttackSampling}=require('./opponent-hidden-pool-attack-sampling.cjs');
const {installOpponentHiddenPoolAllTacticScores}=require('./agent11-opponent-hidden-pool-all-tactic-scores.cjs');
const load=name=>require(path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output',name));
/** @param {boolean} items @returns {object} */
function fixture(items){
  const s=makePerfectionFixture(items);
  const removed=s.attacker.deck.cards.pop();
  assert.equal(removed.name,'Psychic Energy');
  const g=initializeCards().getCardByName('Ghetsis PLF');
  assert.ok(g);g.id=90000;s.attacker.hand.cards.push(g);
  assert.equal(s.attacker.supporterTurn,0);
  assert.equal(s.attacker.active.cards.length+s.attacker.hand.cards.length+
    s.attacker.deck.cards.length+s.attacker.discard.cards.length+
    s.attacker.prizes.reduce((n,p)=>n+p.cards.length,0),60);
  return s;
}
/** @param {object} s @returns {number|undefined} */
function score(s){
  const {PlaySupporterTactic}=load('simple-bot/simple-tactics/play-supporter-tactic');
  const {PlayCardAction,PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const defs=load('simple-bot/simple-bot-definitions');
  const opts={tactics:defs.allSimpleTactics,promptResolvers:defs.allPromptResolvers,
    scores:defs.defaultStateScores,arbiter:defs.defaultArbiterOptions};
  const action=new PlayCardAction(s.attacker.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
  return new PlaySupporterTactic(opts).evaluateAction(s.state,s.attacker.id,action);
}
/** @returns {object} */
function run(){
  const pair=()=>[fixture(false),fixture(true)];
  const originals=pair();
  assert.deepEqual(observation(originals[0]),observation(originals[1]));
  assert.equal(originals[0].sourceDigest,originals[1].sourceDigest);
  const before=JSON.stringify(originals.map(s=>s.state.players.map(p=>({
    hand:p.hand.cards.map(c=>c.fullName),deck:p.deck.cards.map(c=>c.fullName)}))));
  const raw=originals.map(score);
  const originalSampler=installOpponentHiddenPoolAttackSampling({
    seed:20261019,samples:8,includePerfectionAbility:true,
    hiddenPoolKnownVerified:true,opponentHandUnobservedVerified:true,
    opponentDeckOrderUnobservedVerified:true,opponentPrizeIdentityUnobservedVerified:true});
  let oldSample;
  try{oldSample=pair().map(score);}finally{originalSampler();}
  const extension=installOpponentHiddenPoolAllTacticScores({
    seed:20261019,samples:8,hiddenPoolKnownVerified:true,
    opponentHandUnobservedVerified:true,opponentDeckOrderUnobservedVerified:true,
    opponentPrizeIdentityUnobservedVerified:true});
  let allSample;
  try{allSample=pair().map(score);}finally{extension();}
  assert.deepEqual(pair().map(score),raw);
  assert.equal(JSON.stringify(originals.map(s=>s.state.players.map(p=>({
    hand:p.hand.cards.map(c=>c.fullName),deck:p.deck.cards.map(c=>c.fullName)})))),before);
  return {schema:'agent11-ghetsis-rank11-score-parity-v1',sourceRank:11,
    cardsPerSide:60,observationMatched:true,
    rawGhetsisScores:raw,priorSamplerScores:oldSample,allTacticSampleScores:allSample,
    rawLeaked:raw[0]!==raw[1],partialStillLeaks:oldSample[0]!==oldSample[1],
    genericParity:allSample[0]===allSample[1],
    hookRestored:true,competitiveQualifiedGames:0,informationSetCertified:false,
    limitation:'Synthetic stage; unsupported prompt and owner-known-card history; no matchup inference'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={fixture,score,run};
