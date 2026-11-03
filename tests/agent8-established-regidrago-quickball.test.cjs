'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseEstablishedRegidragoQuickBall,
 chooseRegidragoDonorQuickBall,chooseRegidragoQuickBallDiscard,
 chooseRegidragoQuickBallSearch}=
  require('../simulation/twinleaf/agent8-regidrago-quickball-donor-frontier.cjs');

/** @param {object} overrides */
function owner(overrides={}){
 return {
   decisionKind:'owner-root',globalTurn:16,
   ownHand:['Quick Ball FST','Dragapult ex TWM','Battle Compressor PHF'],
   ownPublic:{
     active:{printing:'Regidrago VSTAR SIT',energies:[
       'Double Dragon Energy ROS','Fire Energy MEE']},
     bench:[null,null,null,null,null],
     stadium:[],discard:[],deckCount:30,
     resolvingSupporter:[],
     ...overrides.public
   },
   opponentPublic:{stadium:[],handCount:5},
   ownTurnResources:{
     itemPlayLocked:false,pokemonPlayLocked:false,
     ...overrides.resources
   },
   ...overrides.actor
 };
}
test('established native Apex funding and missing payload proposes owner Quick Ball',()=>{
 const state=owner();
 const snapshot=JSON.stringify(state);
 const intent=chooseEstablishedRegidragoQuickBall(state);
 assert.equal(intent.kind,'play-quick-ball');
 assert.equal(intent.donorPrinting,'Dragapult ex TWM');
 assert.equal(intent.printing,'Quick Ball FST');
 assert.equal(intent.source,'rank13-established-donor');
 assert.equal(JSON.stringify(state),snapshot);
});
test('public gate and practical Item/Bench conditions prevent unrealistic proposal',()=>{
 for(const settings of [
   {public:{discard:['Noivern ex PAL']}},
   {public:{stadium:['Temple of Sinnoh ASR']}},
   {public:{active:{printing:'Regidrago VSTAR SIT',energies:[]}}},
   {public:{active:{printing:'Regidrago V SIT',energies:[]}}},
   {public:{bench:[{}, {}, {}, {}, {}]}},
   {public:{deckCount:0}},
   {resources:{itemPlayLocked:true}},
   {resources:{pokemonPlayLocked:true}},
   {actor:{ownHand:['Dragapult ex TWM']}},
   {actor:{ownHand:['Quick Ball FST']}}
 ])assert.equal(chooseEstablishedRegidragoQuickBall(owner(settings)),null,
   JSON.stringify(settings));
});
test('experimental root opt-in remains disabled by default and reversible',()=>{
 const state=owner(),saved=process.env.AGENT8_ESTABLISHED_QUICKBALL_DEV;
 try{
   delete process.env.AGENT8_ESTABLISHED_QUICKBALL_DEV;
   assert.equal(chooseRegidragoDonorQuickBall(state),null);
   process.env.AGENT8_ESTABLISHED_QUICKBALL_DEV='true';
   assert.equal(chooseRegidragoDonorQuickBall(state).source,
     'rank13-established-donor');
 }finally{
   if(saved===undefined)delete process.env.AGENT8_ESTABLISHED_QUICKBALL_DEV;
   else process.env.AGENT8_ESTABLISHED_QUICKBALL_DEV=saved;
 }
});
test('opt-in Quick Ball native owner prompt selects physical Dragon payment',()=>{
 const actor=owner();
 actor.decisionKind='owner-prompt';
 actor.ownHand=['Dragapult ex TWM','Battle Compressor PHF'];
 actor.ownPublic.resolvingSupporter=['Quick Ball FST'];
 const input={actor,prompt:{
   message:'CHOOSE_CARD_TO_DISCARD',requiredCount:1,
   menu:[['Battle Compressor PHF'],['Dragapult ex TWM']]
 }};
 const old=process.env.AGENT8_ESTABLISHED_QUICKBALL_DEV;
 try{
   delete process.env.AGENT8_ESTABLISHED_QUICKBALL_DEV;
   assert.equal(chooseRegidragoQuickBallDiscard(input),null);
   process.env.AGENT8_ESTABLISHED_QUICKBALL_DEV='true';
   assert.deepEqual(chooseRegidragoQuickBallDiscard(input),
     {printings:['Dragapult ex TWM']});
   assert.equal(chooseRegidragoQuickBallSearch({
     actor,prompt:{source:'own-deck',message:'CHOOSE_CARD_TO_HAND',
       offered:[{printing:'Regidrago V SIT',selectableAlone:true,index:0}]}
   }),null,'already established VSTAR uses generic Basic owner search');
 }finally{
   if(old===undefined)delete process.env.AGENT8_ESTABLISHED_QUICKBALL_DEV;
   else process.env.AGENT8_ESTABLISHED_QUICKBALL_DEV=old;
 }
});
test('changing hidden opponent identities cannot change root decision',()=>{
 const actor=owner();
 const a=chooseEstablishedRegidragoQuickBall(actor);
 actor.opponentHiddenHand=['SECRET_X'];
 assert.deepEqual(chooseEstablishedRegidragoQuickBall(actor),a);
});
