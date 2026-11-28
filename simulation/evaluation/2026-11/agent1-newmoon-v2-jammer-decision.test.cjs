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
    prompt:{actingSeat:0,promptType:type,source:{sourceKind:'card-effect',classification:'actor-choice',effectName:effect,sourcePrinting:effect==='Telepathic Psychic Energy'?'Telepathic Psychic Energy MEG 088':null},publicMetadata:meta,choices}});
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
check('early Mewtwo Perfection route uses actually live ability and Gengar donor',()=>{
 const active=makeSlot('Mewtwo & Mew-GX UNM 071',{abilities:['Perfection'],
  energies:['Telepathic Psychic Energy']});
 const v=earlyStart(active,{discard:['Gengar & Mimikyu-GX TEU 053']});
 const offer=action('use-ability','perfection',{abilityName:'Perfection',sourceZone:'active'});
 assert.equal(sel(root(v,[offer,pass()])),'perfection');
 const noDonor=earlyStart(active);
 assert.equal(sel(root(noDonor,[offer,pass()])),'abstain');
 v.ownPublic.active.abilitySuppressions=[{abilityName:'Perfection',suppressed:true}];
 assert.equal(sel(root(v,[offer,pass()])),'abstain');
});
check('Perfection choose prompt targets Gengar Horror House and refuses another GX',()=>{
 const active=makeSlot('Mewtwo & Mew-GX UNM 071',{abilities:['Perfection'],
   energies:['Basic Psychic Energy']});
 const v=earlyStart(active,{discard:['Gengar & Mimikyu-GX TEU 053']});
 const candidates=[
  {kind:'attack',token:'duo',printing:'Mewtwo & Mew-GX UNM 071',publicMetadata:{sourceAttack:'Miraculous Duo-GX',ownerSeat:'actor',isOwnerVisible:true}},
  {kind:'attack',token:'horror',printing:'Gengar & Mimikyu-GX TEU 053',publicMetadata:{sourceAttack:'Horror House-GX',ownerSeat:'actor',isOwnerVisible:true}}
 ];
 assert.equal(sel(prompt(v,'Perfection','ChooseAttackPrompt',{selectionType:'attack'},candidates)),'horror');
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
