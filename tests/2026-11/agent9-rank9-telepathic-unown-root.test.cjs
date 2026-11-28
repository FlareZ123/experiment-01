'use strict';
const P=require('../../simulation/evaluation/2026-11/agent29-rank9-tactical-slice.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const D='Darkness Energy MEE 15',Pr='Prism Energy ASC 216',
      T='Telepathic Psychic Energy POR 88',Un='Unown AOR 30',
      Meg='Mega Absol ex MEG 86',Gen='Gengar & Mimikyu-GX TEU 53',
      Vol='Voltorb ROS 21',Native='Telepath [P] Energy M3';
const mon=(printing,extra={})=>({
  printing,hp:260,damage:0,energies:[],tools:[],attacks:[],
  specialConditions:[],publicRestrictions:{},abilityDetails:[],
  printed:{stage:'Basic',types:['Psychic'],subtypes:['Basic'],weakness:[],resistance:[]},
  ...extra
});
// Rank-6/24/29 original Iron Thorns ex is 230 HP, Fighting-weak;
// nonfinal Claw (200, no Darkness Weakness) is an authentic Aichi class.
const obs=seat=>({
  actorSeat:seat,globalTurn:4,ownHand:[T],
  ownPublic:{
    active:mon(Meg,{hp:300,energies:[D,Pr,Pr],
      printed:{stage:'Basic',types:['Darkness'],subtypes:['Basic'],weakness:[],resistance:[]}}),
    bench:[mon(Un,{hp:60})],deckCount:21,prizeCount:6,discard:[],stadium:[],publicTurnRestrictions:{}
  },
  opponentPublic:{active:mon('Iron Thorns ex TWM 77',{hp:230,
      printed:{stage:'Basic',types:['Lightning'],subtypes:['Basic'],
        weakness:[{type:'Fighting',value:'×2'}],resistance:[]}}),
    bench:[],deckCount:21,prizeCount:6,discard:[],stadium:[],publicTurnRestrictions:{}},
  ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:false}
});
const frontier=(energy=T,payable=true)=>({schema:protocol.FRONTIER_SCHEMA,items:[
  {kind:'play-card',token:'attach',actorPrinting:energy,
    publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0,isOwnerVisible:true}},
  {kind:'attack',token:'attack',actorPrinting:Meg,attackName:'Claw of Darkness',
    publicMetadata:{attackCostPayable:payable}},
  {kind:'pass',token:'pass'}
]});
const choose=(token,printing)=>({kind:'card',token,printing,label:printing,
  publicMetadata:{ownerSeat:'actor',sourceZone:'deck',isOwnerVisible:true}});
const search=(seat,printing=T)=>({
  schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:'ChooseCardsPrompt',
  description:'Telepathic Psychic Energy',
  source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:printing,
    effectName:'Telepathic Psychic Energy'},
  choices:[choose('g',Gen),choose('u1',Un),choose('u2',Un),
    {kind:'empty-selection',token:'empty',label:'Choose no Pokemon'}],
  publicMetadata:{selectionType:'card-combination',sourceZone:'deck',ownerSeat:'actor',
    isOwnerVisible:true,allowCancel:false,isSecret:false,minimumCount:0,maximumCount:2}
});
function decide(pol,o,seq,front,prompt=null){
  const request={role:'opponent',seat:o.actorSeat,sequence:seq,observation:o,
    prompt,actionFrontier:front};
  if(front)protocol.validateFrontier(front);
  if(prompt)protocol.validatePrompt(prompt,o.actorSeat);
  const answer=pol.decide(request);
  protocol.validateDecision(answer,prompt,front?protocol.validateFrontier(front):new Set());
  return answer;
}
let count=0;
const ok=(condition,what)=>{if(!condition)throw Error('Telepathic Unown: '+what);count++;};
for(const seat of [0,1]){
  const o=obs(seat),pol=P.createPolicy({
    role:'opponent',seat,policyVersion:P.POLICY_VERSION,config:{}
  });
  const positive=decide(pol,o,1,frontier());
  ok(positive.kind==='select-action'&&positive.token==='attach',
     'choose Telepathic-to-Unown before nonfinal Claw, seat '+seat);
  const answer=decide(pol,o,2,null,search(seat));
  ok(JSON.stringify(answer.tokens)==='["u1","u2"]',
     'search two disposable Unown rather than expose Gengar, seat '+seat);
  const nativeObs=obs(seat);nativeObs.ownHand=[Native];
  const nativePolicy=P.createPolicy({role:'opponent',seat,
    policyVersion:P.POLICY_VERSION,config:{}});
  const nativeRoot=decide(nativePolicy,nativeObs,1,frontier(Native));
  ok(nativeRoot.token==='attach',
     'native pinned M3 printing selects same search line, seat '+seat);
  const nativeSearch=decide(nativePolicy,nativeObs,2,null,search(seat,Native));
  ok(JSON.stringify(nativeSearch.tokens)==='["u1","u2"]',
     'native M3 prompt source retained and selected, seat '+seat);
  // K0 permits an uncertain Prize configuration. Once the source-bound
  // prompt reveals only Gengar, refuse to expose that three-Prize liability.
  const unknown=obs(seat);
  const emptyPolicy=P.createPolicy({role:'opponent',seat,
    policyVersion:P.POLICY_VERSION,config:{}});
  const pending=decide(emptyPolicy,unknown,1,frontier());
  ok(pending.token==='attach','K0 source-unknown root selected, seat '+seat);
  const emptySearch=search(seat);
  emptySearch.choices=emptySearch.choices.filter(c=>c.token==='g'||c.token==='empty');
  const nothing=decide(emptyPolicy,unknown,2,null,emptySearch);
  ok(nothing.kind==='select-choice'&&nothing.token==='empty',
     'K1 empty search does not expose Gengar, seat '+seat);
  // Post-search board with a newly Benched Unown. Use Farewell Letter
  // before taking the already-funded attack; this is synthetic, not Store.
  const after=obs(seat);
  after.ownHand=[];
  after.ownTurnResources.energyPlayedTurn=true;
  after.ownPublic.bench=[
    mon(Un,{hp:60,energies:[T]}),
    mon(Un,{hp:60}),
    mon(Un,{hp:60})
  ];
  const ability={kind:'use-ability',token:'farewell-new-unown',actorPrinting:Un,
    publicMetadata:{sourceSeat:'actor',sourceZone:'bench',sourceIndex:2,
      abilityName:'Farewell Letter'}};
  const continuation=decide(pol,after,3,{
    schema:protocol.FRONTIER_SCHEMA,items:[
      ability,frontier().items[1],{kind:'pass',token:'pass'}
    ]
  });
  ok(continuation.token===ability.token,
     'new Unown Farewell Letter follows paid search, seat '+seat);
  const cases=[
    ['full Bench',v=>{v.ownPublic.bench.push(...Array.from({length:4},
        ()=>mon(Vol)));return v},T,true],
    ['deck threshold',v=>{v.ownPublic.deckCount=8;return v},T,true],
    ['all Psychic basics exposed',v=>{v.ownPublic.discard=[Un,Un,Un,Gen];return v},T,true],
    ['only risky Gengar remains',v=>{v.ownPublic.discard=[Un,Un,Un];return v},T,true],
    ['certified remaining basics Prized',v=>{
       v.ownerK1={exactMembershipKnown:true,
         knownPrintings:[{printing:Un,copies:3},{printing:Gen,copies:1}]};
       return v},T,true],
    ['already holding Energy',v=>{v.ownPublic.bench[0].energies=[D];return v},T,true],
    ['different Energy',v=>{v.ownHand=[D];return v},D,true],
    ['Temple suppresses Telepathic',v=>{
       v.ownPublic.active.energies=[D,D,Pr];
       v.opponentPublic.stadium=['Temple of Sinnoh ASR 155'];
       return v},T,true],
    ['Silent Lab blocks Farewell Letter',v=>{
       v.opponentPublic.stadium=['Silent Lab PRC 140'];return v},T,true],
    ['explicit Unown ability suppression',v=>{
       v.ownPublic.bench[0].abilitySuppressions=[
         {abilityName:'Farewell Letter',suppressed:true}];return v},T,true],
    ['attacker not funded',v=>{v.ownPublic.active.energies=[D];return v},T,false],
    ['final Prize attack',v=>{v.ownPublic.prizeCount=2;
        v.opponentPublic.active.hp=190;return v},T,true]
  ];
  for(const [what,mut,energy,payable] of cases){
    const v=mut(obs(seat));
    const fresh=P.createPolicy({role:'opponent',seat,
      policyVersion:P.POLICY_VERSION,config:{}});
    const d=decide(fresh,v,1,frontier(energy,payable));
    ok(d.token!=='attach',what+' must not consume setup, seat '+seat);
  }
}


/* When the three-Prize Gengar is ALREADY on Bench, hand-attaching the
 * source's sole Psychic Energy to it can both search two disposable Unown
 * and prepare a backup attack. This does not authorize benching Gengar as a
 * new search target, which would create additional three-Prize exposure. */
for(const seat of [0,1]){
  const o=obs(seat);
  o.ownPublic.bench=[mon(Un,{hp:60}),mon(Gen,{hp:240})];
  const options={schema:protocol.FRONTIER_SCHEMA,items:[
    {kind:'play-card',token:'unown-recipient',actorPrinting:T,
      publicMetadata:{targetSeat:'actor',targetZone:'bench',
        targetIndex:0,isOwnerVisible:true}},
    {kind:'play-card',token:'gengar-recipient',actorPrinting:T,
      publicMetadata:{targetSeat:'actor',targetZone:'bench',
        targetIndex:1,isOwnerVisible:true}},
    frontier().items[1],{kind:'pass',token:'pass'}
  ]};
  const pol=()=>P.createPolicy({role:'opponent',seat,
    policyVersion:P.POLICY_VERSION,config:{}});
  let decision=decide(pol(),o,1,options);
  ok(decision.token==='gengar-recipient',
    'already in-play unfunded Gengar receives search Energy, seat '+seat);
  o.ownPublic.bench[1].energies=['Prism Energy ASC 216'];
  decision=decide(pol(),o,1,options);
  ok(decision.token==='unown-recipient',
    'Gengar already has Energy; avoid redundant Telepath, seat '+seat);
  // Gengar alone is sufficient: the searched Unown can enter an empty Bench.
  const isolated=obs(seat);
  isolated.ownPublic.bench=[mon(Gen,{hp:240})];
  const isolatedOptions={schema:protocol.FRONTIER_SCHEMA,items:[
    {kind:'play-card',token:'gengar-search',actorPrinting:T,
      publicMetadata:{targetSeat:'actor',targetZone:'bench',
        targetIndex:0,isOwnerVisible:true}},
    frontier().items[1],{kind:'pass',token:'pass'}
  ]};
  decision=decide(pol(),isolated,1,isolatedOptions);
  ok(decision.token==='gengar-search',
    'already-Benched Gengar searches first Unown without an Unown target, seat '+seat);
  isolated.ownPublic.bench[0].energies=[T];
  decision=decide(pol(),isolated,1,isolatedOptions);
  ok(decision.token!=='gengar-search',
    'same Gengar cannot receive duplicate search priority, seat '+seat);
}


/* Source-realistic Shadow Rider VMAX KOs are non-final if other opponents
 * remain. Its Darkness Weakness makes Mega Absol's 200-damage Claw a
 * three-Prize KO. Fetch Unown before that same attack, but never defer an
 * actual game-ending three-Prize KO or the opponent's final Active Pokemon. */
for(const seat of [0,1]){
  const shadow=(prizes=6,bench=true)=>{
    const o=obs(seat);o.ownPublic.prizeCount=prizes;
    o.opponentPublic.active=mon('Shadow Rider Calyrex VMAX CRE 75',{hp:320,
      printed:{stage:'VMAX',subtypes:['VMAX'],types:['Psychic'],
        weakness:[{type:'Darkness',value:'×2'}],resistance:[]}});
    o.opponentPublic.bench=bench?
      [mon("Lillie's Clefairy ex JTG 56",{hp:190})]:[];
    return o;
  };
  const check=(o,token,policy)=>{
    const opts={schema:protocol.FRONTIER_SCHEMA,items:[
      {kind:'play-card',token:'telepath-pre-ko',actorPrinting:T,
        publicMetadata:{targetSeat:'actor',targetZone:'bench',
          targetIndex:0,isOwnerVisible:true}},
      {kind:'attack',token:'knockout',actorPrinting:Meg,
        attackName:'Claw of Darkness',
        publicMetadata:{attackCostPayable:true}},
      {kind:'pass',token:'pass'}
    ]};
    const d=decide(policy,o,1,opts);
    ok(d.token===token,'Shadow VMAX '+token+' priority, seat '+seat);
    return opts;
  };
  const p=()=>P.createPolicy({role:'opponent',seat,
    policyVersion:P.POLICY_VERSION,config:{}});
  const ready=shadow();
  const pol=p();
  check(ready,'telepath-pre-ko',pol);
  const chosen=decide(pol,ready,2,null,search(seat));
  ok(JSON.stringify(chosen.tokens)==='["u1","u2"]',
    'weak Shadow VMAX pre-KO search does not expose Gengar, seat '+seat);
  const after=shadow();
  after.ownHand=[];
  after.ownTurnResources.energyPlayedTurn=true;
  after.ownPublic.bench=[mon(Un,{hp:60,energies:[T]}),
    mon(Un,{hp:60}),mon(Un,{hp:60})];
  const ability={kind:'use-ability',token:'unown-draw-before-ko',
    actorPrinting:Un,publicMetadata:{
      sourceSeat:'actor',sourceZone:'bench',sourceIndex:1,
      abilityName:'Farewell Letter'
    }};
  let f={schema:protocol.FRONTIER_SCHEMA,items:[
    ability,{kind:'attack',token:'knockout',actorPrinting:Meg,
      attackName:'Claw of Darkness',
      publicMetadata:{attackCostPayable:true}},
    {kind:'pass',token:'pass'}
  ]};
  const dr=decide(pol,after,3,f);
  ok(dr.token==='unown-draw-before-ko',
    'after physical-search-shaped stage draw before same KO, seat '+seat);
  check(shadow(3,true),'knockout',p());
  check(shadow(6,false),'knockout',p());
  // This source's four Unown can also be played directly from hand.
  // Even without Telepath, a fresh Bench Unown can Farewell once before KO.
  const handheld=shadow();handheld.ownHand=[Un];handheld.ownPublic.bench=[];
  const handOpts={schema:protocol.FRONTIER_SCHEMA,items:[
    {kind:'play-card',token:'bench-hand-unown',actorPrinting:Un,
      publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0,isOwnerVisible:true}},
    {kind:'attack',token:'same-claw-ko',actorPrinting:Meg,
      attackName:'Claw of Darkness',publicMetadata:{attackCostPayable:true}},
    {kind:'pass',token:'pass'}
  ]};
  let handPolicy=p();
  let result=decide(handPolicy,handheld,1,handOpts);
  ok(result.token==='bench-hand-unown',
    'hand-held Unown benches before nonfinal three-Prize KO, seat '+seat);
  const entered=shadow();entered.ownHand=[];
  entered.ownPublic.bench=[mon(Un,{hp:60})];
  const draw={kind:'use-ability',token:'new-unown-farewell',actorPrinting:Un,
    publicMetadata:{sourceSeat:'actor',sourceZone:'bench',
      sourceIndex:0,abilityName:'Farewell Letter'}};
  result=decide(handPolicy,entered,2,{schema:protocol.FRONTIER_SCHEMA,items:[
    draw,handOpts.items[1],handOpts.items[2]
  ]});
  ok(result.token==='new-unown-farewell',
    'fresh hand-Unown draws before the same KO, seat '+seat);
  const ending=shadow(3,true);
  ending.ownHand=[Un];ending.ownPublic.bench=[];
  result=decide(p(),ending,1,handOpts);
  ok(result.token==='same-claw-ko',
    'hand-Unown does not delay final-Prize KO, seat '+seat);
  const suppressed=shadow();
  suppressed.ownHand=[Un];suppressed.ownPublic.bench=[];
  suppressed.opponentPublic.stadium=['Silent Lab PRC 140'];
  result=decide(p(),suppressed,1,handOpts);
  ok(result.token==='same-claw-ko',
    'Silent Lab prevents hand-Unown setup ahead of KO, seat '+seat);
  /* Original four-copy Rescue Carrier engine under a non-final three-Prize
   * Shadow Rider KO. This is a synthetic protocol-valid staged continuation
   * through actor discard, recovered hand, two Bench plays, Farewell and KO.
   * It does not replace real pinned native Store acceptance or played games. */
  const Carrier='Rescue Carrier EVS 154',Vol='Voltorb ROS 21';
  const carrierRequest=(o,pol,seq)=>decide(pol,o,seq,{
    schema:protocol.FRONTIER_SCHEMA,items:[
      {kind:'play-card',token:'carrier-pre-ko',actorPrinting:Carrier},
      {kind:'attack',token:'claw-ko',actorPrinting:Meg,
        attackName:'Claw of Darkness',publicMetadata:{attackCostPayable:true}},
      {kind:'pass',token:'pass'}
    ]
  });
  const initial=shadow();initial.ownPublic.bench=[];
  initial.ownHand=[Carrier];initial.ownPublic.discard=[Un,Un,Vol];
  const carPolicy=p();
  result=carrierRequest(initial,carPolicy,1);
  ok(result.token==='carrier-pre-ko',
    'original Carrier before paid non-final three-Prize KO, seat '+seat);
  const carrierPrompt={
    schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:'ChooseCardsPrompt',
    description:'Rescue Carrier',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:Carrier,effectName:'Rescue Carrier'},
    choices:[
      ...['discard-U1','discard-U2'].map(token=>({
        kind:'card',token,label:Un,printing:Un,
        publicMetadata:{ownerSeat:'actor',sourceZone:'discard',isOwnerVisible:true}
      })),
      {kind:'card',token:'discard-Vol',label:Vol,printing:Vol,
        publicMetadata:{ownerSeat:'actor',sourceZone:'discard',isOwnerVisible:true}},
      {kind:'empty-selection',token:'empty',label:'Choose no Pokemon'}
    ],
    publicMetadata:{selectionType:'card-combination',sourceZone:'discard',ownerSeat:'actor',
      isOwnerVisible:true,allowCancel:false,isSecret:false,minimumCount:0,maximumCount:2}
  };
  result=decide(carPolicy,initial,2,null,carrierPrompt);
  ok(JSON.stringify(result.tokens)==='["discard-U1","discard-U2"]',
    'pre-KO Carrier prioritizes two Unown over Voltorb, seat '+seat);
  for(let stage=0;stage<2;stage++){
    const v=shadow();v.ownPublic.bench=Array.from({length:stage},()=>mon(Un,{hp:60}));
    v.ownHand=Array.from({length:2-stage},()=>Un);v.ownPublic.discard=[Vol];
    const view={schema:protocol.FRONTIER_SCHEMA,items:[
      {kind:'play-card',token:'rebench',actorPrinting:Un,
        publicMetadata:{targetSeat:'actor',targetZone:'bench',
          targetIndex:stage,isOwnerVisible:true}},
      {kind:'attack',token:'claw-ko',actorPrinting:Meg,
        attackName:'Claw of Darkness',publicMetadata:{attackCostPayable:true}},
      {kind:'pass',token:'pass'}
    ]};
    result=decide(carPolicy,v,3+stage,view);
    ok(result.token==='rebench',
      'Carrier-recovered Unown rebenched ahead of nonfinal KO stage '+stage+' seat '+seat);
  }
  for(let stage=0;stage<2;stage++){
    const v=shadow();v.ownPublic.bench=Array.from({length:2-stage},()=>mon(Un,{hp:60}));
    v.ownHand=[];v.ownPublic.discard=[Vol];
    const view={schema:protocol.FRONTIER_SCHEMA,items:[
      {kind:'use-ability',token:'fresh-farewell',actorPrinting:Un,
        publicMetadata:{sourceSeat:'actor',sourceZone:'bench',
          sourceIndex:0,abilityName:'Farewell Letter'}},
      {kind:'attack',token:'claw-ko',actorPrinting:Meg,
        attackName:'Claw of Darkness',publicMetadata:{attackCostPayable:true}},
      {kind:'pass',token:'pass'}
    ]};
    result=decide(carPolicy,v,5+stage,view);
    ok(result.token==='fresh-farewell',
      'Carrier-recovered Unown Farewell ahead of KO stage '+stage+' seat '+seat);
  }
  const noCards=shadow();noCards.ownPublic.bench=[];noCards.ownHand=[];
  result=decide(carPolicy,noCards,7,{
    schema:protocol.FRONTIER_SCHEMA,items:[
      {kind:'attack',token:'claw-ko',actorPrinting:Meg,
        attackName:'Claw of Darkness',publicMetadata:{attackCostPayable:true}},
      {kind:'pass',token:'pass'}
    ]
  });
  ok(result.token==='claw-ko','Carrier/Farewell cycle still attacks, seat '+seat);
  for(const [caseName,mut] of [
    ['final prize',v=>{v.ownPublic.prizeCount=3;return v}],
    ['silent lab',v=>{v.opponentPublic.stadium=['Silent Lab PRC 140'];return v}],
    ['no Unown',v=>{v.ownPublic.discard=[Vol];return v}]
  ]){
    const v=mut(shadow());v.ownPublic.bench=[];v.ownHand=[Carrier];
    if(caseName!=='no Unown')v.ownPublic.discard=[Un,Un];
    result=carrierRequest(v,p(),1);
    ok(result.token==='claw-ko',
      'Carrier does not defer KO under '+caseName+' seat '+seat);
  }

}


/* Public global lock veto. Garbodor's Garbotoxin needs an attached Tool;
 * Alolan Muk's Power of Alchemy is passive; Galarian Weezing's Neutralizing
 * Gas is Active-only. All prevent Farewell on a NEW unprotected Basic Unown.
 * A direct, already-paid KO must not be delayed for dead draw routes. */
for(const seat of [0,1]){
  const shadow=()=>{
    const o=obs(seat);
    o.opponentPublic.active=mon('Shadow Rider Calyrex VMAX CRE 75',{hp:320,
      printed:{stage:'VMAX',subtypes:['VMAX'],types:['Psychic'],
        weakness:[{type:'Darkness',value:'×2'}],resistance:[]}});
    o.opponentPublic.bench=[mon("Lillie's Clefairy ex JTG 56",{hp:190})];
    return o;
  };
  const locks=[
    ['Garbotoxin',o=>{
      o.opponentPublic.bench.push(mon('Garbodor BKP 57',{hp:100,
        tools:['Float Stone BKT 137'],abilityDetails:[{name:'Garbotoxin'}],
        printed:{stage:'Stage1',subtypes:['Stage1'],types:['Psychic'],
          weakness:[{type:'Psychic',value:'×2'}],resistance:[]}}));return o;}],
    ['Power of Alchemy',o=>{
      o.opponentPublic.bench.push(mon('Alolan Muk SUM 58',{hp:120,
        abilityDetails:[{name:'Power of Alchemy'}],
        printed:{stage:'Stage1',subtypes:['Stage1'],types:['Darkness'],
          weakness:[],resistance:[]}}));return o;}],
    ['Neutralizing Gas',o=>{
      o.opponentPublic.active=mon('Galarian Weezing RCL 113',{hp:130,
        abilityDetails:[{name:'Neutralizing Gas'}],
        printed:{stage:'Stage1',subtypes:['Stage1'],types:['Darkness'],
          weakness:[],resistance:[]}});return o;}]
  ];
  const reply=(o,actorPrinting,target=false)=>{
    const items=[{kind:'play-card',token:'setup',actorPrinting,
      publicMetadata:target?
        {targetSeat:'actor',targetZone:'bench',
          targetIndex:0,isOwnerVisible:true}:{}}];
    const attack={kind:'attack',token:'attack',actorPrinting:Meg,
      attackName:'Claw of Darkness',publicMetadata:{attackCostPayable:true}};
    return decide(P.createPolicy({role:'opponent',seat,
      policyVersion:P.POLICY_VERSION,config:{}}),o,1,{
      schema:protocol.FRONTIER_SCHEMA,items:[...items,attack,
        {kind:'pass',token:'pass'}]
    });
  };
  for(const [lockName,lock] of locks){
    let o=lock(shadow());o.ownHand=[T];
    ok(reply(o,T,true).token==='attack',
      lockName+' blocks Telepath-to-Unown pre-KO, seat '+seat);
    o=lock(shadow());o.ownHand=[Un];o.ownPublic.bench=[];
    ok(reply(o,Un,true).token==='attack',
      lockName+' blocks hand-Unown pre-KO, seat '+seat);
    o=lock(shadow());o.ownHand=['Rescue Carrier EVS 154'];
    o.ownPublic.bench=[];o.ownPublic.discard=[Un,Un];
    ok(reply(o,'Rescue Carrier EVS 154').token==='attack',
      lockName+' blocks Carrier/Unown pre-KO, seat '+seat);
  }
}

/* Synthetic post-settlement challenge of the original rank-9 four-copy
 * Rescue Carrier engine: once searched Unown cycle into discard, physically
 * replaying recovered copies can unlock two more Farewell Letter draws
 * before the same funded Claw. We stage each public state explicitly; this
 * does NOT claim native Store transition, shuffled deck or won games. */
const Carrier='Rescue Carrier EVS 154';
for(const seat of [0,1]){
  const pol=P.createPolicy({role:'opponent',seat,policyVersion:P.POLICY_VERSION,config:{}});
  const build=()=>{
    const o=obs(seat);o.ownPublic.bench=[mon(Un,{hp:60,energies:[T]})];
    o.ownTurnResources.energyPlayedTurn=true;
    return o;
  };
  let o=build();o.ownHand=[Carrier];o.ownPublic.discard=[Un,Un];
  const attack=frontier().items[1],pass={kind:'pass',token:'pass'};
  const act=(token,printing)=>({kind:'play-card',token,actorPrinting:printing,
    publicMetadata:{targetSeat:'actor',targetZone:'bench',
      targetIndex:o.ownPublic.bench.length,isOwnerVisible:true}});
  let f={schema:protocol.FRONTIER_SCHEMA,items:[
    {kind:'play-card',token:'recover',actorPrinting:Carrier},attack,pass
  ]};
  let d=decide(pol,o,1,f);
  ok(d.token==='recover','Carrier precedes nonfinal Claw after Farewell, seat '+seat);
  const carrierPrompt={
    schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
    promptType:'ChooseCardsPrompt',description:'Rescue Carrier',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:Carrier,effectName:'Rescue Carrier'},
    choices:[
      {kind:'card',token:'recover-1',printing:Un,label:Un,
        publicMetadata:{ownerSeat:'actor',sourceZone:'discard',isOwnerVisible:true}},
      {kind:'card',token:'recover-2',printing:Un,label:Un,
        publicMetadata:{ownerSeat:'actor',sourceZone:'discard',isOwnerVisible:true}},
      {kind:'empty-selection',token:'empty',label:'Choose no Pokemon'}
    ],
    publicMetadata:{selectionType:'card-combination',sourceZone:'discard',
      ownerSeat:'actor',isOwnerVisible:true,allowCancel:false,isSecret:false,
      minimumCount:0,maximumCount:2}
  };
  d=decide(pol,o,2,null,carrierPrompt);
  ok(JSON.stringify(d.tokens)==='["recover-1","recover-2"]',
    'Carrier retrieves two printed Unown from actor discard, seat '+seat);
  for(let i=0;i<2;i++){
    o=build();o.ownHand=Array(2-i).fill(Un);
    o.ownPublic.bench=[mon(Un,{hp:60,energies:[T]}),
      ...Array(i).fill(0).map(()=>mon(Un,{hp:60}))];
    f={schema:protocol.FRONTIER_SCHEMA,items:[act('bench-new',Un),attack,pass]};
    d=decide(pol,o,3+i,f);
    ok(d.token==='bench-new','recovered Unown rebenches before Claw, i '+i+' seat '+seat);
  }
  for(let i=0;i<2;i++){
    o=build();o.ownHand=[];
    o.ownPublic.bench=[mon(Un,{hp:60,energies:[T]}),
      ...Array(2-i).fill(0).map(()=>mon(Un,{hp:60}))];
    const ability={kind:'use-ability',token:'farewell-new',actorPrinting:Un,
      publicMetadata:{sourceSeat:'actor',sourceZone:'bench',
        sourceIndex:1,abilityName:'Farewell Letter'}};
    f={schema:protocol.FRONTIER_SCHEMA,items:[ability,attack,pass]};
    d=decide(pol,o,5+i,f);
    ok(d.token==='farewell-new',
      'recycled Unown reactivates Farewell before Claw, i '+i+' seat '+seat);
  }
  o=build();o.ownHand=[];f={schema:protocol.FRONTIER_SCHEMA,items:[attack,pass]};
  d=decide(pol,o,7,f);
  ok(d.token==='attack','eventual Claw after Carrier cycle, seat '+seat);
}


/* Wondrous Labyrinth Prism Star, an actual rank-6/24/29 source Stadium,
 * adds one Colorless to non-Fairy attacks. Do not pass on the required fourth
 * Energy just because ordinary DDC Claw was previously funded. Conversely
 * do not waste a fifth attachment, and respect actual stadium nullification.
 * Real engine legality still governs which actions appear in the frontier. */
for(const seat of [0,1]){
  const base=()=>{const o=obs(seat);
    o.ownHand=[D];o.ownPublic.bench=[];
    o.opponentPublic.stadium=['Wondrous Labyrinth TEU 158'];
    o.ownPublic.active.energies=[D,Pr,Pr];
    return o;
  };
  const energyChoice=(o,policy)=>{
    const items=[
      {kind:'play-card',token:'attach-fourth',actorPrinting:D,
        publicMetadata:{targetSeat:'actor',targetZone:'active',
          targetIndex:0,isOwnerVisible:true}},
      {kind:'pass',token:'pass'}
    ];
    return decide(policy,o,1,{schema:protocol.FRONTIER_SCHEMA,items});
  };
  const pol=()=>P.createPolicy({role:'opponent',seat,
    policyVersion:P.POLICY_VERSION,config:{}});
  let o=base();
  ok(energyChoice(o,pol()).token==='attach-fourth',
    'Wondrous adds a fourth Colorless to Mega Claw, seat '+seat);
  o=base();o.opponentPublic.stadium=[];
  ok(energyChoice(o,pol()).token==='pass',
    'ordinary three-Energy Mega does not waste attachment, seat '+seat);
  o=base();o.ownPublic.active.energies.push(D);
  ok(energyChoice(o,pol()).token==='pass',
    'Wondrous four-Energy Mega avoids fifth attachment, seat '+seat);
  o=base();o.opponentPublic.publicTurnRestrictions={
    stadiumAndToolHaveNoEffectTurnsRemaining:1
  };
  ok(energyChoice(o,pol()).token==='pass',
    'suppressed Wondrous loses its cost effect, seat '+seat);
  o=base();o.ownTurnResources.energyPlayedTurn=true;
  ok(energyChoice(o,pol()).token==='pass',
    'cannot choose second manual Energy attachment, seat '+seat);
}

console.log('passed '+count+' rank9 Telepathic-to-Unown root/search/Farewell decisions');
