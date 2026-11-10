'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseMewDceRecipient,VERSION}=
  require('../../simulation/twinleaf/agent26-owner-visible-mew-dce-recipient.cjs');

const DCE='Double Colorless Energy SUM';
const PSY='Psychic Energy SVE';
const C=0,P=4;
const vmax=energies=>({
  printing:'Mew VMAX FST',energies,
  printed:{types:[P]},
  attacks:[
    {name:'Cross Fusion Strike',cost:[C,C],damage:null},
    {name:'Max Miracle',cost:[P,P],damage:130}
  ]
});
const mew=()=>({printing:'Mew V FST',energies:[]});
const catalog=()=>({
  specialEnergies:new Set([DCE,'Unknown Special Energy XYZ']),
  basicEnergies:new Set([PSY]),
  basicEnergyTypes:{Psychic:P,Fairy:8},
  colorlessEnergyType:C
});
const view=(active,bench=[null,null,null,null,null],stadium=[])=>({
  decisionKind:'owner-root',actorSeat:1,globalTurn:3,
  ownHand:[DCE],
  ownTurnResources:{
    energyPlayLocked:false,specialEnergyPlayLocked:false,energyPlayedTurn:2
  },
  ownPublic:{active,bench,stadium},
  opponentPublic:{stadium:[]}
});
const genesect=()=>({printing:'Genesect V FST',energies:[],attacks:[]});

test('partially charged VMAX beats an empty Mew V bench investment',()=>{
  assert.match(VERSION,/partially-funded/);
  const picked=chooseMewDceRecipient(
    view(genesect(),[mew(),vmax([PSY]),null,null,null]),catalog());
  assert.deepEqual(picked,{
    kind:'attach-special-energy',handIndex:0,printing:DCE,
    slot:'bench',index:1
  });
});

test('partially charged Active VMAX completes its public Cross Fusion cost',()=>{
  const picked=chooseMewDceRecipient(
    view(vmax([PSY]),[mew(),null,null,null,null]),catalog());
  assert.equal(picked?.slot,'active');
  assert.equal(picked?.index,0);
});

test('already payable VMAX is not overfunded ahead of zero-energy Mew V',()=>{
  const picked=chooseMewDceRecipient(
    view(vmax([PSY,PSY]),[mew(),null,null,null,null]),catalog());
  assert.equal(picked?.slot,'bench');
  assert.equal(picked?.index,0);
});

test('unknown attached Special Energy does not certify a payable VMAX',()=>{
  const picked=chooseMewDceRecipient(view(genesect(),[
    vmax(['Unknown Special Energy XYZ']),mew(),null,null,null
  ]),catalog());
  assert.equal(picked?.index,1);
});

test('printed attack must be observable and a DCE-completable cost',()=>{
  const broken=vmax([PSY]);
  broken.attacks=[{name:'Max Miracle',cost:[P,P],damage:130}];
  const picked=chooseMewDceRecipient(
    view(genesect(),[broken,mew(),null,null,null]),catalog());
  assert.equal(picked?.index,1);
});

test('Dimension Valley eliminates an already satisfied Cross Fusion deficit',()=>{
  const picked=chooseMewDceRecipient(view(vmax([PSY]),[
    mew(),null,null,null,null
  ],['Dimension Valley PHF']),catalog());
  assert.equal(picked?.slot,'bench');
  assert.equal(picked?.index,0);
});

test('off-axis Active immediate attack retains the held DCE',()=>{
  const other={
    printing:'Genesect V FST',energies:[],
    attacks:[{name:'Techno Blast',cost:[C,C],damage:210}]
  };
  assert.equal(chooseMewDceRecipient(
    view(other,[vmax([PSY]),null,null,null,null]),catalog()),null);
});

test('Temple and exhausted once-per-turn attachment remain hard gates',()=>{
  const temple=view(vmax([PSY]),[mew(),null,null,null,null],
    ['Temple of Sinnoh ASR']);
  assert.equal(chooseMewDceRecipient(temple,catalog()),null);
  const used=view(vmax([PSY]));
  used.ownTurnResources.energyPlayedTurn=3;
  assert.equal(chooseMewDceRecipient(used,catalog()),null);
});
