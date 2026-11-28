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
 {const v=obs([Pr,Pr,Pr],3,6);v.opponentPublic.bench=[mk('Unown AOR 30',[],60)];assert(P.bombPlanner(v,0)===null,'opponent one Prize left veto when no board-out');}
 o=obs([Pr,Pr,Pr]);o.ownPublic.active.energies=[D,D,Pr];
 assert(P.bombPlanner(o,0)===null,'already funded KO');
 o=obs([Pr,Pr,T]);o.ownPublic.stadium=['Temple of Sinnoh ASR 155'];
 assert(P.bombPlanner(o,0)===null,'unknown special energy modifier veto');
 o=obs([Pr,Pr,Pr,Pr,Pr]);assert(P.bombPlanner(o,0)===null,'source inventory cap');
 o=obs([Pr,Pr,Pr]);o.ownPublic.bench[0].abilitySuppressions=[{abilityName:'Extra Energy Bomb',suppressed:true}];assert(P.bombPlanner(o,0)===null,'ability suppressed');
 o=obs([Pr,Pr,T]);o.opponentPublic.active=mk('Pikachu TST 1',[],60);o.opponentPublic.bench=[mk('Unown AOR 30',[],60)];assert(P.bombPlanner(o,0)===null,'two prizes for one not chosen without board-out');
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

console.log('passed '+(function horrorOpening(P,protocol){
 const G='Gengar & Mimikyu-GX TEU 53',Meg='Mega Absol ex MEG 86',Un='Unown AOR 30',Pr='Prism Energy ASC 216',VIP='Battle VIP Pass FST 225',Float='Float Stone BKT 137',Rope='Escape Rope BST 125',Temple='Temple of Sinnoh ASR 155',Stop='PokéStop PGO 68',Opp='Shadow Rider Calyrex V CRE 74';
 const mk=(printing,energies=[],extra={})=>({printing,energies,hp:240,damage:0,tools:[],printed:{stage:'Basic',types:['Psychic'],retreatCost:['Colorless'],weakness:[],resistance:[]},specialConditions:[],publicRestrictions:{},...extra});
 const v={actorSeat:0,turnSeat:0,globalTurn:2,ownPublic:{active:mk(Un),bench:[mk(Meg),mk(G)],prizeCount:6,publicTurnRestrictions:{}},opponentPublic:{active:mk(Opp),bench:[],prizeCount:6,handCount:6,publicTurnRestrictions:{}},ownTurnResources:{supporterPlayedTurn:0,retreatedTurn:false,energyPlayedTurn:false,stadiumPlayedTurn:false},ownHand:[Pr,Float,VIP]};
 const pol=()=>P.createPolicy({role:'opponent',seat:0,policyVersion:P.POLICY_VERSION,config:{}});
 function root(o,items){const f={schema:protocol.FRONTIER_SCHEMA,items};const d=pol().decide({role:'opponent',seat:0,sequence:1,observation:o,prompt:null,actionFrontier:f});protocol.validateDecision(d,null,protocol.validateFrontier(f));return d;}
 const target=(token,printing,zone,index)=>({kind:'play-card',actorPrinting:printing,token,publicMetadata:{targetSeat:'actor',targetZone:zone,targetIndex:index,isOwnerVisible:true}});
 const card=(token,printing,sourceZone)=>({token,kind:'card',printing,label:printing,publicMetadata:{ownerSeat:'actor',sourceZone,isOwnerVisible:true}});
 const empty={token:'empty',kind:'empty-selection',label:'Choose no items'};
 const prompt=(source,choices,zone,min,max,engine=false)=>({schema:protocol.PROMPT_SCHEMA,actingSeat:0,promptType:'ChooseCardsPrompt',description:engine?'CHOOSE_STARTING_POKEMONS':source,source:{classification:'actor-choice',sourceKind:engine?'engine':'card-effect',sourcePrinting:engine?null:source,effectName:engine?'CHOOSE_STARTING_POKEMONS':source},choices,publicMetadata:{selectionType:'card-combination',sourceZone:zone,ownerSeat:'actor',isOwnerVisible:true,allowCancel:false,isSecret:false,minimumCount:min,maximumCount:max}});
 function respond(o,p){protocol.validatePrompt(p,0);const d=pol().decide({role:'opponent',seat:0,sequence:2,observation:o,prompt:p});protocol.validateDecision(d,p,new Set());return d;}
 let n=0;function a(v,l){if(!v)throw Error(l);n++}
 const setup={...v,phase:1,turnSeat:1,globalTurn:0,ownHand:[G,Meg,Pr],ownPublic:{...v.ownPublic,active:null,bench:[]}};
 const sp=prompt(null,[card('g',G,'hand'),card('m',Meg,'hand')],'hand',1,5,true);
 a(respond(setup,sp).tokens?.[0]==='g','forced second with visible fuel picks Gengar');
 a(respond({...setup,turnSeat:0},sp).tokens?.[0]==='m','first player retains normal setup preference');
 const before={...v,ownPublic:{...v.ownPublic,bench:[]}};
 a(P.horrorDesired(before),'visible first-turn fuel and mobility establish search opportunity');
 const vip=prompt(VIP,[card('g',G,'deck'),card('m',Meg,'deck'),card('u',Un,'deck'),empty],'deck',0,2);
 a(respond(before,vip).tokens?.[0]==='g','VIP targets Gengar on actual route');
 a(root(v,[target('m',Pr,'bench',0),target('g',Pr,'bench',1)]).token==='g','reserve manual attach for actual Horror House line');
 const powered={...v,ownPublic:{...v.ownPublic,bench:[mk(Meg),mk(G,[Pr])]},ownTurnResources:{...v.ownTurnResources,energyPlayedTurn:true},ownHand:[Float,VIP]};
 a(root(powered,[target('float',Float,'active',0),{kind:'play-card',token:'vip',actorPrinting:VIP,publicMetadata:{}}]).token==='float','enable free retreat to powered Gengar');
 const ready={...powered,ownPublic:{...powered.ownPublic,active:{...powered.ownPublic.active,tools:[Float]}},ownHand:[VIP]};
 const ret={kind:'retreat',token:'r',actorPrinting:Un,targetPrinting:G,publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:1,benchIndex:1,isOwnerVisible:true}};
 a(root(ready,[ret]).token==='r','free switch to first-turn Horror House');
 const ropeReady={...powered,ownHand:[Rope]};
 a(root(ropeReady,[{kind:'play-card',token:'rope',actorPrinting:Rope,publicMetadata:{}}]).token==='rope','Rope promotes powered Gengar without opponent bench');
 const temple={...v,ownHand:[Pr,Float,Stop],opponentPublic:{...v.opponentPublic,stadium:[Temple]}};
 a(root(temple,[target('g',Pr,'bench',1),{kind:'play-card',token:'stop',actorPrinting:Stop,publicMetadata:{}}]).token==='stop','Temple answer precedes Psychic attachment');
 a(!P.horrorDesired({...before,ownTurnResources:{...before.ownTurnResources,energyPlayedTurn:true}}),'spent manual attachment prevents false route');
 return n;
})(P,protocol)+' first-turn Horror House route assertions');

console.log('passed '+(function boardout(P){
 const Meg='Mega Absol ex MEG 86',El='Electrode-GX CES 48',Un='Unown AOR 30',V='Shadow Rider Calyrex V CRE 74',VM='Shadow Rider Calyrex VMAX CRE 75',D='Darkness Energy MEE 15',Pr='Prism Energy ASC 216',Psy='Psychic Energy MEE 13';
 const mk=(printing,energies=[],hp=280,extra={})=>({printing,energies,hp,damage:0,tools:[],specialConditions:[],publicRestrictions:{},printed:{stage:'Basic',types:['Darkness'],weakness:[],resistance:[]},...extra});
 const v=mk(V,[],210,{printed:{stage:'Basic',types:['Psychic'],weakness:[{type:'Darkness',value:'×2'}],resistance:[]}});
 const vmax=mk(VM,[],320,{printed:{stage:'VMAX',types:['Psychic'],weakness:[{type:'Darkness',value:'×2'}],resistance:[]}});
 const o=(target=v,bench=[],oppNeeds=6)=>({globalTurn:4,ownHand:[],ownPublic:{active:mk(Meg),bench:[mk(El)],prizeCount:6,discard:[Pr,Pr,Pr],publicTurnRestrictions:{}},opponentPublic:{active:target,bench,prizeCount:oppNeeds,publicTurnRestrictions:{}},ownTurnResources:{supporterPlayedTurn:0,retreatedTurn:false}});
 let n=0;function a(v,l){if(!v)throw Error(l);n++}
 let z=o();z.ownPublic.active.energies=[D,Pr,Pr];
 const atk={kind:'attack',attackName:'Claw of Darkness',actorPrinting:Meg,publicMetadata:{attackCostPayable:true}};
 a(P.rootAttack(atk,z)>=1000,'sole opponent Pokémon board-out is win despite six prizes');
 z.opponentPublic.bench=[mk(Un,[],60)];a(P.rootAttack(atk,z)<1000,'bench prevents board-out win');
 z.opponentPublic.bench=[{concealed:true}];a(P.rootAttack(atk,z)<1000,'concealed bench also prevents board-out claim');
 a(P.bombPlanner(o(v,[],3),0)?.immediateWin===true,'Bomb board-out allowed even opponent would reach one prize');
 a(P.bombPlanner(o(v,[],2),0)===null,'self-KO takes last Prizes before attack');
 a(P.bombPlanner(o(v,[mk(Un,[],60)]),0)?.tempoDenial===true,'two-for-two eliminates only visible Shadow Rider engine');
 a(P.bombPlanner(o(v,[v]),0)===null,'backup V prevents engine-denial heuristic');
 const reply={...vmax,energies:Array(9).fill(Psy),attacks:[{name:'Max Geist',cost:['Colorless','Colorless','Colorless'],damage:'10+'}]};
 a(P.bombPlanner(o(vmax,[reply],4),0)===null,'nonfinal Bomb cannot offer known last-prize reply');
 a(P.bombPlanner(o(vmax,[mk(Un,[],60)],4),0)!==null,'nonfinal three-prize Bomb when no known reply');
 return n;
})(P)+' board-out and Prize-trade assertions');

console.log('passed '+(function drawAndDecline(P,protocol){
 const Meg='Mega Absol ex MEG 86',Vol='Voltorb ROS 21',El='Electrode-GX CES 48',Un='Unown AOR 30',I='Iono PAL 185',D='Darkness Energy MEE 15',Pr='Prism Energy ASC 216',Vip='Battle VIP Pass FST 225',Stop='PokéStop PGO 68',Rc='Rescue Carrier EVS 154',V='Shadow Rider Calyrex V CRE 74',VM='Shadow Rider Calyrex VMAX CRE 75';
 const mk=(printing,energies=[],hp=280)=>({printing,energies,hp,damage:0,tools:[],specialConditions:[],printed:{stage:'Basic',types:['Darkness'],weakness:[],resistance:[]},publicRestrictions:{}});
 const o=(hand=[])=>({actorSeat:0,globalTurn:6,ownHand:hand,ownPublic:{active:mk(Meg),bench:[mk(El)],prizeCount:4,deckCount:25,discard:[],stadium:[Stop],publicTurnRestrictions:{}},opponentPublic:{active:mk(V),bench:[mk(Un,[],60)],prizeCount:2,handCount:8,publicTurnRestrictions:{}},ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:true,retreatedTurn:false}});
 const p=()=>P.createPolicy({role:'opponent',seat:0,policyVersion:P.POLICY_VERSION,config:{}});
 const decide=(o,items)=>{const f={schema:protocol.FRONTIER_SCHEMA,items},d=p().decide({role:'opponent',seat:0,sequence:1,observation:o,prompt:null,actionFrontier:f});protocol.validateDecision(d,null,protocol.validateFrontier(f));return d};
 const play=(token,printing)=>({kind:'play-card',token,actorPrinting:printing,publicMetadata:{}});
 const pass={kind:'pass',token:'pass'};
 let n=0;function a(v,l){if(!v)throw Error(l);n++}
 a(P.protectedReset(o([Vip,Vip,Vip,Vip])),'reset four expired VIP');
 a(!P.protectedReset({...o([D]),ownTurnResources:{energyPlayedTurn:false}}),'do not throw sole manual Energy');
 a(!P.protectedReset({...o([Vol]),ownPublic:{...o().ownPublic,bench:[]}}),'protect missing sole Voltorb');
 a(P.ionoScore(o([I,Vip,Vip,Vip]),I)>300,'late disruption can justify equal hand');
 a(decide(o([I,Vip,Vip,Vip]),[pass,play('iono',I)]).token==='iono','choose Iono to shrink opponent eight to two');
 a(decide(o([Vip]),[pass,play('dead-vip',Vip)]).token==='pass','decline known dead Item');
 a(decide(o(),[pass,{kind:'use-ability',token:'unknown',actorPrinting:Meg,publicMetadata:{abilityName:'Unknown'}}]).kind==='abstain','unmodeled ability remains visible');
 const bomb={kind:'use-ability',token:'bomb',actorPrinting:El,publicMetadata:{sourceSeat:'actor',sourceZone:'bench',sourceIndex:0,abilityName:'Extra Energy Bomb'}};
 a(decide(o(),[pass,bomb]).token==='pass','decline Bomb losing final two prizes');
 const ready=o();ready.opponentPublic.prizeCount=6;ready.opponentPublic.active={...mk(VM,[],320),printed:{weakness:[{type:'Darkness',value:'×2'}]} };ready.ownPublic.discard=[Pr,Pr,Pr];a(decide(ready,[pass,bomb]).token==='bomb','select profitable Bomb now that full native multi-transfer is supported');
 const stop={kind:'use-stadium',token:'stop',actorPrinting:Stop,publicMetadata:{stadiumEffectLive:true}};
 a(decide(o([Vip]),[pass,stop]).token==='stop','productive PokéStop before pass');
 const blocked=o();blocked.opponentPublic.bench=[mk('Toedscruel PAR 17')];a(decide(blocked,[pass,stop]).token==='pass','avoid Slime Mold discard-to-hand denial');
 const thin=o();thin.ownPublic.deckCount=4;a(decide(thin,[pass,stop]).token==='pass','avoid near-deckout PokéStop');
 return n;
})(P,protocol)+' draw-reset, disruption, and intentional-decline assertions');

console.log('passed '+(function activeBomb(P,protocol){
 const Meg='Mega Absol ex MEG 86',El='Electrode-GX CES 48',Un='Unown AOR 30',VM='Shadow Rider Calyrex VMAX CRE 75',Pr='Prism Energy ASC 216',D='Darkness Energy MEE 15';
 const mk=(printing,energies=[],hp=280,extra={})=>({printing,energies,hp,damage:0,tools:[],specialConditions:[],publicRestrictions:{},printed:{stage:'Basic',retreatCost:['Colorless'],types:['Darkness'],weakness:[],resistance:[]},...extra});
 const o=(bench=[mk(Meg)],oppPrize=6)=>({actorSeat:0,globalTurn:3,ownHand:[],ownPublic:{active:mk(El,[],190),bench,discard:[Pr,Pr,Pr],prizeCount:6,publicTurnRestrictions:{}},opponentPublic:{active:mk(VM,[],320,{printed:{weakness:[{type:'Darkness',value:'×2'}]}}),bench:[],prizeCount:oppPrize,publicTurnRestrictions:{}},ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:false,retreatedTurn:false}});
 let n=0;function a(v,l){if(!v)throw Error(l);n++}
 const p=P.bombPlanner(o(),-1);
 a(p?.immediateWin===true,'Active Electrode may self-KO then promote funded Mega');
 a(p.sourceZone==='active'&&p.sourceBenchIndex===-1,'explicit active source');
 a(p.mobility.promotionIndex===0&&p.mobility.promotionPrinting===Meg,'physical promotion after KO');
 a(p.required===3&&p.assignments.every(x=>x.zone==='bench'&&x.index===0),'never allocate to self-KO source');
 a(P.bombPlanner(o([],6),-1)===null,'no survivor means board-out loss');
 a(P.bombPlanner(o([mk(Meg)],2),-1)===null,'self-KO gives final two prizes');
 a(P.bombPlanner(o([mk(Un,[],60),mk(Meg)],3),-1)?.mobility.promotionIndex===1,'choose actual bench location with funded attacker');
 const non=o([mk(Meg,[D,Pr,Pr])]);non.ownPublic.active.energies=[D];a(P.bombPlanner(non,-1)===null,'ordinary paid retreat win dominates self-KO');
 const pcy=P.createPolicy({role:'opponent',seat:0,policyVersion:P.POLICY_VERSION,config:{}});
 const f={schema:protocol.FRONTIER_SCHEMA,items:[{kind:'pass',token:'pass'},{kind:'use-ability',token:'bomb',actorPrinting:El,publicMetadata:{sourceSeat:'actor',sourceZone:'active',sourceIndex:0,abilityName:'Extra Energy Bomb'}}]};
 const d=pcy.decide({role:'opponent',seat:0,sequence:1,observation:o(),prompt:null,actionFrontier:f});protocol.validateDecision(d,null,protocol.validateFrontier(f));a(d.kind==='select-action'&&d.token==='bomb','actual Active-source Bomb now has a full transfer continuation');
 return n;
})(P,protocol)+' active-source Bomb and promotion assertions');

console.log('passed '+(function compressorTiming(P,protocol){
 const M='Mega Absol ex MEG 86',V='Voltorb ROS 21',E='Electrode-GX CES 48',C='Battle Compressor PHF 92',G='Girafarig LOT 94',D='Darkness Energy MEE 15',Pr='Prism Energy ASC 216',Mail="Trainers' Mail ROS 92",U='Unown AOR 30';
 const mk=(printing)=>({printing,hp:90,damage:0,energies:[],tools:[],printed:{stage:'Basic'},specialConditions:[],publicRestrictions:{}});
 const obs=(seat=0,turn=2,foe=mk(G))=>({actorSeat:seat,globalTurn:turn,ownHand:[C],ownPublic:{active:mk(M),bench:[mk(V)],discard:[],deckCount:30,prizeCount:6,publicTurnRestrictions:{}},opponentPublic:{active:foe,bench:[],prizeCount:6,publicTurnRestrictions:{}},ownTurnResources:{energyPlayedTurn:false,supporterPlayedTurn:0}});
 const root=(o,items=[{kind:'play-card',token:'comp',actorPrinting:C,publicMetadata:{}},{kind:'pass',token:'pass'}])=>{const f={schema:protocol.FRONTIER_SCHEMA,items};const r=P.createPolicy({role:'opponent',seat:o.actorSeat,policyVersion:P.POLICY_VERSION,config:{}}).decide({role:'opponent',seat:o.actorSeat,sequence:1,observation:o,prompt:null,actionFrontier:f});protocol.validateDecision(r,null,protocol.validateFrontier(f));return r};
 const choose=(o)=>{const cards=[C,Mail].map((printing,i)=>({kind:'card',token:'t'+i,printing,label:printing,publicMetadata:{ownerSeat:'actor',sourceZone:'deck',isOwnerVisible:true}}));const p={schema:protocol.PROMPT_SCHEMA,actingSeat:o.actorSeat,promptType:'ChooseCardsPrompt',description:Mail,source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:Mail,effectName:Mail},choices:[...cards,{kind:'empty-selection',token:'empty',label:'Choose no items'}],publicMetadata:{selectionType:'card-combination',sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true,allowCancel:false,isSecret:false,minimumCount:0,maximumCount:1}};protocol.validatePrompt(p,o.actorSeat);const r=P.createPolicy({role:'opponent',seat:o.actorSeat,policyVersion:P.POLICY_VERSION,config:{}}).decide({role:'opponent',seat:o.actorSeat,sequence:2,observation:o,prompt:p});protocol.validateDecision(r,p,new Set());return r};
 let n=0;function a(x,l){if(!x)throw Error(l);n++}
 let o=obs();a(P.deferCompressor(o)&&root(o).token==='pass','defer before visible Active Get Lost');
 o=obs(1,1,mk(U));o.opponentPublic.bench=[mk(G)];a(root(o).token==='pass','visible Benched Girafarig and opposite seat');
 o=obs(0,2,mk(U));a(!P.deferCompressor(o)&&root(o).token==='comp','no visible Girafarig, retain eager line');
 o=obs(0,4);o.ownPublic.bench=[mk(E)];a(!P.deferCompressor(o)&&root(o).token==='comp','release after opening with Electrode established');
 o=obs(1,3);a(!P.deferCompressor(o)&&root(o).token==='comp','no blanket late-turn freeze');
 o=obs();o.opponentPublic.active={concealed:true,printing:G};a(!P.deferCompressor(o),'concealed slot not used');
 o=obs();o.ownHand=[];a(choose(o).tokens?.[0]==='t1','do not route Mail into premature Compressor');
 o=obs(0,4);o.ownHand=[];a(choose(o).tokens?.[0]==='t0','resume Compressor search next own turn');
 return n;
})(P,protocol)+' conditional Compressor timing assertions');

console.log('passed '+(function cologneDraw(P,protocol){
 const C='Canceling Cologne ASR 136',D='Dedenne-GX UNB 57',W='Wobbuffet PHF 36',M='Mega Absol ex MEG 86',V='Voltorb ROS 21',Pr='Prism Energy ASC 216',Dark='Darkness Energy MEE 15',E='Electrode-GX CES 48',U='Unown AOR 30',Vip='Battle VIP Pass FST 225';
 const mk=(printing,extra={})=>({printing,hp:280,damage:0,energies:[],tools:[],specialConditions:[],publicRestrictions:{},abilityDetails:[],printed:{stage:'Basic',types:['Darkness'],weakness:[],resistance:[]},...extra});
 const wob=(suppressed=false)=>mk(W,{hp:110,abilityDetails:[{name:'Bide Barricade',text:'Active non-Psychic Ability lock'}],abilitySuppressions:[{abilityName:'Bide Barricade',suppressed,reasonCode:suppressed?'CANCELING_COLOGNE':null,sourcePrinting:suppressed?C:null}]});
 const obs=(seat=0)=>({actorSeat:seat,globalTurn:4,ownHand:[C,D,Vip],ownPublic:{active:mk(M),bench:[mk(V)],discard:[],deckCount:25,prizeCount:6,stadium:[],publicTurnRestrictions:{}},opponentPublic:{active:wob(),bench:[mk(U)],prizeCount:6,stadium:[],publicTurnRestrictions:{}},ownTurnResources:{energyPlayedTurn:true,supporterPlayedTurn:0}});
 const col={kind:'play-card',token:'cologne',actorPrinting:C,publicMetadata:{}},den={kind:'play-card',token:'dedenne',actorPrinting:D,publicMetadata:{}},pass={kind:'pass',token:'pass'};
 const decide=(o,items=[col,den,pass])=>{const f={schema:protocol.FRONTIER_SCHEMA,items};const d=P.createPolicy({role:'opponent',seat:o.actorSeat,policyVersion:P.POLICY_VERSION,config:{}}).decide({role:'opponent',seat:o.actorSeat,sequence:1,observation:o,prompt:null,actionFrontier:f});protocol.validateDecision(d,null,protocol.validateFrontier(f));return d};
 let n=0;function a(v,l){if(!v)throw Error(l);n++}
 for(const seat of [0,1]){
   let o=obs(seat);a(decide(o).token==='cologne','unlock supported Dedechange before bench, seat '+seat);
   a(decide(o,[den,pass]).token==='pass','do not bench Dedenne into Bide Barricade, seat '+seat);
   o.ownHand=[D,Vip];o.opponentPublic.active=wob(true);a(decide(o,[den,pass]).token==='dedenne','post-Cologne observed suppression enables bench, seat '+seat);
 }
 let o=obs();o.opponentPublic.active.abilitySuppressions=null;a(decide(o).token==='pass','unknown suppression status does not justify spending singleton or blind bench');
 o=obs();o.ownTurnResources.itemPlayLocked=true;a(decide(o).token==='pass','Item lock prevents Cologne');
 o=obs();o.ownTurnResources.abilityPokemonPlayLocked=true;a(decide(o).token==='pass','independent hand-play restriction remains');
 o=obs();o.opponentPublic.stadium=['Path to the Peak CRE 148'];a(decide(o).token==='pass','Path still blocks Dedechange');
 o=obs();o.ownPublic.stadium=['Silent Lab PRC 140'];a(decide(o).token==='pass','Silent Lab still blocks Dedechange');
 o=obs();o.ownPublic.bench=Array(5).fill(mk(U));a(decide(o).token==='pass','full Bench');
 o=obs();o.ownHand=[C,D,E];a(decide(o).token==='pass','preserve essential evolution');
 o=obs();o.ownHand=[C,Vip];o.ownPublic.bench.push(mk(E));o.ownPublic.discard=[Pr,Pr,Pr];a(decide(o,[col,pass]).token==='pass','do not spend Cologne for unsupported Bomb alone');
 o=obs();o.ownPublic.active.energies=[Dark,Pr,Pr];o.ownPublic.prizeCount=1;const atk={kind:'attack',token:'claw',actorPrinting:M,attackName:'Claw of Darkness',publicMetadata:{attackCostPayable:true}};a(decide(o,[col,den,atk,pass]).token==='claw','immediate win precedes setup');
 return n;
})(P,protocol)+' Cologne Dedechange assertions');

(function nativePrintingCompatibility(P){
  // Actual pinned a9905a76 card.fullName strings (source card class values),
  // not the numbered names in original Aichi registration files.
  const aliases=[
    ['Mega Absol ex M1L','Mega Absol ex MEG 86'],
    ['Electrode-GX CES','Electrode-GX CES 48'],
    ['Guzma BUS','Guzma BUS 115'],
    ['Sableye V SSH','Sableye V SSH 120'],
    ['Prism Energy ASC','Prism Energy ASC 216'],
    ['Shadow Rider Calyrex V CRE','Shadow Rider Calyrex V CRE 74'],
    ['Ultra Ball MEG','Ultra Ball MEG 131']
  ];
  for(const [native,original] of aliases){
    if(P.originalPrinting(native)!==original)throw Error('pinned fullName bridge failed for '+native);
    if(P.originalPrinting(original)!==original)throw Error('original source identity changed for '+original);
  }
  if(P.originalPrinting('Opponent undisclosed card FAK')!=='Opponent undisclosed card FAK')
    throw Error('unlisted identity must never be rewritten');
  const p=(printing,hp=280,energies=[],damage=0)=>({
    printing,hp,damage,energies,tools:[],printed:{
      stage:'Basic',subtypes:['Basic'],weakness:[],resistance:[]
    },specialConditions:[],publicRestrictions:{},abilityDetails:[]
  });
  const own={
    active:p('Mega Absol ex M1L'),
    bench:[p('Electrode-GX CES',190),p('Sableye V SSH',190)],
    discard:['Prism Energy ASC','Prism Energy ASC','Prism Energy ASC'],
    prizeCount:3,stadium:[],publicTurnRestrictions:{}
  };
  own.bench[0].printed.stage='Stage 1';
  const target=p('Shadow Rider Calyrex VMAX CRE 75',320);
  target.printed.weakness=[{type:'Darkness',value:'×2'}];
  const view={actorSeat:0,globalTurn:5,ownPublic:own,
    opponentPublic:{active:target,bench:[],prizeCount:3,stadium:[]},
    ownHand:[],ownTurnResources:{supporterPlayedTurn:0,retreatedTurn:0}};
  const nativePlan=P.bombPlanner(view,0);
  if(!nativePlan||nativePlan.required!==3||nativePlan.assignments.length!==3||
     !nativePlan.immediateWin)throw Error('pinned native names suppressed a supported terminal Bomb plan');
  console.log('passed native fullName compatibility cases');
})(P);


console.log('passed '+(function cologneConnectorSearch(P,protocol){
 const C='Canceling Cologne ASR 136',D='Dedenne-GX UNB 57',W='Wobbuffet PHF 36',A='Mega Absol ex MEG 86',V='Voltorb ROS 21',VIP='Battle VIP Pass FST 225',Mail="Trainers' Mail ROS 92",Box='Secret Box TWM 163';
 const mk=(printing,extra={})=>({printing,hp:280,damage:0,energies:[],tools:[],specialConditions:[],publicRestrictions:{},abilityDetails:[],printed:{stage:'Basic',types:['Darkness'],weakness:[],resistance:[]},...extra});
 const obs=seat=>({actorSeat:seat,globalTurn:4,ownHand:[D,VIP],ownPublic:{active:mk(A),bench:[mk(V)],discard:[],deckCount:25,prizeCount:6,stadium:[],publicTurnRestrictions:{}},opponentPublic:{active:mk(W,{hp:110,abilityDetails:[{name:'Bide Barricade',text:'Active non-Psychic Ability lock'}],abilitySuppressions:[{abilityName:'Bide Barricade',suppressed:false}]}),bench:[],prizeCount:6,stadium:[],publicTurnRestrictions:{}},ownTurnResources:{energyPlayedTurn:true,supporterPlayedTurn:0}});
 const pol=o=>P.createPolicy({role:'opponent',seat:o.actorSeat,policyVersion:P.POLICY_VERSION,config:{}});
 function choose(o,source,printings,max){
  const choices=printings.map((printing,i)=>({kind:'card',token:'t'+i,printing,label:printing,publicMetadata:{ownerSeat:'actor',sourceZone:'deck',isOwnerVisible:true}}));
  const p={schema:protocol.PROMPT_SCHEMA,actingSeat:o.actorSeat,promptType:'ChooseCardsPrompt',description:source,source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:source,effectName:source},choices:[...choices,{kind:'empty-selection',token:'empty',label:'Choose no items'}],publicMetadata:{selectionType:'card-combination',sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true,allowCancel:false,isSecret:false,minimumCount:0,maximumCount:max}};
  protocol.validatePrompt(p,o.actorSeat);
  const d=pol(o).decide({role:'opponent',seat:o.actorSeat,sequence:2,observation:o,prompt:p});
  protocol.validateDecision(d,p,new Set());return d;
 }
 const first=d=>d.tokens?.[0]??d.token;
 let n=0;function check(v,label){if(!v)throw Error('Cologne connector '+label);n++}
 for(const seat of [0,1]){
  const cases=[
   ['live',o=>o,'t0'],
   ['no Dedenne',o=>({...o,ownHand:[VIP]}),'empty'],
   ['already suppressed',o=>{o.opponentPublic.active.abilitySuppressions[0].suppressed=true;return o},'empty'],
   ['no Wobbuffet',o=>{o.opponentPublic.active=mk('Shadow Rider Calyrex V CRE 74');return o},'empty'],
   ['unknown suppression',o=>{o.opponentPublic.active.abilitySuppressions=[];return o},'empty'],
   ['full bench',o=>{o.ownPublic.bench=Array(5).fill(mk(V));return o},'empty'],
   ['Path active',o=>{o.opponentPublic.stadium=['Path to the Peak CRE 148'];return o},'empty'],
   ['protected evolution',o=>({...o,ownHand:[D,'Electrode-GX CES 48']}),'empty']
  ];
  for(const [label,mut,expected] of cases)check(first(choose(mut(obs(seat)),Mail,[C,VIP],1))===expected,label+' seat '+seat);
  const o=obs(seat);
  check(first(choose(o,Mail,[C,Mail],1))==='t0','Cologne beats redundant Mail seat '+seat);
  const b=choose(o,Box,[C,Mail,'Float Stone BKT 137','Iono PAL 185','Silent Lab PRC 140'],4);
  check(b.tokens?.includes('t0')&&!b.tokens?.includes('t1')&&[2,3,4].every(i=>b.tokens.includes('t'+i)),'Secret Box Item slot seat '+seat);
  o.ownHand.push(C);
  const f={schema:protocol.FRONTIER_SCHEMA,items:[{kind:'play-card',token:'col',actorPrinting:C,publicMetadata:{}},{kind:'play-card',token:'den',actorPrinting:D,publicMetadata:{}},{kind:'pass',token:'pass'}]};
  const d=pol(o).decide({role:'opponent',seat,sequence:3,observation:o,prompt:null,actionFrontier:f});
  protocol.validateDecision(d,null,protocol.validateFrontier(f));check(d.token==='col','next root spends fetched Cologne seat '+seat);
 }
 return n;
})(P,protocol)+' Cologne search/connector decisions');


console.log('passed '+(function cologneUltraBallFollowThrough(P,protocol){
 const C='Canceling Cologne ASR 136',D='Dedenne-GX UNB 57',U='Ultra Ball MEG 131',VIP='Battle VIP Pass FST 225',M='Mega Absol ex MEG 86',V='Voltorb ROS 21',W='Wobbuffet PHF 36';
 const mk=(printing,extra={})=>({printing,hp:280,damage:0,energies:[],tools:[],specialConditions:[],publicRestrictions:{},abilityDetails:[],printed:{stage:'Basic',types:['Darkness'],weakness:[],resistance:[]},...extra});
 const obs=seat=>({actorSeat:seat,globalTurn:4,ownHand:[C,U,VIP,VIP],ownPublic:{active:mk(M),bench:[mk(V)],discard:[],deckCount:25,prizeCount:6,stadium:[],publicTurnRestrictions:{}},opponentPublic:{active:mk(W,{hp:110,abilityDetails:[{name:'Bide Barricade',text:'non-Psychic lock'}],abilitySuppressions:[{abilityName:'Bide Barricade',suppressed:false}]}),bench:[],prizeCount:6,stadium:[],publicTurnRestrictions:{}},ownTurnResources:{energyPlayedTurn:true,supporterPlayedTurn:0}});
 const frontier=names=>({schema:protocol.FRONTIER_SCHEMA,items:[...names.map((name,i)=>({kind:'play-card',token:'a'+i,actorPrinting:name,publicMetadata:{}})),{kind:'pass',token:'pass'}]});
 const choices=(names,zone)=>names.map((printing,i)=>({kind:'card',token:'t'+i,printing,label:printing,publicMetadata:{ownerSeat:'actor',sourceZone:zone,isOwnerVisible:true}}));
 const prompt=(o,source,items,zone,min,max)=>({schema:protocol.PROMPT_SCHEMA,actingSeat:o.actorSeat,promptType:'ChooseCardsPrompt',description:source,source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:source,effectName:source},choices:[...choices(items,zone),...(min===0?[{kind:'empty-selection',token:'empty',label:'None'}]:[])],publicMetadata:{selectionType:'card-combination',sourceZone:zone,ownerSeat:'actor',isOwnerVisible:true,allowCancel:false,isSecret:false,minimumCount:min,maximumCount:max}});
 let n=0;const check=(b,l)=>{if(!b)throw Error('Cologne/Ultra '+l);n++};
 const root=(pol,o,seq,names)=>{const f=frontier(names);const r=pol.decide({role:'opponent',seat:o.actorSeat,sequence:seq,observation:o,prompt:null,actionFrontier:f});protocol.validateDecision(r,null,protocol.validateFrontier(f));return r};
 const answer=(pol,o,seq,p)=>{protocol.validatePrompt(p,o.actorSeat);const r=pol.decide({role:'opponent',seat:o.actorSeat,sequence:seq,observation:o,prompt:p});protocol.validateDecision(r,p,new Set());return r};
 for(const seat of [0,1]){
  let o=obs(seat),pol=P.createPolicy({role:'opponent',seat,policyVersion:P.POLICY_VERSION,config:{}});
  check(root(pol,o,1,[C,U]).token==='a0','payable Cologne chosen seat '+seat);
  o.ownHand=[U,VIP,VIP];o.opponentPublic.active.abilitySuppressions[0].suppressed=true;
  check(root(pol,o,2,[U]).token==='a0','payable Ultra selected seat '+seat);
  let p=prompt(o,U,[VIP,VIP],'hand',2,2);
  check(JSON.stringify(answer(pol,o,3,p).tokens)==='["t0","t1"]','two safe costs seat '+seat);
  o.ownHand=[];p=prompt(o,U,[D,'Sableye V SSH 120'],'deck',0,1);
  check(answer(pol,o,4,p).tokens?.[0]==='t0','Dedenne selected from deck seat '+seat);
  o.ownHand=[D];
  check(root(pol,o,5,[D]).token==='a0','Dedenne played seat '+seat);
  const cp={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:'ConfirmPrompt',description:'Dedechange',source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:D,effectName:'Dedechange'},choices:[{kind:'confirm',token:'yes',label:'yes'},{kind:'confirm',token:'no',label:'no'}],publicMetadata:{selectionType:'confirm',ownerSeat:'actor',isOwnerVisible:true}};
  check(answer(pol,o,6,cp).token==='yes','Dedechange confirmed seat '+seat);
  for(const [label,mut] of [
   ['one VIP',v=>{v.ownHand=[C,U,VIP];return v}],
   ['missing Ultra',v=>{v.ownHand=[C,VIP,VIP];return v}],
   ['already in discard',v=>{v.ownPublic.discard=[D];return v}],
   ['missing core',v=>{v.ownPublic.active=mk('Unown AOR 30');return v}],
   ['opponent lock unknown',v=>{v.opponentPublic.active.abilitySuppressions=[];return v}],
   ['item locked',v=>{v.ownTurnResources.itemPlayLocked=true;return v}],
   ['full bench',v=>{v.ownPublic.bench=Array(5).fill(mk(V));return v}],
   ['Path in play',v=>{v.opponentPublic.stadium=['Path to the Peak CRE 148'];return v}]
  ]){
   const v=mut(obs(seat));check(root(P.createPolicy({role:'opponent',seat,policyVersion:P.POLICY_VERSION,config:{}}),v,1,[C,U]).token!=='a0','negative '+label+' seat '+seat);
  }
 }
 return n;
})(P,protocol)+' Cologne/Ultra Ball complete supported chain decisions');
