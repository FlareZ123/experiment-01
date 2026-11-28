'use strict';
// Research-only: proposes a next-own-turn final-Prize KO after a mandatory
// KO promotion under source-real Snorlax PGO Block. Source-policy decisions,
// not native games. Requires the existing integrated successor for a conservative
// direct-final classifier. Never writes the owner branch.
const MARKER="function chooseKnockoutPromotion(view,prompt) {";
function replaceOne(s,a,b){if(typeof s!=='string'||s.split(a).length!==2)throw Error('Missing or duplicate '+a);return s.replace(a,b);}
function patchWorker(integratedSource){
 const helper=[
 "function sourceSnorlaxNextTurnOneAttachmentWin(view,prompt){",
 " if(view.phase!==3||view.ownPublic.active!==null||",
 "  prompt?.promptType!=='ChoosePokemonPrompt'||",
 "  prompt.description!=='CHOOSE_NEW_ACTIVE_POKEMON'||",
 "  prompt.source?.classification!=='actor-choice'||",
 "  prompt.source?.sourceKind!=='engine'||",
 "  prompt.source?.sourcePrinting!==null||",
 "  prompt.source.effectName!==prompt.description||",
 "  prompt.publicMetadata?.minimumCount!==1||",
 "  prompt.publicMetadata?.maximumCount!==1||",
 "  prompt.publicMetadata?.allowCancel!==false||",
 "  !Number.isInteger(view.globalTurn)||view.globalTurn<8||",
 "  view.ownPublic.deckCount<=0||view.ownPublic.prizeCount!==1||",
 "  !hasName(view.opponentPublic.active?.printing,'Snorlax PGO')||",
 "  !Array.isArray(view.ownHand)||",
 "  effectiveAbilityStatus(view.opponentPublic.active,'Block','opponent',view)!==true)",
 "   return null;",
 " const e=view.ownHand.find(p=>isBasicEnergyPrinting(p)&&hasName(p,'Psychic Energy'));",
 " if(!e||!Array.isArray(prompt.choices))return null;",
 " for(const choice of prompt.choices){",
 "  if(choice.kind!=='pokemon'||choice.publicMetadata?.ownerSeat!=='actor'||",
 "     choice.publicMetadata?.targetZone!=='bench'||",
 "     !hasName(choice.printing,'Shadow Rider Calyrex VMAX CRE'))continue;",
 "  const t=slotForPokemonChoice(view,choice);",
 "  if(!t||!isShadowRiderVmax(t.slot)||t.slot.energies?.length!==2||",
 "    !t.slot.energies.every(p=>isBasicEnergyPrinting(p)&&hasName(p,'Psychic Energy')))continue;",
 "  const promoted=switchedPublic(view,'ownPublic',t.index);",
 "  const attacker=promoted.ownPublic.active;",
 "  const futureTurn=view.globalTurn+1;",
 "  const upcoming={...promoted,globalTurn:futureTurn,phase:2,",
 "    ownHand:view.ownHand.filter((x,i)=>i!==view.ownHand.indexOf(e)),",
 "    ownPublic:{...promoted.ownPublic,handCount:Math.max(0,(promoted.ownPublic.handCount??1)-1),",
 "      active:{...attacker,energies:[...attacker.energies,e]}},",
 "    ownTurnResources:{...view.ownTurnResources,energyPlayedTurn:futureTurn}};",
 "  if(publicFinalAttack(upcoming,new Set(['Max Geist'])))return choice;",
 " }",
 " return null;",
 "}",
 "function chooseKnockoutPromotion(view,prompt){",
 " const prior=chooseKnockoutPromotionOriginal(view,prompt);",
 " if(prior?.kind!=='select-choices')return prior;",
 " const choice=sourceSnorlaxNextTurnOneAttachmentWin(view,prompt);",
 " if(!choice)return prior;",
 " recordPolicyAuditScore(choice.token,40000);",
 " setPolicyAuditRule('KO_PROMOTION_SNORLAX_BLOCK_NEXT_TURN_FINAL','STRICT_SOURCE_AND_ONE_ATTACH');",
 " return {kind:'select-choices',tokens:[choice.token]};",
 "}"
 ].join('\n')+'\n';
 return replaceOne(integratedSource,MARKER,
  "function chooseKnockoutPromotionOriginal(view,prompt) {")+'\n'+helper;
}
function compile(source){
 const module={exports:{}};
 new Function('module','exports',source)(module,module.exports);
 return module.exports;
}
const P='Psychic Energy MEE',CAP='Capture Energy RCL 171',W='Water Energy MEE 11';
function pokemon(printing,o={}){
 return {printing,hp:o.hp??200,damage:o.damage??0,
  abilities:o.abilities??[],abilitySuppressions:o.abilitySuppressions??[],
  energies:o.energies??[],tools:o.tools??[],specialConditions:o.conditions??[],
  attacks:o.attacks??[],publicRestrictions:{},
  printed:{stage:o.stage??'BASIC',types:o.types??['Psychic'],
   subtypes:o.subtypes??['Basic'],retreatCost:o.retreatCost??[],
   weakness:[],resistance:[]}};
}
const vmax=(count=2,energy=P)=>pokemon('Shadow Rider Calyrex VMAX CRE 75',{
 hp:320,stage:'VMAX',subtypes:['VMAX','V'],energies:Array(count).fill(energy),
 abilities:['Underworld Door'],retreatCost:['Colorless','Colorless'],
 attacks:[{name:'Max Geist',cost:['Colorless','Colorless','Colorless'],damage:'10+'}]});
const latias=()=>pokemon('Latias ex SSP 76',{
 hp:210,abilities:['Skyliner'],subtypes:['Basic','ex'],types:['Dragon'],
 retreatCost:['Colorless'],attacks:[{name:'Eon Blade',cost:['Psychic','Psychic','Colorless'],damage:'200'}]});
const snorlax=(damage=60,mut={})=>pokemon('Snorlax PGO 55',{
 hp:150,damage,types:['Colorless'],abilities:mut.abilities??['Block'],
 abilitySuppressions:mut.abilitySuppressions??[],
 energies:mut.energies??[CAP,CAP,W,W],
 conditions:['Asleep'],tools:mut.tools??[],
 attacks:[{name:'Collapse',cost:['Colorless','Colorless','Colorless','Colorless'],damage:'150'}]});
const regirock=()=>pokemon('Regirock XYP XY49',{hp:110,types:['Fighting']});
function player(active,bench,prizes=6,deck=20){
 return {active,bench:[...bench,...Array(Math.max(0,5-bench.length)).fill(null)],
  prizeCount:prizes,handCount:1,deckCount:deck,
  discard:[],lostZone:[],stadium:[],
  publicTurnRestrictions:{gxUsed:false,vstarUsed:false}};
}
const configs=[
 {schema:'agent46-candidate-profile-v1',profileId:'hood-shield-shadow-rider-v1',
  deckSha256:'1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924'},
 {schema:'agent46-candidate-profile-v1',profileId:'lockbridge-shadow-rider-v1',
  deckSha256:'011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642'}
];
const CASES=[
 {name:'source-real four-Energy Snorlax Collapse, wounded target, last Prize',expected:['b0','b1']},
 {name:'Snorlax carries all four Energy and has 70 damage',damage:70,expected:['b0','b1']},
 {name:'Snorlax cannot be KO with 100 Max Geist',damage:40,expected:['b0','b0']},
 {name:'last two Prizes, single-Prize Snorlax insufficient',ownPrizes:2,expected:['b0','b0']},
 {name:'only one Psychic on VMAX cannot pay Max Geist',vmEnergy:1,expected:['b0','b0']},
 {name:'zero Psychic on VMAX',vmEnergy:0,expected:['b0','b0']},
 {name:'powered three-Psychic VMAX already best promotion',vmEnergy:3,expected:['b1','b1']},
 {name:'no Basic Psychic in hand',hand:['VS Seeker PHF 109'],expected:['b0','b0']},
 {name:'Psychic in hand actually Horror Special',hand:['Horror Psychic Energy RCL 172'],expected:['b0','b0']},
 {name:'Snorlax Block explicitly suppressed',snor:{abilitySuppressions:[{abilityName:'Block',suppressed:true,sourcePrinting:'Garbodor BKP'}]},expected:['b0','b0']},
 {name:'opposing Active is not Snorlax Block',otherActive:true,expected:['b0','b0']},
 {name:'no cards to draw at beginning of upcoming own turn',deck:0,expected:['b0','b0']},
 {name:'unknown defensive Sturdy on opposing Bench',unknownBench:true,expected:['b0','b0']},
 {name:'target immune due to unknown protective Tool',snor:{tools:['Big Charm RCL']},expected:['b0','b0']},
 {name:'before rank3 can normally accumulate four attachments',turn:4,expected:['b0','b0']}
];
function view(seat,row){
 const vm=vmax(row.vmEnergy??2,row.energyPrinting??P);
 const defender=row.otherActive?pokemon('Regidrago VSTAR SIT 136',{
  hp:280,damage:100,abilities:['Legacy Star'],subtypes:['VSTAR'],types:['Dragon']}):
  snorlax(row.damage??60,row.snor??{});
 const bench=row.unknownBench?pokemon('Crustle BLK 14',{
  hp:130,abilities:['Sturdy'],subtypes:['Stage 1'],stage:'STAGE1'}):regirock();
 const cards=row.hand??[P],own=player(null,[latias(),vm],row.ownPrizes??1,row.deck??20);
 own.handCount=cards.length;
 return {actorSeat:seat,globalTurn:row.turn??8,phase:3,decisionKind:'owner-prompt',
  pendingPromptType:'ChoosePokemonPrompt',ownHand:cards,ownPublic:own,
  opponentPublic:player(defender,[bench]),
  ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:6,retreatedTurn:0,vstarUsed:false},
  ownerK1:null};
}
function request(seat,observation){
 const choices=observation.ownPublic.bench.slice(0,2).map((slot,index)=>({
  kind:'pokemon',token:'b'+index,printing:slot.printing,
  label:'Your bench '+(index+1),
  publicMetadata:{selectionIndex:index,selectedCount:1,selectionType:'pokemon',
   ownerSeat:'actor',targetZone:'bench',benchIndex:index,isOwnerVisible:true}}));
 return {role:'candidate',seat,observation,prompt:{
  actingSeat:seat,promptType:'ChoosePokemonPrompt',
  description:'CHOOSE_NEW_ACTIVE_POKEMON',
  source:{classification:'actor-choice',sourceKind:'engine',
   sourcePrinting:null,effectName:'CHOOSE_NEW_ACTIVE_POKEMON'},
  choices,publicMetadata:{minimumCount:1,maximumCount:1,allowCancel:false,
   isSecret:false,selectionType:'pokemon',targetZone:'bench'}},
  publicEventReceipt:null};
}
function run(integratedSource){
 const baseline=compile(integratedSource),patched=compile(patchWorker(integratedSource));
 const errors=[];let pairs=0,changed=0;
 for(const seat of [0,1])for(const cfg of configs)for(const c of CASES){
  const req=request(seat,view(seat,c));
  const got=[baseline,patched].map(w=>{
   const decision=w.createPolicy({role:'candidate',seat,policyVersion:w.POLICY_VERSION,config:cfg}).decide(req);
   return decision.tokens?.[0]??decision.token??decision.kind;
  });
  pairs++;if(got[0]!==got[1])changed++;
  if(got.join('|')!==c.expected.join('|'))
   errors.push({case:c.name,seat,profile:cfg.profileId,expected:c.expected,got});
 }
 let continuationChecks=0;
 // Explicitly check the available next-turn legal action offers after
 // promoting VMAX. Not a Store reducer execution.
 for(const seat of [0,1])for(const cfg of configs){
  const initial=view(seat,CASES[0]),oldActive=initial.ownPublic.bench[1];
  const future={...initial,globalTurn:initial.globalTurn+1,phase:2,decisionKind:'owner-root',
   pendingPromptType:null,ownPublic:{...initial.ownPublic,active:oldActive,
    bench:[initial.ownPublic.bench[0],null,null,null,null]},
   ownTurnResources:{...initial.ownTurnResources,energyPlayedTurn:initial.globalTurn-1}};
  const attach={role:'candidate',seat,observation:future,prompt:null,
   actionFrontier:{items:[
    {kind:'play-card',token:'attach',actorPrinting:P,targetPrinting:oldActive.printing,
     publicMetadata:{targetSeat:'actor',targetZone:'active',targetIndex:0}},
    {kind:'pass',token:'pass'}]}};
  const a=patched.createPolicy({role:'candidate',seat,
   policyVersion:patched.POLICY_VERSION,config:cfg}).decide(attach);
  continuationChecks++;
  if(a.token!=='attach')errors.push({where:'next-turn-attachment',seat,profile:cfg.profileId,got:a});
  const armed={...future,ownHand:[],ownPublic:{...future.ownPublic,handCount:0,
   active:{...oldActive,energies:[...oldActive.energies,P]}},
   ownTurnResources:{...future.ownTurnResources,energyPlayedTurn:future.globalTurn}};
  const attack={role:'candidate',seat,observation:armed,prompt:null,
   actionFrontier:{items:[{kind:'attack',token:'max',attackName:'Max Geist'},
    {kind:'pass',token:'pass'}]}};
  const b=patched.createPolicy({role:'candidate',seat,
   policyVersion:patched.POLICY_VERSION,config:cfg}).decide(attack);
  continuationChecks++;
  if(b.token!=='max')errors.push({where:'next-turn-max-geist',seat,profile:cfg.profileId,got:b});
 }
 const summary={schema:'agent2-promotion-snorlax-next-turn-v1',scenarioCount:CASES.length,
  pairedGroups:pairs,workerCalls:2*pairs,continuationChecks,changed,
  preserved:pairs-changed,allMatched:errors.length===0,errors};
 if(errors.length)throw Error(JSON.stringify(summary));
 return summary;
}
module.exports={patchWorker,run};
