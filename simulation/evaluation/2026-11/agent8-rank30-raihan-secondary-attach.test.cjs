'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const w=require('./agent8-rank30-clefairy-opponent-policy.cjs');
const protocol=require('./agent49-policy-protocol.cjs');
const PSY='Psychic Energy MEE 13';
const CLEF="Lillie's Clefairy ex JTG 56",LATIAS='Latias ex SSP 76',
  LELE='Tapu Lele-GX GRI 60';
const LIVE=Object.freeze([{abilityName:'Fairy Zone',suppressed:false,
  reasonCode:null,sourcePrinting:null}]);
const SKY=Object.freeze([{abilityName:'Skyliner',suppressed:false,
  reasonCode:null,sourcePrinting:null}]);
function request(seat){
  const obs={actorSeat:seat,globalTurn:5,ownHand:[],
    ownTurnResources:{supporterPlayedTurn:5,energyPlayedTurn:0,
      retreatedTurn:0,vstarUsed:true},
    ownPublic:{active:{printing:LATIAS,energies:[PSY,PSY],printed:{stage:'BASIC'}},
      bench:[{printing:CLEF,energies:[],abilities:['Fairy Zone'],
        abilitySuppressions:LIVE}],
      discard:[PSY],deckCount:23,prizeCount:2},
    opponentPublic:{active:{printing:'Regidrago VSTAR SIT 136',
      hp:280,damage:0,printed:{types:['Dragon']}},
      bench:[],deckCount:23,prizeCount:3}};
  const prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
    promptType:'AttachEnergyPrompt',description:'ATTACH_ENERGY_CARDS',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:'Raihan EVS 152',effectName:'Raihan'},
    publicMetadata:{selectionType:'energy-attachment',count:2,
      minimumCount:1,maximumCount:1,allowCancel:false,
      ownerSeat:'actor',sourceZone:'discard',isOwnerVisible:true,
      energyType:'BASIC'},
    choices:[
      {kind:'energy',token:'latias',printing:PSY,
        publicMetadata:{ownerSeat:'actor',sourceZone:'discard',
          isOwnerVisible:true,energyType:'BASIC',zone:'active',
          choiceIndex:0,selectedCount:1}},
      {kind:'energy',token:'clefairy',printing:PSY,
        publicMetadata:{ownerSeat:'actor',sourceZone:'discard',
          isOwnerVisible:true,energyType:'BASIC',zone:'bench',benchIndex:0,
          choiceIndex:1,selectedCount:1}}
    ]};
  return {role:'opponent',seat,observation:obs,prompt,
    publicEventReceipt:{actorSeat:seat,turn:5,
      priorOpponentTurnKO:{turn:4,any:true,byAttack:true}},
    actionFrontier:{items:[]}};
}
function decide(req){return w.createPolicy({role:'opponent',seat:req.seat,
  policyVersion:w.POLICY_VERSION,config:{}}).decide(req)}
for(const seat of [0,1]){
  test('seat '+seat+' Raihan chooses lethal third Psychic on Active Latias over ordinary Clefairy',()=>{
    const r=request(seat);
    protocol.validatePrompt(r.prompt,seat);
    const d=decide(r);
    assert.deepEqual(d,{kind:'select-choice',token:'latias'});
    protocol.validateDecision(d,r.prompt,new Set());
  });
  test('seat '+seat+' Raihan reverts to Clefairy if Fairy Zone suppressed',()=>{
    const r=request(seat);
    r.observation.ownPublic.bench[0].abilitySuppressions=[{
      abilityName:'Fairy Zone',suppressed:true,
      reasonCode:'STADIUM_LOCKED',sourcePrinting:'Path to the Peak CRE 148'}];
    assert.deepEqual(decide(r),{kind:'select-choice',token:'clefairy'});
  });
  test('seat '+seat+' Raihan powers Lele Energy Drive with a decisive second Energy',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={
      printing:LELE,energies:[PSY],printed:{stage:'BASIC'}};
    r.observation.opponentPublic.active={printing:'Shadow Rider Calyrex VMAX CRE 75',
      hp:320,damage:180,energies:Array(5).fill(PSY)};
    r.prompt.choices[0].token='lele';
    assert.deepEqual(decide(r),{kind:'select-choice',token:'lele'});
    r.observation.opponentPublic.active.damage=120;
    assert.deepEqual(decide(r),{kind:'select-choice',token:'clefairy'});
  });
  test('seat '+seat+' Raihan can prepare a funded Bench Latias for still-unused free retreat',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:CLEF,energies:[],
      printed:{stage:'BASIC'}};
    r.observation.ownPublic.bench=[
      {printing:LATIAS,energies:[PSY,PSY],abilities:['Skyliner'],
        abilitySuppressions:SKY},
      {printing:CLEF,abilities:['Fairy Zone'],
        abilitySuppressions:LIVE,energies:[]}];
    r.prompt.choices[0].publicMetadata.zone='bench';
    r.prompt.choices[0].publicMetadata.benchIndex=0;
    r.prompt.choices[1].publicMetadata.benchIndex=1;
    assert.deepEqual(decide(r),{kind:'select-choice',token:'latias'});
    r.observation.ownTurnResources.retreatedTurn=5;
    assert.deepEqual(decide(r),{kind:'select-choice',token:'clefairy'});
  });
  test('seat '+seat+' prior-KO receipt is mandatory and cannot be stale',()=>{
    const r=request(seat);
    r.publicEventReceipt.priorOpponentTurnKO.turn=3;
    assert.equal(decide(r).kind,'abstain');
    r.publicEventReceipt.priorOpponentTurnKO.turn=4;
    r.publicEventReceipt.priorOpponentTurnKO.any=false;
    assert.equal(decide(r).kind,'abstain');
  });
  test('seat '+seat+' Raihan refuses fabricated source and opponent-owned Energy choices',()=>{
    const r=request(seat);
    r.prompt.choices[0].publicMetadata.ownerSeat='opponent';
    assert.deepEqual(decide(r),{kind:'select-choice',token:'clefairy'});
    r.prompt.choices[0].publicMetadata.ownerSeat='actor';
    r.prompt.source.effectName='Motivate';
    assert.equal(decide(r).kind,'abstain');
  });
}
