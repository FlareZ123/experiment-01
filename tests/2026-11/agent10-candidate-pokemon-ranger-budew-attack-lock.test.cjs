'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const R='Pokémon Ranger STS 104';
function mon(printing){return {printing,hp:100,damage:0,
 energies:[],tools:[],attacks:[],abilities:[],abilitySuppressions:[],
 printed:{stage:'BASIC',subtypes:['Basic'],types:['Grass'],
 weakness:[],resistance:[],retreatCost:[]}};}
function player(active,bench=[]){return {active,bench,discard:[],
 stadium:[],lostZone:[],resolvingSupporter:[],deckCount:25,
 handCount:2,prizeCount:6,publicTurnRestrictions:{
 gxUsed:false,vstarUsed:false,itemPlayLocked:false,
 stadiumAndToolHaveNoEffectTurnsRemaining:0}};}
function req(seat,opts={}){
 const own=player(mon('Shadow Rider Calyrex V CRE 74'));
 const opp=player(mon(opts.opponent??'Budew PRE 4'),
 opts.vileplume?[mon('Vileplume AOR 3')]:[]);
 own.publicTurnRestrictions.itemPlayLocked=opts.lock!==false;
 const used=opts.usedSupporter?1:0;
 const hand=opts.noItem?[R]:[R,'Fog Crystal CRE 140'];
 const attack=opts.noPreviousAttack?[]:[{sourcePrinting:opts.otherAttack?'Regidrago VSTAR SIT 136':'Budew PRE 4',
  attackName:opts.otherAttack?'Apex Dragon':'Itchy Pollen',
  turn:2,gxAttack:false,copycatAttack:false}];
 return {role:'candidate',seat,prompt:null,observation:{
 actorSeat:seat,decisionKind:'owner-root',ownHand:hand,
 ownPublic:{...own,handCount:hand.length},opponentPublic:opp,
 ownTurnResources:{supporterPlayedTurn:used}},
 publicEventReceipt:{opponentLastTurnAttacks:attack},
 actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
 {token:'ranger',kind:'play-card',actorPrinting:R,
 publicMetadata:{cardType:'supporter',handIndex:0}},
 {token:'pass',kind:'pass'}]}};
}
for(const seat of [0,1]){
 const worker=policy.createPolicy({role:'candidate',seat,
 policyVersion:policy.POLICY_VERSION,config:{}});
 test('Ranger lifts attack-caused Itchy Pollen Item lock to unlock Fog Crystal seat '+seat,()=>{
  const r=req(seat);
  const got=worker.decideWithAudit(r);
  assert.deepEqual(got.decision,{kind:'select-action',token:'ranger'});
  protocol.validatePolicyAudit(got.policyAudit,r,got.decision,policy.POLICY_VERSION);
 });
 for(const [label,opts] of [
 ['no Item lock',{lock:false}],
 ['no opponent last-turn attack',{noPreviousAttack:true}],
 ['other attack source',{otherAttack:true}],
 ['Vileplume passive lock persists',{vileplume:true}],
 ['no Item to unlock',{noItem:true}],
 ['Supporter already spent',{usedSupporter:true}]
 ])test('Ranger conserves Supporter when '+label+' seat '+seat,()=>{
   const r=req(seat,opts),got=worker.decideWithAudit(r);
   assert.deepEqual(got.decision,{kind:'select-action',token:'pass'});
   protocol.validatePolicyAudit(got.policyAudit,r,got.decision,policy.POLICY_VERSION);
 });
}