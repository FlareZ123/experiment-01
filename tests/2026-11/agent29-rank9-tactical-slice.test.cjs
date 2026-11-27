'use strict';
const P=require('../../simulation/evaluation/2026-11/agent29-rank9-tactical-slice.cjs');
const count=(function runChecks(P) {
  const D='Darkness Energy MEE 15',Pr='Prism Energy ASC 216', G='Guzma BUS 115', Pl='Plumeria BUS 120', I='Iono PAL 185';
  const mk=(printing,opts={})=>({printing,hp:280,damage:0,energies:[],tools:[],attacks:[],specialConditions:[],publicRestrictions:{},abilityDetails:[],printed:{stage:'BASIC',subtypes:['Basic'],weakness:[],resistance:[]},...opts});
  const mega=opts=>mk('Mega Absol ex MEG 86',{energies:[D,Pr,Pr],...opts});
  const foe=opts=>mk('Shadow Rider Calyrex VMAX CRE 75',{hp:320,...opts});
  const player=(active,bench=[],extra={})=>({active,bench,prizeCount:6,deckCount:20,discard:[],stadium:[],publicTurnRestrictions:{},...extra});
  const obs=(own,opp,hand=[],extra={})=>({actorSeat:0,globalTurn:5,ownPublic:own,opponentPublic:opp,ownHand:hand,ownTurnResources:{supporterPlayedTurn:0},...extra});
  const action=(token,kind,actorPrinting='',more={})=>({token,kind,actorPrinting,publicMetadata:{},...more});
  const attack=(token,a)=>action(token,'attack','Mega Absol ex MEG 86',{attackName:a,publicMetadata:{attackCostPayable:true}});
  const root=(o,items,sequence=1)=>({role:'opponent',seat:o.actorSeat,sequence,observation:o,prompt:null,actionFrontier:{items}});
  const choice=(token,printing,owner,zone,idx=0,kind='pokemon')=>({token,printing,kind,publicMetadata:{ownerSeat:owner,[kind==='pokemon'?'targetZone':'sourceZone']:zone,benchIndex:idx,cardType:kind==='card'?'Energy':undefined}});
  const prompt=(o,seq,source,kind,choices,n=1)=>({role:'opponent',seat:o.actorSeat,sequence:seq,observation:o,prompt:{promptType:kind,source:{sourcePrinting:source},publicMetadata:{selectionType:kind==='ChoosePokemonPrompt'?'pokemon':'card-combination',minimumCount:n,maximumCount:n},choices},actionFrontier:{items:[]}});
  const policy=seat=>P.createPolicy({role:'opponent',seat,policyVersion:P.POLICY_VERSION,config:{}});
  let count=0;
  function eq(actual,expected,label){if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error(label+': '+JSON.stringify(actual)+' != '+JSON.stringify(expected));count++;}
  let o=obs(player(mega()),player(foe({damage:60})));
  eq(policy(0).decide(root(o,[attack('claw','Claw of Darkness'),attack('terminal','Terminal Period')])),{kind:'select-action',token:'terminal'},'exact-six counter KO');
  o=obs(player(mega()),player(foe({damage:50})));
  eq(policy(0).decide(root(o,[attack('terminal','Terminal Period'),attack('claw','Claw of Darkness')])),{kind:'select-action',token:'claw'},'five counters not terminal');
  o=obs(player(mega()),player(foe({damage:300})));
  eq(policy(0).decide(root(o,[attack('terminal','Terminal Period'),attack('claw','Claw of Darkness')])),{kind:'select-action',token:'claw'},'thirty counters not terminal');
  o=obs(player(mega()),player(foe({damage:60,energies:['Mist Energy TEF 161']})));
  eq(policy(0).decide(root(o,[attack('terminal','Terminal Period'),attack('claw','Claw of Darkness')])),{kind:'select-action',token:'claw'},'effect prevention veto');
  const weak=foe({printed:{stage:'VMAX',subtypes:['VMAX'],weakness:[{type:'Darkness',value:'×2'}],resistance:[]}});
  o=obs(player(mega({tools:['Muscle Band XY 121']})),player(weak));
  eq(P.printedDamage(o,o.ownPublic.active,weak,'Claw of Darkness'),440,'muscle before weakness');
  const non=mk('Electrode-GX CES 48',{printed:{stage:'STAGE_1',subtypes:['Stage 1'],weakness:[],resistance:[]},energies:[Pr,Pr]});
  eq(P.payable(non,['darkness','darkness']),false,'Prism not rainbow on evolved Pokémon');
  eq(P.payable(mega({energies:[D,Pr]}),['darkness','darkness','colorless']),false,'one Energy cannot pay twice');
  const basic=mk('Unown AOR 30',{hp:60});
  const cheap=mk('Comfey LOR 79',{hp:70});
  const p0=policy(0);
  o=obs(player(basic,[mega()],{prizeCount:3}),player(cheap,[weak]),[G]);
  eq(p0.decide(root(o,[action('g','play-card',G),action('r','retreat','',{publicMetadata:{targetIndex:0,freeRetreat:true}})])),{kind:'select-action',token:'g'},'gust three-Prize finish versus one-Prize retreat');
  eq(p0.decide(prompt(o,2,G,'ChoosePokemonPrompt',[choice('wrong','Comfey LOR 79','opponent','active'),choice('target',weak.printing,'opponent','bench')])),{kind:'select-choices',tokens:['target']},'Guzma opponent choice multi protocol');
  o={...o,opponentPublic:player(weak,[cheap])};
  eq(p0.decide(prompt(o,3,G,'ChoosePokemonPrompt',[choice('own',mega().printing,'actor','bench')])),{kind:'select-choices',tokens:['own']},'Guzma own continuation');
  o=obs(player(mega(),[basic],{prizeCount:3}),player(cheap,[weak]),[G]);
  eq(policy(0).decide(root(o,[action('g','play-card',G),attack('c','Claw of Darkness')])),{kind:'select-action',token:'c'},'do not assume Guzma preserves Active Mega');
  o=obs(player(mega(),[mega()],{prizeCount:3}),player(weak,[weak]),[G]);
  eq(policy(0).decide(root(o,[action('g','play-card',G),attack('c','Claw of Darkness')])),{kind:'select-action',token:'c'},'direct win preserves Supporter');
  const threat=mk('Test attacker TST 1',{hp:300,energies:[D,Pr],attacks:[{name:'Big',damage:'280',cost:['Darkness','Colorless'],gxAttack:false}]});
  const dead='Battle VIP Pass FST 225',mail="Trainers' Mail ROS 92";
  o=obs(player(mega()),player(threat),[Pl,dead,mail,mail]);
  const p1=policy(0);
  eq(p1.decide(root(o,[action('p','play-card',Pl),attack('c','Claw of Darkness'),action('i','play-card',I)])),{kind:'select-action',token:'p'},'Plumeria denies presently payable lethal attack');
  const h=[choice('vip',dead,'actor','hand',0,'card'),choice('mail1',mail,'actor','hand',0,'card'),choice('mail2',mail,'actor','hand',0,'card')];
  eq(p1.decide(prompt(o,2,Pl,'ChooseCardsPrompt',h,2)),{kind:'select-choices',tokens:['vip','mail1']},'exact two affordable discards');
  eq(p1.decide(prompt(o,3,Pl,'ChoosePokemonPrompt',[choice('opp',threat.printing,'opponent','active')])),{kind:'select-choices',tokens:['opp']},'opponent target');
  eq(p1.decide(prompt(o,4,Pl,'ChooseCardsPrompt',[choice('d',D,'opponent','active',0,'card'),choice('pr',Pr,'opponent','active',0,'card')])),{kind:'select-choices',tokens:['d']},'bound opponent Energy continuation');
  o={...o,ownHand:[Pl,dead,D]};
  eq(policy(0).decide(root(o,[action('p','play-card',Pl),attack('c','Claw of Darkness')])),{kind:'select-action',token:'c'},'no two safe discards');
  o=obs(player(mega()),player(mk('Test attacker TST 1',{hp:300,energies:[D,Pr,D],attacks:threat.attacks})),[Pl,dead,mail,mail]);
  eq(policy(0).decide(root(o,[action('p','play-card',Pl),attack('c','Claw of Darkness')])),{kind:'select-action',token:'c'},'surplus Energy defeats denial');
  o=obs(player(mega()),player(threat),[Pl,dead,mail,mail]);
  const p2=policy(0);p2.decide(root(o,[action('p','play-card',Pl)]));p2.decide(prompt(o,2,Pl,'ChooseCardsPrompt',h,2));p2.decide(prompt(o,3,Pl,'ChoosePokemonPrompt',[choice('opp',threat.printing,'opponent','active')]));
  eq(p2.decide(prompt(o,5,Pl,'ChooseCardsPrompt',[choice('d',D,'opponent','active',0,'card')])).reasonCode,'UNTRUSTED_PROMPT_SOURCE','reject stale sequence');
  eq(policy(0).decide(root(o,[action('project','projected-attack','',{attackName:'Claw of Darkness'})])).kind,'abstain','not authorized analysis token');
  eq(policy(0).decide(root(o,[action('bomb','use-ability','Electrode-GX CES 48',{publicMetadata:{abilityName:'Extra Energy Bomb'}})])).reasonCode,'NO_SUPPORTED_ROOT_ACTION','Bomb intentionally not falsely executable');
  const o1={...o,actorSeat:1};
  eq(policy(1).decide(root(o1,[action('p','play-card',Pl)])).token,'p','seat one same relative behavior');
  eq(policy(0).decide(root(o1,[action('p','play-card',Pl)])).reasonCode,'ROLE_SEAT_BINDING_MISMATCH','seat mismatch fails closed');
  return count;
})(P);
console.log('passed '+count+' synthetic assertions');

const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
for(const code of ["BAD_CARD_SELECTION_BOUNDS","UNTRUSTED_PROMPT_SOURCE","UNSUPPORTED_POKEMON_PROMPT","NO_VISIBLE_POKEMON_TARGET","NO_LEGAL_CARD_SET","UNTRUSTED_ENERGY_SELECTION","NO_VISIBLE_ENERGY_CHOICE","UNSUPPORTED_PROMPT_TYPE","NO_SUPPORTED_ROOT_ACTION","ROLE_SEAT_BINDING_MISMATCH"])if(!protocol.isAbstentionReasonCode(code))throw Error('invalid abstention code '+code);

const bombCount=(function tests(P){
 const D='Darkness Energy MEE 15',Pr='Prism Energy ASC 216',T='Telepathic Psychic Energy POR 88';
 const mk=(printing,energies=[],hp=280,damage=0)=>({printing,energies,hp,damage,printed:{stage:'Basic',weakness:[],resistance:[]},tools:[],specialConditions:[],publicRestrictions:{}});
 const M=()=>mk('Mega Absol ex MEG 86'),S=()=>mk('Sableye V SSH 120'),E=()=>({...mk('Electrode-GX CES 48'),printed:{stage:'Stage 1'}}),target=()=>({...mk('Shadow Rider Calyrex VMAX CRE 75',[],320),printed:{stage:'VMAX',weakness:[{type:'Darkness',value:'×2'}],resistance:[]}});
 const obs=(discard,opp=6,own=6)=>({ownPublic:{active:M(),bench:[E(),S()],discard,prizeCount:own},opponentPublic:{active:target(),bench:[],prizeCount:opp}});
 let n=0;function assert(ok,label){if(!ok)throw Error(label);n++}
 let o=obs([Pr,Pr,Pr,D,T]),p=P.bombPlanner(o,0);
 assert(p&&p.required===5&&p.assignments.length===5,'exact five');
 assert(new Set(p.assignments.map(x=>x.discardIndex)).size===5,'distinct occurrences');
 assert(p.assignments.filter(x=>x.zone==='active').length===3,'fund both attackers not overstack');
 assert(p.assignments.filter(x=>x.zone==='bench').every(x=>x.index===1),'never attach to Electrode');
 assert(P.bombPlanner(obs([Pr,Pr,Pr],6,6),0)?.required===3,'legal short count');
 assert(P.bombPlanner(obs([Pr,Pr],6,6),0)===null,'no immediate KO');
 assert(P.bombPlanner(obs([Pr,Pr,Pr],2,3),0)===null,'self-KO immediate loss veto');
 assert(P.bombPlanner(obs([Pr,Pr,Pr],3,3),0)?.immediateWin,'win after self-KO');
 assert(P.bombPlanner(obs([Pr,Pr,Pr],3,6),0)===null,'opponent one Prize left veto');
 o=obs([Pr,Pr,Pr]);o.ownPublic.active.energies=[D,D,Pr];
 assert(P.bombPlanner(o,0)===null,'already funded KO');
 o=obs([Pr,Pr,T]);o.ownPublic.stadium=['Temple of Sinnoh ASR 155'];
 assert(P.bombPlanner(o,0)===null,'unknown special energy modifier veto');
 o=obs([Pr,Pr,Pr,Pr,Pr]);assert(P.bombPlanner(o,0)===null,'source inventory cap');
 o=obs([Pr,Pr,Pr]);o.ownPublic.bench[0].abilitySuppressions=[{abilityName:'Extra Energy Bomb',suppressed:true}];assert(P.bombPlanner(o,0)===null,'ability suppressed');
 o=obs([Pr,Pr,T]);o.opponentPublic.active=mk('Pikachu TST 1',[],60);assert(P.bombPlanner(o,0)===null,'two prizes for one not chosen');
 return n;
})(P);
console.log('passed '+bombCount+' Bomb planner assertions');

const setupCount=(function setupTests(P,protocol){
 const mk=(token,printing,zone='hand',owner='actor')=>({token,kind:'card',printing,label:printing,publicMetadata:{sourceZone:zone,ownerSeat:owner,isOwnerVisible:true}});
 const Meg='Mega Absol ex MEG 86',Un='Unown AOR 30',Vol='Voltorb ROS 21',To='Toedscool PAR 16',De='Dedenne-GX UNB 57';
 const policy=P.createPolicy({role:'opponent',seat:0,policyVersion:P.POLICY_VERSION,config:{}});
 const obs={actorSeat:0,phase:1,ownPublic:{active:null,bench:[null,null,null,null,null]},opponentPublic:{active:null,bench:[]}};
 const pr=(kind,desc,choices,metadata,source=null)=>({schema:protocol.PROMPT_SCHEMA,actingSeat:0,promptType:kind,description:desc,source:{classification:'actor-choice',sourceKind:source?'card-effect':'engine',sourcePrinting:source,effectName:desc},choices,publicMetadata:metadata});
 const md=(minimumCount,maximumCount)=>({selectionType:'card-combination',minimumCount,maximumCount,sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,allowCancel:false,isSecret:false});
 let n=0;
 function check(o,p,expected,label){
   protocol.validatePrompt(p,0);
   const d=policy.decide({role:'opponent',seat:0,sequence:1,observation:o,prompt:p});
   protocol.validateDecision(d,p,new Set());
   if(JSON.stringify(d)!==JSON.stringify(expected))throw Error(label+': '+JSON.stringify(d));
   n++;
 }
 check(obs,pr('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[mk('d',De),mk('v',Vol),mk('m',Meg),mk('u',Un),mk('t',To)],md(1,5)),{kind:'select-choices',tokens:['m','v','t','u']},'setup preserves Dedechange');
 const post={...obs,ownPublic:{active:{printing:Meg},bench:[{printing:Vol},null,null,null,null]}};
 const empty={token:'empty',kind:'empty-selection',label:'Choose no items'};
 check(post,pr('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[mk('d',De),mk('u',Un),empty],md(0,4)),{kind:'select-choices',tokens:['u']},'bonus basics');
 check(post,pr('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[mk('d',De),empty],md(0,4)),{kind:'select-choice',token:'empty'},'keep Dedenne');
 check(obs,pr('ConfirmPrompt','GO_FIRST',[{token:'yes',kind:'confirm',label:'Yes'},{token:'no',kind:'confirm',label:'No'}],{selectionType:'confirm',allowCancel:false}),{kind:'select-choice',token:'yes'},'choose first');
 const opts=[0,1,2].map(i=>({token:'opt'+i,kind:'option',label:'Draw '+(2-i)+' card(s)',publicMetadata:{choiceIndex:i}}));
 check(obs,pr('SelectPrompt','WANT_TO_DRAW_CARDS',opts,{selectionType:'option',allowCancel:false,count:3}),{kind:'select-choice',token:'opt0'},'bonus max');
 const claw={...post,phase:2,opponentPublic:{active:{printing:'Shadow Rider Calyrex V CRE 74'},bench:[]}};
 check(claw,pr('ChooseCardsPrompt','Claw of Darkness',[mk('e','Psychic Energy MEE 13','hand','opponent'),mk('vmax','Shadow Rider Calyrex VMAX CRE 75','hand','opponent')],{...md(1,1),ownerSeat:'opponent'},Meg),{kind:'select-choices',tokens:['vmax']},'remove evolution');
 return n;
})(P,protocol);
console.log('passed '+setupCount+' protocol-validated setup/Claw assertions');

const devCount=(function developmentTests(P,protocol){
 const Meg='Mega Absol ex MEG 86',Vol='Voltorb ROS 21',El='Electrode-GX CES 48',Un='Unown AOR 30',To='Toedscool PAR 16',De='Dedenne-GX UNB 57',VIP='Battle VIP Pass FST 225',C='Battle Compressor PHF 92',UC='Ultra Ball MEG 131',Car='Rescue Carrier EVS 154',D='Darkness Energy MEE 15',Pr='Prism Energy ASC 216',T='Telepathic Psychic Energy POR 88',Opp='Shadow Rider Calyrex V CRE 74';
 const poke=(printing,energies=[])=>({printing,hp:280,damage:0,energies,printed:{stage:'Basic',weakness:[],resistance:[]},tools:[],specialConditions:[],publicRestrictions:{}});
 const view=(h=[],own={})=>({actorSeat:0,globalTurn:1,phase:2,ownHand:h,ownPublic:{active:poke(Un),bench:[null,null,null,null,null],deckCount:25,prizeCount:6,discard:[],publicTurnRestrictions:{},...own},opponentPublic:{active:poke(Opp),bench:[],prizeCount:6},ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:false}});
 const pol=P.createPolicy({role:'opponent',seat:0,policyVersion:P.POLICY_VERSION,config:{}});
 const a=(token,actorPrinting,publicMetadata={},kind='play-card')=>({token,kind,actorPrinting,publicMetadata});
 const card=(token,printing,sourceZone='deck')=>({token,kind:'card',label:printing,printing,publicMetadata:{ownerSeat:'actor',sourceZone,isOwnerVisible:true}});
 const empty={token:'empty',kind:'empty-selection',label:'Choose no items'};
 const pr=(source,cs,min,max,zone)=>({schema:protocol.PROMPT_SCHEMA,actingSeat:0,promptType:'ChooseCardsPrompt',description:source,source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:source,effectName:source},choices:cs,publicMetadata:{selectionType:'card-combination',sourceZone:zone,ownerSeat:'actor',isOwnerVisible:true,allowCancel:false,isSecret:false,minimumCount:min,maximumCount:max}});
 let n=0;
 function root(o,items,token){
   const front={schema:protocol.FRONTIER_SCHEMA,items},allowed=protocol.validateFrontier(front);
   const d=pol.decide({role:'opponent',seat:0,sequence:1,observation:o,prompt:null,actionFrontier:front});
   protocol.validateDecision(d,null,allowed);
   if(d.kind!=='select-action'||d.token!==token)throw Error('root '+JSON.stringify(d)+' != '+token);n++;
 }
 function prompt(o,p,expected){
   protocol.validatePrompt(p,0);const d=pol.decide({role:'opponent',seat:0,sequence:2,observation:o,prompt:p});
   protocol.validateDecision(d,p,new Set());
   if(JSON.stringify(d)!==JSON.stringify(expected))throw Error('prompt '+JSON.stringify(d)+' != '+JSON.stringify(expected));n++;
 }
 let o=view([VIP,Meg,Vol]);
 root(o,[a('vip',VIP),a('mega',Meg),a('vol',Vol)],'vip');
 prompt(o,pr(VIP,[card('m',Meg),card('v',Vol),card('d',De),card('t',To),empty],0,2,'deck'),{kind:'select-choices',tokens:['m','v']});
 o=view([Car],{active:poke(Meg),bench:[poke(Un),poke(Vol),null,null,null],discard:[Un,Un]});
 root(o,[a('carrier',Car),a('farewell',Un,{sourceSeat:'actor',sourceZone:'bench',sourceIndex:0,abilityName:'Farewell Letter'},'use-ability')],'farewell');
 prompt(o,pr(Car,[card('u1',Un,'discard'),card('u2',Un,'discard'),empty],0,2,'discard'),{kind:'select-choices',tokens:['u1','u2']});
 o=view([Pr],{active:poke(Meg,[D,Pr]),bench:[poke(Vol),null,null,null,null]});
 root(o,[a('bad',Pr,{targetSeat:'actor',targetZone:'bench',targetIndex:0,isOwnerVisible:true}),a('good',Pr,{targetSeat:'actor',targetZone:'active',targetIndex:0,isOwnerVisible:true})],'good');
 o={...view([El],{bench:[poke(Vol),null,null,null,null]}),globalTurn:3};
 root(o,[a('evolve',El,{targetSeat:'actor',targetZone:'bench',targetIndex:0,isOwnerVisible:true})],'evolve');
 o=view([C,Pr],{active:poke(Meg),bench:[poke(Vol),null,null,null,null]});
 root(o,[a('comp',C)],'comp');
 prompt(o,pr(C,[card('p1',Pr),card('p2',Pr),card('d',D),card('t',T),empty],0,3,'deck'),{kind:'select-choices',tokens:['p1','p2','d']});
 o=view([UC,Pr,Pr,Pr],{active:poke(Meg),bench:[poke(Vol),null,null,null,null]});
 root(o,[a('ultra',UC)],'ultra');
 prompt(o,pr(UC,[card('p1',Pr,'hand'),card('p2',Pr,'hand'),card('p3',Pr,'hand')],2,2,'hand'),{kind:'select-choices',tokens:['p1','p2']});
 prompt(o,pr(UC,[card('e',El),card('t',To)],1,1,'deck'),{kind:'select-choices',tokens:['e']});
 return n;
})(P,protocol);
console.log('passed '+devCount+' protocol-validated development assertions');

console.log('passed '+(function templeTests(P,protocol){
 const Meg='Mega Absol ex MEG 86',Un='Unown AOR 30',Vol='Voltorb ROS 21',El='Electrode-GX CES 48',D='Darkness Energy MEE 15',Pr='Prism Energy ASC 216',Psy='Psychic Energy MEE 13',Temple='Temple of Sinnoh ASR 155',Opp='Shadow Rider Calyrex VMAX CRE 75',Pl='Plumeria BUS 120',mail="Trainers' Mail ROS 92";
 const mk=(printing,energies=[],hp=280,extra={})=>({printing,energies,hp,damage:0,printed:{stage:'Basic',types:['Darkness'],weakness:[],resistance:[]},tools:[],specialConditions:[],publicRestrictions:{},...extra});
 const vmax=(count)=>mk(Opp,Array(count).fill(Psy),320,{printed:{stage:'VMAX',types:['Psychic'],weakness:[{type:'Darkness',value:'×2'}],resistance:[]},attacks:[{name:'Max Geist',damage:'10+',cost:['Colorless','Colorless','Colorless']}]});
 const obs=(own,opp,hand=[])=>({actorSeat:0,globalTurn:5,ownPublic:{active:own,bench:[],discard:[],prizeCount:6,deckCount:20,publicTurnRestrictions:{}},opponentPublic:{active:opp,bench:[],prizeCount:6,publicTurnRestrictions:{}},ownHand:hand,ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:false}});
 const pol=()=>P.createPolicy({role:'opponent',seat:0,policyVersion:P.POLICY_VERSION,config:{}});
 let n=0;function a(x,label){if(!x)throw Error(label);n++}
 let o=obs(mk(Meg,[D,Pr,Pr]),vmax(3));o.opponentPublic.stadium=[Temple];
 a(P.payable(o.ownPublic.active,['darkness','darkness','colorless'],-1,o)===false,'Prism under Temple not dark');
 a(P.payable(o.ownPublic.active,['darkness','colorless'],-1,o)===true,'one Dark still Terminal');
 o.ownPublic.active.energies=[D,D,Pr];a(P.payable(o.ownPublic.active,['darkness','darkness','colorless'],-1,o)===true,'two Dark + C under Temple');
 o.ownPublic.active.energies=[];o.ownPublic.bench=[mk(El),mk('Sableye V SSH 120')];o.ownPublic.discard=[D,D,Pr];
 a(P.bombPlanner(o,0)?.required===3,'Temple Bomb can use real Darkness + C');
 o=obs(mk(Meg,[D,Pr,Pr]),vmax(3));o.ownPublic.active.specialConditions=[1];const attack={token:'a',kind:'attack',actorPrinting:Meg,attackName:'Claw of Darkness',publicMetadata:{attackCostPayable:true}};
 a(P.rootAttack(attack,o)<400,'numeric confused not guaranteed KO');
 o.ownPublic.active.specialConditions=[0];a(P.rootAttack(attack,o)===0,'numeric paralysis rejected');
 o=obs(mk(Meg),vmax(4),[Pl,mail,mail,mail]);o.opponentPublic.bench=[vmax(5)];
 a(P.denial(o,{zone:'bench',index:0,p:o.opponentPublic.bench[0]})?.score>300,'off-active Psychic removes Max Geist lethal');
 o.opponentPublic.bench=[vmax(6)];a(P.denial(o,{zone:'bench',index:0,p:o.opponentPublic.bench[0]})===null,'spare pool stays lethal');
 o=obs(mk(Meg,[D,Pr]),vmax(3),[D]);o.opponentPublic.stadium=[Temple];
 const attach={token:'dark',kind:'play-card',actorPrinting:D,publicMetadata:{targetSeat:'actor',targetZone:'active',targetIndex:0,isOwnerVisible:true}};
 const fr={schema:protocol.FRONTIER_SCHEMA,items:[attach]},tokens=protocol.validateFrontier(fr);
 const dec=pol().decide({role:'opponent',seat:0,sequence:1,observation:o,prompt:null,actionFrontier:fr});
 protocol.validateDecision(dec,null,tokens);a(dec.token==='dark','manual Dark restores Claw under Temple');
 return n;
})(P,protocol)+' Temple/payment/Max Geist threat assertions');

console.log('passed '+(function mobility(P,protocol){
 const D='Darkness Energy MEE 15',Pr='Prism Energy ASC 216',T='Telepathic Psychic Energy POR 88',Meg='Mega Absol ex MEG 86',Vol='Voltorb ROS 21',Un='Unown AOR 30',Opp='Shadow Rider Calyrex VMAX CRE 75';
 const mk=(printing,energies=[],extra={})=>({printing,energies,hp:280,damage:0,tools:[],printed:{stage:'Basic',retreatCost:['Colorless'],weakness:[],resistance:[]},specialConditions:[],publicRestrictions:{},...extra});
 const all=[D,D,Pr,Pr,Pr,Pr,T],ev=mk('Electrode-GX CES 48',all,{printed:{stage:'Stage 1'}}),tc=mk('Toedscruel PAR 17',all,{printed:{stage:'Stage 1'}});
 let n=0;function a(v,l){if(!v)throw Error(l);n++}
 a(P.payable(ev,['lightning','colorless'])===false,'all source Energy cannot power Electrode attacks');
 a(P.payable(tc,['grass','colorless','colorless'])===false,'all source Energy cannot power Toedscruel');
 a(P.payable(mk('Dedenne-GX UNB 57',[Pr,T]),['lightning','colorless'])===true,'Prism Basic can pay lightning');
 const o={actorSeat:0,globalTurn:5,ownHand:[],ownPublic:{active:mk(Un,[D,Pr,T]),bench:[mk(Meg,[D,Pr,Pr])],prizeCount:3,publicTurnRestrictions:{}},opponentPublic:{active:mk(Opp,[],{hp:320,printed:{weakness:[{type:'Darkness',value:'×2'}],resistance:[]}}),bench:[],prizeCount:6},ownTurnResources:{supporterPlayedTurn:0}};
 const item={token:'r',kind:'retreat',actorPrinting:Un,targetPrinting:Meg,publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0,benchIndex:0,isOwnerVisible:true}};
 const fr={schema:protocol.FRONTIER_SCHEMA,items:[item]},tokens=protocol.validateFrontier(fr);
 const policy=()=>P.createPolicy({role:'opponent',seat:0,policyVersion:P.POLICY_VERSION,config:{}});
 const root=(p,v=o)=>{const d=p.decide({role:'opponent',seat:0,sequence:1,observation:v,prompt:null,actionFrontier:fr});protocol.validateDecision(d,null,tokens);return d};
 const c=(printing,index,ownerSeat='actor')=>({token:'e'+index,kind:'energy',printing,label:printing,publicMetadata:{selectionIndex:index,selectedCount:1,sourceZone:'energy',ownerSeat,isOwnerVisible:true,energyType:'C'}});
 const p={schema:protocol.PROMPT_SCHEMA,actingSeat:0,promptType:'ChooseEnergyPrompt',description:'RETREAT',source:{classification:'actor-choice',sourceKind:'engine',sourcePrinting:null,effectName:'RETREAT'},choices:[c(D,0),c(Pr,1),c(T,2)],publicMetadata:{selectionType:'energy-payment',count:3,energyCount:3,energyType:'C',allowCancel:false}};
 function payment(pol,prompt){protocol.validatePrompt(prompt,0);const d=pol.decide({role:'opponent',seat:0,sequence:2,observation:o,prompt});protocol.validateDecision(d,prompt,new Set());return d;}
 let pol=policy();a(root(pol).token==='r','paid retreat without fictional metadata');
 a(JSON.stringify(payment(pol,p).tokens)===JSON.stringify(['e2']),'only pay actual one colorless, not all three offered');
 pol=policy();root(pol);a(payment(pol,{...p,publicMetadata:{...p.publicMetadata,energyType:'C,C'}}).kind==='abstain','reject wrong required cost');
 pol=policy();root(pol);a(payment(pol,{...p,choices:[c(D,0,'opponent'),c(Pr,1),c(T,2)]}).kind==='abstain','opponent Energy forbidden');
 const free={...o,ownPublic:{...o.ownPublic,active:mk(Un,[],{tools:['Float Stone BKT 137']})}};
 a(root(policy(),free).token==='r','Float Stone authorizes free retreat');
 a(root(policy(),{...free,opponentPublic:{...free.opponentPublic,stadium:['Jamming Tower TWM 153']}}).kind==='abstain','suppressed Float Stone not free');
 return n;
})(P,protocol)+' mobility/source-inventory assertions');

console.log('passed '+(function secondary(P,protocol){
 const D='Darkness Energy MEE 15',Pr='Prism Energy ASC 216',T='Telepathic Psychic Energy POR 88',Meg='Mega Absol ex MEG 86',Gen='Gengar & Mimikyu-GX TEU 53',Sab='Sableye V SSH 120',De='Dedenne-GX UNB 57',Temple='Temple of Sinnoh ASR 155',Stop='PokéStop PGO 68',Lab='Silent Lab PRC 140',Gir='Girafarig LOT 94',Opp='Shadow Rider Calyrex VMAX CRE 75',C='Battle Compressor PHF 92';
 const mk=(printing,energies=[],extra={})=>({printing,energies,hp:280,damage:0,tools:[],printed:{stage:'Basic',types:['Psychic'],weakness:[],resistance:[]},specialConditions:[],publicRestrictions:{},...extra});
 const opp=mk(Opp,[],{hp:320,printed:{weakness:[{type:'Darkness',value:'×2'}],resistance:[]}});
 const o=(p,h=[])=>({actorSeat:0,globalTurn:2,ownPublic:{active:p,bench:[],prizeCount:3,discard:[],publicTurnRestrictions:{}},opponentPublic:{active:opp,bench:[],prizeCount:6,handCount:5},ownHand:h,ownTurnResources:{energyPlayedTurn:false,supporterPlayedTurn:0}});
 const atk=(p,a)=>({kind:'attack',token:'attack',attackName:a,actorPrinting:p.printing,publicMetadata:{attackCostPayable:true}});
 let n=0;function a(v,l){if(!v)throw Error(l);n++}
 let v=o(mk(Gen,[Pr]));a(P.rootAttack(atk(v.ownPublic.active,'Horror House-GX'),v)>=300,'early genuine Horror House option');
 v.opponentPublic.stadium=[Temple];a(P.rootAttack(atk(v.ownPublic.active,'Horror House-GX'),v)===0,'Temple suppresses psychic from Prism');
 v=o(mk(Gen,[Pr,T]));a(P.rootAttack(atk(v.ownPublic.active,'Poltergeist'),v)<400,'no hidden hand guaranteed KO');
 v=o(mk(De,[Pr,T]));a(P.rootAttack(atk(v.ownPublic.active,'Tingly Return-GX'),v)===0,'return GX cannot strand board');
 v.ownPublic.bench=[mk(Meg)];a(P.rootAttack(atk(v.ownPublic.active,'Tingly Return-GX'),v)>P.rootAttack(atk(v.ownPublic.active,'Static Shock'),v),'safe return line');
 v=o(mk(Meg,[Pr,Pr,T]),[Stop,Lab]);v.opponentPublic.stadium=[Temple];a(P.stadiumScore(Stop,v)>=900,'Temple replacement enables winning KO');
 const pol=P.createPolicy({role:'opponent',seat:0,policyVersion:P.POLICY_VERSION,config:{}});
 const f={schema:protocol.FRONTIER_SCHEMA,items:[{kind:'play-card',token:'s',actorPrinting:Stop,publicMetadata:{}},{kind:'play-card',token:'l',actorPrinting:Lab,publicMetadata:{}}]};
 const r=pol.decide({role:'opponent',seat:0,sequence:1,observation:v,prompt:null,actionFrontier:f});protocol.validateDecision(r,null,protocol.validateFrontier(f));a(r.token==='s','actual Stadium replacement root');
 v=o(mk(Sab,[D]));v.opponentPublic.stadium=[Temple];v.ownPublic.discard=[Stop];a(P.rootAttack(atk(v.ownPublic.active,'Lode Search'),v)>0,'one real Dark can recover Stadium');
 v=o(mk(Meg),[C]);v.opponentPublic.bench=[mk(Gir)];v.ownPublic.bench=[mk('Voltorb ROS 21')];
 const ch=(token,printing)=>({token,kind:'card',printing,label:printing,publicMetadata:{ownerSeat:'actor',sourceZone:'deck',isOwnerVisible:true}});
 const pr={schema:protocol.PROMPT_SCHEMA,actingSeat:0,promptType:'ChooseCardsPrompt',description:C,source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:C,effectName:C},choices:[ch('d1',D),ch('d2',D),ch('p',Pr),ch('t',T),{token:'empty',kind:'empty-selection',label:'Choose no items'}],publicMetadata:{selectionType:'card-combination',sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true,allowCancel:false,isSecret:false,minimumCount:0,maximumCount:3}};
 protocol.validatePrompt(pr,0);const d=pol.decide({role:'opponent',seat:0,sequence:2,observation:v,prompt:pr});protocol.validateDecision(d,pr,new Set());a(JSON.stringify(d.tokens)===JSON.stringify(['p']),'protect both Darkness from exposed Get Lost with manual reserve');
 return n;
})(P,protocol)+' secondary-attack/Stadium assertions');

console.log('passed '+(function search(P,protocol){
 const Meg='Mega Absol ex MEG 86',Un='Unown AOR 30',Vol='Voltorb ROS 21',Ball='Hisuian Heavy Ball ASR 146',Box='Secret Box TWM 163',D='Darkness Energy MEE 15',VIP='Battle VIP Pass FST 225',Mail="Trainers' Mail ROS 92",Ultra='Ultra Ball MEG 131',Float='Float Stone BKT 137',Muscle='Muscle Band XY 121',I='Iono PAL 185',G='Guzma BUS 115',Lab='Silent Lab PRC 140',Stop='PokéStop PGO 68';
 const p=(printing,energies=[])=>({printing,energies,hp:60,damage:0,tools:[],specialConditions:[],printed:{stage:'Basic'}});
 const v={actorSeat:0,globalTurn:5,ownPublic:{active:p(Un),bench:[],discard:[],deckCount:20,prizeCount:6,publicTurnRestrictions:{}},opponentPublic:{active:p(Un),bench:[],prizeCount:6},ownTurnResources:{energyPlayedTurn:false,supporterPlayedTurn:0},ownHand:[Box,VIP,VIP,Mail,Mail,D]};
 let n=0;function a(ok,l){if(!ok)throw Error(l);n++}
 const pol=()=>P.createPolicy({role:'opponent',seat:0,policyVersion:P.POLICY_VERSION,config:{}});
 const ch=(token,printing,sourceZone,visible=true)=>({token,kind:'card',printing,label:printing,publicMetadata:{ownerSeat:'actor',sourceZone,isOwnerVisible:visible}});
 const empty={token:'empty',kind:'empty-selection',label:'Choose no items'};
 function run(source,choices,zone,min,max,obs=v){const pr={schema:protocol.PROMPT_SCHEMA,actingSeat:0,promptType:'ChooseCardsPrompt',description:source,source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:source,effectName:source},choices,publicMetadata:{selectionType:'card-combination',sourceZone:zone,ownerSeat:'actor',isOwnerVisible:true,allowCancel:false,isSecret:false,minimumCount:min,maximumCount:max}};protocol.validatePrompt(pr,0);const r=pol().decide({role:'opponent',seat:0,sequence:2,observation:obs,prompt:pr});protocol.validateDecision(r,pr,new Set());return r;}
 function root(obs,printing){const fr={schema:protocol.FRONTIER_SCHEMA,items:[{kind:'play-card',token:'c',actorPrinting:printing,publicMetadata:{}}]};const r=pol().decide({role:'opponent',seat:0,sequence:1,observation:obs,prompt:null,actionFrontier:fr});protocol.validateDecision(r,null,protocol.validateFrontier(fr));return r;}
 a(root(v,Box).token==='c','affordable exact three Box cost');
 a(JSON.stringify(run(Box,[ch('v1',VIP,'hand'),ch('v2',VIP,'hand'),ch('m1',Mail,'hand'),ch('m2',Mail,'hand'),ch('d',D,'hand')],'hand',3,3).tokens)===JSON.stringify(['v1','v2','m1']),'exact Box discard preserve only energy');
 const cs=[ch('mail',Mail,'deck'),ch('ultra',Ultra,'deck'),ch('float',Float,'deck'),ch('muscle',Muscle,'deck'),ch('iono',I,'deck'),ch('g',G,'deck'),ch('lab',Lab,'deck'),ch('stop',Stop,'deck'),empty];
 const picked=run(Box,cs,'deck',0,4).tokens;
 a(picked.length===4&&picked.filter(x=>['mail','ultra'].includes(x)).length===1&&picked.filter(x=>['float','muscle'].includes(x)).length===1&&picked.filter(x=>['iono','g'].includes(x)).length===1&&picked.filter(x=>['lab','stop'].includes(x)).length===1,'one per Box category');
 const k1={...v,ownHand:[Ball],ownerK1:{epoch:1,exactMembershipKnown:true,knownPrintings:[{printing:Meg,copies:1}],invalidationReason:null}};
 a(root(k1,Ball).token==='c','known prized Mega warrants Heavy Ball');
 a(root({...k1,ownerK1:{...k1.ownerK1,knownPrintings:[{printing:D,copies:2}]}},Ball).kind==='abstain','known no useful Basic avoids wasted Ball');
 a(run(Ball,[ch('vol',Vol,'prizes'),ch('mega',Meg,'prizes'),empty],'prizes',0,1,k1).tokens[0]==='mega','revealed actor Prize choice, not guessed slot');
 return n;
})(P,protocol)+' Secret Box/Heavy Ball assertions');

console.log('passed '+(function mobilityBomb(P){
 const Meg='Mega Absol ex MEG 86',Sab='Sableye V SSH 120',El='Electrode-GX CES 48',Un='Unown AOR 30',Pr='Prism Energy ASC 216',D='Darkness Energy MEE 15',T='Telepathic Psychic Energy POR 88',Rope='Escape Rope BST 125',Float='Float Stone BKT 137',G='Guzma BUS 115',Vmax='Shadow Rider Calyrex VMAX CRE 75';
 const mk=(printing,energies=[],extra={})=>({printing,energies,hp:280,damage:0,printed:{stage:'Basic',retreatCost:['Colorless'],weakness:[],resistance:[]},tools:[],specialConditions:[],publicRestrictions:{},...extra});
 const target=mk(Vmax,[],{hp:320,printed:{stage:'VMAX',weakness:[{type:'Darkness',value:'×2'}],resistance:[]}});
 const o=(hand=[],discard=[Pr,Pr,Pr,Pr],ownPrize=3)=>({ownHand:hand,globalTurn:4,ownTurnResources:{supporterPlayedTurn:0,retreatedTurn:false},ownPublic:{active:mk(Un),bench:[mk(El),mk(Meg),mk(Sab)],discard,prizeCount:ownPrize,publicTurnRestrictions:{}},opponentPublic:{active:target,bench:[],prizeCount:6,publicTurnRestrictions:{}}});
 let n=0;function a(v,l){if(!v)throw Error(l);n++}
 let v=o(),p=P.bombPlanner(v,0);
 a(p?.immediateWin&&p.mobility.kind==='retreat'&&p.mobility.payment===1,'Bomb can fund both pivot fee and Benched Mega');
 a(p.assignments.filter(x=>x.zone==='active').length===1&&p.assignments.filter(x=>x.zone==='bench'&&x.index===1).length===3,'allocate exact four to pivot and attacker');
 v=o([Float],[Pr,Pr,Pr]);p=P.bombPlanner(v,0);a(p?.mobility.kind==='float-retreat','Float Stone saves missing fourth Energy');
 v=o([Rope],[Pr,Pr,Pr]);p=P.bombPlanner(v,0);a(p?.mobility.kind==='rope'&&p.immediateWin,'no opposing Bench Rope retains lethal target');
 v.opponentPublic.bench=[mk('Unown AOR 30',[],{hp:60})];a(P.bombPlanner(v,0)===null,'adversarial Rope switches to one-Prize nonfinal target');
 v=o([G],[Pr,Pr,Pr]);v.opponentPublic.active=mk(Un,[],{hp:60});v.opponentPublic.bench=[target];a(P.bombPlanner(v,0)?.mobility.kind==='guzma','Guzma finds guaranteed three-Prize target');
 v=o([Rope],[Pr,Pr,Pr]);v.opponentPublic.bench=[target,target];a(P.bombPlanner(v,0)?.mobility.responses.length===2,'adaptive Rope replies include all opponent choices');
 v=o([], [Pr,Pr,Pr]);v.ownPublic.bench[1].energies=[Pr,Pr,Pr];v.ownPublic.active.energies=[D];a(P.bombPlanner(v,0)===null,'existing paid retreat final win dominates Bomb');
 v=o([Float],[Pr,Pr,Pr]);v.opponentPublic.stadium=['Jamming Tower TWM 153'];a(P.bombPlanner(v,0)===null,'suppressed Float Stone invalidates prospective mobility');
 return n;
})(P)+' Bomb-to-mobility plan assertions');

console.log('passed '+(function ropeTests(P,protocol){
 const D='Darkness Energy MEE 15',Pr='Prism Energy ASC 216',Meg='Mega Absol ex MEG 86',Un='Unown AOR 30',Gen='Gengar & Mimikyu-GX TEU 53',Rope='Escape Rope BST 125',Opp='Shadow Rider Calyrex VMAX CRE 75';
 const mk=(printing,energies=[],extra={})=>({printing,hp:280,damage:0,energies,tools:[],specialConditions:[],publicRestrictions:{},printed:{stage:'Basic',retreatCost:['Colorless'],types:['Darkness'],weakness:[],resistance:[]},...extra});
 const target=mk(Opp,[],{hp:320,printed:{stage:'VMAX',types:['Psychic'],weakness:[{type:'Darkness',value:'×2'}],resistance:[]}});
 const cheap=mk(Un,[],{hp:60});
 const o={actorSeat:0,turnSeat:0,globalTurn:4,ownHand:[Rope],ownTurnResources:{retreatedTurn:false,energyPlayedTurn:false,supporterPlayedTurn:0},ownPublic:{active:cheap,bench:[mk(Meg,[D,Pr,Pr])],prizeCount:3,publicTurnRestrictions:{}},opponentPublic:{active:cheap,bench:[target],prizeCount:6,publicTurnRestrictions:{}}};
 const item={kind:'play-card',actorPrinting:Rope,token:'rope',publicMetadata:{}},f={schema:protocol.FRONTIER_SCHEMA,items:[item]};
 const pol=()=>P.createPolicy({role:'opponent',seat:0,policyVersion:P.POLICY_VERSION,config:{}});
 function root(p,v=o,front=f){const d=p.decide({role:'opponent',seat:0,sequence:1,observation:v,prompt:null,actionFrontier:front});protocol.validateDecision(d,null,protocol.validateFrontier(front));return d;}
 const ch=(token,printing,index)=>({token,kind:'pokemon',printing,label:printing,publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:index,isOwnerVisible:true}});
 const p=(cs)=>({schema:protocol.PROMPT_SCHEMA,actingSeat:0,promptType:'ChoosePokemonPrompt',description:'SWITCH_POKEMON',source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:Rope,effectName:'Escape Rope'},choices:cs,publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,allowCancel:false}});
 function prompt(policy,v,choices){const pr=p(choices);protocol.validatePrompt(pr,0);const d=policy.decide({role:'opponent',seat:0,sequence:2,observation:v,prompt:pr});protocol.validateDecision(d,pr,new Set());return d;}
 let n=0;function a(v,l){if(!v)throw Error(l);n++}
 let policy=pol();a(root(policy).token==='rope','minimax Rope secures guaranteed winning target');
 a(prompt(policy,{...o,opponentPublic:{...o.opponentPublic,active:target,bench:[cheap]}},[ch('m',Meg,0)]).tokens[0]==='m','source-bound actor promotion after opposing switch');
 a(P.ropePlan({...o,opponentPublic:{...o.opponentPublic,bench:[target,cheap]}}).score<1000,'adversarial choice removes claimed final win');
 a(prompt(pol(),o,[ch('m',Meg,0)]).kind==='abstain','own unbound Rope prompt rejected');
 const opAtk={name:'Max Geist',cost:['Colorless','Colorless','Colorless'],damage:'10+'};
 const opp=mk(Opp,Array(9).fill('Psychic Energy MEE 13'),{hp:320,attacks:[opAtk],printed:{stage:'VMAX',types:['Psychic'],weakness:[],resistance:[]}});
 const defens={...o,turnSeat:1,ownPublic:{...o.ownPublic,bench:[mk(Gen,[],{hp:240}),cheap]},opponentPublic:{...o.opponentPublic,active:cheap,bench:[opp],prizeCount:3}};
 a(prompt(pol(),defens,[ch('g',Gen,0),ch('u',Un,1)]).tokens[0]==='u','opponent Rope cannot force three-Prize loss when one-Prize sacrifice exists');
 const prep={...o,ownHand:[Rope,Pr],ownPublic:{...o.ownPublic,active:cheap,bench:[mk(Meg,[D,Pr])]},opponentPublic:{...o.opponentPublic,active:cheap,bench:[target]}};
 const attach={kind:'play-card',actorPrinting:Pr,token:'attach',publicMetadata:{targetZone:'bench',targetSeat:'actor',targetIndex:0,isOwnerVisible:true}};
 a(root(pol(),prep,{schema:protocol.FRONTIER_SCHEMA,items:[item,attach]}).token==='attach','prepare Benched winning Rope line before switch');
 return n;
})(P,protocol)+' Rope/one-step winning-line assertions');
