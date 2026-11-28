'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION,ghStadiumOnlyLine}=
 require('../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const pokemon=(printing,turn)=>({printing,hp:90,damage:0,
 lastPlayedOrEvolvedTurn:turn,energies:[],tools:[],
 printed:{stage:'BASIC',weakness:[],resistance:[]}});
const deck=(seat=0)=>({role:'opponent',seat,prompt:null,observation:{
 actorSeat:seat,globalTurn:5,ownHand:['Guzma & Hala CEC 193'],
 ownTurnResources:{supporterPlayedTurn:0},
 ownPublic:{active:pokemon('Bunnelby PRC 121',2),
  bench:[pokemon('Oddish UNB 5',3)],stadium:[],discard:[],prizeCount:3},
 opponentPublic:{active:pokemon('Mimikyu GRI 58',2),bench:[],prizeCount:3}},
 actionFrontier:{items:[{kind:'play-card',token:'gh',
 actorPrinting:'Guzma & Hala CEC 193'}]}});
const decide=r=>createPolicy({role:'opponent',seat:r.seat,policyVersion:POLICY_VERSION,config:{}}).decide(r);
for(const seat of [0,1]){
 test('seat '+seat+': GH Stadium-only obtains Grand Tree without two discardables',()=>{
  const r=deck(seat);
  assert.equal(ghStadiumOnlyLine(r.observation),true);
  assert.deepEqual(decide(r),{kind:'select-action',token:'gh'});
  r.observation.ownTurnResources.supporterPlayedTurn=5;
  r.prompt={promptType:'SelectOptionPrompt',
   source:{sourcePrinting:'Guzma & Hala CEC 193',effectName:'Guzma & Hala'},
   publicMetadata:{selectionType:'option'},
   choices:[{kind:'option',token:'zero',label:'No',publicMetadata:{choiceIndex:0}},
            {kind:'option',token:'one',label:'Discard 2 cards from hand',
             publicMetadata:{choiceIndex:1}}]};
  assert.deepEqual(decide(r),{kind:'select-choice',token:'zero'});
  r.prompt={promptType:'ChooseCardsPrompt',
   source:{sourcePrinting:'Guzma & Hala CEC 193',effectName:'Guzma & Hala'},
   publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:1},
   choices:[{kind:'card',token:'tree',printing:'Grand Tree SCR 136',
            publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}},
            {kind:'card',token:'artazon',printing:'Artazon PAL 171',
             publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}}]};
  assert.deepEqual(decide(r),{kind:'select-choices',tokens:['tree']});
 });
}
test('Tag Call gets GH Stadium-only without expendable two-card discard',()=>{
 const r=deck();r.observation.ownHand=['Tag Call CEC 206','Grass Energy MEE 9'];
 r.actionFrontier.items=[{kind:'play-card',token:'tag',actorPrinting:'Tag Call CEC 206'}];
 assert.deepEqual(decide(r),{kind:'select-action',token:'tag'});
});
test('no Evolution Bench target: GH gets Artazon to establish initial Basics',()=>{
 const r=deck();r.observation.ownPublic.bench=[];
 assert.equal(ghStadiumOnlyLine(r.observation),true);
 assert.deepEqual(decide(r),{kind:'select-action',token:'gh'});
 r.prompt={promptType:'ChooseCardsPrompt',
 source:{sourcePrinting:'Guzma & Hala CEC 193',effectName:'Guzma & Hala'},
 publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:1},
 choices:[{kind:'card',token:'a',printing:'Artazon PAL 171',
 publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}}]};
 assert.deepEqual(decide(r),{kind:'select-choices',tokens:['a']});
});
test('GH Stadium-only refuses exact K1 with both Stadiums out of deck',()=>{
 const r=deck();r.observation.ownerK1={exactMembershipKnown:true,
 knownPrintings:[{printing:'Artazon PAL 171',copies:0},
 {printing:'Grand Tree SCR 136',copies:0},
 {printing:'Guzma & Hala CEC 193',copies:1}]};
 assert.equal(ghStadiumOnlyLine(r.observation),false);
 assert.equal(decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
test('GH Stadium-only refuses when Stadium already in hand or in play/full Bench',()=>{
 const r=deck();r.observation.ownHand=[
 'Guzma & Hala CEC 193','Grand Tree SCR 136','Artazon PAL 171'];
 assert.equal(ghStadiumOnlyLine(r.observation),false);
 r.observation.ownHand=['Guzma & Hala CEC 193'];
 r.observation.ownPublic.stadium=['Grand Tree SCR 136'];
 r.observation.ownPublic.bench=Array.from({length:5},()=>pokemon('Oddish UNB 5',3));
 assert.equal(ghStadiumOnlyLine(r.observation),false);
});
