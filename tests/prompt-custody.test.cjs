'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {inspectPhysicalCardZones}=require('../simulation/twinleaf/physical-card-ledger.cjs');
const list=cards=>({cards});
const player=id=>({id,deck:list([]),hand:list([]),discard:list([]),lostzone:list([]),stadium:list([]),supporter:list([]),active:{cards:[],tools:[],energies:list([])},bench:[],prizes:[]});
test('four lifted cards are counted as prompt custody',()=>{const a=player(101),b=player(202);const held=list([{}, {}, {}, {}]);const o=inspectPhysicalCardZones({players:[a,b],prompts:[{player:a,cards:held}]});assert.deepEqual(o.transientPromptCustody,[4,0]);});
