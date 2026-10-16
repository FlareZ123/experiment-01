'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {strictK0Unknown}=require('../simulation/twinleaf/strict-k0-unknown.cjs');
test('K0 unseen does not depend on hidden assignment',()=>{
 const result=strictK0Unknown(['A','B','X','X'],['X']);
 assert.deepEqual(result,['A','B','X']);
});
