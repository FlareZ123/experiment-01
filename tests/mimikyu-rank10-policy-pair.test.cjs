'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {firstDifference} = require('../simulation/twinleaf/mimikyu-rank10-policy-pair.cjs');
test('first recorded action divergence', () => {
 const a=[{action:'Pass'},{action:'Copycat'}];
 const b=[{action:'Pass'},{action:'Apex'}];
 assert.equal(firstDifference(a,b).index,1);
 assert.equal(firstDifference(a,a),null);
});
