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
    assert.deepEqual(policy(seat).decide(r),{kind:'select-choices',tokens:['e','v1','v2']});
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
