'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {PROFILES,WITH_LELE,LOCKED_ORIGINAL_RANKS,verifyLockedOriginals,main}=
 require('../simulation/evaluation/agent27-adp-wondertag-29field-lock-bounds.cjs');
const {FULL60}=require('../simulation/evaluation/agent27-adp-original29-four-bonus-bounds.cjs');
const {countWonderTagBonuses}=require('../simulation/evaluation/agent27-adp-wondertag-bonus.cjs');
const EXPECTED={
 mechanical:{
  without:[.38858170467737935,.3916710205726218],
  unrestricted:[.4451188634070499,.44798861865138917],
  sourceKnownLock:[.4397378693201817,.44282264288748974],
  incrementalWithKnownLock:[.0511516223148679,.0512864810590555]},
 dragons:{
  sourceKnownLock:[.2116219893064445,.21574241594123575],
  incrementalWithKnownLock:[.002344587500767048,.002479446244954636]},
 dragonsEnergy:{
  sourceKnownLock:[.2899922335201993,.2934355462854512],
  incrementalWithKnownLock:[.011951540711625654,.012086399455813244]},
 dragonsEnergyCompressor:{
  sourceKnownLock:[.3330716427229169,.33631542402390385],
  incrementalWithKnownLock:[.019828245176301648,.019963103920489233]}
};
test('all original field Iron Thorns source ranks and printed Ability veto',()=>{
 assert.deepEqual(verifyLockedOriginals(),[6,24,29]);
});
test('up to four paid-Wonder exact counts respect no-Wonder denominator and parity',()=>{
 for(let n=0;n<5;n++){
  assert.equal(WITH_LELE[n].denominator,FULL60[n].denominator);
  for(const p of PROFILES)assert.ok(WITH_LELE[n][p]>=FULL60[n][p]);
 }
});
test('0–2 paid Wonder full60 bigints independently regenerate cached field values',()=>{
 for(let n=0;n<=2;n++){
  const computed=countWonderTagBonuses(n);
  assert.equal(computed.denominator,WITH_LELE[n].denominator);
  for(const p of PROFILES)assert.equal(computed.numerators[p].with,WITH_LELE[n][p]);
 }
});
test('29-source all offers, known three Iron Thorns locks, and causal increments',()=>{
 const result=main();
 assert.equal(result.sourceOpponentCount,29);
 assert.deepEqual(result.missingOriginalRanks,[23,25,28]);
 assert.deepEqual(result.identifiedTurnOneLockRanks,LOCKED_ORIGINAL_RANKS);
 assert.deepEqual(result.allOpponents.filter(r=>r.activeIronThornsLock).map(r=>r.rank),[6,24,29]);
 const masses=[.8560551267989686,.09759562939962949,.02543732845005459,
  .009636887153935056,.004756416137394166,.006518612060018225];
 masses.forEach((v,i)=>assert.ok(Math.abs(v-result.candidateBonusMasses[i])<1e-12));
 assert.ok(Math.abs(result.candidateBonusMasses.reduce((a,b)=>a+b,0)-1)<1e-12);
 for(const [p,reference] of Object.entries(EXPECTED)){
  for(const [axis,values] of Object.entries(reference)){
   values.forEach((v,i)=>assert.ok(
    Math.abs(v-result.sourceField[p][axis][i])<1e-12,
    p+' '+axis+' '+i));
  }
  const x=result.sourceField[p];
  assert.ok(x.sourceKnownLock[0]<=x.unrestricted[0]);
  assert.ok(x.sourceKnownLock[1]<=x.unrestricted[1]);
  assert.ok(x.incrementalWithKnownLock[0]>=0);
  assert.ok(x.incrementalWithKnownLock[1]>=x.incrementalWithKnownLock[0]);
 }
 assert.equal(result.qualifiedGames,0);
});
