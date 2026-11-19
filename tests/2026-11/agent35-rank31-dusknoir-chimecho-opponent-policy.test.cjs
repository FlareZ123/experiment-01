'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const {POLICY_VERSION,createPolicy}=require('../../simulation/evaluation/2026-11/agent35-rank31-dusknoir-chimecho-opponent-policy.cjs');
const config={rank:31,sourceFingerprint:'36b077c17263471d3a2161f9cfcd352d9de7b9cfad6eeb8ad60310c32b5845c8',
  candidateFingerprint:'1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4'};
const fixtureRecords=[];
function makePolicy(seat=0){return createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,config});}
function restrictions(){return {cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],blockedAttackNameNextTurn:null,
  blockedAttackNameUntilLeavesActive:null,onlyAllowedAttackNameNextTurn:null,attackCostIncreaseNextTurn:0,
  attackCostIncreaseWhileActive:0,cannotRetreat:false,cannotRetreatNextTurn:false,cannotRetreatWhileActive:false,cannotEvolveNextTurn:false};}
function publicRestrictions(){return {gxUsed:false,vstarUsed:false,attackLockTurnsRemaining:0,attackMaxEnergy:null,
  attackMaxEnergyTurnsRemaining:0,ignoreAttackCostCardTypes:[],ignoreAttackCostTurnsRemaining:0,cannotUseGXAttacks:false,
  pokemonPlayLocked:false,abilityPokemonPlayLocked:false,evolutionPlayLocked:false,itemPlayLocked:false,supporterPlayLocked:false,
  stadiumPlayLocked:false,toolPlayLocked:false,energyPlayLocked:false,specialEnergyPlayLocked:false,stadiumAndToolHaveNoEffectTurnsRemaining:null};}
function pokemon(printing,o={}){const abilities=o.abilities??[];return {printing,name:printing.split(' ').slice(0,-2).join(' '),
  hp:o.hp??150,damage:o.damage??0,lastPlayedOrEvolvedTurn:1,
  printed:{stage:o.stage??'BASIC',subtypes:o.subtypes??['Basic'],types:['Psychic'],retreatCost:[],weakness:[],resistance:[]},
  specialConditions:[],publicRestrictions:restrictions(),evolutionPrintings:[],energies:o.energies??[],tools:o.tools??[],
  attacks:[],abilities,abilityDetails:abilities.map(name=>({name,powerType:'ABILITY',text:'Once during your turn.'})),abilitySuppressions:null};}
function player(o={}){const bench=(o.bench??[]).slice(0,5);while(bench.length<5)bench.push(null);return {
  active:o.active??null,bench,stadium:o.stadium??[],discard:o.discard??[],lostZone:[],resolvingSupporter:[],
  publicHand:o.publicHand??null,prizeSlots:[],publicTurnRestrictions:{...publicRestrictions(),...(o.publicTurnRestrictions??{})},
  handCount:o.handCount??0,deckCount:o.deckCount??30,prizeCount:o.prizeCount??6};}
function resources(o={}){return {supporterPlayedTurn:0,retreatedTurn:0,extraTurnActive:false,energyPlayedTurn:false,
  stadiumPlayedTurn:false,stadiumUsedTurn:false,vstarUsed:false,pokemonPlayLocked:false,abilityPokemonPlayLocked:false,
  evolutionPlayLocked:false,itemPlayLocked:false,supporterPlayLocked:false,stadiumPlayLocked:false,toolPlayLocked:false,
  energyPlayLocked:false,specialEnergyPlayLocked:false,...o};}
function source(printing,effect){return {classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:printing,effectName:effect};}
function pChoice(token,printing,zone,index,owner='opponent'){return {token,kind:'pokemon',printing,
  label:(owner==='opponent'?'Opponent ':'Your ')+(zone==='active'?'active':'bench '+(index+1))+': '+printing,
  publicMetadata:{selectionIndex:index,selectedCount:1,selectionType:'pokemon',ownerSeat:owner,targetZone:zone,isOwnerVisible:true}};}
function cChoice(token,printing,index,zone='hand'){return {token,kind:'card',printing,label:printing,
  publicMetadata:{selectionIndex:index,selectedCount:1,sourceZone:zone,ownerSeat:'actor',isOwnerVisible:true}};}
function prompt(type,printing,effect,choices,meta=null,seat=0){const p={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:type,
  description:effect,source:source(printing,effect),choices};if(meta)p.publicMetadata=meta;return p;}
function req(o={}){const seat=o.seat??0,p=o.prompt??null;return {schema:protocol.REQUEST_SCHEMA,type:'decision',
  requestId:o.requestId??'rank31-test-1',sequence:o.sequence??1,role:'opponent',seat,observationSchema:protocol.OBSERVATION_SCHEMA,
  observation:{actorSeat:seat,globalTurn:o.globalTurn??3,phase:2,decisionKind:p?'owner-prompt':'owner-root',
    pendingPromptType:p?.promptType??null,pendingOwnerDeckSearch:false,ownHand:o.ownHand??[],ownPublic:o.ownPublic??player(),
    opponentPublic:o.opponentPublic??player(),ownTurnResources:o.ownTurnResources??resources(),ownerK1:null},
  prompt:p,publicEventReceipt:null,actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:o.items??[{token:'pass',kind:'pass',label:'Pass turn'}]}};}
function checked(input,fixtureId){const init={role:input.role,seat:input.seat,policyVersion:POLICY_VERSION,bundleSha256:'a'.repeat(64),config:{}};
  const parsed=protocol.validateRequest(input,init,input.sequence,new Set()),decision=makePolicy(input.seat).decide(input);
  const validated=protocol.validateDecision(decision,parsed.prompt,parsed.actionTokens);
  fixtureRecords.push({fixtureId,role:input.role,seat:input.seat,observation:input.observation,prompt:input.prompt,
    publicEventReceipt:input.publicEventReceipt,actionFrontier:input.actionFrontier,decision:validated});
  return validated;}

test('source binding rejects wrong rank and candidate fingerprint',()=>{
  assert.throws(()=>createPolicy({role:'opponent',seat:0,policyVersion:POLICY_VERSION,config:{...config,rank:3}}),/AGENT35_RANK31_POLICY_INIT_MISMATCH/);
  assert.throws(()=>createPolicy({role:'opponent',seat:0,policyVersion:POLICY_VERSION,config:{...config,candidateFingerprint:'0'.repeat(64)}}),/AGENT35_RANK31_POLICY_INIT_MISMATCH/);
});
test('Dusknoir PRE Cursed Blast only trades itself for an unprotected multi-Prize KO',()=>{
  const own=player({bench:[pokemon('Dusknoir PRE 37',{hp:160,stage:'Stage 2',subtypes:['Stage 2']})]});
  const items=[{token:'blast',kind:'use-ability',actorPrinting:'Dusknoir PRE 37',publicMetadata:{abilityName:'Cursed Blast',sourceZone:'bench',sourceSeat:'actor',sourceIndex:0}},{token:'pass',kind:'pass'}];
  const target=pokemon('Shadow Rider Calyrex V CRE 74',{hp:210,damage:80,subtypes:['Basic','V']});
  assert.deepEqual(checked(req({ownPublic:own,opponentPublic:player({active:target}),items}),'r31-dev-02.good'),{kind:'select-action',token:'blast'});
  const hooded=pokemon('Shadow Rider Calyrex V CRE 74',{hp:210,damage:80,subtypes:['Basic','V'],tools:['Stealthy Hood UNB 186']});
  assert.deepEqual(checked(req({ownPublic:own,opponentPublic:player({active:hooded}),items}),'r31-dev-02.protected'),{kind:'select-action',token:'pass'});
});
test('Dusclops PRE Cursed Blast uses its separate 5-counter KO threshold',()=>{
  const items=[{token:'blast',kind:'use-ability',actorPrinting:'Dusclops PRE 36',publicMetadata:{abilityName:'Cursed Blast',sourceZone:'bench',sourceSeat:'actor',sourceIndex:0}},{token:'pass',kind:'pass'}];
  const own=player({bench:[pokemon('Dusclops PRE 36',{hp:90,stage:'Stage 1',subtypes:['Stage 1']})]});
  const notReady=pokemon('Shadow Rider Calyrex V CRE 74',{hp:210,damage:80,subtypes:['Basic','V']});
  assert.deepEqual(checked(req({ownPublic:own,opponentPublic:player({active:notReady}),items}),'r31-dev-03.not-ready'),{kind:'select-action',token:'pass'});
  const ready=pokemon('Shadow Rider Calyrex V CRE 74',{hp:210,damage:160,subtypes:['Basic','V']});
  assert.deepEqual(checked(req({ownPublic:own,opponentPublic:player({active:ready}),items}),'r31-dev-03.ready'),{kind:'select-action',token:'blast'});
});
test('Cursed Blast prompt avoids a Hooded Active and selects the unprotected Bench KO',()=>{
  const active=pokemon('Shadow Rider Calyrex V CRE 74',{hp:210,damage:80,subtypes:['Basic','V'],tools:['Stealthy Hood UNB 186']});
  const bench=pokemon('Shadow Rider Calyrex V CRE 74',{hp:210,damage:80,subtypes:['Basic','V']});
  const p=prompt('ChoosePokemonPrompt','Dusknoir PRE 37','Cursed Blast',[
    pChoice('active',active.printing,'active',0),pChoice('bench',bench.printing,'bench',0)],
    {minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false,selectionType:'pokemon',targetZone:'active,bench'});
  assert.deepEqual(checked(req({prompt:p,opponentPublic:player({active,bench:[bench]}),items:[]}),'r31-dev-04.prompt'),
    {kind:'select-choices',tokens:['bench']});
});
test('Field Blower chooses the two-Tool mode when two Hood targets are present',()=>{
  const opp=player({bench:[pokemon('Shadow Rider Calyrex V CRE 74',{hp:210,subtypes:['Basic','V'],tools:['Stealthy Hood UNB 186']}),
    pokemon('Shadow Rider Calyrex VMAX CRE 75',{hp:320,subtypes:['VMAX','V'],tools:['Stealthy Hood UNB 186']})],stadium:['Sky Field ROS 89']});
  const p=prompt('SelectOptionPrompt','Field Blower GRI 125','Field Blower',[
    {token:'two-tools',kind:'option',label:'Discard up to 2 Pokémon Tools',publicMetadata:{choiceIndex:0}},
    {token:'mixed',kind:'option',label:'Discard 1 Stadium and 1 Pokémon Tool',publicMetadata:{choiceIndex:1}}],
    {count:2,allowCancel:false,selectionType:'option'});
  assert.deepEqual(checked(req({prompt:p,opponentPublic:opp,items:[]}),'r31-dev-05.mode'),{kind:'select-choice',token:'two-tools'});
});
test('Field Blower target prompt selects both opponent Pokémon carrying Hood',()=>{
  const a=pokemon('Shadow Rider Calyrex V CRE 74',{hp:210,subtypes:['Basic','V'],tools:['Stealthy Hood UNB 186']});
  const b=pokemon('Shadow Rider Calyrex VMAX CRE 75',{hp:320,subtypes:['VMAX','V'],tools:['Stealthy Hood UNB 186']});
  const p=prompt('ChoosePokemonPrompt','Field Blower GRI 125','Field Blower',[
    pChoice('hood-1',a.printing,'bench',0),pChoice('hood-2',b.printing,'bench',1),
    {token:'empty',kind:'empty-selection',label:'Choose no items'}],
    {minimumCount:0,maximumCount:2,allowCancel:false,isSecret:false,selectionType:'pokemon',targetZone:'active,bench'});
  assert.deepEqual(checked(req({prompt:p,opponentPublic:player({bench:[a,b]}),items:[]}),'r31-dev-06.targets'),
    {kind:'select-choices',tokens:['hood-1','hood-2']});
});
test('Field Blower abstains when option labels do not expose their semantics',()=>{
  const opp=player({active:pokemon('Shadow Rider Calyrex V CRE 74',{hp:210,subtypes:['Basic','V'],tools:['Stealthy Hood UNB 186']})});
  const p=prompt('SelectOptionPrompt','Field Blower GRI 125','Field Blower',[
    {token:'a',kind:'option',label:'Mode A',publicMetadata:{choiceIndex:0}},
    {token:'b',kind:'option',label:'Mode B',publicMetadata:{choiceIndex:1}}],
    {count:2,allowCancel:false,selectionType:'option'});
  assert.deepEqual(checked(req({prompt:p,opponentPublic:opp,items:[]}),'r31-dev-05.unknown'),
    {kind:'abstain',reasonCode:'FIELD_BLOWER_MODE_UNRECOGNIZED'});
});
test('Roxie discards Koffing for Blow-Away Bomb and excludes rule-box Pokémon',()=>{
  const p=prompt('ChooseCardsPrompt','Roxie CEC 205','Roxie',[
    cChoice('koffing','Koffing CEC 76',0),cChoice('unown','Unown AOR 30',1),
    cChoice('gx','Gengar & Mimikyu-GX TEU 53',2),{token:'empty',kind:'empty-selection',label:'Choose none'}],
    {minimumCount:0,maximumCount:2,allowCancel:false,isSecret:false,selectionType:'card-combination'});
  assert.deepEqual(checked(req({prompt:p,ownHand:['Koffing CEC 76','Unown AOR 30','Gengar & Mimikyu-GX TEU 53'],items:[]}),
    'r31-dev-07.roxie'),{kind:'select-choices',tokens:['koffing','unown']});
});
test('Chimecho Bell of Silence outranks Poison Gas against an Ability board',()=>{
  const chimecho=pokemon('Chimecho CIN 43',{hp:70,energies:['Psychic Energy MEE 13']});
  const opponent=player({active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{hp:320,subtypes:['VMAX','V'],abilities:['Underworld Door']})});
  const items=[{token:'bell',kind:'attack',actorPrinting:chimecho.printing,attackName:'Bell of Silence',publicMetadata:{attackCostPayable:true,damage:10}},
    {token:'poison',kind:'attack',actorPrinting:chimecho.printing,attackName:'Poison Gas',publicMetadata:{attackCostPayable:true,damage:10}},
    {token:'pass',kind:'pass'}];
  assert.deepEqual(checked(req({ownPublic:player({active:chimecho}),opponentPublic:opponent,items}),'r31-dev-08.bell'),
    {kind:'select-action',token:'bell'});
});
test('Poltergeist does not infer a hidden opponent hand',()=>{
  const active=pokemon('Gengar & Mimikyu-GX TEU 53',{hp:240,subtypes:['Basic','TAG TEAM','GX'],energies:['Psychic Energy MEE 13','Psychic Energy MEE 13']});
  const items=[{token:'poltergeist',kind:'attack',actorPrinting:active.printing,attackName:'Poltergeist',publicMetadata:{attackCostPayable:true,damage:250}},
    {token:'pass',kind:'pass'}];
  assert.deepEqual(checked(req({ownPublic:player({active}),opponentPublic:player({handCount:5,publicHand:null}),items}),'r31-dev-09.hidden'),
    {kind:'select-action',token:'pass'});
});
test('MoveDamagePrompt fails closed until shared projection supports it',()=>{
  const p=prompt('MoveDamagePrompt','Dusknoir BCR 63','Sinister Hand',[{token:'move',kind:'option',label:'Move one damage counter'}]);
  assert.deepEqual(checked(req({prompt:p,items:[]}),'r31-dev-10.move-damage'),
    {kind:'abstain',reasonCode:'MOVE_DAMAGE_PROMPT_NOT_PROJECTED'});
});
test('same policy handles the physical seat-1 Cursed Blast prompt',()=>{
  const active=pokemon('Shadow Rider Calyrex V CRE 74',{hp:210,damage:80,subtypes:['Basic','V']});
  const p=prompt('ChoosePokemonPrompt','Dusknoir PRE 37','Cursed Blast',[pChoice('target',active.printing,'active',0)],
    {minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false,selectionType:'pokemon',targetZone:'active'},1);
  assert.deepEqual(checked(req({seat:1,prompt:p,opponentPublic:player({active}),items:[]}),'r31-dev-11.seat1'),
    {kind:'select-choices',tokens:['target']});
});
test('no supported root action does not invent a pass token',()=>{
  assert.deepEqual(checked(req({items:[]}),'r31-dev-12.no-pass'),{kind:'abstain',reasonCode:'NO_EXECUTABLE_ACTION'});
});

test('identical actor-visible requests produce identical decisions',()=>{
  const own=player({bench:[pokemon('Dusknoir PRE 37',{hp:160,stage:'Stage 2',subtypes:['Stage 2']})]});
  const target=pokemon('Shadow Rider Calyrex V CRE 74',{hp:210,damage:80,subtypes:['Basic','V']});
  const items=[{token:'blast',kind:'use-ability',actorPrinting:'Dusknoir PRE 37',
    publicMetadata:{abilityName:'Cursed Blast',sourceZone:'bench',sourceSeat:'actor',sourceIndex:0}},{token:'pass',kind:'pass'}];
  const input=req({ownPublic:own,opponentPublic:player({active:target}),items});
  const a=checked(input,'r31-dev-14.deterministic-a');
  const b=checked(input,'r31-dev-14.deterministic-b');
  assert.deepEqual(a,b);
});

module.exports.__fixtureRecords=fixtureRecords;
