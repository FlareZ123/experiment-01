'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {lillieExclusionReason,LILLIE}=require('../simulation/twinleaf/agent12-actor-only-lillie-after-pass.cjs');

test('old owner policy rejects a zero-deck hand-return opportunity',()=>{
 const x={decisionKind:'owner-root',globalTurn:40,ownHand:[LILLIE,'Psychic Energy SVE','Fog Crystal CRE'],ownPublic:{deckCount:0,resolvingSupporter:[],publicTurnRestrictions:{}},ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false}};
 assert.equal(lillieExclusionReason(x),'owner-deck-empty');
 assert.equal(x.ownHand.length-1,2);
});
