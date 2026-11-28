'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const policy=require('../../simulation/evaluation/2026-11/agent40-rank16-budew-garbotoxin-opponent-v0.cjs');
const P=policy.POLICY_VERSION;
const pass={kind:'pass',token:'pass'};
const attack=(name,token,paid=true)=>({kind:'attack',token,attackName:name,publicMetadata:{attackCostPayable:paid}});
const ability=(name,token)=>({kind:'use-ability',token,publicMetadata:{abilityName:name}});
const play=(printing,token,metadata={})=>({kind:'play-card',token,actorPrinting:printing,publicMetadata:metadata});
const tool=play('Float Stone BKT 137','tool',{targetSeat:'actor',targetZone:'bench',targetIndex:0});
const mon=(printing,over={})=>({printing,hp:200,damage:0,energies:[],tools:[],abilitySuppressions:[],...over});
const own=(over={})=>({active:mon('Budew ASC 16'),bench:[mon('Garbodor LTR 68')],deckCount:35,discard:[],prizeCount:6,stadium:[],publicTurnRestrictions:{},...over});
const opp=(over={})=>({active:mon('Shadow Rider Calyrex VMAX CRE 75',{hp:320}),bench:[],stadium:[],...over});
function root(seat,items,over={}){
 return{role:'opponent',seat,prompt:null,observation:{
  actorSeat:seat,phase:2,globalTurn:over.globalTurn??3,ownHand:over.ownHand??[],
  ownPublic:over.ownPublic??own(),opponentPublic:over.opponentPublic??opp(),
  ownTurnResources:{supporterPlayedTurn:0,...over.ownTurnResources}
 },actionFrontier:{items}};
}
const choice=(token,printing,zone='deck',meta={})=>({kind:'card',token,printing,label:printing,publicMetadata:{ownerSeat:'actor',sourceZone:zone,...meta}});
function prompt(seat,opts,over={}){
 const q=root(seat,[],over);q.observation.phase=over.phase??2;
 q.prompt={promptType:opts.promptType??'ChooseCardsPrompt',
  source:opts.source??{sourceKind:'card-effect',sourcePrinting:'Ultra Ball MEG 131',effectName:'Ultra Ball'},
  publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:1,allowCancel:false,...opts.publicMetadata},
  choices:opts.choices??[]};
 return q;
}
function decide(seat,req){
 const out=policy.createPolicy({role:'opponent',seat,policyVersion:P,config:{}}).decide(req);
 protocol.validateDecision(out,req.prompt,new Set(req.actionFrontier.items.map(x=>x.token)));
 return out;
}
test('exact 60 rank16 source identity and distinct prints',()=>{
 assert.equal(policy.SOURCE_RANK,16);
 assert.equal(policy.SOURCE_INVENTORY.reduce((n,x)=>n+x[1],0),60);
 for(const [printing,count] of [['Trubbish CRI 56',2],['Garbodor LTR 68',2],['Garbodor BKP 57',1],['Budew ASC 16',2],['Dedenne-GX UNB 57',1]])
  assert(policy.SOURCE_INVENTORY.some(x=>x[0]===printing&&x[1]===count));
 assert(!policy.SOURCE_INVENTORY.some(x=>x[0]==='Oranguru V ASR 133'));
});
for(const seat of [0,1]){
 test('seat '+seat+' role/observation binding',()=>{
  const q=root(seat,[pass]);q.observation.actorSeat=1-seat;
  assert.deepEqual(decide(seat,q),{kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'});
 });
 test('seat '+seat+' setup Ability before Garbotoxin Tool before Budew Item lock',()=>{
  const q=root(seat,[play('Crobat V DAA 104','crobat'),tool,attack('Itchy Pollen','budew'),pass]);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'crobat'});
  q.actionFrontier.items=[tool,attack('Itchy Pollen','budew'),pass];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'tool'});
  q.actionFrontier.items=[attack('Itchy Pollen','budew'),pass];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'budew'});
 });
 test('seat '+seat+' do not Dedechange protected only attacker',()=>{
  const q=root(seat,[play('Dedenne-GX UNB 57','dede'),tool,pass],{ownHand:['Mega Absol ex MEG 86']});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'tool'});
  q.observation.ownHand=['Darkness Energy MEE 15'];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'dede'});
 });
 test('seat '+seat+' Star Alchemy before own Ability lock',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[
   mon('Garbodor LTR 68'),mon('Crobat V DAA 104',{tools:['Forest Seal Stone SIT 156']})]});
  assert.deepEqual(decide(seat,root(seat,[ability('Star Alchemy','star'),tool,pass],
   {ownPublic:board})),{kind:'select-action',token:'star'});
 });
 test('seat '+seat+' Jamming disables Float mobility but Tool still activates Garbotoxin',()=>{
  const q=root(seat,[tool,attack('Itchy Pollen','budew'),pass]);
  q.observation.opponentPublic.stadium=['Jamming Tower TWM 153'];
  assert.equal(policy.toolEnabled(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'tool'});
 });
 test('seat '+seat+' Terminal Period only at six counters (60 damage), never 300',()=>{
  const q=root(seat,[attack('Terminal Period','terminal'),tool,pass],{opponentPublic:opp({active:mon('Mega Lopunny ex PFL 84',{hp:330,damage:60})})});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'terminal'});
  q.observation.opponentPublic.active.damage=300;
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'tool'});
 });
 test('seat '+seat+' unpayable attack never chosen',()=>{
  assert.deepEqual(decide(seat,root(seat,[attack('Terminal Period','terminal',false),tool,pass])),{kind:'select-action',token:'tool'});
 });
 test('seat '+seat+' real pre-deal setup keeps Trubbish and attacker, not Crobat',()=>{
  const choices=[choice('m','Mega Absol ex MEG 86','hand',{isOwnerVisible:true}),choice('b','Budew ASC 16','hand',{isOwnerVisible:true}),
   choice('t','Trubbish CRI 56','hand',{isOwnerVisible:true}),choice('c','Crobat V DAA 104','hand',{isOwnerVisible:true})];
  const q=prompt(seat,{source:{sourceKind:'engine',sourcePrinting:null,effectName:'CHOOSE_STARTING_POKEMONS'},
   choices,publicMetadata:{minimumCount:1,maximumCount:6}},{phase:1});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['b','t','m']});
 });
 test('seat '+seat+' Ultra Ball chooses rank16 Garbodor printing',()=>{
  const q=prompt(seat,{choices:[choice('g','Garbodor BKP 57'),choice('old','Oranguru V ASR 133'),choice('d','Darkness Energy MEE 15')]},
   {ownPublic:own({bench:[mon('Trubbish CRI 56')]})});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['g']});
 });
 test('seat '+seat+' exact two-card payment protects Secret Box and uses Darkness',()=>{
  const q=prompt(seat,{choices:[choice('box','Secret Box TWM 163','hand'),choice('g','Garbodor LTR 68','hand'),
    choice('d1','Darkness Energy MEE 15','hand'),choice('d2','Darkness Energy MEE 15','hand')],
   publicMetadata:{minimumCount:2,maximumCount:2}});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['d1','d2']});
 });
 test('seat '+seat+' unsupported prompt explicitly abstains',()=>{
  const q=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'Unknown TEST 1',effectName:'Unknown effect'},
   choices:[choice('x','Darkness Energy MEE 15')]});
  assert.deepEqual(decide(seat,q),{kind:'abstain',reasonCode:'UNSUPPORTED_PROMPT_TYPE'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' engine GO_FIRST chooses second for Budew opening',()=>{
  const q=prompt(seat,{promptType:'ConfirmPrompt',source:{sourceKind:'engine',sourcePrinting:null,effectName:'GO_FIRST'},
   publicMetadata:{selectionType:'confirm'},choices:[
    {kind:'confirm',token:'yes',label:'Yes'},{kind:'confirm',token:'no',label:'No'}]},{phase:1});
  assert.deepEqual(decide(seat,q),{kind:'select-choice',token:'no'});
 });
 test('seat '+seat+' optional mulligan draw takes maximum safe count',()=>{
  const q=prompt(seat,{promptType:'SelectPrompt',source:{sourceKind:'engine',sourcePrinting:null,effectName:'WANT_TO_DRAW_CARDS'},
   publicMetadata:{selectionType:'option'},
   choices:[3,2,1,0].map((x,i)=>({kind:'option',token:'c'+x,label:String(x),publicMetadata:{choiceIndex:i}}))},{phase:1});
  assert.deepEqual(decide(seat,q),{kind:'select-choice',token:'c3'});
  q.observation.ownPublic.deckCount=1;
  assert.deepEqual(decide(seat,q),{kind:'select-choice',token:'c1'});
 });
 test('seat '+seat+' VIP pays attention to diverse Trubbish/Mega roles',()=>{
  const q=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'Battle VIP Pass FST 225',effectName:'Battle VIP Pass'},
   publicMetadata:{minimumCount:2,maximumCount:2},
   choices:[choice('t1','Trubbish CRI 56'),choice('t2','Trubbish CRI 56'),choice('m','Mega Absol ex MEG 86'),choice('b','Budew ASC 16')]},
   {ownPublic:own({bench:[]})});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['t1','m']});
 });
 test('seat '+seat+' no Ultra Ball with only protected resources',()=>{
  const q=root(seat,[play('Ultra Ball MEG 131','ball'),pass],{ownHand:['Ultra Ball MEG 131','Secret Box TWM 163','Mega Absol ex MEG 86']});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  q.observation.ownHand=['Ultra Ball MEG 131','Darkness Energy MEE 15','Darkness Energy MEE 15'];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'ball'});
 });
 test('seat '+seat+' masked Prize selection has no hidden identity preference',()=>{
  const q=prompt(seat,{promptType:'ChoosePrizePrompt',publicMetadata:{selectionType:'prize-slots',requiredCount:2},
   choices:['p1','p2','p3'].map(token=>({kind:'prize',token,publicMetadata:{ownerSeat:'actor',sourceZone:'prizes'}}))});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['p1','p2']});
 });
 test('seat '+seat+' copied attack source is explicitly unsupported',()=>{
  const q=prompt(seat,{promptType:'ChooseAttackPrompt',source:{sourceKind:'card-effect',sourcePrinting:'Budew ASC 16',effectName:'Choose attack'},
   publicMetadata:{selectionType:'attack'},
   choices:[{kind:'attack',token:'pollen',label:'Budew — Itchy Pollen',publicMetadata:{sourceAttack:'Itchy Pollen'}}]});
  assert.deepEqual(decide(seat,q),{kind:'select-choice',token:'pollen'});
  q.prompt.source.sourcePrinting='Mimikyu GRI 58';
  assert.deepEqual(decide(seat,q),{kind:'abstain',reasonCode:'UNSUPPORTED_ATTACK_CHOICE_SOURCE'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Dark Patch only with bench Mega and discard Darkness',()=>{
  const q=root(seat,[play('Dark Patch ASR 139','patch'),pass],{ownPublic:own({
   active:mon('Budew ASC 16'),bench:[mon('Mega Absol ex MEG 86')],
   discard:['Darkness Energy MEE 15']})});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'patch'});
  q.observation.ownPublic.bench=[];
  q.observation.ownPublic.active=mon('Mega Absol ex MEG 86');
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
 });
 test('seat '+seat+' Dark Patch discard and bench-target prompts',()=>{
  const q=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'Dark Patch ASR 139',effectName:'Dark Patch'},
   choices:[choice('dark','Darkness Energy MEE 15','discard'),choice('wrong','Psychic Energy MEE 13','discard')]},
   {ownPublic:own({bench:[mon('Mega Absol ex MEG 86')]})});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['dark']});
  q.prompt.promptType='ChoosePokemonPrompt';
  q.prompt.publicMetadata={selectionType:'pokemon',minimumCount:1,maximumCount:1,allowCancel:false};
  q.prompt.choices=[
   {kind:'pokemon',token:'mega',printing:'Mega Absol ex MEG 86',publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}},
   {kind:'pokemon',token:'crobat',printing:'Crobat V DAA 104',publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:1}}
  ];
  q.observation.ownPublic.bench.push(mon('Crobat V DAA 104'));
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['mega']});
 });
 test('seat '+seat+' VS Seeker searches actual discard Supporter',()=>{
  const q=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'VS Seeker PHF 109',effectName:'VS Seeker'},
   choices:[choice('l',"Lillie's Determination MEG 119",'discard'),choice('m','Marnie SSH 169','discard'),
    choice('g','Guzma BUS 115','discard')]});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['l']});
 });
 test('seat '+seat+' Secret Box does not repeat one search category',()=>{
  const q=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'Secret Box TWM 163',effectName:'Secret Box'},
   publicMetadata:{minimumCount:4,maximumCount:4},
   choices:[choice('q','Quick Ball FST 237'),choice('u','Ultra Ball MEG 131'),choice('f','Float Stone BKT 137'),
    choice('m','Marnie SSH 169'),choice('s','Temple of Sinnoh ASR 155')]},
   {ownPublic:own({bench:[mon('Garbodor LTR 68')]}),ownHand:[]});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['q','f','m','s']});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' unknown Garbotoxin state disallows speculative setup Ability',()=>{
  const equipped=mon('Garbodor BKP 57',{tools:['Float Stone BKT 137'],abilitySuppressions:null});
  const q=root(seat,[ability('Dedechange','dede'),attack('Itchy Pollen','pollen'),pass],
   {ownPublic:own({active:mon('Budew ASC 16'),bench:[equipped]}),ownHand:['Darkness Energy MEE 15']});
  assert.equal(policy.garbotoxinStatus(q.observation),'unknown');
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
  equipped.abilitySuppressions=[{abilityName:'Garbotoxin',suppressed:false}];
  assert.equal(policy.garbotoxinStatus(q.observation),'live');
  equipped.abilitySuppressions=[{abilityName:'Garbotoxin',suppressed:true}];
  assert.equal(policy.garbotoxinStatus(q.observation),'inactive');
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'dede'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Float Stone early Active pivot to paid Budew Item lock over bench Garbodor',()=>{
  const activeFloat=play('Float Stone BKT 137','activeFloat',{targetSeat:'actor',targetZone:'active',targetIndex:0});
  const benchFloat=play('Float Stone BKT 137','benchFloat',{targetSeat:'actor',targetZone:'bench',targetIndex:1});
  const my=own({active:mon('Mega Absol ex MEG 86',{energies:[],printed:{retreatCost:['Colorless','Colorless']}}),
   bench:[mon('Budew ASC 16'),mon('Garbodor LTR 68')]});
  const q=root(seat,[activeFloat,benchFloat,pass],{ownPublic:my,globalTurn:2});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'activeFloat'});
  q.actionFrontier.items=[{kind:'retreat',token:'retreatBudew',targetPrinting:'Budew ASC 16'},benchFloat,pass];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'retreatBudew'});
  q.actionFrontier.items=[activeFloat,benchFloat,pass];q.observation.globalTurn=8;
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'benchFloat'});
  q.observation.globalTurn=2;my.active.publicRestrictions={cannotRetreat:true};
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'benchFloat'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Jamming Tower alone does not justify replacing it for Garbotoxin',()=>{
  const q=root(seat,[play('Temple of Sinnoh ASR 155','temple'),attack('Itchy Pollen','budew'),pass],{
   ownPublic:own({active:mon('Budew ASC 16'),bench:[mon('Garbodor LTR 68',{tools:['Float Stone BKT 137'],
    abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:true}]})]}),
   opponentPublic:opp({stadium:['Jamming Tower TWM 153']})});
  assert.equal(policy.toolEnabled(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'budew'});
 });
 test('seat '+seat+' attack-cost stadium denial matters even without Special Energy',()=>{
  const q=root(seat,[play('Temple of Sinnoh ASR 155','temple'),pass],{
   opponentPublic:opp({stadium:['Dimension Valley PHF 93']})});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'temple'});
  q.observation.opponentPublic.stadium=[];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Trubbish+Float+Quick opening preserves Mega Bench and leaves lock pivot',()=>{
  const q=prompt(seat,{source:{sourceKind:'engine',sourcePrinting:null,effectName:'CHOOSE_STARTING_POKEMONS'},
   publicMetadata:{minimumCount:1,maximumCount:6},
   choices:[choice('m','Mega Absol ex MEG 86','hand',{isOwnerVisible:true}),
    choice('t','Trubbish CRI 56','hand',{isOwnerVisible:true}),
    choice('c','Crobat V DAA 104','hand',{isOwnerVisible:true})]},
   {phase:1,ownHand:['Mega Absol ex MEG 86','Trubbish CRI 56','Quick Ball FST 237','Float Stone BKT 137'],
    ownPublic:own({active:null,bench:[]})});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['t','m']});
  q.observation.ownHand=['Mega Absol ex MEG 86','Trubbish CRI 56','Quick Ball FST 237'];
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['m','t']});
 });
 test('seat '+seat+' Quick Ball gets Budew if free early pivot possible',()=>{
  const q=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'Quick Ball FST 237',effectName:'Quick Ball'},
   choices:[choice('b','Budew ASC 16'),choice('m','Mega Absol ex MEG 86'),choice('t','Trubbish CRI 56')]},
   {globalTurn:2,ownPublic:own({active:mon('Trubbish CRI 56',{tools:['Float Stone BKT 137']}),
    bench:[]})});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['b']});
  q.observation.globalTurn=8;
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['m']});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' synthetic six-decision Trubbish Float Quick into next-turn double lock line',()=>{
  const t=mon('Trubbish CRI 56',{printed:{retreatCost:['Colorless']}}),m=mon('Mega Absol ex MEG 86');
  const own1=own({active:t,bench:[m],deckCount:35,prizeCount:6});
  const hand=['Quick Ball FST 237','Float Stone BKT 137','Darkness Energy MEE 15','Marnie SSH 169'];
  const q1=root(seat,[play('Quick Ball FST 237','quick'),pass],{globalTurn:2,ownHand:hand,ownPublic:own1});
  assert.deepEqual(decide(seat,q1),{kind:'select-action',token:'quick'});
  const q2=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'Quick Ball FST 237',effectName:'Quick Ball'},
   publicMetadata:{minimumCount:1,maximumCount:1},
   choices:[choice('budew','Budew ASC 16'),choice('mega','Mega Absol ex MEG 86')]},
   {globalTurn:2,ownHand:['Float Stone BKT 137','Marnie SSH 169'],ownPublic:own1});
  assert.deepEqual(decide(seat,q2),{kind:'select-choices',tokens:['budew']});
  own1.bench.push(mon('Budew ASC 16'));
  const q3=root(seat,[play('Float Stone BKT 137','float',{targetSeat:'actor',targetZone:'active'}),pass],
   {globalTurn:2,ownHand:['Float Stone BKT 137','Marnie SSH 169'],ownPublic:own1});
  assert.deepEqual(decide(seat,q3),{kind:'select-action',token:'float'});
  t.tools=['Float Stone BKT 137'];
  const q4=root(seat,[{kind:'retreat',token:'retreatBudew',targetPrinting:'Budew ASC 16'},pass],{
   globalTurn:2,ownHand:['Marnie SSH 169'],ownPublic:own1});
  assert.deepEqual(decide(seat,q4),{kind:'select-action',token:'retreatBudew'});
  own1.active=mon('Budew ASC 16');own1.bench=[m,t];
  const q5=root(seat,[attack('Itchy Pollen','pollen'),pass],{globalTurn:2,ownPublic:own1});
  assert.deepEqual(decide(seat,q5),{kind:'select-action',token:'pollen'});
  const q6=root(seat,[play('Garbodor LTR 68','evolve'),attack('Itchy Pollen','pollen'),pass],{
   globalTurn:4,ownHand:['Garbodor LTR 68'],ownPublic:own1});
  assert.deepEqual(decide(seat,q6),{kind:'select-action',token:'evolve'});
  own1.bench[1]=mon('Garbodor LTR 68',{tools:['Float Stone BKT 137'],abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:false}]});
  assert.equal(policy.garbotoxinStatus(q6.observation),'live');
  q6.actionFrontier.items=[attack('Itchy Pollen','pollen'),pass];
  assert.deepEqual(decide(seat,q6),{kind:'select-action',token:'pollen'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Ultra Ball joint payment preserves manual Energy for unfunded Mega',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[mon('Mega Absol ex MEG 86',{energies:[]})]});
  const u=play('Ultra Ball MEG 131','ultra');
  const q=root(seat,[u,pass],{ownHand:['Ultra Ball MEG 131','Darkness Energy MEE 15','Darkness Energy MEE 15'],
   ownPublic:board,ownTurnResources:{energyPlayedTurn:false}});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  q.observation.ownHand=['Ultra Ball MEG 131','Darkness Energy MEE 15','Darkness Energy MEE 15','Darkness Energy MEE 15'];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'ultra'});
  const pc=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'Ultra Ball MEG 131',effectName:'Ultra Ball'},
   publicMetadata:{minimumCount:2,maximumCount:2},
   choices:[choice('d1','Darkness Energy MEE 15','hand'),choice('d2','Darkness Energy MEE 15','hand'),
    choice('d3','Darkness Energy MEE 15','hand')]},{ownPublic:board,ownHand:q.observation.ownHand.slice(1),
    ownTurnResources:{energyPlayedTurn:false}});
  assert.deepEqual(decide(seat,pc),{kind:'select-choices',tokens:['d1','d2']});
 });
 test('seat '+seat+' preserves last Garbotoxin Float in discard-choice prompt',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[mon('Garbodor LTR 68',{tools:[]})]});
  const q=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'Ultra Ball MEG 131',effectName:'Ultra Ball'},
   publicMetadata:{minimumCount:2,maximumCount:2},
   choices:[choice('f1','Float Stone BKT 137','hand'),choice('f2','Float Stone BKT 137','hand'),
     choice('vip','Battle VIP Pass FST 225','hand')]},{ownPublic:board,globalTurn:3,
    ownHand:['Float Stone BKT 137','Float Stone BKT 137','Battle VIP Pass FST 225']});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['vip','f1']});
  q.prompt.choices.splice(2,1);
  assert.deepEqual(decide(seat,q),{kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'});
 });
 test('seat '+seat+' urgent second-turn Budew pivot overrides last Energy discard reserve',()=>{
  const board=own({active:mon('Trubbish CRI 56'),bench:[mon('Mega Absol ex MEG 86',{energies:[]})]});
  const h=['Quick Ball FST 237','Float Stone BKT 137','Darkness Energy MEE 15'];
  const q=root(seat,[play('Quick Ball FST 237','quick'),pass],{globalTurn:2,ownPublic:board,ownHand:h});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'quick'});
  const pc=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'Quick Ball FST 237',effectName:'Quick Ball'},
   choices:[choice('dark','Darkness Energy MEE 15','hand'),choice('float','Float Stone BKT 137','hand')]},
   {globalTurn:2,ownPublic:board,ownHand:['Float Stone BKT 137','Darkness Energy MEE 15']});
  assert.deepEqual(decide(seat,pc),{kind:'select-choices',tokens:['dark']});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' physical 200 Claw doubles to 400 vs Darkness-weak Shadow VMAX',()=>{
  const mega=mon('Mega Absol ex MEG 86',{energies:['Darkness Energy MEE 15','Darkness Energy MEE 15','Darkness Energy MEE 15']});
  const vmax=mon('Shadow Rider Calyrex VMAX CRE 75',{hp:320,damage:0,printed:{
   subtypes:['VMAX'],weakness:[{type:'Darkness',value:'×2'}],resistance:[{type:'Fighting',value:'-30'}]}});
  const c=attack('Claw of Darkness','claw');
  const q=root(seat,[c,play('Float Stone BKT 137','tool',{targetSeat:'actor',targetZone:'bench',targetIndex:0}),pass],{
   ownPublic:own({active:mega,bench:[mon('Garbodor LTR 68')]}),opponentPublic:opp({active:vmax})});
  assert.equal(policy.projectedClawDamage(c,q.observation),400);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'tool'});
  q.actionFrontier.items=[c,pass];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'claw'});
  q.actionFrontier.items=[c,play('Float Stone BKT 137','tool',{targetSeat:'actor',targetZone:'bench',targetIndex:0}),pass];
  c.publicMetadata.hasUnmodeledModifier=true;
  assert.equal(policy.projectedClawDamage(c,q.observation),null);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'tool'});
 });
 test('seat '+seat+' Muscle Band applies before Darkness weakness and inactive when Jamming Tower live',()=>{
  const mega=mon('Mega Absol ex MEG 86',{tools:['Muscle Band XY 121']});
  const vmax=mon('Shadow Rider Calyrex VMAX CRE 75',{hp:320,printed:{
   subtypes:['VMAX'],weakness:[{type:'Darkness',value:'×2'}]}});
  const c=attack('Claw of Darkness','claw');
  const q=root(seat,[c,pass],{ownPublic:own({active:mega}),opponentPublic:opp({active:vmax})});
  assert.equal(policy.projectedClawDamage(c,q.observation),440);
  q.observation.opponentPublic.stadium=['Jamming Tower TWM 153'];
  assert.equal(policy.projectedClawDamage(c,q.observation),400);
 });
 test('seat '+seat+' neutral 200 Claw is not invented one-hit KO into 320 HP VMAX',()=>{
  const mega=mon('Mega Absol ex MEG 86');
  const target=mon('Shadow Rider Calyrex VMAX CRE 75',{hp:320,damage:0,printed:{subtypes:['VMAX'],
   weakness:[{type:'Grass',value:'×2'}]}});
  const c=attack('Claw of Darkness','claw');
  const q=root(seat,[c,play('Float Stone BKT 137','tool',{targetSeat:'actor',targetZone:'bench',targetIndex:0}),pass],{
    ownPublic:own({active:mega,bench:[mon('Garbodor LTR 68')]}),
    opponentPublic:opp({active:target})});
  assert.equal(policy.projectedClawDamage(c,q.observation),200);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'tool'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Claw of Darkness selects a revealed opponent ACE SPEC, not stale Battle VIP Pass',()=>{
  const q=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'Mega Absol ex MEG 86',effectName:'Claw of Darkness'},
   publicMetadata:{minimumCount:1,maximumCount:1},
   choices:[
    {kind:'card',token:'vip',printing:'Battle VIP Pass FST 225',publicMetadata:{ownerSeat:'opponent',sourceZone:'hand',isOwnerVisible:true}},
    {kind:'card',token:'ace',printing:'Secret Box TWM 163',publicMetadata:{ownerSeat:'opponent',sourceZone:'hand',isOwnerVisible:true}},
    {kind:'card',token:'dark',printing:'Darkness Energy MEE 15',publicMetadata:{ownerSeat:'opponent',sourceZone:'hand',isOwnerVisible:true}}
   ]},{globalTurn:5});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['ace']});
  q.prompt.choices[1].publicMetadata.isOwnerVisible=false;
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['dark']});
 });
 test('seat '+seat+' Claw targets opponent Dedenne when live and ignores when Garbotoxin active',()=>{
  const q=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'Mega Absol ex MEG 86',effectName:'Claw of Darkness'},
   choices:[
    {kind:'card',token:'dede',printing:'Dedenne-GX UNB 57',publicMetadata:{ownerSeat:'opponent',sourceZone:'hand',isOwnerVisible:true}},
    {kind:'card',token:'guzma',printing:'Guzma BUS 115',publicMetadata:{ownerSeat:'opponent',sourceZone:'hand',isOwnerVisible:true}}
   ]});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['dede']});
  q.observation.ownPublic.bench[0].tools=['Float Stone BKT 137'];
  q.observation.ownPublic.bench[0].abilitySuppressions=[{abilityName:'Garbotoxin',suppressed:false}];
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['guzma']});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' source Karen before Budew locks Regidrago double Dragon payload',()=>{
  const my=own({active:mon('Budew ASC 16')});
  const reg=opp({active:mon('Regidrago VSTAR SIT 136'),bench:[mon('Regidrago V SIT 135')],
   discard:['Dialga-GX UPR 100','Dragapult ex TWM 130']});
  const q=root(seat,[play('Karen XYP 177','karen'),play('Marnie SSH 169','marnie'),
    attack('Itchy Pollen','pollen'),pass],{
    ownPublic:my,opponentPublic:reg,ownHand:['Marnie SSH 169','Karen XYP 177']});
  assert.equal(policy.regidragoPayloadCount(q.observation),2);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'karen'});
  q.observation.ownTurnResources.supporterPlayedTurn=1;
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
 });
 test('seat '+seat+' Karen does not displace draw without Dragon payload or Regidrago on board',()=>{
  const reg=opp({active:mon('Regidrago VSTAR SIT 136'),discard:[]});
  const q=root(seat,[play('Karen XYP 177','karen'),play('Marnie SSH 169','marnie'),pass],{
   ownHand:['Karen XYP 177','Marnie SSH 169'],opponentPublic:reg});
  assert.equal(policy.regidragoPayloadCount(q.observation),0);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'marnie'});
  q.observation.opponentPublic.active=mon('Shadow Rider Calyrex VMAX CRE 75');
  q.observation.opponentPublic.discard=['Dialga-GX UPR 100','Dragapult ex TWM 130'];
  assert.equal(policy.regidragoPayloadCount(q.observation),0);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'marnie'});
 });
 test('seat '+seat+' VS Seeker returns Karen in actual Regidrago payload threat',()=>{
  const reg=opp({active:mon('Regidrago VSTAR SIT 136'),discard:['Dragapult ex TWM 130','Noivern ex PAL 153']});
  const q=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'VS Seeker PHF 109',effectName:'VS Seeker'},
   choices:[choice('k','Karen XYP 177','discard'),choice('l',"Lillie's Determination MEG 119",'discard')]},
   {opponentPublic:reg});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['k']});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Temple strands source VSTAR Apex Dragon on Double Dragon Energy before Budew',()=>{
  const reg=opp({active:mon('Regidrago VSTAR SIT 136',{energies:['Double Dragon Energy ROS 97','Double Dragon Energy ROS 97']})});
  const q=root(seat,[play('Temple of Sinnoh ASR 155','temple'),attack('Itchy Pollen','pollen'),pass],
   {ownPublic:own({active:mon('Budew ASC 16')}),opponentPublic:reg});
  assert.equal(policy.templeStrandsApexDragon(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'temple'});
  reg.active.energies.push('Grass Energy MEE 8','Grass Energy MEE 8','Fire Energy MEE 2');
  assert.equal(policy.templeStrandsApexDragon(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'temple'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Plumeria denies DDE-powered Regidrago only when two discards payable',()=>{
  const reg=opp({active:mon('Regidrago VSTAR SIT 136',{energies:['Double Dragon Energy ROS 97',
   'Double Dragon Energy ROS 97']})});
  const items=[play('Plumeria BUS 120','plumeria'),attack('Itchy Pollen','pollen'),pass];
  const q=root(seat,items,{globalTurn:5,ownPublic:own({active:mon('Budew ASC 16')}),
   opponentPublic:reg,ownHand:['Plumeria BUS 120','Battle VIP Pass FST 225','Darkness Energy MEE 15']});
  assert.equal(policy.plumeriaDenialScore(q.observation),690);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'plumeria'});
  q.observation.ownHand=['Plumeria BUS 120','Forest Seal Stone SIT 156','Secret Box TWM 163'];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
 });
 test('seat '+seat+' Plumeria pays actual two-card prompt without burning protected ACE SPEC',()=>{
  const q=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'Plumeria BUS 120',effectName:'Plumeria'},
   publicMetadata:{minimumCount:2,maximumCount:2},choices:[
    choice('vip','Battle VIP Pass FST 225','hand'),choice('dark','Darkness Energy MEE 15','hand'),
    choice('ace','Secret Box TWM 163','hand')]},
   {globalTurn:5,ownHand:['Battle VIP Pass FST 225','Darkness Energy MEE 15','Secret Box TWM 163']});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['vip','dark']});
 });
 test('seat '+seat+' Plumeria chooses visible opponent Regidrago then Double Dragon Energy',()=>{
  const reg=opp({active:mon('Regidrago VSTAR SIT 136',{energies:['Double Dragon Energy ROS 97',
    'Fire Energy MEE 2']}),bench:[mon('Shadow Rider Calyrex V CRE 74',{energies:['Psychic Energy MEE 5']})]});
  const q=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Plumeria BUS 120',effectName:'Plumeria'},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},choices:[
    {kind:'pokemon',token:'active',printing:'Regidrago VSTAR SIT 136',
     publicMetadata:{ownerSeat:'opponent',targetZone:'active'}},
    {kind:'pokemon',token:'bench',printing:'Shadow Rider Calyrex V CRE 74',
     publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:0}}
   ]},{opponentPublic:reg});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['active']});
  q.prompt.promptType='ChooseEnergyPrompt';
  q.prompt.publicMetadata={selectionType:'energy-payment',energyCount:2,allowCancel:false};
  q.prompt.choices=[
   {kind:'energy',token:'basic',printing:'Fire Energy MEE 2',publicMetadata:{ownerSeat:'opponent',sourceZone:'attached',isOwnerVisible:true}},
   {kind:'energy',token:'double',printing:'Double Dragon Energy ROS 97',publicMetadata:{ownerSeat:'opponent',sourceZone:'attached',isOwnerVisible:true}}
  ];
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['double']});
 });
 test('seat '+seat+' Karen Supporter wins contention versus Plumeria when Budew can lock 2 Dragon payloads',()=>{
  const reg=opp({active:mon('Regidrago VSTAR SIT 136',{energies:['Double Dragon Energy ROS 97']}),
   discard:['Dialga-GX UPR 100','Dragapult ex TWM 130']});
  const q=root(seat,[play('Karen XYP 177','karen'),play('Plumeria BUS 120','plum'),
    attack('Itchy Pollen','pollen'),pass],{globalTurn:5,ownPublic:own({active:mon('Budew ASC 16')}),
    opponentPublic:reg,ownHand:['Karen XYP 177','Plumeria BUS 120','Darkness Energy MEE 15',
     'Battle VIP Pass FST 225']});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'karen'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' source Guzma chooses Darkness-weak three-Prize VMAX over Dedenne without fabricated HP choice metadata',()=>{
  const mega=mon('Mega Absol ex MEG 86',{energies:['Darkness Energy MEE 15','Darkness Energy MEE 15','Darkness Energy MEE 15']});
  const vmax=mon('Shadow Rider Calyrex VMAX CRE 75',{hp:320,printed:{
   subtypes:['VMAX'],weakness:[{type:'Darkness',value:'×2'}]}});
  const dede=mon('Dedenne-GX UNB 57',{hp:160,printed:{subtypes:['GX'],weakness:[]}});
  const board=own({active:mon('Budew ASC 16'),bench:[mega]});
  const theirs=opp({active:mon('Regidrago VSTAR SIT 136',{hp:280}),bench:[dede,vmax]});
  const g=play('Guzma BUS 115','gust');
  const q=root(seat,[g,attack('Itchy Pollen','pollen'),pass],
    {ownPublic:board,opponentPublic:theirs,ownHand:['Guzma BUS 115']});
  assert.equal(policy.guzmaRootScore(q.observation),905);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'gust'});
  const qp=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
   choices:[{kind:'pokemon',token:'dede',printing:'Dedenne-GX UNB 57',publicMetadata:{
       ownerSeat:'opponent',targetZone:'bench',benchIndex:0}},
    {kind:'pokemon',token:'vmax',printing:'Shadow Rider Calyrex VMAX CRE 75',publicMetadata:{
       ownerSeat:'opponent',targetZone:'bench',benchIndex:1}}]},
   {ownPublic:board,opponentPublic:theirs});
  assert.deepEqual(decide(seat,qp),{kind:'select-choices',tokens:['vmax']});
  qp.prompt.choices=[{kind:'pokemon',token:'mega',printing:'Mega Absol ex MEG 86',publicMetadata:{
    ownerSeat:'actor',targetZone:'bench',benchIndex:0}},
   {kind:'pokemon',token:'other',printing:'Crobat V DAA 104',publicMetadata:{
    ownerSeat:'actor',targetZone:'bench',benchIndex:1}}];
  board.bench.push(mon('Crobat V DAA 104'));
  assert.deepEqual(decide(seat,qp),{kind:'select-choices',tokens:['mega']});
 });
 test('seat '+seat+' no Guzma when only powered Mega is Active and no free Float return',()=>{
  const mega=mon('Mega Absol ex MEG 86',{energies:['Darkness Energy MEE 15','Darkness Energy MEE 15','Darkness Energy MEE 15']});
  const target=mon('Dedenne-GX UNB 57',{hp:160,printed:{subtypes:['GX']}});
  const board=own({active:mega,bench:[mon('Trubbish CRI 56')]});
  const theirs=opp({active:mon('Regidrago VSTAR SIT 136'),bench:[target]});
  const q=root(seat,[play('Guzma BUS 115','gust'),attack('Claw of Darkness','claw'),pass],
    {ownPublic:board,opponentPublic:theirs,ownHand:['Guzma BUS 115']});
  assert.equal(policy.guzmaRootScore(q.observation),0);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'claw'});
  board.bench[0].tools=['Float Stone BKT 137'];
  assert(policy.guzmaRootScore(q.observation)>0);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'gust'});
 });
 test('seat '+seat+' Guzma opponent terminal 60-counter target goes first only when powered bench Mega exists',()=>{
  const benchMega=mon('Mega Absol ex MEG 86',{energies:['Darkness Energy MEE 15','Darkness Energy MEE 15','Darkness Energy MEE 15']});
  const target=mon('Shadow Rider Calyrex VMAX CRE 75',{hp:320,damage:60,
    printed:{subtypes:['VMAX'],weakness:[]}});
  const q=root(seat,[play('Guzma BUS 115','gust'),attack('Itchy Pollen','pollen'),pass],{
   ownPublic:own({active:mon('Budew ASC 16'),bench:[benchMega],prizeCount:3}),
   opponentPublic:opp({active:mon('Regidrago VSTAR SIT 136',{hp:280}),bench:[target]})});
  assert.equal(policy.guzmaRootScore(q.observation),985);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'gust'});
  q.observation.ownPublic.bench[0].energies=[];
  assert.equal(policy.guzmaRootScore(q.observation),0);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Boost Shake ends turn: paid Budew Item lock is chosen instead',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[mon('Trubbish CRI 56',{tools:['Float Stone BKT 137']})]});
  const q=root(seat,[play('Boost Shake EVS 142','boost'),attack('Itchy Pollen','pollen'),pass],{
   ownPublic:board,globalTurn:2});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
  q.actionFrontier.items=[play('Boost Shake EVS 142','boost'),pass];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'boost'});
 });
 test('seat '+seat+' Boost Shake cannot waste pending manual Darkness into Mega attacker',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[
   mon('Trubbish CRI 56',{tools:['Float Stone BKT 137']}),mon('Mega Absol ex MEG 86',{energies:[]})]});
  const q=root(seat,[play('Boost Shake EVS 142','boost'),pass],{
    ownPublic:board,ownHand:['Darkness Energy MEE 15'],globalTurn:2,
    ownTurnResources:{energyPlayedTurn:false}});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  q.observation.ownTurnResources.energyPlayedTurn=true;
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'boost'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' CRI Trubbish paid Acid Spray can challenge DDE Regidrago when no Budew',()=>{
  const their=opp({active:mon('Regidrago VSTAR SIT 136',{energies:['Double Dragon Energy ROS 97']})});
  const q=root(seat,[attack('Acid Spray','acid'),pass],
   {ownPublic:own({active:mon('Trubbish CRI 56',{energies:['Darkness Energy MEE 15']})}),
    opponentPublic:their});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'acid'});
  their.active.energies=[];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'acid'});
  q.actionFrontier.items=[attack('Acid Spray','acid',false),pass];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
 });
 test('seat '+seat+' coin-head Acid Spray selects opponent Double Dragon Energy',()=>{
  const q=prompt(seat,{promptType:'ChooseEnergyPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Trubbish CRI 56',effectName:'Acid Spray'},
   publicMetadata:{selectionType:'energy-payment',energyCount:2},
   choices:[{kind:'energy',token:'grass',printing:'Grass Energy MEE 8',
    publicMetadata:{ownerSeat:'opponent',sourceZone:'attached',isOwnerVisible:true}},
   {kind:'energy',token:'dde',printing:'Double Dragon Energy ROS 97',
    publicMetadata:{ownerSeat:'opponent',sourceZone:'attached',isOwnerVisible:true}}]});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['dde']});
 });
 test('seat '+seat+' printed Trubbish CRI ChooseAttackPrompt supported',()=>{
  const q=prompt(seat,{promptType:'ChooseAttackPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Trubbish CRI 56',effectName:'Choose attack'},
   publicMetadata:{selectionType:'attack'},
   choices:[{kind:'attack',token:'acid',label:'Trubbish CRI 56 — Acid Spray',
     publicMetadata:{sourceAttack:'Acid Spray'}}]});
  assert.deepEqual(decide(seat,q),{kind:'select-choice',token:'acid'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' VS Seeker->Karen connector outranks premature Budew lock vs Regidrago',()=>{
  const items=[play('VS Seeker PHF 109','seeker'),attack('Itchy Pollen','pollen'),pass];
  const ownBoard=own({active:mon('Budew ASC 16'),discard:['Karen XYP 177']});
  const enemy=opp({active:mon('Regidrago VSTAR SIT 136'),
   discard:['Dialga-GX UPR 100','Dragapult ex TWM 130']});
  const q=root(seat,items,{ownPublic:ownBoard,opponentPublic:enemy,
   ownHand:['VS Seeker PHF 109','Darkness Energy MEE 15']});
  assert(policy.vsSeekerDenialScore(q.observation,items)>=700);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'seeker'});
  const qp=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'VS Seeker PHF 109',effectName:'VS Seeker'},
   choices:[choice('k','Karen XYP 177','discard'),choice('m','Marnie SSH 169','discard')]},
   {ownPublic:ownBoard,opponentPublic:enemy});
  assert.deepEqual(decide(seat,qp),{kind:'select-choices',tokens:['k']});
  q.observation.ownPublic.discard=[];
  q.observation.ownHand=['Karen XYP 177','Darkness Energy MEE 15'];
  q.actionFrontier.items=[play('Karen XYP 177','karen'),attack('Itchy Pollen','pollen'),pass];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'karen'});
  q.observation.opponentPublic.discard=[];
  q.actionFrontier.items=[attack('Itchy Pollen','pollen'),pass];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
 });
 test('seat '+seat+' no VS Seeker detour with no Regidrago discard payload',()=>{
  const q=root(seat,[play('VS Seeker PHF 109','seeker'),attack('Itchy Pollen','pollen'),pass],{
   ownPublic:own({active:mon('Budew ASC 16'),discard:['Karen XYP 177']}),
   opponentPublic:opp({active:mon('Regidrago VSTAR SIT 136'),discard:[]})});
  assert.equal(policy.vsSeekerDenialScore(q.observation,q.actionFrontier.items),0);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
 });
 test('seat '+seat+' VS Seeker->Plumeria over early attack with sole DDE and cheap discards',()=>{
  const q=root(seat,[play('VS Seeker PHF 109','seeker'),attack('Itchy Pollen','pollen'),pass],{
   ownPublic:own({active:mon('Budew ASC 16'),discard:['Plumeria BUS 120']}),
   ownHand:['VS Seeker PHF 109','Battle VIP Pass FST 225','Darkness Energy MEE 15'],
   opponentPublic:opp({active:mon('Regidrago VSTAR SIT 136',
    {energies:['Double Dragon Energy ROS 97']})}),globalTurn:4});
  assert(policy.vsSeekerDenialScore(q.observation,q.actionFrontier.items)>530);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'seeker'});
  q.observation.ownHand=['VS Seeker PHF 109','Secret Box TWM 163','Float Stone BKT 137'];
  assert.equal(policy.vsSeekerDenialScore(q.observation,q.actionFrontier.items),0);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Temple disables Iron Thorns DCE plus Basic Lightning Volt Cyclone',()=>{
  const active=mon('Iron Thorns ex TWM 77',{energies:['Lightning Energy MEE 4','Double Colorless Energy SUM 136']});
  const q=root(seat,[play('Temple of Sinnoh ASR 155','temple'),attack('Itchy Pollen','pollen'),pass],{
   ownPublic:own({active:mon('Budew ASC 16')}),opponentPublic:opp({active})});
  assert.equal(policy.templeStrandsIronThorns(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'temple'});
  active.energies.push('Double Colorless Energy SUM 136');
  assert.equal(policy.templeStrandsIronThorns(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'temple'});
 });
 test('seat '+seat+' Temple replaces Thunder Mountain first-turn DCE-powered Thorns attack',()=>{
  const active=mon('Iron Thorns ex TWM 77',{energies:['Double Colorless Energy SUM 136']});
  const q=root(seat,[play('Temple of Sinnoh ASR 155','temple'),attack('Itchy Pollen','pollen'),pass],{
   ownPublic:own({active:mon('Budew ASC 16')}),
   opponentPublic:opp({active,stadium:['Thunder Mountain LOT 191']})});
  assert.equal(policy.templeStrandsIronThorns(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'temple'});
  q.observation.opponentPublic.stadium=[];
  assert.equal(policy.templeStrandsIronThorns(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'temple'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' source rank6 Thorns Speed Lightning+DCE cannot attack under Temple',()=>{
  const thorns=mon('Iron Thorns ex TWM 77',{energies:[
    'Speed Lightning Energy RCL 173','Double Colorless Energy SUM 136']});
  const q=root(seat,[play('Temple of Sinnoh ASR 155','temple'),
     attack('Itchy Pollen','pollen'),pass],{
   ownPublic:own({active:mon('Budew ASC 16')}),
   opponentPublic:opp({active:thorns})});
  assert.equal(policy.templeStrandsIronThorns(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'temple'});
  thorns.energies.push('Lightning Energy MEE 4');
  assert.equal(policy.templeStrandsIronThorns(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'temple'});
 });
 test('seat '+seat+' source rank24 Thorns double Speed Lightning with Thunder Mountain loses Lightning under Temple',()=>{
  const thorns=mon('Iron Thorns ex TWM 77',{energies:[
    'Speed Lightning Energy RCL 173','Speed Lightning Energy RCL 173']});
  const q=root(seat,[play('Temple of Sinnoh ASR 155','temple'),pass],{
   opponentPublic:opp({active:thorns,stadium:['Thunder Mountain ♢ LOT 191']})});
  assert.equal(policy.templeStrandsIronThorns(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'temple'});
  q.observation.opponentPublic.stadium=[];
  assert.equal(policy.templeStrandsIronThorns(q.observation),false);
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Thorns Initialization source suppresses bench draw/support Rule Box abilities',()=>{
  const thorns=mon('Iron Thorns ex TWM 77',{abilitySuppressions:[
    {abilityName:'Initialization',suppressed:false}]});
  const q=root(seat,[play('Crobat V DAA 104','crobat'),play('Dedenne-GX UNB 57','dedenne'),
    play('Tapu Lele-GX GRI 60','tapu'),attack('Itchy Pollen','pollen'),pass],
   {ownPublic:own({active:mon('Budew ASC 16'),bench:[]}),opponentPublic:opp({active:thorns})});
  for(const p of ['Crobat V DAA 104','Dedenne-GX UNB 57','Tapu Lele-GX GRI 60'])
   assert.equal(policy.benchSupportAbilityUsable(p,q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
  thorns.abilitySuppressions=[{abilityName:'Initialization',suppressed:true}];
  assert.equal(policy.benchSupportAbilityUsable('Crobat V DAA 104',q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'crobat'});
 });
 test('seat '+seat+' Wobbuffet Bide Barricade permits Psychic Tapu but blocks Dark Crobat',()=>{
  const wob=mon('Wobbuffet PHF 36',{abilitySuppressions:[
    {abilityName:'Bide Barricade',suppressed:false}]});
  const q=root(seat,[play('Crobat V DAA 104','crobat'),play('Tapu Lele-GX GRI 60','tapu'),pass],
   {ownPublic:own({active:mon('Budew ASC 16'),bench:[]}),
    opponentPublic:opp({active:wob})});
  assert.equal(policy.benchSupportAbilityUsable('Crobat V DAA 104',q.observation),false);
  assert.equal(policy.benchSupportAbilityUsable('Tapu Lele-GX GRI 60',q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'tapu'});
 });
 test('seat '+seat+' core Trubbish+Mega Bench reservation blocks extra Crobat at four occupied',()=>{
  const ownP=own({active:mon('Budew ASC 16'),bench:[
    mon('Garbodor LTR 68'),mon('Crobat V DAA 104'),
    mon('Dedenne-GX UNB 57'),mon('Tapu Lele-GX GRI 60')]});
  const q=root(seat,[play('Crobat V DAA 104','crobat'),pass],{ownPublic:ownP});
  assert.equal(policy.benchSupportFits(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  ownP.bench.push(mon('Mega Absol ex MEG 86'));
  assert.equal(policy.benchSupportFits(q.observation),false);
  ownP.bench.pop();
  ownP.bench.pop();
  assert.equal(policy.benchSupportFits(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'crobat'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Tool-bearing Garbodor cannot preempt legal pending Wonder Tag search',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[
   mon('Trubbish CRI 56',{tools:['Float Stone BKT 137']}),
   mon('Tapu Lele-GX GRI 60')]});
  const q=root(seat,[play('Garbodor LTR 68','garb'),ability('Wonder Tag','tag'),
    attack('Itchy Pollen','pollen'),pass],{
   ownPublic:board,ownHand:['Garbodor LTR 68','Marnie SSH 169']});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'tag'});
  q.actionFrontier.items=[play('Garbodor LTR 68','garb'),attack('Itchy Pollen','pollen'),pass];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'garb'});
 });
 test('seat '+seat+' no need to delay evolution if Trubbish not yet Tool-equipped',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[
   mon('Trubbish CRI 56',{tools:[]}),mon('Tapu Lele-GX GRI 60')]});
  const q=root(seat,[play('Garbodor LTR 68','garb'),ability('Wonder Tag','tag'),pass],{
   ownPublic:board,ownHand:['Garbodor LTR 68']});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'garb'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Compressor Karen VS Seeker combo converts Dragon discard into one-turn Budew denial',()=>{
  const enemy=opp({active:mon('Regidrago VSTAR SIT 136'),
   discard:['Dialga-GX UPR 100','Dragapult ex TWM 130']});
  const ownP=own({active:mon('Budew ASC 16'),discard:[]});
  const root1=root(seat,[play('Battle Compressor PHF 92','compressor'),
      play('VS Seeker PHF 109','seeker'),attack('Itchy Pollen','pollen'),pass],{
   opponentPublic:enemy,ownPublic:ownP,
   ownHand:['Battle Compressor PHF 92','VS Seeker PHF 109']});
  assert.equal(policy.battleCompressorKarenLineScore(root1.observation),690);
  assert.deepEqual(decide(seat,root1),{kind:'select-action',token:'compressor'});
  const p1=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'Battle Compressor PHF 92',
    effectName:'Battle Compressor'},publicMetadata:{minimumCount:1,maximumCount:3},
   choices:[choice('dark','Darkness Energy MEE 15'),choice('k','Karen XYP 177'),
    choice('vip','Battle VIP Pass FST 225')]},{
     ownPublic:ownP,opponentPublic:enemy,
     ownHand:['VS Seeker PHF 109'],globalTurn:4});
  const search=decide(seat,p1);
  assert.deepEqual(search,{kind:'select-choices',tokens:['k','dark','vip']});
  ownP.discard=['Karen XYP 177','Darkness Energy MEE 15'];
  root1.observation.ownHand=['VS Seeker PHF 109'];
  root1.actionFrontier.items=[play('VS Seeker PHF 109','seeker'),
   attack('Itchy Pollen','pollen'),pass];
  assert.deepEqual(decide(seat,root1),{kind:'select-action',token:'seeker'});
  const p2=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'VS Seeker PHF 109',effectName:'VS Seeker'},
   choices:[choice('k','Karen XYP 177','discard')]},{
     ownPublic:ownP,opponentPublic:enemy});
  assert.deepEqual(decide(seat,p2),{kind:'select-choices',tokens:['k']});
  root1.observation.ownHand=['Karen XYP 177'];
  root1.actionFrontier.items=[play('Karen XYP 177','karen'),attack('Itchy Pollen','pollen'),pass];
  assert.deepEqual(decide(seat,root1),{kind:'select-action',token:'karen'});
  enemy.discard=[];
  root1.actionFrontier.items=[attack('Itchy Pollen','pollen'),pass];
  assert.deepEqual(decide(seat,root1),{kind:'select-action',token:'pollen'});
 });
 test('seat '+seat+' no Karen dump absent recovery VS or when opponent already emptied discard',()=>{
  const board=own({active:mon('Budew ASC 16')});
  const enemy=opp({active:mon('Regidrago VSTAR SIT 136'),
   discard:['Dialga-GX UPR 100','Dragapult ex TWM 130']});
  const q=root(seat,[play('Battle Compressor PHF 92','compressor'),
   attack('Itchy Pollen','pollen'),pass],{
   ownPublic:board,opponentPublic:enemy,ownHand:['Battle Compressor PHF 92']});
  assert.equal(policy.battleCompressorKarenLineScore(q.observation),0);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'compressor'});
  enemy.discard=[];
  q.observation.ownHand=['Battle Compressor PHF 92','VS Seeker PHF 109'];
  assert.equal(policy.battleCompressorKarenLineScore(q.observation),0);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'compressor'});
 });
 test('seat '+seat+' Karen Prized: Compressor searches only genuinely offered Darkness',()=>{
  const enemy=opp({active:mon('Regidrago VSTAR SIT 136'),
   discard:['Dialga-GX UPR 100','Dragapult ex TWM 130']});
  const q=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'Battle Compressor PHF 92',
    effectName:'Battle Compressor'},publicMetadata:{minimumCount:1,maximumCount:3},
   choices:[choice('d1','Darkness Energy MEE 15'),choice('d2','Darkness Energy MEE 15')]},
    {opponentPublic:enemy,ownHand:['VS Seeker PHF 109']});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['d1','d2']});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' nonterminal Budew attack waits for affordable Quick Ball search and Trainers Mail',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[mon('Mega Absol ex MEG 86')]});
  const q=root(seat,[play('Quick Ball FST 237','ball'),attack('Itchy Pollen','pollen'),pass],{
   globalTurn:2,ownPublic:board,
   ownHand:['Quick Ball FST 237','Darkness Energy MEE 15','Darkness Energy MEE 15']});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'ball'});
  q.actionFrontier.items=[play("Trainers' Mail ROS 92",'mail'),attack('Itchy Pollen','pollen'),pass];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'mail'});
  q.actionFrontier.items=[attack('Itchy Pollen','pollen'),pass];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
 });
 test('seat '+seat+' terminal winning attack is allowed before optional setup',()=>{
  const board=own({active:mon('Mega Absol ex MEG 86'),bench:[mon('Trubbish CRI 56')]});
  const q=root(seat,[play('Quick Ball FST 237','ball'),
    attack('Terminal Period','terminal'),pass],{
   ownPublic:board,opponentPublic:opp({active:mon('Regidrago VSTAR SIT 136',{hp:280,damage:60})}),
   ownHand:['Quick Ball FST 237','Darkness Energy MEE 15']});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'terminal'});
 });
 test('seat '+seat+' normal Claw attack waits for manual Dark Patch acceleration',()=>{
  const mega=mon('Mega Absol ex MEG 86',{energies:[
   'Darkness Energy MEE 15','Darkness Energy MEE 15','Darkness Energy MEE 15']});
  const board=own({active:mega,bench:[mon('Mega Absol ex MEG 86',{energies:[]})],
   discard:['Darkness Energy MEE 15']});
  const q=root(seat,[play('Dark Patch ASR 139','patch'),attack('Claw of Darkness','claw'),pass],{
   ownPublic:board,opponentPublic:opp({active:mon('Regidrago VSTAR SIT 136',{hp:280})})});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'patch'});
  q.actionFrontier.items=[attack('Claw of Darkness','claw'),pass];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'claw'});
 });
 test('seat '+seat+' protected hand search does not block otherwise available Budew attack',()=>{
  const q=root(seat,[play('Ultra Ball MEG 131','ball'),attack('Itchy Pollen','pollen'),pass],{
   ownPublic:own({active:mon('Budew ASC 16')}),
   ownHand:['Ultra Ball MEG 131','Secret Box TWM 163','Mega Absol ex MEG 86']});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' PAL97 Safeguard prevents fake 200 Claw damage but leaves hand-discard mode',()=>{
  const mega=mon('Mega Absol ex MEG 86',{energies:[
   'Darkness Energy MEE 15','Darkness Energy MEE 15','Darkness Energy MEE 15']});
  const mimikyu=mon('Mimikyu PAL 97',{hp:70,
   abilitySuppressions:[{abilityName:'Safeguard',suppressed:false}]});
  const c=attack('Claw of Darkness','claw');
  const q=root(seat,[c,pass],{ownPublic:own({active:mega}),opponentPublic:opp({active:mimikyu})});
  assert.equal(policy.activeMimikyuSafeguard(q.observation),true);
  assert.equal(policy.projectedClawDamage(c,q.observation),0);
  assert.equal(policy.clawProjectedKnockoutScore(c,q.observation),145);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'claw'});
  mimikyu.abilitySuppressions=[{abilityName:'Safeguard',suppressed:true}];
  assert.equal(policy.activeMimikyuSafeguard(q.observation),false);
  assert.equal(policy.projectedClawDamage(c,q.observation),200);
  assert.equal(policy.clawProjectedKnockoutScore(c,q.observation),770);
 });
 test('seat '+seat+' GRI58 Copycat Mimikyu does not inherit PAL97 Safeguard',()=>{
  const mega=mon('Mega Absol ex MEG 86');
  const q=root(seat,[attack('Claw of Darkness','claw'),pass],{
    ownPublic:own({active:mega}),opponentPublic:opp({active:mon('Mimikyu GRI 58',{hp:70})})});
  assert.equal(policy.activeMimikyuSafeguard(q.observation),false);
  assert.equal(policy.projectedClawDamage(q.actionFrontier.items[0],q.observation),200);
 });
 test('seat '+seat+' Guzma avoids Safeguard PAL Mimikyu when Dedenne is KO-able instead',()=>{
  const mega=mon('Mega Absol ex MEG 86',{energies:[
   'Darkness Energy MEE 15','Darkness Energy MEE 15','Darkness Energy MEE 15']});
  const mime=mon('Mimikyu PAL 97',{hp:70,
   abilitySuppressions:[{abilityName:'Safeguard',suppressed:false}]});
  const dede=mon('Dedenne-GX UNB 57',{hp:160,printed:{subtypes:['GX']}});
  const board=own({active:mon('Budew ASC 16'),bench:[mega]});
  const other=opp({active:mon('Snorlax PGO 55',{hp:150}),bench:[mime,dede]});
  const q=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
   choices:[{kind:'pokemon',token:'mime',printing:'Mimikyu PAL 97',
    publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:0}},
   {kind:'pokemon',token:'dede',printing:'Dedenne-GX UNB 57',
    publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:1}}]},
   {ownPublic:board,opponentPublic:other});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['dede']});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' source Snorlax Block swaps via Guzma to Budew instead of illegal Float retreat',()=>{
  const board=own({active:mon('Mega Absol ex MEG 86',{
    energies:['Darkness Energy MEE 15','Darkness Energy MEE 15','Darkness Energy MEE 15']}),
    bench:[mon('Budew ASC 16')]});
  const theirs=opp({active:mon('Snorlax PGO 55',{abilitySuppressions:[
    {abilityName:'Block',suppressed:false}]}),bench:[mon('Mimikyu PAL 97',{hp:70})]});
  const q=root(seat,[play('Guzma BUS 115','gust'),
    play('Float Stone BKT 137','float',{targetSeat:'actor',targetZone:'active'}),
    {kind:'retreat',token:'retreat',targetPrinting:'Budew ASC 16'},pass],{
    ownPublic:board,opponentPublic:theirs,ownHand:['Guzma BUS 115','Float Stone BKT 137']});
  assert.equal(policy.opponentSnorlaxBlock(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'gust'});
  const tp=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
   choices:[{kind:'pokemon',token:'mime',printing:'Mimikyu PAL 97',
     publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:0}}]},
   {ownPublic:board,opponentPublic:theirs});
  assert.deepEqual(decide(seat,tp),{kind:'select-choices',tokens:['mime']});
  tp.prompt.choices=[{kind:'pokemon',token:'budew',printing:'Budew ASC 16',
   publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}}];
  assert.deepEqual(decide(seat,tp),{kind:'select-choices',tokens:['budew']});
 });
 test('seat '+seat+' Snorlax Block suppression restores Float mobility on Mega',()=>{
  const theirs=opp({active:mon('Snorlax PGO 55',{abilitySuppressions:[
    {abilityName:'Block',suppressed:true}]}),bench:[mon('Mimikyu PAL 97',{hp:70})]});
  const board=own({active:mon('Mega Absol ex MEG 86',{
    printed:{retreatCost:['Colorless','Colorless']}}),bench:[mon('Budew ASC 16')]});
  const q=root(seat,[play('Float Stone BKT 137','float',
    {targetSeat:'actor',targetZone:'active'}),pass],{
    ownPublic:board,opponentPublic:theirs,globalTurn:2,
    ownHand:['Float Stone BKT 137']});
  assert.equal(policy.opponentSnorlaxBlock(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'float'});
  theirs.active.abilitySuppressions=[{abilityName:'Block',suppressed:false}];
  assert.equal(policy.opponentSnorlaxBlock(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' complete core board does not discard Darkness to redundant Quick Ball',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[
   mon('Mega Absol ex MEG 86',{energies:['Darkness Energy MEE 15','Darkness Energy MEE 15','Darkness Energy MEE 15']}),
   mon('Garbodor LTR 68',{tools:['Float Stone BKT 137'],
    abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:false}]}),
   mon('Crobat V DAA 104'),mon('Tapu Lele-GX GRI 60')]});
  const q=root(seat,[play('Quick Ball FST 237','quick'),play('Ultra Ball MEG 131','ultra'),
   attack('Itchy Pollen','pollen'),pass],{
    ownPublic:board,ownHand:['Quick Ball FST 237','Ultra Ball MEG 131',
     'Darkness Energy MEE 15','Darkness Energy MEE 15','Darkness Energy MEE 15']});
  assert.equal(policy.basicSearchDemand(q.observation),false);
  assert.equal(policy.ultraSearchDemand(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
 });
 test('seat '+seat+' Ultra Ball can still fetch Stage1 for Trubbish even with five full Bench slots',()=>{
  const board=own({active:mon('Trubbish CRI 56'),bench:[
    mon('Mega Absol ex MEG 86',{energies:['Darkness Energy MEE 15','Darkness Energy MEE 15','Darkness Energy MEE 15']}),
    mon('Budew ASC 16'),mon('Crobat V DAA 104'),
    mon('Tapu Lele-GX GRI 60'),mon('Dedenne-GX UNB 57')]});
  const q=root(seat,[play('Ultra Ball MEG 131','ultra'),pass],{
   ownPublic:board,ownHand:['Ultra Ball MEG 131','Darkness Energy MEE 15','Darkness Energy MEE 15']});
  assert.equal(policy.basicSearchDemand(q.observation),false);
  assert.equal(policy.ultraSearchDemand(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'ultra'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' all two Mega Absol discarded: Karen recovery beats hand-refill Supporter',()=>{
  const board=own({active:mon('Budew ASC 16'),
   bench:[mon('Garbodor LTR 68',{tools:['Float Stone BKT 137'],
    abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:false}]})],
   discard:['Mega Absol ex MEG 86','Mega Absol ex MEG 86']});
  const q=root(seat,[play('Karen XYP 177','karen'),play('Marnie SSH 169','marnie'),
    attack('Itchy Pollen','pollen'),pass],{
   ownPublic:board,ownHand:['Karen XYP 177','Marnie SSH 169']});
  assert.equal(policy.karenOwnRecoveryScore(q.observation),685);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'karen'});
  board.discard=['Mega Absol ex MEG 86'];
  assert.equal(policy.karenOwnRecoveryScore(q.observation),0);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'marnie'});
 });
 test('seat '+seat+' both Trubbish discarded with no existing Garbodor: Karen retrieves lock foundation',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[mon('Mega Absol ex MEG 86')],
   discard:['Trubbish CRI 56','Trubbish CRI 56']});
  const q=root(seat,[play('Karen XYP 177','karen'),attack('Itchy Pollen','pollen'),pass],{
   ownPublic:board,ownHand:['Karen XYP 177']});
  assert.equal(policy.karenOwnRecoveryScore(q.observation),640);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'karen'});
  board.bench.push(mon('Trubbish CRI 56'));
  assert.equal(policy.karenOwnRecoveryScore(q.observation),0);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
 });
 test('seat '+seat+' VS Seeker retrieves Karen after two Mega Absol discarded',()=>{
  const board=own({active:mon('Budew ASC 16'),
   discard:['Karen XYP 177','Mega Absol ex MEG 86','Mega Absol ex MEG 86']});
  const q=root(seat,[play('VS Seeker PHF 109','vs'),
    attack('Itchy Pollen','pollen'),pass],{
   ownPublic:board,ownHand:['VS Seeker PHF 109']});
  assert.equal(policy.karenOwnRecoveryScore(q.observation),685);
  assert(policy.vsSeekerDenialScore(q.observation,q.actionFrontier.items)>=675);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'vs'});
  const search=prompt(seat,{source:{sourceKind:'card-effect',sourcePrinting:'VS Seeker PHF 109',effectName:'VS Seeker'},
   choices:[choice('k','Karen XYP 177','discard'),choice('l',"Lillie's Determination MEG 119",'discard')]},
   {ownPublic:board,ownHand:['VS Seeker PHF 109']});
  assert.deepEqual(decide(seat,search),{kind:'select-choices',tokens:['k']});
 });
 test('seat '+seat+' Karen discarded and two Mega present on board does not displace live Item lock',()=>{
  const board=own({active:mon('Budew ASC 16'),
   bench:[mon('Mega Absol ex MEG 86')],
   discard:['Mega Absol ex MEG 86','Karen XYP 177']});
  const q=root(seat,[play('VS Seeker PHF 109','vs'),
    attack('Itchy Pollen','pollen'),pass],{
    ownPublic:board,ownHand:['VS Seeker PHF 109']});
  assert.equal(policy.karenOwnRecoveryScore(q.observation),0);
  assert.equal(policy.vsSeekerDenialScore(q.observation,q.actionFrontier.items),0);
  // VS Seeker may still recover other Supporters but this one is not urgent.
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
 });
}

test('printed Prize liability: VSTAR and GX two, VMAX/Mega/TagTeam/V-UNION three, single Prize variants one',()=>{
 const expected=[
  ['Regidrago VSTAR SIT 136',2],
  ['Shadow Rider Calyrex VMAX CRE 75',3],
  ['Mega Absol ex MEG 86',3],
  ['Iron Thorns ex TWM 77',2],
  ['Mimikyu PAL 97',1],
  ['Tapu Lele-GX GRI 60',2],
  ['Arceus & Dialga & Palkia-GX CEC 156',3],
  ['Eternatus V-UNION PFL 123',3],
  ['Radiant Greninja ASR 46',1]
 ];
 for(const [printing,liability] of expected)
  assert.equal(policy.prizeYield({printing}),liability);
});
for(const seat of [0,1]){
 test('seat '+seat+' two-Prize damaged VSTAR Claw can win with exactly two own Prizes remaining',()=>{
  const mega=mon('Mega Absol ex MEG 86',{
   energies:['Darkness Energy MEE 15','Darkness Energy MEE 15','Darkness Energy MEE 15']});
  const oppActive=mon('Regidrago VSTAR SIT 136',{hp:280,damage:80,
   printed:{subtypes:['VSTAR'],weakness:[]}});
  const c=attack('Claw of Darkness','claw');
  const q=root(seat,[c,play('Float Stone BKT 137','float',
     {targetSeat:'actor',targetZone:'bench',targetIndex:0}),pass],{
    ownPublic:own({active:mega,bench:[mon('Garbodor LTR 68')],prizeCount:2}),
    opponentPublic:opp({active:oppActive})});
  assert.equal(policy.prizeYield(oppActive),2);
  assert.equal(policy.clawProjectedKnockoutScore(c,q.observation),965);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'claw'});
  q.observation.ownPublic.prizeCount=3;
  assert.equal(policy.clawProjectedKnockoutScore(c,q.observation),845);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'float'});
 });
 test('seat '+seat+' damaged two-Prize GX beats one-Prize target for tactical Guzma target choice',()=>{
  const mega=mon('Mega Absol ex MEG 86',{energies:[
   'Darkness Energy MEE 15','Darkness Energy MEE 15','Darkness Energy MEE 15']});
  const gx=mon('Tapu Lele-GX GRI 60',{hp:170,printed:{subtypes:['GX'],weakness:[]}});
  const single=mon('Mimikyu GRI 58',{hp:70,printed:{subtypes:[],weakness:[]}});
  const my=own({active:mon('Budew ASC 16'),bench:[mega],prizeCount:2});
  const them=opp({active:mon('Regidrago VSTAR SIT 136'),bench:[single,gx]});
  const q=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
   choices:[{kind:'pokemon',token:'single',printing:'Mimikyu GRI 58',
    publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:0}},
   {kind:'pokemon',token:'gx',printing:'Tapu Lele-GX GRI 60',
    publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:1}}]},
   {ownPublic:my,opponentPublic:them});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['gx']});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' native Float Stone target prioritizes affordable zero-Energy Budew pivot',()=>{
  const trubbish=mon('Trubbish CRI 56',{printed:{retreatCost:['Colorless']}});
  const board=own({active:trubbish,bench:[mon('Budew ASC 16'),mon('Garbodor LTR 68')]});
  const q=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Float Stone BKT 137',effectName:'Float Stone'},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
   choices:[
    {kind:'pokemon',token:'active',printing:'Trubbish CRI 56',
     publicMetadata:{ownerSeat:'actor',targetZone:'active'}},
    {kind:'pokemon',token:'garb',printing:'Garbodor LTR 68',
     publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:1}}
   ]},{globalTurn:2,ownPublic:board,ownHand:[]});
  // Float has already left the hand while its Pokémon target prompt resolves.
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['active']});
  q.observation.opponentPublic.active=mon('Snorlax PGO 55',{
   abilitySuppressions:[{abilityName:'Block',suppressed:false}]});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['garb']});
  q.observation.opponentPublic.active=mon('Regidrago VSTAR SIT 136');
  q.observation.opponentPublic.stadium=['Jamming Tower TWM 153'];
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['garb']});
 });
 test('seat '+seat+' native Float Stone prompt avoids used Tool slot or phantom Budew pivot',()=>{
  const trubbish=mon('Trubbish CRI 56',{printed:{retreatCost:['Colorless']},
   tools:['Muscle Band XY 121']});
  const board=own({active:trubbish,bench:[mon('Budew ASC 16'),mon('Garbodor LTR 68')]});
  const q=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Float Stone BKT 137',effectName:'Float Stone'},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
   choices:[
    {kind:'pokemon',token:'active',printing:'Trubbish CRI 56',
     publicMetadata:{ownerSeat:'actor',targetZone:'active'}},
    {kind:'pokemon',token:'garb',printing:'Garbodor LTR 68',
     publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:1}}
   ]},{globalTurn:2,ownPublic:board});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['garb']});
  trubbish.tools=[];
  board.bench=[mon('Mega Absol ex MEG 86'),mon('Garbodor LTR 68')];
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['garb']});
  board.bench=[mon('Budew ASC 16'),mon('Garbodor LTR 68')];
  q.observation.ownTurnResources.retreatedTurn=2;
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['garb']});
 });
 test('seat '+seat+' Float Stone enables future Garbotoxin through accessible Benched Trubbish',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[mon('Trubbish CRI 56')]});
  const q=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Float Stone BKT 137',effectName:'Float Stone'},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
   choices:[
    {kind:'pokemon',token:'budew',printing:'Budew ASC 16',
     publicMetadata:{ownerSeat:'actor',targetZone:'active'}},
    {kind:'pokemon',token:'trubbish',printing:'Trubbish CRI 56',
     publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}}
   ]},{globalTurn:3,ownPublic:board});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['trubbish']});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' live Garbotoxin suppresses Snorlax Block without typed suppression field',()=>{
  const garb=mon('Garbodor LTR 68',{tools:['Float Stone BKT 137'],
   abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:false}]});
  const board=own({active:mon('Mega Absol ex MEG 86',{printed:{
   retreatCost:['Colorless','Colorless']}}),bench:[mon('Budew ASC 16'),garb]});
  const theirs=opp({active:mon('Snorlax PGO 55'),bench:[mon('Mimikyu PAL 97')]});
  const q=root(seat,[play('Float Stone BKT 137','float',
   {targetSeat:'actor',targetZone:'active'}),pass],{
   globalTurn:2,ownPublic:board,opponentPublic:theirs,ownHand:['Float Stone BKT 137']});
  assert.equal(policy.garbotoxinStatus(q.observation),'live');
  assert.equal(policy.opponentSnorlaxBlock(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'float'});
  // Stealthy Hood protects the opposing Block Ability from Garbotoxin.
  theirs.active.tools=['Stealthy Hood UNB 186'];
  assert.equal(policy.opponentSnorlaxBlock(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  // Jamming disables Float's retreat and Hood's protection, but leaves
  // Garbotoxin active on a physically attached Tool.
  theirs.active.tools=['Stealthy Hood UNB 186'];theirs.stadium=['Jamming Tower TWM 153'];
  assert.equal(policy.garbotoxinStatus(q.observation),'live');
  assert.equal(policy.opponentSnorlaxBlock(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  // An explicit suppressed=true engine observation also releases Block.
  theirs.stadium=[];theirs.active.abilitySuppressions=[
   {abilityName:'Block',suppressed:true}];
  assert.equal(policy.opponentSnorlaxBlock(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'float'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Karen counts actual Dragon Koraidon TEF and Salamence JTG payloads',()=>{
  const their=opp({active:mon('Regidrago VSTAR SIT 136'),discard:[
   'Koraidon ex TEF 120','Salamence ex JTG 114']});
  const q=root(seat,[play('Karen XYP 177','karen'),
   attack('Itchy Pollen','pollen'),pass],{
   globalTurn:3,opponentPublic:their,ownHand:['Karen XYP 177']});
  assert.equal(policy.regidragoPayloadCount(q.observation),2);
  assert.equal(policy.karenDenialScore(q.observation,q.actionFrontier.items),710);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'karen'});
  // Identically named Koraidon/Salamence from other printings are not
  // automatically treated as Dragon copies of the benchmark source cards.
  their.discard=['Koraidon ex SVI 125','Salamence ex EX 96'];
  assert.equal(policy.regidragoPayloadCount(q.observation),0);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Forest Seal Stone must not be wasted under Jamming Tower',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[mon('Crobat V DAA 104')]});
  const other=opp({stadium:['Jamming Tower TWM 153']});
  const target=play('Forest Seal Stone SIT 156','forest',
   {targetSeat:'actor',targetZone:'bench',targetIndex:0});
  const q=root(seat,[target,pass],{ownPublic:board,opponentPublic:other,
   ownHand:['Forest Seal Stone SIT 156']});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  const pc=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Forest Seal Stone SIT 156',
    effectName:'Forest Seal Stone'},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
   choices:[{kind:'pokemon',token:'crobat',printing:'Crobat V DAA 104',
    publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}}]},
   {ownPublic:board,opponentPublic:other});
  assert.deepEqual(decide(seat,pc),{kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'});
  other.stadium=[];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'forest'});
  assert.deepEqual(decide(seat,pc),{kind:'select-choices',tokens:['crobat']});
 });
 test('seat '+seat+' Muscle Band root and native target respect Jamming Tower',()=>{
  const board=own({active:mon('Mega Absol ex MEG 86'),bench:[]});
  const other=opp({stadium:['Jamming Tower TWM 153']});
  const target=play('Muscle Band XY 121','muscle',
   {targetSeat:'actor',targetZone:'active'});
  const q=root(seat,[target,pass],{ownPublic:board,opponentPublic:other,
   ownHand:['Muscle Band XY 121']});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  const pc=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Muscle Band XY 121',
    effectName:'Muscle Band'},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
   choices:[{kind:'pokemon',token:'mega',printing:'Mega Absol ex MEG 86',
    publicMetadata:{ownerSeat:'actor',targetZone:'active'}}]},
   {ownPublic:board,opponentPublic:other});
  assert.deepEqual(decide(seat,pc),{kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'});
  other.stadium=[];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'muscle'});
  assert.deepEqual(decide(seat,pc),{kind:'select-choices',tokens:['mega']});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' opponent live Garbotoxin blocks on-play draw Abilities and frees Snorlax retreat',()=>{
  const enemyGarb=mon('Garbodor BKP 57',{tools:['Float Stone BKT 137'],
   abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:false}]});
  const us=own({active:mon('Budew ASC 16'),bench:[
    mon('Trubbish CRI 56'),mon('Mega Absol ex MEG 86')]});
  const them=opp({active:mon('Snorlax PGO 55'),bench:[enemyGarb]});
  const q=root(seat,[play('Crobat V DAA 104','crobat'),pass],{
   ownPublic:us,opponentPublic:them,ownHand:['Crobat V DAA 104']});
  assert.equal(policy.opponentGarbotoxinStatus(q.observation),'live');
  assert.equal(policy.benchSupportAbilityUsable('Crobat V DAA 104',q.observation),false);
  assert.equal(policy.opponentSnorlaxBlock(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  enemyGarb.abilitySuppressions=[];
  assert.equal(policy.opponentGarbotoxinStatus(q.observation),'unknown');
  assert.equal(policy.benchSupportAbilityUsable('Crobat V DAA 104',q.observation),false);
  assert.equal(policy.opponentSnorlaxBlock(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  enemyGarb.abilitySuppressions=[{abilityName:'Garbotoxin',suppressed:true}];
  assert.equal(policy.opponentGarbotoxinStatus(q.observation),'inactive');
  assert.equal(policy.benchSupportAbilityUsable('Crobat V DAA 104',q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'crobat'});
 });
 test('seat '+seat+' opponent Garbotoxin survives Jamming and disables opposing Hood',()=>{
  const enemyGarb=mon('Garbodor LTR 68',{tools:['Float Stone BKT 137'],
   abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:false}]});
  const us=own({active:mon('Budew ASC 16'),bench:[mon('Trubbish CRI 56'),mon('Mega Absol ex MEG 86')]});
  const enemySnorlax=mon('Snorlax PGO 55',{tools:['Stealthy Hood UNB 186']});
  const them=opp({active:enemySnorlax,bench:[enemyGarb]});
  const q=root(seat,[play('Crobat V DAA 104','crobat'),pass],{
   ownPublic:us,opponentPublic:them,ownHand:['Crobat V DAA 104']});
  assert.equal(policy.opponentGarbotoxinStatus(q.observation),'live');
  assert.equal(policy.opponentSnorlaxBlock(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  them.stadium=['Jamming Tower TWM 153'];
  assert.equal(policy.opponentGarbotoxinStatus(q.observation),'live');
  assert.equal(policy.opponentSnorlaxBlock(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  them.stadium=[];enemyGarb.tools=[];
  assert.equal(policy.opponentGarbotoxinStatus(q.observation),'inactive');
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'crobat'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' VIP chooses immediate Budew lock before future attacker when Float pivot is payable',()=>{
  const current=mon('Crobat V DAA 104',{printed:{retreatCost:['Colorless']}});
  const ownBoard=own({active:current,bench:[]});
  const q=prompt(seat,{
   source:{sourceKind:'card-effect',sourcePrinting:'Battle VIP Pass FST 225',effectName:'Battle VIP Pass'},
   publicMetadata:{minimumCount:2,maximumCount:2},
   choices:[choice('t','Trubbish CRI 56'),choice('m','Mega Absol ex MEG 86'),
    choice('b','Budew ASC 16')]},{
    globalTurn:2,ownPublic:ownBoard,ownHand:['Float Stone BKT 137']});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['b','t']});
  q.observation.ownHand=[];
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['t','m']});
  q.observation.ownHand=['Float Stone BKT 137'];
  q.observation.globalTurn=6;
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['t','m']});
 });
 test('seat '+seat+' VIP does not claim payable Float pivot through Snorlax Block',()=>{
  const board=own({active:mon('Crobat V DAA 104',{printed:{retreatCost:['Colorless']}}),bench:[]});
  const their=opp({active:mon('Snorlax PGO 55',{
   abilitySuppressions:[{abilityName:'Block',suppressed:false}]})});
  const q=prompt(seat,{
   source:{sourceKind:'card-effect',sourcePrinting:'Battle VIP Pass FST 225',effectName:'Battle VIP Pass'},
   publicMetadata:{minimumCount:2,maximumCount:2},
   choices:[choice('t','Trubbish CRI 56'),choice('m','Mega Absol ex MEG 86'),
    choice('b','Budew ASC 16')]},{globalTurn:2,ownPublic:board,
    opponentPublic:their,ownHand:['Float Stone BKT 137']});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['t','m']});
  their.active.abilitySuppressions=[{abilityName:'Block',suppressed:true}];
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['b','t']});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Guzma Snorlax escape chooses Budew over funded Mega after own-target prompt',()=>{
  const fundedMega=mon('Mega Absol ex MEG 86',{energies:[
   'Darkness Energy MEE 15','Darkness Energy MEE 15','Darkness Energy MEE 15']});
  const board=own({active:mon('Crobat V DAA 104'),bench:[
   mon('Budew ASC 16'),fundedMega]});
  const their=opp({active:mon('Snorlax PGO 55',{
   abilitySuppressions:[{abilityName:'Block',suppressed:false}]}),
   bench:[mon('Mimikyu PAL 97')]});
  const q=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
   choices:[{kind:'pokemon',token:'budew',printing:'Budew ASC 16',
    publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}},
    {kind:'pokemon',token:'mega',printing:'Mega Absol ex MEG 86',
    publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:1}}]},
   {ownPublic:board,opponentPublic:their});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['budew']});
  their.active=mon('Mimikyu PAL 97',{abilitySuppressions:[
   {abilityName:'Safeguard',suppressed:false}]});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['budew']});
  their.active=mon('Dedenne-GX UNB 57',{hp:160});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['mega']});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Mimikyu PAL Safeguard does not stop Mega Claw under own Garbotoxin',()=>{
  const ourGarb=mon('Garbodor LTR 68',{tools:['Float Stone BKT 137'],
   abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:false}]});
  const mega=mon('Mega Absol ex MEG 86',{energies:[
   'Darkness Energy MEE 15','Darkness Energy MEE 15','Darkness Energy MEE 15']});
  const theirs=opp({active:mon('Mimikyu PAL 97',{hp:70,damage:0})});
  const board=own({active:mega,bench:[ourGarb],prizeCount:1});
  const claw=attack('Claw of Darkness','claw');
  const q=root(seat,[claw,pass],{ownPublic:board,opponentPublic:theirs});
  assert.equal(policy.activeMimikyuSafeguard(q.observation),false);
  assert.equal(policy.projectedClawDamage(claw,q.observation),200);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'claw'});
  theirs.active.tools=['Stealthy Hood UNB 186'];
  assert.equal(policy.activeMimikyuSafeguard(q.observation),true);
  assert.equal(policy.projectedClawDamage(claw,q.observation),0);
  theirs.active.tools=['Stealthy Hood UNB 186'];theirs.stadium=['Jamming Tower TWM 153'];
  assert.equal(policy.activeMimikyuSafeguard(q.observation),false);
  assert.equal(policy.projectedClawDamage(claw,q.observation),200);
  theirs.stadium=[];
  ourGarb.tools=[];
  assert.equal(policy.activeMimikyuSafeguard(q.observation),true);
 });
 test('seat '+seat+' opposing live Garbotoxin also suppresses PAL Safeguard on its own side',()=>{
  const oppGarb=mon('Garbodor BKP 57',{tools:['Float Stone BKT 137'],
   abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:false}]});
  const q=root(seat,[pass],{
   opponentPublic:opp({active:mon('Mimikyu PAL 97'),bench:[oppGarb]})});
  assert.equal(policy.opponentGarbotoxinStatus(q.observation),'live');
  assert.equal(policy.activeMimikyuSafeguard(q.observation),false);
  q.observation.opponentPublic.stadium=['Jamming Tower TWM 153'];
  assert.equal(policy.activeMimikyuSafeguard(q.observation),false);
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Guzma cannot bypass Snorlax without an opposing Bench target',()=>{
  const board=own({active:mon('Crobat V DAA 104'),bench:[mon('Budew ASC 16')]});
  const theirs=opp({active:mon('Snorlax PGO 55',{abilitySuppressions:[
   {abilityName:'Block',suppressed:false}]}),bench:[]});
  const q=root(seat,[play('Guzma BUS 115','guzma'),pass],{
   ownPublic:board,opponentPublic:theirs,ownHand:['Guzma BUS 115']});
  assert.equal(policy.opponentSnorlaxBlock(q.observation),true);
  assert.equal(policy.guzmaRootScore(q.observation),0);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  theirs.bench=[mon('Mimikyu PAL 97')];
  assert.equal(policy.guzmaRootScore(q.observation),550);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'guzma'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Star Alchemy requires actual enabled Crobat Forest Seal Stone',()=>{
  const crobat=mon('Crobat V DAA 104',{tools:['Forest Seal Stone SIT 156']});
  const board=own({active:mon('Budew ASC 16'),bench:[crobat]});
  const their=opp({active:mon('Regidrago VSTAR SIT 136')});
  const q=root(seat,[ability('Star Alchemy','star'),pass],{
   ownPublic:board,opponentPublic:their});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'star'});
  crobat.tools=[];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  crobat.tools=['Forest Seal Stone SIT 156'];
  their.stadium=['Jamming Tower TWM 153'];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  their.stadium=[];
  q.observation.ownTurnResources.vstarUsed=true;
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
 });
 test('seat '+seat+' Iron Thorns and Wobbuffet Active suppress Crobat-granted Star Alchemy',()=>{
  const crobat=mon('Crobat V DAA 104',{tools:['Forest Seal Stone SIT 156']});
  const q=root(seat,[ability('Star Alchemy','star'),pass],{
   ownPublic:own({active:mon('Budew ASC 16'),bench:[crobat]}),
   opponentPublic:opp({active:mon('Iron Thorns ex TWM 77',{
    abilitySuppressions:[{abilityName:'Initialization',suppressed:false}]})})});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  q.observation.opponentPublic.active=mon('Wobbuffet PHF 36',{
   abilitySuppressions:[{abilityName:'Bide Barricade',suppressed:false}]});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  q.observation.opponentPublic.active=mon('Regidrago VSTAR SIT 136');
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'star'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' two visible Dragon payloads trigger Karen before first Regidrago Basic appears',()=>{
  const developing=opp({active:mon('Budew ASC 16'),bench:[],
   discard:['Dialga-GX UPR 100','Dragapult ex TWM 130']});
  const q=root(seat,[play('Karen XYP 177','karen'),attack('Itchy Pollen','pollen'),pass],{
   ownPublic:own({active:mon('Budew ASC 16')}),
   opponentPublic:developing,ownHand:['Karen XYP 177']});
  assert.equal(policy.regidragoPayloadCount(q.observation),2);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'karen'});
  developing.discard=['Dialga-GX UPR 100'];
  assert.equal(policy.regidragoPayloadCount(q.observation),0);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
  developing.discard=['Dialga-GX UPR 100','Dragapult ex TWM 130'];
  developing.active=mon('Shadow Rider Calyrex VMAX CRE 75');
  assert.equal(policy.regidragoPayloadCount(q.observation),0);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
  developing.active=mon('Regidrago V SIT 135');
  assert.equal(policy.regidragoPayloadCount(q.observation),2);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'karen'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' two-Darkness Mega can gust exact six-counter VMAX for Terminal Period',()=>{
  const mega=mon('Mega Absol ex MEG 86',{energies:[
   'Darkness Energy MEE 15','Darkness Energy MEE 15']});
  const benchTarget=mon('Shadow Rider Calyrex VMAX CRE 75',{hp:320,damage:60,
   printed:{subtypes:['VMAX'],weakness:[{type:'Darkness',value:'×2'}]}});
  const ownBoard=own({active:mon('Budew ASC 16'),bench:[mega],prizeCount:3});
  const enemy=opp({active:mon('Snorlax PGO 55'),bench:[benchTarget]});
  const q=root(seat,[play('Guzma BUS 115','gust'),attack('Itchy Pollen','pollen'),pass],{
   ownPublic:ownBoard,opponentPublic:enemy,globalTurn:4,ownHand:['Guzma BUS 115']});
  assert.equal(policy.guzmaRootScore(q.observation),985);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'gust'});
  const opponentChoice=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
   choices:[{kind:'pokemon',token:'vmax',printing:'Shadow Rider Calyrex VMAX CRE 75',
    publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:0}}]},
   {ownPublic:ownBoard,opponentPublic:enemy});
  assert.deepEqual(decide(seat,opponentChoice),{kind:'select-choices',tokens:['vmax']});
  enemy.active=benchTarget;
  const ownChoice=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
   choices:[{kind:'pokemon',token:'mega',printing:'Mega Absol ex MEG 86',
    publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}}]},
   {ownPublic:ownBoard,opponentPublic:enemy});
  assert.deepEqual(decide(seat,ownChoice),{kind:'select-choices',tokens:['mega']});
  ownBoard.active=mega;ownBoard.bench=[mon('Budew ASC 16')];
  q.actionFrontier.items=[attack('Terminal Period','terminal'),pass];
  q.observation.ownTurnResources.supporterPlayedTurn=1;
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'terminal'});
  // Negative controls: damage must be exactly 60; the second Darkness is
  // necessary; non-Terminal damage cannot be falsely assumed payable.
  benchTarget.damage=50;
  ownBoard.active=mon('Budew ASC 16');
  ownBoard.bench=[mega];
  q.actionFrontier.items=[play('Guzma BUS 115','gust'),attack('Itchy Pollen','pollen'),pass];
  q.observation.ownTurnResources.supporterPlayedTurn=0;
  assert.equal(policy.guzmaRootScore(q.observation),0);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
  benchTarget.damage=60;
  mega.energies=['Darkness Energy MEE 15'];
  assert.equal(policy.guzmaRootScore(q.observation),0);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pollen'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' six counters on Safeguarded Mimikyu unlock Terminal Period effect KO',()=>{
  const board=own({active:mon('Crobat V DAA 104'),bench:[mon('Budew ASC 16'),
   mon('Mega Absol ex MEG 86',{energies:[
    'Darkness Energy MEE 15','Darkness Energy MEE 15']})]});
  const target=mon('Mimikyu PAL 97',{hp:70,damage:60,
   abilitySuppressions:[{abilityName:'Safeguard',suppressed:false}]});
  const q=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
   choices:[{kind:'pokemon',token:'budew',printing:'Budew ASC 16',
    publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}},
    {kind:'pokemon',token:'mega',printing:'Mega Absol ex MEG 86',
    publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:1}}]},
   {ownPublic:board,opponentPublic:opp({active:target})});
  assert.equal(policy.activeMimikyuSafeguard(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['mega']});
  target.damage=50;
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['budew']});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Boost Shake turn end does not preempt Trainers Mail or Compressor setup',()=>{
  const equipped=mon('Trubbish CRI 56',{tools:['Float Stone BKT 137']});
  const board=own({active:mon('Budew ASC 16'),bench:[equipped,
   mon('Mega Absol ex MEG 86')],deckCount:33});
  const items=[play('Boost Shake EVS 142','boost'),
   play("Trainers' Mail ROS 92",'mail'),play('Battle Compressor PHF 92','compressor'),pass];
  const q=root(seat,items,{globalTurn:4,ownPublic:board,
   ownHand:['Boost Shake EVS 142',"Trainers' Mail ROS 92",'Battle Compressor PHF 92'],
   ownTurnResources:{energyPlayedTurn:true}});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'compressor'});
  q.actionFrontier.items=[items[0],items[1],pass];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'mail'});
  q.actionFrontier.items=[items[0],pass];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'boost'});
 });
 test('seat '+seat+' Boost Shake preserves itself instead of Marnie shuffle with no other safe action',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[
   mon('Trubbish CRI 56',{tools:['Float Stone BKT 137']})]});
  const q=root(seat,[play('Boost Shake EVS 142','boost'),
   play('Marnie SSH 169','marnie'),pass],{
   globalTurn:4,ownPublic:board,ownHand:['Boost Shake EVS 142','Marnie SSH 169'],
   ownTurnResources:{energyPlayedTurn:true}});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'boost'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Sky Field eight Bench slots permit a sixth support Dedenne',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[
   mon('Mega Absol ex MEG 86'),mon('Garbodor LTR 68'),mon('Crobat V DAA 104'),
   mon('Tapu Lele-GX GRI 60'),mon('Trubbish CRI 56')]});
  const their=opp({stadium:['Sky Field ROS 89']});
  const q=root(seat,[play('Dedenne-GX UNB 57','dede'),pass],{
   ownPublic:board,opponentPublic:their,ownHand:['Dedenne-GX UNB 57']});
  assert.equal(policy.benchCapacity(q.observation),8);
  assert.equal(policy.benchSupportFits(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'dede'});
  their.stadium=[];
  assert.equal(policy.benchCapacity(q.observation),5);
  assert.equal(policy.benchSupportFits(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  their.stadium=['Sky Field ROS 89'];
  board.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining=1;
  assert.equal(policy.benchCapacity(q.observation),5);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
 });
 test('seat '+seat+' VIP respects seven-of-eight Sky Field Bench capacity and one free slot',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:Array.from({length:7},
   (_,i)=>mon(i%2?'Crobat V DAA 104':'Tapu Lele-GX GRI 60'))});
  const their=opp({stadium:['Sky Field ROS 89']});
  const q=root(seat,[play('Battle VIP Pass FST 225','vip'),pass],{
   globalTurn:2,ownPublic:board,opponentPublic:their});
  assert.equal(policy.benchCapacity(q.observation)-board.bench.length,1);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'vip'});
  const target=prompt(seat,{
   source:{sourceKind:'card-effect',sourcePrinting:'Battle VIP Pass FST 225',effectName:'Battle VIP Pass'},
   publicMetadata:{minimumCount:1,maximumCount:2},
   choices:[choice('mega','Mega Absol ex MEG 86'),choice('trubbish','Trubbish CRI 56')]},
   {globalTurn:2,ownPublic:board,opponentPublic:their});
  assert.deepEqual(decide(seat,target),{kind:'select-choices',tokens:['trubbish']});
  their.stadium=[];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Sky Field collapse discards spent support without losing powered Mega or unused FSS',()=>{
  const bench=[mon('Dedenne-GX UNB 57'),
   mon('Crobat V DAA 104',{tools:['Forest Seal Stone SIT 156']}),
   mon('Mega Absol ex MEG 86',{energies:[
    'Darkness Energy MEE 15','Darkness Energy MEE 15']}),
   mon('Garbodor LTR 68',{tools:['Float Stone BKT 137']}),
   mon('Trubbish CRI 56'),
   mon('Tapu Lele-GX GRI 60'),
   mon('Squawkabilly ex PAL 169')];
  const board=own({active:mon('Budew ASC 16'),bench});
  const target=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Sky Field ROS 89',effectName:'Sky Field'},
   publicMetadata:{selectionType:'pokemon',minimumCount:2,maximumCount:2},
   choices:bench.map((x,i)=>({kind:'pokemon',token:'bench'+i,printing:x.printing,
    publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:i}}))},
   {globalTurn:4,ownPublic:board,opponentPublic:opp({stadium:[]})});
  assert.deepEqual(decide(seat,target),{kind:'select-choices',tokens:['bench0','bench6']});
  board.bench=bench.slice(0,5);
  target.prompt.choices=target.prompt.choices.slice(0,5);
  assert.deepEqual(decide(seat,target),{kind:'abstain',reasonCode:'NO_SUPPORTED_POKEMON_CHOICE'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Forest Seal Stone is not wasted on Garbodor when Float is in hand',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[
   mon('Garbodor LTR 68'),mon('Crobat V DAA 104')]});
  const q=root(seat,[
   play('Forest Seal Stone SIT 156','fssGarb',{targetSeat:'actor',targetZone:'bench',targetIndex:0}),
   play('Forest Seal Stone SIT 156','fssCrobat',{targetSeat:'actor',targetZone:'bench',targetIndex:1}),
   play('Float Stone BKT 137','floatGarb',{targetSeat:'actor',targetZone:'bench',targetIndex:0}),
   pass],{ownPublic:board,ownHand:[
    'Forest Seal Stone SIT 156','Float Stone BKT 137']});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'floatGarb'});
  q.actionFrontier.items.splice(2,1);
  q.observation.ownHand=['Forest Seal Stone SIT 156'];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'fssCrobat'});
  const target=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Forest Seal Stone SIT 156',effectName:'Forest Seal Stone'},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
   choices:[{kind:'pokemon',token:'garb',printing:'Garbodor LTR 68',
    publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}},
    {kind:'pokemon',token:'crobat',printing:'Crobat V DAA 104',
    publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:1}}]},
   {ownPublic:board,ownHand:[],ownTurnResources:{vstarUsed:false}});
  assert.deepEqual(decide(seat,target),{kind:'select-choices',tokens:['crobat']});
 });
 test('seat '+seat+' Muscle Band fallback enables Garbotoxin only when Float is unavailable',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[
   mon('Garbodor LTR 68'),mon('Mega Absol ex MEG 86')]});
  const garb=play('Muscle Band XY 121','muscleGarb',
   {targetSeat:'actor',targetZone:'bench',targetIndex:0});
  const mega=play('Muscle Band XY 121','muscleMega',
   {targetSeat:'actor',targetZone:'bench',targetIndex:1});
  const q=root(seat,[garb,mega,pass],{ownPublic:board,
   ownHand:['Muscle Band XY 121']});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'muscleGarb'});
  const pc=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Muscle Band XY 121',effectName:'Muscle Band'},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
   choices:[{kind:'pokemon',token:'garb',printing:'Garbodor LTR 68',
    publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}},
    {kind:'pokemon',token:'mega',printing:'Mega Absol ex MEG 86',
    publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:1}}]},
   {ownPublic:board,ownHand:[]});
  assert.deepEqual(decide(seat,pc),{kind:'select-choices',tokens:['garb']});
  q.observation.ownHand=['Muscle Band XY 121','Float Stone BKT 137'];
  pc.observation.ownHand=['Float Stone BKT 137'];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'muscleMega'});
  assert.deepEqual(decide(seat,pc),{kind:'select-choices',tokens:['mega']});
  q.observation.opponentPublic.stadium=['Jamming Tower TWM 153'];
  pc.observation.opponentPublic.stadium=['Jamming Tower TWM 153'];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  assert.deepEqual(decide(seat,pc),{kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'});
 });
 test('seat '+seat+' spent Forest Seal Stone may serve as last-resort Garbotoxin Tool',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[
   mon('Garbodor LTR 68'),mon('Crobat V DAA 104')]});
  const garb=play('Forest Seal Stone SIT 156','forestGarb',
   {targetSeat:'actor',targetZone:'bench',targetIndex:0});
  const crobat=play('Forest Seal Stone SIT 156','forestCrobat',
   {targetSeat:'actor',targetZone:'bench',targetIndex:1});
  const q=root(seat,[garb,crobat,pass],{
   ownPublic:board,ownHand:['Forest Seal Stone SIT 156'],
   ownTurnResources:{vstarUsed:true}});
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'forestGarb'});
  const pc=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Forest Seal Stone SIT 156',effectName:'Forest Seal Stone'},
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
   choices:[{kind:'pokemon',token:'garb',printing:'Garbodor LTR 68',
    publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}},
    {kind:'pokemon',token:'crobat',printing:'Crobat V DAA 104',
    publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:1}}]},
   {ownPublic:board,ownHand:[],ownTurnResources:{vstarUsed:true}});
  assert.deepEqual(decide(seat,pc),{kind:'select-choices',tokens:['garb']});
  q.observation.ownTurnResources.vstarUsed=false;
  pc.observation.ownTurnResources.vstarUsed=false;
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'forestCrobat'});
  assert.deepEqual(decide(seat,pc),{kind:'select-choices',tokens:['crobat']});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' VIP does not trigger Crobat Dedenne or Tapu on-play Abilities from deck',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[
   mon('Trubbish CRI 56'),mon('Mega Absol ex MEG 86')]});
  const q=prompt(seat,{promptType:'ChooseCardsPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Battle VIP Pass FST 225',effectName:'Battle VIP Pass'},
   publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:2},
   choices:[choice('crobat','Crobat V DAA 104'),choice('dede','Dedenne-GX UNB 57'),
    choice('tapu','Tapu Lele-GX GRI 60'),choice('squawk','Squawkabilly ex PAL 169'),
    {kind:'empty-selection',token:'empty'}]},
   {globalTurn:2,ownPublic:board,ownHand:[]});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['squawk']});
  q.observation.ownHand=['Forest Seal Stone SIT 156'];
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['crobat']});
  q.observation.ownHand=['Secret Box TWM 163'];
  assert.deepEqual(decide(seat,q),{kind:'select-choice',token:'empty'});
  q.observation.ownHand=[];q.observation.globalTurn=6;
  assert.deepEqual(decide(seat,q),{kind:'select-choice',token:'empty'});
 });
 test('seat '+seat+' VIP may still search core Pokémon without a playable support Ability',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[]});
  const q=prompt(seat,{promptType:'ChooseCardsPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Battle VIP Pass FST 225',effectName:'Battle VIP Pass'},
   publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:2},
   choices:[choice('trubbish','Trubbish CRI 56'),choice('mega','Mega Absol ex MEG 86'),
    choice('dede','Dedenne-GX UNB 57'),{kind:'empty-selection',token:'empty'}]},
   {globalTurn:2,ownPublic:board,ownHand:['Secret Box TWM 163']});
  assert.deepEqual(decide(seat,q),{kind:'select-choices',tokens:['trubbish','mega']});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Jamming Tower disables Hood but NOT attached Garbotoxin versus Snorlax and Vileplume',()=>{
  const garb=mon('Garbodor LTR 68',{
   tools:['Muscle Band XY 121'],
   abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:false}]});
  const enemyBlock=mon('Snorlax PGO 55',{tools:['Stealthy Hood UNB 186']});
  const enemyVile=mon('Vileplume AOR 3',{tools:['Stealthy Hood UNB 186']});
  const board=own({active:mon('Budew ASC 16'),bench:[garb]});
  const enemy=opp({active:enemyBlock,bench:[enemyVile],
   stadium:['Jamming Tower TWM 153']});
  const q=root(seat,[pass],{ownPublic:board,opponentPublic:enemy});
  assert.equal(policy.toolEnabled(q.observation),false);
  assert.equal(policy.garbotoxinStatus(q.observation),'live');
  assert.equal(policy.opponentSnorlaxBlock(q.observation),false);
  assert.equal(policy.opponentVileplumeItemLock(q.observation),false);
  enemy.stadium=[];
  assert.equal(policy.garbotoxinStatus(q.observation),'live');
  assert.equal(policy.opponentSnorlaxBlock(q.observation),true);
  assert.equal(policy.opponentVileplumeItemLock(q.observation),true);
 });
 test('seat '+seat+' Jamming still allows Float Tool attached to Garbodor for Garbotoxin',()=>{
  const garb=mon('Garbodor LTR 68');
  const board=own({active:mon('Budew ASC 16'),bench:[garb]});
  const enemy=opp({stadium:['Jamming Tower TWM 153']});
  const rootReq=root(seat,[play('Float Stone BKT 137','floatGarb',{
   targetSeat:'actor',targetZone:'bench',targetIndex:0}),pass],{
   ownPublic:board,opponentPublic:enemy,ownHand:['Float Stone BKT 137']});
  assert.equal(policy.garbotoxinStatus(rootReq.observation),'inactive');
  assert.deepEqual(decide(seat,rootReq),{kind:'select-action',token:'floatGarb'});
  const target=prompt(seat,{promptType:'ChoosePokemonPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Float Stone BKT 137',
    effectName:'Float Stone'},
   publicMetadata:{minimumCount:1,maximumCount:1,selectionType:'pokemon'},
   choices:[{kind:'pokemon',token:'garb',printing:'Garbodor LTR 68',
    publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}}]},
   {ownPublic:board,opponentPublic:enemy,ownHand:[]});
  assert.deepEqual(decide(seat,target),{kind:'select-choices',tokens:['garb']});
  garb.tools=['Float Stone BKT 137'];
  garb.abilitySuppressions=[{abilityName:'Garbotoxin',suppressed:false}];
  assert.equal(policy.garbotoxinStatus(rootReq.observation),'live');
  board.publicTurnRestrictions.toolPlayLocked=true;
  garb.tools=[];
  garb.abilitySuppressions=[];
  assert.deepEqual(decide(seat,rootReq),{kind:'select-action',token:'pass'});
 });
 test('seat '+seat+' under Jamming attached Garbotoxin stops our Crobat Star Alchemy',()=>{
  const enemyGarb=mon('Garbodor BKP 57',{
   tools:['Float Stone BKT 137'],
   abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:false}]});
  const ownCrobat=mon('Crobat V DAA 104',{tools:['Forest Seal Stone SIT 156']});
  const board=own({active:mon('Budew ASC 16'),bench:[ownCrobat]});
  const enemy=opp({active:mon('Regidrago VSTAR SIT 136'),bench:[enemyGarb],
   stadium:['Jamming Tower TWM 153']});
  const q=root(seat,[ability('Star Alchemy','star'),pass],{
   ownPublic:board,opponentPublic:enemy,ownTurnResources:{vstarUsed:false}});
  assert.equal(policy.opponentGarbotoxinStatus(q.observation),'live');
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  enemy.stadium=[];
  assert.equal(policy.opponentGarbotoxinStatus(q.observation),'live');
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  enemyGarb.tools=[];
  assert.equal(policy.opponentGarbotoxinStatus(q.observation),'inactive');
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'star'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' same-side Garbotoxin bypasses Stealthy Hood; opponent Garbotoxin does not',()=>{
  const enemyGarb=mon('Garbodor BKP 57',{tools:['Float Stone BKT 137'],
   abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:false}]});
  const ownGarb=mon('Garbodor LTR 68',{tools:['Float Stone BKT 137'],
   abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:false}]});
  const theirBlock=mon('Snorlax PGO 55',{tools:['Stealthy Hood UNB 186']});
  const theirSafeguard=mon('Mimikyu PAL 97',{tools:['Stealthy Hood UNB 186']});
  const ownBoard=own({active:mon('Budew ASC 16'),bench:[]});
  const theirBoard=opp({active:theirBlock,bench:[enemyGarb]});
  const q=root(seat,[pass],{ownPublic:ownBoard,opponentPublic:theirBoard});
  assert.equal(policy.opponentSnorlaxBlock(q.observation),false);
  theirBoard.active=theirSafeguard;
  assert.equal(policy.activeMimikyuSafeguard(q.observation),false);
  enemyGarb.tools=[];ownBoard.bench=[ownGarb];
  assert.equal(policy.activeMimikyuSafeguard(q.observation),true);
  theirBoard.active=theirBlock;
  assert.equal(policy.opponentSnorlaxBlock(q.observation),true);
  theirBoard.stadium=['Jamming Tower TWM 153'];
  assert.equal(policy.opponentSnorlaxBlock(q.observation),false);
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' full Bench frees stale Quick and late Squawk to pay Ultra for Garbodor',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[
   mon('Trubbish CRI 56'),mon('Mega Absol ex MEG 86'),
   mon('Crobat V DAA 104'),mon('Dedenne-GX UNB 57'),
   mon('Tapu Lele-GX GRI 60')]});
  const hand=['Ultra Ball MEG 131','Quick Ball FST 237','Squawkabilly ex PAL 169'];
  const q=root(seat,[play('Ultra Ball MEG 131','ultra'),pass],{
   globalTurn:5,ownPublic:board,ownHand:hand});
  assert.equal(policy.basicSearchDemand(q.observation),false);
  assert.equal(policy.ultraSearchDemand(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'ultra'});
  const disc=prompt(seat,{promptType:'ChooseCardsPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Ultra Ball MEG 131',effectName:'Ultra Ball'},
   publicMetadata:{minimumCount:2,maximumCount:2,selectionType:'card-combination'},
   choices:[{kind:'card',token:'quick',printing:'Quick Ball FST 237',
    publicMetadata:{ownerSeat:'actor',sourceZone:'hand'}},
    {kind:'card',token:'squawk',printing:'Squawkabilly ex PAL 169',
     publicMetadata:{ownerSeat:'actor',sourceZone:'hand'}}]},
   {globalTurn:5,ownPublic:board,ownHand:hand});
  assert.deepEqual(decide(seat,disc),{kind:'select-choices',tokens:['squawk','quick']});
  board.bench=board.bench.slice(0,2);
  assert.equal(policy.basicSearchDemand(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  assert.deepEqual(decide(seat,disc),{kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'});
 });
 test('seat '+seat+' completed Garbotoxin unlocks dead Boost Shake discard, unused FSS stays protected',()=>{
  const garb=mon('Garbodor LTR 68',{tools:['Float Stone BKT 137'],
   abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:false}]});
  const board=own({active:mon('Budew ASC 16'),bench:[
   garb,mon('Mega Absol ex MEG 86'),mon('Crobat V DAA 104')]});
  const hand=['Ultra Ball MEG 131','Boost Shake EVS 142',
   'Forest Seal Stone SIT 156','Darkness Energy MEE 15'];
  const disc=prompt(seat,{promptType:'ChooseCardsPrompt',
   source:{sourceKind:'card-effect',sourcePrinting:'Ultra Ball MEG 131',effectName:'Ultra Ball'},
   publicMetadata:{minimumCount:2,maximumCount:2,selectionType:'card-combination'},
   choices:[{kind:'card',token:'boost',printing:'Boost Shake EVS 142',
    publicMetadata:{ownerSeat:'actor',sourceZone:'hand'}},
    {kind:'card',token:'forest',printing:'Forest Seal Stone SIT 156',
     publicMetadata:{ownerSeat:'actor',sourceZone:'hand'}},
    {kind:'card',token:'dark',printing:'Darkness Energy MEE 15',
     publicMetadata:{ownerSeat:'actor',sourceZone:'hand'}}]},
   {globalTurn:4,ownPublic:board,ownHand:hand,ownTurnResources:{energyPlayedTurn:true,vstarUsed:false}});
  assert.deepEqual(decide(seat,disc),{kind:'select-choices',tokens:['boost','dark']});
  disc.observation.ownTurnResources.vstarUsed=true;
  assert.deepEqual(decide(seat,disc),{kind:'select-choices',tokens:['boost','forest']});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Temple does not replace Jamming to revive Hooded Vileplume Item lock',()=>{
  const garb=mon('Garbodor LTR 68',{tools:['Float Stone BKT 137'],
   abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:false}]});
  const enemyVile=mon('Vileplume AOR 3',{tools:['Stealthy Hood UNB 186']});
  const enemy=opp({active:mon('Regidrago VSTAR SIT 136',{
   energies:['Double Colorless Energy NXD 92']}),
   bench:[enemyVile],stadium:['Jamming Tower TWM 153']});
  const q=root(seat,[play('Temple of Sinnoh ASR 155','temple'),pass],{
   ownPublic:own({active:mon('Budew ASC 16'),bench:[garb]}),
   opponentPublic:enemy,ownHand:['Temple of Sinnoh ASR 155']});
  assert.equal(policy.garbotoxinStatus(q.observation),'live');
  assert.equal(policy.opponentVileplumeItemLock(q.observation),false);
  assert.equal(policy.replacingJammingRestoresHoodedLock(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  enemyVile.tools=[];
  assert.equal(policy.replacingJammingRestoresHoodedLock(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'temple'});
 });
 test('seat '+seat+' Hooded Snorlax and Stoutland lock resurrection also prevents Temple',()=>{
  const garb=mon('Garbodor LTR 68',{tools:['Float Stone BKT 137'],
   abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:false}]});
  const ownBoard=own({active:mon('Budew ASC 16'),bench:[garb]});
  const active=mon('Snorlax PGO 55',{tools:['Stealthy Hood UNB 186'],
   energies:['Double Colorless Energy NXD 92']});
  const enemy=opp({active,stadium:['Jamming Tower TWM 153']});
  const q=root(seat,[play('Temple of Sinnoh ASR 155','temple'),pass],{
   ownPublic:ownBoard,opponentPublic:enemy});
  assert.equal(policy.replacingJammingRestoresHoodedLock(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  enemy.active=mon('Stoutland BCR 122',{tools:['Stealthy Hood UNB 186'],
   energies:['Double Colorless Energy NXD 92']});
  assert.equal(policy.replacingJammingRestoresHoodedLock(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  enemy.active=mon('Regidrago VSTAR SIT 136',{
   energies:['Double Colorless Energy NXD 92']});
  assert.equal(policy.replacingJammingRestoresHoodedLock(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'temple'});
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' Path to the Peak disables Crobat Dedenne and Forest Stone until Temple replaces it',()=>{
  const crobat=mon('Crobat V DAA 104',{tools:['Forest Seal Stone SIT 156']});
  const board=own({active:mon('Budew ASC 16'),bench:[crobat]});
  const their=opp({active:mon('Regidrago VSTAR SIT 136'),
   stadium:['Path to the Peak CRE 148']});
  const q=root(seat,[ability('Star Alchemy','star'),
   play('Temple of Sinnoh ASR 155','temple'),pass],{
   ownPublic:board,opponentPublic:their,
   ownHand:['Temple of Sinnoh ASR 155','Dedenne-GX UNB 57'],
   ownTurnResources:{vstarUsed:false}});
  assert.equal(policy.pathToThePeakInPlay(q.observation),true);
  assert.equal(policy.benchSupportAbilityUsable('Crobat V DAA 104',q.observation),false);
  assert.equal(policy.benchSupportAbilityUsable('Dedenne-GX UNB 57',q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'temple'});
  their.stadium=[];
  assert.equal(policy.pathToThePeakInPlay(q.observation),false);
  assert.equal(policy.benchSupportAbilityUsable('Dedenne-GX UNB 57',q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'star'});
  // Garbotoxin remains effective through Path; removing Path alone
  // cannot restore Rule-Box Abilities while another lock is active.
  their.stadium=['Path to the Peak CRE 148'];
  board.bench.push(mon('Garbodor LTR 68',{tools:['Float Stone BKT 137'],
   abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:false}]}));
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
 });
 test('seat '+seat+' Klefki Basic lock suppresses Dedechange and Star Alchemy until Garbotoxin',()=>{
  const crobat=mon('Crobat V DAA 104',{tools:['Forest Seal Stone SIT 156']});
  const board=own({active:mon('Budew ASC 16'),bench:[crobat]});
  const their=opp({active:mon('Klefki SVI 96')});
  const q=root(seat,[ability('Star Alchemy','star'),pass],{
   ownPublic:board,opponentPublic:their,
   ownTurnResources:{vstarUsed:false}});
  assert.equal(policy.activeKlefkiLock(q.observation),true);
  assert.equal(policy.benchSupportAbilityUsable('Crobat V DAA 104',q.observation),false);
  assert.equal(policy.benchSupportAbilityUsable('Tapu Lele-GX GRI 60',q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  const garb=mon('Garbodor LTR 68',{tools:['Muscle Band XY 121'],
   abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:false}]});
  board.bench.push(garb);
  assert.equal(policy.activeKlefkiLock(q.observation),false);
  // Our own Garbotoxin also suppresses Crobat's Ability, so Star
  // remains unusable until that competing lock stops.
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
  board.bench.pop();their.active.tools=['Stealthy Hood UNB 186'];
  board.bench.push(garb);
  assert.equal(policy.activeKlefkiLock(q.observation),true);
  their.stadium=['Jamming Tower TWM 153'];
  assert.equal(policy.activeKlefkiLock(q.observation),false);
 });
 test('seat '+seat+' Path removal without live own support gets lower Temple priority',()=>{
  const board=own({active:mon('Budew ASC 16'),bench:[mon('Mega Absol ex MEG 86')]});
  const their=opp({stadium:['Path to the Peak CRE 148']});
  const q=root(seat,[play('Temple of Sinnoh ASR 155','temple'),pass],{
   ownPublic:board,opponentPublic:their,ownHand:['Temple of Sinnoh ASR 155']});
  assert.equal(policy.pathToThePeakInPlay(q.observation),true);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'temple'});
  their.stadium=[];
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'pass'});
 });
}
