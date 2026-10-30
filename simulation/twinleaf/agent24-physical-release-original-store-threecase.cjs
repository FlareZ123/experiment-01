'use strict';

const assert=require('node:assert/strict');
const {CASES}=require('./agent47-strict-physical60-native-3case.cjs');
const {registration}=require('./agent47-rank20-apex-natural-audit.cjs');
const {initializeCards,runMatch}=require('./headless.cjs');
const {withActorHandDiscard}=require('./agent47-actor-hand-discard.cjs');
const {withMinimumAttachEnergySelection}=
  require('./agent47-minimum-attach-energy-hook.cjs');
const {classifyPhysicalZoneEvidence,summarizePhysicalQualification}=
  require('../evaluation/physical-zone-qualification.cjs');

const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Exact pre-existing original-source negative/positive native cases,
 * with the new shared evaluator's release verdict applied to the true
 * Store outcome. This is a regression for physical custody alone.
 *
 * @param {object} c Pre-existing Agent47 frozen seed and physical seat.
 * @param {Map<number,object>} byRank Original registered printed 60s.
 * @returns {object}
 */
function execute(c,byRank){
  const source=byRank.get(20).cardIds;
  const opponent=byRank.get(11).cardIds;
  assert.equal(source.length,60);
  assert.equal(opponent.length,60);
  const request={
    deckA:c.sourceSeat===0?source:opponent,
    deckB:c.sourceSeat===1?source:opponent,
    seed:c.seed,maxActions:160,
    doubleDragonRecovery:true,strictPromptValidation:true,
    isolatePolicyRandomness:true,
    capturePhysicalZoneIntegrity:true,
    enforceSettledPhysicalZoneIntegrity:true,
    // Keep the complete original Agent47 request identity unchanged.
    label:'agent47-strict-physical-60-'+c.seed+'-'+c.sourceSeat
  };
  let game=null,error=null;
  try{
    const observed=withMinimumAttachEnergySelection(()=>
      withActorHandDiscard(()=>runMatch(request),{},{
        apexPayloadDiscard:false
      }));
    game=observed.result.result;
  }catch(e){
    error=e;
  }
  const physicalZoneQualification=classifyPhysicalZoneEvidence({
    requested:true,game,error
  });
  if(c.shouldFail){
    assert.equal(physicalZoneQualification.status,'ENGINE_PHYSICAL_INVALID');
    assert.equal(physicalZoneQualification.firstFailingRoot,
      c.firstAnomalyOrdinal);
    assert.deepEqual(physicalZoneQualification.witness.ownership.canonicalCounts,
      [60,59]);
    assert.deepEqual(
      physicalZoneQualification.witness.ownership.transientPromptCustody,
      [0,0]);
  }else{
    assert.equal(error,null);
    assert.equal(physicalZoneQualification.status,
      'SETTLED_PHYSICAL_INTEGRITY_PASSED');
    assert.ok(physicalZoneQualification.settledRootsChecked>0);
  }
  assert.equal(physicalZoneQualification.competitiveQualified,false);
  return {sourceRank:20,opponentRank:11,sourceSeat:c.sourceSeat,
    seed:c.seed,firstFailingRoot:physicalZoneQualification.firstFailingRoot??null,
    ...physicalZoneQualification};
}

function main(){
  initializeCards();
  const {byRank}=registration();
  const rows=CASES.map(c=>execute(c,byRank));
  const summary=summarizePhysicalQualification(
    rows.map(physicalZoneQualification=>({physicalZoneQualification})));
  assert.equal(summary.attempted,3);
  assert.equal(summary.byStatus.ENGINE_PHYSICAL_INVALID,2);
  assert.equal(summary.byStatus.SETTLED_PHYSICAL_INTEGRITY_PASSED,1);
  assert.equal(summary.competitiveQualifiedGames,0);
  return {schema:'agent24-original-store-bilateral-physical-custody-release-v1',
    pinnedTwinleaf:ENGINE_PIN,originalFrozenSource:true,
    cases:rows.map(row=>({...row,witness:row.witness?{
      actionOrdinal:row.witness.actionOrdinal,
      turn:row.witness.turn,
      ownership:{canonicalCounts:row.witness.ownership?.canonicalCounts,
        transientPromptCustody:row.witness.ownership?.transientPromptCustody}
    }:null})),
    summary,competitiveQualifiedGames:0,
    caveat:'Same old original Store fixtures demonstrate the new classifier only; no policy, print effect or competitive outcome qualification'};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={execute,main};
