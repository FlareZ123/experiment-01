'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const protocol=require('./agent49-policy-protocol.cjs');
const worker=require('./agent8-rank30-clefairy-opponent-policy.cjs');
const {POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,createPolicy}=worker;
const clef="Lillie's Clefairy ex JTG 56";
const vip='Battle VIP Pass FST 225',box='Secret Box TWM 163',ball='Quick Ball FST 237';
function request(seat,ownHand,ownBench,sourcePrinting,zone,items,min,max) {
  const choices=items.map(([printing,token])=>({kind:'card',printing,token}));
  if(min===0)choices.push({kind:'empty-selection',token:'none'});
  return {
    role:'opponent',seat,
    observation:{actorSeat:seat,globalTurn:4,ownHand,
      ownTurnResources:{vstarUsed:false},
      ownPublic:{active:{printing:'Unown AOR 30'},bench:ownBench.map(printing=>({printing})),
        discard:[],stadium:[],deckCount:24,prizeCount:4},
      opponentPublic:{active:{printing:'Shadow Rider Calyrex VMAX CRE 75',hp:320,damage:0},
        bench:[],stadium:[],prizeCount:4}},
    prompt:{schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
      promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD_TO_HAND',
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting,effectName:sourcePrinting.replace(/ (TWM 163|FST 225|FST 237)$/,'')},
      publicMetadata:{selectionType:'card-combination',sourceZone:zone,
        ownerSeat:'actor',isOwnerVisible:true,minimumCount:min,maximumCount:max,
        allowCancel:false,isSecret:false},
      choices},
    actionFrontier:{items:[]}
  };
}
const p=seat=>createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,
  config:{sourceRank:SOURCE_RANK,sourceBlobSha1:SOURCE_LIST_BLOB_SHA1}});
function assertValid(seat,r,expected) {
  protocol.validatePrompt(r.prompt,seat);
  const decision=p(seat).decide(r);
  assert.deepEqual(decision,expected);
  assert.deepEqual(protocol.validateDecision(decision,r.prompt,new Set()),expected);
}
for(const seat of [0,1]) {
  test('seat '+seat+' Secret Box 3-card payment and four-category search pass actual worker schema',()=>{
    const energy='Psychic Energy MEE 13';
    const r=request(seat,[box,energy,vip,vip,'Telepathic Psychic Energy POR 88'],
      [clef,'Crobat V DAA 104'],'Secret Box TWM 163','hand',
      [[energy,'psy'],[vip,'vip-a'],[vip,'vip-b'],
      ['Telepathic Psychic Energy POR 88','protected']],3,3);
    assertValid(seat,r,{kind:'select-choices',tokens:['psy','vip-a','vip-b']});
    r.observation.ownHand=['Telepathic Psychic Energy POR 88'];
    r.observation.ownPublic.discard=[energy];
    r.prompt=request(seat,[],[],box,'deck',[
      ['Wondrous Patch PFL 94','patch'],['Forest Seal Stone SIT 156','fss'],
      ['Guzma BUS 115','guzma'],['Sky Field ROS 89','sky']],0,4).prompt;
    assertValid(seat,r,{kind:'select-choices',tokens:['patch','fss','guzma','sky']});
  });
  test('seat '+seat+' Quick Ball cost and Clefairy deck search pass actual worker schema',()=>{
    const r=request(seat,[ball,vip,'Telepathic Psychic Energy POR 88'],
      [],ball,'hand',[[vip,'vip'],['Telepathic Psychic Energy POR 88','protected']],1,1);
    assertValid(seat,r,{kind:'select-choices',tokens:['vip']});
    r.prompt=request(seat,[],[],ball,'deck',[[clef,'clef'],
      ['Latias ex SSP 76','latias']],0,1).prompt;
    assertValid(seat,r,{kind:'select-choices',tokens:['clef']});
  });
  test('seat '+seat+' Battle VIP Pass exact two Basics or empty legally selected',()=>{
    const r=request(seat,[vip],[],vip,'deck',
      [[clef,'clef'],['Latias ex SSP 76','latias'],[clef,'clef2']],0,2);
    assertValid(seat,r,{kind:'select-choices',tokens:['clef','latias']});
    r.prompt=request(seat,[vip],[],vip,'deck',[],0,2).prompt;
    assertValid(seat,r,{kind:'select-choice',token:'none'});
  });
}
test('unsupported source and source-zone payment failures produce codebook-valid abstention',()=>{
  const r=request(0,[box,'Telepathic Psychic Energy POR 88'],[clef],
    box,'hand',[['Telepathic Psychic Energy POR 88','protected']],1,1);
  assertValid(0,r,{kind:'abstain',reasonCode:'UNSUPPORTED_CARD_COMBINATION_SOURCE'});
  r.prompt=request(0,[box,'Telepathic Psychic Energy POR 88'],[clef],
    'Wondrous Patch PFL 94','deck',[],0,1).prompt;
  assertValid(0,r,{kind:'abstain',reasonCode:'UNSUPPORTED_PROMPT_TYPE'});
});


for(const seat of [0,1]){
  test('seat '+seat+' explicit Patch projector opt-in selects source alias and valid discard-to-Bench energy target',()=>{
    const patchPrinting='Wonder Patch MBD';
    const cfg={sourceRank:SOURCE_RANK,sourceBlobSha1:SOURCE_LIST_BLOB_SHA1,
      enablePatchProjection:true};
    const patchWorker=createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,config:cfg});
    const r=request(seat,[patchPrinting],[clef],'Secret Box TWM 163','hand',
      [['Psychic Energy MEE 13','dead']],1,1);
    r.observation.ownPublic.discard=['Psychic Energy MEE 13'];
    r.prompt=null;
    r.actionFrontier.items=[{kind:'play-card',actorPrinting:patchPrinting,token:'play-patch'}];
    assert.deepEqual(patchWorker.decide(r),{kind:'select-action',token:'play-patch'});
    // This is the exact actor-facing shape supplied by the opt-in projection,
    // after native Store has separately validated an actual physical result.
    r.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
      promptType:'AttachEnergyPrompt',description:'ATTACH_ENERGY_TO_BENCH',
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:patchPrinting,effectName:'Wondrous Patch'},
      choices:[{kind:'energy',token:'energy-0',printing:'Psychic Energy MEE 13',
        publicMetadata:{sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true,
          benchIndex:0,energyType:'BASIC',zone:'bench',selectedCount:1,choiceIndex:0}}],
      publicMetadata:{selectionType:'energy-attachment',sourceZone:'discard',
        ownerSeat:'actor',isOwnerVisible:true,energyType:'BASIC',zone:'bench',
        minimumCount:1,maximumCount:1,count:1,allowCancel:false}
    };
    protocol.validatePrompt(r.prompt,seat);
    assert.deepEqual(protocol.validateDecision(patchWorker.decide(r),r.prompt,new Set()),
      {kind:'select-choice',token:'energy-0'});
    const defaultWorker=p(seat);
    assert.deepEqual(defaultWorker.decide(r),
      {kind:'abstain',reasonCode:'UNSUPPORTED_PROMPT_TYPE'});
  });
}
test('Patch opt-in cannot be forged with arbitrary initialization fields',()=>{
  const cfg={sourceRank:SOURCE_RANK,sourceBlobSha1:SOURCE_LIST_BLOB_SHA1};
  assert.throws(()=>createPolicy({role:'opponent',seat:0,policyVersion:POLICY_VERSION,
    config:{...cfg,enablePatchProjection:false}}));
  assert.throws(()=>createPolicy({role:'opponent',seat:0,policyVersion:POLICY_VERSION,
    config:{...cfg,enablePatchProjection:true,unknown:true}}));
});


for(const seat of [0,1]) {
  test('seat '+seat+' native-alias Telepathic attachment and Psychic-only two-Basic search',()=>{
    const alias='Telepath [P] Energy M3';
    const r=request(seat,[alias],[clef],alias,'deck',
      [[clef,'clef'],['Latias ex SSP 76','latias'],
      ['Squawkabilly ex PAL 169','nonpsychic']],0,2);
    r.prompt=null;
    r.actionFrontier.items=[{kind:'play-card',actorPrinting:alias,
      targetPrinting:clef,token:'telepath-attach'}];
    assert.deepEqual(p(seat).decide(r),{kind:'select-action',token:'telepath-attach'});
    r.prompt=request(seat,[alias],[clef],alias,'deck',
      [[clef,'clef'],['Latias ex SSP 76','latias'],
      ['Squawkabilly ex PAL 169','nonpsychic']],0,2).prompt;
    assertValid(seat,r,{kind:'select-choices',tokens:['latias','clef']});
    r.prompt=request(seat,[alias],[clef],alias,'deck',
      [['Crobat V DAA 104','nonpsychic']],0,2).prompt;
    assertValid(seat,r,{kind:'select-choice',token:'none'});
  });
}
test('Telepathic Psychic Energy does not attach to non-Psychic offered targets',()=>{
  const r=request(0,['Telepathic Psychic Energy POR 88'],[],
    'Telepathic Psychic Energy POR 88','deck',[],0,2);
  r.prompt=null;
  r.actionFrontier.items=[{kind:'play-card',
    actorPrinting:'Telepathic Psychic Energy POR 88',
    targetPrinting:'Squawkabilly ex PAL 169',token:'bad-nonpsychic'}];
  assert.deepEqual(p(0).decide(r),{kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'});
  r.prompt=request(0,['Telepathic Psychic Energy POR 88'],[],
    'Telepathic Psychic Energy POR 88','opponentDeck',[],0,2).prompt;
  assertValid(0,r,{kind:'abstain',reasonCode:'UNSUPPORTED_CARD_COMBINATION_SOURCE'});
});


for(const seat of [0,1]) {
  test('seat '+seat+' source Forest Seal Stone attaches to Crobat V and uses Star Alchemy only for missing Clefairy',()=>{
    const r=request(seat,['Forest Seal Stone SIT'],['Crobat V DAA'],
      'Forest Seal Stone SIT','deck',[[clef,'clefairy'],['Psychic Energy MEE','energy']],1,1);
    r.observation.ownTurnResources={vstarUsed:false,energyPlayedTurn:0};
    r.prompt=null;
    r.actionFrontier.items=[{kind:'play-card',actorPrinting:'Forest Seal Stone SIT',
      targetPrinting:'Crobat V DAA',token:'attach-fss'}];
    assert.deepEqual(p(seat).decide(r),{kind:'select-action',token:'attach-fss'});
    r.observation.ownHand=[];
    r.actionFrontier.items=[{kind:'use-ability',actorPrinting:'Forest Seal Stone SIT',
      publicMetadata:{abilityName:'Star Alchemy'},token:'star-alchemy'}];
    assert.deepEqual(p(seat).decide(r),{kind:'select-action',token:'star-alchemy'});
    r.prompt=request(seat,[],['Crobat V DAA'],'Forest Seal Stone SIT','deck',
      [[clef,'clefairy'],['Psychic Energy MEE','energy']],1,1).prompt;
    r.prompt.source.effectName='Star Alchemy';
    assertValid(seat,r,{kind:'select-choices',tokens:['clefairy']});
    // Spending VSTAR without any missing axis is excluded.
    r.prompt=null;
    r.observation.ownPublic.active={printing:clef,
      energies:['Psychic Energy MEE','Telepath [P] Energy M3']};
    r.observation.ownHand=['Sky Field ROS'];
    assert.deepEqual(p(seat).decide(r),{kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'});
  });
}
test('Star Alchemy finds actual Telepathic Energy when one Energy short',()=>{
  const r=request(0,[],['Crobat V DAA'],
    'Forest Seal Stone SIT','deck',
    [['Telepath [P] Energy M3','telepath'],['Guzma BUS','guzma']],1,1);
  r.observation.ownTurnResources={vstarUsed:false,energyPlayedTurn:0};
  r.observation.ownPublic.active={printing:clef,energies:['Psychic Energy MEE']};
  r.prompt.source.effectName='Star Alchemy';
  assertValid(0,r,{kind:'select-choices',tokens:['telepath']});
});
