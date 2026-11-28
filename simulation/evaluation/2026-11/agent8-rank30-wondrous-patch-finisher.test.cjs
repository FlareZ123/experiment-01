'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const worker=require('./agent8-rank30-clefairy-opponent-policy.cjs');
const protocol=require('./agent49-policy-protocol.cjs');
const PSY='Psychic Energy MEE 13',PATCH='Wondrous Patch PFL 94';
const LATIAS='Latias ex SSP 76',LELE='Tapu Lele-GX GRI 60';
const CLEF="Lillie's Clefairy ex JTG 56";
const LIVE=[{abilityName:'Fairy Zone',suppressed:false,
  reasonCode:null,sourcePrinting:null}];
const SKY=[{abilityName:'Skyliner',suppressed:false,
  reasonCode:null,sourcePrinting:null}];
function config(){return {sourceRank:worker.SOURCE_RANK,
  sourceBlobSha1:worker.SOURCE_LIST_BLOB_SHA1,enablePatchProjection:true}}
function policy(seat,gated=true){return worker.createPolicy({role:'opponent',seat,
  policyVersion:worker.POLICY_VERSION,config:gated?config():{}})}
function request(seat,finisher=LATIAS){
  const bench=[
    {printing:finisher,energies:finisher===LATIAS?[PSY,PSY]:[PSY],
      abilities:finisher===LATIAS?['Skyliner']:[],
      abilitySuppressions:finisher===LATIAS?SKY:[]},
    {printing:CLEF,energies:[PSY],
      abilities:['Fairy Zone'],abilitySuppressions:LIVE}];
  if(finisher===LELE)bench.push({printing:LATIAS,energies:[],
    abilities:['Skyliner'],abilitySuppressions:SKY});
  const target=finisher===LATIAS?
    {printing:'Regidrago VSTAR SIT 136',hp:280,damage:0,
      printed:{types:['Dragon']}}:
    {printing:'Shadow Rider Calyrex VMAX CRE 75',hp:320,
      damage:180,energies:Array(5).fill(PSY)};
  const obs={actorSeat:seat,globalTurn:7,ownHand:[PATCH],
    ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:0,
      retreatedTurn:0,vstarUsed:true},
    ownPublic:{active:{printing:'Unown AOR 30',energies:[],
      printed:{stage:'BASIC'}},
      bench,discard:[PSY],deckCount:22,prizeCount:2},
    opponentPublic:{active:target,bench:[],deckCount:22,prizeCount:3}};
  return {role:'opponent',seat,prompt:null,
    observation:obs,actionFrontier:{items:[
      {kind:'play-card',actorPrinting:PATCH,token:'patch'},
      {kind:'pass',token:'pass'}]}};
}
function prompt(req){
  return {schema:protocol.PROMPT_SCHEMA,actingSeat:req.seat,
    promptType:'AttachEnergyPrompt',description:'ATTACH_ENERGY_CARDS',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:PATCH,effectName:'Wondrous Patch'},
    publicMetadata:{selectionType:'energy-attachment',minimumCount:1,
      maximumCount:1,allowCancel:false,sourceZone:'discard',
      ownerSeat:'actor',isOwnerVisible:true,energyType:'BASIC',count:2},
    choices:req.observation.ownPublic.bench.map((p,i)=>({
      kind:'energy',token:'bench'+i,printing:PSY,
      publicMetadata:{selectionType:'energy-attachment',choiceIndex:i,
        selectedCount:1,ownerSeat:'actor',isOwnerVisible:true,
        energyType:'BASIC',sourceZone:'discard',zone:'bench',benchIndex:i}}))};
}
for(const seat of [0,1]){
  test('seat '+seat+' opt-in Patch chooses Latias one-Energy KO ahead of Clefairy',()=>{
    const r=request(seat),decide=policy(seat).decide;
    assert.deepEqual(decide(r),{kind:'select-action',token:'patch'});
    const p=prompt(r);protocol.validatePrompt(p,seat);r.prompt=p;
    const selected=decide(r);
    assert.deepEqual(selected,{kind:'select-choice',token:'bench0'});
    protocol.validateDecision(selected,p,new Set());
    r.observation.ownPublic.bench[0].energies.push(PSY);
    r.observation.ownHand=[];
    r.prompt=null;
    r.actionFrontier.items=[
      {kind:'retreat',token:'retreat',targetPrinting:LATIAS,
        publicMetadata:{targetSeat:'actor',targetZone:'bench',benchIndex:0}},
      {kind:'pass',token:'pass'}];
    assert.deepEqual(decide(r),{kind:'select-action',token:'retreat'});
    const oldActive=r.observation.ownPublic.active;
    r.observation.ownPublic.active=r.observation.ownPublic.bench[0];
    r.observation.ownPublic.bench[0]=oldActive;
    r.actionFrontier.items=[
      {kind:'attack',actorPrinting:LATIAS,attackName:'Eon Blade',token:'blade'},
      {kind:'pass',token:'pass'}];
    assert.deepEqual(decide(r),{kind:'select-action',token:'blade'});
  });
  test('seat '+seat+' Patch also selects funded Lele Energy Drive VMAX knockout',()=>{
    const r=request(seat,LELE),decide=policy(seat).decide;
    assert.deepEqual(decide(r),{kind:'select-action',token:'patch'});
    const p=prompt(r);protocol.validatePrompt(p,seat);r.prompt=p;
    assert.deepEqual(decide(r),{kind:'select-choice',token:'bench0'});
    r.observation.opponentPublic.active.damage=100;
    assert.notDeepEqual(decide(r),{kind:'select-choice',token:'bench0'});
  });
  test('seat '+seat+' absent free-retreat guarantee preserves ordinary Clefairy Patch target',()=>{
    const r=request(seat),decide=policy(seat).decide;
    r.observation.ownPublic.bench[0].abilitySuppressions=[{
      abilityName:'Skyliner',suppressed:true,
      reasonCode:'ABILITY_LOCK',sourcePrinting:'Empoleon V BST 40'}];
    r.prompt=prompt(r);
    assert.deepEqual(decide(r),{kind:'select-choice',token:'bench1'});
    r.observation.ownPublic.bench[0].abilitySuppressions=SKY;
    r.observation.ownTurnResources.retreatedTurn=7;
    assert.deepEqual(decide(r),{kind:'select-choice',token:'bench1'});
  });
  test('seat '+seat+' standard V3 config still refuses unadmitted Patch hook',()=>{
    const r=request(seat);
    assert.notDeepEqual(policy(seat,false).decide(r),
      {kind:'select-action',token:'patch'});
    r.prompt=prompt(r);
    assert.equal(policy(seat,false).decide(r).kind,'abstain');
  });
  test('seat '+seat+' Patch choice rejects spoofed foreign-owner energy',()=>{
    const r=request(seat),p=prompt(r);r.prompt=p;
    p.choices[0].publicMetadata.ownerSeat='opponent';
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choice',token:'bench1'});
    p.source.sourcePrinting='Unknown Card';
    assert.equal(policy(seat).decide(r).kind,'abstain');
  });
}
