'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const w=require('./agent8-rank30-clefairy-opponent-policy.cjs');
const MIM='Mimikyu GRI 58',CLEF="Lillie's Clefairy ex JTG 56";
function setup(seat,{
  copy='Max Geist',source='Shadow Rider Calyrex VMAX CRE 75',
  damage=200,energyCount=4,receipt=true,globalTurn=5,priorTurn=4,
  deckCount=20
}={}){
  const energies=Array.from({length:energyCount},()=> 'Psychic Energy MEE 13');
  const o={actorSeat:seat,globalTurn,ownHand:[],
    ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:0,vstarUsed:true},
    ownPublic:{active:{printing:MIM,energies:energies.slice(0,2)},
      bench:[{printing:CLEF,energies:energies.slice(2)}],discard:[],
      deckCount,prizeCount:3},
    opponentPublic:{active:{printing:'Shadow Rider Calyrex VMAX CRE 75',
      hp:320,damage},bench:[],deckCount:20,prizeCount:3}};
  const attack={turn:priorTurn,sourcePrinting:source,
    attackName:copy,gxAttack:false,copycatAttack:false};
  return {role:'opponent',seat,observation:o,publicEventReceipt:receipt?{
    actorSeat:seat,turn:globalTurn,
    opponentLastTurnTurn:priorTurn,
    mimikyuCopycatCompatible:true,
    opponentLastTurnAttacks:[attack],opponentCopycatChoices:[attack]}:null,
    prompt:null,actionFrontier:{items:[
      {kind:'attack',actorPrinting:MIM,attackName:'Copycat',token:'copy'},
      {kind:'attack',actorPrinting:MIM,attackName:'Filch',token:'filch'},
      {kind:'pass',token:'pass'}]}
  };
}
const policy=seat=>w.createPolicy({role:'opponent',seat,policyVersion:w.POLICY_VERSION,config:{}});
for(const seat of [0,1]){
  test('seat '+seat+' chooses source Max Geist KO from copied non-GX last attack',()=>{
    const r=setup(seat);
    assert.deepEqual(w.guaranteedMimikyuCopycatKO(r),{
      sourcePrinting:'Shadow Rider Calyrex VMAX CRE 75',
      attackName:'Max Geist',damage:130,remaining:120});
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'copy'});
  });
  test('seat '+seat+' Filch draws two instead of a nonlethal copied attack',()=>{
    assert.deepEqual(policy(seat).decide(setup(seat,{damage:30})),
      {kind:'select-action',token:'filch'});
  });
  test('seat '+seat+' unknown copied attack remains unsupported, Filch available',()=>{
    const r=setup(seat,{copy:'Trifrost',source:'Kyurem SFA 47'});
    assert.equal(w.guaranteedMimikyuCopycatKO(r),null);
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'filch'});
  });
  test('seat '+seat+' missing or stale event receipts never enable copy attack',()=>{
    const missing=setup(seat,{receipt:false});
    assert.deepEqual(policy(seat).decide(missing),{kind:'select-action',token:'filch'});
    const stale=setup(seat,{priorTurn:2});
    assert.equal(w.guaranteedMimikyuCopycatKO(stale),null);
    assert.deepEqual(policy(seat).decide(stale),{kind:'select-action',token:'filch'});
    const wrongActor=setup(seat);wrongActor.publicEventReceipt.actorSeat=1-seat;
    assert.equal(w.guaranteedMimikyuCopycatKO(wrongActor),null);
  });
  test('seat '+seat+' copied GX/copycat attacks remain forbidden without native correction',()=>{
    const gx=setup(seat);
    gx.publicEventReceipt.opponentCopycatChoices[0].gxAttack=true;
    assert.deepEqual(policy(seat).decide(gx),{kind:'select-action',token:'filch'});
    const copycat=setup(seat);
    copycat.publicEventReceipt.opponentCopycatChoices[0].copycatAttack=true;
    assert.deepEqual(policy(seat).decide(copycat),{kind:'select-action',token:'filch'});
  });
  test('seat '+seat+' copies observed Clefairy Full Moon Rondo only for deterministic KO',()=>{
    const r=setup(seat,{copy:'Full Moon Rondo',source:CLEF,damage:300});
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'copy'});
    r.observation.opponentPublic.active.damage=0;
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'filch'});
  });
  test('seat '+seat+' Basic Psychic-only Max Geist estimate never assumes Special Energy',()=>{
    const r=setup(seat,{energyCount:0});
    r.observation.ownPublic.active.energies=['Telepath [P] Energy M3','Telepath [P] Energy M3'];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'filch'});
  });
  test('seat '+seat+' a one-card deck cannot safely invoke Filch fallback',()=>{
    const r=setup(seat,{receipt:false,deckCount:1});
    assert.equal(policy(seat).decide(r).kind,'abstain');
  });
}
