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
