'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {attestPairedArchive}=require(
  '../simulation/evaluation/agent31-actual-actor-floatstone-closure.cjs');
function make(){
 const componentVersions={root:'funded-vmax-v1',prompt:'typed-v1'};
 const row=(seat,enabled)=>({
   trial:{id:'1:0:A:champion-reference'},candidateSeat:seat,
   sourceDeckFingerprint:'same-source-printed-60',
   candidateDeckFingerprint:'same-candidate-printed-60',
   fullPhysicalDealFingerprint:'same-physical-world',
   actorOnlyPolicyVersion:'actor-v3',
   actorOnlyDecisionCoverage:{
     version:'actor-v3',
     selectedHandlerPriority:['SourceStampedTypedEnergyPrompt','ActorOnlyRoot'],
     componentVersions,
     ownerVipAfterPassOptIn:false,
     detailedComponentAudits:{root:{
       fundedVmaxFloatStoneRootOptIn:enabled,
       fundedVmaxFloatStoneRootSelected:enabled?2:0
     }}
   }
 });
 const arm=(enabled)=>({
   actorOnlyCompositionVersion:'actor-v3',
   actorOnlyCompositionOptIn:true,
   actorFundedShadowRiderFloatStoneRootOptIn:enabled,
   actorUnderworldDoorRootOptIn:true,
   rows:[row(0,enabled)]
 });
 return {registrationBlob:'frozen-reg',pinnedEngine:'pinned-vendor',
   control:arm(false),treatment:arm(true)};
}
test('two printed-60 actor arms differ only in the selected root option',()=>{
 const a=attestPairedArchive(make());
 assert.deepEqual(a.observedTopLevelOptionDelta,
   ['actorFundedShadowRiderFloatStoneRootOptIn']);
 assert.equal(a.originalPairedRows,1);
 assert.equal(a.allSeatOwnerRescueSelectionsTreatment,2);
 assert.equal(a.paperCompetitiveGamesQualified,0);
 assert.notEqual(a.observedModeControlDigest,a.observedModeRescueDigest);
});
test('paper-invisible changed physical deal cannot be presented as paired',()=>{
 const a=make();a.treatment.rows[0].fullPhysicalDealFingerprint='other';
 assert.throws(()=>attestPairedArchive(a),/identical source and candidate physical openings/);
});
test('missing actor receipt is never inherited from another row',()=>{
 const a=make();delete a.treatment.rows[0].actorOnlyDecisionCoverage;
 assert.throws(()=>attestPairedArchive(a),/consistent actor runtime coverage/);
});
test('a second enabled option invalidates the one-causal-difference claim',()=>{
 const a=make();a.treatment.actorCarmineRootOptIn=true;
 a.control.actorCarmineRootOptIn=false;
 assert.throws(()=>attestPairedArchive(a),/Unregistered top-level choice changed/);
});
