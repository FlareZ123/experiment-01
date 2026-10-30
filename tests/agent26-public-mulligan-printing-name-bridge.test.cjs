'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  publicPrintingNameIndex,publicAichiSourceNameIndex,opponentPublicFailedHandNames
}=require('../simulation/evaluation/agent26-public-mulligan-printing-name-bridge.cjs');

const catalog=[
  {fullName:'Plumeria PRC 001',name:'Plumeria'},
  {fullName:'Plumeria PRC 002',name:'Plumeria'},
  {fullName:'Speed Lightning Energy RCL 173',name:'Speed Lightning Energy'},
  {fullName:'Professor Juniper DEX 98',name:'Professor Juniper'}
];
const a=['Plumeria PRC 001','Plumeria PRC 002',
  'Plumeria PRC 001','Plumeria PRC 002',
  'Speed Lightning Energy RCL 173',
  'Speed Lightning Energy RCL 173',
  'Speed Lightning Energy RCL 173'];
const b=Array(7).fill('Professor Juniper DEX 98');
const history={
  schema:'native-public-opponent-mulligan-reveal-v1',
  provenance:'opponent-facing ShowMulliganPrompt only',
  effectOnActorPolicy:false,
  createsCompetitiveWinRateEvidence:false,
  excludesPrivateCurrentHandDeckPrize:true,
  revealedHandCounts:[1,1],
  handsByOwner:[[b],[a]]
};

test('only genuine opponent-visible seven is projected for each viewer',()=>{
  const idx=publicPrintingNameIndex(catalog);
  const seat0=opponentPublicFailedHandNames(history,0,idx);
  assert.deepEqual(seat0,[[
    'Plumeria','Plumeria','Plumeria','Plumeria',
    'Speed Lightning Energy','Speed Lightning Energy',
    'Speed Lightning Energy'
  ]]);
  assert.ok(Object.isFrozen(seat0)&&Object.isFrozen(seat0[0]));
  const seat1=opponentPublicFailedHandNames(history,1,idx);
  assert.deepEqual(seat1,[Array(7).fill('Professor Juniper')]);
  assert.equal(idx.get('Plumeria PRC 002'),'Plumeria');
});

test('other-side public history and any unseen state never influence owner disclosure',()=>{
  const idx=publicPrintingNameIndex(catalog);
  const altered=structuredClone(history);
  altered.handsByOwner[0][0]=a;
  assert.deepEqual(
    opponentPublicFailedHandNames(altered,0,idx),
    opponentPublicFailedHandNames(history,0,idx));
  assert.notDeepEqual(
    opponentPublicFailedHandNames(altered,1,idx),
    opponentPublicFailedHandNames(history,1,idx));
});

test('unverified printed aliases and malformed native histories fail closed',()=>{
  const idx=publicPrintingNameIndex(catalog);
  const invalid=structuredClone(history);
  invalid.handsByOwner[1][0][0]='secret unknown printing';
  assert.throws(()=>opponentPublicFailedHandNames(invalid,0,idx),
    /no verified public name/);
  const partial=structuredClone(history);
  partial.handsByOwner[1][0]=a.slice(0,6);
  assert.throws(()=>opponentPublicFailedHandNames(partial,0,idx));
  const hidden=structuredClone(history);
  hidden.excludesPrivateCurrentHandDeckPrize=false;
  assert.throws(()=>opponentPublicFailedHandNames(hidden,0,idx));
  assert.throws(()=>publicPrintingNameIndex([
    {fullName:'same',name:'name A'},
    {fullName:'same',name:'name B'}
  ]),/Ambiguous/);
});

test('pure verified names feed exact 29-source history classifier',()=>{
  const manifest=require('../results/aichi-2026/full-decklists.json');
  const {publicFailedHandHistoryPosterior}=require(
    '../scripts/agent26-public-mulligan-fullhistory.cjs');
  const names=opponentPublicFailedHandNames(
    {...history, handsByOwner:[[],[a]],revealedHandCounts:[0,1]},
    0,publicPrintingNameIndex(catalog));
  const result=publicFailedHandHistoryPosterior(manifest,names);
  assert.deepEqual(result.sourceIdentitiesCompatible,[6,24,29]);
});

test('native Prism Star names map to exact known Aichi original source aliases',()=>{
  const definitions=[
    {fullName:'Wondrous Labyrinth Prism Star TEU',
      name:'Wondrous Labyrinth Prism Star'},
    {fullName:'Thunder Mountain Prism Star LOT',
      name:'Thunder Mountain Prism Star'},
    {fullName:'Ditto Prism Star LOT',name:'Ditto Prism Star'},
    {fullName:'Tapu Koko Prism Star TEU',name:'Tapu Koko Prism Star'},
    {fullName:'Other Prism Star FOO',name:'Other Prism Star'}
  ];
  const publicOnly=publicPrintingNameIndex(definitions);
  const sourceCompatible=publicAichiSourceNameIndex(definitions);
  assert.equal(publicOnly.get(definitions[0].fullName),
    'Wondrous Labyrinth Prism Star');
  assert.equal(sourceCompatible.get(definitions[0].fullName),
    'Wondrous Labyrinth ♢');
  assert.equal(sourceCompatible.get(definitions[1].fullName),
    'Thunder Mountain ♢');
  assert.equal(sourceCompatible.get(definitions[2].fullName),'Ditto ♢');
  assert.equal(sourceCompatible.get(definitions[3].fullName),'Tapu Koko ♢');
  assert.equal(sourceCompatible.get(definitions[4].fullName),
    'Other Prism Star','Unverified card names are never fuzzy-matched');
});
