'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {validateDecision,validatePrompt}=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {
 POLICY_VERSION,SOURCE_RANK,SOURCE_BLOB_SHA1,SOURCE_PRINTINGS,
 createPolicy,scoreRoot,searchValue,sourceDiscardValue,benchOpen,
 resolveSourcePrinting,templeUnlocksApex
}=require('../../simulation/evaluation/2026-11/agent2-rank18-regidrago-opponent-policy.cjs');
const P={
 v:'Regidrago V SIT 135',star:'Regidrago VSTAR SIT 136',
 vip:'Battle VIP Pass FST 225',sky:'Sky Field ROS 89',
 quick:'Quick Ball FST 237',treasure:'Mysterious Treasure FLI 113',
 ultra:'Ultra Ball MEG 131',heavy:'Hisuian Heavy Ball ASR 146',
 squawk:'Squawkabilly ex PAL 169',goodra:'Hisuian Goodra VSTAR LOR 136',
 budew:'Budew ASC 16',kang:'Mega Kangaskhan ex MEG 104',
 prime:'Prime Catcher TEF 157',sudowoodo:'Sudowoodo GRI 66'
};
function pokemon(printing,overrides={}){
 return {printing,hp:280,damage:0,energies:[],abilities:[],tools:[],
  specialConditions:[],printed:{types:['Dragon'],subtypes:['Basic']},...overrides};
}
function obs(seat,overrides={}){
 return {actorSeat:seat,phase:2,globalTurn:2,ownHand:[],
   ownPublic:{active:pokemon(P.v),bench:[],discard:[],stadium:[],
     deckCount:35,prizeCount:6,publicTurnRestrictions:{vstarUsed:false}},
   opponentPublic:{active:pokemon('Shadow Rider Calyrex VMAX CRE 75',
     {hp:320,printed:{types:['Psychic'],subtypes:['VMAX']}}),
     bench:[],discard:[],stadium:[],prizeCount:6},...overrides};
}
function action(token,printing,kind='play-card',extra={}){
 return {token,kind,actorPrinting:printing,label:printing,...extra};
}
function policy(seat,extra={}){
 return createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,
   config:{rank:18,sourceBlobSha1:SOURCE_BLOB_SHA1,...extra}});
}
function root(seat,ob,items){
 return policy(seat).decide({role:'opponent',seat,observation:ob,
   actionFrontier:{schema:'aichi-action-frontier-v1',items}});
}
function choice(token,printing,zone='deck'){
 return {kind:'card',token,printing,label:printing,
   publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,sourceZone:zone}};
}
function prompt(seat,ob,sourcePrinting,effectName,promptType,choices,meta={}){
 const metadata={selectionType:promptType==='ChooseCardsPrompt'?'card-combination':
   promptType==='ChooseAttackPrompt'?'attack':promptType==='ConfirmPrompt'?'confirm':'pokemon',
   sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true,
   minimumCount:1,maximumCount:1,allowCancel:false,...meta};
 return {role:'opponent',seat,observation:ob,prompt:{
   schema:'aichi-owner-prompt-projection-v3',actingSeat:seat,promptType,
   description:effectName,source:{classification:'actor-choice',
     sourceKind:'card-effect',sourcePrinting,effectName},
   publicMetadata:metadata,choices}};
}
function decide(seat,request){return policy(seat).decide(request);}
function token(out){return out.token??out.tokens?.[0]??null;}
function nativeValid(seat,req,result){
 return validateDecision(result,validatePrompt(req.prompt,seat),new Set());
}

test('rank18 sealed exact-source sixty, unlike rank27/10',()=>{
 assert.equal(SOURCE_RANK,18);
 assert.equal(SOURCE_BLOB_SHA1,'ae773f6201d7aa69d31914dbfee66f3fba692200');
 assert.equal(SOURCE_PRINTINGS.reduce((n,row)=>n+row[1],0),60);
 assert.equal(new Set(SOURCE_PRINTINGS.map(x=>x[0])).size,SOURCE_PRINTINGS.length);
 assert.ok(SOURCE_PRINTINGS.some(x=>x[0]===P.vip&&x[1]===4));
 assert.ok(SOURCE_PRINTINGS.some(x=>x[0]===P.sky&&x[1]===3));
 assert.ok(SOURCE_PRINTINGS.some(x=>x[0]===P.goodra&&x[1]===1));
 for(const absent of ['Crispin SCR 133','Battle Compressor PHF 92','Net Ball LOT 187',
   'Noivern ex PAL 153'])
  assert.ok(!SOURCE_PRINTINGS.some(x=>x[0]===absent),absent);
});
test('rank18 source/role/seat/variant fail closed and runtime labels collide safely',()=>{
 for(const seat of [0,1]){
  for(const invalid of [
   {role:'candidate',seat,policyVersion:POLICY_VERSION,config:{rank:18,sourceBlobSha1:SOURCE_BLOB_SHA1}},
   {role:'opponent',seat,policyVersion:POLICY_VERSION,config:{rank:27,sourceBlobSha1:SOURCE_BLOB_SHA1}},
   {role:'opponent',seat,policyVersion:POLICY_VERSION,config:{rank:18,sourceBlobSha1:'forged'}},
   {role:'opponent',seat,policyVersion:'other',config:{rank:18,sourceBlobSha1:SOURCE_BLOB_SHA1}},
   {role:'opponent',seat,policyVersion:POLICY_VERSION,config:{rank:18,sourceBlobSha1:SOURCE_BLOB_SHA1,extra:true}}
  ])assert.throws(()=>createPolicy(invalid));
  const req={role:'opponent',seat,observation:obs(1-seat),
    actionFrontier:{items:[action('pass','Pass','pass')]}};
  assert.equal(decide(seat,req).reasonCode,'ROLE_SEAT_BINDING_MISMATCH');
 }
 assert.equal(resolveSourcePrinting('Regidrago V SIT'),P.v);
 assert.equal(resolveSourcePrinting('Regidrago V SIT 999'),'Regidrago V SIT 999');
 assert.equal(resolveSourcePrinting('Squawkabilly ex PAL'),P.squawk);
});
test('distinct rank18 turbo setup VIP outranks Quick Ball in both seats',()=>{
 for(const seat of [0,1]){
  const ob=obs(seat);
  const offer=[action('vip',P.vip),action('quick',P.quick),
    action('pass','Pass','pass')];
  const out=root(seat,ob,offer);
  assert.deepEqual(out,{kind:'select-action',token:'vip'});
  assert.deepEqual(validateDecision(out,null,new Set(offer.map(x=>x.token))),out);
  assert.equal(scoreRoot(action('wrong','Net Ball LOT 187'),{observation:ob}),-Infinity);
  assert.equal(scoreRoot(action('bad','Regidrago V SIT 999'),{observation:ob}),-Infinity);
 }
});
test('Sky Field specifically opens Bench slots five through eight',()=>{
 for(const seat of [0,1]){
  const original=obs(seat);
  const withFive=obs(seat,{ownPublic:{...original.ownPublic,
    bench:Array.from({length:5},()=>pokemon(P.budew)),
    stadium:['Sky Field ROS 89']}});
  assert.equal(benchOpen(withFive),true);
  const eight=obs(seat,{ownPublic:{...withFive.ownPublic,
    bench:Array.from({length:8},()=>pokemon(P.budew))}});
  assert.equal(benchOpen(eight),false);
  const noSky=obs(seat,{ownPublic:{...withFive.ownPublic,stadium:[]}});
  assert.equal(benchOpen(noSky),false);
 }
});
test('opponent Roadblock can dominate a Sky Field expansion',()=>{
 for(const seat of [0,1]){
  const original=obs(seat);
  const ob=obs(seat,{ownPublic:{...original.ownPublic,
    bench:Array.from({length:4},()=>pokemon(P.budew)),
    stadium:[P.sky]},opponentPublic:{...original.opponentPublic,
    bench:[pokemon(P.sudowoodo,{abilities:[{name:'Roadblock'}]})]}});
  assert.equal(benchOpen(ob),false);
 }
});
test('Temple means a source Sky Field replacement can unlock active Apex',()=>{
 for(const seat of [0,1]){
  const original=obs(seat);
  const locked=obs(seat,{ownPublic:{...original.ownPublic,
    active:pokemon(P.star,{energies:['Double Dragon Energy ROS 97',
      'Grass Energy MEE 9']}),
    stadium:['Temple of Sinnoh ASR 155'],discard:['Dragapult ex TWM 130']}});
  const offer=[action('sky',P.sky),action('quick',P.quick),
    action('pass','Pass','pass')];
  assert.equal(token(root(seat,locked,offer)),'sky');
 }
});
test('source Quick Ball cannot search Stage 1/2 even when in deck',()=>{
 for(const seat of [0,1]){
  const ob=obs(seat);
  const req=prompt(seat,ob,'Quick Ball FST','Quick Ball',
    'ChooseCardsPrompt',[
     choice('v','Regidrago V SIT'),
     choice('star','Regidrago VSTAR SIT'),
     choice('kang','Mega Kangaskhan ex MEG')]);
  const out=decide(seat,req);
  assert.deepEqual(out,{kind:'select-choices',tokens:['v']});
  assert.deepEqual(nativeValid(seat,req,out),out);
  assert.equal(searchValue(P.quick,P.star,ob),-Infinity);
 }
});
test('Mysterious Treasure may reach source VSTAR, not Colorless Mega',()=>{
 for(const seat of [0,1]){
  const original=obs(seat);
  const ob=obs(seat,{ownPublic:{...original.ownPublic,bench:[pokemon(P.v)]}});
  const req=prompt(seat,ob,'Mysterious Treasure FLI','Mysterious Treasure',
    'ChooseCardsPrompt',[
      choice('kang','Mega Kangaskhan ex MEG'),choice('star','Regidrago VSTAR SIT'),
      choice('squawk','Squawkabilly ex PAL')]);
  const out=decide(seat,req);
  assert.deepEqual(out,{kind:'select-choices',tokens:['star']});
  assert.deepEqual(nativeValid(seat,req,out),out);
 }
});
test('Battle VIP selects source Basic pair; source stage and owner filter enforced',()=>{
 for(const seat of [0,1]){
  const ob=obs(seat);
  const req=prompt(seat,ob,'Battle VIP Pass FST','Battle VIP Pass',
    'ChooseCardsPrompt',[choice('v','Regidrago V SIT'),choice('budew','Budew ASC'),
      choice('star','Regidrago VSTAR SIT'),choice('kang','Mega Kangaskhan ex MEG')],
    {minimumCount:1,maximumCount:2});
  const out=decide(seat,req);
  assert.deepEqual(out,{kind:'select-choices',tokens:['v','budew']});
  assert.deepEqual(nativeValid(seat,req,out),out);
 }
});
test('rank18 source Goodra donor is usable; Colorless Mega is not Apex donor',()=>{
 for(const seat of [0,1]){
  const original=obs(seat);
  const ob=obs(seat,{ownPublic:{...original.ownPublic,
    discard:[P.goodra],active:pokemon(P.star)}});
  const req=prompt(seat,ob,'Regidrago VSTAR SIT','Apex Dragon',
    'ChooseAttackPrompt',[
      {kind:'attack',token:'goodra',printing:'Hisuian Goodra VSTAR LOR',
       label:'Rolling Iron',publicMetadata:{ownerSeat:'actor',
         sourceZone:'discard',isOwnerVisible:true,sourceAttack:'Rolling Iron'}},
      {kind:'attack',token:'mega',printing:'Mega Kangaskhan ex MEG',
       label:'Rapid-Fire Combo',publicMetadata:{ownerSeat:'actor',
         sourceZone:'discard',isOwnerVisible:true,sourceAttack:'Rapid-Fire Combo'}}
    ]);
  const out=decide(seat,req);
  assert.deepEqual(out,{kind:'select-choice',token:'goodra'});
  assert.deepEqual(nativeValid(seat,req,out),out);
 }
});
test('separate Squawk and Seize confirmation is only selected early when useful',()=>{
 for(const seat of [0,1]){
  const original=obs(seat),opts=[
    {kind:'confirm',token:'yes',label:'Yes',publicMetadata:{}},
    {kind:'confirm',token:'no',label:'No',publicMetadata:{}}
  ];
  const yes=prompt(seat,original,'Squawkabilly ex PAL','Squawk and Seize',
    'ConfirmPrompt',opts,{selectionType:'confirm'});
  assert.equal(token(decide(seat,yes)),'yes');
  const later=obs(seat,{globalTurn:9,ownHand:[1,2,3,4,5]});
  const no=prompt(seat,later,'Squawkabilly ex PAL','Squawk and Seize',
    'ConfirmPrompt',opts,{selectionType:'confirm'});
  assert.equal(token(decide(seat,no)),'no');
  assert.deepEqual(nativeValid(seat,yes,decide(seat,yes)),decide(seat,yes));
 }
});
test('hand discard uses source Dragon payload while protecting ACE and Double Dragon',()=>{
 for(const seat of [0,1]){
  const ob=obs(seat);
  const req=prompt(seat,ob,'Ultra Ball MEG','Ultra Ball','ChooseCardsPrompt',[
    choice('goodra','Hisuian Goodra VSTAR LOR','hand'),
    choice('sky','Sky Field ROS','hand'),
    choice('prime','Prime Catcher TEF','hand'),
    choice('dde','Double Dragon Energy ROS','hand')],
    {sourceZone:'hand',minimumCount:2,maximumCount:2});
  const out=decide(seat,req);
  assert.deepEqual(out,{kind:'select-choices',tokens:['goodra','sky']});
  assert.equal(sourceDiscardValue(P.prime,ob),-Infinity);
  assert.deepEqual(nativeValid(seat,req,out),out);
 }
});
test('Hisuian Heavy Ball can only take Basic from actor-visible Prize choices',()=>{
 for(const seat of [0,1]){
  const ob=obs(seat);
  const req=prompt(seat,ob,'Hisuian Heavy Ball ASR','Hisuian Heavy Ball',
    'ChooseCardsPrompt',[
      choice('star','Regidrago VSTAR SIT','prizes'),
      choice('basic','Regidrago V SIT','prizes'),
      choice('other','Regidrago V SIT','deck')],
    {sourceZone:'prizes',minimumCount:1,maximumCount:1});
  const out=decide(seat,req);
  assert.deepEqual(out,{kind:'select-choices',tokens:['basic']});
  assert.deepEqual(nativeValid(seat,req,out),out);
 }
});
test('strict source/prompt admission fails closed with registered abstentions',()=>{
 for(const seat of [0,1]){
  const ob=obs(seat);
  const req=prompt(seat,ob,'Battle VIP Pass FST 999','Battle VIP Pass',
    'ChooseCardsPrompt',[choice('x',P.v)]);
  const out=decide(seat,req);
  assert.deepEqual(out,{kind:'abstain',reasonCode:'UNTRUSTED_PROMPT_SOURCE'});
  assert.deepEqual(nativeValid(seat,req,out),out);
  const wrong={...req,prompt:{...req.prompt,actingSeat:1-seat}};
  const wrongOut=decide(seat,wrong);
  assert.equal(wrongOut.reasonCode,'UNTRUSTED_PROMPT');
  assert.deepEqual(validateDecision(wrongOut,null,new Set()),wrongOut);
 }
});
test('actor-owned source deck excludes exact foreign card from source search',()=>{
 for(const seat of [0,1]){
  const ob=obs(seat);
  assert.equal(searchValue(P.vip,'Crobat V DAA 104',ob),-Infinity);
  assert.equal(searchValue(P.treasure,P.kang,ob),-Infinity);
  assert.equal(searchValue(P.vip,P.star,ob),-Infinity);
  assert.equal(searchValue(P.ultra,P.star,ob)>0,true);
 }
});


test('Goodra-only Apex donor unlocks Temple with source Sky; no donor does not',()=>{
 for(const seat of [0,1]){
  const original=obs(seat);
  const funded=pokemon(P.star,{energies:[
    'Double Dragon Energy ROS 97','Grass Energy MEE 9'],
    printed:{types:['Dragon'],subtypes:['VSTAR']}});
  const locked=obs(seat,{ownPublic:{...original.ownPublic,
    active:funded,stadium:['Temple of Sinnoh ASR 155'],
    discard:[P.goodra]}});
  assert.equal(templeUnlocksApex(locked),true);
  assert.deepEqual(root(seat,locked,[
    action('sky',P.sky),action('quick',P.quick),
    action('pass','Pass','pass')]),
    {kind:'select-action',token:'sky'});
  // Rank18 does NOT contain Megaton Blower (other Regidrago ranks do).
  // The strict source-60 filter must not manufacture a nonexistent out.
  assert.equal(scoreRoot(action('megaton','Megaton Blower SSP 182'),
    {observation:locked}),-Infinity);
  const empty=obs(seat,{ownPublic:{...locked.ownPublic,discard:[]}});
  assert.equal(templeUnlocksApex(empty),false);
  assert.equal(token(root(seat,empty,[
    action('sky',P.sky),action('quick',P.quick)])),'quick');
  const noEnergy=obs(seat,{ownPublic:{...locked.ownPublic,
    active:pokemon(P.star,{energies:['Grass Energy MEE 9']})}});
  assert.equal(templeUnlocksApex(noEnergy),false);
 }
});
