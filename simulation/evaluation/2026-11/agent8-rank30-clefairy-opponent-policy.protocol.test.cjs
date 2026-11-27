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


test('printed prize value discriminates VMAX, VSTAR, TAG TEAM-GX, Mega ex and single Prizes',()=>{
  assert.equal(worker.sourcePrizeTarget('Shadow Rider Calyrex VMAX CRE'),3);
  assert.equal(worker.sourcePrizeTarget('Regidrago VSTAR SIT'),2);
  assert.equal(worker.sourcePrizeTarget('Mewtwo & Mew-GX UNM'),3);
  assert.equal(worker.sourcePrizeTarget('Mega Gardevoir ex MEG'),3);
  assert.equal(worker.sourcePrizeTarget('Crobat V DAA'),2);
  assert.equal(worker.sourcePrizeTarget('Unown AOR'),1);
});
for(const seat of [0,1]) {
  test('seat '+seat+' Guzma selects lethal 3-Prize Bench target then powered own Clefairy',()=>{
    const r=request(seat,['Guzma BUS'],[clef,'Crobat V DAA'],
      'Guzma BUS','deck',[],0,1);
    r.observation.ownPublic.active={printing:'Unown AOR',hp:60,damage:0};
    r.observation.ownPublic.bench=[
      {printing:clef,energies:['Psychic Energy MEE','Telepath [P] Energy M3']},
      {printing:'Crobat V DAA',energies:[]}];
    r.observation.opponentPublic.bench=[
      {printing:'Shadow Rider Calyrex VMAX CRE',hp:320,damage:250},
      {printing:'Tapu Lele-GX GRI',hp:170,damage:100}];
    r.actionFrontier.items=[{kind:'play-card',actorPrinting:'Guzma BUS',token:'gust'}];
    r.prompt=null;
    assert.deepEqual(p(seat).decide(r),{kind:'select-action',token:'gust'});
    const mkPrompt=(ownerSeat,offer)=>({
      schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:'ChoosePokemonPrompt',
      description:'CHOOSE_POKEMON',source:{classification:'actor-choice',
        sourceKind:'card-effect',sourcePrinting:'Guzma BUS',effectName:'Guzma'},
      publicMetadata:{selectionType:'pokemon',targetZone:'bench',
        minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false},
      choices:offer.map(([printing,token,index],i)=>({
        kind:'pokemon',token,printing,publicMetadata:{selectionType:'pokemon',
          targetZone:'bench',ownerSeat,isOwnerVisible:true,
          benchIndex:index,selectionIndex:i,selectedCount:1}}))
    });
    r.prompt=mkPrompt('opponent',[
      ['Shadow Rider Calyrex VMAX CRE','victim-vmax',0],
      ['Tapu Lele-GX GRI','victim-gx',1]]);
    assertValid(seat,r,{kind:'select-choices',tokens:['victim-vmax']});
    r.prompt=mkPrompt('actor',[[clef,'powered-clefairy',0],
      ['Crobat V DAA','unpowered-crobat',1]]);
    assertValid(seat,r,{kind:'select-choices',tokens:['powered-clefairy']});
    // A printed unpowered Basic cannot be promoted as a paid attacker.
    r.prompt=null;
    r.observation.ownPublic.bench[0].energies=[];
    assert.deepEqual(p(seat).decide(r),{kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'});
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' source Compressor → VS Seeker → Guzma prepares reachable 3-Prize knockout',()=>{
    const hand=['Battle Compressor PHF','VS Seeker PHF'];
    const r=request(seat,hand,[],'Battle Compressor PHF','deck',
      [['Guzma BUS','guzma-available'],['Psychic Energy MEE','not-needed']],0,3);
    r.observation.ownTurnResources={supporterPlayedTurn:0,vstarUsed:false};
    r.observation.ownPublic.active={printing:'Unown AOR',hp:60,damage:0};
    r.observation.ownPublic.bench=[{printing:clef,
      energies:['Psychic Energy MEE','Telepath [P] Energy M3']}];
    r.observation.opponentPublic.bench=[{
      printing:'Shadow Rider Calyrex VMAX CRE',hp:320,damage:260}];
    r.prompt=null;r.actionFrontier.items=[{kind:'play-card',
      actorPrinting:'Battle Compressor PHF',token:'compressor'}];
    assert.deepEqual(p(seat).decide(r),{kind:'select-action',token:'compressor'});
    r.prompt=request(seat,hand,[],'Battle Compressor PHF','deck',
      [['Guzma BUS','guzma-available'],['Psychic Energy MEE','not-needed']],0,3).prompt;
    r.prompt.source.effectName='Battle Compressor';
    assertValid(seat,r,{kind:'select-choices',tokens:['guzma-available']});
    r.prompt=null;
    r.observation.ownPublic.discard=['Guzma BUS'];
    r.observation.ownHand=['VS Seeker PHF'];
    r.actionFrontier.items=[{kind:'play-card',actorPrinting:'VS Seeker PHF',token:'seeker'}];
    assert.deepEqual(p(seat).decide(r),{kind:'select-action',token:'seeker'});
    r.prompt=request(seat,['VS Seeker PHF'],[],'VS Seeker PHF','discard',
      [['Guzma BUS','recover-guzma']],1,1).prompt;
    r.prompt.source.effectName='VS Seeker';
    assertValid(seat,r,{kind:'select-choices',tokens:['recover-guzma']});
    r.prompt=null;
    r.observation.ownHand=['Guzma BUS'];
    r.actionFrontier.items=[{kind:'play-card',actorPrinting:'Guzma BUS',token:'gust'}];
    assert.deepEqual(p(seat).decide(r),{kind:'select-action',token:'gust'});
  });
}
test('Compressor does not bury an essential Guzma without a VS Seeker or alternate Patch purpose',()=>{
  const r=request(0,['Battle Compressor PHF'],[],'Battle Compressor PHF','deck',[],0,3);
  r.observation.ownPublic.active={printing:'Unown AOR'};
  r.observation.ownPublic.bench=[{printing:clef,
    energies:['Psychic Energy MEE','Telepath [P] Energy M3']}];
  r.observation.opponentPublic.bench=[{
    printing:'Shadow Rider Calyrex VMAX CRE',hp:320,damage:260}];
  r.observation.ownTurnResources={supporterPlayedTurn:0,vstarUsed:false};
  r.prompt=null;r.actionFrontier.items=[{kind:'play-card',
    actorPrinting:'Battle Compressor PHF',token:'compressor'}];
  assert.deepEqual(p(0).decide(r),{kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'});
});


for(const seat of [0,1]){
  test('seat '+seat+' Rescue Carrier returns real distinct discarded 60HP Unowns then benches one to restore Rondo',()=>{
    const r=request(seat,['Rescue Carrier EVS'],[],'Rescue Carrier EVS','discard',
      [['Unown AOR','unown-a'],['Unown AOR','unown-b'],['Crobat V DAA','illegal-high-hp']],0,2);
    r.observation.ownPublic.active={printing:clef,hp:190,damage:0};
    r.observation.ownPublic.bench=[{printing:'Latias ex SSP'}];
    r.observation.ownPublic.discard=['Unown AOR','Unown AOR','Crobat V DAA'];
    r.actionFrontier.items=[{kind:'play-card',actorPrinting:'Rescue Carrier EVS',token:'carrier'}];
    r.prompt=null;
    assert.deepEqual(p(seat).decide(r),{kind:'select-action',token:'carrier'});
    r.prompt=request(seat,['Rescue Carrier EVS'],[],
      'Rescue Carrier EVS','discard',
      [['Unown AOR','unown-a'],['Unown AOR','unown-b']],0,2).prompt;
    r.prompt.source.effectName='Rescue Carrier';
    assertValid(seat,r,{kind:'select-choices',tokens:['unown-a','unown-b']});
    r.observation.ownPublic.discard=['Crobat V DAA'];
    r.observation.ownHand=['Unown AOR','Unown AOR'];
    r.prompt=null;
    r.actionFrontier.items=[{kind:'play-card',actorPrinting:'Unown AOR',token:'bench-unown'}];
    assert.deepEqual(p(seat).decide(r),{kind:'select-action',token:'bench-unown'});
  });
  test('seat '+seat+' Rescue Carrier fails closed on opponent-discard and optional no-target',()=>{
    const r=request(seat,[],[],'Rescue Carrier EVS','discard',
      [['Unown AOR','unown']],0,2);
    r.prompt.publicMetadata.sourceZone='opponentDiscard';
    assertValid(seat,r,{kind:'abstain',reasonCode:'UNSUPPORTED_CARD_COMBINATION_SOURCE'});
    r.prompt=request(seat,[],[],'Rescue Carrier EVS','discard',[],0,2).prompt;
    assertValid(seat,r,{kind:'select-choice',token:'none'});
  });
}
test('Rescue Carrier never sacrifices existing immediate lethal Rondo to spend Item',()=>{
  const r=request(0,['Rescue Carrier EVS'],[],'Rescue Carrier EVS','discard',[],0,2);
  r.observation.ownPublic.active={printing:clef,hp:190,damage:0};
  r.observation.ownPublic.bench=[{printing:'Latias ex SSP'}];
  r.observation.ownPublic.discard=['Unown AOR'];
  r.observation.opponentPublic.active={printing:'Shadow Rider Calyrex VMAX CRE',hp:320,damage:280};
  r.prompt=null;r.actionFrontier.items=[
    {kind:'play-card',actorPrinting:'Rescue Carrier EVS',token:'carrier'},
    {kind:'attack',actorPrinting:clef,attackName:'Full Moon Rondo',token:'rondo'}];
  assert.deepEqual(p(0).decide(r),{kind:'select-action',token:'rondo'});
});


test('printed rank3 Snorlax PGO Block is 4 Colorless retreat, Fighting x2: Minior computes 160 knockout',()=>{
  const x={opponentPublic:{active:{printing:'Snorlax PGO 55',hp:150,damage:0,tools:[]}}};
  assert.deepEqual(worker.miniorStallOpportunity(x),{hp:150,projectedDamage:160,knockout:true});
  x.opponentPublic.active.tools=['Float Stone BKT'];
  assert.deepEqual(worker.miniorStallOpportunity(x),{hp:150,projectedDamage:null,knockout:false});
  x.opponentPublic.active.tools=[];
  x.opponentPublic.active.hp=200;
  assert.equal(worker.miniorStallOpportunity(x).knockout,false);
});
for(const seat of [0,1]){
  test('seat '+seat+' real rank3 Snorlax counter: VIP -> Minior Bench -> hand Energy -> Far-Flying Meteor switch -> knockout',()=>{
    const r=request(seat,[vip],[],vip,'deck',
      [['Minior PAR','minior'],[clef,'clefairy'],['Latias ex SSP','latias']],0,2);
    r.observation.globalTurn=1;
    r.observation.ownPublic.active={printing:clef,hp:190,damage:0,energies:[]};
    r.observation.opponentPublic.active={printing:'Snorlax PGO',hp:150,damage:0,tools:[]};
    r.prompt=null;
    r.actionFrontier.items=[{kind:'play-card',actorPrinting:vip,token:'vip'}];
    assert.deepEqual(p(seat).decide(r),{kind:'select-action',token:'vip'});
    r.prompt=request(seat,[vip],[],vip,'deck',
      [['Minior PAR','minior'],[clef,'clefairy'],['Latias ex SSP','latias']],0,2).prompt;
    r.prompt.source.effectName='Battle VIP Pass';
    assertValid(seat,r,{kind:'select-choices',tokens:['minior','latias']});
    r.prompt=null;
    r.observation.ownPublic.bench=[{printing:'Minior PAR',energies:[]},
      {printing:'Latias ex SSP',energies:[]}];
    r.observation.ownHand=['Psychic Energy MEE'];
    r.actionFrontier.items=[{kind:'play-card',actorPrinting:'Psychic Energy MEE',
      targetPrinting:'Minior PAR',token:'attach-minior'},
      {kind:'play-card',actorPrinting:'Psychic Energy MEE',
      targetPrinting:clef,token:'attach-clefairy'}];
    assert.deepEqual(p(seat).decide(r),{kind:'select-action',token:'attach-minior'});
    r.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
      promptType:'ConfirmPrompt',description:'USE_FAR_FLYING_METEOR',
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:'Minior PAR',effectName:'Far-Flying Meteor'},
      publicMetadata:{selectionType:'confirm'},
      choices:[{kind:'confirm',token:'yes',label:'Yes'},
        {kind:'confirm',token:'no',label:'No'}]};
    assertValid(seat,r,{kind:'select-choice',token:'yes'});
    r.prompt=null;
    r.observation.ownPublic.active={printing:'Minior PAR',energies:['Psychic Energy MEE'],
      hp:70,damage:0};
    r.actionFrontier.items=[{kind:'attack',actorPrinting:'Minior PAR',
      attackName:'Gravitational Tackle',token:'gravity'}];
    assert.deepEqual(p(seat).decide(r),{kind:'select-action',token:'gravity'});
  });
  test('seat '+seat+' Quick Ball can search Minior versus Snorlax even if Clefairy already established',()=>{
    const r=request(seat,['Quick Ball FST','Battle VIP Pass FST'],[],
      'Quick Ball FST','deck',[[clef,'clefairy'],['Minior PAR','minior']],0,1);
    r.observation.ownPublic.active={printing:clef,hp:190,damage:0};
    r.observation.opponentPublic.active={printing:'Snorlax PGO',hp:150,damage:0,tools:[]};
    r.observation.globalTurn=4;
    r.prompt=null;
    r.actionFrontier.items=[{kind:'play-card',actorPrinting:'Quick Ball FST',token:'quick'}];
    assert.deepEqual(p(seat).decide(r),{kind:'select-action',token:'quick'});
    r.prompt=request(seat,['Quick Ball FST','Battle VIP Pass FST'],[],
      'Quick Ball FST','deck',[[clef,'clefairy'],['Minior PAR','minior']],0,1).prompt;
    r.prompt.source.effectName='Quick Ball';
    assertValid(seat,r,{kind:'select-choices',tokens:['minior']});
  });
}
test('Minior Far-Flying Meteor optional switch declines after Snorlax obtains retreat-cost modification',()=>{
  const r=request(0,[],[],'Minior PAR','deck',[],0,1);
  r.observation.ownPublic.active={printing:clef,hp:190,damage:0};
  r.observation.ownPublic.bench=[{printing:'Minior PAR',energies:['Psychic Energy MEE']}];
  r.observation.opponentPublic.active={printing:'Snorlax PGO',hp:150,damage:0,
    tools:['Float Stone BKT']};
  r.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:0,promptType:'ConfirmPrompt',
    description:'USE_FAR_FLYING_METEOR',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:'Minior PAR',effectName:'Far-Flying Meteor'},
    publicMetadata:{selectionType:'confirm'},
    choices:[{kind:'confirm',token:'yes',label:'Yes'},{kind:'confirm',token:'no',label:'No'}]};
  assertValid(0,r,{kind:'select-choice',token:'no'});
});
