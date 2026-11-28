'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,SOURCE_COUNTS,
  createPolicy,rootDecision,projectedRondo
} = require('./agent8-rank30-clefairy-opponent-policy.cjs');
const clef="Lillie's Clefairy ex JTG 56", box='Secret Box TWM 163';
const psychic='Psychic Energy MEE 13',vip='Battle VIP Pass FST 225';
const policy = seat => createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,
  config:{sourceRank:SOURCE_RANK,sourceBlobSha1:SOURCE_LIST_BLOB_SHA1}});
const root=(kind,name,token,meta={})=>({kind,actorPrinting:name,token,publicMetadata:meta});
const card=(name,token)=>({kind:'card',printing:name,token});
function request(seat=0) {
  return {role:'opponent',seat,prompt:null,
    observation:{actorSeat:seat,globalTurn:4,ownHand:[],ownTurnResources:{vstarUsed:false},
      ownPublic:{active:{printing:clef,hp:190,damage:0,energies:[psychic,psychic]},
        bench:[],discard:[],stadium:[],prizeCount:3,deckCount:23},
      opponentPublic:{active:{printing:'Shadow Rider Calyrex VMAX CRE 75',hp:320,damage:0},
        bench:[],discard:[],stadium:[],prizeCount:3,deckCount:23}},
    actionFrontier:{items:[root('pass','','pass')]}};
}
const b=(name)=>({printing:name,energies:[]});
const prompt=(zone,choices,min,max)=>({promptType:'ChooseCardsPrompt',
  source:{sourcePrinting:box,effectName:'Secret Box'},
  publicMetadata:{selectionType:'card-combination',ownerSeat:'actor',isOwnerVisible:true,
    sourceZone:zone,minimumCount:min,maximumCount:max,allowCancel:false},choices});

test('source inventory is an exact 60-card static profile with its own source commit binding',()=>{
  assert.equal(SOURCE_COUNTS.length,32);
  assert.equal(SOURCE_COUNTS.reduce((a,v)=>a+v[1],0),60);
  assert.equal(new Map(SOURCE_COUNTS).get(clef),3);
  assert.equal(new Map(SOURCE_COUNTS).get('Secret Box TWM 163'),1);
  assert.equal(new Map(SOURCE_COUNTS).get('Psychic Energy MEE 13'),5);
  assert.equal(SOURCE_LIST_BLOB_SHA1,'ae773f6201d7aa69d31914dbfee66f3fba692200');
});
for(const seat of [0,1]) {
  test('seat '+seat+': lethal 220 Rondo wins before Field Blower or Secret Box',()=>{
    const r=request(seat);
    r.observation.ownPublic.bench=[b('Unown AOR 30'),b('Unown AOR 30'),b('Unown AOR 30'),b('Dedenne-GX UNB 57'),b('Crobat V DAA 104')];
    r.observation.opponentPublic.bench=[b('Shadow Rider Calyrex V CRE 74'),b('Shadow Rider Calyrex V CRE 74'),b('Shadow Rider Calyrex VMAX CRE 75'),b('Radiant Eternatus CRZ 105'),b('Tapu Lele-GX GRI 60')];
    r.observation.opponentPublic.active.damage=110;
    r.observation.ownHand=[box,psychic,vip,vip];
    r.actionFrontier.items=[root('play-card',box,'box'),
      root('play-card','Field Blower GRI 125','blower'),
      {...root('attack',clef,'rondo'),attackName:'Full Moon Rondo'}];
    assert.deepEqual(projectedRondo(r.observation),{damage:220,remaining:210,total:10});
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'rondo'});
    r.observation.opponentPublic.bench.pop(); // 200 < 210; no terminal
    assert.notDeepEqual(policy(seat).decide(r),{kind:'select-action',token:'blower'});
  });
  test('seat '+seat+': Secret Box pays exactly three, then retrieves four distinct categories',()=>{
    const r=request(seat);
    r.observation.ownPublic.bench=[b(clef),b('Crobat V DAA 104')];
    r.observation.ownHand=[box,psychic,vip,vip,'Telepathic Psychic Energy POR 88'];
    r.actionFrontier.items=[root('play-card',box,'box'),root('pass','','pass')];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'box'});
    r.prompt=prompt('hand',[card(psychic,'e'),card(vip,'v1'),card(vip,'v2'),
      card('Telepathic Psychic Energy POR 88','protect')],3,3);
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choices',tokens:['v1','v2','e']});
    r.observation.ownHand=['Telepathic Psychic Energy POR 88'];
    r.observation.ownPublic.discard.push(psychic);
    r.prompt=prompt('deck',[card('Sky Field ROS 89','s'),
      card('Guzma BUS 115','g'),card('Forest Seal Stone SIT 156','f'),
      card('Wondrous Patch PFL 94','w')],0,4);
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choices',tokens:['w','f','g','s']});
  });
}
test('Sky Field from hand is selected only when next legal Bench would reach Rondo KO',()=>{
  const r=request();r.observation.ownPublic.bench=[b('Unown AOR 30'),b('Unown AOR 30'),b('Unown AOR 30'),b('Dedenne-GX UNB 57'),b('Crobat V DAA 104')];
  r.observation.opponentPublic.bench=[b('Shadow Rider Calyrex V CRE 74'),b('Shadow Rider Calyrex V CRE 74'),b('Radiant Eternatus CRZ 105'),b('Tapu Lele-GX GRI 60')];
  r.observation.opponentPublic.active.damage=110;
  r.observation.ownHand=[clef,'Sky Field ROS 89'];
  r.actionFrontier.items=[root('play-card','Sky Field ROS 89','sky'),
    {...root('attack',clef,'attack'),attackName:'Full Moon Rondo'}];
  assert.equal(rootDecision(r).token,'sky');
  r.observation.ownHand=["Guzma BUS 115",'Sky Field ROS 89'];
  assert.equal(rootDecision(r).token,'attack');
});
test('Marnie only when public Prize race is imminent; never claim hidden gust certainty',()=>{
  const r=request();r.observation.ownPublic.bench=[b('Crobat V DAA 104')];
  r.observation.opponentPublic.prizeCount=2;
  r.observation.ownHand=['Marnie SSH 169'];
  r.actionFrontier.items=[root('play-card','Marnie SSH 169','marnie')];
  assert.equal(policy(0).decide(r).token,'marnie');
  r.observation.opponentPublic.prizeCount=3;
  assert.equal(policy(0).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
test('Marnie does not beat visible unspent Forest Seal Stone into Star Alchemy gust',()=>{
  const r=request();
  r.observation.ownPublic.bench=[b('Crobat V DAA 104')];
  r.observation.opponentPublic.prizeCount=2;
  r.observation.ownHand=['Marnie SSH 169'];
  r.actionFrontier.items=[root('play-card','Marnie SSH 169','marnie')];
  r.observation.opponentPublic.bench=[{printing:'Shadow Rider Calyrex V CRE 74',
    tools:['Forest Seal Stone SIT 156']}];
  assert.equal(policy(0).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.opponentPublic.publicTurnRestrictions={vstarUsed:true};
  assert.equal(policy(0).decide(r).token,'marnie');
});

test('Secret Box is not initiated without three safe payments or a Psychic Bench',()=>{
  const r=request();r.observation.ownPublic.bench=[b(clef)];
  r.observation.ownHand=[box,psychic,vip,'Telepathic Psychic Energy POR 88'];
  r.actionFrontier.items=[root('play-card',box,'box')];
  assert.equal(policy(0).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.ownHand.push(vip);
  r.observation.ownPublic.bench=[];
  assert.equal(policy(0).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
test('Secret Box payment and search reject ambiguous, non-actor and unpayable prompts',()=>{
  const r=request();r.observation.ownPublic.bench=[b(clef)];
  r.observation.ownHand=[box,psychic,vip,vip];
  r.prompt=prompt('hand',[card(psychic,'p'),card(vip,'v')],3,3);
  assert.equal(policy(0).decide(r).reasonCode,'NO_LEGAL_CARD_SET');
  r.prompt=prompt('deck',[card('Guzma BUS 115','g')],2,4);
  assert.equal(policy(0).decide(r).reasonCode,'NO_LEGAL_CARD_SET');
  r.prompt.publicMetadata.ownerSeat='opponent';
  assert.equal(policy(0).decide(r).reasonCode,'UNSUPPORTED_CARD_COMBINATION_SOURCE');
  r.prompt=prompt('deck',[{kind:'empty-selection',token:'empty'}],0,4);
  assert.deepEqual(policy(0).decide(r),{kind:'select-choice',token:'empty'});
  r.prompt.choices=[];
  assert.equal(policy(0).decide(r).reasonCode,'NO_LEGAL_CARD_SET');
});
for(const seat of [0,1]) {
  test('seat '+seat+': source Quick Ball safely discards expired VIP, retrieves Clefairy, benches it',()=>{
    const r=request(seat);r.observation.ownPublic.active=b('Unown AOR 30');
    r.observation.ownPublic.bench=[b('Dedenne-GX UNB 57')];
    r.observation.ownHand=['Quick Ball FST 237',vip,
      'Telepathic Psychic Energy POR 88',psychic];
    r.actionFrontier.items=[root('play-card','Quick Ball FST 237','qb'),
      root('play-card','Marnie SSH 169','m'),root('pass','','pass')];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'qb'});
    r.prompt={...prompt('hand',[card(vip,'paid-vip'),
      card('Telepathic Psychic Energy POR 88','protected'),card(psychic,'basic')],1,1),
      source:{sourcePrinting:'Quick Ball FST 237',effectName:'Quick Ball'}};
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choices',tokens:['paid-vip']});
    r.observation.ownHand.splice(1,1);
    r.prompt={...prompt('deck',[card(clef,'clefairy'),
      card('Latias ex SSP 76','latias')],0,1),
      source:{sourcePrinting:'Quick Ball FST 237',effectName:'Quick Ball'}};
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choices',tokens:['clefairy']});
    r.prompt=null;r.observation.ownHand.push(clef);
    r.actionFrontier.items=[root('play-card',clef,'bench-clefairy')];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'bench-clefairy'});
  });
}
test('Quick Ball does not spend an unprotected first-turn VIP or discard protected Energy',()=>{
  const r=request();
  r.observation.globalTurn=2;
  r.observation.ownPublic.active=b('Unown AOR 30');
  r.observation.ownHand=['Quick Ball FST 237',vip,'Telepathic Psychic Energy POR 88'];
  r.actionFrontier.items=[root('play-card','Quick Ball FST 237','qb')];
  assert.equal(policy(0).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.globalTurn=4;
  r.observation.ownHand=['Quick Ball FST 237','Telepathic Psychic Energy POR 88','Guzma BUS 115'];
  assert.equal(policy(0).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
test('Quick Ball cannot invent a target or use wrong owner; optional no-find uses projected empty token',()=>{
  const r=request();r.observation.ownPublic.active=b('Unown AOR 30');
  r.observation.ownHand=['Quick Ball FST 237',vip];
  r.prompt={...prompt('deck',[{kind:'empty-selection',token:'empty'}],0,1),
    source:{sourcePrinting:'Quick Ball FST 237',effectName:'Quick Ball'}};
  assert.deepEqual(policy(0).decide(r),{kind:'select-choice',token:'empty'});
  r.prompt.choices=[];
  assert.equal(policy(0).decide(r).reasonCode,'NO_LEGAL_CARD_SET');
  r.prompt.publicMetadata.ownerSeat='opponent';
  assert.equal(policy(0).decide(r).reasonCode,'UNSUPPORTED_CARD_COMBINATION_SOURCE');
});

for(const seat of [0,1]) {
  test('seat '+seat+': first-turn VIP places Clefairy and Latias from offered actor deck',()=>{
    const r=request(seat);
    r.observation.globalTurn=1;
    r.observation.ownPublic.active=b('Unown AOR 30');
    r.observation.ownHand=[vip,'Telepathic Psychic Energy POR 88'];
    r.actionFrontier.items=[root('play-card',vip,'vip'),root('pass','','pass')];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'vip'});
    r.prompt={...prompt('deck',[card(clef,'clef-1'),card(clef,'clef-2'),
      card('Latias ex SSP 76','latias'),{kind:'empty-selection',token:'empty'}],0,2),
      source:{sourcePrinting:vip,effectName:'Battle VIP Pass'}};
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choices',tokens:['clef-1','latias']});
  });
}
test('VIP cannot invent a prize-hidden Basic or select from an opponent zone',()=>{
  const r=request();
  r.prompt={...prompt('deck',[{kind:'empty-selection',token:'empty'}],0,2),
    source:{sourcePrinting:vip,effectName:'Battle VIP Pass'}};
  assert.deepEqual(policy(0).decide(r),{kind:'select-choice',token:'empty'});
  r.prompt.publicMetadata.ownerSeat='opponent';
  assert.equal(policy(0).decide(r).reasonCode,'UNSUPPORTED_CARD_COMBINATION_SOURCE');
});

test('Copycat and Wondrous Patch prompt families remain explicit unsupported',()=>{
  const r=request();r.prompt={promptType:'ChooseCardsPrompt',
    source:{sourcePrinting:'Wondrous Patch PFL 94'},choices:[]};
  assert.equal(policy(0).decide(r).reasonCode,'UNSUPPORTED_PROMPT_TYPE');
  r.prompt.source.sourcePrinting='Mimikyu GRI 58';
  assert.equal(policy(0).decide(r).reasonCode,'UNSUPPORTED_PROMPT_TYPE');
});
test('cross-seat, source and role binding fail closed',()=>{
  const r=request(0);
  assert.equal(policy(1).decide(r).reasonCode,'ROLE_SEAT_BINDING_MISMATCH');
  assert.throws(()=>createPolicy({role:'candidate',seat:0,policyVersion:POLICY_VERSION,
    config:{sourceRank:SOURCE_RANK,sourceBlobSha1:SOURCE_LIST_BLOB_SHA1}}));
  assert.throws(()=>createPolicy({role:'opponent',seat:0,policyVersion:POLICY_VERSION,
    config:{sourceRank:29,sourceBlobSha1:SOURCE_LIST_BLOB_SHA1}}));
});


for(const seat of [0,1]) {
  test('seat '+seat+' pinned native basename aliases permit VIP, Quick Ball and Rondo roots',()=>{
    const r=request(seat);
    r.observation.ownPublic.active=b('Unown AOR');
    r.observation.ownHand=['Battle VIP Pass FST'];
    r.actionFrontier.items=[root('play-card','Battle VIP Pass FST','vip-native')];
    assert.equal(policy(seat).decide(r).token,'vip-native');
    r.observation.ownHand=['Quick Ball FST','Battle VIP Pass FST'];
    r.actionFrontier.items=[root('play-card','Quick Ball FST','quick-native')];
    assert.equal(policy(seat).decide(r).token,'quick-native');
    r.observation.ownPublic.active=b("Lillie's Clefairy ex JTG");
    r.observation.ownPublic.bench=[b('Unown AOR'),b('Unown AOR'),b('Unown AOR'),
      b('Dedenne-GX UNB'),b('Crobat V DAA')];
    r.observation.opponentPublic.active={printing:'Shadow Rider Calyrex VMAX CRE',
      hp:320,damage:110};
    r.observation.opponentPublic.bench=Array.from({length:5},(_,i)=>b(
      i===0?'Shadow Rider Calyrex V CRE':'Radiant Eternatus CRZ'));
    r.observation.ownPublic.prizeCount=3;
    r.actionFrontier.items=[{...root('attack',"Lillie's Clefairy ex JTG",'rondo-native'),
      attackName:'Full Moon Rondo'},root('play-card','Field Blower GRI','blower-native')];
    assert.equal(policy(seat).decide(r).token,'rondo-native');
  });
  test('seat '+seat+' native source aliases handle Secret Box payment and category search',()=>{
    const r=request(seat);
    r.observation.ownPublic.bench=[b("Lillie's Clefairy ex JTG"),b('Crobat V DAA')];
    r.observation.ownHand=['Secret Box TWM','Psychic Energy MEE',
      'Battle VIP Pass FST','Battle VIP Pass FST'];
    r.actionFrontier.items=[root('play-card','Secret Box TWM','box-native')];
    assert.equal(policy(seat).decide(r).token,'box-native');
    r.prompt={...prompt('hand',[card('Psychic Energy MEE','energy'),
      card('Battle VIP Pass FST','vip-a'),card('Battle VIP Pass FST','vip-b')],3,3),
      source:{sourcePrinting:'Secret Box TWM',effectName:'Secret Box'}};
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choices',
      tokens:['vip-a','vip-b','energy']});
    r.observation.ownPublic.discard=['Psychic Energy MEE'];
    r.observation.ownHand=[];
    r.prompt={...prompt('deck',[card('Wondrous Patch PFL','patch'),
      card('Forest Seal Stone SIT','fss'),card('Guzma BUS','guzma'),
      card('Sky Field ROS','sky')],0,4),
      source:{sourcePrinting:'Secret Box TWM',effectName:'Secret Box'}};
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choices',
      tokens:['patch','fss','guzma','sky']});
  });
}


test('native Latias ex is Psychic: payable Box and opt-in Wondrous Patch can target sole Latias Bench',()=>{
  const r=request();
  r.observation.ownPublic.active=b('Unown AOR');
  r.observation.ownPublic.bench=[b('Latias ex SSP')];
  r.observation.ownHand=['Secret Box TWM','Psychic Energy MEE',
    'Battle VIP Pass FST','Battle VIP Pass FST'];
  r.actionFrontier.items=[root('play-card','Secret Box TWM','box')];
  assert.equal(policy(0).decide(r).token,'box');
  r.observation.ownHand=['Wonder Patch MBD'];
  r.observation.ownPublic.discard=['Psychic Energy MEE'];
  r.actionFrontier.items=[root('play-card','Wonder Patch MBD','patch')];
  const optIn=createPolicy({role:'opponent',seat:0,policyVersion:POLICY_VERSION,
    config:{sourceRank:30,sourceBlobSha1:SOURCE_LIST_BLOB_SHA1,enablePatchProjection:true}});
  assert.equal(optIn.decide(r).token,'patch');
  r.prompt={promptType:'AttachEnergyPrompt',
    source:{sourcePrinting:'Wonder Patch MBD',effectName:'Wondrous Patch'},
    publicMetadata:{selectionType:'energy-attachment',ownerSeat:'actor',
      isOwnerVisible:true,sourceZone:'discard'},
    choices:[{kind:'energy',token:'to-latias',
      publicMetadata:{ownerSeat:'actor',sourceZone:'discard',benchIndex:0}}]};
  assert.deepEqual(optIn.decide(r),{kind:'select-choice',token:'to-latias'});
});


test('one-prize Unown Bench filler adds required 20 Rondo damage before a nonlethal attack',()=>{
  const r=request();
  r.observation.ownPublic.active={printing:clef,hp:190,damage:0,energies:[psychic,psychic]};
  r.observation.ownPublic.bench=[b('Unown AOR'),b('Unown AOR'),b('Dedenne-GX UNB'),b('Crobat V DAA')];
  r.observation.opponentPublic.active={printing:'Shadow Rider Calyrex VMAX CRE',hp:320,damage:130};
  r.observation.opponentPublic.bench=[b('Shadow Rider Calyrex V CRE'),b('Radiant Eternatus CRZ')];
  r.observation.ownHand=['Unown AOR'];
  r.actionFrontier.items=[{...root('attack',clef,'rondo'),attackName:'Full Moon Rondo'},
    root('play-card','Unown AOR','play-unown')];
  const ro=projectedRondo(r.observation);
  assert.deepEqual(ro,{damage:140,remaining:190,total:6});
  // Basic still improves Rondo even when +20 does not yet KO.
  assert.equal(policy(0).decide(r).token,'play-unown');
});
for(const seat of [0,1]) {
  test('seat '+seat+' full-Bench Farewell Letter cycles Unown into second Clefairy without giving up damage',()=>{
    const r=request(seat);
    r.observation.ownPublic.active=b(clef);
    r.observation.ownPublic.bench=[b('Unown AOR'),b('Unown AOR'),
      b('Dedenne-GX UNB'),b('Crobat V DAA'),b('Latias ex SSP')];
    r.observation.opponentPublic.active={printing:'Shadow Rider Calyrex VMAX CRE',
      hp:320,damage:0};
    r.observation.ownHand=[clef,psychic,psychic, 'Guzma BUS'];
    r.actionFrontier.items=[root('use-ability','Unown AOR','farewell',
      {abilityName:'Farewell Letter'}),{...root('attack',clef,'rondo'),
      attackName:'Full Moon Rondo'}];
    assert.equal(policy(seat).decide(r).token,'farewell');
    r.observation.ownPublic.bench.shift();
    r.actionFrontier.items=[root('play-card',clef,'second-clefairy')];
    assert.equal(policy(seat).decide(r).token,'second-clefairy');
    assert.equal(r.observation.ownPublic.bench.length,4);
  });
  test('seat '+seat+' Farewell does not remove Unown when active Rondo already scores a 3-Prize KO',()=>{
    const r=request(seat);
    r.observation.ownPublic.active=b(clef);
    r.observation.ownPublic.bench=[b('Unown AOR'),b('Unown AOR'),
      b('Dedenne-GX UNB'),b('Crobat V DAA'),b('Latias ex SSP')];
    r.observation.opponentPublic.bench=[b('Shadow Rider Calyrex V CRE'),
      b('Radiant Eternatus CRZ'),b('Gengar & Mimikyu-GX TEU'),b('Tapu Lele-GX GRI'),
      b('Dedenne-GX UNB')];
    r.observation.opponentPublic.active={printing:'Shadow Rider Calyrex VMAX CRE',
      hp:320,damage:110};
    r.observation.ownHand=[clef,psychic,'Guzma BUS'];
    r.actionFrontier.items=[root('use-ability','Unown AOR','farewell',
      {abilityName:'Farewell Letter'}),{...root('attack',clef,'rondo'),
      attackName:'Full Moon Rondo'}];
    assert.equal(policy(seat).decide(r).token,'rondo');
    r.observation.ownPublic.prizeCount=5;
    // A nonterminal 3-Prize KO is still protected from Farewell damage loss.
    assert.equal(policy(seat).decide(r).token,'rondo');
  });
}
test('Sky Field setup for lethal attack recognizes Unown, not just Clefairy, as replacement Basic',()=>{
  const r=request();
  r.observation.ownPublic.active=b(clef);
  r.observation.ownPublic.bench=[b('Unown AOR'),b('Unown AOR'),
    b('Dedenne-GX UNB'),b('Crobat V DAA'),b('Latias ex SSP')];
  r.observation.opponentPublic.bench=[b('Shadow Rider Calyrex V CRE'),
    b('Radiant Eternatus CRZ'),b('Tapu Lele-GX GRI')];
  r.observation.opponentPublic.active={printing:'Shadow Rider Calyrex VMAX CRE',
    hp:320,damage:145};
  r.observation.ownHand=['Unown AOR','Sky Field ROS'];
  r.actionFrontier.items=[root('play-card','Sky Field ROS','sky'),
    {...root('attack',clef,'rondo'),attackName:'Full Moon Rondo'}];
  assert.equal(projectedRondo(r.observation).damage,180);
  // 180 is already lethal to remaining 175, so do not waste Sky Field.
  assert.equal(policy(0).decide(r).token,'rondo');
  r.observation.opponentPublic.active.damage=135; // remaining 185
  assert.equal(policy(0).decide(r).token,'sky');
});


for(const seat of [0,1]) {
  test('seat '+seat+' public live Fairy Zone enables 280 Regidrago VSTAR terminal Rondo at six Bench occupants',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:clef,hp:190,damage:0,
      abilities:['Fairy Zone'],abilitySuppressions:[{abilityName:'Fairy Zone',suppressed:false,reasonCode:null,sourcePrinting:null}],energies:[psychic,psychic]};
    r.observation.ownPublic.bench=[b('Unown AOR'),b('Unown AOR'),b('Unown AOR'),
      b('Latias ex SSP'),b('Dedenne-GX UNB')];
    r.observation.opponentPublic.active={printing:'Regidrago VSTAR SIT',hp:280,
      damage:0,printed:{types:['DRAGON'],weakness:[]}};
    r.observation.opponentPublic.bench=[b('Regidrago V SIT')];
    r.observation.ownPublic.prizeCount=2;
    r.observation.ownPublic.deckCount=25;
    r.actionFrontier.items=[root('play-card',"Trainers' Mail ROS",'mail'),
      {...root('attack',clef,'rondo'),attackName:'Full Moon Rondo'}];
    assert.deepEqual(projectedRondo(r.observation),{damage:280,remaining:280,total:6});
    assert.equal(policy(seat).decide(r).token,'rondo');
    r.observation.ownPublic.active.abilitySuppressions=[{abilityName:'Fairy Zone',suppressed:true,reasonCode:'ABILITY_LOCKED',sourcePrinting:'Garbodor DRX'}];
    assert.deepEqual(projectedRondo(r.observation),{damage:140,remaining:280,total:6});
    assert.equal(policy(seat).decide(r).token,'mail');
    r.observation.ownPublic.active.abilitySuppressions=[{abilityName:'Fairy Zone',suppressed:false,reasonCode:null,sourcePrinting:null}];
    r.observation.opponentPublic.stadium=['Path to the Peak CRE'];
    assert.deepEqual(projectedRondo(r.observation),{damage:140,remaining:280,total:6});
    assert.equal(policy(seat).decide(r).token,'mail');
  });
  test('seat '+seat+' live Fairy Zone boosts 3-Prize Dragon gust threshold but not when locked',()=>{
    const r=request(seat);
    r.observation.ownPublic.active=b('Unown AOR');
    r.observation.ownPublic.bench=[{printing:clef,abilities:['Fairy Zone'],
      abilitySuppressions:[{abilityName:'Fairy Zone',suppressed:false,reasonCode:null,sourcePrinting:null}],energies:[psychic,psychic]},
      b('Latias ex SSP'),b('Unown AOR')];
    r.observation.opponentPublic.active={printing:'Snorlax PGO',hp:150,damage:0,tools:[]};
    r.observation.opponentPublic.bench=[{
      printing:'Regidrago VSTAR SIT',hp:280,damage:100,
      printed:{types:['DRAGON'],weakness:[]}}];
    r.observation.ownHand=['Guzma BUS'];
    r.actionFrontier.items=[root('play-card','Guzma BUS','gust')];
    // 20*(1+3+1)*2 = 200; victim has 180 HP left.
    assert.equal(policy(seat).decide(r).token,'gust');
    r.observation.ownPublic.bench[0].abilitySuppressions=[{abilityName:'Fairy Zone',suppressed:true,reasonCode:'ABILITY_LOCKED',sourcePrinting:'Garbodor DRX'}];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' gust prioritizes printed Psychic-weak 3-Prize VMAX over 2-Prize knockout',()=>{
    const r=request(seat);
    // Guzma requires promoting the Bench Clefairy, so the current Active
    // being Unown must not suppress the future Psychic Weakness multiplier.
    r.observation.ownPublic.active=b('Unown AOR 30');
    r.observation.ownPublic.bench=[
      {printing:clef,energies:[psychic,psychic]},
      b('Unown AOR 30'),b('Latias ex SSP 76')];
    r.observation.opponentPublic.active={printing:'Snorlax PGO 55',hp:150,damage:0};
    r.observation.opponentPublic.bench=[
      {printing:'Machamp VMAX ASR 73',hp:330,damage:110,
       printed:{types:['FIGHTING'],weakness:[{type:'PSYCHIC',value:'×2'}]}},
      {printing:'Crobat V DAA 104',hp:180,damage:80,
       printed:{types:['DARKNESS'],weakness:[]}}];
    r.observation.ownHand=['Guzma BUS 115'];
    r.actionFrontier.items=[root('play-card','Guzma BUS 115','gust')];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'gust'});
    r.prompt={
      promptType:'ChoosePokemonPrompt',
      source:{sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
      publicMetadata:{selectionType:'pokemon',targetZone:'bench',
        minimumCount:1,maximumCount:1},
      choices:[
        {kind:'pokemon',token:'three-prize',publicMetadata:{
          ownerSeat:'opponent',targetZone:'bench',benchIndex:0}},
        {kind:'pokemon',token:'two-prize',publicMetadata:{
          ownerSeat:'opponent',targetZone:'bench',benchIndex:1}}
      ]
    };
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choices',tokens:['three-prize']});
    // Without the physically printed Psychic Weakness, 120 damage still
    // KOs the two-Prizer but not the 220-HP-remaining VMAX.
    r.observation.opponentPublic.bench[0].printed.weakness=[];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choices',tokens:['two-prize']});
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' actor-visible live Skyliner free-retreats Unown into funded Clefairy',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:'Unown AOR 30',
      printed:{stage:'BASIC',retreatCost:['COLORLESS']},
      specialConditions:[],publicRestrictions:{}};
    r.observation.ownPublic.bench=[
      {printing:clef,energies:[psychic,psychic]},
      {printing:'Latias ex SSP 76',energies:[],abilities:['Skyliner'],
        abilitySuppressions:[{abilityName:'Skyliner',suppressed:false,
          reasonCode:null,sourcePrinting:null}]}];
    r.observation.opponentPublic.active={printing:'Snorlax PGO 55',hp:150,damage:0};
    r.actionFrontier.items=[
      {...root('retreat','Unown AOR 30','free-retreat',
        {benchIndex:0,targetSeat:'actor',targetZone:'bench'}),
        targetPrinting:clef},root('pass','','pass')];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'free-retreat'});
    // One projected Energy or an incorrect offered target must not be treated
    // as a funded Rondo promotion.
    r.observation.ownPublic.bench[0].energies=[psychic];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.ownPublic.bench[0].energies=[psychic,psychic];
    r.actionFrontier.items[0].targetPrinting='Unown AOR 30';
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  });
  test('seat '+seat+' suppressed Skyliner and printed zero are insufficient without live ability',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:'Unown AOR 30',
      printed:{stage:'BASIC',retreatCost:['COLORLESS']},
      specialConditions:[],publicRestrictions:{}};
    r.observation.ownPublic.bench=[
      {printing:clef,energies:[psychic,psychic]},
      {printing:'Latias ex SSP 76',abilities:['Skyliner'],
        abilitySuppressions:[{abilityName:'Skyliner',suppressed:true,
          reasonCode:'ABILITY_LOCKED',sourcePrinting:'Garbodor DRX'}]}];
    r.actionFrontier.items=[{
      ...root('retreat','Unown AOR 30','retreat',
        {benchIndex:0,targetSeat:'actor',targetZone:'bench'}),targetPrinting:clef}];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    // A printed-zero Retreat Cost could be raised by an opponent's effect.
    r.observation.ownPublic.active.printed.retreatCost=[];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.ownPublic.bench[1].abilitySuppressions=[
      {abilityName:'Skyliner',suppressed:false,reasonCode:null,sourcePrinting:null}];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'retreat'});
    r.observation.ownPublic.active.publicRestrictions.cannotRetreat=true;
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.ownPublic.active.publicRestrictions.cannotRetreat=false;
    r.observation.ownPublic.active.specialConditions=['ASLEEP'];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.ownPublic.active.specialConditions=[];
    r.observation.opponentPublic.stadium=['Silent Lab PRC 140'];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' terminal Psychic-weak VMAX gust precedes Trainers Mail',()=>{
    const r=request(seat);
    r.observation.ownPublic.active=b('Unown AOR 30');
    r.observation.ownPublic.bench=[{printing:clef,energies:[psychic,psychic]},
      b('Latias ex SSP 76')];
    r.observation.opponentPublic.active={printing:'Snorlax PGO 55',hp:150,damage:0};
    r.observation.opponentPublic.bench=[{printing:'Machamp VMAX ASR 73',
      hp:330,damage:180,printed:{types:['FIGHTING'],
        weakness:[{type:'PSYCHIC',value:'×2'}]}}];
    r.observation.ownPublic.prizeCount=3;
    r.observation.ownHand=['Guzma BUS 115', "Trainers' Mail ROS 92"];
    r.actionFrontier.items=[root('play-card',"Trainers' Mail ROS 92",'mail'),
      root('play-card','Guzma BUS 115','gust')];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'gust'});
    r.observation.ownHand=["Trainers' Mail ROS 92"];
    r.observation.ownPublic.discard=['Guzma BUS 115'];
    r.observation.ownTurnResources.supporterPlayedTurn=0;
    r.actionFrontier.items=[root('play-card',"Trainers' Mail ROS 92",'mail'),
      root('play-card','VS Seeker PHF 109','seeker')];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'seeker'});
    // The strongest revealed target stops being a KO: generic Mail is now
    // an available useful action rather than paying Guzma for a false win.
    r.observation.opponentPublic.bench[0].damage=20;
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'mail'});
  });
  test('seat '+seat+' pass only when native frontier has no alternative action',()=>{
    const r=request(seat);
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'pass'});
    r.actionFrontier.items=[root('pass','','pass'),
      {...root('attack','Mimikyu GRI 58','copycat'),attackName:'Copycat'}];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' actor-visible Energy funding prioritizes live then reserve Clefairy',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:clef,energies:[psychic]};
    r.observation.ownPublic.bench=[{printing:clef,energies:[psychic]}];
    r.observation.ownHand=[psychic,'Telepathic Psychic Energy POR 88'];
    const energyRoot=(source,token,zone,index)=>({
      ...root('play-card',source,token,{
        targetSeat:'actor',targetZone:zone,
        ...(zone==='bench'?{targetIndex:index}:{}),isOwnerVisible:true}),
      targetPrinting:clef
    });
    r.actionFrontier.items=[
      energyRoot(psychic,'basic-bench','bench',0),
      energyRoot('Telepathic Psychic Energy POR 88','telepath-bench','bench',0),
      energyRoot(psychic,'basic-active','active'),
      energyRoot('Telepathic Psychic Energy POR 88','telepath-active','active')
    ];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'telepath-active'});
    r.observation.ownPublic.active.energies.push(psychic);
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'telepath-bench'});
    r.observation.ownPublic.bench[0].energies.push(psychic);
    r.observation.ownPublic.stadium=['Sky Field ROS 89'];
    r.observation.ownPublic.bench=Array.from({length:8},(_,i)=>
      i===0?r.observation.ownPublic.bench[0]:
        {printing:'Unown AOR 30',energies:[]});
    // Both attackers funded and no Bench room: don't overattach an Energy.
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.actionFrontier.items=[{
      ...energyRoot(psychic,'cross-seat','active'),publicMetadata:{
        targetSeat:'opponent',targetZone:'active',isOwnerVisible:true}}];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  });
}
