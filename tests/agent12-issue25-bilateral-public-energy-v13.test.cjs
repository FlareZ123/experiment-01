'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {runBilateralPublicEnergyIssue25V13}=
  require('../simulation/evaluation/agent12-issue25-bilateral-public-energy-v13.cjs');
const {SELECTED_OUTER_TO_INNER}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');

function pureLayers(){
  return Object.fromEntries(SELECTED_OUTER_TO_INNER.slice(0,-1)
    .map(name=>[name,next=>({result:next(),audit:{name}})]));
}

test('v13 introduces only a both-seat actor-public Energy opt-in to actual v11 input',()=>{
  let received=null;
  const result=runBilateralPublicEnergyIssue25V13({
    layers:pureLayers(),
    attackLayer:next=>({result:next(),audit:{}}),
    runner:options=>{
      received=options;
      return {
        sourceIndependentCommonPolicyOptIn:true,
        rows:options.registeredTrials.map(trial=>({
          trial,status:'synthetic-development',finished:false,
          sourceSeat:trial.candidateSlot==='A'?1:0,
          candidateSeat:trial.candidateSlot==='A'?0:1,
          rootActionLedger:[
            {action:'PlayCardAction',playerSlot:trial.candidateSlot==='A'?1:0,
              card:'Speed Lightning Energy',actionOrdinal:1,turnBefore:1},
            {action:'AttackAction',playerSlot:trial.candidateSlot==='A'?1:0,
              actionOrdinal:2}
          ],
          bilateralPublicContextSpecialProfile:{
            sharedPolicy:true,mode:'both'
          },
          actorOnlyDecisionCoverage:{
            detailedComponentAudits:{
              root:{publicContextSpecialEnergyOptIn:true},
              ownerVipAfterPass:{originalPassRoots:1,acceptedItems:0,
                acceptedSearches:0}
            }
          }
        }))
      };
    }
  });
  assert.equal(received.actorOnlyComposition,true);
  assert.equal(received.sourceIndependentCommonPolicy,true);
  assert.equal(received.bilateralPublicContextSpecialEnergy,true);
  assert.equal(received.registeredTrials.length,8);
  assert.equal(received.nativeRootActionLimit,48);
  assert.equal(result.diagnostic.registered.length,8);
  assert.equal(result.diagnostic.nativeBothSeatPublicSpecialProfileRows,8);
  assert.equal(result.diagnostic.acceptedSourceEnergyRootsObserved,8);
  assert.equal(result.diagnostic.sourceAttackRootsObserved,8);
  assert.ok(result.diagnostic.publicSpecialSourceEvidence.every(
    row=>row.actorPublicSpecialFlag===true&&
      row.publicSpecialBothSeatProfile.sharedPolicy===true));
  assert.equal(result.manifest.selectedInnerCanonicalOwnerVip,true);
  assert.equal(result.manifest.selectedBothSeatPublicSpecialEnergy,true);
  assert.equal(result.manifest.competitiveGamesQualified,0);
  assert.equal(result.diagnostic.competitiveGamesQualified,0);
});

test('v13 treats absent or unqualified native rows as unknown source activity',()=>{
  const result=runBilateralPublicEnergyIssue25V13({
    layers:pureLayers(),
    attackLayer:next=>({result:next(),audit:{}}),
    runner:options=>({
      sourceIndependentCommonPolicyOptIn:true,
      rows:options.registeredTrials.map(trial=>({
        trial,sourceSeat:null,finished:false,
        status:'synthetic-censored',rootActionLedger:null
      }))
    })
  });
  assert.ok(result.diagnostic.publicSpecialSourceEvidence.every(
    row=>row.nativeSourceEnergyPlayRootCount===null&&
      row.nativeSourceAttackRoots===null));
  assert.equal(result.diagnostic.nativeBothSeatPublicSpecialProfileRows,0);
  assert.equal(result.diagnostic.competitiveGamesQualified,0);
});
