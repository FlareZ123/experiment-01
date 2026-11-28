'use strict';
const P=require('../../simulation/evaluation/2026-11/agent29-rank9-tactical-slice.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const D='Darkness Energy MEE 15',Pr='Prism Energy ASC 216',
      T='Telepathic Psychic Energy POR 88',Un='Unown AOR 30',
      Meg='Mega Absol ex MEG 86',Gen='Gengar & Mimikyu-GX TEU 53',
      Vol='Voltorb ROS 21';
const mon=(printing,extra={})=>({
  printing,hp:260,damage:0,energies:[],tools:[],attacks:[],
  specialConditions:[],publicRestrictions:{},abilityDetails:[],
  printed:{stage:'Basic',types:['Psychic'],subtypes:['Basic'],weakness:[],resistance:[]},
  ...extra
});
const obs=seat=>({
  actorSeat:seat,globalTurn:4,ownHand:[T],
  ownPublic:{
    active:mon(Meg,{hp:300,energies:[D,Pr,Pr],
      printed:{stage:'Basic',types:['Darkness'],subtypes:['Basic'],weakness:[],resistance:[]}}),
    bench:[mon(Un,{hp:60})],deckCount:21,prizeCount:6,discard:[],stadium:[],publicTurnRestrictions:{}
  },
  opponentPublic:{active:mon('Shadow Rider Calyrex VMAX CRE 75',{hp:320}),
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
const search=seat=>({
  schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:'ChooseCardsPrompt',
  description:'Telepathic Psychic Energy',
  source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:T,
    effectName:'Telepathic Psychic Energy'},
  choices:[choose('g',Gen),choose('u',Un),
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
  ok(JSON.stringify(answer.tokens)==='["g","u"]',
     'search Gengar + Unown with exact source prompt, seat '+seat);
  // Post-search board with a newly Benched Unown. Use Farewell Letter
  // before taking the already-funded attack; this is synthetic, not Store.
  const after=obs(seat);
  after.ownHand=[];
  after.ownTurnResources.energyPlayedTurn=true;
  after.ownPublic.bench=[
    mon(Un,{hp:60,energies:[T]}),
    mon(Gen,{hp:240}),
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
    ['certified remaining basics Prized',v=>{
       v.ownerK1={exactMembershipKnown:true,
         knownPrintings:[{printing:Un,copies:3},{printing:Gen,copies:1}]};
       return v},T,true],
    ['already holding Energy',v=>{v.ownPublic.bench[0].energies=[D];return v},T,true],
    ['different Energy',v=>{v.ownHand=[D];return v},D,true],
    ['attacker not funded',v=>{v.ownPublic.active.energies=[D];return v},T,false],
    ['final Prize attack',v=>{v.ownPublic.prizeCount=3;
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
console.log('passed '+count+' rank9 Telepathic-to-Unown root/search/Farewell decisions');
