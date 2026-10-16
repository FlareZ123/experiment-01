'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {fixture}=require('./hidden-deck-order-audit.cjs');
const {initializeCards,seededRandom}=require('./headless.cjs');
const {installHypotheticalDeckOrderSampler}=require('./hypothetical-deck-order-hook.cjs');
const engine=n=>require(path.join(__dirname,'../../vendor/twinleaf/ptcg-server/output',n));

/** @param {string} itemName */
function runCase(itemName){
 const manager=initializeCards();
 const states=[fixture(true),fixture(false)];
 for(const s of states){
  const card=manager.getCardByName(itemName);
  assert.ok(card);
  card.id=s.players[0].hand.cards[0].id;
  s.players[0].hand.cards[0]=card;
 }
 const defaults=engine('simple-bot/simple-bot-definitions');
 const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
 const options={tactics:defaults.allSimpleTactics,promptResolvers:defaults.allPromptResolvers,scores:defaults.defaultStateScores,arbiter:defaults.defaultArbiterOptions};
 /** @param {object} s */
 function decide(s){
  const previous=Math.random;
  Math.random=seededRandom(20261016);
  try{return new SimpleTacticsAi({id:101},options,null).decodeNextAction(s)?.constructor.name||'no-action';}
  finally{Math.random=previous;}
 }
 const before=states.map(decide);
 assert.deepEqual(before,['PlayCardAction','PassTurnAction']);
 const trueDecks=states.map(s=>s.players.map(p=>p.deck.cards.slice()));
 const restore=installHypotheticalDeckOrderSampler();
 let sampled;
 try{
  sampled=states.map(decide);
  assert.equal(sampled[0],sampled[1],'Sampled action must not depend on physical unknown order');
  states.forEach((s,i)=>s.players.forEach((p,j)=>
    assert.deepEqual(p.deck.cards,trueDecks[i][j],'Real deck order was mutated')));
 }finally{restore();}
 assert.deepEqual(states.map(decide),before,'Original policy must be restored');
 return{card:itemName,original:before,withSampler:sampled,realStateRestored:true};
}
function runAudit(){return{scope:'Experimental order-only intervention with known-top/Prize/hand limitations',cases:[runCase('Pokegear SVI'),runCase("Trainers' Mail ROS")]};}
if(require.main===module)console.log(JSON.stringify(runAudit(),null,2));
module.exports={runCase,runAudit};
