'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {inspectPhysicalCardZones} = require('../simulation/twinleaf/physical-card-ledger.cjs');
const list = (cards = []) => ({cards});
function player() { return {deck:list(),hand:list(),discard:list(),lostzone:list(),stadium:list(),supporter:list(),active:{cards:[],tools:[],energies:list()},bench:[],prizes:[]}; }
test('attached Tool exists outside Pokemon card list', () => {const a=player(),b=player(),tool={name:'Tool'};a.active.tools.push(tool);assert.deepEqual(inspectPhysicalCardZones({players:[a,b]}).canonicalCounts,[1,0]);});
