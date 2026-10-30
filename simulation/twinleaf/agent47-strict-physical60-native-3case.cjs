'use strict';

const assert=require('node:assert/strict');
const {registration}=require('./agent47-rank20-apex-natural-audit.cjs');
const {initializeCards,runMatch}=require('./headless.cjs');
const {withActorHandDiscard}=require('./agent47-actor-hand-discard.cjs');
const {withMinimumAttachEnergySelection}=
 require('./agent47-minimum-attach-energy-hook.cjs');

const CASES=[
 {sourceSeat:1,seed:1847000101,shouldFail:true,firstAnomalyOrdinal:52},
 {sourceSeat:1,seed:1847000103,shouldFail:true,firstAnomalyOrdinal:98},
 {sourceSeat:0,seed:1847000101,shouldFail:false}
];

/**
 * Three genuinely executed original rank20 versus rank11 source games,
 * source-deal fixed. The new opt-in gate must stop on the first physically
 * impossible settled native root and let a known conserved source pass.
 * A passing physical check does not imply tactical/rules fidelity.
 */
function runOne(c,byRank){
 const source=byRank.get(20).cardIds,opponent=byRank.get(11).cardIds;
 const request={
  deckA:c.sourceSeat===0?source:opponent,
  deckB:c.sourceSeat===1?source:opponent,
  seed:c.seed,maxActions:160,
  doubleDragonRecovery:true,strictPromptValidation:true,
  isolatePolicyRandomness:true,
  capturePhysicalZoneIntegrity:true,enforceSettledPhysicalZoneIntegrity:true,
  label:'agent47-strict-physical-60-'+c.seed+'-'+c.sourceSeat
 };
 let error=null,result=null;
 try{
  const fixed=withMinimumAttachEnergySelection(()=>
   withActorHandDiscard(()=>runMatch(request),{},{
    apexPayloadDiscard:false
   }));
  result=fixed.result.result;
 }catch(e){error=e;}
 if(c.shouldFail){
  assert.equal(error?.code,'TWINLEAF_SETTLED_PHYSICAL_60_VIOLATION');
  const receipt=error.physicalConservationWitness;
  assert.equal(receipt?.actionOrdinal,c.firstAnomalyOrdinal);
  assert.deepEqual(receipt?.ownership?.canonicalCounts,[60,59]);
  assert.deepEqual(receipt?.ownership?.transientPromptCustody,[0,0]);
  return{case:c,status:'fail-closed-at-original-native-root',
   firstViolation:receipt,
   correctedMinimumPromptProposals:error.nativeMinimumAttachEvidence?.proposedCorrections??null,
   engineGameWinNotCounted:true};
 }
 assert.equal(error,null);
 assert.equal(result.physicalZoneIntegrity.settledRootsWithAnomaly,0);
 assert.ok(result.physicalZoneIntegrity.settledRootsChecked>0);
 return{case:c,status:'passed-this-one-physical-invariant',
  nativeSettledRoots:result.physicalZoneIntegrity.settledRootsChecked,
  engineGameWinNotCounted:true};
}
function main(){
 initializeCards();
 const {byRank}=registration();
 return{schema:'agent47-source20-strict-native-settled-physical60-gate-v1',
  originalRegisteredSource60:true,sourceRank:20,opponentRank:11,
  pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
  checks:CASES.map(c=>runOne(c,byRank)),
  computationalStatus:'deterministic-post-hoc-gate-reproduction',
  competitiveQualifiedGames:0,
  caveat:'Strict native physical-source gate is necessary yet insufficient for paper Expanded fidelity and competitive policy qualification.'
 };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={CASES,runOne,main};
