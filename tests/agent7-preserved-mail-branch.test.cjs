'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {runDevelopment}=require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
test('Mail-after-Pass requires canonical actor composition',()=>{
  assert.throws(()=>runDevelopment({actorOwnerMailAfterPass:true}),
    /Mail after-Pass requires canonical actor composition/);
});
