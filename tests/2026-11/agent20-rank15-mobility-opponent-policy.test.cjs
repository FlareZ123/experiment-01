'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION,positionTarget,energyActionScore}=
 require('../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const pokemon=(printing,opts={})=>({printing,hp:opts.hp??120,damage:0,
 energies:opts.energies??[],tools:opts.tools??[],
 abilitySuppressions:opts.abilitySuppressions??[],
 printed:{stage:opts.stage??'BASIC',weakness:[],resistance:[]}});
const board=(active,bench=[])=>({active,bench,stadium:[],discard:[],prizeCount:3});
const root=(seat=0)=>({role:'opponent',seat,prompt:null,observation:{
 actorSeat:seat,globalTurn:7,ownHand:[],ownTurnResources:{supporterPlayedTurn:0},
 ownPublic:board(pokemon('Fan Rotom SCR 118'),[]),
 opponentPublic:board(pokemon('Mimikyu GRI 58'))},
 actionFrontier:{items:[]}});
const decide=r=>createPolicy({role:'opponent',seat:r.seat,
 policyVersion:POLICY_VERSION,config:{}}).decide(r);
for(const seat of [0,1]){
 test('seat '+seat+': Retreat from Fan Rotom to live BUS lock against Basic',()=>{
  const r=root(seat);
  r.observation.ownPublic.bench=[pokemon('Vileplume BUS 6')];
  r.actionFrontier.items=[{kind:'retreat',token:'retreat'}];
  assert.equal(positionTarget(r.observation).printing,'Vileplume BUS 6');
  assert.deepEqual(decide(r),{kind:'select-action',token:'retreat'});
  r.prompt={promptType:'ChoosePokemonPrompt',source:{effectName:'Retreat'},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
   choices:[{kind:'pokemon',token:'bus',printing:'Vileplume BUS 6',
            publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}}]};
  assert.deepEqual(decide(r),{kind:'select-choices',tokens:['bus']});
 });
}
test('Retreat from Budew promotes funded Mega against evolved opponent',()=>{
 const r=root();r.observation.ownPublic.active=pokemon('Budew ASC 16');
 r.observation.ownPublic.bench=[pokemon('Mega Lopunny ex PFL 84',
  {energies:['Grass Energy BLW 105']})];
 r.observation.opponentPublic.active=pokemon('Regidrago VSTAR SIT 136',{stage:'VSTAR'});
 r.actionFrontier.items=[{kind:'retreat',token:'retreat',
                          targetPrinting:'Mega Lopunny ex PFL 84'}];
 assert.equal(positionTarget(r.observation).printing,'Mega Lopunny ex PFL 84');
 assert.deepEqual(decide(r),{kind:'select-action',token:'retreat'});
});
test('Retreat prefers paid Bunnelby with TM Evolution and Bench Oddish over Mega',()=>{
 const r=root();r.observation.ownPublic.bench=[
 pokemon('Mega Lopunny ex PFL 84',{energies:['Double Colorless Energy SUM 136']}),
 pokemon('Bunnelby PRC 121',{energies:['Jet Energy PAL 190'],
  tools:['Technical Machine: Evolution PAR 178']}),
 pokemon('Oddish UNB 5')];
 r.actionFrontier.items=[{kind:'retreat',token:'retreat'}];
 assert.equal(positionTarget(r.observation).printing,'Bunnelby PRC 121');
 assert.deepEqual(decide(r),{kind:'select-action',token:'retreat'});
});
test('Active BUS lock is not sacrificed to paid Mega by Retreat',()=>{
 const r=root();r.observation.ownPublic.active=pokemon('Vileplume BUS 6');
 r.observation.ownPublic.bench=[pokemon('Mega Lopunny ex PFL 84',
 {energies:['Double Colorless Energy SUM 136']})];
 r.actionFrontier.items=[{kind:'retreat',token:'retreat'}];
 assert.equal(positionTarget(r.observation),null);
 assert.equal(decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
test('Float Stone on no-Energy support Active enables subsequent free Retreat',()=>{
 const r=root();r.observation.ownPublic.bench=[pokemon('Mega Lopunny ex PFL 84',
   {energies:['Double Colorless Energy SUM 136']})];
 r.actionFrontier.items=[{kind:'play-card',token:'stone',
 actorPrinting:'Float Stone BKT 137',targetPrinting:'Fan Rotom SCR 118'}];
 assert.deepEqual(decide(r),{kind:'select-action',token:'stone'});
 r.observation.ownPublic.active.tools=['Float Stone BKT 137'];
 r.actionFrontier.items=[{kind:'retreat',token:'retreat'}];
 assert.deepEqual(decide(r),{kind:'select-action',token:'retreat'});
});
test('Jet promotes already funded Mega, but not out of effective BUS lock',()=>{
 const r=root();r.observation.ownPublic.bench=[pokemon('Mega Lopunny ex PFL 84',
   {energies:['Double Colorless Energy SUM 136']})];
 r.actionFrontier.items=[{kind:'play-card',token:'jet',
   actorPrinting:'Jet Energy PAL 190',targetPrinting:'Mega Lopunny ex PFL 84'}];
 assert.equal(energyActionScore(r.actionFrontier.items[0],r.observation),180);
 assert.deepEqual(decide(r),{kind:'select-action',token:'jet'});
 r.observation.ownPublic.active=pokemon('Vileplume BUS 6');
 assert.equal(energyActionScore(r.actionFrontier.items[0],r.observation),0);
 assert.equal(decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
test('Retreat choice rejects opposing-owned alias and mismatched Bench index',()=>{
 const r=root();r.observation.ownPublic.bench=[pokemon('Mega Lopunny ex PFL 84',
 {energies:['Grass Energy BLW 105']})];
 r.prompt={promptType:'ChoosePokemonPrompt',source:{effectName:'Retreat'},
 publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
 choices:[{kind:'pokemon',token:'wrong',printing:'Mega Lopunny ex PFL 84',
 publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:0}}]};
 assert.equal(decide(r).reasonCode,'NO_SUPPORTED_POKEMON_CHOICE');
 r.prompt.choices[0].publicMetadata.ownerSeat='actor';
 r.prompt.choices[0].publicMetadata.benchIndex=1;
 assert.equal(decide(r).reasonCode,'NO_SUPPORTED_POKEMON_CHOICE');
});
test('Retreat with no funded attacker, TM Bunnelby or effective BUS abstains',()=>{
 const r=root();r.observation.ownPublic.bench=[pokemon('Mega Lopunny ex PFL 84')];
 r.actionFrontier.items=[{kind:'retreat',token:'retreat'}];
 assert.equal(positionTarget(r.observation),null);
 assert.equal(decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
