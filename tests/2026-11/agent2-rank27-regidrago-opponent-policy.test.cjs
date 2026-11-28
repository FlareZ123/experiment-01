'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {validateDecision,validatePrompt}=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {POLICY_VERSION,SOURCE_RANK,SOURCE_BLOB_SHA1,SOURCE_PRINTINGS,
  createPolicy,scoreRoot,choosePrompt,donorScore,resolveSourcePrinting,
  energyCoverage,templeIsActive,templeUnlocksApex,
  rank27EnergyAttachScore,finalPrizePrimeTarget,publicPrizeValue}=
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
test('Raihan requires certified actor-owned v5 KO event freshness, including extra turns',()=>{
 for(const seat of [0,1]){
   const obs=observation(seat),items=[
     action('raihan','play-card',P.raihan),action('pass','pass','Pass')];
   const stale={priorOpponentTurnKO:{any:true,byAttack:true}};
   assert.equal(tok(root(seat,obs,items,stale)),'pass');
   const v5={version:'agent47-public-event-receipt-v5-opponent-owned-ko',
     actorSeat:seat,turn:4,opponentLastTurnOwnerCertified:true,
     opponentLastTurnTurn:3,
     priorOpponentTurnKO:{turn:3,any:true,byAttack:false}};
   assert.equal(tok(root(seat,obs,items,v5)),'raihan');
   const noCertification={...v5,opponentLastTurnOwnerCertified:false};
   assert.equal(tok(root(seat,obs,items,noCertification)),'pass');
   const stampedButOld={...v5,priorOpponentTurnKO:{
     ...v5.priorOpponentTurnKO,turn:2}};
   assert.equal(tok(root(seat,obs,items,stampedButOld)),'pass');
   const wrongSeat={...v5,actorSeat:1-seat};
   assert.equal(tok(root(seat,obs,items,wrongSeat)),'pass');
   const earlyReceipt={...v5,turn:3};
   assert.equal(tok(root(seat,obs,items,earlyReceipt)),'pass');
   // Actor can take extra turns after the last opponent-owned turn;
   // correctness requires ownership, not currentTurn-1 arithmetic.
   const extraActor=observation(seat,{globalTurn:6});
   const ownerTurnOlder={...v5,turn:6,opponentLastTurnTurn:3,
     priorOpponentTurnKO:{turn:3,any:true,byAttack:true}};
   assert.equal(tok(root(seat,extraActor,items,ownerTurnOlder)),'raihan');
   // Opponent's extra turn without a KO supersedes the old KO receipt.
   const opponentExtra={...ownerTurnOlder,opponentLastTurnTurn:5};
   assert.equal(tok(root(seat,extraActor,items,opponentExtra)),'pass');
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
   const prizeChoice=(token,index)=>({kind:'prize',token,
     label:'Your Prize slot '+(index+1),
     publicMetadata:{selectionIndex:index,selectedCount:1,
       sourceZone:'prizes',ownerSeat:'actor',isOwnerVisible:false,
       requiredCount:2}});
   const prize=promptRequest(seat,obs,'CHOOSE_PRIZE_CARD',null,
     'ChoosePrizePrompt',[
       prizeChoice('p1',0),prizeChoice('p2',1),prizeChoice('p3',2)
     ],{selectionType:'prize-slots',sourceZone:'prizes',
       ownerSeat:'actor',isOwnerVisible:false,
       requiredCount:2,count:3,allowCancel:false},{engine:true});
   assert.deepEqual(decide(seat,prize),{kind:'select-choices',tokens:['p1','p2']});
   assert.deepEqual(validateDecision(decide(seat,prize),
     validatePrompt(prize.prompt,seat),new Set()),decide(seat,prize));
   const toDiscard={...prize,prompt:{...prize.prompt,
     source:{...prize.prompt.source,effectName:'CHOOSE_PRIZE_CARD_TO_DISCARD'},
     description:'CHOOSE_PRIZE_CARD_TO_DISCARD'}};
   assert.deepEqual(decide(seat,toDiscard),
     {kind:'select-choices',tokens:['p1','p2']});
   const opponentPrize={...prize,prompt:{...prize.prompt,
     publicMetadata:{...prize.prompt.publicMetadata,ownerSeat:'opponent'}}};
   assert.equal(decide(seat,opponentPrize).reasonCode,
     'UNSUPPORTED_ENGINE_SETUP_PROMPT');
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

test('native source-typed support Ability confirmations complete actual recovery chain',()=>{
 for(const seat of [0,1]){
  const original=observation(seat);
  const make=(obs,printing,effectName)=>
   promptRequest(seat,obs,effectName,printing,'ConfirmPrompt',[
    {kind:'confirm',token:'yes',label:'Yes'},
    {kind:'confirm',token:'no',label:'No'}
   ],{selectionType:'confirm'});
  const recovery=observation(seat,{ownPublic:{
    ...original.ownPublic,
    bench:[pokemon('Eldegoss V RCL 19',{abilities:['Happy Match']})],
    discard:['Guzma BUS 115']
  }});
  const confirmation=make(recovery,'Eldegoss V RCL 19','Happy Match');
  assert.deepEqual(decide(seat,confirmation),
   {kind:'select-choice',token:'yes'});
  assert.deepEqual(validateDecision(decide(seat,confirmation),
   validatePrompt(confirmation.prompt,seat),new Set()),decide(seat,confirmation));
  const recovered=promptRequest(seat,recovery,'Happy Match',
    'Eldegoss V RCL 19','ChooseCardsPrompt',[
     choice('guzma','Guzma BUS 115',{sourceZone:'discard'}),
     choice('wrong',P.dialga,{sourceZone:'discard'})
    ],{selectionType:'card-combination',sourceZone:'discard',
      ownerSeat:'actor',isOwnerVisible:true,minimumCount:1,
      maximumCount:1,allowCancel:false});
  assert.deepEqual(decide(seat,recovered),
   {kind:'select-choices',tokens:['guzma']});
  assert.deepEqual(validateDecision(decide(seat,recovered),
   validatePrompt(recovered.prompt,seat),new Set()),decide(seat,recovered));
  const empty={...recovery,ownPublic:{...recovery.ownPublic,discard:[]}};
  assert.deepEqual(decide(seat,make(empty,'Eldegoss V RCL 19','Happy Match')),
   {kind:'select-choice',token:'no'});
  const draw=make(observation(seat,{ownHand:['Grass Energy MEE 9']}),
   P.crobat,'Dark Asset');
  assert.deepEqual(decide(seat,draw),{kind:'select-choice',token:'yes'});
  const handSix=observation(seat,{ownHand:Array(6).fill('Grass Energy MEE 9')});
  assert.deepEqual(decide(seat,make(handSix,P.crobat,'Dark Asset')),
   {kind:'select-choice',token:'no'});
 }
});

test('pinned Twinleaf name+set fullName resolves only unique ledger number',()=>{
 assert.equal(resolveSourcePrinting('Regidrago VSTAR SIT'),
   'Regidrago VSTAR SIT 136');
 assert.equal(resolveSourcePrinting('Net Ball LOT'),'Net Ball LOT 187');
 assert.equal(resolveSourcePrinting('Eldegoss V RCL'),'Eldegoss V RCL 19');
 assert.equal(resolveSourcePrinting('Crispin SCR'),'Crispin SCR 133');
 assert.equal(resolveSourcePrinting('Guzma BUS'),'Guzma BUS 115');
 assert.equal(resolveSourcePrinting('Grass Energy MEE'),'Grass Energy MEE 9');
 assert.equal(resolveSourcePrinting('Regidrago VSTAR SIT 136'),
   'Regidrago VSTAR SIT 136');
 assert.equal(resolveSourcePrinting('Regidrago VSTAR SIT 201'),null);
 assert.equal(resolveSourcePrinting('Ultra Ball MEG 130'),null);
 assert.equal(resolveSourcePrinting('Quick Ball SSH 179'),null);
 assert.equal(resolveSourcePrinting('Fake Card SIT'),null);
});
test('native numberless roots, on-enter prompts and Apex donors remain source-bound',()=>{
 for(const seat of [0,1]){
  const obs=observation(seat);
  const nativeRoots=[
   action('native-quick','play-card','Quick Ball FST'),
   action('wrong-number','play-card','Quick Ball FST 238'),
   action('pass','pass','Pass')];
  assert.equal(tok(root(seat,obs,nativeRoots)),'native-quick');
  assert.equal(scoreRoot(nativeRoots[1],
     rootRequest(seat,obs,nativeRoots)),-Infinity);
  const haveV=observation(seat,{ownPublic:{...obs.ownPublic,
    bench:[pokemon('Regidrago V SIT')]}});
  assert.equal(tok(root(seat,haveV,[
    action('vstar','play-card','Regidrago VSTAR SIT'),
    action('pass','pass','Pass')])),'vstar');
  const discarded=observation(seat,{ownPublic:{...obs.ownPublic,
    discard:['Dialga-GX UPR','Noivern ex PAL']}});
  const prompt=promptRequest(seat,discarded,'Apex Dragon',
    'Regidrago VSTAR SIT','ChooseAttackPrompt',[
     choice('gx','Dialga-GX UPR',{sourceZone:'discard',
       sourceAttack:'Timeless-GX'},'attack'),
     choice('noivern','Noivern ex PAL',{sourceZone:'discard',
       sourceAttack:'Covert Flight'},'attack'),
     choice('wrong','Dialga-GX UPR 146',{sourceZone:'discard',
       sourceAttack:'Timeless-GX'},'attack')
    ],{selectionType:'attack',count:3,allowCancel:false});
  const decision=decide(seat,prompt);
  assert.deepEqual(decision,{kind:'select-choice',token:'gx'});
  assert.deepEqual(validateDecision(decision,
     validatePrompt(prompt.prompt,seat),new Set()),decision);
 }
});

test('Apex GG+F funding counts Double Dragon as exactly two flexible Energy',()=>{
 const g='Grass Energy MEE 9',f='Fire Energy MEE 10',
   d='Double Dragon Energy ROS 97';
 for(const [energy,expected] of [
  [[],0],[[g],1],[[f],1],[[g,g],2],[[g,g,f],3],
  [[d],2],[[d,g],3],[[d,f],3],[[d,d],3],
  [[f,f],1],[[g,g,g],2],[[f,f,g],2],
  [[d,'Muscle Band XY 121'],2],[[d,d,g],3]
 ]){
   assert.equal(energyCoverage(energy),expected,
     'funding '+JSON.stringify(energy));
   assert.equal(energyCoverage(energy.map(x=>x.replace(/ [0-9]+$/,''))),
      expected,'native numberless '+JSON.stringify(energy));
 }
});
test('rank27 energy target identity is actor-owned active or indexed Bench attacker',()=>{
 for(const seat of [0,1]){
  const g='Grass Energy MEE',d='Double Dragon Energy ROS';
  const initial=observation(seat,{ownPublic:{
    ...observation(seat).ownPublic,
    active:pokemon(P.star,{energies:[]}),
    bench:[pokemon(P.v,{energies:[d]})],
    discard:[P.dialga]
  }});
  const energy=(token,printing,zone,idx,target)=>{
    return action(token,'play-card',printing,{
      targetPrinting:target,
      publicMetadata:{cardType:'energy',targetSeat:'actor',
       targetZone:zone,targetIndex:idx}});
  };
  const offered=[
   energy('d-active',d,'active',0,P.star),
   energy('g-bench',g,'bench',0,P.v),
   energy('g-active',g,'active',0,P.star),
   energy('d-support',d,'bench',1,'Crobat V DAA 104'),
   action('pass','pass','Pass')];
  assert.equal(tok(root(seat,initial,offered)),'g-bench');
  const byToken=Object.fromEntries(offered.map(x=>[x.token,x]));
  assert.ok(rank27EnergyAttachScore(byToken['g-bench'],initial)>
    rank27EnergyAttachScore(byToken['d-active'],initial));
  assert.equal(rank27EnergyAttachScore(byToken['d-support'],initial),-Infinity);
  const opp=energy('g-opponent',g,'active',0,P.star);
  opp.publicMetadata.targetSeat='opponent';
  assert.equal(rank27EnergyAttachScore(opp,initial),-Infinity);
  const forged=energy('g-forged',g,'active',0,P.v);
  assert.equal(rank27EnergyAttachScore(forged,initial),-Infinity);
  const malformed=energy('g-missing',g,'bench',-1,P.v);
  assert.equal(rank27EnergyAttachScore(malformed,initial),-Infinity);
 }
});
test('a native two-attachment Apex line outranks unneeded search; no third waste',()=>{
 for(const seat of [0,1]){
  const initial=observation(seat,{ownPublic:{
    ...observation(seat).ownPublic,
    active:pokemon(P.star,{energies:['Double Dragon Energy ROS']}),
    bench:[],discard:[P.noivern]
  }});
  const energy=action('grass','play-card','Grass Energy MEE',{
    targetPrinting:P.star,
    publicMetadata:{cardType:'energy',targetSeat:'actor',
      targetZone:'active',targetIndex:0}});
  const offered=[energy,
   action('quick','play-card',P.quick),
   action('pass','pass','Pass')];
  assert.equal(tok(root(seat,initial,offered)),'grass');
  assert.ok(rank27EnergyAttachScore(energy,initial)>300);
  const full=observation(seat,{ownPublic:{...initial.ownPublic,
    active:pokemon(P.star,{energies:[
      'Double Dragon Energy ROS','Grass Energy MEE']})}});
  assert.equal(rank27EnergyAttachScore(energy,full),-Infinity);
  assert.equal(tok(root(seat,full,offered)),'quick');
 }
});
test('Crispin root funding uses real attacker Energy, not whole-board card count',()=>{
 for(const seat of [0,1]){
  const basic=observation(seat),own={...basic.ownPublic,
   active:pokemon(P.star,{energies:[]}),
   bench:[pokemon('Crobat V DAA 104',{energies:[
     'Grass Energy MEE','Fire Energy MEE','Grass Energy MEE']})]};
  const req=rootRequest(seat,observation(seat,{ownPublic:own}),
    [action('crispin','play-card','Crispin SCR')]);
  assert.equal(scoreRoot(req.actionFrontier.items[0],req),235);
  const ready={...own,active:pokemon(P.star,{energies:[
    'Double Dragon Energy ROS','Fire Energy MEE']})};
  const req2=rootRequest(seat,observation(seat,{ownPublic:ready}),
    [action('crispin','play-card','Crispin SCR')]);
  assert.equal(scoreRoot(req2.actionFrontier.items[0],req2),40);
 }
});

test('rank27 consumes a single mandatory source-bound Celestial Roar composite choice',()=>{
 for(const seat of [0,1]){
  const obs=observation(seat,{phase:3,ownPublic:{
   ...observation(seat).ownPublic,
   active:pokemon('Regidrago V SIT',
      {energies:['Grass Energy MEE']})
  }});
  for(const k of [1,2,3]){
   const p=promptRequest(seat,obs,'Celestial Roar','Regidrago V SIT',
    'AttachEnergyPrompt',[{
     kind:'energy',token:'attach-all-'+k,
     label:'Attach all '+k+' revealed Basic Energy',
     publicMetadata:{sourceZone:'effect-revealed',ownerSeat:'actor',
      isOwnerVisible:true,energyType:'BASIC',zone:'active',
      choiceIndex:0,selectedCount:k}
    }],{selectionType:'energy-attachment',count:1,
      minimumCount:k,maximumCount:k,allowCancel:false,
      sourceZone:'effect-revealed',ownerSeat:'actor',
      isOwnerVisible:true,energyType:'BASIC',zone:'active'});
   const decision=decide(seat,p);
   assert.deepEqual(decision,
      {kind:'select-choice',token:'attach-all-'+k});
   assert.deepEqual(validateDecision(decision,
      validatePrompt(p.prompt,seat),new Set()),decision);
   for(const tampered of [
     {source:{...p.prompt.source,sourcePrinting:'Regidrago V SIT 177'}},
     {source:{...p.prompt.source,sourceKind:'engine'}},
     {publicMetadata:{...p.prompt.publicMetadata,minimumCount:k+1}},
     {publicMetadata:{...p.prompt.publicMetadata,sourceZone:'deck'}},
     {choices:[{...p.prompt.choices[0],publicMetadata:{
       ...p.prompt.choices[0].publicMetadata,ownerSeat:'opponent'}}]}
   ]){
     const bad=decide(seat,{...p,prompt:{...p.prompt,...tampered}});
     assert.equal(bad.kind,'abstain');
   }
  }
 }
});

test('two real source Dialga copies do not crowd out a third unique attack payload',()=>{
 for(const seat of [0,1]){
  const obs=observation(seat);
  const choices=[
   choice('dialga-first',P.dialga),
   choice('dialga-second',P.dialga),
   choice('dragapult',P.dragapult),
   choice('noivern',P.noivern),
   choice('kyurem','Kyurem SFA 47'),
   {kind:'empty-selection',token:'empty',label:'Choose no items'}
  ];
  const request=promptRequest(seat,obs,'Battle Compressor',P.compressor,
   'ChooseCardsPrompt',choices,{
    selectionType:'card-combination',sourceZone:'deck',
    ownerSeat:'actor',isOwnerVisible:true,
    minimumCount:0,maximumCount:3,allowCancel:false});
  const decision=decide(seat,request);
  assert.deepEqual(decision,{kind:'select-choices',
    tokens:['dialga-first','dragapult','noivern']});
  assert.deepEqual(validateDecision(decision,
    validatePrompt(request.prompt,seat),new Set()),decision);
  const already=observation(seat,{ownPublic:{
    ...obs.ownPublic,discard:[P.dialga,P.dragapult,P.noivern]}});
  const reduced=promptRequest(seat,already,'Battle Compressor',
    P.compressor,'ChooseCardsPrompt',choices,{
    selectionType:'card-combination',sourceZone:'deck',ownerSeat:'actor',
    isOwnerVisible:true,minimumCount:0,maximumCount:3,allowCancel:false});
  assert.deepEqual(decide(seat,reduced),
    {kind:'select-choices',tokens:['kyurem']});
  const allDone=observation(seat,{ownPublic:{
    ...obs.ownPublic,discard:[P.dialga,P.dragapult,P.noivern,
      'Kyurem SFA 47','Koraidon ex TEF 120',P.v]}});
  const exhausted={...request,observation:allDone};
  assert.deepEqual(decide(seat,exhausted),
    {kind:'select-choice',token:'empty'});
  assert.deepEqual(validateDecision(decide(seat,exhausted),
    validatePrompt(exhausted.prompt,seat),new Set()),decide(seat,exhausted));
 }
});

test('rank27 Net Ball does not chase dead Eldegoss under source-real Aichi locks',()=>{
 for(const seat of [0,1]){
  const base=observation(seat);
  const own={...base.ownPublic,discard:['Guzma BUS 115'],
    bench:[],stadium:[]};
  const mk=(opponentPublic,ownPublic=own)=>{
   const obs=observation(seat,{ownPublic,opponentPublic});
   return promptRequest(seat,obs,'Net Ball',P.net,'ChooseCardsPrompt',[
    choice('eldegoss','Eldegoss V RCL 19'),
    choice('grass','Grass Energy MEE 9')
   ],{selectionType:'card-combination',sourceZone:'deck',
      ownerSeat:'actor',isOwnerVisible:true,minimumCount:1,
      maximumCount:1,allowCancel:false});
  };
  const none=mk(base.opponentPublic);
  assert.equal(tok(decide(seat,none)),'eldegoss');
  const active=print=>({...base.opponentPublic,active:pokemon(print)});
  for(const printing of [
    'Iron Thorns ex TWM 77','Iron Thorns ex TWM',
    'Wobbuffet PHF 36','Stoutland BCR 122','Galarian Weezing RCL 113'
  ]){
   const request=mk(active(printing));
   assert.equal(tok(decide(seat,request)),'grass',printing);
   assert.deepEqual(validateDecision(decide(seat,request),
     validatePrompt(request.prompt,seat),new Set()),decide(seat,request));
  }
  const withLab=mk({...base.opponentPublic,stadium:['Silent Lab PRC 140']});
  assert.equal(tok(decide(seat,withLab)),'grass');
  const benchGarb=mk({...base.opponentPublic,
   bench:[pokemon('Garbodor BKP 57',{tools:['Float Stone BKT 137']})]});
  assert.equal(tok(decide(seat,benchGarb)),'grass');
  const noTool=mk({...base.opponentPublic,
   bench:[pokemon('Garbodor BKP 57',{tools:[]})]});
  assert.equal(tok(decide(seat,noTool)),'eldegoss');
  const ownLab=mk(base.opponentPublic,{...own,stadium:['Silent Lab PRC 140']});
  assert.equal(tok(decide(seat,ownLab)),'grass');
 }
});

test('last-Prize Prime Catcher beats immediate Apex only with real ready Bench VSTAR',()=>{
 for(const seat of [0,1]){
  const base=observation(seat);
  const own={...base.ownPublic,prizeCount:1,
   bench:[
    pokemon(P.star,{energies:[
     'Double Dragon Energy ROS','Grass Energy MEE']}),
    pokemon(P.budew)
   ],
   discard:[P.dragapult]
  };
  const opp={...base.opponentPublic,bench:[
   pokemon('Pidgeot ex OBF 164',{hp:280,damage:120}),
   pokemon('Arceus VSTAR BRS 123',{hp:280,damage:0})
  ]};
  const obs=observation(seat,{ownPublic:own,opponentPublic:opp});
  assert.equal(finalPrizePrimeTarget(obs)?.index,0);
  const offered=[action('apex','attack',P.star,{attackName:'Apex Dragon'}),
    action('gust','play-card','Prime Catcher TEF'),
    action('pass','pass','Pass')];
  assert.equal(tok(root(seat,obs,offered)),'gust');
  const promptChoice=(token,ownerSeat,index)=>{
    return {kind:'pokemon',token,label:token,publicMetadata:{
      targetZone:'bench',ownerSeat,benchIndex:index,isOwnerVisible:true
    }};
  };
  const oppPrompt=promptRequest(seat,obs,'Prime Catcher','Prime Catcher TEF',
   'ChoosePokemonPrompt',[
     promptChoice('healthy','opponent',1),
     promptChoice('wounded','opponent',0)
   ],{selectionType:'pokemon',minimumCount:1,maximumCount:1,
     allowCancel:false});
  const oppDecision=decide(seat,oppPrompt);
  assert.deepEqual(oppDecision,{kind:'select-choices',tokens:['wounded']});
  assert.deepEqual(validateDecision(oppDecision,
   validatePrompt(oppPrompt.prompt,seat),new Set()),oppDecision);
  const afterGust=observation(seat,{ownPublic:own,opponentPublic:{
    ...opp,active:opp.bench[0],bench:[opp.active,opp.bench[1]]
  }});
  const ownPrompt=promptRequest(seat,afterGust,'Prime Catcher',
   'Prime Catcher TEF','ChoosePokemonPrompt',[
    promptChoice('budew','actor',1),
    promptChoice('ready-star','actor',0)
   ],{selectionType:'pokemon',minimumCount:1,maximumCount:1,
     allowCancel:false});
  const ownDecision=decide(seat,ownPrompt);
  assert.deepEqual(ownDecision,
    {kind:'select-choices',tokens:['ready-star']});
  assert.deepEqual(validateDecision(ownDecision,
   validatePrompt(ownPrompt.prompt,seat),new Set()),ownDecision);
  const noReady=observation(seat,{ownPublic:{...own,
   bench:[pokemon(P.star,{energies:['Grass Energy MEE']})]},
   opponentPublic:opp});
  assert.equal(finalPrizePrimeTarget(noReady),null);
  assert.equal(tok(root(seat,noReady,offered)),'apex');
  const noDonor=observation(seat,{ownPublic:{...own,discard:[P.dialga]},
   opponentPublic:opp});
  assert.equal(finalPrizePrimeTarget(noDonor),null);
  assert.equal(tok(root(seat,noDonor,offered)),'apex');
  const notFinal=observation(seat,{ownPublic:{...own,prizeCount:3},
   opponentPublic:opp});
  assert.equal(finalPrizePrimeTarget(notFinal),null);
  assert.equal(tok(root(seat,notFinal,offered)),'apex');
  const noVictim=observation(seat,{ownPublic:own,
    opponentPublic:{...opp,bench:opp.bench.map(x=>({
     ...x,damage:0}))}});
  assert.equal(finalPrizePrimeTarget(noVictim),null);
  assert.equal(tok(root(seat,noVictim,offered)),'apex');
  const wrong=promptRequest(seat,obs,'Prime Catcher','Prime Catcher TEF',
   'ChoosePokemonPrompt',[
    {kind:'pokemon',token:'fake',publicMetadata:{
      targetZone:'deck',ownerSeat:'opponent',benchIndex:0}}
   ],{selectionType:'pokemon',minimumCount:1,maximumCount:1,
     allowCancel:false});
  assert.equal(decide(seat,wrong).kind,'abstain');
 }
});

test('rank27 Guzma final-Prize route uses two real physical Bench prompt branches',()=>{
 for(const seat of [0,1]){
  const base=observation(seat),own={...base.ownPublic,
    prizeCount:1,bench:[
      pokemon(P.star,{energies:['Double Dragon Energy ROS',
         'Fire Energy MEE']}),
      pokemon(P.budew)
    ],discard:[P.dragapult]
  };
  const opp={...base.opponentPublic,bench:[
    pokemon('Crobat V DAA 104',{hp:180,damage:0}),
    pokemon('Pidgeot ex OBF 164',{hp:280,damage:30})
  ]};
  const obs=observation(seat,{ownPublic:own,opponentPublic:opp});
  const actions=[
    action('guzma','play-card','Guzma BUS'),
    action('apex','attack',P.star,{attackName:'Apex Dragon'}),
    action('pass','pass','Pass')];
  assert.equal(tok(root(seat,obs,actions)),'guzma');
  const ch=(token,ownerSeat,index)=>({
    kind:'pokemon',token,label:token,
    publicMetadata:{targetZone:'bench',ownerSeat,
       benchIndex:index,isOwnerVisible:true}
  });
  const opponent=promptRequest(seat,obs,'Guzma','Guzma BUS',
     'ChoosePokemonPrompt',[
      ch('healthy','opponent',1),ch('knockout','opponent',0)
     ],{selectionType:'pokemon',minimumCount:1,maximumCount:1,
       allowCancel:false});
  const dec1=decide(seat,opponent);
  assert.deepEqual(dec1,{kind:'select-choices',tokens:['knockout']});
  assert.deepEqual(validateDecision(dec1,
    validatePrompt(opponent.prompt,seat),new Set()),dec1);
  const next=observation(seat,{ownPublic:own,opponentPublic:{
    ...opp,active:opp.bench[0],bench:[opp.active,opp.bench[1]]
  }});
  const ally=promptRequest(seat,next,'Guzma','Guzma BUS',
     'ChoosePokemonPrompt',[
       ch('budew','actor',1),ch('vstar','actor',0)
     ],{selectionType:'pokemon',minimumCount:1,maximumCount:1,
       allowCancel:false});
  const dec2=decide(seat,ally);
  assert.deepEqual(dec2,{kind:'select-choices',tokens:['vstar']});
  assert.deepEqual(validateDecision(dec2,
    validatePrompt(ally.prompt,seat),new Set()),dec2);
  const noReady=observation(seat,{ownPublic:{
    ...own,bench:[pokemon(P.star,{energies:['Grass Energy MEE']})]
  },opponentPublic:opp});
  assert.equal(tok(root(seat,noReady,actions)),'apex');
  const forged={...opponent,prompt:{...opponent.prompt,
    choices:[ch('actor','actor',0),ch('opp','opponent',0)]}};
  assert.equal(decide(seat,forged).kind,'abstain');
  const wrongSrc={...opponent,prompt:{...opponent.prompt,
    source:{...opponent.prompt.source,sourcePrinting:'Guzma BUS 999'}}};
  assert.equal(decide(seat,wrongSrc).kind,'abstain');
 }
});

test('exact-source final-Prize gust chooses V at two remaining and VMAX at three',()=>{
 for(const seat of [0,1]){
  const original=observation(seat);
  const donorOwn={...original.ownPublic,
    bench:[pokemon(P.star,{energies:[
      'Double Dragon Energy ROS','Fire Energy MEE']})],
    discard:[P.dragapult]};
  const offered=[
    action('guzma','play-card','Guzma BUS'),
    action('prime','play-card','Prime Catcher TEF'),
    action('apex','attack',P.star,{attackName:'Apex Dragon'}),
    action('pass','pass','Pass')];
  const opp={...original.opponentPublic,bench:[
    pokemon('Mew VMAX FST 114',{hp:310,damage:120,
      printed:{subtypes:['VMAX']}}),
    pokemon('Crobat V DAA 104',{hp:180,damage:0,
      printed:{subtypes:['V']}}),
    pokemon('Arceus VSTAR BRS 123',{hp:280,damage:0,
      printed:{subtypes:['VSTAR']}})
  ]};
  assert.equal(publicPrizeValue(opp.bench[0]),3);
  assert.equal(publicPrizeValue(opp.bench[1]),2);
  assert.equal(publicPrizeValue(opp.bench[2]),2);
  assert.equal(publicPrizeValue(pokemon(P.budew)),1);
  assert.equal(publicPrizeValue(pokemon('Mimikyu GRI 58')),1);
  for(const [remaining,index] of [[1,0],[2,0],[3,0]]){
    const obs=observation(seat,{ownPublic:{...donorOwn,
      prizeCount:remaining},opponentPublic:opp});
    assert.equal(finalPrizePrimeTarget(obs)?.index,index);
    assert.equal(tok(root(seat,obs,offered)),'prime');
  }
  const onlyTwo={...opp,bench:opp.bench.slice(1)};
  const needTwo=observation(seat,{ownPublic:{...donorOwn,prizeCount:2},
    opponentPublic:onlyTwo});
  assert.equal(finalPrizePrimeTarget(needTwo)?.index,0);
  assert.equal(tok(root(seat,needTwo,offered)),'prime');
  const needThree=observation(seat,{ownPublic:{...donorOwn,prizeCount:3},
    opponentPublic:onlyTwo});
  assert.equal(finalPrizePrimeTarget(needThree),null);
  assert.equal(tok(root(seat,needThree,offered)),'apex');
  const protectedOnly={...opp,bench:[pokemon('Mimikyu GRI 58',
    {hp:70,damage:0,printed:{subtypes:['Basic']}})]};
  const immune=observation(seat,{ownPublic:{...donorOwn,prizeCount:1},
    opponentPublic:protectedOnly});
  assert.equal(finalPrizePrimeTarget(immune),null);
  const wrongOwner=observation(seat,{ownPublic:{...donorOwn,
    bench:[]},opponentPublic:opp});
  assert.equal(finalPrizePrimeTarget(wrongOwner),null);
 }
});


test('Temple ASR155 suppresses Double Dragon color funding; replacing it can unlock Apex',()=>{
 for(const seat of [0,1]){
  const starting=observation(seat);
  const funded=[ 'Double Dragon Energy ROS 97','Grass Energy MEE 9' ];
  const active=pokemon(P.star,{energies:funded,
    printed:{types:['Dragon'],subtypes:['VSTAR']}});
  const opp={...starting.opponentPublic,
    bench:[pokemon('Crobat V DAA 104',{hp:180,damage:0,
      printed:{subtypes:['V']}})]};
  const own={...starting.ownPublic,active,bench:[pokemon(P.star,{
    energies:funded,printed:{types:['Dragon'],subtypes:['VSTAR']}})],
    discard:[P.dragapult],prizeCount:2,
    stadium:['Temple of Sinnoh ASR 155']};
  const locked=observation(seat,{ownPublic:own,opponentPublic:opp});
  const without=observation(seat,{ownPublic:{...own,stadium:[]} ,
    opponentPublic:opp});
  assert.equal(energyCoverage(funded),3);
  assert.equal(energyCoverage(funded,true),1);
  assert.equal(energyCoverage(['Grass Energy MEE 9',
    'Grass Energy MEE 9','Fire Energy MEE 10'],true),3);
  assert.equal(templeIsActive(locked),true);
  assert.equal(templeUnlocksApex(locked),true);
  assert.equal(templeIsActive(without),false);
  assert.equal(templeUnlocksApex(without),false);
  assert.equal(finalPrizePrimeTarget(locked),null);
  assert.equal(finalPrizePrimeTarget(without)?.index,0);
  const offered=[
    action('replace','play-card','Parallel City BKT 145'),
    action('quick','play-card',P.quick),
    action('pass','pass','Pass')];
  assert.equal(tok(root(seat,locked,offered)),'replace');
  assert.equal(tok(root(seat,without,offered)),'quick');
  const addDde=action('add','play-card','Double Dragon Energy ROS 97',{
    publicMetadata:{cardType:'energy',targetSeat:'actor',
      targetZone:'active',targetIndex:0},targetPrinting:P.star});
  assert.equal(rank27EnergyAttachScore(addDde,locked),55);
  assert.equal(rank27EnergyAttachScore(addDde,without),-Infinity);
  const noDonor=observation(seat,{ownPublic:{...own,discard:[]},
    opponentPublic:opp});
  assert.equal(templeUnlocksApex(noDonor),false);
  const wrongSet=observation(seat,{ownPublic:{
    ...own,stadium:['Temple of Sinnoh ASR 999']},opponentPublic:opp});
  assert.equal(templeIsActive(wrongSet),false);
  const nativeLabel=observation(seat,{ownPublic:{
    ...own,stadium:['Temple of Sinnoh ASR']},opponentPublic:opp});
  assert.equal(templeIsActive(nativeLabel),true);
  // Path can replace Temple but risks suppressing unused Legacy Star;
  // Parallel is preferred when both options actually exist.
  const path=action('path','play-card',P.path);
  assert.equal(tok(root(seat,locked,[path,offered[0],offered[2]])),
    'replace');
 }
});


test('MEGA ex prints are three-Prize targets, unlike ordinary two-Prize ex',()=>{
 for(const seat of [0,1]){
  const mega=pokemon('Mega Kangaskhan ex MEG 104',{
    hp:300,damage:100,printed:{subtypes:['Basic','MEGA','ex']}});
  assert.equal(publicPrizeValue(mega),3);
  assert.equal(publicPrizeValue(pokemon('Mega Dragonite ex ASC 152',{
    printed:{subtypes:['Basic','MEGA','ex']}})),3);
  assert.equal(publicPrizeValue(pokemon('Mew VMAX FST 114',{
    printed:{subtypes:['VMAX']}})),3);
  assert.equal(publicPrizeValue(pokemon('Trevenant & Dusknoir-GX SMP 217',{
    printed:{subtypes:['TAG TEAM','GX']}})),3);
  assert.equal(publicPrizeValue(pokemon('Squawkabilly ex PAL 169',{
    printed:{subtypes:['Basic','ex']}})),2);
  const original=observation(seat);
  const own={...original.ownPublic,
    bench:[pokemon(P.star,{energies:[
      'Double Dragon Energy ROS 97','Grass Energy MEE 9']})],
    discard:[P.dragapult],prizeCount:3};
  const opp={...original.opponentPublic,bench:[mega]};
  const state=observation(seat,{ownPublic:own,opponentPublic:opp});
  assert.equal(finalPrizePrimeTarget(state)?.index,0);
  const ordinary=pokemon('Squawkabilly ex PAL 169',{hp:160,damage:0,
    printed:{subtypes:['Basic','ex']}});
  assert.equal(finalPrizePrimeTarget(observation(seat,{
    ownPublic:own,opponentPublic:{...opp,bench:[ordinary]}})),null);
 }
});
