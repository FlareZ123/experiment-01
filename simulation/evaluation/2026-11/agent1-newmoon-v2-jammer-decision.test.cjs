'use strict';
const assert=require('node:assert/strict');
const {POLICY_VERSION,DECK_SHA,createPolicy}=require('./agent1-newmoon-v2-jammer-decision.cjs');
const makeSlot=(printing,opts={})=>({printing,abilities:opts.abilities??[],
  abilitySuppressions:(opts.abilities??[]).map(abilityName=>({abilityName,suppressed:false})),
  tools:opts.tools??[],energies:opts.energies??[],specialConditions:opts.specialConditions??[],hp:opts.hp??140,damage:opts.damage??0});
const dus=(opts={})=>makeSlot('Dusclops SFA 019',{abilities:['Cursed Blast'],...opts});
const bus=(opts={})=>makeSlot('Vileplume BUS 006',{abilities:['Disgusting Pollen'],tools:['Stealthy Hood UNB 186'],...opts});
const aor=()=>makeSlot('Vileplume AOR 003',{abilities:['Irritating Pollen']});
const box=()=>({stadiumAndToolHaveNoEffectTurnsRemaining:0});
const view=(opts={})=>({actorSeat:0,decisionKind:'owner-root',
  ownHand:opts.hand??['Tool Jammer BST 136'],ownTurnResources:{supporterPlayedTurn:opts.supporterPlayedTurn??0},
  ownPublic:{active:opts.active??dus({energies:['Basic Psychic Energy','Basic Psychic Energy']}),
    bench:opts.bench??[dus()],stadium:opts.ownStadium??[],prizeCount:opts.ownPrizeCount??3,publicTurnRestrictions:opts.ownRestriction??box()},
  opponentPublic:{active:opts.bus??bus(),bench:opts.opponentBench??[aor()],
    stadium:opts.oppStadium??[],handCount:opts.oppHandCount??6,prizeCount:opts.oppPrizeCount??3,publicTurnRestrictions:opts.oppRestriction??box()}});
const action=(kind,token,metadata={},extra={})=>({kind,token,publicMetadata:metadata,...extra});
const play=()=>action('play-card','play-jammer',{}, {actorPrinting:'Tool Jammer BST 136'});
const benchBlast=()=>action('use-ability','blast-bench',{abilityName:'Cursed Blast',sourceZone:'bench',sourceIndex:0});
const activeBlast=()=>action('use-ability','blast-active',{abilityName:'Cursed Blast',sourceZone:'active'});
const willow=()=>action('attack','willow',{}, {attackName:'Will-O-Wisp'});
const star=()=>action('use-ability','star',{abilityName:'Star Alchemy'});
const pass=()=>action('pass','pass');
const policy=createPolicy({role:'candidate',seat:0,policyVersion:POLICY_VERSION,
  config:{}});
function root(v,items) {return policy.decideWithAudit({role:'candidate',seat:0,
  observation:v,prompt:null,actionFrontier:{items}});}
function prompt(v,effect,type,meta,choices) {
  return policy.decideWithAudit({role:'candidate',seat:0,
    observation:{...v,decisionKind:'owner-prompt'},
    prompt:{actingSeat:0,promptType:type,source:{sourceKind:'card-effect',classification:'actor-choice',effectName:effect,sourcePrinting:effect==='Telepathic Psychic Energy'?'Telepathic Psychic Energy MEG 088':effect==='Battle VIP Pass'?'Battle VIP Pass FST 225':effect==='Fog Crystal'?'Fog Crystal CRE 140':effect==='Star Alchemy'?'Forest Seal Stone SIT 156':null},publicMetadata:meta,choices}});
}
const target=(token,printing,ownerSeat,targetZone='active')=>({token,kind:'pokemon',printing,
  publicMetadata:{ownerSeat,targetZone,isOwnerVisible:true}});
const sel=o=>o.decision.token??o.decision.tokens?.join(',')??o.decision.kind;
let checks=0;
function check(name,fn){fn(); checks++; console.log('PASS',name);}
function setupPrompt(desc,promptType,meta,choices,opts={}) {
 const v=view({hand:opts.hand??[]});
 v.phase=opts.phase??1;
 return policy.decideWithAudit({role:'candidate',seat:0,
  observation:{...v,decisionKind:'owner-prompt'},
  prompt:{actingSeat:0,promptType,description:desc,
   source:{sourceKind:'engine',classification:'actor-choice',
     sourcePrinting:null,effectName:desc},publicMetadata:meta,choices}});
}
const starter=(token,printing,index)=>({kind:'card',token,printing,
  publicMetadata:{selectionIndex:index,selectedCount:1,sourceZone:'hand',
    ownerSeat:'actor',isOwnerVisible:true}});
check('newmoon engine coin decision explicitly chooses GO SECOND',()=>{
 const r=setupPrompt('GO_FIRST','ConfirmPrompt',{selectionType:'confirm'},
 [{kind:'confirm',token:'yes',label:'Yes'},{kind:'confirm',token:'no',label:'No'}]);
 assert.equal(sel(r),'no');
 assert.equal(r.policyAudit.selectionRuleCode,'NEWMOON_PREFER_GO_SECOND_FOR_FIRST_HORROR_HOUSE');
});
check('first-turn starter prefers native Gengar with energy and keeps two backups',()=>{
 const meta={selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
 isOwnerVisible:true,isSecret:false,allowCancel:false,minimumCount:1,maximumCount:6};
 const choices=[starter('dusk','Duskull VIV 069',0),
 starter('mew','Mewtwo & Mew-GX UNM 071',1),
 starter('gengar','Gengar & Mimikyu-GX TEU 053',2),
 starter('sol','Solrock CES 062',3)];
 const r=setupPrompt('CHOOSE_STARTING_POKEMONS','ChooseCardsPrompt',meta,choices,
   {hand:['Basic Psychic Energy']});
 assert.equal(sel(r),'gengar,mew,dusk');
 const dry=setupPrompt('CHOOSE_STARTING_POKEMONS','ChooseCardsPrompt',meta,choices,
   {hand:['Powerglass SFA 063']});
 assert.equal(sel(dry),'mew,gengar,dusk');
});
check('setup Bench phase retains space for Telepathic Psychic Energy',()=>{
 const meta={selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
  isOwnerVisible:true,isSecret:false,allowCancel:false,minimumCount:0,maximumCount:5};
 const choices=[starter('a','Unown AOR 030',0),starter('b','Solrock CES 062',1),
  starter('c','Duskull VIV 069',2),
  {kind:'empty-selection',token:'empty',label:'Choose no items'}];
 const r=setupPrompt('CHOOSE_STARTING_POKEMONS','ChooseCardsPrompt',meta,choices);
 assert.equal(sel(r),'c,a');
 const none=setupPrompt('CHOOSE_STARTING_POKEMONS','ChooseCardsPrompt',meta,
   [{kind:'empty-selection',token:'empty',label:'Choose no items'}]);
 assert.equal(sel(none),'empty');
});
check('mulligan offer draws maximum allowed, never a fabricated option',()=>{
 const cs=[{kind:'option',token:'2',label:'Draw 2 card(s)',publicMetadata:{choiceIndex:0}},
 {kind:'option',token:'1',label:'Draw 1 card(s)',publicMetadata:{choiceIndex:1}},
 {kind:'option',token:'0',label:'Draw 0 card(s)',publicMetadata:{choiceIndex:2}}];
 assert.equal(sel(setupPrompt('WANT_TO_DRAW_CARDS','SelectPrompt',
   {selectionType:'option',allowCancel:false,count:3},cs)),'2');
 cs[0].label='Draw 999 card(s)';
 assert.equal(sel(setupPrompt('WANT_TO_DRAW_CARDS','SelectPrompt',
   {selectionType:'option',allowCancel:false,count:3},cs)),'abstain');
});
check('never accept setup prompt on normal attack phase',()=>{
 const r=setupPrompt('GO_FIRST','ConfirmPrompt',{selectionType:'confirm'},
  [{kind:'confirm',token:'yes',label:'Yes'},{kind:'confirm',token:'no',label:'No'}],{phase:4});
 assert.equal(sel(r),'abstain');
});

function earlyStart(active,extra={}) {
 const v=view({active,bench:extra.bench??[],bus:makeSlot('Bunnelby PRC 121',{hp:60}),
   opponentBench:[],oppHandCount:extra.handCount??5});
 v.globalTurn=extra.globalTurn??2;
 v.ownPublic.publicTurnRestrictions.gxUsed=extra.gxUsed??false;
 if(extra.discard) v.ownPublic.discard=extra.discard;
 return v;
}
const hh=action('attack','horror-house',{}, {attackName:'Horror House-GX'});
const poltergeist=action('attack','poltergeist',{}, {attackName:'Poltergeist'});
const deckChoice=(token,printing,index)=>({kind:'card',token,printing,publicMetadata:{
  sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true,selectionIndex:index}});



check('against BUS+AOR, Basic Active benches held Duskull instead of passing',()=>{
 const active=makeSlot('Gengar & Mimikyu-GX TEU 053',{energies:['Basic Psychic Energy']});
 active.printed={types:['Psychic']};
 const v=view({active,bench:[],hand:['Duskull VIV 069']});
 const dusk=action('play-card','dusk',{cardType:'pokemon'},
   {actorPrinting:'Duskull VIV 069'});
 assert.equal(sel(root(v,[dusk,pass()])),'dusk');
 const full=view({active,bench:Array.from({length:5},()=>makeSlot('Unown AOR 030')),
   hand:['Duskull VIV 069']});
 assert.equal(sel(root(full,[dusk,pass()])),'abstain');
});
check('Item-locked Basic active uses TPE itself if it must recruit missing lockbreakers',()=>{
 const active=makeSlot('Mewtwo & Mew-GX UNM 071',{energies:['Basic Psychic Energy']});
 active.printed={types:['Psychic']};
 const v=view({active,bench:[],hand:['Telepathic Psychic Energy MEG 088']});
 v.ownTurnResources.energyPlayedTurn=0;
 const tpe=action('play-card','tpe',{cardType:'energy',targetSeat:'actor',targetZone:'active'},
  {actorPrinting:'Telepathic Psychic Energy MEG 088',targetPrinting:'Mewtwo & Mew-GX UNM 071'});
 assert.equal(sel(root(v,[tpe,pass()])),'tpe');
 v.ownPublic.active.printed.types=['Water'];
 assert.equal(sel(root(v,[tpe,pass()])),'abstain');
});
check('TPE search facing dual lock chooses distinct Duskull plus FSS Articuno host',()=>{
 const active=makeSlot('Mewtwo & Mew-GX UNM 071',{energies:['Telepathic Psychic Energy']});
 active.printed={types:['Psychic']};
 const v=view({active,bench:[],hand:[]});
 const meta={selectionType:'card-combination',sourceZone:'deck',ownerSeat:'actor',
  isOwnerVisible:true,minimumCount:0,maximumCount:2};
 const cs=[{kind:'card',token:'dusk1',printing:'Duskull VIV 069',
  publicMetadata:{sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true,selectionIndex:0}},
 {kind:'card',token:'dusk2',printing:'Duskull VIV 069',
  publicMetadata:{sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true,selectionIndex:1}},
 {kind:'card',token:'art',printing:'Galarian Articuno V CRE 058',
  publicMetadata:{sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true,selectionIndex:2}}];
 assert.equal(sel(prompt(v,'Telepathic Psychic Energy','ChooseCardsPrompt',meta,cs)),'dusk1,art');
});
check('BUS Basic attack lock prevents wasting psychic on unpaid Active Gengar',()=>{
 const active=makeSlot('Gengar & Mimikyu-GX TEU 053',{energies:[]});
 active.printed={types:['Psychic']};
 const v=view({active,bench:[makeSlot('Duskull VIV 069')],
  hand:['Telepathic Psychic Energy MEG 088']});
 v.globalTurn=2;v.ownTurnResources.energyPlayedTurn=0;
 const activeTPE=action('play-card','active-tpe',{cardType:'energy',
   targetSeat:'actor',targetZone:'active'},
  {actorPrinting:'Telepathic Psychic Energy MEG 088',targetPrinting:'Gengar & Mimikyu-GX TEU 053'});
 const benchTPE=action('play-card','dusk-tpe',{cardType:'energy',
   targetSeat:'actor',targetZone:'bench',targetIndex:0},
  {actorPrinting:'Telepathic Psychic Energy MEG 088',targetPrinting:'Duskull VIV 069'});
 assert.equal(sel(root(v,[activeTPE,benchTPE,pass()])),'dusk-tpe');
});
check('Bench Duskull receives TPE under Item lock to preserve Energy on evolution',()=>{
 const active=makeSlot('Gengar & Mimikyu-GX TEU 053');
 const v=view({active,bench:[makeSlot('Duskull VIV 069')],hand:['Telepathic Psychic Energy MEG 088']});
 v.ownTurnResources.energyPlayedTurn=0;
 const toBench=action('play-card','bench-tpe',{cardType:'energy',
  targetSeat:'actor',targetZone:'bench',targetIndex:0},
  {actorPrinting:'Telepathic Psychic Energy MEG 088',targetPrinting:'Duskull VIV 069'});
 assert.equal(sel(root(v,[toBench,pass()])),'bench-tpe');
 v.ownTurnResources.energyPlayedTurn=1;
 assert.equal(sel(root(v,[toBench,pass()])),'abstain');
});
check('Bench Duskull evolves into Dusclops only when native action actually offered',()=>{
 const v=view({active:makeSlot('Gengar & Mimikyu-GX TEU 053'),
 bench:[makeSlot('Duskull VIV 069',{energies:['Telepathic Psychic Energy MEG 088']})],
 hand:['Dusclops SFA 019']});
 const evolve=action('play-card','evo',{cardType:'pokemon',targetSeat:'actor',
 targetZone:'bench',targetIndex:0},{actorPrinting:'Dusclops SFA 019'});
 assert.equal(sel(root(v,[evolve,pass()])),'evo');
 assert.equal(sel(root(v,[pass()])),'abstain');
});
check('under AOR Item lock the Stage1 Bench receives Tool Jammer directly',()=>{
 const v=view({active:makeSlot('Gengar & Mimikyu-GX TEU 053'),
 bench:[dus({energies:['Basic Psychic Energy']})],hand:['Tool Jammer BST 136']});
 const tool=action('play-card','bench-jammer',{targetSeat:'actor',targetZone:'bench',
  targetIndex:0},{actorPrinting:'Tool Jammer BST 136',targetPrinting:'Dusclops SFA 019'});
 assert.equal(sel(root(v,[tool,pass()])),'bench-jammer');
 v.ownPublic.bench[0].tools=['Forest Seal Stone SIT 156'];
 assert.equal(sel(root(v,[tool,pass()])),'abstain');
});
check('once Stage1 Bench is paid and Jammer attached, select genuine retreat to it',()=>{
 const v=view({active:makeSlot('Gengar & Mimikyu-GX TEU 053'),
  bench:[dus({tools:['Tool Jammer BST 136'],
  energies:['Basic Psychic Energy','Telepathic Psychic Energy MEG 088']})]});
 const retreat=action('retreat','retreat-dus',{targetSeat:'actor',targetZone:'bench',
  targetIndex:0},{targetPrinting:'Dusclops SFA 019',actorPrinting:'Gengar & Mimikyu-GX TEU 053'});
 assert.equal(sel(root(v,[retreat,pass()])),'retreat-dus');
 assert.equal(sel(root(v,[pass()])),'abstain');
});
check('Benched Dusclops receives second Psychic rather than promoting unpaid attacker',()=>{
 const v=view({active:makeSlot('Gengar & Mimikyu-GX TEU 053'),
 bench:[dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy']})]});
 v.ownTurnResources.energyPlayedTurn=0;
 const attach=action('play-card','attach-2',{cardType:'energy',
 targetSeat:'actor',targetZone:'bench',targetIndex:0},
 {actorPrinting:'Telepathic Psychic Energy MEG 088',targetPrinting:'Dusclops SFA 019'});
 const retreat=action('retreat','retreat-dus',{targetSeat:'actor',targetZone:'bench',
 targetIndex:0},{targetPrinting:'Dusclops SFA 019'});
 assert.equal(sel(root(v,[retreat,attach,pass()])),'attach-2');
});
const copiedHorror=(index=0,token='copied-horror')=>
 action('attack',token,{attackCostPayable:true,attackSource:{
 sourceKind:'bench-pokemon',sourceSlot:'BENCH',sourceIndex:index,
 sourceCardName:'Gengar & Mimikyu-GX',
 sourceCardFullName:'Gengar & Mimikyu-GX TEU 053',
 attackName:'Horror House-GX'
 }},{actorPrinting:'Gengar & Mimikyu-GX TEU 053',attackName:'Horror House-GX'});
check('Mewtwo benches its actual held Gengar before Fog, FSS or Perfection',()=>{
 const v=earlyStart(makeSlot('Mewtwo & Mew-GX UNM 071',
  {abilities:['Perfection'],energies:['Basic Psychic Energy']}),
  {bench:[makeSlot('Galarian Articuno V CRE 058')]});
 v.ownHand=['Gengar & Mimikyu-GX TEU 053'];
 const donor=action('play-card','donor',{cardType:'pokemon'},
  {actorPrinting:'Gengar & Mimikyu-GX TEU 053'});
 const fog=action('play-card','fog',{}, {actorPrinting:'Fog Crystal CRE 140'});
 assert.equal(sel(root(v,[fog,donor,pass()])),'donor');
 v.ownPublic.bench.push(makeSlot('Gengar & Mimikyu-GX TEU 053'));
 const copy=copiedHorror(1);
 const falseAbility=action('use-ability','perf',{abilityName:'Perfection',sourceZone:'active'});
 assert.equal(sel(root(v,[copy,falseAbility,pass()])),'copied-horror');
 assert.equal(sel(root(v,[falseAbility,pass()])),'abstain');
});
check('Mewtwo does not bench held donor on an already-full Bench',()=>{
 const v=earlyStart(makeSlot('Mewtwo & Mew-GX UNM 071',
 {abilities:['Perfection'],energies:['Basic Psychic Energy']}),{
 bench:Array.from({length:5},()=>makeSlot('Unown AOR 030'))});
 v.ownHand=['Gengar & Mimikyu-GX TEU 053'];
 const donor=action('play-card','donor',{cardType:'pokemon'},
  {actorPrinting:'Gengar & Mimikyu-GX TEU 053'});
 assert.equal(sel(root(v,[donor,pass()])),'abstain');
});
check('FSS cannot be spent to search already-held Tool Jammer',()=>{
 const v=view({active:dus({energies:['Basic Psychic Energy','Basic Psychic Energy']}),
 bench:[dus(),makeSlot('Galarian Articuno V CRE 058',{tools:['Forest Seal Stone SIT 156']})],
 hand:['Tool Jammer BST 136']});
 const star=action('use-ability','star',{abilityName:'Star Alchemy',
 sourceZone:'bench',sourceIndex:1});
 assert.equal(sel(root(v,[star,pass()])),'abstain');
});
check('FSS Tool attaches specifically to observed Benched Articuno V under dual lock',()=>{
 const v=view({active:dus({energies:['Basic Psychic Energy','Basic Psychic Energy']}),
  bench:[dus(),makeSlot('Galarian Articuno V CRE 058')],hand:[]});
 const right=action('play-card','fss',{targetSeat:'actor',targetZone:'bench',targetIndex:1},
  {actorPrinting:'Forest Seal Stone SIT 156',targetPrinting:'Galarian Articuno V CRE 058'});
 const wrong=action('play-card','wrong',{targetSeat:'actor',targetZone:'bench',targetIndex:0},
  {actorPrinting:'Forest Seal Stone SIT 156',targetPrinting:'Dusclops SFA 019'});
 assert.equal(sel(root(v,[right,wrong,pass()])),'fss');
 assert.equal(sel(root(v,[wrong,pass()])),'abstain');
});
check('after FSS installation Star Alchemy searches missing Tool Jammer',()=>{
 const v=view({active:dus({energies:['Basic Psychic Energy','Basic Psychic Energy']}),
  bench:[dus(),makeSlot('Galarian Articuno V CRE 058',
   {tools:['Forest Seal Stone SIT 156']})],hand:[]});
 const star=action('use-ability','star',{abilityName:'Star Alchemy',
    sourceZone:'bench',sourceIndex:1});
 assert.equal(sel(root(v,[star,pass()])),'star');
 const m={selectionType:'card-combination',sourceZone:'deck',ownerSeat:'actor',
 isOwnerVisible:true,minimumCount:1,maximumCount:1};
 const c=[{kind:'card',token:'jam',printing:'Tool Jammer BST 136',
 publicMetadata:{sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}}];
 assert.equal(sel(prompt(v,'Star Alchemy','ChooseCardsPrompt',m,c)),'jam');
});
check('FSS Star Alchemy resolves missing Psychic behind Tool Jammer',()=>{
 const v=view({active:dus({tools:['Tool Jammer BST 136'],
  energies:['Basic Psychic Energy']}),
  bench:[dus(),makeSlot('Galarian Articuno V CRE 058',
   {tools:['Forest Seal Stone SIT 156']})]});
 v.ownTurnResources.energyPlayedTurn=1;
 const star=action('use-ability','star',{abilityName:'Star Alchemy',
   sourceZone:'bench',sourceIndex:1});
 assert.equal(sel(root(v,[star,pass()])),'star');
 const m={selectionType:'card-combination',sourceZone:'deck',ownerSeat:'actor',
 isOwnerVisible:true,minimumCount:1,maximumCount:1};
 const c=[{kind:'card',token:'basic',printing:'Basic Psychic Energy',
  publicMetadata:{sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}},
  {kind:'card',token:'tpe',printing:'Telepathic Psychic Energy MEG 088',
   publicMetadata:{sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}}];
 assert.equal(sel(prompt(v,'Star Alchemy','ChooseCardsPrompt',m,c)),'tpe');
});
check('early Mewtwo missing donor attaches FSS then uses Star Alchemy',()=>{
 const active=makeSlot('Mewtwo & Mew-GX UNM 071',{abilities:['Perfection'],
   energies:['Basic Psychic Energy']});
 const art=makeSlot('Galarian Articuno V CRE 058');
 const v=earlyStart(active,{bench:[art]});
 const attach=action('play-card','fss',{targetSeat:'actor',targetZone:'bench',targetIndex:0},
   {actorPrinting:'Forest Seal Stone SIT 156',targetPrinting:'Galarian Articuno V CRE 058'});
 assert.equal(sel(root(v,[attach,pass()])),'fss');
 art.tools=['Forest Seal Stone SIT 156'];
 const star=action('use-ability','star',{abilityName:'Star Alchemy',sourceZone:'bench',sourceIndex:0});
 assert.equal(sel(root(v,[star,pass()])),'star');
 const m={selectionType:'card-combination',sourceZone:'deck',ownerSeat:'actor',
 isOwnerVisible:true,minimumCount:1,maximumCount:1};
 const c=[{kind:'card',token:'donor',printing:'Gengar & Mimikyu-GX TEU 053',
 publicMetadata:{sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}}];
 assert.equal(sel(prompt(v,'Star Alchemy','ChooseCardsPrompt',m,c)),'donor');
});
check('TPE Energy attachment preempts VIP when it can both power Gengar and search',()=>{
 const v=earlyStart(makeSlot('Gengar & Mimikyu-GX TEU 053',{energies:[]}),{bench:[]});
 v.ownTurnResources.energyPlayedTurn=0;
 const vip=action('play-card','vip',{}, {actorPrinting:'Battle VIP Pass FST 225'});
 const tpe=action('play-card','tpe',{cardType:'energy',targetSeat:'actor',
   targetZone:'active',targetIndex:0},
   {actorPrinting:'Telepathic Psychic Energy MEG 088',
   targetPrinting:'Gengar & Mimikyu-GX TEU 053'});
 assert.equal(sel(root(v,[vip,tpe,pass()])),'tpe');
 v.ownPublic.active.energies=['Telepathic Psychic Energy MEG 088'];
 v.ownTurnResources.energyPlayedTurn=1;
 assert.equal(sel(root(v,[vip,hh,pass()])),'vip');
});
check('first-turn VIP is played before an already-funded native Horror House',()=>{
 const v=earlyStart(makeSlot('Gengar & Mimikyu-GX TEU 053',
  {energies:['Basic Psychic Energy']}),{bench:[]});
 const vip=action('play-card','vip',{}, {actorPrinting:'Battle VIP Pass FST 225'});
 assert.equal(sel(root(v,[hh,vip,pass()])),'vip');
 v.globalTurn=4;
 assert.equal(sel(root(v,[hh,vip,pass()])),'horror-house');
});
check('VIP deck prompt supplies two relevant legal Basics without saturating Bench',()=>{
 const v=earlyStart(makeSlot('Mewtwo & Mew-GX UNM 071'),{bench:[]});
 const m={selectionType:'card-combination',sourceZone:'deck',ownerSeat:'actor',
 isOwnerVisible:true,minimumCount:0,maximumCount:2};
 const c=[deckChoice('sol','Solrock CES 062',0),
  deckChoice('gengar','Gengar & Mimikyu-GX TEU 053',1),
  deckChoice('dusk','Duskull VIV 069',2),
  {kind:'empty-selection',token:'empty'}];
 assert.equal(sel(prompt(v,'Battle VIP Pass','ChooseCardsPrompt',m,c)),'gengar,dusk');
});
check('Fog Crystal fetches actual Basic Psychic for unfunded Gengar',()=>{
 const v=earlyStart(makeSlot('Gengar & Mimikyu-GX TEU 053',{energies:[]}));
 v.globalTurn=3;
 const fog=action('play-card','fog',{}, {actorPrinting:'Fog Crystal CRE 140'});
 assert.equal(sel(root(v,[fog,pass()])),'fog');
 const m={selectionType:'card-combination',sourceZone:'deck',ownerSeat:'actor',
  isOwnerVisible:true,minimumCount:1,maximumCount:1};
 const c=[deckChoice('gengar','Gengar & Mimikyu-GX TEU 053',0),
  deckChoice('energy','Basic Psychic Energy',1)];
 assert.equal(sel(prompt(v,'Fog Crystal','ChooseCardsPrompt',m,c)),'energy');
});
check('Fog Crystal can fetch Gengar when Perfection lacks a donor',()=>{
 const v=earlyStart(makeSlot('Mewtwo & Mew-GX UNM 071',{
   abilities:['Perfection'],energies:['Basic Psychic Energy']}));
 v.globalTurn=3;
 const fog=action('play-card','fog',{}, {actorPrinting:'Fog Crystal CRE 140'});
 assert.equal(sel(root(v,[fog,pass()])),'fog');
 const m={selectionType:'card-combination',sourceZone:'deck',ownerSeat:'actor',
  isOwnerVisible:true,minimumCount:1,maximumCount:1};
 const c=[deckChoice('energy','Basic Psychic Energy',0),
  deckChoice('gengar','Gengar & Mimikyu-GX TEU 053',1)];
 assert.equal(sel(prompt(v,'Fog Crystal','ChooseCardsPrompt',m,c)),'gengar');
});
check('Lillie is a real fallback after VIP, Fog and Energy routes fail',()=>{
 const v=earlyStart(makeSlot('Gengar & Mimikyu-GX TEU 053',{energies:[]}));
 v.globalTurn=3;v.ownHand=["Lillie's Determination MEG 119"];
 const lillie=action('play-card','draw',{}, {actorPrinting:"Lillie's Determination MEG 119"});
 assert.equal(sel(root(v,[lillie,pass()])),'draw');
 v.ownHand.push('Forest Seal Stone SIT 156');
 assert.equal(sel(root(v,[lillie,pass()])),'abstain');
});

check('Psychic energy attachment uses TPE to unlock Gengar before Horror House',()=>{
 const v=earlyStart(makeSlot('Gengar & Mimikyu-GX TEU 053',{energies:[]}));
 v.ownTurnResources.energyPlayedTurn=0;
 const card=(printing,token,zone='active',seat='actor')=>
  action('play-card',token,{cardType:'energy',targetZone:zone,targetSeat:seat},
   {actorPrinting:printing,targetPrinting:'Gengar & Mimikyu-GX TEU 053'});
 assert.equal(sel(root(v,[card('Basic Psychic Energy','basic'),
   card('Telepathic Psychic Energy','tpe'),pass()])),'tpe');
 assert.equal(sel(root(v,[card('Telepathic Psychic Energy','bench','bench'),
   card('Telepathic Psychic Energy','foe','active','opponent'),pass()])),'abstain');
 v.ownPublic.active.energies=['Telepathic Psychic Energy'];
 v.ownPublic.publicTurnRestrictions.gxUsed=false;
 assert.equal(sel(root(v,[hh,pass()])),'horror-house');
});
check('TPE actor-owned deck search prioritizes Gengar donor and Duskull',()=>{
 const v=earlyStart(makeSlot('Mewtwo & Mew-GX UNM 071',{abilities:['Perfection'],
  energies:['Telepathic Psychic Energy']}));
 const item=(token,name,i)=>({token,kind:'card',printing:name,publicMetadata:{
  sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true,selectionIndex:i}});
 const meta={selectionType:'card-combination',sourceZone:'deck',
  ownerSeat:'actor',isOwnerVisible:true,minimumCount:0,maximumCount:2};
 const choices=[item('sol','Solrock CES 062',0),item('dusk','Duskull VIV 069',1),
  item('gengar','Gengar & Mimikyu-GX TEU 053',2),
  {kind:'empty-selection',token:'empty'}];
 assert.equal(sel(prompt(v,'Telepathic Psychic Energy','ChooseCardsPrompt',meta,choices)),'gengar,dusk');
});
check('TPE search does not illegally exceed occupied Bench or leak opponent zone',()=>{
 const v=earlyStart(makeSlot('Mewtwo & Mew-GX UNM 071'),{
  bench:Array.from({length:5},()=>makeSlot('Unown AOR 030'))});
 const item={kind:'card',token:'dusk',printing:'Duskull VIV 069',publicMetadata:{
  sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}};
 const meta={selectionType:'card-combination',sourceZone:'deck',ownerSeat:'actor',
  isOwnerVisible:true,minimumCount:0,maximumCount:2};
 assert.equal(sel(prompt(v,'Telepathic Psychic Energy','ChooseCardsPrompt',meta,
  [item,{kind:'empty-selection',token:'empty'}])),'empty');
 meta.ownerSeat='opponent';
 assert.equal(sel(prompt(v,'Telepathic Psychic Energy','ChooseCardsPrompt',meta,[item])),'abstain');
});
check('TPE attachment under BUS lock unlocks one-Psychic Active Jammer Dusclops',()=>{
 const v=view({active:dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy']}),
  bench:[dus()]});
 v.ownTurnResources.energyPlayedTurn=0;
 const card=action('play-card','tpe',{cardType:'energy',targetZone:'active',targetSeat:'actor'},
  {actorPrinting:'Telepathic Psychic Energy',targetPrinting:'Dusclops SFA 019'});
 assert.equal(sel(root(v,[card,benchBlast(),pass()])),'tpe');
 v.ownPublic.active.energies.push('Telepathic Psychic Energy');
 assert.equal(sel(root(v,[benchBlast(),pass()])),'blast-bench');
});

check('native Gengar first-turn legal Horror House beats generic printed damage tactic',()=>{
 const v=earlyStart(makeSlot('Gengar & Mimikyu-GX TEU 053',
    {energies:['Basic Psychic Energy']}));
 assert.equal(sel(root(v,[poltergeist,hh,pass()])),'horror-house');
});
check('Horror House is not selected if GX spent, too late or only one source hand card',()=>{
 const start=()=>earlyStart(makeSlot('Gengar & Mimikyu-GX TEU 053',
    {energies:['Basic Psychic Energy']}));
 const spent=start();spent.ownPublic.publicTurnRestrictions.gxUsed=true;
 assert.equal(sel(root(spent,[hh,pass()])),'abstain');
 const late=start();late.globalTurn=9;
 assert.equal(sel(root(late,[hh,pass()])),'abstain');
 const small=start();small.opponentPublic.handCount=1;
 assert.equal(sel(root(small,[hh,pass()])),'abstain');
});
check('Horror House with extra Psychic energy must not auto-refill enemy hand',()=>{
 const v=earlyStart(makeSlot('Gengar & Mimikyu-GX TEU 053',
   {energies:['Basic Psychic Energy','Telepathic Psychic Energy']}));
 assert.equal(sel(root(v,[hh,pass()])),'abstain');
});
check('Mewtwo copies a Benched Gengar direct native attack, never an announced Perfection Ability',()=>{
 const active=makeSlot('Mewtwo & Mew-GX UNM 071',{abilities:['Perfection'],
  energies:['Telepathic Psychic Energy']});
 const v=earlyStart(active,{bench:[makeSlot('Gengar & Mimikyu-GX TEU 053')]});
 const actualCopy=copiedHorror(0);
 const fakeAbility=action('use-ability','bad-perf',{abilityName:'Perfection',sourceZone:'active'});
 assert.equal(sel(root(v,[fakeAbility,actualCopy,pass()])),'copied-horror');
 assert.equal(sel(root(v,[fakeAbility,pass()])),'abstain');
 const noDonor=earlyStart(active);
 assert.equal(sel(root(noDonor,[actualCopy,pass()])),'abstain');
 v.ownPublic.active.abilitySuppressions=[{abilityName:'Perfection',suppressed:true}];
 assert.equal(sel(root(v,[actualCopy,pass()])),'abstain');
});
check('Mewtwo copied attack requires exact donor Bench index and native attack source',()=>{
 const active=makeSlot('Mewtwo & Mew-GX UNM 071',{abilities:['Perfection'],
  energies:['Basic Psychic Energy']});
 const v=earlyStart(active,{bench:[makeSlot('Galarian Articuno V CRE 058'),
  makeSlot('Gengar & Mimikyu-GX TEU 053')]});
 assert.equal(sel(root(v,[copiedHorror(0),pass()])),'abstain');
 assert.equal(sel(root(v,[copiedHorror(1),pass()])),'copied-horror');
 const bad=copiedHorror(1,'bad-source');
 bad.publicMetadata.attackSource.sourceCardFullName='Unown AOR 030';
 assert.equal(sel(root(v,[bad,pass()])),'abstain');
});
check('Perfection donor in discard is legal on paper but currently unprojected by native attack adapter',()=>{
 const active=makeSlot('Mewtwo & Mew-GX UNM 071',{abilities:['Perfection'],
  energies:['Basic Psychic Energy']});
 const v=earlyStart(active,{discard:['Gengar & Mimikyu-GX TEU 053']});
 const madeUp=action('attack','unproven',{attackCostPayable:true},
  {actorPrinting:'Gengar & Mimikyu-GX TEU 053',attackName:'Horror House-GX'});
 assert.equal(sel(root(v,[madeUp,pass()])),'abstain');
});
check('Passive Perfection does not cause an invented ChooseAttackPrompt',()=>{
 const active=makeSlot('Mewtwo & Mew-GX UNM 071',{abilities:['Perfection'],
   energies:['Basic Psychic Energy']});
 const v=earlyStart(active,{discard:['Gengar & Mimikyu-GX TEU 053']});
 const candidates=[
  {kind:'attack',token:'duo',printing:'Mewtwo & Mew-GX UNM 071',publicMetadata:{sourceAttack:'Miraculous Duo-GX',ownerSeat:'actor',isOwnerVisible:true}},
  {kind:'attack',token:'horror',printing:'Gengar & Mimikyu-GX TEU 053',publicMetadata:{sourceAttack:'Horror House-GX',ownerSeat:'actor',isOwnerVisible:true}}
 ];
 assert.equal(sel(prompt(v,'Perfection','ChooseAttackPrompt',{selectionType:'attack'},candidates)),'abstain');
 assert.equal(sel(prompt(v,'Perfection','ChooseAttackPrompt',{selectionType:'attack'},candidates.slice(0,1))),'abstain');
});
check('Perfection prompt rejects a hidden or foreign Horror House selection',()=>{
 const active=makeSlot('Mewtwo & Mew-GX UNM 071',{abilities:['Perfection'],energies:['Basic Psychic Energy']});
 const v=earlyStart(active,{discard:['Gengar & Mimikyu-GX TEU 053']});
 const item={kind:'attack',token:'horror',printing:'Gengar & Mimikyu-GX TEU 053',
   publicMetadata:{sourceAttack:'Horror House-GX',ownerSeat:'opponent',isOwnerVisible:false}};
 assert.equal(sel(prompt(v,'Perfection','ChooseAttackPrompt',{selectionType:'attack'},[item])),'abstain');
});

check('production worker empty-config and role bind',()=>{
 assert.throws(()=>createPolicy({role:'candidate',seat:0,policyVersion:POLICY_VERSION,config:{deckIdentityHash:'other'}}));
 assert.throws(()=>createPolicy({role:'opponent',seat:0,policyVersion:POLICY_VERSION,config:{}}));
});
check('Jammer root attach before Item-locked BUS',()=>{
 const r=root(view(),[play(),pass()]);assert.equal(sel(r),'play-jammer');
 assert.equal(r.policyAudit.selectedTokens[0],'play-jammer');
});
check('native root chooses Active target over Benched Tool action',()=>{
 const active=action('play-card','active-jammer',{targetZone:'active',targetSeat:'actor'},
  {actorPrinting:'Tool Jammer BST 136',targetPrinting:'Dusclops SFA 019'});
 const bench=action('play-card','bench-jammer',{targetZone:'bench',targetSeat:'actor',targetIndex:0},
  {actorPrinting:'Tool Jammer BST 136',targetPrinting:'Dusclops SFA 019'});
 assert.equal(sel(root(view(),[bench,active,pass()])),'active-jammer');
 assert.equal(sel(root(view(),[bench,pass()])),'abstain');
});
check('cannot place Tool on opponent Active or stale own Active',()=>{
 const foe=action('play-card','opponent-jammer',{targetZone:'active',targetSeat:'opponent'},
  {actorPrinting:'Tool Jammer BST 136'});
 const stale=action('play-card','stale-jammer',{targetZone:'active',targetSeat:'actor'},
  {actorPrinting:'Tool Jammer BST 136',targetPrinting:'Galarian Articuno V CRE 058'});
 assert.equal(sel(root(view(),[foe,stale,pass()])),'abstain');
});
check('Jammer attachment prompt chooses own Active Dusclops',()=>{
 const v=view();const r=prompt(v,'Tool Jammer','ChoosePokemonPrompt',
  {selectionType:'pokemon',minimumCount:1,maximumCount:1},
  [target('bench','Dusclops SFA 019','actor','bench'),target('active','Dusclops SFA 019','actor')]);
 assert.equal(sel(r),'active');
});
check('attached Jammer changes root to bench Cursed Blast',()=>{
 const v=view({active:dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy','Basic Psychic Energy']})});
 const r=root(v,[benchBlast(),activeBlast(),willow(),pass()]);
 assert.equal(sel(r),'blast-bench');
});
check('Cursed Blast prompt selects opponent Active, not Benched Garbodor',()=>{
 const v=view({active:dus({tools:['Tool Jammer BST 136']})});
 const r=prompt(v,'Cursed Blast','ChoosePokemonPrompt',
  {selectionType:'pokemon',minimumCount:1,maximumCount:1},
  [target('garb','Garbodor DRX 054','opponent','bench'),target('bus','Vileplume BUS 006','opponent')]);
 assert.equal(sel(r),'bus');
});
check('Cursed Blast self-KO makes Ace Trainer legal and hand-compressing before attack',()=>{
 const v=view({active:dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy','Basic Psychic Energy']}),
  bench:[],bus:bus({damage:50}),oppPrizeCount:2,ownPrizeCount:3,oppHandCount:7});
 const ace=action('play-card','ace',{}, {actorPrinting:'Ace Trainer AOR 069'});
 assert.equal(sel(root(v,[ace,willow(),pass()])),'ace');
 v.ownTurnResources.supporterPlayedTurn=1;
 assert.equal(sel(root(v,[ace,willow(),pass()])),'willow');
});
check('Ace is not forced when it would grow source hand or Prize relation is wrong',()=>{
 const ready=dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy','Basic Psychic Energy']});
 const ace=action('play-card','ace',{}, {actorPrinting:'Ace Trainer AOR 069'});
 const noCompression=view({active:ready,bench:[],bus:bus({damage:50}),oppPrizeCount:2,ownPrizeCount:3,oppHandCount:2});
 assert.equal(sel(root(noCompression,[ace,willow(),pass()])),'willow');
 const noLead=view({active:ready,bench:[],bus:bus({damage:50}),oppPrizeCount:3,ownPrizeCount:3,oppHandCount:7});
 assert.equal(sel(root(noLead,[ace,willow(),pass()])),'willow');
});
check('Ace does not outrank immediate non-self-KO winning attack when BUS is lethal',()=>{
 const v=view({active:dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy','Basic Psychic Energy']}),
  bench:[makeSlot('Mewtwo & Mew-GX UNM 071')],bus:bus({damage:100}),oppPrizeCount:2,ownPrizeCount:1,oppHandCount:7});
 const ace=action('play-card','ace',{}, {actorPrinting:'Ace Trainer AOR 069'});
 assert.equal(sel(root(v,[ace,activeBlast(),willow(),pass()])),'willow');
});
check('after 50 counters chooses paid Will-O-Wisp',()=>{
 const v=view({active:dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy','Basic Psychic Energy']}),
   bench:[],bus:bus({damage:50})});
 assert.equal(sel(root(v,[willow(),pass()])),'willow');
});
check('after 100 counters prefers safe Will-O-Wisp over self-KO Cursed Blast',()=>{
 const v=view({active:dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy','Basic Psychic Energy']}),
  bench:[makeSlot('Mewtwo & Mew-GX UNM 071')],bus:bus({damage:100})});
 assert.equal(sel(root(v,[activeBlast(),willow(),pass()])),'willow');
});
check('when Willow is absent, funded Active Blast can still remove BUS',()=>{
 const v=view({active:dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy','Basic Psychic Energy']}),
  bench:[makeSlot('Mewtwo & Mew-GX UNM 071')],bus:bus({damage:100})});
 assert.equal(sel(root(v,[activeBlast(),pass()])),'blast-active');
});
check('Confused Active favors guaranteed lethal Ability over risky attack',()=>{
 const v=view({active:dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy','Basic Psychic Energy'],specialConditions:['CONFUSED']}),
  bench:[makeSlot('Mewtwo & Mew-GX UNM 071')],bus:bus({damage:100})});
 assert.equal(sel(root(v,[activeBlast(),willow(),pass()])),'blast-active');
});
check('Active Cursed Blast cannot self-KO the last Pokémon even for BUS KO',()=>{
 const v=view({active:dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy','Basic Psychic Energy']}),
   bench:[],bus:bus({damage:100})});
 assert.equal(sel(root(v,[activeBlast(),willow(),pass()])),'willow');
});
check('Cursed Blast refuses to award opponent their final Prize',()=>{
 const ready=dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy','Basic Psychic Energy']});
 const doomed=view({active:ready,bench:[dus()],oppPrizeCount:1});
 assert.equal(sel(root(doomed,[benchBlast(),activeBlast(),willow(),pass()])),'abstain');
 const ko=view({active:ready,bench:[makeSlot('Mewtwo & Mew-GX UNM 071')],bus:bus({damage:100}),oppPrizeCount:1});
 assert.equal(sel(root(ko,[activeBlast(),pass()])),'abstain');
});
check('Unknown Prize counts must not authorize a self-KO tactic',()=>{
 const v=view({active:dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy','Basic Psychic Energy']})});
 delete v.opponentPublic.prizeCount;
 assert.equal(sel(root(v,[benchBlast(),pass()])),'abstain');
});
check('no donor bench means no premature Jammer attachment',()=>{
 assert.equal(sel(root(view({bench:[]}),[play(),pass()])),'abstain');
});
check('occupied Active Tool bars Jammer plan',()=>{
 assert.equal(sel(root(view({active:dus({tools:['Powerglass SFA 063'],energies:['Basic Psychic Energy','Basic Psychic Energy']})}),[play(),pass()])),'abstain');
});
check('no legal root token means abstain not invented action',()=>{
 assert.equal(sel(root(view(),[pass()])),'abstain');
});
check('rank16 Active Budew with Benched Garbodor is negative control',()=>{
 const v=view({bus:makeSlot('Budew PRE 004'),opponentBench:[aor(),makeSlot('Garbodor BKP 057',{tools:['Float Stone']})]});
 assert.equal(sel(root(v,[play(),benchBlast(),pass()])),'abstain');
});
check('BUS moves Bench: funded Stage-1 Will-O-Wisp takes actual damaged Bunnelby KO',()=>{
 const v=view({active:dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy','Basic Psychic Energy']}),
  bus:makeSlot('Bunnelby PRC 121',{hp:60,damage:10}),opponentBench:[aor(),bus()]});
 assert.equal(sel(root(v,[willow(),pass()])),'willow');
});
check('BUS Bench does not force an unqualified nonlethal Will-O-Wisp',()=>{
 const v=view({active:dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy','Basic Psychic Energy']}),
  bus:makeSlot('Bunnelby PRC 121',{hp:60,damage:0}),opponentBench:[aor(),bus()]});
 assert.equal(sel(root(v,[willow(),pass()])),'abstain');
});
check('BUS Bench fallback requires live AOR and legal uncontaminated attack',()=>{
 const v=view({active:dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy','Basic Psychic Energy']}),
  bus:makeSlot('Bunnelby PRC 121',{hp:60,damage:10}),opponentBench:[bus()]});
 assert.equal(sel(root(v,[willow(),pass()])),'abstain');
 v.opponentPublic.bench.push(aor());
 v.ownPublic.active.specialConditions=['CONFUSED'];
 assert.equal(sel(root(v,[willow(),pass()])),'abstain');
});
check('BUS moves Bench: no stale active suppression or phantom lockbreak',()=>{
 const v=view({active:dus({tools:['Tool Jammer BST 136']}),bus:makeSlot('Bunnelby PRC'),
   opponentBench:[aor(),bus()]});
 assert.equal(sel(root(v,[benchBlast(),activeBlast(),pass()])),'abstain');
});
check('Jamming Tower blankets attached Tool Jammer, so special route abstains',()=>{
 const v=view({active:dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy','Basic Psychic Energy']}),
   oppStadium:['Jamming Tower TWM 153']});
 assert.equal(sel(root(v,[benchBlast(),willow(),pass()])),'abstain');
 const before=view({oppStadium:['Jamming Tower TWM 153']});
 assert.equal(sel(root(before,[play(),pass()])),'abstain');
});
check('Tool-effect suppression unknown fails closed',()=>{
 assert.equal(sel(root(view({oppRestriction:{stadiumAndToolHaveNoEffectTurnsRemaining:null}}),[play()])), 'abstain');
});
check('FSS Star Alchemy root requires observed V host and absent Jammer hand',()=>{
 const v=view({hand:[],bench:[dus(),makeSlot('Galarian Articuno V CRE 058',{tools:['Forest Seal Stone SIT 156']})]});
 assert.equal(sel(root(v,[star(),pass()])),'star');
 assert.equal(sel(root(view({hand:[],bench:[dus()]}),[star(),pass()])),'abstain');
});
check('Star Alchemy deck prompt selects exact observed Jammer only',()=>{
 const v=view({hand:[],bench:[dus(),makeSlot('Galarian Articuno V CRE 058',{tools:['Forest Seal Stone SIT 156']})]});
 const meta={selectionType:'card-combination',sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true,minimumCount:1,maximumCount:1};
 const c=(token,printing)=>({kind:'card',token,printing,publicMetadata:{ownerSeat:'actor',isOwnerVisible:true}});
 assert.equal(sel(prompt(v,'Star Alchemy','ChooseCardsPrompt',meta,[c('path','Path to the Peak'),c('jam','Tool Jammer BST 136')])),'jam');
 assert.equal(sel(prompt(v,'Star Alchemy','ChooseCardsPrompt',meta,[c('path','Path to the Peak')])),'abstain');
});
check('Prompt ownership mismatches fail closed',()=>{
 const v=view();const r=policy.decide({role:'candidate',seat:0,observation:{...v,decisionKind:'owner-prompt'},
  prompt:{actingSeat:1,promptType:'ChoosePokemonPrompt',choices:[]}});
 assert.equal(r.kind,'abstain');
});
check('Ability root without source coordinate fails closed',()=>{
 const v=view({active:dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy','Basic Psychic Energy']})});
 assert.equal(sel(root(v,[action('use-ability','unlocated',{abilityName:'Cursed Blast'}),pass()])), 'abstain');
});
check('suppressed Dusclops Ability is never selected',()=>{
 const a=dus({tools:['Tool Jammer BST 136'],energies:['Basic Psychic Energy','Basic Psychic Energy']});
 a.abilitySuppressions=[{abilityName:'Cursed Blast',suppressed:true}];
 const v=view({active:a,bench:[makeSlot('Mewtwo & Mew-GX UNM 071')],bus:bus({damage:100})});
 assert.equal(sel(root(v,[activeBlast(),pass()])), 'abstain');
});
console.log(JSON.stringify({suite:'newmoon-v2-jammer-research-slice',checks,qualifiedGameCount:0}));
