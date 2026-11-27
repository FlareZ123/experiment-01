'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { POLICY_VERSION, createPolicy, scoreAction, scoreSearchCard, promptDecision } =
  require('../../simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs');

const S='Snorlax PGO 55', W='Wobbuffet PHF 36', D='Dialga-GX UPR 100',
  H='Stealthy Hood UNB 186', J='Tool Jammer BST 136', A='Arven OBF 186',
  C='Counter Catcher PAR 160', G='Guzma BUS 115', V='Shadow Rider Calyrex VMAX CRE 75',
  E='Psychic Energy MEE 13';
const mon=(printing, extra={})=>({printing,hp:printing===S?150:printing===W?110:320,
  damage:0,tools:[],energies:[],printed:{stage:'BASIC',retreatCost:['Colorless']},
  publicRestrictions:{},...extra});
const player=(active,bench=[],extra={})=>({active,bench:[...bench,...Array(5-bench.length).fill(null)],
  discard:[],lostZone:[],stadium:[],resolvingSupporter:[],deckCount:30,handCount:5,
  prizeCount:6,publicTurnRestrictions:{},...extra});
function state({seat=0,own=mon(S),opp=mon(W),obench=[mon(V)],bench=[],hand=[H],
  ownExtra={},oppExtra={},resources={}}={}) {
  return {actorSeat:seat,ownHand:hand,ownPublic:player(own,bench,ownExtra),
    opponentPublic:player(opp,obench,{prizeCount:4,...oppExtra}),
    ownTurnResources:{supporterPlayedTurn:0,...resources}};
}
const tool=(token,card,target=S,zone='active',owner='actor')=>({token,kind:'play-card',
  actorPrinting:card,targetPrinting:target,publicMetadata:{cardType:'trainer',
    targetSeat:owner,targetZone:zone,targetIndex:0}});
const root=(token,card)=>({token,kind:'play-card',actorPrinting:card,
  publicMetadata:{cardType:'trainer'}});
const pass={token:'pass',kind:'pass'};
const score=(item,observation)=>scoreAction(item,{observation,publicEventReceipt:null});
function decide(observation,items) {
  const policy=createPolicy({role:'opponent',seat:observation.actorSeat,
    policyVersion:POLICY_VERSION,config:{}});
  return policy.decide({role:'opponent',seat:observation.actorSeat,observation,prompt:null,
    actionFrontier:{items},publicEventReceipt:null});
}
const choice=(token,printing,owner='opponent',zone='bench')=>({token,kind:'pokemon',
  printing,publicMetadata:{ownerSeat:owner,targetZone:zone}});
function prompt(observation,name,choices,type='ChoosePokemonPrompt',metadata={}) {
  return promptDecision({observation,prompt:{promptType:type,source:{sourcePrinting:name,
    effectName:name},choices,publicMetadata:metadata}});
}
for(const seat of [0,1]) {
 test('seat '+seat+': Hood beats Jammer and identical benched Snorlax target',()=>{
   const o=state({seat,hand:[H,J],bench:[mon(S)]});
   assert.deepEqual(decide(o,[tool('bench',H,S,'bench'),tool('jam',J),tool('hood',H),pass]),
      {kind:'select-action',token:'hood'});
 });
 test('seat '+seat+': Arven before Jammer; actual two-card prompt retrieves Hood',()=>{
   const o=state({seat,hand:[A,J]});
   assert.deepEqual(decide(o,[tool('jam',J),root('arven',A),pass]),
      {kind:'select-action',token:'arven'});
   const card=(token,printing)=>({token,kind:'card',printing,
     publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}});
   assert.deepEqual(prompt(o,A,[card('jam',J),card('hood',H),card('nest','Nest Ball SVI 181')],
     'ChooseCardsPrompt',{selectionType:'cards',minimumCount:2,maximumCount:2}),
     {kind:'select-choices',tokens:['nest','hood']});
 });
 test('seat '+seat+': gust beats Hood; actual target selection traps Metal-dependent Dialga',()=>{
   const o=state({seat,hand:[H,C],obench:[mon(V,{energies:[E,E,E,E]}),mon(D,{hp:180})]});
   assert.deepEqual(decide(o,[tool('hood',H),root('catch',C),pass]),
      {kind:'select-action',token:'catch'});
   assert.deepEqual(prompt(o,C,[choice('vm',V),choice('dialga',D)]),
      {kind:'select-choice',token:'dialga'});
   const after=state({seat,opp:mon(D,{hp:180}),obench:[mon(W),mon(V)],hand:[H,C]});
   assert.deepEqual(decide(after,[tool('hood',H),root('catch',C),pass]),
      {kind:'select-action',token:'pass'});
 });
 test('seat '+seat+': Guzma can both gust Dialga and promote Snorlax',()=>{
   const o=state({seat,own:mon('Rotom V LOR 58'),bench:[mon(S)],
      obench:[mon(V,{energies:[E,E,E,E]}),mon(D)],hand:[G]});
   assert.deepEqual(decide(o,[root('guzma',G),pass]),{kind:'select-action',token:'guzma'});
   assert.deepEqual(prompt(o,G,[choice('vm',V),choice('dialga',D)]),
      {kind:'select-choice',token:'dialga'});
   assert.deepEqual(prompt(o,G,[choice('s',S,'actor'),choice('r','Rotom V LOR 58','actor')]),
      {kind:'select-choice',token:'s'});
 });
}
test('reserve Hood when Wobbuffet is benched, not visible, or the target is ambiguous',()=>{
  assert.equal(score(tool('h',H),state({opp:mon(V),obench:[mon(W)]})),0);
  assert.equal(score(tool('h',H,S,'bench'),state({bench:[mon(S)]})),0);
  assert.equal(score(tool('h',H,S,'active','opponent'),state()),0);
  assert.equal(score({kind:'play-card',actorPrinting:H,targetPrinting:S},state()),0);
});
test('reserve Hood when no opponent bench, Tool suppression, or immediate Psychic Assault KO',()=>{
  assert.equal(score(tool('h',H),state({obench:[]})),0);
  assert.equal(score(tool('h',H),state({oppExtra:{publicTurnRestrictions:
     {stadiumAndToolHaveNoEffectTurnsRemaining:1}}})),0);
  assert.equal(score(tool('h',H),state({own:mon(S,{damage:70}),opp:mon(W,{energies:[E]})})),0);
});
test('do not pre-commit to an occupied Tool slot or already trapped Wobbuffet',()=>{
  assert.equal(score(tool('h',H),state({own:mon(S,{tools:[J]})})),0);
  assert.equal(score(tool('h',H),state({opp:mon(W,{publicRestrictions:{cannotRetreatNextTurn:true}})})),0);
});
test('Jammer still has baseline utility when Hood is already spent or unavailable',()=>{
  const o=state({hand:[J,A],ownExtra:{lostZone:[H]}});
  assert.equal(score(tool('j',J),o),220);
});
test('Counter Catcher is unavailable at equal prizes and Guzma cannot promise Block without a benched Snorlax',()=>{
  const o=state({hand:[C],obench:[mon(D)],oppExtra:{prizeCount:6}});
  assert.equal(score(root('c',C),o),0);
  const noSnorlax=state({own:mon('Rotom V LOR 58'),obench:[mon(D)],hand:[G]});
  assert.equal(score(root('g',G),noSnorlax),0);
});
test('Dialga boost is not applied to a non-gust Energy-discard prompt',()=>{
  const o=state({obench:[mon(V,{energies:[E,E,E,E]}),mon(D)]});
  assert.deepEqual(prompt(o,'Plumeria BUS 120',[choice('vm',V),choice('dialga',D)]),
    {kind:'select-choice',token:'vm'});
});
test('native set-only aliases are supported for the four touched identities; wrong printings are not',()=>{
  const o=state({own:mon('Snorlax PGO'),opp:mon('Wobbuffet PHF'),hand:['Stealthy Hood UNB']});
  assert.equal(score(tool('h','Stealthy Hood UNB','Snorlax PGO'),o),250);
  assert.equal(score(tool('h','Stealthy Hood UNB 185','Snorlax PGO'),o),0);
  assert.equal(score(tool('h','Stealthy Hood UNB','Snorlax PGO'),state({opp:mon('Wobbuffet PHF 37')})),0);
});
test('a held Hood is not searched a second time; inactive Wobbuffet does not boost search',()=>{
  assert.equal(scoreSearchCard(H,state(), 'arven'),0);
  assert.equal(scoreSearchCard(H,state({hand:[A],opp:mon(V),obench:[mon(W)]}),'arven'),0);
});

test('opposing live Hood vetoes the Wobbuffet trap; suppressing Tools vetoes own Hood attachment',()=>{
  const o=state({opp:mon(W,{tools:[H]})});
  assert.equal(score(tool('h',H),o),0);
});
test('Hood-protected Dialga is not elevated over other gust targets without Tool Jammer',()=>{
  const o=state({obench:[mon(V,{energies:[E,E,E,E]}),mon(D,{tools:[H]})]});
  assert.equal(score(root('c',C),o),135);
  assert.deepEqual(prompt(o,C,[choice('vm',V),choice('dialga',D)]),
    {kind:'select-choice',token:'vm'});
});
test('Active Snorlax Tool Jammer restores the protected-Dialga trap',()=>{
  const o=state({own:mon(S,{tools:[J]}),obench:[mon(V,{energies:Array(10).fill(E)}),mon(D,{tools:[H]})]});
  assert.equal(score(root('c',C),o),300);
  assert.deepEqual(prompt(o,C,[choice('vm',V),choice('dialga',D)]),
    {kind:'select-choice',token:'dialga'});
});
test('Guzma does not claim protected-Dialga trap from mixed duplicate Snorlax promotion options',()=>{
  const o=state({own:mon('Rotom V LOR 58'),bench:[mon(S,{tools:[J]}),mon(S)],
    obench:[mon(V,{energies:[E,E,E,E]}),mon(D,{tools:[H]})],hand:[G]});
  assert.equal(score(root('g',G),o),185);
  assert.deepEqual(prompt(o,G,[choice('vm',V),choice('dialga',D)]),
    {kind:'select-choice',token:'vm'});
});
test('do not damage a safely trapped undamaged Dialga or take a nonwinning KO',()=>{
  const collapse={token:'collapse',kind:'attack',attackName:'Collapse'};
  const o=state({opp:mon(D,{hp:180}),obench:[mon(V)],hand:[]});
  assert.deepEqual(decide(o,[collapse,pass]),{kind:'select-action',token:'pass'});
  const damaged=state({opp:mon(D,{hp:180,damage:50}),obench:[mon(V)],hand:[]});
  assert.deepEqual(decide(damaged,[collapse,pass]),{kind:'select-action',token:'pass'});
});
test('take the winning Collapse if it takes final two prizes or leaves no opposing Pokémon',()=>{
  const collapse={token:'collapse',kind:'attack',attackName:'Collapse'};
  const final=state({opp:mon(D,{hp:180,damage:50}),obench:[mon(V)],ownExtra:{prizeCount:2},hand:[]});
  assert.deepEqual(decide(final,[collapse,pass]),{kind:'select-action',token:'collapse'});
  const noBench=state({opp:mon(D,{hp:180,damage:50}),obench:[],hand:[]});
  assert.deepEqual(decide(noBench,[collapse,pass]),{kind:'select-action',token:'collapse'});
});
test('native set-only action aliases reach the actual Arven, Guzma, and Counter Catcher choices',()=>{
  const o=state({hand:['Arven OBF','Tool Jammer BST'],obench:[mon('Dialga-GX UPR')]});
  assert.deepEqual(decide(o,[tool('jam','Tool Jammer BST'),root('arven','Arven OBF'),pass]),
    {kind:'select-action',token:'arven'});
  assert.equal(score(root('catch','Counter Catcher PAR'),o),300);
  const g=state({own:mon('Rotom V LOR 58'),bench:[mon('Snorlax PGO')],
    obench:[mon('Dialga-GX UPR')],hand:['Guzma BUS']});
  assert.equal(score(root('g','Guzma BUS'),g),290);
});


const R='Rotom V LOR 58', B='Bunnelby PRC 121', F='Float Stone BKT 137';
const charge={token:'charge',kind:'use-ability',actorPrinting:R,publicMetadata:{abilityName:'Instant Charge'}};
const burrow={token:'burrow',kind:'attack',attackName:'Burrow',actorPrinting:B};
for(const seat of [0,1]) {
  test('seat '+seat+': funded Burrow beats turn-ending Instant Charge at one opposing deck card',()=>{
    const o=state({seat,own:mon(B,{hp:60,energies:['Capture Energy RCL 171']}),
      bench:[mon(R,{hp:190})],opp:mon(D,{hp:180}),hand:[],oppExtra:{deckCount:1}});
    assert.deepEqual(decide(o,[charge,burrow,pass]),{kind:'select-action',token:'burrow'});
  });
  test('seat '+seat+': useful nonterminal Float Stone attachment precedes Instant Charge',()=>{
    const o=state({seat,own:mon(R,{hp:190}),bench:[mon(B,{hp:60})],hand:[F]});
    assert.deepEqual(decide(o,[charge,tool('float',F,R),pass]),{kind:'select-action',token:'float'});
  });
  test('seat '+seat+': Instant Charge remains available when no better terminal or positive nonterminal choice',()=>{
    const o=state({seat,own:mon(S),bench:[mon(R,{hp:190})],hand:[]});
    assert.deepEqual(decide(o,[charge,pass]),{kind:'select-action',token:'charge'});
  });
  test('seat '+seat+': useful Star Alchemy remains nonterminal and beats a funded Burrow',()=>{
    const o=state({seat,own:mon(B,{hp:60,energies:['Capture Energy RCL 171']}),
      bench:[mon(R,{hp:190,tools:['Forest Seal Stone SIT 156']})],hand:[],
      oppExtra:{deckCount:1},resources:{vstarUsed:false}});
    const star={token:'star',kind:'use-ability',actorPrinting:'Forest Seal Stone SIT 156',
      publicMetadata:{abilityName:'Star Alchemy'}};
    assert.deepEqual(decide(o,[charge,burrow,star,pass]),{kind:'select-action',token:'star'});
  });
}


const prizeProtocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
function opaqueAward(seat,count,options={}) {
  const actor=options.ownerSeat??'actor';
  const make=(i)=>({token:'prize-'+i,kind:'prize',label:'Your Prize slot '+(i+1),
    publicMetadata:{selectionIndex:i,selectedCount:1,sourceZone:'prizes',ownerSeat:actor,
      isOwnerVisible:false,requiredCount:count}});
  const choices=count===0?[{token:'empty',kind:'empty-selection',label:'Choose none'}]:
    (options.indices??[2,0,1]).map(make);
  return {schema:prizeProtocol.PROMPT_SCHEMA,actingSeat:seat,promptType:'ChoosePrizePrompt',
    description:'Choose Prize cards',source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:options.sourcePrinting??S,effectName:options.effectName??'Collapse'},
    choices,publicMetadata:{count:count===0?0:3,requiredCount:count,allowCancel:false,isSecret:false,
      sourceZone:'prizes',ownerSeat:actor,isOwnerVisible:false,selectionType:'prize-slots'}};
}
function prizeDecision(seat,p,validate=true) {
  const policy=createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,config:{}});
  if(validate)prizeProtocol.validatePrompt(p,seat);
  const out=policy.decide({role:'opponent',seat,observation:state({seat}),prompt:p,
    actionFrontier:{items:[]},publicEventReceipt:null});
  if(validate)prizeProtocol.validateDecision(out,p,new Set());
  return out;
}
for(const seat of [0,1]) {
  for(const count of [1,2,3]) test('seat '+seat+': opaque Collapse award selects exact '+count+' distinct slots',()=>{
    assert.deepEqual(prizeDecision(seat,opaqueAward(seat,count)),
      {kind:'select-choices',tokens:Array.from({length:count},(_,i)=>'prize-'+i)});
  });
  test('seat '+seat+': zero-count award selects explicit empty token',()=>{
    assert.deepEqual(prizeDecision(seat,opaqueAward(seat,0)),{kind:'select-choice',token:'empty'});
  });
  test('seat '+seat+': concealed Gladion and Heavy Ball are not ordinary award prompts',()=>{
    for(const [sourcePrinting,effectName] of [['Gladion CIN 95','Gladion'],['Hisuian Heavy Ball ASR 146','Hisuian Heavy Ball']])
      assert.deepEqual(prizeDecision(seat,opaqueAward(seat,1,{sourcePrinting,effectName})),
        {kind:'abstain',reasonCode:'HIDDEN_PRIZE_IDENTITY'});
  });
  test('seat '+seat+': mismatched attack source, non-damaging attack and opponent Prize slots abstain',()=>{
    for(const opt of [{sourcePrinting:'Bunnelby PRC 121',effectName:'Burrow'},
      {sourcePrinting:'Shadow Rider Calyrex VMAX CRE 75',effectName:'Collapse'},{ownerSeat:'opponent'}])
      assert.deepEqual(prizeDecision(seat,opaqueAward(seat,1,opt)),
        {kind:'abstain',reasonCode:'UNSUPPORTED_PRIZE_SELECTION'});
  });
  test('seat '+seat+': duplicate slot index or too few legal slots never produces underpayment',()=>{
    assert.deepEqual(prizeDecision(seat,opaqueAward(seat,2,{indices:[0,0,1]}),false),
      {kind:'abstain',reasonCode:'NO_LEGAL_PRIZE_SELECTION'});
    assert.deepEqual(prizeDecision(seat,opaqueAward(seat,2,{indices:[1]}),false),
      {kind:'abstain',reasonCode:'NO_LEGAL_PRIZE_SELECTION'});
  });
  test('seat '+seat+': Mimikyu damage counter KO source is supported',()=>{
    assert.deepEqual(prizeDecision(seat,opaqueAward(seat,1,{sourcePrinting:'Mimikyu PAL 97',effectName:'Ghost Eye'})),
      {kind:'select-choices',tokens:['prize-0']});
  });
}


for(const seat of [0,1]) {
  const mim={token:'mim',kind:'play-card',actorPrinting:'Mimikyu PAL 97',
    publicMetadata:{cardType:'pokemon'}};
  test('seat '+seat+': Safeguard wall bench decision includes candidate Lillie\'s Clefairy ex',()=>{
    const o=state({seat,opp:mon("Lillie's Clefairy ex JTG 56"),obench:[],
      hand:['Mimikyu PAL 97']});
    assert.deepEqual(decide(o,[mim,pass]),{kind:'select-action',token:'mim'});
  });
  test('seat '+seat+': Safeguard bench heuristic retains V, VMAX, VSTAR coverage',()=>{
    for(const printing of ['Shadow Rider Calyrex V CRE 74','Shadow Rider Calyrex VMAX CRE 75','Regidrago VSTAR SIT 136'])
      assert.deepEqual(decide(state({seat,opp:mon(printing),obench:[]}),[mim,pass]),
        {kind:'select-action',token:'mim'});
  });
  test('seat '+seat+': old EX, GX and ordinary Basic do not trigger Safeguard bench bonus',()=>{
    for(const printing of ['Mewtwo-EX NXD 54','Dialga-GX UPR 100','Wobbuffet PHF 36'])
      assert.deepEqual(decide(state({seat,opp:mon(printing),obench:[]}),[mim,pass]),
        {kind:'select-action',token:'pass'});
  });
  test('seat '+seat+': a second Mimikyu is not prioritized merely by ex presence',()=>{
    const o=state({seat,opp:mon("Lillie's Clefairy ex JTG 56"),obench:[],
      bench:[mon('Mimikyu PAL 97')]});
    assert.deepEqual(decide(o,[mim,pass]),{kind:'select-action',token:'pass'});
  });
}
