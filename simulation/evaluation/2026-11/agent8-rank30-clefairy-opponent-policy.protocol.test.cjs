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
      [clef],'Secret Box TWM 163','hand',
      [[energy,'psy'],[vip,'vip-a'],[vip,'vip-b'],
      ['Telepathic Psychic Energy POR 88','protected']],3,3);
    assertValid(seat,r,{kind:'select-choices',tokens:['vip-a','vip-b','psy']});
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
