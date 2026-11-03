'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {chooseUncontestedRank11Letter:choose}=
  require('../simulation/twinleaf/agent6-rank11-uncontested-letter.cjs');
function view(){
 return {decisionKind:'owner-root',globalTurn:1,
  ownHand:["Professor's Letter BKT"],ownTurnResources:{itemPlayLocked:false},
  ownPublic:{active:{energies:[]},bench:[],deckCount:45,prizeCount:6,
   discard:[],lostZone:[],publicTurnRestrictions:{itemPlayLocked:false}}};
}
test('withholds coheld Carmine, preserves pure uncontested proposal',()=>{
 const x=view(),s={darknessCopies:8,letterCopies:4};
 assert.equal(choose(x,s)?.kind,'play-professors-letter');
 x.ownHand.push('Carmine TWM');
 assert.equal(choose(x,s),null);
 assert.deepEqual(x.ownHand,["Professor's Letter BKT",'Carmine TWM']);
});
