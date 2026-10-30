'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const manifest=require('../results/aichi-2026/full-decklists.json');
const {publicThornsTechRisk}=
  require('../simulation/evaluation/agent26-public-thorns-tech-risk.cjs');
const near=(x,y)=>assert.ok(Math.abs(x-y)<1e-12,
  String(x)+' != '+String(y));
const view=hands=>({
  decisionKind:'owner-root',
  opponentPublic:{active:{name:'Iron Thorns ex'}},
  publicFailedOpponentSevens:hands
});

test('no revealed invalid seven retains conditional three-source Thorns prior',()=>{
 const r=publicThornsTechRisk(view([]),manifest);
 near(r.probabilityOriginalSourceHasFourCrushingHammer,2/3);
 near(r.probabilityNextBasicValidSevenIncludesHammer,
  2/3*0.36396950356706015);
 near(r.sourceRankHypotheses.reduce((n,x)=>n+x.posterior,0),1);
 assert.equal(r.recommendedAction,null);
 assert.equal(r.gameWinEvidence,false);
 assert.ok(Object.isFrozen(r.sourceRankHypotheses[0]));
});

test('actual publicly possible Echoing Horn source hand identifies original rank6',()=>{
 const r=publicThornsTechRisk(view([[
  'Crushing Hammer','Camping Gear','Echoing Horn','Wondrous Labyrinth ♢',
  'Guzma & Hala','Guzma','Speed Lightning Energy'
 ]]),manifest);
 near(r.probabilityOriginalSourceHasFourCrushingHammer,1);
 assert.deepEqual(r.sourceRankHypotheses.filter(x=>x.posterior>0)
  .map(x=>x.rank),[6]);
 near(r.probabilityNextBasicValidSevenIncludesHammer,0.36396950356706015);
});

test('a single public Hammer excludes native zero-Hammer source',()=>{
 const r=publicThornsTechRisk(view([[
  'Lillie\'s Determination','Speed Lightning Energy','Camping Gear',
  'Spiky Energy','Crushing Hammer','Palace Belt','Capture Energy'
 ]]),manifest);
 near(r.probabilityOriginalSourceHasFourCrushingHammer,1);
 assert.equal(r.sourceRankHypotheses.find(x=>x.rank===24).posterior,0);
});

test('different public Active never receives Thorns-specific source risk',()=>{
 const r=publicThornsTechRisk({
  ...view([]),opponentPublic:{active:{name:'Regidrago V'}}
 },manifest);
 assert.equal(r,null);
});

test('unverified source evidence fails closed',()=>{
 const r=publicThornsTechRisk(view([[
  'Unknown non-Aichi card','Unknown non-Aichi card',
  'Unknown non-Aichi card','Unknown non-Aichi card',
  'Unknown non-Aichi card','Unknown non-Aichi card',
  'Unknown non-Aichi card'
 ]]),manifest);
 assert.equal(r.status,'out-of-model');
 assert.equal(r.probabilityOriginalSourceHasFourCrushingHammer,null);
 assert.equal(r.recommendedAction,null);
});
