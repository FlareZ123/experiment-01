'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {fixture}=require('./hidden-deck-order-audit.cjs');
const {initializeCards}=require('./headless.cjs');
const engine=n=>require(path.join(__dirname,'../../vendor/twinleaf/ptcg-server/output',n));
/** @param {boolean} supportFirst */
function sourceState(supportFirst){
 const plan=planAichi(6,{allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
 const remain=plan.candidate.cards.slice();
 assert.equal(remain.length,60);
 function take(prefix){const i=remain.findIndex(n=>n.startsWith(prefix+' '));assert.ok(i>=0,prefix);return remain.splice(i,1)[0]}
 const active=take('Iron Thorns ex'),hand=take("Trainers' Mail"),support=take('Plumeria');
 const fillers=Array.from({length:4},()=>take('Speed Lightning Energy'));
 const prizes=remain.splice(0,6);
 const deck=supportFirst?[support,...fillers,...remain]:[...fillers,support,...remain];
 assert.deepEqual([active,hand,...prizes,...deck].sort(),plan.candidate.cards.slice().sort());
 const state=fixture(false),own=state.players[0],manager=initializeCards();
 let id=1;
 const card=name=>{const c=manager.getCardByName(name);assert.ok(c,name);c.id=id++;return c};
 own.active.cards=[card(active)];own.hand.cards=[card(hand)];own.deck.cards=deck.map(card);own.discard.cards=[];
 const {CardList}=engine('game/store/state/card-list');
 own.prizes=prizes.map(name=>{const z=new CardList();z.cards.push(card(name));return z});
 return{state,plan};
}
function runAudit(){
 const a=sourceState(true),b=sourceState(false);
 const visible=x=>({hand:x.players[0].hand.cards.map(c=>c.fullName),active:x.players[0].active.cards.map(c=>c.fullName),deck:x.players[0].deck.cards.map(c=>c.fullName).sort(),prizes:x.players[0].prizes.map(z=>z.cards[0].fullName).sort()});
 assert.deepEqual(visible(a.state),visible(b.state));
 const defs=engine('simple-bot/simple-bot-definitions');
 const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
 const options={tactics:defs.allSimpleTactics,promptResolvers:defs.allPromptResolvers,scores:defs.defaultStateScores,arbiter:defs.defaultArbiterOptions};
 const act=x=>new SimpleTacticsAi({id:101},options,null).decodeNextAction(x.state)?.constructor.name;
 const decisions=[act(a),act(b)];
 assert.deepEqual(decisions,['PlayCardAction','PassTurnAction']);
 return{sourceRank:6,sourceCards:60,sourceDigest:a.plan.candidateDigest,sourceItem:"Trainers' Mail ROS",fullDefaultBotDecisions:decisions,matchWinEvidence:false};
}
if(require.main===module)console.log(JSON.stringify(runAudit(),null,2));
module.exports={runAudit,sourceState};
