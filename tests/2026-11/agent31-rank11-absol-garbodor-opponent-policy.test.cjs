'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const policy=require('../../simulation/evaluation/2026-11/agent31-rank11-absol-garbodor-opponent-policy.cjs');
const {POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,SOURCE_ENTRY_JSON_SHA256,CANDIDATE_ENTRY_JSON_SHA256,WORKER_PROTOCOL_BLOB_SHA1,SOURCE_INVENTORY,createPolicy}=policy;
const root=path.resolve(__dirname,'../..'),config={};
const bundleSha256=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'simulation/evaluation/2026-11/agent31-rank11-absol-garbodor-opponent-policy.cjs'))).digest('hex');
const P={mega:'Mega Absol ex MEG 86',trubbish:'Trubbish FST 168',garbodor:'Garbodor BKP 57',oranguru:'Oranguru V ASR 133',latias:'Latias ex SSP 76',tapu:'Tapu Lele-GX GRI 60',crobat:'Crobat V DAA 104',squawk:'Squawkabilly ex PAL 169',letter:'Professor\'s Letter BKT 146',carmine:'Carmine TWM 145',marnie:'Marnie SSH 169',guzma:'Guzma BUS 115',vip:'Battle VIP Pass FST 225',quick:'Quick Ball FST 237',darkPatch:'Dark Patch ASR 139',boost:'Boost Shake EVS 142',secret:'Secret Box TWM 163',float:'Float Stone BKT 137',forest:'Forest Seal Stone SIT 156',muscle:'Muscle Band XY 121',dark:'Darkness Energy MEE 15'};
function restrictions(){return{cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],blockedAttackNameNextTurn:null,blockedAttackNameUntilLeavesActive:null,onlyAllowedAttackNameNextTurn:null,attackCostIncreaseNextTurn:0,attackCostIncreaseWhileActive:0,cannotRetreat:false,cannotRetreatNextTurn:false,cannotRetreatWhileActive:false,cannotEvolveNextTurn:false}}
function publicRestrictions(extra={}){return{gxUsed:false,vstarUsed:false,attackLockTurnsRemaining:0,attackMaxEnergy:null,attackMaxEnergyTurnsRemaining:0,ignoreAttackCostCardTypes:[],ignoreAttackCostTurnsRemaining:0,cannotUseGXAttacks:false,pokemonPlayLocked:false,abilityPokemonPlayLocked:false,evolutionPlayLocked:false,itemPlayLocked:false,supporterPlayLocked:false,stadiumPlayLocked:false,toolPlayLocked:false,energyPlayLocked:false,specialEnergyPlayLocked:false,stadiumAndToolHaveNoEffectTurnsRemaining:null,...extra}}
function pokemon(printing,opt={}){const abilities=opt.abilities??[];return{printing,name:opt.name??printing.split(' ').slice(0,-2).join(' '),hp:opt.hp??180,damage:opt.damage??0,lastPlayedOrEvolvedTurn:opt.lastPlayedOrEvolvedTurn??1,printed:{stage:opt.stage??'BASIC',subtypes:opt.subtypes??['Basic'],types:opt.types??['Darkness'],retreatCost:opt.retreatCost??['Colorless'],weakness:[],resistance:[]},specialConditions:[],publicRestrictions:restrictions(),evolutionPrintings:opt.evolutionPrintings??[],energies:opt.energies??[],tools:opt.tools??[],attacks:opt.attacks??[],abilities,abilityDetails:abilities.map(name=>({name,powerType:'ABILITY',text:'Once during your turn.'})),abilitySuppressions:null}}
function player(opt={}){const bench=(opt.bench??[]).slice(0,5);while(bench.length<5)bench.push(null);return{active:opt.active??null,bench,stadium:opt.stadium??[],discard:opt.discard??[],lostZone:[],resolvingSupporter:[],publicHand:null,prizeSlots:[],publicTurnRestrictions:publicRestrictions(opt.publicTurnRestrictions??{}),handCount:opt.handCount??0,deckCount:opt.deckCount??30,prizeCount:opt.prizeCount??6}}
function turnResources(extra={}){return{supporterPlayedTurn:0,retreatedTurn:0,extraTurnActive:false,energyPlayedTurn:false,stadiumPlayedTurn:false,stadiumUsedTurn:false,vstarUsed:false,pokemonPlayLocked:false,abilityPokemonPlayLocked:false,evolutionPlayLocked:false,itemPlayLocked:false,supporterPlayLocked:false,stadiumPlayLocked:false,toolPlayLocked:false,energyPlayLocked:false,specialEnergyPlayLocked:false,...extra}}
function observation(opt={}){return{actorSeat:opt.actorSeat??0,globalTurn:opt.globalTurn??3,phase:2,decisionKind:opt.prompt?'owner-prompt':'owner-root',pendingPromptType:opt.prompt?.promptType??null,pendingOwnerDeckSearch:false,ownHand:opt.ownHand??[],ownPublic:opt.ownPublic??player(),opponentPublic:opt.opponentPublic??player(),ownTurnResources:opt.ownTurnResources??turnResources(),ownerK1:null}}
function rootRequest(opt={}){const seat=opt.seat??0;return{schema:protocol.REQUEST_SCHEMA,type:'decision',requestId:opt.requestId??'agent31-root-1',sequence:1,role:'opponent',seat,observationSchema:protocol.OBSERVATION_SCHEMA,observation:observation({...opt,actorSeat:seat}),prompt:null,publicEventReceipt:null,actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:opt.items??[{token:'pass',kind:'pass',label:'Pass turn'}]}}}
function source(printing,effect){return{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:printing,effectName:effect}}
function card(token,printing,zone='deck',owner='actor'){return{token,kind:'card',printing,label:printing,publicMetadata:{sourceZone:zone,ownerSeat:owner}}}
function poke(token,printing,owner='actor',zone='bench',index=0){return{token,kind:'pokemon',printing,label:printing,publicMetadata:{ownerSeat:owner,targetZone:zone,benchIndex:index,isOwnerVisible:true}}}
function promptRequest(opt={}){const seat=opt.seat??0,p={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:opt.promptType,description:opt.description??'Choose a legal option',source:opt.source??source('Test source TEST 1','Test effect'),choices:opt.choices??[],...(opt.publicMetadata?{publicMetadata:opt.publicMetadata}:{})};return{schema:protocol.REQUEST_SCHEMA,type:'decision',requestId:opt.requestId??'agent31-prompt-1',sequence:1,role:'opponent',seat,observationSchema:protocol.OBSERVATION_SCHEMA,observation:observation({...opt,actorSeat:seat,prompt:p}),prompt:p,publicEventReceipt:null,actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}}}
function makePolicy(seat=0){return createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,config})}
function checked(req,seat=0){const init={schema:protocol.INIT_SCHEMA,type:'init',role:'opponent',seat,policyVersion:POLICY_VERSION,bundleSha256:bundleSha256,config};protocol.validateInit(init);const v=protocol.validateRequest(req,init,req.sequence,new Set()),d=makePolicy(seat).decide(req);protocol.validateDecision(d,v.prompt,v.actionTokens);return d}
function gitBlobSha1(s){return crypto.createHash('sha1').update('blob '+Buffer.byteLength(s,'utf8')+'\0'+s,'utf8').digest('hex')}
function sha256(s){return crypto.createHash('sha256').update(s,'utf8').digest('hex')}

test('policy source satisfies Agent36 V3 one-file worker loader constraints',()=>{
 const sourceText=fs.readFileSync(path.join(root,'simulation/evaluation/2026-11/agent31-rank11-absol-garbodor-opponent-policy.cjs'),'utf8');
 assert.match(sourceText,/\bconst\s+POLICY_VERSION\s*=\s*(['"])[^'"]+\1\s*;/);
 assert.match(sourceText,/module\.exports\s*=/);
 assert.doesNotMatch(sourceText,/\b(?:require|import|process|globalThis|fetch|setTimeout|setInterval)\b|Math\.random/,
  'worker policy must be a deterministic, inert one-file asset');
});
test('dependency manifest binds policy, worker protocol, and pinned Twinleaf',()=>{
 const m=JSON.parse(fs.readFileSync(path.join(root,'results/aichi-2026/2026-11/agent31-rank11-opponent-policy-v1-dependencies.json'),'utf8'));
 const policyText=fs.readFileSync(path.join(root,'simulation/evaluation/2026-11/agent31-rank11-absol-garbodor-opponent-policy.cjs'),'utf8');
 const testText=fs.readFileSync(path.join(root,'tests/2026-11/agent31-rank11-absol-garbodor-opponent-policy.test.cjs'),'utf8');
 const gitmodules=fs.readFileSync(path.join(root,'.gitmodules'),'utf8');
 assert.equal(m.policy.sha256,bundleSha256);
 assert.equal(m.policy.gitBlobSha1,gitBlobSha1(policyText));
 assert.equal(m.workerProtocol.gitBlobSha1,WORKER_PROTOCOL_BLOB_SHA1);
 assert.equal(m.engine.pinnedRevision,policy.ENGINE_PIN);
 assert.equal(m.engine.submodulePath,'vendor/twinleaf');
 assert.ok(gitmodules.includes(m.engine.remote));
 assert.equal(m.test.sha256,sha256(testText));
});
test('rank-11 source inventory is the exact published 60',()=>{
 assert.equal(SOURCE_RANK,11);assert.equal(SOURCE_INVENTORY.reduce((n,r)=>n+r[1],0),60);
 const text=fs.readFileSync(path.join(root,'results/aichi-2026/full-decklists.json'),'utf8');
 assert.equal(gitBlobSha1(text),SOURCE_LIST_BLOB_SHA1);
 const entry=JSON.parse(text).decks.find(r=>r.rank===11);assert.ok(entry);
 assert.equal(sha256(JSON.stringify(entry)),SOURCE_ENTRY_JSON_SHA256);
 assert.deepEqual(entry.cards.map(c=>[c.name+' '+c.printing.set+' '+c.printing.number,c.count]),SOURCE_INVENTORY);
});
test('candidate fingerprint binds the unchanged Hood Shadow Rider JSON',()=>{
 const text=fs.readFileSync(path.join(root,'results/aichi-2026/candidate-hood-shadow-rider.json'),'utf8');
 assert.equal(sha256(JSON.stringify(JSON.parse(text))),CANDIDATE_ENTRY_JSON_SHA256);
});
test('worker protocol pin matches the exact validator blob',()=>{
 const text=fs.readFileSync(path.join(root,'simulation/evaluation/2026-11/agent49-policy-worker.cjs'),'utf8');
 assert.equal(gitBlobSha1(text),WORKER_PROTOCOL_BLOB_SHA1);
});
test('policy init obeys the worker empty-config contract',()=>{
 assert.throws(()=>createPolicy({role:'opponent',seat:0,policyVersion:POLICY_VERSION,config:{rank:11}}));
 assert.throws(()=>createPolicy({role:'candidate',seat:0,policyVersion:POLICY_VERSION,config:{}}));
 assert.throws(()=>createPolicy({role:'opponent',seat:0,policyVersion:'wrong',config:{}}));
});
test('first-turn VIP Pass outranks pass',()=>{
 const r=rootRequest({globalTurn:1,items:[{token:'vip',kind:'play-card',actorPrinting:P.vip,publicMetadata:{cardType:'item'}},{token:'pass',kind:'pass'}]});
 assert.deepEqual(checked(r),{kind:'select-action',token:'vip'});
});
test('Back Order is prioritized on an active Oranguru V',()=>{
 const own=player({active:pokemon(P.oranguru,{abilities:['Back Order']})});
 const r=rootRequest({ownPublic:own,items:[{token:'back',kind:'use-ability',actorPrinting:P.oranguru,publicMetadata:{abilityName:'Back Order'}},{token:'pass',kind:'pass'}]});
 assert.deepEqual(checked(r),{kind:'select-action',token:'back'});
});
test('Back Order searches Forest Seal Stone and Float Stone for the lock line',()=>{
 const own=player({active:pokemon(P.oranguru,{abilities:['Back Order']}),bench:[pokemon(P.trubbish),pokemon(P.mega)]});
 const r=promptRequest({promptType:'ChooseCardsPrompt',source:source(P.oranguru,'Back Order'),ownPublic:own,publicMetadata:{selectionType:'card-combination',minimumCount:2,maximumCount:2,allowCancel:false},choices:[card('fss',P.forest),card('float',P.float),card('band',P.muscle)]});
 assert.deepEqual(checked(r),{kind:'select-choices',tokens:['fss','float']});
});
test('VIP Pass searches Trubbish and Oranguru V before optional Basics',()=>{
 const r=promptRequest({promptType:'ChooseCardsPrompt',source:source(P.vip,'Battle VIP Pass'),globalTurn:1,publicMetadata:{selectionType:'card-combination',minimumCount:2,maximumCount:2,allowCancel:false},choices:[card('absol',P.mega),card('trubbish',P.trubbish),card('oranguru',P.oranguru),card('crobat',P.crobat)]});
 assert.deepEqual(checked(r),{kind:'select-choices',tokens:['trubbish','oranguru']});
});
test('Boost Shake chooses Garbodor only with Trubbish and no existing Garbodor',()=>{
 const own=player({active:pokemon(P.oranguru),bench:[pokemon(P.trubbish)]});
 const r=promptRequest({promptType:'ChooseCardsPrompt',source:source(P.boost,'Boost Shake'),ownPublic:own,choices:[card('garbodor',P.garbodor)]});
 assert.deepEqual(checked(r),{kind:'select-choice',token:'garbodor'});
 const bad=promptRequest({promptType:'ChooseCardsPrompt',source:source(P.boost,'Boost Shake'),ownPublic:player({bench:[pokemon(P.trubbish),pokemon(P.garbodor)]}),choices:[card('garbodor',P.garbodor)]});
 assert.equal(checked(bad).kind,'abstain');
});
test('Quick Ball cost preserves Secret Box and discards a late VIP Pass',()=>{
 const r=promptRequest({promptType:'ChooseCardsPrompt',source:source(P.quick,'Quick Ball'),globalTurn:4,ownHand:[P.secret,P.vip],choices:[card('secret',P.secret,'hand'),card('vip',P.vip,'hand')]});
 assert.deepEqual(checked(r),{kind:'select-choice',token:'vip'});
});
test('Dark Patch selects a benched Mega Absol missing Energy',()=>{
 const r=promptRequest({promptType:'ChoosePokemonPrompt',source:source(P.darkPatch,'Dark Patch'),ownPublic:player({bench:[pokemon(P.mega,{energies:[P.dark,P.dark]})]}),choices:[poke('absol',P.mega,'actor','bench',0)]});
 assert.deepEqual(checked(r),{kind:'select-choice',token:'absol'});
});
test('Guzma selects a damaged three-Prize VMAX inside the 220 damage envelope',()=>{
 const vmax=pokemon('Shadow Rider Calyrex VMAX CRE 75',{hp:320,damage:100,subtypes:['VMAX'],energies:['Basic Psychic Energy CRE 232','Basic Psychic Energy CRE 232']});
 const v=pokemon('Shadow Rider Calyrex V CRE 74',{hp:210,subtypes:['Basic','V']});
 const r=promptRequest({promptType:'ChoosePokemonPrompt',source:source(P.guzma,'Guzma'),opponentPublic:player({bench:[vmax,v]}),choices:[poke('vmax','Shadow Rider Calyrex VMAX CRE 75','opponent','bench',0),poke('v','Shadow Rider Calyrex V CRE 74','opponent','bench',1)]});
 assert.deepEqual(checked(r),{kind:'select-choice',token:'vmax'});
});
test('Terminal Period is selected only at exactly six damage counters',()=>{
 const a=rootRequest({items:[{token:'terminal',kind:'attack',actorPrinting:P.mega,attackName:'Terminal Period',publicMetadata:{attackCostPayable:true,targetDamage:300}},{token:'claw',kind:'attack',actorPrinting:P.mega,attackName:'Claw of Darkness',publicMetadata:{attackCostPayable:true,damage:200}},{token:'pass',kind:'pass'}]});
 assert.deepEqual(checked(a),{kind:'select-action',token:'terminal'});
 const b=rootRequest({items:[{token:'terminal',kind:'attack',actorPrinting:P.mega,attackName:'Terminal Period',publicMetadata:{attackCostPayable:true,targetDamage:290}},{token:'claw',kind:'attack',actorPrinting:P.mega,attackName:'Claw of Darkness',publicMetadata:{attackCostPayable:true,damage:200}},{token:'pass',kind:'pass'}]});
 assert.deepEqual(checked(b),{kind:'select-action',token:'claw'});
});
test('Marnie disrupts a large opponent hand but not a small one',()=>{
 const a=rootRequest({opponentPublic:player({handCount:6}),items:[{token:'marnie',kind:'play-card',actorPrinting:P.marnie,publicMetadata:{cardType:'supporter'}},{token:'pass',kind:'pass'}]});
 assert.deepEqual(checked(a),{kind:'select-action',token:'marnie'});
 const b=rootRequest({opponentPublic:player({handCount:2}),items:[{token:'marnie',kind:'play-card',actorPrinting:P.marnie,publicMetadata:{cardType:'supporter'}},{token:'pass',kind:'pass'}]});
 assert.deepEqual(checked(b),{kind:'select-action',token:'pass'});
});
test('Garbodor evolution follows Trubbish plus Tool setup',()=>{
 const own=player({bench:[pokemon(P.trubbish,{tools:[P.float]})]});
 const r=rootRequest({ownPublic:own,items:[{token:'evolve',kind:'play-card',actorPrinting:P.garbodor,publicMetadata:{cardType:'pokemon'}},{token:'pass',kind:'pass'}]});
 assert.deepEqual(checked(r),{kind:'select-action',token:'evolve'});
});
test('unpayable attacks are never selected',()=>{
 const r=rootRequest({items:[{token:'claw',kind:'attack',actorPrinting:P.mega,attackName:'Claw of Darkness',publicMetadata:{attackCostPayable:false}},{token:'pass',kind:'pass'}]});
 assert.deepEqual(checked(r),{kind:'select-action',token:'pass'});
});
test('ambiguous duplicate-printing Guzma targets fail closed',()=>{
 const a=pokemon('Shadow Rider Calyrex V CRE 74',{hp:210,damage:80,subtypes:['Basic','V']}),b=pokemon('Shadow Rider Calyrex V CRE 74',{hp:210,damage:0,subtypes:['Basic','V']});
 const r=promptRequest({promptType:'ChoosePokemonPrompt',source:source(P.guzma,'Guzma'),opponentPublic:player({bench:[a,b]}),choices:[{token:'ambiguous',kind:'pokemon',printing:'Shadow Rider Calyrex V CRE 74',label:'Shadow Rider Calyrex V CRE 74',publicMetadata:{ownerSeat:'opponent',targetZone:'bench'}}]});
 assert.equal(checked(r).kind,'abstain');
});
test('unsupported prompt types fail closed',()=>{
 const r=promptRequest({promptType:'ChooseEnergyPrompt',source:source('Unknown card TEST 1','Unknown effect'),choices:[card('energy','Basic Darkness Energy CRE 202','deck')]});
 assert.equal(checked(r).kind,'abstain');
});
test('wrong actor seat fails closed',()=>{
 assert.deepEqual(makePolicy(0).decide(rootRequest({seat:1})),{kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'});
});
test('forbidden seed and hidden-state fields are rejected by the real worker validator',()=>{
 const r=rootRequest();r.observation.seed=123;const init={schema:protocol.INIT_SCHEMA,type:'init',role:'opponent',seat:0,policyVersion:POLICY_VERSION,bundleSha256:bundleSha256,config};
 protocol.validateInit(init);assert.throws(()=>protocol.validateRequest(r,init,1,new Set()));
});
test('Secret Box discard preserves itself and a live Guzma',()=>{
 const opp=player({bench:[pokemon('Shadow Rider Calyrex V CRE 74',{subtypes:['Basic','V']})]});
 const r=promptRequest({promptType:'ChooseCardsPrompt',source:source(P.secret,'Secret Box'),globalTurn:4,ownHand:[P.secret,P.guzma,P.vip,P.dark,P.dark,P.dark,P.carmine,P.marnie],opponentPublic:opp,publicMetadata:{selectionType:'card-combination',minimumCount:3,maximumCount:3,allowCancel:false},choices:[card('secret',P.secret,'hand'),card('guzma',P.guzma,'hand'),card('vip',P.vip,'hand'),card('dark1',P.dark,'hand'),card('dark2',P.dark,'hand'),card('dark3',P.dark,'hand'),card('carmine',P.carmine,'hand'),card('marnie',P.marnie,'hand')]});
 const d=checked(r);assert.equal(d.kind,'select-choices');assert.equal(d.tokens.includes('secret'),false);assert.equal(d.tokens.includes('guzma'),false);
});

test("Professor's Letter searches two Basic Darkness Energy when the hand needs energy",()=>{
 const own=player({bench:[pokemon(P.mega)]});
 const play=rootRequest({ownHand:[P.letter],ownPublic:own,items:[{token:'letter',kind:'play-card',actorPrinting:P.letter,publicMetadata:{cardType:'item'}},{token:'pass',kind:'pass'}]});
 assert.deepEqual(checked(play),{kind:'select-action',token:'letter'});
 const search=promptRequest({promptType:'ChooseCardsPrompt',source:source(P.letter,"Professor's Letter"),ownHand:[P.letter],ownPublic:own,publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:2,allowCancel:true},choices:[card('dark1',P.dark),card('dark2',P.dark),card('psychic','Psychic Energy MEE 13')]});
 assert.deepEqual(checked(search),{kind:'select-choices',tokens:['dark1','dark2']});
});
test('Claw of Darkness discards a high-value revealed opponent card',()=>{
 const r=promptRequest({promptType:'ChooseCardsPrompt',source:source(P.mega,'Claw of Darkness'),choices:[
  {token:'psychic',kind:'card',printing:'Psychic Energy MEE 13',label:'Psychic Energy MEE 13',publicMetadata:{sourceZone:'hand',ownerSeat:'opponent'}},
  {token:'field-blower',kind:'card',printing:'Field Blower GRI 125',label:'Field Blower GRI 125',publicMetadata:{sourceZone:'hand',ownerSeat:'opponent'}},
  {token:'hood',kind:'card',printing:'Stealthy Hood UNB 186',label:'Stealthy Hood UNB 186',publicMetadata:{sourceZone:'hand',ownerSeat:'opponent'}}
 ]});
 assert.deepEqual(checked(r),{kind:'select-choice',token:'field-blower'});
});
test('Squawkabilly Motivate attacks, targets Mega Absol, and selects Darkness Energy',()=>{
 const own=player({bench:[pokemon(P.mega),pokemon(P.trubbish)],discard:[P.dark,P.dark]});
 const attack=rootRequest({ownPublic:own,items:[{token:'motivate',kind:'attack',actorPrinting:P.squawk,attackName:'Motivate',publicMetadata:{attackCostPayable:true}},{token:'pass',kind:'pass'}]});
 assert.deepEqual(checked(attack),{kind:'select-action',token:'motivate'});
 const target=promptRequest({promptType:'ChoosePokemonPrompt',source:source(P.squawk,'Motivate'),ownPublic:own,choices:[poke('absol',P.mega,'actor','bench',0),poke('trubbish',P.trubbish,'actor','bench',1)]});
 assert.deepEqual(checked(target),{kind:'select-choice',token:'absol'});
 const energy=promptRequest({promptType:'ChooseCardsPrompt',source:source(P.squawk,'Motivate'),ownPublic:own,publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:2,allowCancel:false},choices:[card('dark1',P.dark,'discard'),card('dark2',P.dark,'discard')]});
 assert.deepEqual(checked(energy),{kind:'select-choices',tokens:['dark1','dark2']});
});
test('Trubbish Call for Family attacks and searches Oranguru ahead of a redundant Trubbish',()=>{
 const own=player({active:pokemon(P.trubbish)});
 const attack=rootRequest({ownPublic:own,items:[{token:'call',kind:'attack',actorPrinting:P.trubbish,attackName:'Call for Family',publicMetadata:{attackCostPayable:true}},{token:'pass',kind:'pass'}]});
 assert.deepEqual(checked(attack),{kind:'select-action',token:'call'});
 const search=promptRequest({promptType:'ChooseCardsPrompt',source:source(P.trubbish,'Call for Family'),ownPublic:own,choices:[card('trubbish',P.trubbish),card('oranguru',P.oranguru),card('absol',P.mega)]});
 assert.deepEqual(checked(search),{kind:'select-choice',token:'oranguru'});
});
test('Mega Absol retreat requires a payable attack line',()=>{
 const two=player({active:pokemon(P.oranguru),bench:[pokemon(P.mega,{energies:[P.dark,P.dark]})]});
 const noLine=rootRequest({ownPublic:two,items:[{token:'retreat',kind:'retreat',targetPrinting:P.mega},{token:'pass',kind:'pass'}]});
 assert.deepEqual(checked(noLine),{kind:'select-action',token:'pass'});
 const terminalLine=rootRequest({ownPublic:two,opponentPublic:player({active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{hp:320,damage:300,subtypes:['VMAX']})}),items:[{token:'retreat',kind:'retreat',targetPrinting:P.mega},{token:'pass',kind:'pass'}]});
 assert.deepEqual(checked(terminalLine),{kind:'select-action',token:'retreat'});
 const three=player({active:pokemon(P.oranguru),bench:[pokemon(P.mega,{energies:[P.dark,P.dark,P.dark]})]});
 const line=rootRequest({ownPublic:three,items:[{token:'retreat',kind:'retreat',targetPrinting:P.mega},{token:'pass',kind:'pass'}]});
 assert.deepEqual(checked(line),{kind:'select-action',token:'retreat'});
});

test('actor-only protocol rejects extra hidden observation keys',()=>{
 const r=rootRequest();r.observation.nativeState={};const init={schema:protocol.INIT_SCHEMA,type:'init',role:'opponent',seat:0,policyVersion:POLICY_VERSION,bundleSha256:bundleSha256,config};
 protocol.validateInit(init);assert.throws(()=>protocol.validateRequest(r,init,1,new Set()));
});
