'use strict';

const assert=require('node:assert/strict');
const {CASES}=require('./agent47-strict-physical60-native-3case.cjs');
const {registration}=require('./agent47-rank20-apex-natural-audit.cjs');
const {initializeCards}=require('./headless.cjs');
const {execute}=require('./agent24-physical-release-original-store-threecase.cjs');
const {summarizePhysicalQualification}=
  require('../evaluation/physical-zone-qualification.cjs');

/**
 * Opt-in experimental extension of the exact historical rank20/rank11
 * source deal triplet. Never a prospective deck-strength denominator.
 *
 * @returns {object} Fail-closed physical original-owner custody receipts.
 */
function main(){
  initializeCards();
  const {byRank}=registration();
  const cases=CASES.map(c=>{
    const row=execute(c,byRank,true);
    if(c.shouldFail){
      assert.equal(row.status,'ENGINE_PHYSICAL_INVALID');
      assert.equal(row.firstFailingRoot,c.firstAnomalyOrdinal);
      assert.equal(row.witness?.ownership?.originalOwnerCustody
        ?.originalCardCount,120);
      assert.deepEqual(row.witness.ownership
        .originalOwnerCustody.missingOriginalCounts,[0,1]);
    }else{
      assert.equal(row.status,'SETTLED_PHYSICAL_INTEGRITY_PASSED');
      assert.equal(row.originalOwnerIntegrityQualified,true);
    }
    const witness=row.witness;
    return {
      sourceRank:row.sourceRank,opponentRank:row.opponentRank,
      sourceSeat:row.sourceSeat,seed:row.seed,
      status:row.status,firstFailingRoot:row.firstFailingRoot,
      originalOwnerIntegrityQualified:row.originalOwnerIntegrityQualified,
      physicalIntegrityQualified:row.physicalIntegrityQualified,
      observedOriginalCardCount:witness?.ownership?.originalOwnerCustody
        ?.originalCardCount??(row.originalOwnerIntegrityQualified?120:null),
      missingOriginalCounts:witness?.ownership?.originalOwnerCustody
        ?.missingOriginalCounts??null,
      displacedOriginalReferences:witness?.ownership?.originalOwnerCustody
        ?.displacedOriginalReferences??null,
      unregisteredOriginalReferences:witness?.ownership?.originalOwnerCustody
        ?.unregisteredOriginalReferences??null,
      canonicalCounts:witness?.ownership?.canonicalCounts??null,
      competitiveQualified:false
    };
  });
  const summary=summarizePhysicalQualification(cases.map(row=>({
    physicalZoneQualification:row
  })));
  assert.equal(summary.attempted,3);
  assert.equal(summary.byStatus.ENGINE_PHYSICAL_INVALID,2);
  assert.equal(summary.byStatus.SETTLED_PHYSICAL_INTEGRITY_PASSED,1);
  assert.equal(summary.competitiveQualifiedGames,0);
  return {
    schema:'agent24-original-reference-ownership-native-threecase-v1',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceRank:20,opponentRank:11,
    evidence:'retrospective same physical-deal seeds as existing Agent47 threecase',
    allAttempts:3,rows:cases,summary,competitiveQualifiedGames:0,
    limitation:'Original object references are a necessary integrity condition; this does not validate printed effects, opponent policy, the 25-minute clock, or actual wins.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main};
