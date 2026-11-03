'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {planOwnerResourceTutors,guaranteedK0DeckTargets}=require('../simulation/twinleaf/agent11-owner-resource-tutor-planner.cjs');

const VIP='Battle VIP Pass FST';
const LETTER="Professor's Letter BKT";
const DARK='Darkness Energy MEE';
const BASICS=['Mega Absol ex MEG','Trubbish FST','Oranguru V ASR',
  'Latias ex SSP','Tapu Lele-GX GRI','Crobat V DAA','Squawkabilly ex PAL'];
const rank11Groups=[
  [3,BASICS[0]],[2,BASICS[1]],[2,'Garbodor BKP'],
  [2,BASICS[2]],[1,BASICS[3]],[1,BASICS[4]],[1,BASICS[5]],
  [1,BASICS[6]],[3,'Carmine TWM'],[3,'Marnie SSH'],
  [2,'Guzma BUS'],[4,VIP],[4,'Quick Ball FST'],
  [4,LETTER],[3,'Dark Patch ASR'],[2,'Boost Shake EVS'],
  [1,'Escape Rope BST'],[1,'Super Rod PAL'],[1,'VS Seeker PHF'],
  [1,'Secret Box TWM'],[3,'Float Stone BKT'],
  [2,'Forest Seal Stone SIT'],[1,'Muscle Band XY'],
  [2,'Shopping Center EVS'],[2,'Temple of Sinnoh ASR'],[8,DARK]
];
const original=rank11Groups.flatMap(([count,printing])=>Array(count).fill(printing));
assert.equal(original.length,60);
const catalog={basics:new Set(BASICS),basicEnergies:new Set([DARK])};

function view({hand=[LETTER],turn=4,active=BASICS[0],bench=Array(5).fill(null),
  prizes=6,deck=40,energyPlayedTurn=0,itemLocked=false,energyLocked=false,
  discard=[],lostZone=[]}={}){
  const live=active?{
    printing:active,evolutionPrintings:[active],energies:[],tools:[],
    attacks:[{name:'Claw of Darkness',cost:[6,9]}]
  }:null;
  return {decisionKind:'owner-root',actorSeat:0,globalTurn:turn,
    ownHand:hand,ownPublic:{active:live,bench,discard,lostZone,
      resolvingSupporter:[],prizeCount:prizes,deckCount:deck,
      publicTurnRestrictions:{itemPlayLocked:itemLocked,energyPlayLocked:energyLocked}},
    opponentPublic:{get concealedHand(){throw new Error('hidden zone accessed');}},
    ownTurnResources:{itemPlayLocked:itemLocked,energyPlayLocked:energyLocked,
      energyPlayedTurn}}
}

const play={kind:'pass',reason:'no-supported-owner-visible-root'};
const plan=(v,roster=original,incumbent=play)=>
  planOwnerResourceTutors(v,catalog,roster,incumbent);

test('registered rank11 printed roster and exact two-K0-lower-bounds',()=>{
  assert.equal(original.length,60);
  const v=view();
  assert.equal(guaranteedK0DeckTargets(v,original,catalog.basicEnergies).minimumInDeck,2);
  assert.equal(guaranteedK0DeckTargets(v,original,catalog.basics).minimumInDeck,4);
});

test('rank11 Letter is selected from a real zero-discard family only after Pass',()=>{
  const p=plan(view());
  assert.deepEqual(p.selected,{kind:'play-owner-resource-tutor',handIndex:0,
    printing:LETTER,family:'Basic Energy'});
  assert.equal(p.opportunities[0].requiresDiscard,false);
  assert.equal(p.opportunities[0].targetLowerBound,2);
  assert.equal(p.nativePlayNotYetProven,true);
  assert.equal(p.competitiveGameQualified,false);
});

test('finite first-owner-turn Battle VIP window dominates the Energy tutor',()=>{
  const p=plan(view({hand:[LETTER,VIP],turn:2}));
  assert.equal(p.selected.printing,VIP);
  assert.equal(p.selected.handIndex,1);
  assert.equal(p.opportunities.length,2);
  assert.equal(p.opportunities[0].exclusion,null);
  const late=plan(view({hand:[LETTER,VIP],turn:3}));
  assert.equal(late.selected.printing,LETTER);
  assert.equal(late.opportunities[1].exclusion,'vip-window-closed');
});

test('attack or other selected actor line always has incumbent priority',()=>{
  for(const incumbent of [{kind:'attack',attackName:'Claw of Darkness'},
    {kind:'bench-basic',benchIndex:0,handIndex:4}]){
    const p=plan(view({hand:[VIP,LETTER],turn:1}),original,incumbent);
    assert.equal(p.selected,null);
    assert.ok(p.opportunities.every(o=>o.exclusion==='incumbent-nonpass-priority'));
  }
});

test('public Item lock, Bench capacity and empty deck fail closed',()=>{
  const locked=plan(view({hand:[VIP,LETTER],turn:1,itemLocked:true}));
  assert.equal(locked.selected,null);
  assert.ok(locked.opportunities.every(o=>o.exclusion==='item-play-locked'));
  const full=plan(view({hand:[VIP],turn:1,bench:Array(5).fill({
    printing:BASICS[1],evolutionPrintings:[BASICS[1]],energies:[],tools:[]
  })}));
  assert.equal(full.selected,null);
  assert.equal(full.opportunities[0].exclusion,'no-bench-slot');
  assert.equal(plan(view({hand:[LETTER],deck:0})).selected,null);
});

test('no immediately needed Energy search if Energy already held or turn attachment spent',()=>{
  assert.equal(plan(view({hand:[LETTER,DARK]})).selected,null);
  assert.equal(plan(view({energyPlayedTurn:4})).selected,null);
  assert.equal(plan(view({energyLocked:true})).selected,null);
});

test('six Prize uncertainty can consume all targets, and over-visible copies invalidate proof',()=>{
  const reduced=[...Array(6).fill(DARK),...Array(54).fill('Dummy Card')];
  assert.equal(plan(view(),reduced).selected,null);
  const impossible=view({hand:[LETTER],active:BASICS[0]});
  impossible.ownPublic.active.energies=Array(9).fill(DARK);
  const q=guaranteedK0DeckTargets(impossible,original,catalog.basicEnergies);
  assert.equal(q.reconciled,false);
  assert.equal(q.minimumInDeck,0);
  assert.equal(plan(impossible).selected,null);
});

test('duplicate physical Trainer copies are distinguished by handIndex',()=>{
  const p=plan(view({hand:[LETTER,LETTER,VIP],turn:2}));
  assert.deepEqual(p.opportunities.map(o=>o.handIndex),[0,1,2]);
  assert.equal(p.selected.handIndex,2);
  const later=plan(view({hand:[LETTER,LETTER],turn:5}));
  assert.equal(later.selected.handIndex,0);
});

test('no access to opposing concealed hand/Prize/deck; owner-only result',()=>{
  const p=plan(view());
  assert.equal(p.ownerOnly,true);
  assert.ok(!JSON.stringify(p).includes('SECRET'));
  assert.equal(p.opportunities[0].promptSettlementProven,false);
});

test('reject malformed inputs rather than selecting a speculative target',()=>{
  assert.throws(()=>planOwnerResourceTutors(view(),catalog,original.slice(1),play),/60/);
  assert.throws(()=>planOwnerResourceTutors({...view(),decisionKind:'owner-prompt'},catalog,original,play),/owner-root/);
  assert.throws(()=>planOwnerResourceTutors(view(),catalog,original,null),/kind/);
});
