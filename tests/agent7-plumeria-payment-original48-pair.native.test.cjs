'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {VERSION,runOriginalPlumeriaPaymentPair}=
  require('../simulation/evaluation/agent7-plumeria-payment-original48-pair.cjs');
const {withPlumeriaTurnFrontier}=
  require('../simulation/twinleaf/agent7-shadowmist-plumeria-turn-frontier.cjs');

test('native exact source T3 two-Mail cost versus preserved-Mail payment',()=>{
  const observed=withPlumeriaTurnFrontier(()=>
    runOriginalPlumeriaPaymentPair());
  const result=observed.result;
  const row=result.target;
  const control=row.controlPrintedPayments.find(p=>
    p.seat===1&&p.turn===3);
  const alternate=row.treatmentPrintedPayments.find(p=>
    p.seat===1&&p.turn===3);
  const controlNames=control?.payment.map(x=>x.printing).sort();
  const alternativeNames=alternate?.payment.map(x=>x.printing).sort();
  const trialPosition=result.paired.findIndex(x=>x.id===row.id);
  assert.ok(trialPosition>=0);
  const controlStore=observed.audit.games[trialPosition];
  const alternativeStore=observed.audit.games[trialPosition+8];
  const atTurn=(game,turn,seat,action)=>
    game.entries.find(e=>e.ownerSnapshot.turn===turn&&
      e.ownerSnapshot.seat===seat&&e.action===action)?.ownerSnapshot??null;
  const preControl=atTurn(controlStore,3,1,'PlayCardAction');
  const preAlternative=atTurn(alternativeStore,3,1,'PlayCardAction');
  const replyControl=atTurn(controlStore,4,0,'PassTurnAction');
  const replyAlternative=atTurn(alternativeStore,4,0,'PassTurnAction');
  const sourceT5Control=atTurn(controlStore,5,1,'PassTurnAction');
  const sourceT5Alternative=atTurn(alternativeStore,5,1,'PassTurnAction');
  console.log('AGENT7_PLUMERIA_PAYMENT_ALTERNATIVE_NATIVE',JSON.stringify({
    version:VERSION,originalTrial:row.id,
    sourceSeat:row.sourceSeat,
    exactOpeningSha256:row.fullPhysicalDealFingerprint,
    sourceDealSha256:row.sourceDealFingerprint,
    controlNames,alternativeNames,
    controlAccepted:row.controlPlumeriaNativeAccepted,
    alternativeAccepted:row.treatmentPlumeriaNativeAccepted,
    physicalEnergyDiscardControl:row.controlSettledEnergyDiscards,
    physicalEnergyDiscardAlternative:row.treatmentSettledEnergyDiscards,
    preControl,preAlternative,
    replyControl,replyAlternative,
    sourceT5Control,sourceT5Alternative,
    originalTrialDenominator:result.paired.map(x=>({
      id:x.id,controlStatus:x.controlStatus,
      treatmentStatus:x.treatmentStatus,
      controlRoots:x.controlRoots,treatmentRoots:x.treatmentRoots,
      commonPublicPrefix:x.publicRootCommonPrefix
    })),
    nativeStores:observed.audit.physicalStores,
    competitivelyQualifiedGames:0
  }));
  assert.equal(result.registeredOriginalArmsPerCondition,8);
  assert.equal(observed.audit.physicalStores,16);
  assert.equal(result.exactSamePhysicalOpeningPerPair,true);
  assert.equal(row.sourceSeat,1);
  assert.equal(control?.acceptedByOriginalStore,true);
  assert.equal(alternate?.acceptedByOriginalStore,true);
  assert.deepEqual(controlNames,["Trainers' Mail ROS","Trainers' Mail ROS"]);
  assert.deepEqual(alternativeNames,
    ['Enhanced Hammer TWM',"Trainers' Mail ROS"]);
  assert.equal(row.controlPlumeriaNativeAccepted,1);
  assert.equal(row.treatmentPlumeriaNativeAccepted,1);
  assert.equal(row.controlSettledEnergyDiscards,1);
  assert.equal(row.treatmentSettledEnergyDiscards,1);
  assert.equal(row.controlUnresolvedPromptChains,0);
  assert.equal(row.treatmentUnresolvedPromptChains,0);
  assert.deepEqual(preControl,preAlternative);
  assert.ok(preControl);
  assert.equal(result.competitiveGamesQualified,0);
});
