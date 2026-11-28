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
  assert.deepEqual(decide(seat,root(seat,[ability('Star Alchemy','star'),tool,pass])),{kind:'select-action',token:'star'});
 });
 test('seat '+seat+' suppress Garbotoxin tool under Jamming Tower',()=>{
  const q=root(seat,[tool,attack('Itchy Pollen','budew'),pass]);
  q.observation.opponentPublic.stadium=['Jamming Tower TWM 153'];
  assert.equal(policy.toolEnabled(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'budew'});
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
 test('seat '+seat+' replacing Jamming Tower restores Garbotoxin candidate turn without assuming it is live',()=>{
  const q=root(seat,[play('Temple of Sinnoh ASR 155','temple'),attack('Itchy Pollen','budew'),pass],{
   ownPublic:own({active:mon('Budew ASC 16'),bench:[mon('Garbodor LTR 68',{tools:['Float Stone BKT 137'],
    abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:true}]})]}),
   opponentPublic:opp({stadium:['Jamming Tower TWM 153']})});
  assert.equal(policy.toolEnabled(q.observation),false);
  assert.deepEqual(decide(seat,q),{kind:'select-action',token:'temple'});
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
