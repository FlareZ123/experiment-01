'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {POLICY_VERSION}=
  require('../simulation/evaluation/agent41-bilateral-common-policy.cjs');
const {VERSION,withIdenticalTwoSeatCommonPolicy}=
  require('../simulation/evaluation/agent36-bilateral-two-seat-common-policy.cjs');

test('opt-in selected common-resource wrapper installs both seats in fixed order',()=>{
  const events=[];
  const withSeat=(seat,next)=>{
    events.push('enter-'+seat);
    const result=next();
    events.push('leave-'+seat);
    return {result,policyAudit:{seat,marker:'same-code'}};
  };
  const result=withIdenticalTwoSeatCommonPolicy(()=>{
    events.push('execute');
    return {source:'native-runner-result'};
  },{withSeat});
  assert.deepEqual(events,[
    'enter-0','enter-1','execute','leave-1','leave-0'
  ]);
  assert.deepEqual(result.result,{source:'native-runner-result'});
  assert.equal(result.policyAudit.version,POLICY_VERSION);
  assert.equal(result.policyAudit.twoSeatVersion,VERSION);
  assert.deepEqual(result.policyAudit.installedPhysicalSeats,[0,1]);
  assert.deepEqual(result.policyAudit.perSeatAudits,{
    0:{seat:0,marker:'same-code'},
    1:{seat:1,marker:'same-code'}
  });
  assert.equal(result.policyAudit.competitiveGameQualified,false);
});

test('a failure inside either seat propagates and cannot be relabeled as a game',()=>{
  const withSeat=(seat,next)=>{
    if(seat===1)throw new Error('inner denied');
    return {result:next(),policyAudit:{seat}};
  };
  assert.throws(()=>withIdenticalTwoSeatCommonPolicy(()=>'unreached',
    {withSeat}),/inner denied/);
});
