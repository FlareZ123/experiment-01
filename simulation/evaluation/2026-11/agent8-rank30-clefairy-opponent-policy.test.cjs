'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,SOURCE_COUNTS,
  sourceCardPatternCoverage,heavyBallBasicCoverage,
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
    publicEventReceipt:{actorSeat:seat,turn:4,opponentLastTurnTurn:3,opponentLastTurnOwnerCertified:true,priorOpponentTurnKO:{turn:3,any:true,byAttack:true}},
    observation:{actorSeat:seat,globalTurn:4,decisionKind:'owner-root',ownHand:[],ownTurnResources:{vstarUsed:false,supporterPlayedTurn:0},
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
  // Without the Prize race, a safe one-card hand can still use Marnie
  // productively. A protected singleton prevents that fallback.
  assert.equal(policy(0).decide(r).token,'marnie');
  r.observation.ownHand.push(box);
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
    r.observation.globalTurn=1; // VIP is playable only on the first turn.
    r.observation.ownPublic.active=b('Unown AOR');
    r.observation.ownHand=['Battle VIP Pass FST'];
    r.actionFrontier.items=[root('play-card','Battle VIP Pass FST','vip-native')];
    assert.equal(policy(seat).decide(r).token,'vip-native');
    // On a later turn, the same VIP is truly expendable Quick Ball payment.
    r.observation.globalTurn=4;
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


for(const seat of [0,1]) {
  test('seat '+seat+' native engine starting hand chooses Clefairy then useful Bench only',()=>{
    const r=request(seat);
    r.observation.phase=1;
    r.observation.ownPublic.active=null;
    r.observation.ownPublic.bench=[];
    const nativeCard=(printing,token)=>({...card(printing,token),
      publicMetadata:{sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true}});
    const source={classification:'actor-choice',sourceKind:'engine',
      sourcePrinting:null,effectName:'CHOOSE_STARTING_POKEMONS'};
    r.prompt={promptType:'ChooseCardsPrompt',description:'CHOOSE_STARTING_POKEMONS',
      source,publicMetadata:{selectionType:'card-combination',sourceZone:'hand',
        ownerSeat:'actor',isOwnerVisible:true,minimumCount:1,maximumCount:6},
      choices:[nativeCard('Dedenne-GX UNB 57','dedenne'),
        nativeCard('Unown AOR 30','unown'),nativeCard('Latias ex SSP 76','latias'),
        nativeCard(clef,'clefairy'),nativeCard('Ultra Ball MEG 131','invalid-item')]};
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choices',
      tokens:['clefairy','latias','unown']});
    r.observation.ownPublic.active={printing:clef,energies:[]};
    r.observation.ownPublic.bench=[b('Latias ex SSP 76')];
    r.prompt.publicMetadata.minimumCount=0;
    r.prompt.choices=[nativeCard('Unown AOR 30','extra-unown'),
      nativeCard('Crobat V DAA 104','reserve-crobat'),
      {kind:'empty-selection',token:'empty'}];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choices',
      tokens:['extra-unown']});
    r.prompt.choices=[nativeCard('Crobat V DAA 104','reserve-crobat'),
      {kind:'empty-selection',token:'empty'}];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choice',token:'empty'});
    r.prompt.source.sourceKind='card-effect';
    assert.equal(policy(seat).decide(r).reasonCode,'UNSUPPORTED_PROMPT_TYPE');
  });
  test('seat '+seat+' native setup first-turn and mulligan choices are source-bound',()=>{
    const r=request(seat);
    r.observation.phase=1;
    r.prompt={promptType:'ConfirmPrompt',description:'GO_FIRST',
      source:{classification:'actor-choice',sourceKind:'engine',
        sourcePrinting:null,effectName:'GO_FIRST'},
      publicMetadata:{selectionType:'confirm'},choices:[
        {kind:'confirm',token:'no',label:'No'},
        {kind:'confirm',token:'yes',label:'Yes'}]};
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choice',token:'yes'});
    r.prompt={promptType:'SelectPrompt',description:'WANT_TO_DRAW_CARDS',
      source:{classification:'actor-choice',sourceKind:'engine',
        sourcePrinting:null,effectName:'WANT_TO_DRAW_CARDS'},
      publicMetadata:{selectionType:'option',count:4},choices:[
        {kind:'option',token:'draw0',label:'Draw 0 card(s)',publicMetadata:{choiceIndex:3}},
        {kind:'option',token:'draw3',label:'Draw 3 card(s)',publicMetadata:{choiceIndex:0}},
        {kind:'option',token:'draw1',label:'Draw 1 card(s)',publicMetadata:{choiceIndex:2}},
        {kind:'option',token:'draw2',label:'Draw 2 card(s)',publicMetadata:{choiceIndex:1}}
      ]};
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choice',token:'draw3'});
    r.observation.phase=3;
    assert.equal(policy(seat).decide(r).reasonCode,'UNSUPPORTED_PROMPT_TYPE');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' Psychic Resistance prevents false terminal Rondo despite native attack',()=>{
    const r=request(seat);
    r.observation.ownPublic.bench=Array.from({length:5},()=>b('Unown AOR 30'));
    r.observation.opponentPublic.bench=Array.from({length:5},()=>b('Mimikyu PAL 97'));
    r.observation.opponentPublic.active={printing:'Darkness VMAX DAA 100',
      hp:320,damage:110,printed:{types:['DARKNESS'],weakness:[],
        resistance:[{type:'PSYCHIC',value:'-30'}]}};
    r.observation.ownPublic.prizeCount=3;
    r.actionFrontier.items=[root('play-card',"Trainers' Mail ROS 92",'mail'),
      {...root('attack',clef,'rondo'),attackName:'Full Moon Rondo'}];
    assert.deepEqual(projectedRondo(r.observation),{damage:190,remaining:210,total:10});
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'mail'});
    r.observation.opponentPublic.active.printed.resistance=[];
    assert.deepEqual(projectedRondo(r.observation),{damage:220,remaining:210,total:10});
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'rondo'});
  });
  test('seat '+seat+' Psychic Resistance reverses Guzma target value after Weakness',()=>{
    const r=request(seat);
    r.observation.ownPublic.active=b('Unown AOR 30');
    r.observation.ownPublic.bench=[{printing:clef,energies:[psychic,psychic]},
      b('Latias ex SSP 76'),b('Unown AOR 30')];
    r.observation.opponentPublic.active={printing:'Snorlax PGO 55',hp:150,damage:0};
    r.observation.opponentPublic.bench=[
      {printing:'Psychic-weak VMAX ASR 1',hp:300,damage:110,
        printed:{weakness:[{type:'PSYCHIC',value:'×2'}],
          resistance:[{type:'PSYCHIC',value:'-30'}]}},
      {printing:'Crobat V DAA 104',hp:180,damage:90,printed:{weakness:[]}}];
    // 20*(1+3+2) =120; Psychic-weak VMAX takes 240-30=210 vs
    // 190 HP remaining, so still lethal; reduce preexisting damage to 80
    // (220 remaining) so resistance prevents the KO.
    r.observation.opponentPublic.bench[0].damage=80;
    r.observation.ownHand=['Guzma BUS 115'];
    r.actionFrontier.items=[root('play-card','Guzma BUS 115','gust')];
    r.prompt={promptType:'ChoosePokemonPrompt',
      source:{sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
      publicMetadata:{selectionType:'pokemon',targetZone:'bench',
        minimumCount:1,maximumCount:1},
      choices:[
        {kind:'pokemon',token:'three-prize',publicMetadata:{
          ownerSeat:'opponent',targetZone:'bench',benchIndex:0}},
        {kind:'pokemon',token:'two-prize',publicMetadata:{
          ownerSeat:'opponent',targetZone:'bench',benchIndex:1}}]};
    assert.deepEqual(policy(seat).decide(r),{
      kind:'select-choices',tokens:['two-prize']});
    r.observation.opponentPublic.bench[0].printed.resistance=[];
    assert.deepEqual(policy(seat).decide(r),{
      kind:'select-choices',tokens:['three-prize']});
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' Float Stone unlocks native retreat to funded Clefairy under Iron Thorns',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:'Unown AOR 30',tools:[],
      printed:{stage:'BASIC',retreatCost:['COLORLESS']},
      specialConditions:[],publicRestrictions:{}};
    r.observation.ownPublic.bench=[
      {printing:clef,energies:[psychic,psychic]},
      {printing:'Latias ex SSP 76',abilities:['Skyliner'],
        abilitySuppressions:[{abilityName:'Skyliner',suppressed:true,
          reasonCode:'ABILITY_LOCKED',sourcePrinting:'Iron Thorns ex TWM 77'}]}];
    r.observation.ownPublic.publicTurnRestrictions={
      stadiumAndToolHaveNoEffectTurnsRemaining:0};
    r.observation.opponentPublic.active={printing:'Iron Thorns ex TWM 77',
      hp:230,damage:0,tools:[]};
    const toolRoot={...root('play-card','Float Stone BKT 137','float',
      {targetSeat:'actor',targetZone:'active',isOwnerVisible:true}),
      targetPrinting:'Unown AOR 30'};
    const retreatRoot={...root('retreat','Unown AOR 30','retreat',
      {targetSeat:'actor',targetZone:'bench',benchIndex:0}),
      targetPrinting:clef};
    r.actionFrontier.items=[toolRoot,root('pass','','pass')];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'float'});
    r.observation.ownPublic.active.tools=['Float Stone BKT 137'];
    r.actionFrontier.items=[retreatRoot,root('pass','','pass')];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'retreat'});
    // Active opponent Tool Jammer and Jamming Tower each void our Active
    // Float Stone, so none of the apparent zero-cost moves is certified.
    r.observation.opponentPublic.active.tools=['Tool Jammer BST 136'];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.opponentPublic.active.tools=[];
    r.observation.opponentPublic.stadium=['Jamming Tower TWM 153'];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.opponentPublic.stadium=[];
    r.observation.ownPublic.publicTurnRestrictions
      .stadiumAndToolHaveNoEffectTurnsRemaining=null;
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' active Snorlax Block vetoes wasteful Float Stone mobility setup',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:'Unown AOR 30',tools:[],
      printed:{stage:'BASIC',retreatCost:['COLORLESS']},
      specialConditions:[],publicRestrictions:{}};
    r.observation.ownPublic.bench=[{printing:clef,energies:[psychic,psychic]}];
    r.observation.ownPublic.publicTurnRestrictions={
      stadiumAndToolHaveNoEffectTurnsRemaining:0};
    r.observation.opponentPublic.active={printing:'Snorlax PGO 55',
      hp:150,damage:0,tools:[],abilities:['Block'],
      abilitySuppressions:[{abilityName:'Block',suppressed:false,
        reasonCode:null,sourcePrinting:null}]};
    r.actionFrontier.items=[{...root('play-card','Float Stone BKT 137','float',
      {targetSeat:'actor',targetZone:'active',isOwnerVisible:true}),
      targetPrinting:'Unown AOR 30'}];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.opponentPublic.active.abilitySuppressions=[
      {abilityName:'Block',suppressed:true,
       reasonCode:'ABILITY_LOCKED',sourcePrinting:'Garbodor DRX 54'}];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'float'});
    r.observation.ownPublic.active.specialConditions=['PARALYZED'];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' Field Blower -> Minior attach -> Meteor switch -> Snorlax KO line',()=>{
    const r=request(seat);
    r.observation.ownPublic.active=b('Unown AOR 30');
    r.observation.ownPublic.bench=[{printing:'Minior PAR 99',energies:[]}];
    r.observation.opponentPublic.active={
      printing:'Snorlax PGO 55',hp:150,damage:0,tools:['Float Stone BKT 137'],
      abilities:['Block'],abilitySuppressions:[{abilityName:'Block',
        suppressed:false,reasonCode:null,sourcePrinting:null}]};
    r.observation.ownHand=['Field Blower GRI 125',psychic];
    r.observation.ownTurnResources.energyPlayedTurn=0;
    r.actionFrontier.items=[
      root('play-card',"Trainers' Mail ROS 92",'mail'),
      root('play-card','Field Blower GRI 125','blower')];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'blower'});
    r.prompt={promptType:'ChooseCardsPrompt',
      source:{sourcePrinting:'Field Blower GRI 125',effectName:'Field Blower'},
      publicMetadata:{selectionType:'card-combination',sourceZone:'tool',
        ownerSeat:'opponent',isOwnerVisible:true,
        minimumCount:0,maximumCount:2},
      choices:[{kind:'card',printing:'Float Stone BKT 137',token:'opp-tool'},
        {kind:'empty-selection',token:'empty'}]};
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choices',tokens:['opp-tool']});
    // A detached sequential state envelope from after the chosen item;
    // native physical resolution remains an independent admission gate.
    r.prompt=null;r.observation.opponentPublic.active.tools=[];
    r.observation.ownHand=[psychic];
    r.actionFrontier.items=[{
      ...root('play-card',psychic,'attach-minior',
        {targetSeat:'actor',targetZone:'bench',targetIndex:0,isOwnerVisible:true}),
      targetPrinting:'Minior PAR 99'}];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'attach-minior'});
    r.observation.ownPublic.bench[0].energies=[psychic];
    r.prompt={promptType:'ConfirmPrompt',
      source:{sourcePrinting:'Minior PAR 99',effectName:'Far-Flying Meteor'},
      publicMetadata:{selectionType:'confirm'},
      choices:[{kind:'confirm',token:'yes',label:'Yes'},
        {kind:'confirm',token:'no',label:'No'}]};
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choice',token:'yes'});
    r.prompt=null;
    r.observation.ownPublic.active={printing:'Minior PAR 99',energies:[psychic]};
    r.observation.ownPublic.bench=[];
    r.actionFrontier.items=[
      {...root('attack','Minior PAR 99','tackle'),attackName:'Gravitational Tackle'}];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'tackle'});
    // With two indistinguishable Float Stones in visible play, the prompt
    // cannot identify the opponent's copy and must refuse the action.
    r.observation.ownPublic.active={printing:'Unown AOR 30',
      tools:['Float Stone BKT 137']};
    r.observation.ownPublic.bench=[{printing:'Minior PAR 99',energies:[]}];
    r.observation.opponentPublic.active.tools=['Float Stone BKT 137'];
    r.observation.ownHand=['Field Blower GRI 125',psychic];
    r.prompt=null;r.actionFrontier.items=[
      root('play-card','Field Blower GRI 125','blower')];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' Sky Field funds a three-Basic terminal Rondo against Iron Thorns',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:clef,
      abilities:['Fairy Zone'],abilitySuppressions:[{
        abilityName:'Fairy Zone',suppressed:true,reasonCode:'ABILITY_LOCKED',
        sourcePrinting:'Iron Thorns ex TWM 77'}],
      energies:[psychic,psychic]};
    r.observation.ownPublic.bench=[
      b('Latias ex SSP 76'),b('Unown AOR 30'),b('Dedenne-GX UNB 57'),
      b('Crobat V DAA 104'),b('Tapu Lele-GX GRI 60')];
    r.observation.opponentPublic.active={printing:'Iron Thorns ex TWM 77',
      hp:230,damage:0};
    r.observation.opponentPublic.bench=[
      b('Iron Thorns ex TWM 77'),b('Iron Thorns ex TWM 77'),
      b('Iron Thorns ex TWM 77')];
    r.observation.ownPublic.prizeCount=2;
    r.observation.ownHand=['Sky Field ROS 89',
      'Unown AOR 30','Unown AOR 30','Minior PAR 99'];
    r.actionFrontier.items=[
      root('play-card',"Trainers' Mail ROS 92",'mail'),
      root('play-card','Sky Field ROS 89','sky')];
    assert.deepEqual(projectedRondo(r.observation),
      {damage:180,remaining:230,total:8});
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'sky'});
    // If two future Basic additions cannot bridge the threshold, do not
    // consume the Stadium just because its theoretical cap is eight.
    r.observation.ownHand.pop();
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'mail'});
    r.observation.ownHand.push('Minior PAR 99');
    r.observation.ownPublic.stadium=['Sky Field ROS 89'];
    r.observation.ownHand.shift();
    for(let i=0;i<2;i++) {
      r.actionFrontier.items=[
        root('play-card','Minior PAR 99','minior'),
        root('play-card','Unown AOR 30','unown')];
      assert.deepEqual(policy(seat).decide(r),
        {kind:'select-action',token:'unown'});
      r.observation.ownPublic.bench.push(b('Unown AOR 30'));
      r.observation.ownHand.splice(r.observation.ownHand.indexOf('Unown AOR 30'),1);
    }
    r.actionFrontier.items=[root('play-card','Minior PAR 99','minior')];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'minior'});
    r.observation.ownPublic.bench.push(b('Minior PAR 99'));
    r.observation.ownHand=[];
    r.actionFrontier.items=[
      {...root('attack',clef,'rondo'),attackName:'Full Moon Rondo'}];
    assert.deepEqual(projectedRondo(r.observation),
      {damage:240,remaining:230,total:11});
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'rondo'});
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' Tapu Lele Wonder Tag finds a supported terminal Guzma',()=>{
    const r=request(seat);
    r.observation.ownPublic.active=b('Unown AOR 30');
    r.observation.ownPublic.bench=[{printing:clef,energies:[psychic,psychic]}];
    r.observation.opponentPublic.active={printing:'Snorlax PGO 55',hp:150,damage:0};
    r.observation.opponentPublic.bench=[{printing:'Machamp VMAX ASR 73',
      hp:330,damage:220,printed:{
        weakness:[{type:'PSYCHIC',value:'×2'}],resistance:[]}}];
    r.observation.ownPublic.prizeCount=3;
    r.observation.ownTurnResources.supporterPlayedTurn=0;
    r.observation.ownHand=['Tapu Lele-GX GRI 60',psychic];
    r.actionFrontier.items=[root('play-card','Tapu Lele-GX GRI 60','play-lele')];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'play-lele'});
    r.observation.ownHand=[psychic];
    r.observation.ownPublic.bench.push({
      printing:'Tapu Lele-GX GRI 60',
      abilities:['Wonder Tag'],abilitySuppressions:[]});
    r.actionFrontier.items=[{...root('use-ability','Tapu Lele-GX GRI 60','wonder',
      {abilityName:'Wonder Tag'}),publicMetadata:{abilityName:'Wonder Tag'}}];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'wonder'});
    r.prompt={promptType:'ChooseCardsPrompt',
      source:{sourcePrinting:'Tapu Lele-GX GRI 60',effectName:'Wonder Tag'},
      publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
        ownerSeat:'actor',isOwnerVisible:true,minimumCount:0,maximumCount:1},
      choices:[card('Marnie SSH 169','marnie'),
        card('Guzma BUS 115','gust'),card('Raihan EVS 152','raihan')]};
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choices',tokens:['gust']});
    r.observation.opponentPublic.bench=[];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choices',tokens:['marnie']});
    r.prompt.choices=[card('Raihan EVS 152','raihan'),
      {kind:'empty-selection',token:'empty'}];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choice',token:'empty'});
    r.prompt=null;r.observation.opponentPublic.active={
      printing:'Iron Thorns ex TWM 77',hp:230,damage:0,
      abilities:['Initialization'],abilitySuppressions:[{
        abilityName:'Initialization',suppressed:false,
        reasonCode:null,sourcePrinting:null}]};
    r.observation.ownPublic.bench=[{printing:clef,energies:[psychic,psychic]}];
    r.observation.ownHand=['Tapu Lele-GX GRI 60',psychic];
    r.actionFrontier.items=[root('play-card','Tapu Lele-GX GRI 60','play-lele')];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' Crobat Dark Asset uses low-hand native support over generic Mail',()=>{
    const r=request(seat);
    r.observation.ownPublic.active=b('Unown AOR 30');
    r.observation.ownHand=['Crobat V DAA 104',psychic];
    r.actionFrontier.items=[
      root('play-card',"Trainers' Mail ROS 92",'mail'),
      {...root('play-card','Crobat V DAA 104','crobat',
        {targetSeat:'actor',targetZone:'bench',isOwnerVisible:true}),
       targetPrinting:'Crobat V DAA 104'}];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'crobat'});
    r.observation.ownHand=[psychic];
    r.prompt={promptType:'ConfirmPrompt',
      source:{sourcePrinting:'Crobat V DAA 104',effectName:'Dark Asset'},
      publicMetadata:{selectionType:'confirm'},
      choices:[{kind:'confirm',token:'yes',label:'Yes'},
        {kind:'confirm',token:'no',label:'No'}]};
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choice',token:'yes'});
    r.observation.ownHand=[psychic,vip,box,clef];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choice',token:'no'});
    r.prompt.source.effectName='Dedechange';
    assert.equal(policy(seat).decide(r).reasonCode,'UNRECOGNIZED_SIMPLE_PROMPT');
  });
  test('seat '+seat+' Fezandipiti requires a KO stamped to the immediately preceding opponent turn',()=>{
    const r=request(seat);
    r.observation.ownPublic.active=b('Unown AOR 30');
    r.observation.ownHand=[psychic];
    r.publicEventReceipt={opponentLastTurnTurn:3,opponentLastTurnOwnerCertified:true,priorOpponentTurnKO:{turn:3,any:true,byAttack:true}};
    r.actionFrontier.items=[
      root('play-card',"Trainers' Mail ROS 92",'mail'),
      {...root('play-card','Fezandipiti ex ASC 142','fez',
        {targetSeat:'actor',targetZone:'bench',isOwnerVisible:true}),
        targetPrinting:'Fezandipiti ex ASC 142'}];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'fez'});
    r.observation.ownPublic.bench=[{printing:'Fezandipiti ex ASC 142'}];
    r.actionFrontier.items=[root('play-card',"Trainers' Mail ROS 92",'mail'),
      root('use-ability','Fezandipiti ex ASC 142','flip',
        {abilityName:'Flip the Script'})];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'flip'});
    // KO on turn 2 is stale at turn 4 after an opponent extra turn on turn 3.
    r.publicEventReceipt.priorOpponentTurnKO.turn=2;
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'mail'});
    // An unstamped legacy Boolean is unknown, never proof of a fresh KO.
    r.publicEventReceipt.priorOpponentTurnKO={any:true,byAttack:true};
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'mail'});
    r.publicEventReceipt.priorOpponentTurnKO={turn:3,any:null,byAttack:null};
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'mail'});
  });
  test('seat '+seat+' Dedenne only discards safe thin hand and Squawk requires opening turn',()=>{
    const r=request(seat);
    r.observation.ownPublic.active=b('Unown AOR 30');
    r.observation.ownHand=['Dedenne-GX UNB 57',vip];
    r.observation.globalTurn=4;
    r.actionFrontier.items=[
      {...root('play-card','Dedenne-GX UNB 57','dedenne',
        {targetSeat:'actor',targetZone:'bench',isOwnerVisible:true}),
        targetPrinting:'Dedenne-GX UNB 57'}];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'dedenne'});
    r.prompt={promptType:'ConfirmPrompt',
      source:{sourcePrinting:'Dedenne-GX UNB 57',effectName:'Dedechange'},
      publicMetadata:{selectionType:'confirm'},
      choices:[{kind:'confirm',token:'yes',label:'Yes'},
        {kind:'confirm',token:'no',label:'No'}]};
    r.observation.ownHand=[vip];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choice',token:'yes'});
    r.observation.ownHand=[clef];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choice',token:'no'});
    r.prompt=null;
    r.observation.ownHand=['Dedenne-GX UNB 57',clef];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.globalTurn=1;
    r.observation.ownHand=[vip];
    r.actionFrontier.items=[
      root('use-ability','Squawkabilly ex PAL 169','squawk',
        {abilityName:'Squawk and Seize'})];
    // First-turn VIP is protected until it has been played; consuming it
    // through Squawk's hand reset would destroy a useful opening line.
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.ownHand=[];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'squawk'});
    r.observation.globalTurn=4;
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' Quick Ball searches the last Sky Field Rondo KO body without duplicate Clefairy',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:clef,energies:[psychic,psychic]};
    r.observation.ownPublic.stadium=['Sky Field ROS 89'];
    r.observation.ownPublic.bench=[
      b('Latias ex SSP 76'),b('Dedenne-GX UNB 57'),
      b('Crobat V DAA 104'),b('Unown AOR 30'),
      b('Unown AOR 30'),b('Squawkabilly ex PAL 169')];
    r.observation.opponentPublic.active={printing:'Iron Thorns ex TWM 77',
      hp:230,damage:0};
    r.observation.opponentPublic.bench=[
      b('Iron Thorns ex TWM 77'),b('Iron Thorns ex TWM 77'),
      b('Iron Thorns ex TWM 77'),b('Iron Thorns ex TWM 77')];
    r.observation.globalTurn=4;
    r.observation.ownHand=['Quick Ball FST 237',vip];
    r.actionFrontier.items=[
      root('play-card','Quick Ball FST 237','quick'),
      root('pass','','pass')];
    assert.deepEqual(projectedRondo(r.observation),
      {damage:220,remaining:230,total:10});
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'quick'});
    r.prompt={...prompt('hand',[card(vip,'expired-vip')],1,1),
      source:{sourcePrinting:'Quick Ball FST 237',effectName:'Quick Ball'}};
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choices',tokens:['expired-vip']});
    r.observation.ownHand=['Quick Ball FST 237'];
    r.prompt={...prompt('deck',[card(clef,'clefairy'),
      card('Latias ex SSP 76','latias'),
      card('Unown AOR 30','last-unown')],0,1),
      source:{sourcePrinting:'Quick Ball FST 237',effectName:'Quick Ball'}};
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choices',tokens:['last-unown']});
    r.prompt=null;r.observation.ownHand=['Unown AOR 30'];
    r.actionFrontier.items=[root('play-card','Unown AOR 30','bench')];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'bench'});
    r.observation.ownPublic.bench.push(b('Unown AOR 30'));
    r.observation.ownHand=[];
    r.actionFrontier.items=[
      {...root('attack',clef,'rondo'),attackName:'Full Moon Rondo'}];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'rondo'});
    // Search connector is dominated if a directly playable Basic exists.
    r.observation.ownPublic.bench.pop();
    r.observation.ownHand=['Quick Ball FST 237',vip,'Unown AOR 30'];
    r.actionFrontier.items=[root('play-card','Quick Ball FST 237','quick')];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' pinned native spaced GX printing reaches Dedechange and Wonder Tag',()=>{
    const r=request(seat);
    r.observation.ownPublic.active=b('Unown AOR 30');
    r.observation.globalTurn=4;
    r.observation.ownHand=['Dedenne GX UNB',vip];
    r.actionFrontier.items=[{...root('play-card','Dedenne GX UNB','native-dedenne',
      {targetSeat:'actor',targetZone:'bench',isOwnerVisible:true}),
      targetPrinting:'Dedenne GX UNB'}];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'native-dedenne'});
    r.observation.ownHand=[vip];
    r.prompt={promptType:'ConfirmPrompt',source:{
      classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:'Dedenne GX UNB',effectName:'Dedechange'},
      publicMetadata:{selectionType:'confirm'},
      choices:[{kind:'confirm',token:'yes',label:'Yes'},
        {kind:'confirm',token:'no',label:'No'}]};
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choice',token:'yes'});
    r.prompt=null;
    r.observation.ownHand=['Tapu Lele GX GRI',vip];
    r.observation.ownTurnResources.supporterPlayedTurn=0;
    r.actionFrontier.items=[{...root('play-card','Tapu Lele GX GRI','native-lele',
      {targetSeat:'actor',targetZone:'bench',isOwnerVisible:true}),
      targetPrinting:'Tapu Lele GX GRI'}];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'native-lele'});
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' low-hand Marnie refresh never outraces manual Clefairy funding',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:clef,energies:[psychic]};
    r.observation.ownPublic.bench=[b('Latias ex SSP 76')];
    r.observation.ownTurnResources.supporterPlayedTurn=0;
    r.observation.globalTurn=4;
    r.observation.ownHand=['Marnie SSH 169',psychic];
    r.actionFrontier.items=[
      root('play-card','Marnie SSH 169','marnie'),
      {...root('play-card',psychic,'attach',
        {targetSeat:'actor',targetZone:'active',isOwnerVisible:true}),
        targetPrinting:clef}];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'attach'});
    r.observation.ownPublic.active.energies.push(psychic);
    r.observation.ownHand=['Marnie SSH 169'];
    r.actionFrontier.items=[root('play-card','Marnie SSH 169','marnie')];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'marnie'});
    r.observation.ownHand.push(clef);
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.ownHand=['Marnie SSH 169',vip];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'marnie'});
    r.observation.globalTurn=1;
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' Pokemon-play lock prevents Sky Field and Quick Ball phantom KO',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:clef,energies:[psychic,psychic]};
    r.observation.opponentPublic.active={printing:'Iron Thorns ex TWM 77',
      hp:230,damage:0};
    r.observation.ownPublic.bench=[
      b('Unown AOR 30'),b('Unown AOR 30'),b('Latias ex SSP 76'),
      b('Crobat V DAA 104'),b('Squawkabilly ex PAL 169')];
    r.observation.opponentPublic.bench=[
      b('Iron Thorns ex TWM 77'),b('Iron Thorns ex TWM 77'),
      b('Iron Thorns ex TWM 77')];
    r.observation.ownHand=['Sky Field ROS 89','Unown AOR 30',
      'Minior PAR 99','Unown AOR 30'];
    r.actionFrontier.items=[root('play-card','Sky Field ROS 89','sky')];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'sky'});
    r.observation.ownTurnResources.pokemonPlayLocked=true;
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.ownPublic.stadium=['Sky Field ROS 89'];
    r.observation.ownPublic.bench.push(b('Dedenne-GX UNB 57'));
    r.observation.opponentPublic.bench.push(b('Iron Thorns ex TWM 77'));
    r.observation.ownHand=['Quick Ball FST 237',vip];
    r.observation.globalTurn=4;
    r.actionFrontier.items=[root('play-card','Quick Ball FST 237','qb')];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.ownTurnResources.pokemonPlayLocked=false;
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'qb'});
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' Rescue Stretcher retrieves last discarded Clefairy through native labeled mode',()=>{
    const r=request(seat);
    r.observation.ownPublic.active=b('Unown AOR 30');
    r.observation.ownPublic.bench=[b('Latias ex SSP 76')];
    r.observation.ownPublic.discard=[clef,'Minior PAR 99'];
    r.observation.ownHand=['Rescue Stretcher GRI 130'];
    r.actionFrontier.items=[root('play-card','Rescue Stretcher GRI 130','stretcher'),
      root('play-card',"Trainers' Mail ROS 92",'mail')];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'stretcher'});
    r.prompt={promptType:'SelectPrompt',
      source:{sourcePrinting:'Rescue Stretcher GRI 130',effectName:'Rescue Stretcher'},
      publicMetadata:{selectionType:'option',count:2},
      choices:[
        {kind:'option',token:'mode-shuffle',label:'Shuffle 3 Pokémon into your deck',
         publicMetadata:{choiceIndex:1}},
        {kind:'option',token:'mode-hand',
         label:'Put 1 Pokémon from your discard pile into your hand',
         publicMetadata:{choiceIndex:0}}]};
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choice',token:'mode-hand'});
    r.prompt={...prompt('discard',[card('Minior PAR 99','minior'),
      card(clef,'lost-clefairy')],1,1),
      source:{sourcePrinting:'Rescue Stretcher GRI 130',
        effectName:'Rescue Stretcher'}};
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choices',tokens:['lost-clefairy']});
    r.observation.ownHand=[clef];
    r.observation.ownPublic.discard=['Minior PAR 99'];
    r.prompt=null;
    r.actionFrontier.items=[root('play-card',clef,'bench')];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'bench'});
    // If no valued attacker is missing, do not waste a singleton recycler.
    r.observation.ownPublic.bench=[b('Latias ex SSP 76'),b(clef),b(clef)];
    r.observation.ownPublic.discard=[clef];
    r.observation.ownHand=['Rescue Stretcher GRI 130'];
    r.actionFrontier.items=[root('play-card','Rescue Stretcher GRI 130','stretcher')];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' Empoleon live Emperor Eyes releases own Basic from opposing Snorlax Block',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:'Empoleon V BST 40',
      abilities:["Emperor's Eyes"],abilitySuppressions:[{
        abilityName:"Emperor's Eyes",suppressed:false,
        reasonCode:null,sourcePrinting:null}],
      printed:{stage:'BASIC',retreatCost:['COLORLESS','COLORLESS']},
      energies:[],specialConditions:[],publicRestrictions:{}};
    r.observation.ownPublic.bench=[
      {printing:clef,energies:[psychic,psychic]},
      {printing:'Latias ex SSP 76',abilities:['Skyliner'],abilitySuppressions:[{
        abilityName:'Skyliner',suppressed:false,
        reasonCode:null,sourcePrinting:null}]}];
    r.observation.opponentPublic.active={
      printing:'Snorlax PGO 55',hp:150,damage:0,tools:[],
      abilities:['Block'],abilitySuppressions:[{
        abilityName:'Block',suppressed:null,reasonCode:null,
        sourcePrinting:null}]};
    r.actionFrontier.items=[{...root('retreat','Empoleon V BST 40','emperor-retreat',
      {targetSeat:'actor',targetZone:'bench',benchIndex:0}),targetPrinting:clef}];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'emperor-retreat'});
    r.observation.ownPublic.active.abilitySuppressions[0].suppressed=true;
    r.observation.ownPublic.active.abilitySuppressions[0].reasonCode='ABILITY_LOCKED';
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.ownPublic.active.abilitySuppressions[0].suppressed=false;
    r.observation.ownPublic.active.abilitySuppressions[0].reasonCode=null;
    r.observation.opponentPublic.stadium=['Path to the Peak CRE 148'];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' known K1 deck without Basic prevents wasted Quick Ball',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:clef,energies:[psychic,psychic]};
    r.observation.ownPublic.stadium=['Sky Field ROS 89'];
    r.observation.ownPublic.bench=[
      b('Unown AOR 30'),b('Unown AOR 30'),b('Latias ex SSP 76'),
      b('Crobat V DAA 104'),b('Squawkabilly ex PAL 169'),
      b('Dedenne-GX UNB 57')];
    r.observation.opponentPublic.active={
      printing:'Iron Thorns ex TWM 77',hp:230,damage:0};
    r.observation.opponentPublic.bench=[
      b('Iron Thorns ex TWM 77'),b('Iron Thorns ex TWM 77'),
      b('Iron Thorns ex TWM 77'),b('Iron Thorns ex TWM 77')];
    r.observation.ownHand=['Quick Ball FST 237',vip];
    r.observation.globalTurn=4;
    r.actionFrontier.items=[root('play-card','Quick Ball FST 237','quick')];
    r.observation.ownerK1={exactMembershipKnown:true,
      knownPrintings:[{printing:'Psychic Energy MEE 13',copies:4},
        {printing:'Wondrous Patch PFL 94',copies:2}]};
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.ownerK1.knownPrintings.push({
      printing:'Unown AOR 30',copies:1});
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'quick'});
    r.observation.ownerK1=null;
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'quick'});
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' low-hand VS Seeker retrieves Marnie after no terminal Guzma',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:clef,energies:[psychic,psychic]};
    r.observation.opponentPublic.active={printing:'Iron Thorns ex TWM 77',
      hp:230,damage:0};
    r.observation.ownPublic.discard=['Marnie SSH 169','Guzma BUS 115'];
    r.observation.ownHand=['VS Seeker PHF 109'];
    r.observation.ownTurnResources.supporterPlayedTurn=0;
    r.actionFrontier.items=[root('play-card','VS Seeker PHF 109','seeker')];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'seeker'});
    r.prompt={...prompt('discard',[card('Guzma BUS 115','gust'),
      card('Marnie SSH 169','draw')],0,1),
      source:{sourcePrinting:'VS Seeker PHF 109',effectName:'VS Seeker'}};
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choices',tokens:['draw']});
    r.prompt=null;r.observation.ownHand=['Marnie SSH 169'];
    r.actionFrontier.items=[root('play-card','Marnie SSH 169','marnie')];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'marnie'});
    // A protected singleton ACE SPEC must not be reshuffled for generic draw.
    r.observation.ownHand=['VS Seeker PHF 109',box];
    r.actionFrontier.items=[root('play-card','VS Seeker PHF 109','seeker')];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.ownHand=['VS Seeker PHF 109'];
    // Native actor observation exposes a per-turn Supporter use count.
    // At turn 4, count=1 still means the Supporter is unavailable.
    r.observation.ownTurnResources.supporterPlayedTurn=1;
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' Field Blower disarms Garbotoxin to restore Dragon Rondo knockout',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:clef,
      abilities:['Fairy Zone'],abilitySuppressions:[{
        abilityName:'Fairy Zone',suppressed:true,
        reasonCode:'ABILITY_LOCKED',sourcePrinting:'Garbodor BKP 57'}],
      energies:[psychic,psychic]};
    r.observation.ownPublic.bench=[
      b('Latias ex SSP 76'),b('Unown AOR 30'),
      b('Crobat V DAA 104'),b('Minior PAR 99')];
    r.observation.opponentPublic.active={
      printing:'Regidrago VSTAR SIT 136',hp:280,damage:0,
      printed:{types:['DRAGON'],weakness:[]}};
    r.observation.opponentPublic.bench=[
      {printing:'Garbodor BKP 57',tools:['Float Stone BKT 137'],
       abilities:['Garbotoxin']},
      b('Regidrago V SIT 135'),b('Regidrago V SIT 135'),
      b('Regidrago V SIT 135')];
    r.observation.ownHand=['Field Blower GRI 125'];
    r.actionFrontier.items=[
      root('play-card',"Trainers' Mail ROS 92",'mail'),
      root('play-card','Field Blower GRI 125','blower'),
      {...root('attack',clef,'rondo'),attackName:'Full Moon Rondo'}];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'blower'});
    r.prompt={...prompt('tool',[card('Float Stone BKT 137','garb-tool')],0,2),
      source:{sourcePrinting:'Field Blower GRI 125',effectName:'Field Blower'}};
    r.prompt.publicMetadata.ownerSeat='opponent';
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choices',tokens:['garb-tool']});
    r.observation.opponentPublic.bench[0].tools=[];
    r.observation.ownPublic.active.abilitySuppressions[0]={
      abilityName:'Fairy Zone',suppressed:false,
      reasonCode:null,sourcePrinting:null};
    r.prompt=null;
    r.actionFrontier.items=[{
      ...root('attack',clef,'rondo'),attackName:'Full Moon Rondo'}];
    assert.deepEqual(projectedRondo(r.observation),
      {damage:360,remaining:280,total:8});
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'rondo'});
    r.observation.opponentPublic.bench[0].tools=['Float Stone BKT 137'];
    r.observation.ownPublic.active.abilitySuppressions[0].suppressed=true;
    r.observation.ownPublic.active.abilitySuppressions[0].reasonCode='ABILITY_LOCKED';
    r.observation.ownPublic.active.abilitySuppressions[0].sourcePrinting='Garbodor BKP 57';
    r.observation.ownPublic.bench[0].tools=['Float Stone BKT 137'];
    r.actionFrontier.items=[root('play-card','Field Blower GRI 125','blower')];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  });
  test('seat '+seat+' Field Blower clears Path and distinct Garbotoxin Tool together',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:clef,energies:[psychic,psychic],
      abilities:['Fairy Zone'],abilitySuppressions:[{
        abilityName:'Fairy Zone',suppressed:true,
        reasonCode:'ABILITY_LOCKED',sourcePrinting:'Garbodor LTR 68'}]};
    r.observation.opponentPublic.active={
      printing:'Regidrago VSTAR SIT 136',hp:280,damage:0,
      printed:{types:['DRAGON'],weakness:[]}};
    r.observation.opponentPublic.bench=[
      {printing:'Garbodor LTR 68',tools:['Muscle Band XY 121'],
       abilities:['Garbotoxin']},b('Regidrago V SIT 135')];
    r.observation.opponentPublic.stadium=['Path to the Peak CRE 148'];
    r.actionFrontier.items=[root('play-card','Field Blower GRI 125','blower')];
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'blower'});
    r.prompt={...prompt('mixed',[card('Muscle Band XY 121','garb-tool'),
      card('Path to the Peak CRE 148','path')],0,2),
      source:{sourcePrinting:'Field Blower GRI 125',effectName:'Field Blower'}};
    r.prompt.publicMetadata.ownerSeat='mixed';
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choices',tokens:['garb-tool','path']});
    r.observation.opponentPublic.bench[0].tools=[];
    r.observation.opponentPublic.stadium=[];
    r.prompt=null;
    r.actionFrontier.items=[root('play-card','Field Blower GRI 125','blower')];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' absolute global turn never permits a second Supporter after count one',()=>{
    const r=request(seat);
    r.observation.globalTurn=17;
    r.observation.ownTurnResources.supporterPlayedTurn=1;
    r.observation.ownPublic.active=b('Unown AOR 30');
    r.observation.ownPublic.bench=[{printing:clef,energies:[psychic,psychic]}];
    r.observation.opponentPublic.active={printing:'Snorlax PGO 55',hp:150,damage:0};
    r.observation.opponentPublic.bench=[{
      printing:'Machamp VMAX ASR 73',hp:330,damage:230,
      printed:{weakness:[{type:'PSYCHIC',value:'×2'}]}}];
    r.observation.ownPublic.prizeCount=3;
    r.observation.ownHand=['VS Seeker PHF 109','Guzma BUS 115'];
    r.observation.ownPublic.discard=['Guzma BUS 115','Marnie SSH 169'];
    r.actionFrontier.items=[root('play-card','VS Seeker PHF 109','seeker'),
      root('play-card','Guzma BUS 115','gust')];
    // Synthetic frontiers may include stale actions; the worker must not
    // select a Supporter after the authoritative turn-local count is one.
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.ownTurnResources.supporterPlayedTurn=0;
    assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'gust'});
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' Field Blower declines three-layer Garbotoxin plus Path lock',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:clef,energies:[psychic,psychic],
      abilities:['Fairy Zone']};
    r.observation.opponentPublic.active={
      printing:'Regidrago VSTAR SIT 136',hp:280,damage:0,
      printed:{types:['DRAGON']}};
    r.observation.opponentPublic.bench=[
      {printing:'Garbodor BKP 57',abilities:['Garbotoxin'],
       tools:['Float Stone BKT 137']},
      {printing:'Garbodor LTR 68',abilities:['Garbotoxin'],
       tools:['Muscle Band XY 121']}];
    r.observation.opponentPublic.stadium=['Path to the Peak CRE 148'];
    r.actionFrontier.items=[root('play-card','Field Blower GRI 125','blower')];
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    // With two removable locks, the same effect has an immediate payoff.
    r.observation.opponentPublic.stadium=[];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'blower'});
    r.prompt={...prompt('mixed',[card('Float Stone BKT 137','float'),
      card('Muscle Band XY 121','band')],0,2),
      source:{sourcePrinting:'Field Blower GRI 125',effectName:'Field Blower'}};
    r.prompt.publicMetadata.ownerSeat='mixed';
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choices',tokens:['float','band']});
    // Live opposing Iron Thorns Initialization means removing a spare Path
    // alone cannot restore Fairy Zone, even with one Field Blower.
    r.prompt=null;
    r.observation.opponentPublic.bench=[];
    r.observation.opponentPublic.stadium=['Path to the Peak CRE 148'];
    r.observation.opponentPublic.active={
      printing:'Iron Thorns ex TWM 77',hp:230,damage:0,
      abilities:['Initialization'],abilitySuppressions:[{
        abilityName:'Initialization',suppressed:false,
        reasonCode:null,sourcePrinting:null}]};
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' Telepathic Rondo payoff requires enough Bench slots and Psychic search targets',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={
      printing:clef,energies:[psychic,psychic]};
    r.observation.ownPublic.bench=[
      b('Unown AOR 30'),b('Latias ex SSP 76'),
      b('Minior PAR 99'),b('Dedenne-GX UNB 57')];
    r.observation.opponentPublic.active={
      printing:'Crobat V DAA 104',hp:230,damage:90,
      printed:{weakness:[],resistance:[]}};
    r.observation.opponentPublic.bench=[];
    r.observation.ownHand=['Telepathic Psychic Energy POR 88'];
    r.actionFrontier.items=[{
      ...root('play-card','Telepathic Psychic Energy POR 88','telepath',
        {targetSeat:'actor',targetZone:'active',isOwnerVisible:true}),
       targetPrinting:clef}];
    // 100 current Rondo, 140 remaining: one free Bench slot adds 20 only.
    assert.deepEqual(projectedRondo(r.observation),
      {damage:100,remaining:140,total:4});
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.ownPublic.stadium=['Sky Field ROS 89'];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'telepath'});
    r.observation.ownerK1={exactMembershipKnown:true,
      knownPrintings:[{printing:'Minior PAR 99',copies:2},
        {printing:'Psychic Energy MEE 13',copies:5}]};
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.ownerK1.knownPrintings.push({
      printing:'Unown AOR 30',copies:1});
    assert.equal(policy(seat).decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
    r.observation.ownerK1.knownPrintings.push({
      printing:'Latias ex SSP 76',copies:1});
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'telepath'});
  });
  test('seat '+seat+' Telepathic search never chooses two Basics for one Bench vacancy',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:clef,energies:[psychic]};
    r.observation.ownPublic.bench=[
      b('Unown AOR 30'),b('Minior PAR 99'),
      b('Squawkabilly ex PAL 169'),b('Dedenne-GX UNB 57')];
    r.prompt={...prompt('deck',[
      card('Latias ex SSP 76','latias'),
      card(clef,'clefairy'),
      card('Unown AOR 30','unown')],0,2),
      source:{sourcePrinting:'Telepathic Psychic Energy POR 88',
        effectName:'Telepathic Psychic Energy'}};
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choices',tokens:['latias']});
    r.observation.ownPublic.bench.push(b('Crobat V DAA 104'));
    assert.equal(policy(seat).decide(r).reasonCode,'NO_LEGAL_CARD_SET');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' first-turn Battle VIP precedes speculative Mail when setup slots exist',()=>{
    const r=request(seat);
    r.observation.globalTurn=1;
    r.observation.ownPublic.active=b('Unown AOR 30');
    r.observation.ownPublic.bench=[b('Latias ex SSP 76')];
    r.observation.ownHand=['Battle VIP Pass FST 225',"Trainers' Mail ROS 92"];
    r.actionFrontier.items=[
      root('play-card',"Trainers' Mail ROS 92",'mail'),
      root('play-card','Battle VIP Pass FST 225','vip')];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'vip'});
    r.observation.ownPublic.bench=[
      b(clef),b(clef),b('Latias ex SSP 76'),b('Unown AOR 30')];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'mail'});
    r.observation.ownPublic.bench=[b('Latias ex SSP 76')];
    r.observation.globalTurn=4;
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'mail'});
  });
  test('seat '+seat+' VIP search selects one Basic with one open Bench place',()=>{
    const r=request(seat);
    r.observation.ownPublic.active=b('Unown AOR 30');
    r.observation.ownPublic.bench=[
      b('Crobat V DAA 104'),b('Dedenne-GX UNB 57'),
      b('Unown AOR 30'),b('Minior PAR 99')];
    r.prompt={...prompt('deck',[card(clef,'clefairy'),
      card('Latias ex SSP 76','latias')],0,2),
      source:{sourcePrinting:'Battle VIP Pass FST 225',
        effectName:'Battle VIP Pass'}};
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choices',tokens:['clefairy']});
    r.observation.ownPublic.bench.push(b('Squawkabilly ex PAL 169'));
    assert.equal(policy(seat).decide(r).reasonCode,'NO_LEGAL_CARD_SET');
    r.observation.ownPublic.bench.pop();
    r.observation.ownTurnResources.pokemonPlayLocked=true;
    assert.equal(policy(seat).decide(r).reasonCode,'NO_LEGAL_CARD_SET');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' Raihan root requires a fresh KO, Basic Energy, and a charged Clefairy target',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:clef,energies:[psychic]};
    r.observation.ownPublic.discard=[psychic];
    r.observation.ownHand=['Raihan EVS 152'];
    r.actionFrontier.items=[root('play-card','Raihan EVS 152','raihan'),
      root('pass','','pass')];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'raihan'});
    r.publicEventReceipt.priorOpponentTurnKO.turn=2;
    assert.notDeepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'raihan'});
    r.publicEventReceipt.priorOpponentTurnKO={any:true,byAttack:true};
    assert.notDeepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'raihan'});
    r.publicEventReceipt.priorOpponentTurnKO={turn:3,any:true,byAttack:true};
    r.observation.ownPublic.discard=[];
    assert.notDeepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'raihan'});
  });
  test('seat '+seat+' Raihan is not played when every Clefairy already has two Energy',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:clef,energies:[psychic,psychic]};
    r.observation.ownPublic.discard=[psychic];
    r.observation.ownHand=['Raihan EVS 152'];
    r.actionFrontier.items=[root('play-card','Raihan EVS 152','raihan'),
      root('pass','','pass')];
    assert.notDeepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'raihan'});
  });
  test('seat '+seat+' Raihan attach chooses Basic Psychic for a Clefairy attack target',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:clef,energies:[psychic]};
    r.observation.ownPublic.bench=[b(clef)];
    r.prompt={
      promptType:'AttachEnergyPrompt',
      source:{sourcePrinting:'Raihan EVS 152',effectName:'Raihan'},
      publicMetadata:{selectionType:'energy-attachment',ownerSeat:'actor',
        isOwnerVisible:true,sourceZone:'discard',energyType:'BASIC',zone:'bench,active',minimumCount:1,maximumCount:1},
      choices:[
        {kind:'energy',printing:'Telepathic Psychic Energy POR 88',token:'special-active',
          publicMetadata:{sourceZone:'discard',ownerSeat:'actor',
            isOwnerVisible:true,energyType:'SPECIAL',zone:'active',slotIndex:0,targetSeat:'actor'}},
        {kind:'energy',printing:psychic,token:'active-energy',
          publicMetadata:{sourceZone:'discard',ownerSeat:'actor',
            isOwnerVisible:true,energyType:'BASIC',zone:'active',slotIndex:0,targetSeat:'actor'}},
        {kind:'energy',printing:psychic,token:'bench-energy',
          publicMetadata:{sourceZone:'discard',ownerSeat:'actor',
            isOwnerVisible:true,energyType:'BASIC',zone:'bench',benchIndex:0,targetSeat:'actor'}}
      ]
    };
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choice',token:'active-energy'});
  });
  test('seat '+seat+' Raihan deck search takes fresh Fez when hand is small',()=>{
    const r=request(seat);
    r.observation.ownPublic.active={printing:clef,energies:[psychic,psychic]};
    r.observation.ownHand=[];
    r.prompt={
      promptType:'ChooseCardsPrompt',
      source:{sourcePrinting:'Raihan EVS 152',effectName:'Raihan'},
      publicMetadata:{selectionType:'card-combination',ownerSeat:'actor',
        isOwnerVisible:true,sourceZone:'deck',minimumCount:1,maximumCount:1},
      choices:[
        card('Fezandipiti ex ASC 142','fez'),
        card('Latias ex SSP 76','latias'),
        card('Guzma BUS 115','guzma')
      ]
    };
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choices',tokens:['fez']});
    r.publicEventReceipt.priorOpponentTurnKO.turn=2;
    assert.equal(policy(seat).decide(r).reasonCode,'UNSUPPORTED_CARD_COMBINATION_SOURCE');
  });
}


for(const seat of [0,1]) {
  test('seat '+seat+' Heavy Ball root is used when a second Clefairy is needed',()=>{
    const r=request(seat);
    r.observation.ownHand=['Hisuian Heavy Ball ASR 146'];
    r.actionFrontier.items=[root('play-card','Hisuian Heavy Ball ASR 146','heavy'),
      root('pass','','pass')];
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'heavy'});
    r.observation.ownPublic.prizeCount=0;
    assert.notDeepEqual(policy(seat).decide(r),
      {kind:'select-action',token:'heavy'});
  });
  test('seat '+seat+' Heavy Ball chooses the best owner-visible Prize Basic',()=>{
    const r=request(seat);
    r.prompt={
      promptType:'ChooseCardsPrompt',
      source:{sourcePrinting:'Hisuian Heavy Ball ASR 146',effectName:'HisuianHeavyBall'},
      publicMetadata:{selectionType:'card-combination',sourceZone:'prizes',
        ownerSeat:'actor',isOwnerVisible:true,minimumCount:0,maximumCount:1},
      choices:[
        card(clef,'prize-clef'),
        card('Latias ex SSP 76','prize-latias'),
        {kind:'empty-selection',token:'empty'}
      ]
    };
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choices',tokens:['prize-clef']});
  });
  test('seat '+seat+' Heavy Ball can retrieve Tapu Lele outside the Rondo bench-role subset',()=>{
    const r=request(seat);
    r.observation.ownHand=['Guzma BUS 115'];
    r.prompt={
      promptType:'ChooseCardsPrompt',
      source:{sourcePrinting:'Hisuian Heavy Ball ASR 146',effectName:'HisuianHeavyBall'},
      publicMetadata:{selectionType:'card-combination',sourceZone:'prizes',
        ownerSeat:'actor',isOwnerVisible:true,minimumCount:0,maximumCount:1},
      choices:[card('Tapu Lele-GX GRI 60','prize-lele'),
        {kind:'empty-selection',token:'empty'}]
    };
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choices',tokens:['prize-lele']});
  });
  test('seat '+seat+' Heavy Ball can retrieve Mimikyu against a GX board',()=>{
    const r=request(seat);
    r.observation.opponentPublic.active={printing:'Dedenne-GX UNB 57',hp:160,damage:0};
    r.prompt={
      promptType:'ChooseCardsPrompt',
      source:{sourcePrinting:'Hisuian Heavy Ball ASR 146',effectName:'HisuianHeavyBall'},
      publicMetadata:{selectionType:'card-combination',sourceZone:'prizes',
        ownerSeat:'actor',isOwnerVisible:true,minimumCount:0,maximumCount:1},
      choices:[card('Mimikyu GRI 58','prize-mimikyu'),
        {kind:'empty-selection',token:'empty'}]
    };
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choices',tokens:['prize-mimikyu']});
  });
  test('seat '+seat+' Heavy Ball ignores Basics already recovered to hand, board, or discard',()=>{
    const r=request(seat);
    r.observation.ownHand=[
      'Hisuian Heavy Ball ASR 146',clef,'Latias ex SSP 76',
      'Fezandipiti ex ASC 142','Crobat V DAA 104','Tapu Lele-GX GRI 60'
    ];
    r.observation.ownPublic.discard=[clef];
    r.prompt={
      promptType:'ChooseCardsPrompt',
      source:{sourcePrinting:'Hisuian Heavy Ball ASR 146',effectName:'HisuianHeavyBall'},
      publicMetadata:{selectionType:'card-combination',sourceZone:'prizes',
        ownerSeat:'actor',isOwnerVisible:true,minimumCount:0,maximumCount:1},
      choices:[
        card(clef,'prize-clef'),
        card('Latias ex SSP 76','prize-latias'),
        card('Fezandipiti ex ASC 142','prize-fez'),
        card('Crobat V DAA 104','prize-crobat'),
        card('Tapu Lele-GX GRI 60','prize-lele'),
        {kind:'empty-selection',token:'empty'}
      ]
    };
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choice',token:'empty'});
  });
  test('seat '+seat+' Heavy Ball chooses the legal empty selection when no useful Basic is offered',()=>{
    const r=request(seat);
    r.prompt={
      promptType:'ChooseCardsPrompt',
      source:{sourcePrinting:'Hisuian Heavy Ball ASR 146',effectName:'HisuianHeavyBall'},
      publicMetadata:{selectionType:'card-combination',sourceZone:'prizes',
        ownerSeat:'actor',isOwnerVisible:true,minimumCount:0,maximumCount:1},
      choices:[{kind:'empty-selection',token:'empty'}]
    };
    assert.deepEqual(policy(seat).decide(r),
      {kind:'select-choice',token:'empty'});
  });
}

test('all 32 rank30 source printings map to exactly one policy identity pattern',()=>{
  const coverage=sourceCardPatternCoverage();
  assert.equal(SOURCE_COUNTS.reduce((sum,row)=>sum+row[1],0),60);
  assert.equal(coverage.length,32);
  assert.equal(coverage.every(row=>row.patternKeys.length===1),true,
    JSON.stringify(coverage.filter(row=>row.patternKeys.length!==1)));
});
test('Heavy Ball Basic inventory matches every source Basic printing and copy count',()=>{
  const coverage=heavyBallBasicCoverage();
  assert.equal(coverage.length,12);
  assert.equal(coverage.every(row=>row.printing!==null&&
    row.sourceCopies===row.configuredCopies),true,JSON.stringify(coverage));
  assert.equal(coverage.reduce((sum,row)=>sum+row.configuredCopies,0),16);
});


for(const seat of [0,1])test('seat '+seat+' Raihan accepts last opponent KO across our own extra turn',()=>{
  const r=request(seat);
  r.observation.ownPublic.active={printing:clef,energies:[psychic]};
  r.observation.ownPublic.discard=[psychic];
  r.observation.ownHand=['Raihan EVS 152'];
  r.actionFrontier.items=[root('play-card','Raihan EVS 152','raihan'),
    root('pass',null,'pass')];
  r.publicEventReceipt={actorSeat:seat,turn:4,
    opponentLastTurnTurn:2,opponentLastTurnOwnerCertified:true,
    priorOpponentTurnKO:{turn:2,any:true,byAttack:true}};
  assert.deepEqual(policy(seat).decide(r),{kind:'select-action',token:'raihan'});
  r.publicEventReceipt.opponentLastTurnOwnerCertified=false;
  assert.notDeepEqual(policy(seat).decide(r),{kind:'select-action',token:'raihan'});
});
