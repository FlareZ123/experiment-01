'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const worker=require('./agent8-rank30-clefairy-opponent-policy.cjs');
const protocol=require('./agent49-policy-protocol.cjs');
const LELE='Tapu Lele-GX GRI 60';
const CLEF="Lillie's Clefairy ex JTG 56";
function request(seat){
  return {role:'opponent',seat,prompt:null,
    observation:{actorSeat:seat,globalTurn:9,ownHand:[],
      ownTurnResources:{gxUsed:false,supporterPlayedTurn:0,
        energyPlayedTurn:0,vstarUsed:true},
      ownPublic:{active:{printing:LELE,energies:['Psychic Energy MEE 13']},
        bench:[
          {printing:CLEF,hp:190,damage:110},
          {printing:'Latias ex SSP 76',hp:210,damage:90},
          {printing:'Unown AOR 30',hp:60,damage:10}
        ],deckCount:20,prizeCount:3,discard:[]},
      opponentPublic:{active:{printing:'Regidrago VSTAR SIT 136',
        hp:280,damage:0},bench:[],deckCount:20,prizeCount:3}},
    actionFrontier:{items:[
      {kind:'attack',actorPrinting:LELE,attackName:'Tapu Cure-GX',token:'cure'},
      {kind:'pass',token:'pass'}]}};
}
function prompt(req){
  return {schema:protocol.PROMPT_SCHEMA,actingSeat:req.seat,
    promptType:'ChoosePokemonPrompt',description:'CHOOSE_POKEMON',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:LELE,effectName:'Tapu Cure-GX'},
    publicMetadata:{selectionType:'pokemon',minimumCount:2,
      maximumCount:2,allowCancel:false,isSecret:false,targetZone:'bench'},
    choices:req.observation.ownPublic.bench.map((p,i)=>({
      kind:'pokemon',token:'b'+i,printing:p.printing,
      publicMetadata:{selectionType:'pokemon',selectionIndex:i,
        selectedCount:1,ownerSeat:'actor',targetZone:'bench',
        benchIndex:i,isOwnerVisible:true}}))};
}
function decide(req){return worker.createPolicy({role:'opponent',
  seat:req.seat,policyVersion:worker.POLICY_VERSION,config:{}})
    .decide(req)}
for(const seat of [0,1]){
  test('seat '+seat+' invokes source Tapu Cure only for 200 damage on two priority Basics',()=>{
    const r=request(seat);
    assert.deepEqual(worker.tapuCureTargets(r.observation).map(x=>x.index),
      [0,1]);
    assert.deepEqual(decide(r),{kind:'select-action',token:'cure'});
    const p=prompt(r);protocol.validatePrompt(p,seat);
    r.prompt=p;
    const choice=decide(r);
    assert.deepEqual(choice,{kind:'select-choices',tokens:['b0','b1']});
    protocol.validateDecision(choice,p,new Set());
  });
  test('seat '+seat+' with fewer than two meaningful damaged Bench targets saves GX',()=>{
    const r=request(seat);
    r.observation.ownPublic.bench[1].damage=0;
    r.observation.ownPublic.bench[2].damage=0;
    assert.equal(worker.tapuCureTargets(r.observation).length,0);
    assert.notDeepEqual(decide(r),{kind:'select-action',token:'cure'});
    r.observation.ownPublic.bench[1].damage=30;
    assert.equal(worker.tapuCureTargets(r.observation).length,0);
  });
  test('seat '+seat+' excludes fully healthy and non-healable targets',()=>{
    const r=request(seat);
    r.observation.ownPublic.bench[0].publicRestrictions={cannotHeal:true};
    assert.equal(worker.tapuCureTargets(r.observation).length,0);
    r.observation.ownPublic.bench[0].publicRestrictions={};
    r.observation.ownPublic.bench[0].effectUnknown=true;
    assert.equal(worker.tapuCureTargets(r.observation).length,0);
  });
  test('seat '+seat+' healing prompt never chooses the opponent or a spoofed Bench index',()=>{
    const r=request(seat),p=prompt(r);r.prompt=p;
    p.choices[0].publicMetadata.ownerSeat='opponent';
    assert.equal(decide(r).kind,'abstain');
    p.choices[0].publicMetadata.ownerSeat='actor';
    p.choices[0].publicMetadata.benchIndex=42;
    assert.equal(decide(r).kind,'abstain');
    p.choices[0].publicMetadata.benchIndex=0;
    assert.deepEqual(decide(r),{kind:'select-choices',tokens:['b0','b1']});
  });
  test('seat '+seat+' invalid prompt source and wrong min/max abstain',()=>{
    const r=request(seat),p=prompt(r);r.prompt=p;
    p.source.sourcePrinting='Another Pokemon';
    assert.equal(decide(r).kind,'abstain');
    p.source.sourcePrinting=LELE;
    p.publicMetadata.minimumCount=1;
    assert.equal(decide(r).kind,'abstain');
    p.publicMetadata.minimumCount=2;
    p.publicMetadata.maximumCount=1;
    assert.equal(decide(r).kind,'abstain');
  });
  test('seat '+seat+' native attack root is required; cannot invent GX action',()=>{
    const r=request(seat);
    r.actionFrontier.items=r.actionFrontier.items.filter(x=>x.kind!=='attack');
    assert.notDeepEqual(decide(r),{kind:'select-action',token:'cure'});
  });
}
