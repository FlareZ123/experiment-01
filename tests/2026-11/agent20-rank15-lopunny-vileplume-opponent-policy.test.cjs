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
  assert.equal(decision(r).reasonCode,'UNSUPPORTED_PROMPT_TYPE');
});
test('wrong seat and source config cannot choose offered tokens',()=>{
  const r=root(0);r.seat=1;
  assert.equal(policy(0).decide(r).reasonCode,'ROLE_SEAT_BINDING_MISMATCH');
});
