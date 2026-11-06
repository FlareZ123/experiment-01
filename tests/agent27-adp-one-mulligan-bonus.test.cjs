'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {countOneMulliganBonus,PROFILES}=
  require('../simulation/evaluation/agent27-adp-one-mulligan-bonus.cjs');
/** Full original fixed-60 first-seven + one bonus + one draw, six prizes. */
test('exact one-bonus payment profile retains common mechanical denominator',()=>{
  const r=countOneMulliganBonus();
  assert.equal(String(r.denominator),'11518273287461158400');
  assert.equal(String(r.mechanical),'4847593728885719886');
  assert.equal(r.handsVisited,17991);
  const expected={
    dragons:['2762823273869857548','1035425522387389608','959337217893680634','62839023951998976','27168690782793120'],
    dragonsEnergy:['3693841581456447974','793623959776992826','319306027685379918','33283389243014592','7538770723884576'],
    dragonsEnergyCompressor:['4123638649335134752','540031513098022728','161659270269004934','19227641475751104','3036654707806368']
  };
  for(const profile of PROFILES){
    assert.deepEqual(r.histograms[profile].map(String),expected[profile]);
    assert.equal(r.histograms[profile].reduce((x,y)=>x+y,0n),r.mechanical);
  }
});
