'use strict';
const adapter=require('./agent1-mirror-public-witness-20261127.cjs');
const oracle=require('./agent1-terminal-attack-oracle-20261127.cjs');
const E='Psychic Energy SVE 13', V='Shadow Rider Calyrex V CRE 74', M='Shadow Rider Calyrex VMAX CRE 75', L='Tapu Lele-GX GRI 60', F="Lillie's Clefairy ex JTG 56", G='Guzma BUS 115', GI='Girafarig LOT 94', LA='Latias ex SSP 76', D='Dialga-GX UPR 100', W='Wobbuffet PHF 36', FL='Float Stone BKT 137', SE='VS Seeker PHF 109', NS='Night Stretcher ASC 196';
const restrictions=()=>({cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],blockedAttackNameNextTurn:null,blockedAttackNameUntilLeavesActive:null,onlyAllowedAttackNameNextTurn:null,attackCostIncreaseNextTurn:0,attackCostIncreaseWhileActive:0,cannotRetreat:false,cannotRetreatNextTurn:false,cannotRetreatWhileActive:false,cannotEvolveNextTurn:false});
const globalRestrictions=()=>({gxUsed:false,vstarUsed:false,attackLockTurnsRemaining:0,attackMaxEnergy:null,attackMaxEnergyTurnsRemaining:0,ignoreAttackCostCardTypes:[],ignoreAttackCostTurnsRemaining:0,cannotUseGXAttacks:false,pokemonPlayLocked:false,abilityPokemonPlayLocked:false,evolutionPlayLocked:false,itemPlayLocked:false,supporterPlayLocked:false,stadiumPlayLocked:false,toolPlayLocked:false,energyPlayLocked:false,specialEnergyPlayLocked:false,stadiumAndToolHaveNoEffectTurnsRemaining:0});
function pokemon(printing,energy=0,damage=0,tools=[]){
 const p=adapter.card(printing).pokemon,kind=p[3],ability=kind==='vmax'?'Underworld Door':kind==='latias'?'Skyliner':kind==='clefairy'?'Fairy Zone':null;
 const subtypes=kind==='vmax'?['VMAX']:['Basic'];
 return {printing,name:p[0],hp:p[4],damage,lastPlayedOrEvolvedTurn:2,printed:{stage:kind==='vmax'?'VMAX':'BASIC',subtypes,types:[p[7]?'Psychic':'Dragon'],retreatCost:Array(p[6]).fill('Colorless'),weakness:[],resistance:[]},specialConditions:[],publicRestrictions:restrictions(),evolutionPrintings:kind==='vmax'?[V,printing]:[printing],energies:Array(energy).fill(E),tools,attacks:oracle.CATALOG[kind].map(([name,p,c,k])=>({name,cost:[...Array(p).fill('Psychic'),...Array(c).fill('Colorless')],damage:null,damageCalculation:null,text:null,gxAttack:false,barrage:false})),abilities:ability?[ability]:[],abilityDetails:[],abilitySuppressions:ability?[{abilityName:ability,suppressed:null,reasonCode:null,sourcePrinting:null}]:[]};
}
function player(active,bench,remaining=2,discard=[],stadium=[]){
 return {active,bench:[...bench,...Array(Math.max(0,5-bench.length)).fill(null)],stadium,stadiumDirection:null,discard,lostZone:[],resolvingSupporter:[],publicHand:null,prizeSlots:Array.from({length:remaining},(_,index)=>({index})),publicTurnRestrictions:globalRestrictions(),handCount:4,deckCount:20,prizeCount:remaining};
}
function req(seat,{active=pokemon(M,5),bench=[],target=pokemon(F),targetBench=[pokemon(M)],hand=[E],discard=[],stadium=[],oppStadium=[],remaining=2,profile='hood',turn={}}={}){
 const a=player(active,bench,remaining,discard,stadium),b=player(target,targetBench,4,[],oppStadium);
 a.handCount=hand.length;const n=hand.length+discard.length+stadium.length+[a.active,...a.bench.filter(Boolean)].reduce((z,x)=>z+x.evolutionPrintings.length+x.energies.length+x.tools.length,0);
 a.deckCount=60-n-remaining;
 const observation={actorSeat:seat,turnSeat:seat,globalTurn:8,phase:2,decisionKind:'owner-root',pendingPromptType:null,pendingOwnerDeckSearch:false,ownHand:hand,ownPublic:a,opponentPublic:b,ownTurnResources:{supporterPlayedTurn:0,retreatedTurn:0,extraTurnActive:false,energyPlayedTurn:false,stadiumPlayedTurn:false,stadiumUsedTurn:false,vstarUsed:false,pokemonPlayLocked:false,abilityPokemonPlayLocked:false,evolutionPlayLocked:false,itemPlayLocked:false,supporterPlayLocked:false,stadiumPlayLocked:false,toolPlayLocked:false,energyPlayLocked:false,specialEnergyPlayLocked:false,...turn},ownerK1:null};
 return {schema:'aichi-policy-request-v2',type:'decision',requestId:'test-'+seat,sequence:1,role:'candidate',seat,observationSchema:'aichi-actor-observation-v4-ability-lock-order',observation,prompt:null,publicEventReceipt:null,actionFrontier:{schema:'aichi-action-frontier-v1',items:[{kind:'pass',token:'pass'}]}};
}
const activeAttack=(r,name='Max Geist',token='attack')=>({kind:'attack',token,actorPrinting:r.observation.ownPublic.active.printing,attackName:name,publicMetadata:{attackCostPayable:true,attackSource:{sourceKind:'active-pokemon',sourceSlot:'ACTIVE',sourceIndex:0,sourceCardName:r.observation.ownPublic.active.name,sourceCardFullName:r.observation.ownPublic.active.printing,attackName:name}}});
function play(r,handIndex,zone,index,token='play'){
 const a={kind:'play-card',token,actorPrinting:r.observation.ownHand[handIndex],publicMetadata:{handIndex}};
 if(zone){const slot=zone==='active'?r.observation.ownPublic.active:r.observation.ownPublic.bench[index];a.targetPrinting=slot.printing;Object.assign(a.publicMetadata,{targetSeat:'actor',targetZone:zone,targetIndex:index,isOwnerVisible:true});}return a;
}
function door(r,zone,index,token='door'){
 const s=zone==='active'?r.observation.ownPublic.active:r.observation.ownPublic.bench[index];
 return {kind:'use-ability',token,actorPrinting:s.printing,publicMetadata:{abilityName:'Underworld Door',sourceSeat:'actor',sourceZone:zone,sourceIndex:index}};
}
function receipt(r,used){
 const one=(s,z,i)=>s?{printing:s.printing,movedFromBenchToActiveThisTurn:null,knownAbilityUse:s.abilities.includes('Underworld Door')?[{name:'Underworld Door',usedThisTurn:used(z,i)}]:[]}:null;
 r.publicEventReceipt={version:'agent8-public-event-receipt-v3-turn-stamped',actorSeat:r.seat,turn:r.observation.globalTurn,ownerActive:one(r.observation.ownPublic.active,'active',0),ownerBench:r.observation.ownPublic.bench.map((s,i)=>one(s,'bench',i)),priorOpponentTurnKO:{any:null,byAttack:null},opponentLastTurnAttack:null,opponentLastTurnTurn:null,opponentLastTurnAttacks:null};
}
const run=(r,profile='hood',opts={})=>adapter.recommend(r,profile,{mirrorHistoryCertified:true,...opts});
function known(r,profile='hood',prizedNames=null){
 const counts=adapter.counts(profile),v=r.observation,own=v.ownPublic;
 const seen=[...v.ownHand,...own.discard,...own.lostZone,...own.stadium,...own.resolvingSupporter,...[own.active,...own.bench.filter(Boolean)].flatMap(s=>[...s.evolutionPrintings,...s.energies,...s.tools])];
 for(const p of seen)counts[adapter.card(p).name]--;
 for(const n of prizedNames??Array(own.prizeCount).fill('Mysterious Treasure')){if(counts[n]<=0)throw Error('bad test prize assignment');counts[n]--;}
 const knownPrintings=[];
 for(const [n,k] of Object.entries(counts))if(k>0){
  const p=adapter.PK.find(x=>x[0]===n)??adapter.TR.find(x=>x[0]===n);
  knownPrintings.push({printing:n==='Psychic Energy'?E:n+' '+p[1]+' '+p[2],copies:k});
 }
 v.ownerK1={epoch:4,exactMembershipKnown:true,knownPrintings,invalidationReason:null};
 return r;
}
function deckChoice(printing,token,index){return {kind:'card',token,printing,label:printing,publicMetadata:{selectionIndex:index,selectedCount:1,sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}};}
function searchPrompt(r,source,effect,printingList,min=1,max=1){
 return prompt(r,'ChooseCardsPrompt',source,effect,[...printingList.map((p,i)=>deckChoice(p,'deck-'+i,i)),...(min===0?[{kind:'empty-selection',token:'empty',label:'none'}]:[])],{selectionType:'card-combination',sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true,minimumCount:min,maximumCount:max,allowCancel:false,isSecret:false});
}
function prompt(r,type,sourcePrinting,effectName,choices,meta){
 const observation={...r.observation,decisionKind:'owner-prompt',pendingPromptType:type};
 return {...r,sequence:r.sequence+1,observation,prompt:{schema:'aichi-owner-prompt-projection-v3',actingSeat:r.seat,promptType:type,description:null,source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting,effectName},choices,publicMetadata:meta},actionFrontier:{schema:'aichi-action-frontier-v1',items:[]}};
}
const pokeChoice=(r,seat,index,token)=>({kind:'pokemon',token,printing:(seat==='actor'?r.observation.ownPublic:r.observation.opponentPublic).bench[index].printing,label:'choice',publicMetadata:{ownerSeat:seat,targetZone:'bench',benchIndex:index,selectionIndex:index,selectedCount:1,isOwnerVisible:true}});
function selfTest(protocol,profiles){
 let cases=0;const out=[];
 function assert(p,msg){if(!p)throw Error(msg);cases++;}
 function check(r,status,token,profile='hood',opts={}){
  const x=run(r,profile,opts);
  assert(x.status===status&&(!token||x.decision?.token===token),'wanted '+status+' '+token+': '+JSON.stringify(x));
  if(protocol&&token)protocol.validateDecision(x.decision,null,new Set(r.actionFrontier.items.map(z=>z.token)));
  out.push({seat:r.seat,status:x.status,token:x.decision?.token??null,first:x.first?.kind??null});return x;
 }
 for(const [id,source] of Object.entries(profiles??{})){
  const a=adapter.counts(id),b=Object.fromEntries(source.cards.map(c=>[c.name,c.count]));
  assert(Object.keys(a).every(k=>a[k]===(b[k]??0))&&Object.keys(b).every(k=>a[k]===b[k]),'profile quantities '+id);
 }
 for(const seat of [0,1]){
  let r=req(seat,{active:pokemon(M,5),hand:[E]});r.actionFrontier.items.push(activeAttack(r),play(r,0,'active',0,'attach'));check(r,'certified','attach');
  r=req(seat,{active:pokemon(M,10),target:pokemon(M),remaining:3,hand:[E]});r.actionFrontier.items.push(activeAttack(r),play(r,0,'active',0,'attach'));check(r,'certified','attach');
  r=req(seat,{active:pokemon(M,6),hand:[]});r.actionFrontier.items.push(activeAttack(r));check(r,'certified','attack');
  r.actionFrontier.items[1].kind='projected-attack';check(r,'no-guarantee');
  r=req(seat,{active:pokemon(GI),bench:[null,pokemon(M,6)],target:pokemon(M),targetBench:[null,null,pokemon(L)],hand:[G]});r.actionFrontier.items.push(play(r,0,null,0,'gust'));const gust=check(r,'certified','gust');
  assert(gust.intent.opponent.index===2&&gust.intent.promote.index===1,'physical bench indices');
  const meta={minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false,selectionType:'pokemon'};
  const oppPrompt=prompt(r,'ChoosePokemonPrompt',G,'Guzma',[pokeChoice(r,'opponent',2,'op-lele')],meta);
  const ownPrompt=prompt(r,'ChoosePokemonPrompt',G,'Guzma',[pokeChoice(r,'actor',1,'own-max')],meta);
  for(const [p,tok] of [[oppPrompt,'op-lele'],[ownPrompt,'own-max']]){
   const d=adapter.resolvePrompt(p,gust.intent);assert(d?.tokens?.[0]===tok,'gust prompt '+JSON.stringify(d));if(protocol)protocol.validateDecision(d,p.prompt,new Set());
  }
  ownPrompt.prompt.choices[0].publicMetadata.benchIndex=0;assert(adapter.resolvePrompt(ownPrompt,gust.intent)===null,'wrong physical slot rejected');
  r=req(seat,{active:pokemon(M,6),bench:[pokemon(GI)],target:pokemon(M),targetBench:[pokemon(L)],hand:[G],turn:{retreatedTurn:1}});r.actionFrontier.items.push(play(r,0,null,0,'gust'),activeAttack(r));check(r,'no-guarantee');
  r=req(seat,{active:pokemon(M,3),bench:[null,pokemon(M,2)],hand:[E],turn:{energyPlayedTurn:true}});r.actionFrontier.items.push(door(r,'active',0),activeAttack(r));check(r,'no-guarantee');receipt(r,(z,i)=>z==='active'?false:true);const d=check(r,'certified','door');assert(d.intent.target.index===1,'Door target physical slot');
  const ep=prompt(r,'AttachEnergyPrompt',M,'Underworld Door',[{kind:'energy',token:'bad-target',label:'bad',printing:E,publicMetadata:{sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,energyType:'BASIC',zone:'bench',benchIndex:0,choiceIndex:0,selectedCount:1}},{kind:'energy',token:'good-target',label:'good',printing:E,publicMetadata:{sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,energyType:'BASIC',zone:'bench',benchIndex:1,choiceIndex:1,selectedCount:1}}],{minimumCount:1,maximumCount:1,allowCancel:false,selectionType:'energy-attachment',sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,zone:'bench',energyType:'BASIC',count:2});
  const dd=adapter.resolvePrompt(ep,d.intent);assert(dd?.token==='good-target','native assignment prompt');if(protocol)protocol.validateDecision(dd,ep.prompt,new Set());
  ep.observation.globalTurn++;assert(adapter.resolvePrompt(ep,d.intent)===null,'stale intent rejected');
  r=req(seat,{active:pokemon(M,5),hand:[E]});r.actionFrontier.items.push(activeAttack(r),play(r,0,'active',0,'attach'));r.actionFrontier.items[2].publicMetadata.handIndex=1;check(r,'no-guarantee');
  r.observation.ownPublic.deckCount++;check(r,'unsupported');
  r=req(seat,{active:pokemon(M,5),hand:[E]});r.observation.ownPublic.active.specialConditions=['CONFUSED'];check(r,'unsupported');
  r=req(seat,{active:pokemon(M,5),hand:[E]});r.observation.ownPublic.active.evolutionPrintings=[M];check(r,'unsupported');
  r=req(seat,{active:pokemon(M,3),bench:[pokemon(F)],target:pokemon(D),remaining:2,hand:[]});r.actionFrontier.items.push(activeAttack(r));check(r,'certified','attack');
  r=req(seat,{active:pokemon(M,5),bench:[pokemon(GI,1)],target:pokemon(M),targetBench:[pokemon(L)],hand:[G]});r.actionFrontier.items.push(play(r,0,null,0,'gust'),activeAttack(r));check(r,'no-guarantee');
  r=req(seat,{active:pokemon(M,6),bench:[pokemon(GI,0,0,[FL])],target:pokemon(M),targetBench:[pokemon(L)],hand:[G]});r.actionFrontier.items.push(play(r,0,null,0,'gust'),activeAttack(r));check(r,'certified','gust');
  r=req(seat,{active:pokemon(W,2),target:pokemon(L,0,90),remaining:2,hand:[]});r.actionFrontier.items.push(activeAttack(r,'Psychic Assault'));check(r,'certified','attack','lockbridge');check(r,'unsupported',null,'hood');
  r=req(seat,{active:pokemon(M,5),hand:[NS],discard:[E]});r.actionFrontier.items.push(play(r,0,null,0,'stretcher'),activeAttack(r));const st=check(r,'certified','stretcher');
  const cp=prompt(r,'ChooseCardsPrompt',NS,'Night Stretcher',[{kind:'card',token:'discard-energy',printing:E,label:E,publicMetadata:{selectionIndex:0,selectedCount:1,sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true}}],{selectionType:'card-combination',sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true,minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false});
  const sc=adapter.resolvePrompt(cp,st.intent);assert(sc?.tokens?.[0]==='discard-energy','stretcher target');if(protocol)protocol.validateDecision(sc,cp.prompt,new Set());
  r=req(seat,{active:pokemon(GI),bench:[pokemon(M,6)],target:pokemon(M),targetBench:[pokemon(L)],hand:[SE],discard:[G]});r.actionFrontier.items.push(play(r,0,null,0,'seeker'));check(r,'certified','seeker');
  r.observation.ownPublic.publicTurnRestrictions.itemPlayLocked=true;check(r,'no-guarantee');
  r=req(seat,{active:pokemon(M,5),hand:[E]});assert(adapter.recommend(r,'hood').status==='unsupported','caller history gate');
  const K1={knownSearchCertified:true},fog='Fog Crystal CRE 140',bc='Battle Compressor PHF 92',seal='Forest Seal Stone SIT 156',ar='Arven SVI 166',team='Teammates PRC 141';
  r=req(seat,{active:pokemon(M,5),hand:[fog]});known(r);r.actionFrontier.items.push(play(r,0,null,0,'fog'));
  check(r,'no-guarantee');const fs=check(r,'certified','fog','hood',K1);assert(fs.intent.selection.join(',')==='energy','Fog selection');
  const fp=searchPrompt(r,fog,'Fog Crystal',[E,V]);const fd=adapter.resolvePrompt(fp,fs.intent);assert(fd?.tokens?.[0]==='deck-0','Fog prompt');if(protocol)protocol.validateDecision(fd,fp.prompt,new Set());
  fp.sequence=r.sequence;assert(adapter.resolvePrompt(fp,fs.intent)===null,'stale same-sequence prompt');
  r.observation.ownerK1.invalidationReason='contradiction';check(r,'unsupported',null,'hood',K1);
  r=req(seat,{active:pokemon(GI),bench:[pokemon(M,6)],target:pokemon(M),targetBench:[pokemon(L)],hand:[bc,SE]});known(r);r.actionFrontier.items.push(play(r,0,null,0,'compressor'),play(r,1,null,0,'seeker'));
  const cs=check(r,'certified','compressor','hood',K1);assert(cs.intent.selection.includes('guzma'),'Compressor to Guzma');
  const deck=Array.from(r.observation.ownerK1.knownPrintings).flatMap(x=>Array(x.copies).fill(x.printing));
  const cprompt=searchPrompt(r,bc,'Battle Compressor',deck,0,3);const cd=adapter.resolvePrompt(cprompt,cs.intent);assert(cd?.tokens?.some(x=>cprompt.prompt.choices.find(c=>c.token===x)?.printing===G),'Compressor prompt');if(protocol)protocol.validateDecision(cd,cprompt.prompt,new Set());
  r=req(seat,{active:pokemon(M,5,0,[seal]),hand:[]});known(r);r.actionFrontier.items.push({kind:'use-ability',token:'star',actorPrinting:M,publicMetadata:{sourceSeat:'actor',sourceZone:'active',sourceIndex:0,abilityName:'Star Alchemy'}});
  const ss=check(r,'certified','star','hood',K1);assert(ss.intent.selection.join(',')==='energy','Star choice');
  const sp=searchPrompt(r,seal,'Star Alchemy',[G,E]);const sd=adapter.resolvePrompt(sp,ss.intent);assert(sd?.tokens?.[0]==='deck-1','Star prompt');if(protocol)protocol.validateDecision(sd,sp.prompt,new Set());
  r=req(seat,{active:pokemon(GI),bench:[pokemon(M,5)],hand:[ar]});known(r,'hood',['Forest Seal Stone','Mysterious Treasure']);r.actionFrontier.items.push(play(r,0,null,0,'arven'));
  const av=check(r,'certified','arven','hood',K1);assert(av.intent.selection.includes('fog')&&av.intent.selection.includes('float'),'Arven joint Item/Tool route '+JSON.stringify(av.intent));
  const ap=searchPrompt(r,ar,'Arven',[fog,FL],0,2);const ad=adapter.resolvePrompt(ap,av.intent);assert(ad?.tokens?.length===2,'Arven combined prompt');if(protocol)protocol.validateDecision(ad,ap.prompt,new Set());
  const ai=searchPrompt(r,ar,'Arven',[fog],0,1),at=searchPrompt(r,ar,'Arven',[FL],0,1);assert(adapter.resolvePrompt(ai,av.intent)?.tokens?.[0]==='deck-0'&&adapter.resolvePrompt(at,av.intent)?.tokens?.[0]==='deck-0','Arven split filtered prompts');
  r=req(seat,{active:pokemon(GI),bench:[pokemon(M,5)],hand:[team]});known(r,'hood',['Forest Seal Stone','Mysterious Treasure']);r.actionFrontier.items.push(play(r,0,null,0,'team'));check(r,'no-guarantee',null,'hood',K1);receipt(r,()=>true);r.publicEventReceipt.priorOpponentTurnKO.any=true;
  const tm=check(r,'certified','team','hood',{...K1,optimizeWitness:true});assert(tm.intent.selection.includes('energy')&&tm.intent.selection.includes('float'),'Teammates joint closure '+JSON.stringify(tm.intent));
  r=req(seat,{active:pokemon(M,5),hand:[fog]});known(r,'hood',['Psychic Energy','Psychic Energy']);r.actionFrontier.items.push(play(r,0,null,0,'fog'));r.observation.ownerK1.knownPrintings[0].copies++;check(r,'unsupported',null,'hood',K1);
 }
 return {cases,observations:out.length,results:out};
}
module.exports={selfTest,req,pokemon,activeAttack,play,door,receipt};
if(require.main===module){const protocol=require('../../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');const profiles={hood:require('../candidate-hood-shadow-rider.json'),lockbridge:require('./agent31-lockbridge-shadow-rider-v1.json')};console.log(JSON.stringify(selfTest(protocol,profiles),null,2));}
