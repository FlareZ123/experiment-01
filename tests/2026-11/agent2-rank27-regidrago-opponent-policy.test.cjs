'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {validateDecision,validatePrompt}=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {POLICY_VERSION,SOURCE_RANK,SOURCE_BLOB_SHA1,SOURCE_PRINTINGS,
  createPolicy,scoreRoot,choosePrompt,donorScore}=
 require('../../simulation/evaluation/2026-11/agent2-rank27-regidrago-opponent-policy.cjs');

const P={
 v:'Regidrago V SIT 135',star:'Regidrago VSTAR SIT 136',
 budew:'Budew ASC 16',dialga:'Dialga-GX UPR 100',
 noivern:'Noivern ex PAL 153',dragapult:'Dragapult ex TWM 130',
 quick:'Quick Ball FST 237',compressor:'Battle Compressor PHF 92',
 net:'Net Ball LOT 187',path:'Path to the Peak CRE 148',
 crobat:'Crobat V DAA 104',raihan:'Raihan EVS 152',
};
function pokemon(printing,overrides={}){
 return {printing,hp:280,damage:0,energies:[],abilities:[],tools:[],
   printed:{types:['Dragon'],subtypes:['Basic']},...overrides};
}
function observation(seat,overrides={}){
 return {actorSeat:seat,phase:2,globalTurn:4,ownHand:[],
   ownPublic:{active:pokemon(P.star,{printed:{types:['Dragon'],subtypes:['VSTAR']}}),
     bench:[],discard:[],stadium:[],deckCount:35,prizeCount:6,
     publicTurnRestrictions:{vstarUsed:false,gxUsed:false}},
   opponentPublic:{active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{
     printed:{types:['Psychic'],subtypes:['VMAX']},hp:320}),
     bench:[],stadium:[],discard:[],prizeCount:6},
   ...overrides};
}
function action(token,kind,printing,more={}){
 return {token,kind,actorPrinting:printing,label:printing,...more};
}
function choice(token,printing,more={},kind='card'){
 return {token,kind,printing,label:printing,publicMetadata:{
   ownerSeat:'actor',sourceZone:'deck',isOwnerVisible:true,...more}};
}
function rootRequest(seat,obs,items,publicEventReceipt={}){
 return {role:'opponent',seat,observation:obs,
   actionFrontier:{schema:'aichi-action-frontier-v1',items},publicEventReceipt};
}
function promptRequest(seat,obs,effectName,printing,type,choices,meta={},extra={}){
 const src=extra.engine===true?{sourceKind:'engine',sourcePrinting:null}:
   {sourceKind:'card-effect',sourcePrinting:printing};
 return {role:'opponent',seat,observation:obs,
   prompt:{schema:'aichi-owner-prompt-projection-v3',actingSeat:seat,
     promptType:type,description:effectName,source:{
       classification:'actor-choice',...src,effectName},
     publicMetadata:{selectionType:type==='ChooseAttackPrompt'?'attack':
       type==='ChooseCardsPrompt'?'card-combination':
       type==='ChoosePrizePrompt'?'prize-slots':
       type==='ChoosePokemonPrompt'?'pokemon':
       type==='ConfirmPrompt'?'confirm':
       type==='SelectPrompt'?'option':undefined,...meta},choices}};
}
function policy(seat,extra={}){
 return createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,
   config:{rank:SOURCE_RANK,sourceBlobSha1:SOURCE_BLOB_SHA1,...extra}});
}
function decide(seat,request){return policy(seat).decide(request);}
function tok(result){return result.token??result.tokens?.[0]??null;}
function root(seat,obs,items,receipt){
 return decide(seat,rootRequest(seat,obs,items,receipt));
}
test('immutable rank-27 source ledger is the authentic 60, not rank-10 aliases',()=>{
 assert.equal(SOURCE_RANK,27);
 assert.equal(SOURCE_PRINTINGS.reduce((n,row)=>n+row[1],0),60);
 assert.equal(new Set(SOURCE_PRINTINGS.map(row=>row[0])).size,SOURCE_PRINTINGS.length);
 const names=SOURCE_PRINTINGS.map(row=>row[0]);
 for(const p of [P.quick,P.compressor,P.net,P.path,P.crobat,P.noivern,P.dialga])
   assert.ok(names.includes(p),p);
 for(const absent of ['Battle VIP Pass FST 225','Squawkabilly ex PAL 169',
   'Faba LOT 173','Hisuian Goodra VSTAR LOR 136','Salamence ex JTG 114'])
   assert.ok(!names.includes(absent),absent);
});
test('identity/role/seat/config sealed to rank-27 source',()=>{
 for(const seat of [0,1]){
   assert.throws(()=>createPolicy({role:'candidate',seat,policyVersion:POLICY_VERSION,
     config:{rank:27,sourceBlobSha1:SOURCE_BLOB_SHA1}}));
   assert.throws(()=>createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,
     config:{rank:10,sourceBlobSha1:SOURCE_BLOB_SHA1}}));
   assert.throws(()=>createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,
     config:{rank:27,sourceBlobSha1:'madeup'}}));
   assert.throws(()=>createPolicy({role:'opponent',seat,policyVersion:'stale-v1',
     config:{rank:27,sourceBlobSha1:SOURCE_BLOB_SHA1}}));
   assert.equal(policy(seat).decide(rootRequest(1-seat,observation(1-seat),[]))
     .reasonCode,'ROLE_SEAT_BINDING_MISMATCH');
 }
});
test('rank-27 deck source setup and native token set outrank absent rank-10 pieces',()=>{
 for(const seat of [0,1]){
   const obs=observation(seat);
   const offered=[action('vip','play-card','Battle VIP Pass FST 225'),
     action('quick','play-card',P.quick),action('pass','pass','Pass')];
   assert.equal(tok(root(seat,obs,offered)),'quick');
   assert.equal(scoreRoot(offered[0],rootRequest(seat,obs,offered)),-Infinity);
   const withV=observation(seat,{ownPublic:{...obs.ownPublic,bench:[pokemon(P.v)]}});
   assert.equal(tok(root(seat,withV,[
     action('evolve','play-card',P.star),action('quick','play-card',P.quick),
     action('pass','pass','Pass')])),'evolve');
 }
});
test('real discarded Dragon donor enables Apex; empty discard cannot',()=>{
 for(const seat of [0,1]){
   const obs=observation(seat),items=[
     action('apex','attack','Apex Dragon',{attackName:'Apex Dragon'}),
     action('pass','pass','Pass')];
   assert.equal(tok(root(seat,obs,items)),'pass');
   const funded=observation(seat,{ownPublic:{
     ...obs.ownPublic,discard:[P.dialga]}});
   assert.equal(tok(root(seat,funded,items)),'apex');
 }
});
test('Raihan is not enabled by unstamped native stale KO Boolean',()=>{
 for(const seat of [0,1]){
   const obs=observation(seat),items=[
     action('raihan','play-card',P.raihan),action('pass','pass','Pass')];
   const stale={priorOpponentTurnKO:{any:true,byAttack:true}};
   assert.equal(tok(root(seat,obs,items,stale)),'pass');
   const wrong={opponentLastTurnTurn:3,
     priorOpponentTurnKO:{turn:2,any:true,byAttack:true}};
   assert.equal(tok(root(seat,obs,items,wrong)),'pass');
   const sound={opponentLastTurnTurn:3,
     priorOpponentTurnKO:{turn:3,any:true,byAttack:false}};
   assert.equal(tok(root(seat,obs,items,sound)),'raihan');
 }
});
test('Path to the Peak held until own VSTAR power spent',()=>{
 for(const seat of [0,1]){
   const obs=observation(seat),items=[
     action('path','play-card',P.path),action('pass','pass','Pass')];
   const opp={...obs.opponentPublic,
     active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{abilities:['Underworld Door']})};
   assert.equal(tok(root(seat,observation(seat,{opponentPublic:opp}),items)),'pass');
   const own={...obs.ownPublic,publicTurnRestrictions:{vstarUsed:true,gxUsed:false}};
   assert.equal(tok(root(seat,observation(seat,{ownPublic:own,opponentPublic:opp}),items)),'path');
 }
});
test('Apex prompt admits only actor-public, truly discarded rank27 Dragon attacks',()=>{
 for(const seat of [0,1]){
   const obs=observation(seat,{ownPublic:{
     ...observation(seat).ownPublic,discard:[P.noivern,P.dialga]}});
   const req=promptRequest(seat,obs,'Apex Dragon',P.star,'ChooseAttackPrompt',[
      choice('covert',P.noivern,{sourceZone:'discard',sourceAttack:'Covert Flight'},'attack'),
      choice('gx',P.dialga,{sourceZone:'discard',sourceAttack:'Timeless-GX'},'attack'),
      choice('forged','Hisuian Goodra VSTAR LOR 136',{
        sourceZone:'discard',sourceAttack:'Rolling Iron'},'attack'),
      choice('notdiscard',P.dragapult,{
        sourceZone:'deck',sourceAttack:'Phantom Dive'},'attack')]);
   assert.equal(tok(decide(seat,req)),'gx'); // VMAX target => 150 + GX turn
   const basic={...obs.opponentPublic,active:pokemon('Mimikyu GRI 58',{
     printed:{types:['Psychic'],subtypes:['Basic']}})};
   assert.equal(tok(decide(seat,{...req,observation:{...obs,opponentPublic:basic}})),'covert');
   const spent={...obs.ownPublic,
     publicTurnRestrictions:{vstarUsed:false,gxUsed:true}};
   assert.equal(tok(decide(seat,{...req,observation:{...obs,ownPublic:spent}})),'covert');
   const bad=req.prompt.choices.map(x=>({...x,
     publicMetadata:{...x.publicMetadata,ownerSeat:'opponent'}}));
   assert.equal(decide(seat,{...req,prompt:{...req.prompt,choices:bad}})
     .reasonCode,'NO_SUPPORTED_CARD_SELECTION');
 }
});
test('Apex cannot be laundered through untrusted source or mixed branch print',()=>{
 for(const seat of [0,1]){
   const obs=observation(seat,{ownPublic:{
     ...observation(seat).ownPublic,discard:[P.dialga]}});
   const choices=[choice('gx',P.dialga,{
     sourceZone:'discard',sourceAttack:'Timeless-GX'},'attack')];
   const good=promptRequest(seat,obs,'Apex Dragon',P.star,'ChooseAttackPrompt',choices);
   for(const tampered of [
     {...good.prompt,source:{...good.prompt.source,sourcePrinting:'Dialga-GX UPR 100'}},
     {...good.prompt,source:{...good.prompt.source,sourceKind:'engine'}},
     {...good.prompt,source:{...good.prompt.source,sourcePrinting:'Regidrago VSTAR SIT 999'}},
     {...good.prompt,source:{...good.prompt.source,effectName:'Copycat'}}
   ]){
     assert.ok(decide(seat,{...good,prompt:tampered}).kind==='abstain');
   }
 }
});
test('Net Ball only searches Grass Energy, never Dragon-type Regidrago V',()=>{
 for(const seat of [0,1]){
   const obs=observation(seat),req=promptRequest(
     seat,obs,'Net Ball',P.net,'ChooseCardsPrompt',[
      choice('dragon',P.v),choice('grass','Grass Energy MEE 9'),
      choice('other','Fire Energy MEE 10')],{
      selectionType:'card-combination',minimumCount:1,maximumCount:1});
   assert.equal(tok(decide(seat,req)),'grass');
 }
});
test('Battle Compressor selects three genuine distinct Dragon donor printings',()=>{
 for(const seat of [0,1]){
   const obs=observation(seat),req=promptRequest(
     seat,obs,'Battle Compressor',P.compressor,'ChooseCardsPrompt',[
      choice('nonsense','Hisuian Goodra VSTAR LOR 136'),
      choice('dialga',P.dialga),choice('noivern',P.noivern),
      choice('dragonV',P.v),choice('dragapult',P.dragapult)],{
      selectionType:'card-combination',minimumCount:1,maximumCount:3});
   const chosen=decide(seat,req);
   assert.deepEqual(chosen,{kind:'select-choices',tokens:['dialga','dragapult','noivern']});
 }
});
test('engine setup: go second, preserve entering-the-Bench support Pokemon',()=>{
 for(const seat of [0,1]){
   const empty=observation(seat,{phase:1,globalTurn:0,
     ownPublic:{...observation(seat).ownPublic,active:null,bench:[]}});
   const first=promptRequest(seat,empty,'CHOOSE_STARTING_POKEMONS',null,
     'ChooseCardsPrompt',[
       choice('ded',P.dedenne,{sourceZone:'hand',selectionIndex:0,selectedCount:1}),
       choice('v',P.v,{sourceZone:'hand',selectionIndex:1,selectedCount:1}),
       choice('budew',P.budew,{sourceZone:'hand',selectionIndex:2,selectedCount:1})
     ],{selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
       isOwnerVisible:true,isSecret:false,allowCancel:false,minimumCount:1,
       maximumCount:6},{engine:true});
   assert.deepEqual(decide(seat,first),{kind:'select-choices',tokens:['v']});
   const extra=promptRequest(seat,{
     ...empty,ownPublic:{...empty.ownPublic,active:pokemon(P.v)}
   },'CHOOSE_STARTING_POKEMONS',null,'ChooseCardsPrompt',[
     choice('ded',P.dedenne,{sourceZone:'hand',selectionIndex:0,selectedCount:1}),
     choice('budew',P.budew,{sourceZone:'hand',selectionIndex:1,selectedCount:1}),
     {kind:'empty-selection',token:'empty',label:'Choose no items'}
   ],{selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
     isOwnerVisible:true,isSecret:false,allowCancel:false,minimumCount:0,
     maximumCount:5},{engine:true});
   assert.deepEqual(decide(seat,extra),{kind:'select-choices',tokens:['budew']});
   const no=promptRequest(seat,empty,'GO_FIRST',null,'ConfirmPrompt',[
     {kind:'confirm',token:'yes',label:'Yes'},
     {kind:'confirm',token:'no',label:'No'}],{},{engine:true});
   assert.equal(tok(decide(seat,no)),'no');
 }
});
test('engine KO promotion and Prize choices use only exact public tokens',()=>{
 for(const seat of [0,1]){
   const original=observation(seat);
   const own={...original.ownPublic,active:null,
     bench:[pokemon(P.v),pokemon(P.star)],discard:[P.dialga]};
   const obs={...original,ownPublic:own};
   const promotion=promptRequest(seat,obs,'CHOOSE_NEW_ACTIVE_POKEMON',null,
     'ChoosePokemonPrompt',[
       {kind:'pokemon',token:'v',publicMetadata:{ownerSeat:'actor',
         targetZone:'bench',benchIndex:0}},
       {kind:'pokemon',token:'vstar',publicMetadata:{ownerSeat:'actor',
         targetZone:'bench',benchIndex:1}}
     ],{selectionType:'pokemon',minimumCount:1,maximumCount:1},{engine:true});
   assert.deepEqual(decide(seat,promotion),{kind:'select-choices',tokens:['vstar']});
   const prize=promptRequest(seat,obs,'CHOOSE_PRIZE_CARD',null,
     'ChoosePrizePrompt',[
       {kind:'prize',token:'p1'}, {kind:'prize',token:'p2'},
       {kind:'prize',token:'p3'}
     ],{selectionType:'prize-slots',minimumCount:2,maximumCount:2},{engine:true});
   assert.deepEqual(decide(seat,prize),{kind:'select-choices',tokens:['p1','p2']});
 }
});
test('unsupported engine prompt and role mismatch fail closed',()=>{
 for(const seat of [0,1]){
   const obs=observation(seat,{phase:1}),prompt=promptRequest(
     seat,obs,'UNRECOGNIZED',null,'ChooseCardsPrompt',[],{}, {engine:true});
   assert.equal(decide(seat,prompt).reasonCode,'UNSUPPORTED_ENGINE_SETUP_PROMPT');
   assert.equal(policy(seat).decide({...prompt,seat:1-seat}).reasonCode,
     'ROLE_SEAT_BINDING_MISMATCH');
 }
});
test('native protocol accepts bounded real root and prompt decisions',()=>{
  for(const seat of [0,1]){
    const obs=observation(seat),actions=[
      action('quick','play-card',P.quick),
      action('pass','pass','Pass')];
    const rootResult=root(seat,obs,actions);
    assert.deepEqual(validateDecision(rootResult,null,new Set(actions.map(x=>x.token))),rootResult);
    const net=promptRequest(seat,obs,'Net Ball',P.net,'ChooseCardsPrompt',[
      choice('grass','Grass Energy MEE 9'),
      choice('dragon',P.v)
    ],{selectionType:'card-combination',minimumCount:1,
      maximumCount:1,allowCancel:false});
    const validated=validatePrompt(net.prompt,seat);
    const result=decide(seat,net);
    assert.deepEqual(result,{kind:'select-choices',tokens:['grass']});
    assert.deepEqual(validateDecision(result,validated,new Set()),result);
    const donor={...obs.ownPublic,discard:[P.noivern,P.dialga]};
    const apex=promptRequest(seat,{...obs,ownPublic:donor},
      'Apex Dragon',P.star,'ChooseAttackPrompt',[
        choice('covert',P.noivern,{sourceZone:'discard',
          sourceAttack:'Covert Flight'},'attack'),
        choice('gx',P.dialga,{sourceZone:'discard',
          sourceAttack:'Timeless-GX'},'attack')
      ],{selectionType:'attack',count:2,allowCancel:false});
    const validatedAttack=validatePrompt(apex.prompt,seat);
    const resultAttack=decide(seat,apex);
    assert.deepEqual(resultAttack,{kind:'select-choice',token:'gx'});
    assert.deepEqual(validateDecision(resultAttack,validatedAttack,new Set()),resultAttack);
    const startObs=observation(seat,{phase:1,
      ownPublic:{...obs.ownPublic,active:null,bench:[]}});
    const start=promptRequest(seat,startObs,'CHOOSE_STARTING_POKEMONS',null,
      'ChooseCardsPrompt',[
       choice('v',P.v,{sourceZone:'hand',selectionIndex:0,selectedCount:1}),
       choice('budew',P.budew,{sourceZone:'hand',selectionIndex:1,selectedCount:1})
      ],{selectionType:'card-combination',sourceZone:'hand',
        ownerSeat:'actor',isOwnerVisible:true,isSecret:false,
        allowCancel:false,minimumCount:1,maximumCount:6},{engine:true});
    const pStart=validatePrompt(start.prompt,seat);
    const dStart=decide(seat,start);
    assert.deepEqual(validateDecision(dStart,pStart,new Set()),dStart);
  }
});
test('optional no-donor Compressor uses native empty-selection token; never []',()=>{
 for(const seat of [0,1]){
   const obs=observation(seat,{ownPublic:{
     ...observation(seat).ownPublic,
     discard:[P.dialga,P.dragapult,P.noivern,P.v,P.kyurem]
   }});
   const prompt=promptRequest(seat,obs,'Battle Compressor',P.compressor,
     'ChooseCardsPrompt',[
       choice('not-donor','Professor Sycamore BKP 107'),
       {kind:'empty-selection',token:'none',label:'Choose no items'}
     ],{selectionType:'card-combination',minimumCount:0,
       maximumCount:3,allowCancel:false});
   const p=validatePrompt(prompt.prompt,seat);
   const decision=decide(seat,prompt);
   assert.deepEqual(decision,{kind:'select-choice',token:'none'});
   assert.deepEqual(validateDecision(decision,p,new Set()),decision);
 }
});

test('Net Ball can search Grass Basic Eldegoss V for source-real Happy Match',()=>{
 for(const seat of [0,1]){
   const base=observation(seat);
   const own={...base.ownPublic,discard:['Guzma BUS 115'],bench:[]};
   const obs=observation(seat,{ownPublic:own});
   const make=(ob)=>promptRequest(seat,ob,'Net Ball',P.net,'ChooseCardsPrompt',[
      choice('dragon',P.v),
      choice('grass','Grass Energy MEE 9'),
      choice('eldegoss','Eldegoss V RCL 19')
   ],{selectionType:'card-combination',sourceZone:'deck',ownerSeat:'actor',
      isOwnerVisible:true,minimumCount:1,maximumCount:1,allowCancel:false});
   const recovered=make(obs);
   assert.deepEqual(decide(seat,recovered),
     {kind:'select-choices',tokens:['eldegoss']});
   assert.deepEqual(validateDecision(decide(seat,recovered),
     validatePrompt(recovered.prompt,seat),new Set()),decide(seat,recovered));
   const held=observation(seat,{...obs,ownHand:['Guzma BUS 115']});
   assert.deepEqual(decide(seat,make(held)),
     {kind:'select-choices',tokens:['grass']});
   const path=observation(seat,{ownPublic:{...own,stadium:[P.path]}});
   assert.deepEqual(decide(seat,make(path)),
     {kind:'select-choices',tokens:['grass']});
   const full=observation(seat,{ownPublic:{...own,bench:Array.from(
     {length:5},(_,i)=>pokemon(P.v,{damage:i*10}))}});
   assert.deepEqual(decide(seat,make(full)),
     {kind:'select-choices',tokens:['grass']});
 }
});
test('Quick Ball discard is hand-zone from native metadata, never message heuristics',()=>{
 for(const seat of [0,1]){
   const base=observation(seat);
   const hand=observation(seat,{ownHand:[
      P.v,P.dialga,'Prime Catcher TEF 157']});
   const discardPrompt=promptRequest(seat,hand,'Quick Ball',P.quick,
     'ChooseCardsPrompt',[
       choice('essential-v',P.v,{sourceZone:'hand'}),
       choice('discard-dialga',P.dialga,{sourceZone:'hand'}),
       choice('ace','Prime Catcher TEF 157',{sourceZone:'hand'})
     ],{selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
       isOwnerVisible:true,minimumCount:1,maximumCount:1,allowCancel:false});
   assert.deepEqual(decide(seat,discardPrompt),
     {kind:'select-choices',tokens:['discard-dialga']});
   const forgedZone=promptRequest(seat,hand,'Quick Ball',P.quick,
     'ChooseCardsPrompt',[
       choice('discard-dialga',P.dialga,{sourceZone:'hand'})
     ],{selectionType:'card-combination',sourceZone:'prizes',ownerSeat:'actor',
       isOwnerVisible:true,minimumCount:1,maximumCount:1,allowCancel:false});
   assert.equal(decide(seat,forgedZone).reasonCode,
      'UNTRUSTED_CARD_SELECTION');
   const searchPrompt=promptRequest(seat,base,'Quick Ball',P.quick,
     'ChooseCardsPrompt',[
       choice('vstar',P.star),
       choice('basic',P.v),
       choice('dragapult',P.dragapult)
     ],{selectionType:'card-combination',sourceZone:'deck',
       ownerSeat:'actor',isOwnerVisible:true,minimumCount:1,
       maximumCount:1,allowCancel:false});
   assert.deepEqual(decide(seat,searchPrompt),
     {kind:'select-choices',tokens:['basic']});
   assert.deepEqual(validateDecision(decide(seat,searchPrompt),
     validatePrompt(searchPrompt.prompt,seat),new Set()),decide(seat,searchPrompt));
 }
});
test('Mysterious Treasure cannot search Grass Budew or Lightning Dedenne-GX',()=>{
 for(const seat of [0,1]){
   const obs=observation(seat,{ownPublic:{...observation(seat).ownPublic,
     bench:[pokemon(P.v)]}});
   const treasure=promptRequest(seat,obs,'Mysterious Treasure',
     'Mysterious Treasure FLI 113','ChooseCardsPrompt',[
       choice('budew',P.budew),
       choice('dedenne','Dedenne-GX UNB 57'),
       choice('eldegoss','Eldegoss V RCL 19'),
       choice('vstar',P.star),
       choice('noivern',P.noivern)
     ],{selectionType:'card-combination',sourceZone:'deck',
       ownerSeat:'actor',isOwnerVisible:true,minimumCount:1,
       maximumCount:1,allowCancel:false});
   assert.deepEqual(decide(seat,treasure),
     {kind:'select-choices',tokens:['vstar']});
   assert.deepEqual(validateDecision(decide(seat,treasure),
     validatePrompt(treasure.prompt,seat),new Set()),decide(seat,treasure));
 }
});
