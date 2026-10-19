'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {CORE_FIELDS,verifyHistoricalMatchProjection} = require('../simulation/twinleaf/rank10-result-projection.cjs');
const record = () => Object.fromEntries(CORE_FIELDS.map(key => [key,null]));
test('schema drift is reported rather than falsely equated', () => {
 const archived = {...record(),attackTrace:[],policy:'old'};
 const current = {...record(),attackDeclarationTrace:[],policy:'new'};
 const result = verifyHistoricalMatchProjection(current,archived);
 assert.equal(result.entireRunMatchObjectEqual,false);
 assert.deepEqual(result.fieldsOnlyInCurrent,['attackDeclarationTrace']);
 assert.deepEqual(result.fieldsOnlyInArchive,['attackTrace']);
 assert.deepEqual(result.existingUncomparedFieldDifferences,['policy']);
});
test('gameplay outcome difference fails the gate', () => {
 const archived = record();
 assert.throws(() => verifyHistoricalMatchProjection({...archived,winner:1},archived));
 assert.throws(() => verifyHistoricalMatchProjection({...archived,actions:5},archived));
});
