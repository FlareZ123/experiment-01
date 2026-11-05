'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {VERSION,runOriginalShadowMistPlumeriaAB}=
  require('../simulation/evaluation/agent7-shadowmist-original48-plumeria-aba.cjs');

test('actual original-source rank6 locked Pass is replaced by native Plumeria',()=>{
  const r=runOriginalShadowMistPlumeriaAB();
  const row=r.target;
  console.log('AGENT7_SHADOWMIST_PLUMERIA_ORIGINAL_AB',JSON.stringify({
    version:VERSION,targetTrial:row.id,
    originalSourceSeat:row.originalSourceSeat,
    originalSourceDealSha256:row.sourceDealSha256,
    matchedPhysicalTrialCount:r.paired.length,
    firstDivergence:row.firstDivergence,
    physicalPlumeriaAudit:row.physicalPlumeriaAudit,
    acceptedPlumeriaNativeRootSequence:
      row.treatmentAcceptedRootsFromFirstChange,
    firstSourceNonpromptAfterPlay:row.firstSourceNonpromptAfterChange,
    firstCandidateNonpromptAfterPlay:row.firstCandidateNonpromptAfterChange,
    byTrial:r.paired.map(x=>({
      id:x.id,control:x.controlStatus,treatment:x.treatmentStatus,
      unchangedPublicPrefix:x.commonRootPrefixLength,
      firstDiff:x.firstDivergence,
      originalRoots:x.controlRootCount,newRoots:x.treatmentRootCount,
      nativeFinishedControl:x.controlFinished,
      nativeFinishedTreatment:x.treatmentFinished
    })),
    nativeCompetitiveGames:0
  }));
  assert.equal(r.paired.length,8);
  assert.equal(r.unchangedOriginalAndFullDeal,true);
  assert.equal(row.originalSourceSeat,1);
  assert.ok(row.firstDivergence);
  assert.equal(row.firstDivergence.control.action,'PassTurnAction');
  assert.equal(row.firstDivergence.treatment.action,'PlayCardAction');
  assert.equal(row.firstDivergence.treatment.card,'Plumeria');
  assert.ok(row.physicalPlumeriaAudit,
    'Real native original Store physical payment audit must be retained');
  assert.ok(row.physicalPlumeriaAudit.acceptedPlayRoots>=1,
    'Source must have successfully played Plumeria');
  assert.ok(row.physicalPlumeriaAudit.nativeAcceptedMandatoryPrompts>=3,
    'Two-card payment, Pokemon target and attached Energy prompts must settle');
  assert.ok(row.physicalPlumeriaAudit.settledOpponentEnergyDiscards>=1,
    'An actual attached opponent Energy must leave through native settlement');
  assert.equal(row.physicalPlumeriaAudit.unresolvedPromptChains,0);
  assert.equal(r.nativePaperCompetitiveGames,0);
});
