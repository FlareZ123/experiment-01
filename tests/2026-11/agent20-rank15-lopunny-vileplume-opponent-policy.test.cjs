'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {POLICY_VERSION,SOURCE_RANK,SOURCE_COUNTS,SOURCE_LIST_BLOB_SHA1,
  createPolicy,movementEvidence,printedDamage,doubleBaseCutExposed} =
  require('../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const MEGA='Mega Lopunny ex PFL 84',MIMIKYU='Mimikyu GRI 58';
const poffin='Buddy-Buddy Poffin TEF 144',oddish='Oddish UNB 5';
const src=(actorPrinting,kind,token,attackName)=>({kind,token,actorPrinting,...(attackName?{attackName}:{})});
const pokemon=(printing,options={})=>({printing,hp:options.hp??330,damage:options.damage??0,
  energies:options.energies??[],tools:options.tools??[],printed:options.printed??{stage:'BASIC',weakness:[],resistance:[]}});
const p=(active,bench=[],opts={})=>({active,bench,discard:opts.discard??[],stadium:opts.stadium??[],
  prizeCount:opts.prizeCount??3});
const policy=seat=>createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,config:{}});
function root(seat=0){
  const own=p(pokemon(MEGA,{damage:120}),[],{prizeCount:3});
  const opp=p(pokemon('Girafarig LOT 94',{hp:90}),[pokemon(MIMIKYU,{hp:70,
    energies:['Psychic Energy MEE 13']})],{stadium:['Dimension Valley PHF 93'],prizeCount:3});
  const r={role:'opponent',seat,prompt:null,observation:{actorSeat:seat,globalTurn:6,
    ownPublic:own,opponentPublic:opp,ownHand:[]},actionFrontier:{items:[
    src(MEGA,'attack','gale','Gale Thrust'),src(MEGA,'attack','spiky','Spiky Hopper')]}};
  const stamp=(moved)=>({actorSeat:seat,turn:6,
    ownerActive:{printing:MEGA,movedFromBenchToActiveThisTurn:moved,knownAbilityUse:[]}});
  r.publicEventReceipt=stamp(true);
  return r;
}
const decision = r=>policy(r.seat).decide(r);
const card=(printing,token)=>({kind:'card',printing,token});
function searchPrompt(r,choices,min=0,max=2){r.prompt={
  promptType:'ChooseCardsPrompt',source:{sourcePrinting:poffin,effectName:'Buddy-Buddy Poffin'},
  publicMetadata:{selectionType:'card-combination',ownerSeat:'actor',
    isOwnerVisible:true,sourceZone:'deck',minimumCount:min,maximumCount:max},choices};return r;}

test('rank 15 exact 60 and immutable actor source contract',()=>{
  assert.equal(SOURCE_RANK,15);assert.equal(SOURCE_LIST_BLOB_SHA1,'ae773f6201d7aa69d31914dbfee66f3fba692200');
  assert.equal(SOURCE_COUNTS.length,35);assert.equal(SOURCE_COUNTS.reduce((s,x)=>s+x[1],0),60);
  assert.equal(new Map(SOURCE_COUNTS).get(MEGA),2);
  assert.equal(new Map(SOURCE_COUNTS).get(oddish),2);
  assert.equal(new Map(SOURCE_COUNTS).get('Vileplume BUS 6'),1);
  assert.throws(()=>createPolicy({role:'candidate',seat:0,policyVersion:POLICY_VERSION,config:{}}));
  assert.throws(()=>createPolicy({role:'opponent',seat:0,policyVersion:POLICY_VERSION,config:{rank:15}}));
});
for(const seat of [0,1]){
  test('seat '+seat+': moved Mega takes same 90HP KO with safer Spiky instead of Gale',()=>{
    const r=root(seat);
    assert.equal(movementEvidence(r),true);
    assert.equal(printedDamage(r.actionFrontier.items[0],r),230);
    assert.equal(printedDamage(r.actionFrontier.items[1],r),160);
    assert.deepEqual(decision(r),{kind:'select-action',token:'spiky'});
  });
  test('seat '+seat+': terminal prize overrides Copycat-risk and takes Gale',()=>{
    const r=root(seat);r.observation.ownPublic.prizeCount=1;
    assert.deepEqual(decision(r),{kind:'select-action',token:'gale'});
  });
  test('seat '+seat+': missing movement evidence does not fabricate Gale 230',()=>{
    const r=root(seat);r.publicEventReceipt=null;
    assert.equal(printedDamage(r.actionFrontier.items[0],r),null);
    assert.deepEqual(decision(r),{kind:'select-action',token:'spiky'});
  });
  test('seat '+seat+': Poffin root -> legal deck selection -> Oddish Bench -> Gloom evolution',()=>{
    const r=root(seat);r.observation.ownPublic=p(pokemon('Bunnelby PRC 121',{hp:70}));
    r.observation.opponentPublic=p(pokemon('Shadow Rider Calyrex VMAX CRE 75',{hp:320}));
    r.observation.ownHand=[poffin];r.actionFrontier.items=[src(poffin,'play-card','poffin')];
    assert.deepEqual(decision(r),{kind:'select-action',token:'poffin'});
    searchPrompt(r,[card(oddish,'o1'),card(oddish,'o2'),card('Buneary PFL 83','b'),
      card('Vileplume AOR 3','not-basic')]);
    assert.deepEqual(decision(r),{kind:'select-choices',tokens:['o1','o2']});
    r.prompt=null;r.observation.ownPublic.bench=[pokemon(oddish,{hp:50})];
    r.observation.ownHand=[oddish];r.actionFrontier.items=[src(oddish,'play-card','bench-oddish')];
    assert.deepEqual(decision(r),{kind:'select-action',token:'bench-oddish'});
    r.observation.ownPublic.bench=[pokemon(oddish,{hp:50})];
    r.observation.ownHand=['Gloom UNB 7'];
    r.actionFrontier.items=[{...src('Gloom UNB 7','play-card','evolve'),targetPrinting:oddish}];
    assert.deepEqual(decision(r),{kind:'select-action',token:'evolve'});
  });
}
test('stationary Gale cannot KO healthy 90HP target while paid Spiky can',()=>{
  const r=root();r.publicEventReceipt.ownerActive.movedFromBenchToActiveThisTurn=false;
  assert.equal(printedDamage(r.actionFrontier.items[0],r),60);
  assert.equal(decision(r).token,'spiky');
});
test('ineligible Mimikyu funding removes anti-Gale categorical preference',()=>{
  const r=root();r.observation.opponentPublic.bench[0].energies=[];
  r.observation.opponentPublic.stadium=[];
  assert.equal(decision(r).token,'gale');
});
test('unfunded Vileplume/Gale must not be invented from names',()=>{
  const r=root();r.actionFrontier.items=[src('Bunnelby PRC 121','attack','rototiller','Rototiller')];
  assert.deepEqual(decision(r),{kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'});
});
test('Peck Off is refused if it frees paid Girafarig to Get Lost both discarded Oddish',()=>{
  const r=root();r.observation.ownPublic=p(pokemon('Pidgey FLF 75',{hp:60}),[],
    {discard:[oddish,oddish]});
  r.observation.opponentPublic=p(pokemon('Girafarig LOT 94',{hp:130,
    energies:['Psychic Energy MEE 13'],tools:['Stealthy Hood UNB 186']}));
  r.actionFrontier.items=[src('Pidgey FLF 75','attack','peck','Peck Off')];
  assert.equal(doubleBaseCutExposed(r),true);
  assert.deepEqual(decision(r),{kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'});
  r.observation.ownPublic.discard=[oddish];
  assert.deepEqual(decision(r),{kind:'select-action',token:'peck'});
});
test('full Bench blocks initiating Poffin; empty deck choice is explicit',()=>{
  const r=root();r.observation.ownPublic=p(pokemon('Bunnelby PRC 121',{hp:70}),
    Array.from({length:5},()=>pokemon('Buneary PFL 83',{hp:70})));
  r.actionFrontier.items=[src(poffin,'play-card','poffin')];
  assert.equal(decision(r).kind,'abstain');
  searchPrompt(r,[card(oddish,'o'),{kind:'empty-selection',token:'empty'}]);
  assert.deepEqual(decision(r),{kind:'select-choice',token:'empty'});
});
test('Poffin opponent-zone, missing bounds and unsupported effect fail closed',()=>{
  const r=root();searchPrompt(r,[card(oddish,'o')]);
  r.prompt.publicMetadata.ownerSeat='opponent';
  assert.equal(decision(r).reasonCode,'UNSUPPORTED_CARD_COMBINATION_SOURCE');
  r.prompt.publicMetadata.ownerSeat='actor';delete r.prompt.publicMetadata.maximumCount;
  assert.equal(decision(r).reasonCode,'UNSUPPORTED_CARD_COMBINATION_SOURCE');
  r.prompt.source.sourcePrinting='Tag Call CEC 206';
  assert.equal(decision(r).reasonCode,'UNSUPPORTED_CARD_COMBINATION_SOURCE');
});
test('wrong seat and source config cannot choose offered tokens',()=>{
  const r=root(0);r.seat=1;
  assert.equal(policy(0).decide(r).reasonCode,'ROLE_SEAT_BINDING_MISMATCH');
});

const tag='Tag Call CEC 206',gh='Guzma & Hala CEC 193';
const tm='Technical Machine: Evolution PAR 178',jet='Jet Energy PAL 190';
const xt='Xtransceiver NVI 96';
const grand='Grand Tree SCR 136';
const selection=(r,source,zone,choices,min,max)=>{
  r.prompt={promptType:'ChooseCardsPrompt',source:{sourcePrinting:source,effectName:source.split(' CEC')[0]},
    publicMetadata:{selectionType:'card-combination',ownerSeat:'actor',isOwnerVisible:true,
      sourceZone:zone,minimumCount:min,maximumCount:max},choices};return r;
};
function ghRoot(seat){
  const r=root(seat);r.observation.ownPublic=p(pokemon('Bunnelby PRC 121',{hp:70}),
    [pokemon(oddish,{hp:50})]);
  r.observation.opponentPublic=p(pokemon('Shadow Rider Calyrex VMAX CRE 75',{hp:320}));
  r.observation.ownTurnResources={supporterPlayedTurn:0,energyPlayedTurn:0};
  r.observation.ownHand=[tag,xt,xt,'Buneary PFL 83'];
  r.actionFrontier.items=[src(tag,'play-card','tag'),src('Gloom UNB 7','pass','pass')];
  return r;
}
for(const seat of [0,1]){
  test('seat '+seat+': Tag Call -> Guzma&Hala paid mode -> 3-category retrieval -> TM Bunnelby Evolution attack',()=>{
    const r=ghRoot(seat);
    assert.deepEqual(decision(r),{kind:'select-action',token:'tag'});
    selection(r,tag,'deck',[card(gh,'gh'),card('Guzma BUS 115','not-tag')],0,2);
    assert.deepEqual(decision(r),{kind:'select-choices',tokens:['gh']});
    r.prompt=null;r.observation.ownHand=[gh,xt,xt];
    r.actionFrontier.items=[src(gh,'play-card','play-gh')];
    assert.deepEqual(decision(r),{kind:'select-action',token:'play-gh'});
    r.observation.ownHand=[xt,xt];
    r.observation.ownTurnResources.supporterPlayedTurn=6; // GH already played this turn
    r.prompt={promptType:'SelectOptionPrompt',source:{sourcePrinting:gh,effectName:'Guzma & Hala'},
      publicMetadata:{selectionType:'option'},choices:[
        {kind:'option',token:'zero',label:'Do not discard 2 cards',publicMetadata:{choiceIndex:0}},
        {kind:'option',token:'one',label:'Discard 2 cards from hand',publicMetadata:{choiceIndex:1}}]};
    assert.deepEqual(decision(r),{kind:'select-choice',token:'one'});
    selection(r,gh,'hand',[card(xt,'x1'),card(xt,'x2'),card('Buneary PFL 83','valuable')],2,2);
    assert.deepEqual(decision(r),{kind:'select-choices',tokens:['x1','x2']});
    r.observation.ownHand=[];
    selection(r,gh,'deck',[card(grand,'s'),card('Artazon PAL 171','a'),
      card(tm,'t'),card('Stealthy Hood UNB 186','h'),card(jet,'j'),
      card('Double Colorless Energy SUM 136','d')],3,3);
    assert.deepEqual(decision(r),{kind:'select-choices',tokens:['t','j','s']});
    r.prompt=null;r.observation.ownHand=[grand,tm,jet];
    r.actionFrontier.items=[{...src(tm,'play-card','attach-tm'),targetPrinting:'Bunnelby PRC 121'}];
    assert.deepEqual(decision(r),{kind:'select-action',token:'attach-tm'});
    r.observation.ownPublic.active.tools=[tm];r.observation.ownHand=[grand,jet];
    r.actionFrontier.items=[{...src(jet,'play-card','attach-jet'),targetPrinting:'Bunnelby PRC 121'}];
    assert.deepEqual(decision(r),{kind:'select-action',token:'attach-jet'});
    r.observation.ownPublic.active.energies=[jet];r.observation.ownHand=[grand];
    r.actionFrontier.items=[{kind:'attack',token:'evo',attackName:'Evolution'}];
    assert.deepEqual(decision(r),{kind:'select-action',token:'evo'});
    selection(r,tm,'deck',[card('Gloom UNB 7','gloom'),
      card('Vileplume AOR 3','stage2')],0,2);
    assert.deepEqual(decision(r),{kind:'select-choices',tokens:['gloom']});
    r.prompt={promptType:'ChoosePokemonPrompt',source:{sourcePrinting:tm,effectName:'Evolution'},
      publicMetadata:{selectionType:'pokemon',targetZone:'bench',minimumCount:1,maximumCount:1},
      choices:[{kind:'pokemon',token:'oddish',printing:oddish,
        publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}}]};
    assert.deepEqual(decision(r),{kind:'select-choices',tokens:['oddish']});
  });
}
test('Tag Call not initiated without two disposable costs and an evolution target',()=>{
  const r=ghRoot(0);r.observation.ownHand=[tag,xt,'Buneary PFL 83',jet];
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.ownHand=[tag,xt,xt];r.observation.ownPublic.bench=[];
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
test('Guzma&Hala declines payment mode when one of two safe cards disappears',()=>{
  const r=ghRoot(0);r.observation.ownHand=[xt];
  r.prompt={promptType:'SelectOptionPrompt',source:{sourcePrinting:gh,effectName:'Guzma & Hala'},
    publicMetadata:{selectionType:'option'},choices:[
      {kind:'option',token:'zero',label:'No',publicMetadata:{choiceIndex:0}},
      {kind:'option',token:'one',label:'Discard 2 cards from hand',publicMetadata:{choiceIndex:1}}]};
  assert.deepEqual(decision(r),{kind:'select-choice',token:'zero'});
});
test('Guzma&Hala refuses opponent-owned deck retrieval and underpayment',()=>{
  const r=ghRoot(0);
  selection(r,gh,'deck',[card(tm,'tm'),card(jet,'j'),card(grand,'g')],3,3);
  r.prompt.publicMetadata.ownerSeat='opponent';
  assert.equal(decision(r).reasonCode,'UNSUPPORTED_CARD_COMBINATION_SOURCE');
  r.prompt.publicMetadata.ownerSeat='actor';r.prompt.choices=[card(tm,'tm')];
  assert.equal(decision(r).reasonCode,'NO_LEGAL_CARD_SET');
  r.observation.ownHand=[xt];
  selection(r,gh,'hand',[card(xt,'x1'),card(xt,'x2')],2,2);
  assert.equal(decision(r).reasonCode,'NO_LEGAL_CARD_SET');
});
test('Technical Machine Evolution rejects non-actor Bench target',()=>{
  const r=ghRoot(0);
  r.prompt={promptType:'ChoosePokemonPrompt',source:{sourcePrinting:tm,effectName:'Evolution'},
    publicMetadata:{selectionType:'pokemon',targetZone:'bench',minimumCount:1,maximumCount:1},
    choices:[{kind:'pokemon',token:'o',printing:oddish,
      publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:0}}]};
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_POKEMON_CHOICE');
});

function secondBarrageFixture(seat=0,stageCount=2){
  const r=ghRoot(seat);r.observation.ownPublic.active.tools=[tm];
  r.observation.ownPublic.active.energies=[jet];
  r.observation.ownPublic.bench=Array.from({length:stageCount},()=>pokemon('Gloom UNB 7',{hp:80}));
  r.observation.opponentPublic.active=pokemon(MIMIKYU,{hp:70});
  r.prompt={promptType:'ConfirmPrompt',source:{sourcePrinting:'Bunnelby PRC 121',effectName:'Omega Barrage'},
    publicMetadata:{selectionType:'confirm'},choices:[
      {kind:'confirm',token:'yes',label:'Yes'},
      {kind:'confirm',token:'no',label:'No'}]};
  return r;
}
for(const seat of [0,1]){
  test('seat '+seat+': Omega Barrage confirms second TM attack and evolves two Gloom into BUS+AOR',()=>{
    const r=secondBarrageFixture(seat);
    assert.deepEqual(decision(r),{kind:'select-choice',token:'yes'});
    r.prompt=null;r.actionFrontier.items=[{kind:'attack',token:'second',attackName:'Evolution'}];
    assert.deepEqual(decision(r),{kind:'select-action',token:'second'});
    selection(r,tm,'deck',[card('Vileplume AOR 3','aor1'),
      card('Vileplume BUS 6','bus'),card('Vileplume AOR 3','aor2')],0,2);
    assert.deepEqual(decision(r),{kind:'select-choices',tokens:['bus','aor1']});
    r.prompt={promptType:'ChoosePokemonPrompt',source:{sourcePrinting:tm,effectName:'Evolution'},
      publicMetadata:{selectionType:'pokemon',targetZone:'bench',minimumCount:1,maximumCount:1},
      choices:[{kind:'pokemon',token:'gloom',printing:'Gloom UNB 7',
        publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}}]};
    assert.deepEqual(decision(r),{kind:'select-choices',tokens:['gloom']});
  });
}
test('only one Gloom gives only one legal Stage2 selection',()=>{
  const r=secondBarrageFixture(0,1);
  selection(r,tm,'deck',[card('Vileplume AOR 3','aor'),card('Vileplume BUS 6','bus')],0,2);
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['bus']});
});
test('Omega Barrage declines without paid TM, supported stage targets or valid source',()=>{
  const r=secondBarrageFixture();r.observation.ownPublic.active.tools=[];
  assert.deepEqual(decision(r),{kind:'select-choice',token:'no'});
  r.observation.ownPublic.active.tools=[tm];r.observation.ownPublic.active.energies=[];
  assert.deepEqual(decision(r),{kind:'select-choice',token:'no'});
  r.observation.ownPublic.active.energies=[jet];r.observation.ownPublic.bench=[];
  assert.deepEqual(decision(r),{kind:'select-choice',token:'no'});
  r.prompt.source.sourcePrinting='Tatsugiri TWM 131';r.prompt.source.effectName='Other';
  assert.equal(decision(r).reasonCode,'UNSUPPORTED_PROMPT_TYPE');
});
test('after two Stage2, BUS promotion via offered Jet or retreat and owner Bench choice',()=>{
  const r=secondBarrageFixture();r.prompt=null;
  r.observation.ownPublic.bench=[pokemon('Vileplume BUS 6',{hp:140}),
    pokemon('Vileplume AOR 3',{hp:130})];
  r.actionFrontier.items=[{...src(jet,'play-card','jet-bus'),targetPrinting:'Vileplume BUS 6'},
    {kind:'retreat',token:'retreat'}];
  assert.deepEqual(decision(r),{kind:'select-action',token:'jet-bus'});
  r.actionFrontier.items=[{kind:'retreat',token:'retreat'}];
  assert.deepEqual(decision(r),{kind:'select-action',token:'retreat'});
  r.prompt={promptType:'ChoosePokemonPrompt',source:{sourcePrinting:'Bunnelby PRC 121',effectName:'Retreat'},
    publicMetadata:{selectionType:'pokemon',targetZone:'bench',minimumCount:1,maximumCount:1},
    choices:[{kind:'pokemon',printing:'Vileplume AOR 3',token:'aor',
      publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:1}},
      {kind:'pokemon',printing:'Vileplume BUS 6',token:'bus',
      publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}}]};
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['bus']});
});
test('do not promote BUS into irrelevant Evolution attacker or when suppressed',()=>{
  const r=secondBarrageFixture();r.prompt=null;
  r.observation.ownPublic.bench=[pokemon('Vileplume BUS 6',{hp:140})];
  r.actionFrontier.items=[{...src(jet,'play-card','jet'),targetPrinting:'Vileplume BUS 6'}];
  r.observation.opponentPublic.active=pokemon('Shadow Rider Calyrex VMAX CRE 75',{hp:320,
    printed:{stage:'VMAX',weakness:[],resistance:[]}});
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.opponentPublic.active=pokemon(MIMIKYU,{hp:70});
  r.observation.ownPublic.bench[0].abilitySuppressions=[{abilityName:'Disgusting Pollen',suppressed:true}];
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});

test('V3-compatible Tag Call search accepts actor choice-level zone without top-level zone keys',()=>{
  const r=ghRoot(0);
  r.prompt={promptType:'ChooseCardsPrompt',source:{sourcePrinting:tag,effectName:'Tag Call'},
    publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:2},
    choices:[{...card(gh,'gh'),publicMetadata:{sourceZone:'deck',ownerSeat:'actor'}},
      {...card('Guzma BUS 115','guzma'),publicMetadata:{sourceZone:'deck',ownerSeat:'actor'}}]};
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['gh']});
});
test('V3-compatible GH search and payment derive deck/hand zone from actor-only choices',()=>{
  const r=ghRoot(0);r.observation.ownHand=[xt,xt];
  r.prompt={promptType:'ChooseCardsPrompt',source:{sourcePrinting:gh,effectName:'Guzma & Hala'},
    publicMetadata:{selectionType:'card-combination',minimumCount:2,maximumCount:2},
    choices:[{...card(xt,'x1'),publicMetadata:{sourceZone:'hand',ownerSeat:'actor'}},
      {...card(xt,'x2'),publicMetadata:{sourceZone:'hand',ownerSeat:'actor'}}]};
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['x1','x2']});
  r.prompt.publicMetadata={selectionType:'card-combination',minimumCount:3,maximumCount:3};
  r.prompt.choices=[{...card(grand,'s'),publicMetadata:{sourceZone:'deck',ownerSeat:'actor'}},
    {...card(tm,'t'),publicMetadata:{sourceZone:'deck',ownerSeat:'actor'}},
    {...card(jet,'j'),publicMetadata:{sourceZone:'deck',ownerSeat:'actor'}}];
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['t','j','s']});
});
test('actor prompt with contradictory opponent-zone card fails closed',()=>{
  const r=ghRoot(0);
  selection(r,tag,'deck',[
    {...card(gh,'gh'),publicMetadata:{sourceZone:'deck',ownerSeat:'opponent'}}],0,2);
  assert.equal(decision(r).reasonCode,'UNSUPPORTED_CARD_COMBINATION_SOURCE');
  r.prompt.publicMetadata={selectionType:'card-combination',minimumCount:0,maximumCount:2};
  assert.equal(decision(r).reasonCode,'UNSUPPORTED_CARD_COMBINATION_SOURCE');
});
test('owner Bench prompt without top-level targetZone may choose two separate Gloom slots',()=>{
  const r=secondBarrageFixture();r.prompt={
    promptType:'ChoosePokemonPrompt',source:{sourcePrinting:tm,effectName:'Evolution'},
    publicMetadata:{selectionType:'pokemon',minimumCount:0,maximumCount:2},
    choices:[
      {kind:'pokemon',token:'g1',printing:'Gloom UNB 7',publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}},
      {kind:'pokemon',token:'g2',printing:'Gloom UNB 7',publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:1}}]};
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['g1','g2']});
  r.prompt.choices[1].publicMetadata.benchIndex=0;
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['g1']});
});

test('first-turn Fan Call finds source Bunnelby, Pidgey and Buneary as offered deck tokens',()=>{
  const r=root();r.observation.globalTurn=2;
  r.observation.ownPublic=p(pokemon('Fan Rotom SCR 118',{hp:70}));
  r.observation.ownHand=[];r.actionFrontier.items=[
    {kind:'use-ability',token:'fan-call',actorPrinting:'Fan Rotom SCR 118',
      publicMetadata:{abilityName:'Fan Call'}},src('Buddy-Buddy Poffin TEF 144','pass','pass')];
  assert.deepEqual(decision(r),{kind:'select-action',token:'fan-call'});
  r.prompt={promptType:'ChooseCardsPrompt',source:{sourcePrinting:'Fan Rotom SCR 118',effectName:'Fan Call'},
    publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:3},
    choices:[
      {...card('Pidgeotto TEU 123','evo'),publicMetadata:{sourceZone:'deck',ownerSeat:'actor'}},
      {...card('Buneary PFL 83','bun'),publicMetadata:{sourceZone:'deck',ownerSeat:'actor'}},
      {...card('Bunnelby PRC 121','bunnelby'),publicMetadata:{sourceZone:'deck',ownerSeat:'actor'}},
      {...card('Pidgey FLF 75','pidgey'),publicMetadata:{sourceZone:'deck',ownerSeat:'actor'}}]};
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['bunnelby','pidgey','bun']});
});
test('Fan Call prioritizes missing lines and rejects full Bench or nonactor deck',()=>{
  const r=root();r.observation.globalTurn=1;
  r.observation.ownPublic=p(pokemon('Fan Rotom SCR 118',{hp:70}),
    [pokemon('Bunnelby PRC 121',{hp:60})]);
  r.observation.ownHand=['Pidgey FLF 75'];
  r.actionFrontier.items=[{kind:'use-ability',token:'fan',
    actorPrinting:'Fan Rotom SCR 118',publicMetadata:{abilityName:'Fan Call'}}];
  assert.deepEqual(decision(r),{kind:'select-action',token:'fan'});
  r.prompt={promptType:'ChooseCardsPrompt',source:{sourcePrinting:'Fan Rotom SCR 118',effectName:'Fan Call'},
    publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:3},
    choices:[{...card('Buneary PFL 83','bun'),publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}},
      {...card('Pidgeotto MEW 17','evo'),publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}}]};
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['bun','evo']});
  r.prompt.choices[0].publicMetadata.ownerSeat='opponent';
  assert.equal(decision(r).reasonCode,'UNSUPPORTED_CARD_COMBINATION_SOURCE');
  r.prompt=null;
  r.observation.ownPublic.bench=Array.from({length:5},()=>pokemon('Budew ASC 16',{hp:30}));
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});

function quickRoot(){
  const r=ghRoot(0);r.observation.globalTurn=5;
  r.observation.ownPublic=p(pokemon('Bunnelby PRC 121',{hp:60}),[
    pokemon('Pidgeot ex OBF 164',{hp:280}),pokemon('Gloom UNB 7',{hp:80})]);
  r.observation.opponentPublic=p(pokemon(MIMIKYU,{hp:70,
    printed:{stage:'BASIC',weakness:[],resistance:[]}}));
  r.observation.ownHand=[];
  r.actionFrontier.items=[{kind:'use-ability',token:'quick',actorPrinting:'Pidgeot ex OBF 164',
    publicMetadata:{abilityName:'Quick Search'}},
    {kind:'pass',token:'pass'}];return r;
}
test('Pidgeot Quick Search is used and takes AOR Item lock over BUS bench-only value',()=>{
  const r=quickRoot();
  assert.deepEqual(decision(r),{kind:'select-action',token:'quick'});
  r.prompt={promptType:'ChooseCardsPrompt',source:{sourcePrinting:'Pidgeot ex OBF 164',effectName:'Quick Search'},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:1},
    choices:[{...card('Vileplume BUS 6','bus'),publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}},
      {...card('Vileplume AOR 3','aor'),publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}}]};
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['aor']});
  r.observation.ownPublic.bench[2]=pokemon('Vileplume AOR 3',{hp:130});
  r.observation.ownPublic.bench.push(pokemon('Gloom UNB 7',{hp:80}));
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['bus']});
});
test('Quick Search prefers TM on Bunnelby+Oddish while no tool is attached',()=>{
  const r=quickRoot();r.observation.ownPublic.bench[1]=pokemon(oddish,{hp:50});
  r.prompt={promptType:'ChooseCardsPrompt',source:{sourcePrinting:'Pidgeot ex OBF 164',effectName:'Quick Search'},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:1},
    choices:[{...card(tm,'tm'),publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}},
      {...card(jet,'jet'),publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}},
      {...card('Buddy-Buddy Poffin TEF 144','poffin'),publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}}]};
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['tm']});
  r.observation.ownPublic.active.tools=[tm];
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['jet']});
});
test('Quick Search avoids Item under live Item lock and cannot choose opponent deck',()=>{
  const r=quickRoot();r.observation.ownPublic.publicTurnRestrictions={itemPlayLocked:true};
  r.observation.ownPublic.bench=[pokemon('Pidgeot ex OBF 164',{hp:280})];
  r.prompt={promptType:'ChooseCardsPrompt',source:{sourcePrinting:'Pidgeot ex OBF 164',effectName:'Quick Search'},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:1},
    choices:[{...card('Buddy-Buddy Poffin TEF 144','poffin'),publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}},
      {...card(jet,'jet'),publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}}]};
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['jet']});
  r.prompt.choices[1].publicMetadata.ownerSeat='opponent';
  assert.equal(decision(r).reasonCode,'UNSUPPORTED_CARD_COMBINATION_SOURCE');
});
test('Quick Search unrestricted owner-deck search returns a legal physical card even when low priority',()=>{
  const r=quickRoot();r.prompt={promptType:'ChooseCardsPrompt',
    source:{sourcePrinting:'Pidgeot ex OBF 164',effectName:'Quick Search'},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:1},
    choices:[{...card('Karen XYP 177','karen'),publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}}]};
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['karen']});
});

function grandRoot(){
 const r=ghRoot(0);r.observation.globalTurn=5;
 r.observation.ownPublic=p(pokemon('Bunnelby PRC 121',{hp:60}),[
   {...pokemon(oddish,{hp:50}),lastPlayedOrEvolvedTurn:2}]);
 r.observation.opponentPublic=p(pokemon('Shadow Rider Calyrex VMAX CRE 75',{hp:320}));
 r.observation.ownHand=[];
 r.actionFrontier.items=[{kind:'use-stadium',token:'tree',actorPrinting:'Grand Tree SCR 136'},
   {kind:'pass',token:'pass'}];return r;
}
test('Grand Tree initiates only on prior-turn Basic and resolves owned Basic->Stage1->Stage2 search',()=>{
  const r=grandRoot();assert.deepEqual(decision(r),{kind:'select-action',token:'tree'});
  r.prompt={promptType:'ChoosePokemonPrompt',source:{sourcePrinting:grand,effectName:'Grand Tree'},
    publicMetadata:{selectionType:'pokemon',minimumCount:0,maximumCount:1},
    choices:[{kind:'pokemon',token:'o',printing:oddish,
      publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}}]};
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['o']});
  r.prompt={promptType:'ChooseCardsPrompt',source:{sourcePrinting:grand,effectName:'Grand Tree'},
    publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:1},
    choices:[{...card('Gloom UNB 7','gloom'),publicMetadata:{sourceZone:'deck',ownerSeat:'actor'}},
      {...card('Pidgeotto TEU 123','pidgeotto'),publicMetadata:{sourceZone:'deck',ownerSeat:'actor'}}]};
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['gloom']});
  r.observation.ownPublic.bench[0]=pokemon('Gloom UNB 7',{hp:80});
  r.prompt.choices=[{...card('Vileplume AOR 3','aor'),publicMetadata:{sourceZone:'deck',ownerSeat:'actor'}},
    {...card('Vileplume BUS 6','bus'),publicMetadata:{sourceZone:'deck',ownerSeat:'actor'}}];
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['aor']});
});
test('Grand Tree refuses fresh Basics or turn one and cannot touch opponent Bench',()=>{
  const r=grandRoot();r.observation.ownPublic.bench[0].lastPlayedOrEvolvedTurn=5;
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.ownPublic.bench[0].lastPlayedOrEvolvedTurn=1;
  r.observation.globalTurn=1;
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.globalTurn=5;
  r.prompt={promptType:'ChoosePokemonPrompt',source:{sourcePrinting:grand,effectName:'Grand Tree'},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
    choices:[{kind:'pokemon',token:'opp',printing:oddish,
      publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:0}}]};
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_POKEMON_CHOICE');
});
test('Grand Tree chooses BUS when AOR already established and rejects opponent deck search',()=>{
  const r=grandRoot();r.observation.ownPublic.bench=[pokemon('Gloom UNB 7',{hp:80}),
    pokemon('Vileplume AOR 3',{hp:130})];
  r.prompt={promptType:'ChooseCardsPrompt',source:{sourcePrinting:grand,effectName:'Grand Tree'},
    publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:1},
    choices:[{...card('Vileplume AOR 3','aor'),publicMetadata:{sourceZone:'deck',ownerSeat:'actor'}},
      {...card('Vileplume BUS 6','bus'),publicMetadata:{sourceZone:'deck',ownerSeat:'actor'}}]};
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['bus']});
  r.prompt.choices[1].publicMetadata.ownerSeat='opponent';
  assert.equal(decision(r).reasonCode,'UNSUPPORTED_CARD_COMBINATION_SOURCE');
});

function gustRoot(seat=0) {
  const r=ghRoot(seat);r.observation.globalTurn=7;
  r.observation.ownTurnResources={supporterPlayedTurn:0,energyPlayedTurn:0};
  r.observation.ownPublic=p(pokemon('Bunnelby PRC 121',{hp:70}),
    [pokemon(MEGA,{hp:330,energies:['Double Colorless Energy SUM 136']}),
      pokemon('Pidgeot ex OBF 164',{hp:280})],{prizeCount:2});
  r.observation.opponentPublic=p(pokemon(MIMIKYU,{hp:70}),
    [pokemon('Shadow Rider Calyrex VMAX CRE 75',{hp:320,damage:120,
      printed:{stage:'VMAX',weakness:[],resistance:[]}}),
      pokemon('Shadow Rider Calyrex V CRE 74',{hp:210,damage:0,
      printed:{stage:'BASIC',weakness:[],resistance:[]}})],{prizeCount:3});
  r.observation.ownHand=['Guzma BUS 115'];
  r.actionFrontier.items=[src('Guzma BUS 115','play-card','gust'),{kind:'pass',token:'pass'}];
  return r;
}
for(const seat of [0,1]){
  test('seat '+seat+': terminal offered Guzma gust targets 3-Prize damaged VMAX then promotes paid Mega',()=>{
    const r=gustRoot(seat);
    assert.deepEqual(decision(r),{kind:'select-action',token:'gust'});
    r.observation.ownTurnResources.supporterPlayedTurn=7; // Gust Supporter already played.
    r.prompt={promptType:'ChoosePokemonPrompt',source:{sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
      choices:[{kind:'pokemon',token:'vmax',printing:'Shadow Rider Calyrex VMAX CRE 75',
        publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:0}},
        {kind:'pokemon',token:'v',printing:'Shadow Rider Calyrex V CRE 74',
        publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:1}}]};
    assert.deepEqual(decision(r),{kind:'select-choices',tokens:['vmax']});
    // Native Guzma resolves the opposing switch before its second own-Bench prompt.
    const oldActive=r.observation.opponentPublic.active;
    r.observation.opponentPublic.active=r.observation.opponentPublic.bench[0];
    r.observation.opponentPublic.bench[0]=oldActive;
    r.prompt.choices=[{kind:'pokemon',token:'pidgeot',printing:'Pidgeot ex OBF 164',
      publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:1}},
      {kind:'pokemon',token:'mega',printing:MEGA,
      publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}}];
    assert.deepEqual(decision(r),{kind:'select-choices',tokens:['mega']});
  });
}
test('Guzma is not spent without powered Mega, target or Supporter availability',()=>{
  const r=gustRoot();r.observation.ownPublic.bench[0].energies=[];
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.ownPublic.bench[0].energies=['Double Colorless Energy SUM 136'];
  r.observation.opponentPublic.bench=[];
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.opponentPublic.bench=[pokemon('Shadow Rider Calyrex VMAX CRE 75',{
    hp:320,damage:120,printed:{stage:'VMAX',weakness:[],resistance:[]}})];
  r.observation.ownTurnResources.supporterPlayedTurn=7;
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
test('Guzma does not sacrifice Active BUS lock for ordinary gust tempo',()=>{
  const r=gustRoot();r.observation.ownPublic.active=pokemon('Vileplume BUS 6',{hp:140});
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
test('Guzma rejects opponent-owned choice under actor promotion, wrong index and mixed prompt',()=>{
  const r=gustRoot();
  r.prompt={promptType:'ChoosePokemonPrompt',source:{sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
    choices:[{kind:'pokemon',token:'fake',printing:MEGA,
      publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:0}}]};
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_POKEMON_CHOICE');
  r.prompt.choices=[{kind:'pokemon',token:'fake',printing:MEGA,
    publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:1}}];
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_POKEMON_CHOICE');
  r.prompt.choices.push({kind:'pokemon',token:'mixed',printing:'Shadow Rider Calyrex VMAX CRE 75',
    publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:0}});
  assert.equal(decision(r).reasonCode,'UNSUPPORTED_POKEMON_PROMPT');
});
test('Guzma does not claim guaranteed KO through protection or 1-Prize idle target',()=>{
  const r=gustRoot();r.observation.opponentPublic.bench[0].tools=['Stealthy Hood UNB 186'];
  r.observation.opponentPublic.bench[1].tools=['Stealthy Hood UNB 186'];
  r.observation.ownPublic.prizeCount=3;
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.opponentPublic.bench=[pokemon('Girafarig LOT 94',{hp:70,
    printed:{stage:'BASIC',weakness:[],resistance:[]}})];
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});

function artazonRoot(seat=0){
  const r=ghRoot(seat);r.observation.globalTurn=3;
  r.observation.ownPublic=p(pokemon('Bunnelby PRC 121',{hp:70}),
    [pokemon('Pidgeot ex OBF 164',{hp:280})]);
  r.observation.ownHand=[];r.actionFrontier.items=[
    {kind:'use-stadium',token:'use-artazon',actorPrinting:'Artazon PAL 171'},
    {kind:'pass',token:'pass'}];return r;
}
for(const seat of [0,1]){
  test('seat '+seat+': Artazon activated from public stadium and selects missing Oddish from actor deck',()=>{
    const r=artazonRoot(seat);
    assert.deepEqual(decision(r),{kind:'select-action',token:'use-artazon'});
    r.prompt={promptType:'ChooseCardsPrompt',
      source:{sourcePrinting:'Artazon PAL 171',effectName:'Artazon'},
      publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:1},
      choices:[
        {...card('Oddish UNB 5','oddish'),publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}},
        {...card('Buneary PFL 83','buneary'),publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}},
        {...card('Mega Lopunny ex PFL 84','illegal-ex'),publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}}]};
    assert.deepEqual(decision(r),{kind:'select-choices',tokens:['oddish']});
  });
}
test('Artazon supports Item-locked board and prefers Bunnelby after two Oddish are present',()=>{
  const r=artazonRoot();r.observation.ownPublic.active=pokemon('Vileplume AOR 3',{hp:130});
  r.observation.ownPublic.bench=[pokemon('Oddish UNB 5',{hp:50}),
    pokemon('Oddish UNB 5',{hp:50})];
  r.observation.ownPublic.publicTurnRestrictions={itemPlayLocked:true};
  assert.deepEqual(decision(r),{kind:'select-action',token:'use-artazon'});
  r.prompt={promptType:'ChooseCardsPrompt',
    source:{sourcePrinting:'Artazon PAL 171',effectName:'Artazon'},
    publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:1},
    choices:[{...card('Oddish UNB 5','o'),publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}},
      {...card('Bunnelby PRC 121','b'),publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}}]};
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['b']});
});
test('Artazon full Bench refuses root and chooses legal empty token',()=>{
  const r=artazonRoot();r.observation.ownPublic.bench=Array.from({length:5},()=>pokemon('Budew ASC 16',{hp:30}));
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.prompt={promptType:'ChooseCardsPrompt',source:{sourcePrinting:'Artazon PAL 171',effectName:'Artazon'},
    publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:1},
    choices:[{...card('Oddish UNB 5','o'),publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}},
      {kind:'empty-selection',token:'empty'}]};
  assert.deepEqual(decision(r),{kind:'select-choice',token:'empty'});
});
test('Artazon rejects opponent-owned deck choices',()=>{
  const r=artazonRoot();r.prompt={promptType:'ChooseCardsPrompt',
    source:{sourcePrinting:'Artazon PAL 171',effectName:'Artazon'},
    publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:1},
    choices:[{...card('Oddish UNB 5','o'),
      publicMetadata:{ownerSeat:'opponent',sourceZone:'deck'}}]};
  assert.equal(decision(r).reasonCode,'UNSUPPORTED_CARD_COMBINATION_SOURCE');
});
test('TEU Pidgeotto Air Mail chooses best of actually revealed two cards',()=>{
  const r=artazonRoot();r.observation.ownPublic.bench=[pokemon('Pidgeotto TEU 123',{hp:60}),
    pokemon('Gloom UNB 7',{hp:80})];
  r.actionFrontier.items=[{kind:'use-ability',token:'mail',
    actorPrinting:'Pidgeotto TEU 123',publicMetadata:{abilityName:'Air Mail'}}];
  assert.deepEqual(decision(r),{kind:'select-action',token:'mail'});
  r.prompt={promptType:'ChooseCardsPrompt',
    source:{sourcePrinting:'Pidgeotto TEU 123',effectName:'Air Mail'},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:1},
    choices:[{...card('Karen XYP 177','karen'),
      publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}},
      {...card('Vileplume AOR 3','aor'),
      publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}}]};
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['aor']});
  r.prompt.choices.push({...card('Guzma BUS 115','third'),
    publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}});
  assert.equal(decision(r).reasonCode,'UNSUPPORTED_CARD_COMBINATION_SOURCE');
});

function setK1(r,rows,exact=true) {
  r.observation.ownerK1={epoch:1,exactMembershipKnown:exact,
    knownPrintings:rows.map(([printing,copies])=>({printing,copies})),
    invalidationReason:null};return r;
}
test('owner exact K1 zero Gloom prevents worthless TM evolution; K0 retains uncertainty',()=>{
  const r=ghRoot(0);r.observation.ownPublic.active.tools=[tm];
  r.observation.ownPublic.active.energies=[jet];
  r.actionFrontier.items=[{kind:'attack',token:'evo',attackName:'Evolution'}];
  assert.deepEqual(decision(r),{kind:'select-action',token:'evo'});
  setK1(r,[['Gloom UNB 7',0],['Mega Lopunny ex PFL 84',0]]);
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.ownerK1.exactMembershipKnown=false;
  assert.deepEqual(decision(r),{kind:'select-action',token:'evo'});
  r.observation.ownerK1.exactMembershipKnown=true;
  r.observation.ownerK1.knownPrintings=[{printing:'Gloom UNB 7',copies:1}];
  assert.deepEqual(decision(r),{kind:'select-action',token:'evo'});
});
test('exact K1 absent both Stage2 causes Omega Barrage no; unknown K0 yes',()=>{
  const r=secondBarrageFixture();
  assert.deepEqual(decision(r),{kind:'select-choice',token:'yes'});
  setK1(r,[['Vileplume AOR 3',0],['Vileplume BUS 6',0]]);
  assert.deepEqual(decision(r),{kind:'select-choice',token:'no'});
  r.observation.ownerK1.exactMembershipKnown=false;
  assert.deepEqual(decision(r),{kind:'select-choice',token:'yes'});
  r.observation.ownerK1.exactMembershipKnown=true;
  r.observation.ownerK1.knownPrintings=[{printing:'Vileplume BUS 6',copies:1}];
  assert.deepEqual(decision(r),{kind:'select-choice',token:'yes'});
});
test('Tag Call does not search absent GH when K1 exact, but K0 remains playable',()=>{
  const r=ghRoot(0);
  assert.deepEqual(decision(r),{kind:'select-action',token:'tag'});
  setK1(r,[['Guzma & Hala CEC 193',0]]);
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.ownerK1.exactMembershipKnown=false;
  assert.deepEqual(decision(r),{kind:'select-action',token:'tag'});
});
test('Grand Tree respects exact owner deck membership without pretending K0 zero',()=>{
  const r=grandRoot();
  assert.deepEqual(decision(r),{kind:'select-action',token:'tree'});
  setK1(r,[['Gloom UNB 7',0],['Vileplume AOR 3',2]]);
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.ownerK1.exactMembershipKnown=false;
  assert.deepEqual(decision(r),{kind:'select-action',token:'tree'});
  r.observation.ownerK1.exactMembershipKnown=true;
  r.observation.ownerK1.knownPrintings=[{printing:'Gloom UNB 7',copies:1},
    {printing:'Vileplume AOR 3',copies:2}];
  assert.deepEqual(decision(r),{kind:'select-action',token:'tree'});
});

function karenRoot(seat=0) {
  const r=ghRoot(seat);r.observation.globalTurn=5;
  r.observation.ownTurnResources={supporterPlayedTurn:1,energyPlayedTurn:0};
  r.observation.ownHand=['Karen XYP 177'];
  r.observation.ownPublic=p(pokemon('Bunnelby PRC 121',{hp:60}));
  r.observation.opponentPublic=p(pokemon('Regidrago VSTAR SIT 136',{hp:280,
    energies:['Grass Energy MEE 9','Grass Energy MEE 9','Fire Energy MEE 2']}),
    [pokemon('Regidrago V SIT 135',{hp:220})],{discard:[
      'Dragapult ex TWM 130','Dialga-GX UPR 100']});
  r.actionFrontier.items=[src('Karen XYP 177','play-card','karen'),
    {kind:'pass',token:'pass'}];return r;
}
for(const seat of [0,1]){
  test('seat '+seat+': Karen removes public Regidrago Phantom Dive and Timeless payloads',()=>{
    const r=karenRoot(seat);
    assert.deepEqual(decision(r),{kind:'select-action',token:'karen'});
    r.observation.opponentPublic.discard=['Kyurem SFA 47','Noivern ex PAL 153'];
    assert.deepEqual(decision(r),{kind:'select-action',token:'karen'});
  });
}
test('Karen declines non-Regidrago, no payloads or Supporter contention',()=>{
  const r=karenRoot();
  r.observation.opponentPublic.active=pokemon('Shadow Rider Calyrex VMAX CRE 75',{hp:320});
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.opponentPublic.active=pokemon('Regidrago VSTAR SIT 136',{hp:280});
  r.observation.opponentPublic.discard=[];
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.opponentPublic.discard=['Dragapult ex TWM 130','Dialga-GX UPR 100'];
  r.observation.ownTurnResources.supporterPlayedTurn=5;
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
test('Karen one remaining Timeless-GX payload depends on opponent actual GX-use state',()=>{
  const r=karenRoot();r.observation.opponentPublic.discard=['Dialga-GX UPR 100'];
  r.observation.opponentPublic.publicTurnRestrictions={gxUsed:false};
  assert.deepEqual(decision(r),{kind:'select-action',token:'karen'});
  r.observation.opponentPublic.publicTurnRestrictions={gxUsed:true};
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.opponentPublic.discard=['Dragapult ex TWM 130'];
  r.observation.opponentPublic.publicTurnRestrictions={gxUsed:false};
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
test('Karen acts against funded Bench Regidrago threat but not unpowered future Bench',()=>{
  const r=karenRoot();r.observation.opponentPublic.active=pokemon(MIMIKYU,{hp:70});
  r.observation.opponentPublic.bench=[pokemon('Regidrago VSTAR SIT 136',{hp:280,
    energies:['Grass Energy MEE 9','Fire Energy MEE 2']})];
  assert.deepEqual(decision(r),{kind:'select-action',token:'karen'});
  r.observation.opponentPublic.bench[0].energies=[];
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});

function millRoot(seat=0) {
  const r=ghRoot(seat);r.observation.globalTurn=13;
  r.observation.ownPublic=p(pokemon('Bunnelby PRC 121',{hp:60,
    energies:['Grass Energy MEE 9']}),[],{discard:['Karen XYP 177','Grass Energy MEE 9']});
  r.observation.ownPublic.deckCount=8;
  r.observation.opponentPublic=p(pokemon('Regidrago VSTAR SIT 136',{hp:280}),
    [pokemon('Regidrago V SIT 135',{hp:220})],
    {discard:['Dialga-GX UPR 100','Dragapult ex TWM 130']});
  r.observation.opponentPublic.deckCount=2;
  r.actionFrontier.items=[{kind:'attack',token:'mill',attackName:'Burrow'},
    {kind:'attack',token:'recover',attackName:'Rototiller'}];
  return r;
}
for(const seat of [0,1]){
  test('seat '+seat+': Bunnelby mills 2-card opponent deck; Rototiller averts own deckout',()=>{
    const r=millRoot(seat);
    assert.deepEqual(decision(r),{kind:'select-action',token:'mill'});
    r.observation.ownPublic.deckCount=1;
    assert.deepEqual(decision(r),{kind:'select-action',token:'recover'});
    r.observation.ownPublic.deckCount=8;
    r.observation.opponentPublic.deckCount=0;
    assert.deepEqual(decision(r),{kind:'select-action',token:'recover'});
  });
}
test('Bunnelby Rototiller retrieves own Karen in Regidrago matchup, not a dead Item',()=>{
  const r=millRoot();
  r.observation.ownPublic.deckCount=0;
  r.observation.ownPublic.discard=['Karen XYP 177',
    'Buddy-Buddy Poffin TEF 144','Grass Energy MEE 9'];
  r.observation.ownPublic.bench=[pokemon('Vileplume AOR 3',{hp:130})];
  r.prompt={promptType:'ChooseCardsPrompt',
    source:{sourcePrinting:'Bunnelby PRC 121',effectName:'Rototiller'},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:1},
    choices:[{...card('Karen XYP 177','k'),
      publicMetadata:{sourceZone:'discard',ownerSeat:'actor'}},
      {...card('Buddy-Buddy Poffin TEF 144','p'),
      publicMetadata:{sourceZone:'discard',ownerSeat:'actor'}},
      {...card('Grass Energy MEE 9','e'),
      publicMetadata:{sourceZone:'discard',ownerSeat:'actor'}}]};
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['k']});
});
test('Rototiller refuses opponent discard and even actor token not physically owned',()=>{
  const r=millRoot();r.prompt={promptType:'ChooseCardsPrompt',
    source:{sourcePrinting:'Bunnelby PRC 121',effectName:'Rototiller'},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:1},
    choices:[{...card('Karen XYP 177','not-owned'),
      publicMetadata:{sourceZone:'discard',ownerSeat:'opponent'}}]};
  assert.equal(decision(r).reasonCode,'UNSUPPORTED_DISCARD_RETRIEVAL');
  r.prompt.choices=[{...card('Guzma BUS 115','invented'),
    publicMetadata:{sourceZone:'discard',ownerSeat:'actor'}}];
  assert.equal(decision(r).reasonCode,'NO_LEGAL_CARD_SET');
  r.prompt.choices=[{...card('Karen XYP 177','k'),
    publicMetadata:{sourceZone:'discard',ownerSeat:'actor'}}];
  assert.deepEqual(decision(r),{kind:'select-choices',tokens:['k']});
});
test('Omega Barrage yes after paid Burrow without TM when another Burrow matters',()=>{
  const r=millRoot();r.actionFrontier.items=[];r.prompt={
    promptType:'ConfirmPrompt',source:{sourcePrinting:'Bunnelby PRC 121',effectName:'Omega Barrage'},
    publicMetadata:{selectionType:'confirm'},
    choices:[{kind:'confirm',token:'yes',label:'Yes'},{kind:'confirm',token:'no',label:'No'}]};
  assert.deepEqual(decision(r),{kind:'select-choice',token:'yes'});
  r.observation.opponentPublic.deckCount=0;
  r.observation.ownPublic.discard=[];
  assert.deepEqual(decision(r),{kind:'select-choice',token:'no'});
  r.observation.ownPublic.discard=['Karen XYP 177'];
  assert.deepEqual(decision(r),{kind:'select-choice',token:'yes'});
});
test('Bunnelby prioritizes live BUS lock over nonurgent Burrow, but immediate self-deckout is higher priority',()=>{
  const r=millRoot();r.observation.ownPublic.bench=[pokemon('Vileplume BUS 6',{hp:140})];
  r.observation.opponentPublic.active=pokemon(MIMIKYU,{hp:70,printed:{stage:'BASIC',weakness:[],resistance:[]}});
  r.actionFrontier.items.push({kind:'retreat',token:'promote-bus',targetPrinting:'Vileplume BUS 6'});
  assert.deepEqual(decision(r),{kind:'select-action',token:'promote-bus'});
  r.observation.ownPublic.deckCount=0;
  assert.deepEqual(decision(r),{kind:'select-action',token:'recover'});
});
test('Bunnelby attrition requires offered paid attack, not invented action',()=>{
  const r=millRoot();r.observation.ownPublic.active.energies=[];
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.ownPublic.active.energies=['Grass Energy MEE 9'];
  r.actionFrontier.items=[{kind:'pass',token:'pass'}];
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});

test('native printed unrelated Weakness/Resistance no longer kills Colorless KO evaluation',()=>{
  const r=root();
  r.observation.opponentPublic.active.printed.weakness=[{type:'Psychic',value:'×2'}];
  r.observation.opponentPublic.active.printed.resistance=[{type:'Fighting',value:'-30'}];
  assert.equal(printedDamage(r.actionFrontier.items[0],r),230);
  assert.equal(printedDamage(r.actionFrontier.items[1],r),160);
});
test('Colorless Weakness ×2 and Resistance -30 use correct rulebook damage order',()=>{
  const r=root();
  const op=r.observation.opponentPublic.active;
  op.printed.weakness=[{type:'Colorless',value:'×2'}];
  op.printed.resistance=[{type:'Colorless',value:'-30'}];
  assert.equal(printedDamage(r.actionFrontier.items[0],r),430);
  assert.equal(printedDamage(r.actionFrontier.items[1],r),290);
  op.printed.weakness=[];op.printed.resistance=[{type:'Colorless',value:'-30'}];
  assert.equal(printedDamage(r.actionFrontier.items[0],r),200);
  assert.equal(printedDamage(r.actionFrontier.items[1],r),130);
});
test('Spiky Hopper bypasses target defensive Ability and Tool where Gale cannot be proven',()=>{
  const r=root();r.observation.opponentPublic.active.tools=['Stealthy Hood UNB 186'];
  r.observation.opponentPublic.active.abilitySuppressions=[
    {abilityName:'Some defensive Ability',suppressed:false}];
  assert.equal(printedDamage(r.actionFrontier.items[0],r),null);
  assert.equal(printedDamage(r.actionFrontier.items[1],r),160);
  r.observation.opponentPublic.active.hp=140;
  assert.deepEqual(decision(r),{kind:'select-action',token:'spiky'});
});
test('unknown matching modifier is not silently assumed standard 2×',()=>{
  const r=root();r.observation.opponentPublic.active.printed.weakness=[
    {type:'Colorless',value:'×1.5'}];
  assert.equal(printedDamage(r.actionFrontier.items[1],r),null);
  r.observation.opponentPublic.active.printed.weakness=[
    {type:'Psychic',value:'×1.5'}];
  assert.equal(printedDamage(r.actionFrontier.items[1],r),160);
});

test('Guzma considers irrelevant printed weakness rather than treating every VMAX as unattackable',()=>{
  const r=gustRoot();
  r.observation.opponentPublic.bench[0].printed.weakness=[{type:'Psychic',value:'×2'}];
  r.observation.opponentPublic.bench[0].printed.resistance=[{type:'Fighting',value:'-30'}];
  assert.deepEqual(decision(r),{kind:'select-action',token:'gust'});
  r.observation.opponentPublic.bench[0].printed.resistance=[{type:'Colorless',value:'-30'}];
  r.observation.opponentPublic.bench[1].tools=['Stealthy Hood UNB 186'];
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
  r.observation.opponentPublic.bench[0].printed.weakness=[{type:'Colorless',value:'×2'}];
  assert.deepEqual(decision(r),{kind:'select-action',token:'gust'});
});
