'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,collectSpecialAttachmentEffectAxes:collect}=
  require('../simulation/twinleaf/agent50-special-attachment-effect-axes.cjs');

const catalog={
  basicEnergyTypes:{Lightning:4,Psychic:5},
  specialEnergies:new Set(['Speed Lightning Energy RCL',
    'Capture Energy RCL','Jet Energy PAL','Double Colorless Energy SUM'])
};
function pokemon(printing,type){
  return {printing,printed:{types:[type]},energies:[],attacks:[]};
}
function view(){
  return {decisionKind:'owner-root',globalTurn:4,
    ownHand:['Speed Lightning Energy RCL','Capture Energy RCL',
      'Jet Energy PAL','Double Colorless Energy SUM'],
    ownTurnResources:{energyPlayedTurn:0,energyPlayLocked:false,
      specialEnergyPlayLocked:false},
    ownPublic:{
      active:pokemon('Iron Thorns ex TWM',4),
      bench:[pokemon('Mewtwo & Mew-GX UNM',5),null,null,null,null],
      deckCount:18,
      publicTurnRestrictions:{energyPlayLocked:false,
        specialEnergyPlayLocked:false}
    },
    opponentPublic:{active:pokemon('Regidrago V SIT',9)},
    opponentSecret:{deck:['unknown'],hand:['private'],prizes:['unknown']}
  };
}
const find=(offers,printing,slot)=>offers.find(o=>
  o.printing===printing&&o.slot===slot);

test('physical three-axis census does not invent effects for plain DCE',()=>{
  const r=collect(view(),catalog);
  assert.equal(r.version,VERSION);
  assert.equal(r.offers.length,6);
  assert.equal(r.truncated,false);
  assert.equal(r.offers.some(x=>x.printing==='Double Colorless Energy SUM'),false);
  assert.ok(r.offers.every(x=>x.nativePlayability==='unverified'));
  assert.ok(r.offers.every(x=>x.nativeEffectSettlement==='unverified'));
});

test('Speed Lightning draw opportunity is independent of attack cost',()=>{
  const r=collect(view(),catalog);
  const active=find(r.offers,'Speed Lightning Energy RCL','active');
  const bench=find(r.offers,'Speed Lightning Energy RCL','bench');
  assert.equal(active.publicEffectOpportunity,true);
  assert.equal(active.potentialDrawCap,2);
  assert.equal(bench.publicEffectOpportunity,false);
  const x=view();x.ownPublic.deckCount=1;
  assert.equal(find(collect(x,catalog).offers,'Speed Lightning Energy RCL',
    'active').potentialDrawCap,1);
  x.ownPublic.deckCount=0;
  const zero=find(collect(x,catalog).offers,'Speed Lightning Energy RCL',
    'active');
  assert.equal(zero.publicEffectOpportunity,false);
  assert.equal(zero.reason,'Lightning-recipient-empty-deck');
});

test('Capture Energy target is only a potential Bench search',()=>{
  const x=view(),r=collect(x,catalog);
  const capture=find(r.offers,'Capture Energy RCL','active');
  assert.equal(capture.publicEffectOpportunity,true);
  assert.equal(capture.deckTargetKnown,false);
  assert.equal(capture.reason,'bench-room-deck-membership-unverified');
  x.ownPublic.bench=Array(5).fill(pokemon('Mewtwo',5));
  assert.ok(collect(x,catalog).offers.filter(o=>o.printing==='Capture Energy RCL')
    .every(o=>o.publicEffectOpportunity===false&&o.reason==='bench-full'));
});

test('Jet Energy has switching branch only when targeted at Bench',()=>{
  const r=collect(view(),catalog),all=r.offers.filter(o=>
    o.printing==='Jet Energy PAL');
  assert.equal(find(all,'Jet Energy PAL','active').publicEffectOpportunity,false);
  const benched=find(all,'Jet Energy PAL','bench');
  assert.equal(benched.publicEffectOpportunity,true);
  assert.equal(benched.onAttachChannel,'on-attach-forced-active-switch');
});

test('spent quota, locks, unknown energy and concealment are fail closed',()=>{
  const x=view(),first=collect(x,catalog);
  const y=structuredClone(x);
  y.opponentSecret={deck:['other'],hand:['other'],prizes:['other']};
  y.ownSecretUnseenDeck=['altered'];
  assert.deepEqual(collect(x,catalog),collect(y,catalog));
  x.ownTurnResources.energyPlayedTurn=x.globalTurn;
  assert.equal(collect(x,catalog).offers.length,0);
  x.ownTurnResources.energyPlayedTurn=0;
  x.ownPublic.publicTurnRestrictions.specialEnergyPlayLocked=true;
  assert.equal(collect(x,catalog).offers.length,0);
  assert.equal(collect({...view(),ownHand:['Unknown Special OTH']},catalog)
    .offers.length,0);
  assert.ok(first.offers.length>0);
});

test('small public effect offer cap reports truncation, never hidden access',()=>{
  const x=view();
  x.ownHand=Array(40).fill('Speed Lightning Energy RCL');
  const r=collect(x,catalog);
  assert.equal(r.offers.length,72);
  assert.equal(r.truncated,true);
});

test('Telepathic Psychic offers up to two Bench basics only from Psychic target',()=>{
  const x=view();
  x.ownHand=['Telepathic Psychic Energy POR'];
  const c={...catalog,specialEnergies:new Set(
    ['Telepathic Psychic Energy POR','Telepath [P] Energy M3'])};
  const offers=collect(x,c).offers;
  assert.equal(offers.length,2);
  const act=find(offers,'Telepathic Psychic Energy POR','active');
  const ben=find(offers,'Telepathic Psychic Energy POR','bench');
  assert.equal(act.publicEffectOpportunity,false);
  assert.equal(act.reason,'recipient-not-public-Psychic');
  assert.equal(ben.publicEffectOpportunity,true);
  assert.equal(ben.potentialBenchCap,2);
  assert.equal(ben.deckTargetKnown,false);
  x.ownPublic.bench=[x.ownPublic.bench[0],null,
    pokemon('Psychic other',5),pokemon('Psychic extra',5),
    pokemon('Psychic last',5)];
  assert.equal(collect(x,c).offers.find(o=>o.slot==='bench')?.
    potentialBenchCap,1);
  x.ownPublic.bench=Array(5).fill(pokemon('Psychic filled',5));
  assert.ok(collect(x,c).offers.every(o=>!o.publicEffectOpportunity));
  x.ownPublic.bench=[null,null,null,null,null];
  x.ownHand=['Telepath [P] Energy M3'];
  assert.equal(collect(x,c).offers[0].onAttachChannel,
    'on-attach-two-Psychic-basic-bench-search');
});

test('Temple suppresses Speed draw, Capture search, Jet switch and Telepath',()=>{
  const x=view();
  x.ownPublic.stadium=['Temple of Sinnoh ASR'];
  x.ownHand.push('Telepathic Psychic Energy POR');
  const c={...catalog,specialEnergies:new Set([...catalog.specialEnergies,
    'Telepathic Psychic Energy POR'])};
  const offers=collect(x,c).offers;
  assert.equal(offers.length,8);
  assert.ok(offers.every(o=>o.publicEffectOpportunity===false));
  assert.ok(offers.every(o=>
    o.reason==='Temple-of-Sinnoh-attachment-effect-suppressed'));
  assert.ok(offers.every(o=>o.potentialDrawCap===null));
  assert.ok(offers.every(o=>o.potentialBenchCap===null));
  // The same Stadium can occupy the opponent's public Stadium zone.
  x.ownPublic.stadium=[];
  x.opponentPublic.stadium=['Temple of Sinnoh ASR'];
  assert.ok(collect(x,c).offers.every(o=>!o.publicEffectOpportunity));
});

test('separate public attack cost gain from Speed draw-two benefit',()=>{
  const x=view();
  x.ownHand=['Speed Lightning Energy RCL'];
  x.ownPublic.active.attacks=[{name:'Lightning Strike',cost:[4,4],
    gxAttack:false}];
  let o=find(collect(x,catalog).offers,'Speed Lightning Energy RCL','active');
  assert.equal(o.maximumKnownAttackCostGain,1);
  assert.equal(o.publicEffectOpportunity,true);
  x.ownPublic.active.energies=['Speed Lightning Energy RCL'];
  x.ownPublic.stadium=['Thunder Mountain Prism Star LOT'];
  o=find(collect(x,catalog).offers,'Speed Lightning Energy RCL','active');
  assert.equal(o.maximumKnownAttackCostGain,0,
    'Existing Energy plus Thunder already pays the printed two-Lightning attack');
  assert.equal(o.potentialDrawCap,2,
    'On-attach draw remains a separate axis with no Temple');
  x.ownPublic.stadium=['Temple of Sinnoh ASR'];
  o=find(collect(x,catalog).offers,'Speed Lightning Energy RCL','active');
  assert.equal(o.maximumKnownAttackCostGain,0,
    'Temple converts both attached Lightning Energy to Colorless');
  assert.equal(o.publicEffectOpportunity,false,
    'Temple suppresses the on-attachment draw');
  x.ownPublic.active.energies=['Unsupported Energy X'];
  assert.equal(find(collect(x,catalog).offers,'Speed Lightning Energy RCL',
    'active').maximumKnownAttackCostGain,null);
});
