'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const w=require('./agent8-rank30-clefairy-opponent-policy.cjs');
const PSY='Psychic Energy MEE 13';
const CLEF="Lillie's Clefairy ex JTG 56";
const LIVE=Object.freeze([{abilityName:'Fairy Zone',suppressed:false,
  reasonCode:null,sourcePrinting:null}]);
function request(seat,{attacker,target,attack,ownEnergy=3,opponentEnergy=0,
  benchFairy=false,stadium=[],extraRoot=true}){
  const own={actorSeat:seat,globalTurn:6,ownHand:[],
    ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:0,vstarUsed:true},
    ownPublic:{active:{printing:attacker,energies:Array(ownEnergy).fill(PSY)},
      bench:benchFairy?[{printing:CLEF,abilities:['Fairy Zone'],
        abilitySuppressions:LIVE}]:[],stadium,discard:[],deckCount:23,prizeCount:3},
    opponentPublic:{active:{...target,
      energies:target.energies??Array(opponentEnergy).fill(PSY)},
      bench:[],stadium:[],deckCount:20,prizeCount:3}};
  return {role:'opponent',seat,observation:own,prompt:null,
    actionFrontier:{items:[
      ...(extraRoot?[{kind:'attack',actorPrinting:attacker,
        attackName:attack,token:'attack'}]:[]),{kind:'pass',token:'pass'}]}};
}
const policy=seat=>w.createPolicy({role:'opponent',seat,
  policyVersion:w.POLICY_VERSION,config:{}});
const LELE='Tapu Lele-GX GRI 60',LATIAS='Latias ex SSP 76';
const vmax={printing:'Shadow Rider Calyrex VMAX CRE 75',
  hp:320,damage:180,printed:{types:['Psychic']}};
const drago={printing:'Regidrago VSTAR SIT 136',
  hp:280,damage:0,printed:{types:['Dragon']}};
for(const seat of [0,1]){
  test('seat '+seat+' Tapu Lele Energy Drive certifies visible 20x energy KO',()=>{
    const req=request(seat,{attacker:LELE,target:vmax,attack:'Energy Drive',
      ownEnergy:2,opponentEnergy:5});
    assert.deepEqual(w.tapuLeleEnergyDriveKO(req.observation),
      {damageLowerBound:140,remaining:140,energyCardFloor:7,prizeLowerBound:3});
    assert.deepEqual(policy(seat).decide(req),
      {kind:'select-action',token:'attack'});
    req.observation.opponentPublic.active.damage=170;
    assert.equal(w.tapuLeleEnergyDriveKO(req.observation),null);
    assert.notDeepEqual(policy(seat).decide(req),
      {kind:'select-action',token:'attack'});
  });
  test('seat '+seat+' Lele cannot assert KO through unknown damage prevention',()=>{
    const req=request(seat,{attacker:LELE,target:{...vmax,
      tools:['Eviolite NVI 91']},attack:'Energy Drive',
      ownEnergy:2,opponentEnergy:5});
    assert.equal(w.tapuLeleEnergyDriveKO(req.observation),null);
    req.observation.opponentPublic.active.tools=['Stealthy Hood UNB 186'];
    assert.ok(w.tapuLeleEnergyDriveKO(req.observation));
    req.observation.opponentPublic.active.damageModifiersUnknown=true;
    assert.equal(w.tapuLeleEnergyDriveKO(req.observation),null);
  });
  test('seat '+seat+' Latias Eon Blade punishes certified Fairy Zone Dragon weakness',()=>{
    const req=request(seat,{attacker:LATIAS,target:drago,attack:'Eon Blade',
      benchFairy:true});
    assert.deepEqual(w.latiasEonBladeKO(req.observation),
      {damage:400,remaining:280,prizeLowerBound:2});
    assert.deepEqual(policy(seat).decide(req),
      {kind:'select-action',token:'attack'});
    req.observation.ownPublic.bench[0].abilitySuppressions=[{
      abilityName:'Fairy Zone',suppressed:true,
      reasonCode:'STADIUM_LOCKED',sourcePrinting:'Path to the Peak CRE 148'
    }];
    assert.equal(w.latiasEonBladeKO(req.observation),null);
    assert.notDeepEqual(policy(seat).decide(req),
      {kind:'select-action',token:'attack'});
  });
  test('seat '+seat+' Latias without certified Fairy Zone cannot claim Dragon KO',()=>{
    const req=request(seat,{attacker:LATIAS,target:drago,
      attack:'Eon Blade',benchFairy:false});
    assert.equal(w.latiasEonBladeKO(req.observation),null);
    req.observation.ownPublic.bench=[{printing:CLEF,abilities:['Fairy Zone'],
      abilitySuppressions:LIVE}];
    req.observation.ownPublic.stadium=['Path to the Peak CRE 148'];
    assert.equal(w.latiasEonBladeKO(req.observation),null);
  });
  test('seat '+seat+' Latias base Eon Blade directly finishes 210-HP V after 10 damage',()=>{
    const req=request(seat,{attacker:LATIAS,attack:'Eon Blade',
      target:{printing:'Shadow Rider Calyrex V CRE 74',
        hp:210,damage:10,printed:{types:['Psychic']}}});
    assert.deepEqual(policy(seat).decide(req),
      {kind:'select-action',token:'attack'});
    req.observation.opponentPublic.active.hp=320;
    req.observation.opponentPublic.active.damage=0;
    assert.equal(w.latiasEonBladeKO(req.observation),null);
  });
  test('seat '+seat+' neither attack can be fabricated absent native offered root',()=>{
    const req=request(seat,{attacker:LELE,target:vmax,
      attack:'Energy Drive',ownEnergy:2,opponentEnergy:5,extraRoot:false});
    assert.equal(policy(seat).decide(req).token,'pass');
    req.observation.ownPublic.active.printing=LATIAS;
    req.observation.opponentPublic.active={
      printing:'Shadow Rider Calyrex V CRE 74',hp:210,damage:20};
    assert.equal(policy(seat).decide(req).token,'pass');
  });
}

for(const seat of [0,1]){
  const stage={stage:'BASIC'};
  const sky=[{abilityName:'Skyliner',suppressed:false,
    reasonCode:null,sourcePrinting:null}];
  const psychic=['Psychic Energy MEE 13','Psychic Energy MEE 13',
    'Psychic Energy MEE 13'];
  function retreatRequest(bench,target,activePrinting='Unown AOR 30'){
    return {role:'opponent',seat,observation:{
      actorSeat:seat,globalTurn:7,ownHand:[],
      ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:0,vstarUsed:true},
      ownPublic:{active:{printing:activePrinting,printed:stage,energies:[]},
        bench,stadium:[],deckCount:19,prizeCount:3,discard:[],
        publicTurnRestrictions:{stadiumAndToolHaveNoEffectTurnsRemaining:0}},
      opponentPublic:{active:target,bench:[],deckCount:20,prizeCount:3}},
      prompt:null,actionFrontier:{items:[
        ...bench.map((row,index)=>({kind:'retreat',token:'retreat'+index,
          targetPrinting:row.printing,publicMetadata:{
            targetSeat:'actor',targetZone:'bench',benchIndex:index}})),
        {kind:'pass',token:'pass'}]}};
  }
  test('seat '+seat+' free retreat to pre-funded Latias for Fairy Zone OHKO',()=>{
    const r=retreatRequest([
      {printing:LATIAS,energies:psychic,abilities:['Skyliner'],
        abilitySuppressions:sky},
      {printing:CLEF,abilities:['Fairy Zone'],abilitySuppressions:LIVE,
        energies:[]}
    ],drago);
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',
      token:'retreat0'});
    r.observation.ownPublic.bench[1].abilitySuppressions=[{
      abilityName:'Fairy Zone',suppressed:true,
      reasonCode:'STADIUM_LOCKED',sourcePrinting:'Path to the Peak CRE 148'}];
    assert.equal(w.freeRetreatToPrintedFinisher(r.actionFrontier.items,
      r.observation),null);
  });
  test('seat '+seat+' free retreat to funded Lele for Energy Drive OHKO',()=>{
    const r=retreatRequest([
      {printing:LATIAS,energies:[],abilities:['Skyliner'],
        abilitySuppressions:sky},
      {printing:LELE,energies:psychic.slice(0,2)}
    ],{...vmax,energies:psychic.concat(psychic.slice(0,2))});
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'retreat1'});
    r.observation.ownPublic.active.printed.stage='STAGE_1';
    assert.equal(w.freeRetreatToPrintedFinisher(r.actionFrontier.items,
      r.observation),null);
  });
  test('seat '+seat+' must not hallucinate an unoffered or mismatched free retreat',()=>{
    const r=retreatRequest([
      {printing:LATIAS,energies:psychic,abilities:['Skyliner'],
        abilitySuppressions:sky},
      {printing:CLEF,abilities:['Fairy Zone'],abilitySuppressions:LIVE}
    ],drago);
    r.actionFrontier.items[0].targetPrinting='Another Pokemon';
    assert.equal(w.freeRetreatToPrintedFinisher(r.actionFrontier.items,
      r.observation),null);
    r.actionFrontier.items.splice(0,2);
    assert.equal(w.freeRetreatToPrintedFinisher(r.actionFrontier.items,
      r.observation),null);
  });
}

for(const seat of [0,1]){
  const ps='Psychic Energy MEE 13';
  const sky=[{abilityName:'Skyliner',suppressed:false,
    reasonCode:null,sourcePrinting:null}];
  const active={printing:'Unown AOR 30',printed:{stage:'BASIC'},energies:[]};
  function chain({target,bench,finisherIndex=0,attachIndex=0}){
    const hand=[ps];
    const items=[{kind:'play-card',actorPrinting:ps,token:'attach',
      targetPrinting:bench[attachIndex].printing,
      publicMetadata:{targetSeat:'actor',targetZone:'bench',
        targetIndex:attachIndex,isOwnerVisible:true}},
      ...bench.map((row,i)=>({kind:'retreat',token:'retreat'+i,
        targetPrinting:row.printing,
        publicMetadata:{targetSeat:'actor',targetZone:'bench',benchIndex:i}})),
      {kind:'pass',token:'pass'}];
    return {role:'opponent',seat,observation:{
      actorSeat:seat,globalTurn:6,ownHand:hand,
      ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:0,
        attackLocked:false,vstarUsed:true},
      ownPublic:{active:{...active},bench,stadium:[],discard:[],
        deckCount:20,prizeCount:3,
        publicTurnRestrictions:{stadiumAndToolHaveNoEffectTurnsRemaining:0}},
      opponentPublic:{active:target,bench:[],deckCount:20,prizeCount:3}},
      prompt:null,actionFrontier:{items}};
  }
  test('seat '+seat+' complete funded Latias Dragon KO chain attach → retreat → attack',()=>{
    const r=chain({target:drago,bench:[
      {printing:LATIAS,energies:[ps,ps],abilities:['Skyliner'],
        abilitySuppressions:sky},
      {printing:CLEF,energies:[],abilities:['Fairy Zone'],
        abilitySuppressions:LIVE}]});
    const decide=policy(seat).decide;
    assert.deepEqual(decide(r),{kind:'select-action',token:'attach'});
    r.observation.ownPublic.bench[0].energies.push(ps);
    r.observation.ownHand.pop();
    r.actionFrontier.items.shift();
    assert.deepEqual(decide(r),{kind:'select-action',token:'retreat0'});
    const oldActive=r.observation.ownPublic.active;
    r.observation.ownPublic.active=r.observation.ownPublic.bench[0];
    r.observation.ownPublic.bench[0]=oldActive;
    r.actionFrontier.items=[
      {kind:'attack',actorPrinting:LATIAS,attackName:'Eon Blade',token:'blade'},
      {kind:'pass',token:'pass'}];
    assert.deepEqual(decide(r),{kind:'select-action',token:'blade'});
  });
  test('seat '+seat+' complete Tapu Lele VMAX KO chain attach → retreat → attack',()=>{
    const r=chain({target:{...vmax,energies:Array(5).fill(ps)},bench:[
      {printing:LATIAS,energies:[],abilities:['Skyliner'],
        abilitySuppressions:sky},
      {printing:LELE,energies:[ps]}],attachIndex:1,finisherIndex:1});
    const decide=policy(seat).decide;
    assert.deepEqual(decide(r),{kind:'select-action',token:'attach'});
    r.observation.ownPublic.bench[1].energies.push(ps);
    r.observation.ownHand.pop();
    r.actionFrontier.items.shift();
    assert.deepEqual(decide(r),{kind:'select-action',token:'retreat1'});
    const oldActive=r.observation.ownPublic.active;
    r.observation.ownPublic.active=r.observation.ownPublic.bench[1];
    r.observation.ownPublic.bench[1]=oldActive;
    r.actionFrontier.items=[
      {kind:'attack',actorPrinting:LELE,attackName:'Energy Drive',token:'drive'},
      {kind:'pass',token:'pass'}];
    assert.deepEqual(decide(r),{kind:'select-action',token:'drive'});
  });
  test('seat '+seat+' refuses attachment aimed at a Bench finisher without legal retreat root',()=>{
    const r=chain({target:drago,bench:[
      {printing:LATIAS,energies:[ps,ps],abilities:['Skyliner'],
        abilitySuppressions:sky},
      {printing:CLEF,abilities:['Fairy Zone'],abilitySuppressions:LIVE}]});
    r.actionFrontier.items=r.actionFrontier.items.filter(x=>x.kind!=='retreat');
    assert.equal(w.manualEnergyCompletesPrintedKO(
      r.actionFrontier.items,r.observation),null);
  });
}
