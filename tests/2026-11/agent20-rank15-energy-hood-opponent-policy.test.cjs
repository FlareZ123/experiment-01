'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION,energyActionScore,capturePrompt,hoodProtectionScore}=
require('../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const pokemon=(printing,energies=[],tools=[],abilitySuppressions=[])=>({
  printing,hp:130,damage:0,energies,tools,abilitySuppressions,
  printed:{stage:'BASIC',weakness:[],resistance:[]}});
const board=(active,bench=[])=>({active,bench,stadium:[],discard:[],prizeCount:3});
const p=(name,target,token)=>({kind:'play-card',token,actorPrinting:name,targetPrinting:target});
function req(seat=0){
  return {role:'opponent',seat,prompt:null,
    observation:{actorSeat:seat,globalTurn:4,ownHand:[],
      ownPublic:board(pokemon('Bunnelby PRC 121')),
      opponentPublic:board(pokemon('Mimikyu GRI 58')),
      ownTurnResources:{supporterPlayedTurn:0}},
    actionFrontier:{items:[]}};
}
const decide=r=>createPolicy({role:'opponent',seat:r.seat,policyVersion:POLICY_VERSION,config:{}}).decide(r);
for(const seat of [0,1]){
  test('seat '+seat+': initial DCE pays two-Colorless Spiky in one attachment',()=>{
    const r=req(seat);r.observation.ownPublic.bench=[pokemon('Mega Lopunny ex PFL 84')];
    r.actionFrontier.items=[
      p('Grass Energy MEE 9','Bunnelby PRC 121','grass-b'),
      p('Double Colorless Energy SUM 136','Mega Lopunny ex PFL 84','dce-m')];
    assert.deepEqual(decide(r),{kind:'select-action',token:'dce-m'});
  });
}
test('Bunnelby with TM Evolution takes one Energy before Mega DCE',()=>{
  const r=req();r.observation.ownPublic.active.tools=['Technical Machine: Evolution PAR 178'];
  r.observation.ownPublic.bench=[pokemon('Mega Lopunny ex PFL 84')];
  r.actionFrontier.items=[
    p('Double Colorless Energy SUM 136','Mega Lopunny ex PFL 84','dce-m'),
    p('Grass Energy MEE 9','Bunnelby PRC 121','grass-b')];
  assert.deepEqual(decide(r),{kind:'select-action',token:'grass-b'});
});
test('Capture Energy on Mega and owner search missing Oddish',()=>{
  const r=req();r.observation.ownPublic.bench=[pokemon('Mega Lopunny ex PFL 84')];
  r.actionFrontier.items=[p('Capture Energy RCL 171','Mega Lopunny ex PFL 84','capture-m')];
  assert.deepEqual(decide(r),{kind:'select-action',token:'capture-m'});
  r.prompt={promptType:'ChooseCardsPrompt',
    source:{sourcePrinting:'Capture Energy RCL 171',effectName:'Capture Energy'},
    publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:1},
    choices:[{kind:'card',token:'odd',printing:'Oddish UNB 5',
      publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}},
      {kind:'card',token:'pidgey',printing:'Pidgey FLF 75',
       publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}},
      {kind:'empty-selection',token:'none'}]};
  assert.deepEqual(decide(r),{kind:'select-choices',tokens:['odd']});
});
test('Capture Energy refuses opponent-owned deck or full Bench',()=>{
  const r=req();r.prompt={promptType:'ChooseCardsPrompt',
    source:{sourcePrinting:'Capture Energy RCL 171',effectName:'Capture Energy'},
    publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:1},
    choices:[{kind:'card',token:'odd',printing:'Oddish UNB 5',
      publicMetadata:{ownerSeat:'opponent',sourceZone:'deck'}},
      {kind:'empty-selection',token:'none'}]};
  assert.equal(decide(r).reasonCode,'UNSUPPORTED_CARD_COMBINATION_SOURCE');
  r.prompt.choices[0].publicMetadata.ownerSeat='actor';
  r.observation.ownPublic.bench=Array.from({length:5},()=>pokemon('Budew ASC 16'));
  assert.deepEqual(decide(r),{kind:'select-choice',token:'none'});
});
test('Jet promotes live BUS against Basic but not when its Ability suppressed',()=>{
  const r=req();r.observation.ownPublic.bench=[pokemon('Vileplume BUS 6')];
  r.actionFrontier.items=[p('Jet Energy PAL 190','Vileplume BUS 6','bus-jet')];
  assert.deepEqual(decide(r),{kind:'select-action',token:'bus-jet'});
  r.observation.ownPublic.bench[0].abilitySuppressions=[
    {abilityName:'Disgusting Pollen',suppressed:true}];
  assert.equal(decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
test('no redundant Energy attachments to funded Mega or Bunnelby',()=>{
  const r=req();r.observation.ownPublic.active.energies=['Jet Energy PAL 190'];
  r.observation.ownPublic.bench=[
    pokemon('Mega Lopunny ex PFL 84',['Double Colorless Energy SUM 136'])];
  r.actionFrontier.items=[
    p('Grass Energy MEE 9','Bunnelby PRC 121','b'),
    p('Grass Energy MEE 9','Mega Lopunny ex PFL 84','m')];
  assert.equal(decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
test('Stealthy Hood restores AOR Item lock from opponent Galarian Weezing',()=>{
  const r=req();r.observation.ownPublic.bench=[
    pokemon('Vileplume AOR 3',[],[],[
      {abilityName:'Irritating Pollen',suppressed:true,
       sourcePrinting:'Galarian Weezing RCL 113'}])];
  r.actionFrontier.items=[p('Stealthy Hood UNB 186','Vileplume AOR 3','hood')];
  assert.equal(hoodProtectionScore(r.actionFrontier.items[0],r.observation),172);
  assert.deepEqual(decide(r),{kind:'select-action',token:'hood'});
});
test('Hood refuses Tool-suppressing Jamming Tower and already live AOR',()=>{
  const r=req();r.observation.ownPublic.bench=[
    pokemon('Vileplume AOR 3',[],[],[
      {abilityName:'Irritating Pollen',suppressed:true,
       sourcePrinting:'Garbodor DRX 54'}])];
  r.actionFrontier.items=[p('Stealthy Hood UNB 186','Vileplume AOR 3','hood')];
  r.observation.ownPublic.stadium=['Jamming Tower TWM 153'];
  assert.equal(decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.ownPublic.stadium=[];
  r.observation.ownPublic.bench[0].abilitySuppressions=[];
  assert.equal(decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
