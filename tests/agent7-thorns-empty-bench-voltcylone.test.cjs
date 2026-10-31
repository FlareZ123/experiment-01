'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {noOwnBenchPrintedVoltCyclone}=require(
  '../simulation/twinleaf/agent7-iron-thorns-zero-bench-attack.cjs');
const {collectAndChooseOwnerRoot}=require(
  '../simulation/twinleaf/agent41-same-root-proposal-choice.cjs');

const volt={
  kind:'attack',attackName:'Volt Cyclone',printedDamage:140
};
const printedText='Move an Energy from this Pokémon to 1 of your Benched Pokémon.';
const view=(turn=4)=>({
  decisionKind:'owner-root',globalTurn:turn,ownHand:[],
  ownPublic:{
    active:{printing:'Iron Thorns ex TWM 77',name:'Iron Thorns ex',
      energies:['Double Colorless Energy XY 130'],
      attacks:[{name:'Volt Cyclone',damage:140,text:printedText,
        cost:[4,9,9]}]},
    bench:[null,null,null,null,null],
    stadium:['Thunder Mountain Prism Star TWM 76']
  },
  opponentPublic:{
    active:{name:'Dialga-GX',damage:0,hp:180,abilities:[],tools:[]},
    bench:[{name:'Other Pokemon'}]
  }
});
const proposer=[{name:'payable-printed-attack',
  flag:'payablePrintedAttackOffer',propose:()=>volt}];

test('independently printed Thorns attack has no own Bench Energy recipient',()=>{
  assert.equal(noOwnBenchPrintedVoltCyclone(view(),volt),true);
  assert.equal(noOwnBenchPrintedVoltCyclone(view(19),volt),true);
});

test('opponent Bench does not alter absent own Bench movement destination',()=>{
  const s=view();
  s.opponentPublic.bench=[{name:'Tapu Lele-GX'},null];
  assert.equal(noOwnBenchPrintedVoltCyclone(s,volt),true);
});

test('presence of an own Bench prevents a free-Energy-movement claim',()=>{
  const s=view();
  s.ownPublic.bench[1]={name:'Iron Thorns ex'};
  assert.equal(noOwnBenchPrintedVoltCyclone(s,volt),false);
});

test('only exact public printed Thorns 140-damage Volt Cyclone is eligible',()=>{
  const s=view();
  s.ownPublic.active.name='Other Pokemon';
  assert.equal(noOwnBenchPrintedVoltCyclone(s,volt),false);
  s.ownPublic.active.name='Iron Thorns ex';
  s.ownPublic.active.attacks[0].text='Discard an Energy from this Pokémon.';
  assert.equal(noOwnBenchPrintedVoltCyclone(s,volt),false);
  s.ownPublic.active.attacks[0].text=printedText;
  assert.equal(noOwnBenchPrintedVoltCyclone(s,{...volt,printedDamage:30}),false);
  assert.equal(noOwnBenchPrintedVoltCyclone(s,{...volt,attackName:'Other Attack'}),false);
});

test('default-off and existing nonterminal root choice are retained',()=>{
  const policy={sameRootChoiceApply:true,payablePrintedAttackOffer:true,
    thornsEmptyBenchVoltPreference:true};
  const off=collectAndChooseOwnerRoot(view(),{}, {kind:'pass'},
    {...policy,thornsEmptyBenchVoltPreference:false},proposer);
  assert.equal(off.intent.kind,'pass');
  const selected=collectAndChooseOwnerRoot(view(),{}, {kind:'pass'},
    policy,proposer);
  assert.equal(selected.intent.attackName,'Volt Cyclone');
  assert.equal(selected.receipt.changed,true);
  assert.equal(selected.receipt.reason,'printed-no-bench-volt-cyclone-over-pass');
  assert.equal(selected.receipt.supportedAlternativeCount,1);
  const base={kind:'attach-basic-energy',handIndex:0,
    printing:'Grass Energy MEE',slot:'active'};
  const noBaseline=collectAndChooseOwnerRoot(view(),{},base,policy,proposer);
  assert.equal(noBaseline.intent.kind,'attach-basic-energy');
});

test('no select if source has an own Bench, with both physical seats symmetric',()=>{
  const s=view();
  s.ownPublic.bench[2]={name:'Iron Thorns ex'};
  const selected=collectAndChooseOwnerRoot(s,{}, {kind:'pass'},
    {sameRootChoiceApply:true,thornsEmptyBenchVoltPreference:true,
      payablePrintedAttackOffer:true},proposer);
  assert.equal(selected.intent.kind,'pass');
  const delayed=collectAndChooseOwnerRoot(view(42),{}, {kind:'pass'},
    {sameRootChoiceApply:true,thornsEmptyBenchVoltPreference:true,
      payablePrintedAttackOffer:true},proposer);
  assert.equal(delayed.intent.kind,'attack');
});

test('all-proposer observation remains noninterfering',()=>{
  const out=collectAndChooseOwnerRoot(view(),{}, {kind:'pass'},
    {sameRootProbeAll:true,thornsEmptyBenchVoltPreference:true},proposer);
  assert.equal(out.intent.kind,'pass');
  assert.equal(out.receipt.offers[0].score,27);
});
