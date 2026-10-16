'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {fixture}=require('./hidden-deck-order-audit.cjs');
const {initializeCards,seededRandom}=require('./headless.cjs');
const {sampleDeckOrder,installSpeculativeDeckSampling}=require('./speculative-deck-sampling.cjs');
const engine=n=>require(path.join(__dirname,'../../vendor/twinleaf/ptcg-server/output',n));

/** Two K0 states with identical observable resources and combined hidden pool. */
function k0States(itemName){
 const manager=initializeCards();
 const states=[fixture(true),fixture(true)];
 for(const s of states){
  const card=manager.getCardByName(itemName);
  assert.ok(card,itemName);
  card.id=s.players[0].hand.cards[0].id;
  s.players[0].hand.cards[0]=card;
 }
 const other=states[1].players[0];
 const prize=other.prizes[0].cards[0];
 const index=other.deck.cards.findIndex(c=>c.name==='Arven');
 assert.ok(index>=0);
 other.prizes[0].cards[0]=other.deck.cards[index];
 other.deck.cards[index]=prize;
 const observation=s=>{
  const p=s.players[0];
  return {
   hand:p.hand.cards.map(c=>c.fullName),
   active:p.active.cards.map(c=>c.fullName),
   discard:p.discard.cards.map(c=>c.fullName).sort(),
   deckCount:p.deck.cards.length,
   prizeCount:p.prizes.length,
   combinedUnknown:[...p.deck.cards,...p.prizes.flatMap(z=>z.cards)].map(c=>c.fullName).sort()
  };
 };
 assert.deepEqual(observation(states[0]),observation(states[1]));
 return states;
}
/** @param {object} state @param {object} options */
function decide(state,options){
 const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
 return new SimpleTacticsAi({id:101},options,null).decodeNextAction(state)?.constructor.name;
}
/** @param {string} itemName @param {number} peek */
function runCase(itemName,peek){
 const states=k0States(itemName);
 const defs=engine('simple-bot/simple-bot-definitions');
 const opts={tactics:defs.allSimpleTactics,promptResolvers:defs.allPromptResolvers,scores:defs.defaultStateScores,arbiter:defs.defaultArbiterOptions};
 const baseline=states.map(s=>decide(s,opts));
 assert.deepEqual(baseline,['PlayCardAction','PassTurnAction']);
 const accessible=states[0].players[0].deck.cards;
 let seed=1;
 for(;seed<10000;seed++){
  const imagined=sampleDeckOrder(accessible.slice(),seededRandom(seed));
  if(imagined.slice(0,peek).some(c=>c.name==='Arven'))break;
 }
 assert.ok(seed<10000,'No sampling seed found');
 const protectedDecisions=states.map(s=>{
  const restore=installSpeculativeDeckSampling({random:seededRandom(seed)});
  try{return decide(s,opts)}finally{restore()}
 });
 assert.deepEqual(protectedDecisions,['PlayCardAction','PassTurnAction'],
  'Order-only correction must still condition on unknown K0 Prize membership');
 return {item:itemName,peek,seed,baseline,orderOnlySampler:protectedDecisions,
  equivalentK0Observation:true,scope:'Hypothetical K0 position, no first deck search'};
}
function runAudit(){return{
 kind:'unknown-prize-membership-information-set-leak',
 cards:[runCase('Pokegear SVI',7),runCase("Trainers' Mail ROS",4)],
 strengthEvidence:false
};}
if(require.main===module)console.log(JSON.stringify(runAudit(),null,2));
module.exports={k0States,runAudit};
