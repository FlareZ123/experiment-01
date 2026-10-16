'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {fixture}=require('./hidden-deck-order-audit.cjs');
const {initializeCards}=require('./headless.cjs');
const engine=n=>require(path.join(__dirname,'../../vendor/twinleaf/ptcg-server/output',n));
/** @param {string} name */
function compareFullBot(name){
 const manager=initializeCards();
 const states=[fixture(true),fixture(false)];
 for(const s of states){
  const hand=s.players[0].hand.cards;
  const card=manager.getCardByName(name);
  assert.ok(card,'Missing card '+name);
  card.id=hand[0].id;
  hand[0]=card;
 }
 const defs=engine('simple-bot/simple-bot-definitions');
 const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
 const options={tactics:defs.allSimpleTactics,promptResolvers:defs.allPromptResolvers,scores:defs.defaultStateScores,arbiter:defs.defaultArbiterOptions};
 const decisions=states.map(s=>new SimpleTacticsAi({id:101},options,null).decodeNextAction(s)?.constructor.name||'no-action');
 assert.deepEqual(decisions,['PlayCardAction','PassTurnAction']);
 return {item:name,supporterFirst:decisions[0],supporterLast:decisions[1]};
}
function runAudit(){return {scope:'Full default SimpleTacticsAi, synthetic equivalent-observation states',results:[compareFullBot('Pokegear SVI'),compareFullBot("Trainers' Mail ROS")],strengthEvidence:false};}
if(require.main===module)console.log(JSON.stringify(runAudit(),null,2));
module.exports={compareFullBot,runAudit};
