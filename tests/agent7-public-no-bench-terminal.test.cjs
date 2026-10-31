'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {publicNoBenchPotentialKnockout}=require(
  '../simulation/twinleaf/agent7-public-no-bench-terminal-attack.cjs');
const {collectAndChooseOwnerRoot}=require(
  '../simulation/twinleaf/agent41-same-root-proposal-choice.cjs');

const printedAttack={
  kind:'attack',attackName:'Volt Cyclone',printedDamage:140
};
const offertest=[{name:'payable-printed-attack',
  flag:'payablePrintedAttackOffer',propose:()=>printedAttack}];

function rootView(){
  return {
    decisionKind:'owner-root',globalTurn:4,ownHand:[],
    ownPublic:{
      active:{printing:'Iron Thorns ex TWM 77',
        printed:{types:[4]},energies:['Double Colorless Energy ROS 96'],
        attacks:[{name:'Volt Cyclone',damage:140}]},
      bench:[null,null,null,null,null],
      publicTurnRestrictions:{}
    },
    opponentPublic:{
      active:{printing:'Trevenant & Dusknoir-GX SMP 217',
        hp:270,damage:140,tools:[],abilities:[],
        energies:['Psychic Energy SVE 5'],
        printed:{resistance:[]}},
      bench:[null,null,null,null,null]
    }
  };
}

test('public last-Active 140 damage to remaining 130 is a potential terminal',()=>{
  const state=rootView();
  assert.equal(publicNoBenchPotentialKnockout(state,printedAttack),true);
  assert.equal(state.opponentPublic.active.damage,140);
});

test('one opposing Bench Pokémon blocks the last-Pokémon finish',()=>{
  const state=rootView();
  state.opponentPublic.bench[2]={printing:'Unown'};
  assert.equal(publicNoBenchPotentialKnockout(state,printedAttack),false);
});

test('opponent HP and damage must be visible and meet damage breakpoint',()=>{
  const state=rootView();
  state.opponentPublic.active.damage=120;
  assert.equal(publicNoBenchPotentialKnockout(state,printedAttack),false);
  state.opponentPublic.active.damage=140;
  state.opponentPublic.active.hp=undefined;
  assert.equal(publicNoBenchPotentialKnockout(state,printedAttack),false);
  state.opponentPublic.active.hp=140;
  assert.equal(publicNoBenchPotentialKnockout(state,printedAttack),false);
});

test('printed matching Resistance is deducted without rewarding Weakness',()=>{
  const state=rootView();
  state.opponentPublic.active.printed.resistance=[{type:4,value:30}];
  assert.equal(publicNoBenchPotentialKnockout(state,printedAttack),false);
  assert.equal(publicNoBenchPotentialKnockout(state,
    {...printedAttack,printedDamage:170}),true);
  state.opponentPublic.active.printed.resistance=[{type:5,value:30}];
  assert.equal(publicNoBenchPotentialKnockout(state,printedAttack),true);
});

test('unknown mitigation from Tools, target Abilities or missing print metadata vetoes',()=>{
  const state=rootView();
  state.opponentPublic.active.tools=['Eviolite'];
  assert.equal(publicNoBenchPotentialKnockout(state,printedAttack),false);
  state.opponentPublic.active.tools=[];
  state.opponentPublic.active.abilities=['Safeguard'];
  assert.equal(publicNoBenchPotentialKnockout(state,printedAttack),false);
  state.opponentPublic.active.abilities=[];
  delete state.ownPublic.active.printed;
  assert.equal(publicNoBenchPotentialKnockout(state,printedAttack),false);
});

test('no actor-root choice on opponent Bench and default-off baseline',()=>{
  const view=rootView();
  const off=collectAndChooseOwnerRoot(view,{}, {kind:'pass'},
    {sameRootChoiceApply:true,payablePrintedAttackOffer:true},offertest);
  assert.equal(off.intent.kind,'pass');
  const active=collectAndChooseOwnerRoot(view,{}, {kind:'pass'},
    {sameRootChoiceApply:true,payablePrintedAttackOffer:true,
      publicNoBenchTerminalAttack:true},offertest);
  assert.equal(active.intent.kind,'attack');
  assert.equal(active.receipt.reason,
    'public-unopposed-active-knockout-potential');
  assert.equal(active.receipt.changed,true);
  assert.equal(active.receipt.supportedAlternativeCount,1);
  view.opponentPublic.bench[0]={printing:'Unown'};
  const guarded=collectAndChooseOwnerRoot(view,{}, {kind:'pass'},
    {sameRootChoiceApply:true,payablePrintedAttackOffer:true,
      publicNoBenchTerminalAttack:true},offertest);
  assert.equal(guarded.intent.kind,'pass');
});

test('all-proposer read-only still preserves default Pass with terminal option',()=>{
  const v=rootView();
  const res=collectAndChooseOwnerRoot(v,{}, {kind:'pass'},
    {sameRootProbeAll:true,publicNoBenchTerminalAttack:true},offertest);
  assert.equal(res.intent.kind,'pass');
  assert.equal(res.receipt.mode,'all-proposers-observe');
  assert.equal(res.receipt.offers[0].score,50);
  assert.equal(res.receipt.selectedSource,'first-return');
});


test('Double Turbo Energy penalty blocks printed pseudo-KO at a 130 HP breakpoint',()=>{
  const state=rootView();
  state.ownPublic.active.energies=['Double Turbo Energy BRS 151'];
  assert.equal(publicNoBenchPotentialKnockout(state,printedAttack),false);
  state.opponentPublic.active.damage=160;
  assert.equal(publicNoBenchPotentialKnockout(state,printedAttack),true);
  state.ownPublic.active.energies=[
    'Double Turbo Energy BRS 151','Double Turbo Energy ASR 216'];
  assert.equal(publicNoBenchPotentialKnockout(state,printedAttack),false);
});

test('unknown defender Special Energy mitigation vetoes terminal certainty',()=>{
  const state=rootView();
  state.opponentPublic.active.energies=['Shield Energy PRC 143'];
  assert.equal(publicNoBenchPotentialKnockout(state,printedAttack),false);
  state.opponentPublic.active.energies=['Double Colorless Energy EVO 90'];
  assert.equal(publicNoBenchPotentialKnockout(state,printedAttack),false);
  state.opponentPublic.active.energies=[];
  assert.equal(publicNoBenchPotentialKnockout(state,printedAttack),true);
  delete state.opponentPublic.active.energies;
  assert.equal(publicNoBenchPotentialKnockout(state,printedAttack),false);
});
