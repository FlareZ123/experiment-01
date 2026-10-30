'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {inspectFutureApexDiscard}=require(
 '../simulation/twinleaf/agent47-preapex-payload-opportunity.cjs');

function fixture(extra={}){
 const actor={
  decisionKind:'owner-prompt',globalTurn:4,
  ownHand:['Ultra Ball BRS','Dragapult ex TWM','Fire Energy MEE','Grass Energy MEE'],
  ownPublic:{
   active:{printing:'Regidrago V SIT',energies:[],attacks:[]},
   bench:[],
   discard:[],stadium:[],publicTurnRestrictions:{}
  },
  opponentPublic:{stadium:[]}
 };
 const prompt={requiredCount:2,menu:[
  ['Fire Energy MEE','Grass Energy MEE'],
  ['Dragapult ex TWM','Fire Energy MEE']
 ]};
 return {actor:{...actor,...extra.actor,ownPublic:{
  ...actor.ownPublic,...extra.ownPublic
 }},prompt:extra.prompt??prompt};
}
test('owner-visible unevolved V can see a pre-Apex payload menu without altering choice',()=>{
 const x=inspectFutureApexDiscard(fixture());
 assert.equal(x.opportunity,true);assert.equal(x.directlyReady,false);
 assert.equal(x.regidragoOnBoard,true);
 assert.equal(x.soleCopyAlternative,true);
 assert.equal(x.reason,'preapex-alternative-payload');
});
test('no own Regidrago in play excludes a tempting Dragon discard',()=>{
 const x=inspectFutureApexDiscard(fixture({
  ownPublic:{active:{printing:'Budew PRE'},bench:[]}
 }));
 assert.equal(x.opportunity,false);
 assert.equal(x.reason,'no-own-regidrago-on-board');
});
test('alternate payload already chosen by conservative baseline is not counted as change',()=>{
 const x=fixture({
  prompt:{requiredCount:1,menu:[['Dragapult ex TWM']]}
 });
 const r=inspectFutureApexDiscard(x);
 assert.equal(r.baselineAlreadyDiscards,true);
 assert.equal(r.opportunity,false);
});
test('first copy already in public discard is reported but still could have a distinct payload',()=>{
 const x=inspectFutureApexDiscard(fixture({
  ownPublic:{discard:['Kyurem SFA']}
 }));
 assert.equal(x.priorPayloadInPublicDiscard,true);
 assert.equal(x.opportunity,true);
});
test('no legal candidate Dragon multiset means no pre-Apex option',()=>{
 const x=inspectFutureApexDiscard(fixture({
  prompt:{requiredCount:2,menu:[['Fire Energy MEE','Grass Energy MEE']]}
 }));
 assert.equal(x.opportunity,false);
 assert.equal(x.reason,'no-valid-payload-discard-menu');
});
test('an already payable live VSTAR is not a pre-Apex opportunity',()=>{
 const x=inspectFutureApexDiscard(fixture({
  ownPublic:{active:{
   printing:'Regidrago VSTAR SIT',
   attacks:[{name:'Apex Dragon'}],
   energies:['Double Dragon Energy ROS','Double Dragon Energy ROS'],
   publicRestrictions:{},specialConditions:[]
  }}
 }));
 assert.equal(x.directlyReady,true);
 assert.equal(x.opportunity,false);
 assert.equal(x.reason,'apex-already-directly-ready');
});
