'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {registeredCases,CAMPAIGN}=
  require('../simulation/twinleaf/agent18-original29-crossseat-native-k0.cjs');
const {summarize}=
  require('../scripts/agent18-crossseat-source-root-summary.cjs');

function root(seat,role,rank){
  const offerings=role==='original-source'?[{
    source:'owner-tool',kind:'attach-tool-candidate',
    printing:'Muscle Band XY',slot:'active',index:0
  }]:[];
  return {
    role,physicalSeat:seat,globalTurn:seat+1,
    ownActive:role+' active',ownBench:[],
    opponentActive:'public opponent',ownerKnownHand:['card '+rank],
    sameRootK0Invariant:true,physicalObjectsRestored:true,
    nativeStoreFirstActionDispatched:true,
    nativeStoreFirstActionAccepted:true,
    sameRootReceipt:{offers:[
      {source:'first-return',kind:'pass'},...offerings
    ],supportedAlternativeCount:offerings.length}
  };
}
function fixture(){
  const arms=registeredCases().map(item=>{
    const mirror=item.rank===1;
    return {
      ...item,status:'native-original-source-both-owners-passed',
      ownerRoots:[
        root(0,mirror?'rank1-mirror':
          item.orientation===0?'rank1-reference':'original-source',item.rank),
        root(1,mirror?'rank1-mirror':
          item.orientation===1?'rank1-reference':'original-source',item.rank)
      ]
    };
  });
  return {campaign:CAMPAIGN,engineRevision:'test',
    preregisteredArms:58,preregisteredFirstOwnerRoots:116,
    passedArms:58,blockedArms:[],arms};
}
test('keeps all 116 first owner roots and both physical role orientations',()=>{
  const r=summarize(fixture());
  assert.equal(r.observedFirstOwnerRoots,116);
  assert.equal(r.firstRootsWithK0InvariantAndPhysicalRestore,116);
  assert.equal(r.firstRootsWithOriginalNativeStoreAcceptance,116);
  assert.equal(r.bySemanticRole['rank1-mirror'].roots,4);
  assert.equal(r.bySemanticRole['rank1-reference'].roots,56);
  assert.equal(r.bySemanticRole['original-source'].roots,56);
  assert.equal(r.bySemanticRole['original-source'].toolOffers,56);
  assert.equal(r.competitiveQualifiedGames,0);
});
test('retains blocked original game and removes its two unobserved roots',()=>{
  const input=fixture();
  input.arms[0]={...input.arms[0],status:'blocked',ownerRoots:undefined};
  input.passedArms=57;
  input.blockedArms=[{rank:1,orientation:0,error:'native setup failed'}];
  const r=summarize(input);
  assert.equal(r.observedFirstOwnerRoots,114);
  assert.equal(r.blockedArms.length,1);
});
