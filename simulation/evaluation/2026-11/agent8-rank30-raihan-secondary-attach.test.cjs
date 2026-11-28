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

for(const seat of [0,1]){
  const blank={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
    promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD_TO_HAND',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:'Raihan EVS 152',effectName:'Raihan'},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,
      maximumCount:1,allowCancel:false,sourceZone:'deck',
      ownerSeat:'actor',isOwnerVisible:true}};
  test('seat '+seat+' Raihan offered root now enables immediate Latias/Lele secondary KO',()=>{
    const req=request(seat);
    req.prompt=null;
    req.observation.decisionKind='owner-root';
    req.observation.ownHand=['Raihan EVS 152'];
    req.observation.ownTurnResources.supporterPlayedTurn=0;
    req.actionFrontier.items=[
      {kind:'play-card',actorPrinting:'Raihan EVS 152',token:'raihan'},
      {kind:'pass',token:'pass'}];
    assert.deepEqual(decide(req),{kind:'select-action',token:'raihan'});
    req.observation.opponentPublic.active={printing:'Shadow Rider Calyrex VMAX CRE 75',
      hp:320,damage:180,energies:Array(5).fill(PSY)};
    req.observation.ownPublic.active={printing:LELE,energies:[PSY]};
    req.observation.ownPublic.bench=[];
    assert.deepEqual(decide(req),{kind:'select-action',token:'raihan'});
    req.observation.opponentPublic.active.damage=40;
    assert.notDeepEqual(decide(req),{kind:'select-action',token:'raihan'});
  });
  test('seat '+seat+' Sky Field is highest Raihan search when it completes full-field Rondo KO',()=>{
    const req=request(seat),le=CLEF;
    req.observation.ownPublic.active={printing:le,
      energies:[PSY,PSY],hp:190,damage:0};
    req.observation.ownPublic.bench=[
      {printing:'Unown AOR 30'}, {printing:'Latias ex SSP 76'},
      {printing:'Dedenne-GX UNB 57'}, {printing:'Crobat V DAA 104'},
      {printing:'Fezandipiti ex ASC 142'}];
    req.observation.ownPublic.prizeCount=3;
    req.observation.ownHand=['Mimikyu GRI 58','Dialga-GX UPR 100',
      'Empoleon V BST 40'];
    req.observation.opponentPublic.active={
      printing:'Shadow Rider Calyrex VMAX CRE 75',hp:220,damage:0,
      energies:[PSY,PSY]};
    req.observation.opponentPublic.bench=[
      {printing:'Regidrago V SIT 135'}, {printing:'Regidrago VSTAR SIT 136'}];
    req.prompt={...blank,choices:[
      {kind:'card',token:'sky',printing:'Sky Field ROS 89'},
      {kind:'card',token:'clefairy',printing:le},
      {kind:'card',token:'guzma',printing:'Guzma BUS 115'}]};
    protocol.validatePrompt(req.prompt,seat);
    const choice=decide(req);
    assert.deepEqual(choice,{kind:'select-choices',tokens:['sky']});
    protocol.validateDecision(choice,req.prompt,new Set());
    req.observation.ownHand=['Mimikyu GRI 58'];
    assert.notDeepEqual(decide(req),{kind:'select-choices',tokens:['sky']});
  });
  test('seat '+seat+' search phase refuses stale KO certificate',()=>{
    const req=request(seat);
    req.prompt={...blank,choices:[
      {kind:'card',token:'sky',printing:'Sky Field ROS 89'},
      {kind:'card',token:'clefairy',printing:CLEF}]};
    req.publicEventReceipt.priorOpponentTurnKO.turn=3;
    assert.equal(decide(req).kind,'abstain');
  });
}
