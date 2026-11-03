'use strict';
const assert=require('node:assert/strict');
const {
  rank17ElectrodeBombNecessity,VERSION:NECESSITY_VERSION
}=require('./agent1-rank17-electrode-owner-necessity.cjs');

const VERSION='agent1-rank17-electrode-owner-census-v1';
const SAMPLE_LIMIT=32;

/** @returns {object} Mutable, bounded read-only audit accumulator. */
function newElectrodeOwnerCensus() {
  return {
    version:VERSION,
    necessaryScreenVersion:NECESSITY_VERSION,
    ownerRootDecisions:0,
    electrodeInPlayRoots:0,
    raichuRecipientInPlayRoots:0,
    lineCoPresentRoots:0,
    generalBombSourceRecipientRoots:0,
    generalBombSourceElectrodeRecipientCoPresentRoots:0,
    generalBombZeroDiscardRoots:0,
    generalBombPartialOneToFourDiscardRoots:0,
    generalBombFullFivePlusDiscardRoots:0,
    generalBombPhysicallyNecessaryRoots:0,
    generalBombPositiveRootIntentKinds:{},
    lineWithZeroDiscardEnergyRoots:0,
    lineWithOneToFourDiscardEnergyRoots:0,
    lineWithFivePlusDiscardEnergyRoots:0,
    physicalNecessaryRoots:0,
    sourceAbilityRootsActuallySelected:0,
    positiveRootIntentKinds:{},
    publicLockClueCounts:{},
    bySeat:{
      0:{ownerRoots:0,physicalNecessaryRoots:0},
      1:{ownerRoots:0,physicalNecessaryRoots:0}
    },
    examples:[],
    sampleLimit:SAMPLE_LIMIT,
    samplesTruncated:0,
    paperLegality:'UNVERIFIED',
    actualStoreEnergyTransfersVerified:false,
    abilityPromptAndSelfKnockoutVerified:false,
    consequentialOpponentReplyVerified:false,
    competitivelyQualifiedGames:0,
    notes:'Live owner-root prior only; zero benefit/legality conclusions. Samples repeat within games.'
  };
}

/**
 * Observe one ACTUAL owner root, after owner-safe policy intent selection,
 * before constructing or dispatching the native action. The owner view
 * contains the physical owner discard and public boards but no hidden data.
 * @param {object} audit Accumulator from newElectrodeOwnerCensus.
 * @param {object} view Frozen detached actorObservation.
 * @param {{kind:string}} chosenIntent Existing policy selection, not a native acceptance.
 * @param {number} decisionOrdinal Per-game owner-root ordinal.
 * @returns {object} Classification for this owner root only.
 */
function recordElectrodeOwnerCensus(audit,view,chosenIntent,decisionOrdinal) {
  assert.equal(audit?.version,VERSION);
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(view.actorSeat===0||view.actorSeat===1);
  assert.equal(typeof chosenIntent?.kind,'string');
  assert.ok(Number.isSafeInteger(decisionOrdinal)&&decisionOrdinal>0);
  const screen=rank17ElectrodeBombNecessity(view);
  const electrodePresent=screen.electrodePositions.length>0;
  const recipientPresent=screen.raichuPositions.length>0;
  const generalRecipientPresent=screen.generalBombSourceRecipientPositions.length>0;
  audit.ownerRootDecisions++;
  audit.bySeat[view.actorSeat].ownerRoots++;
  if(electrodePresent)audit.electrodeInPlayRoots++;
  if(recipientPresent)audit.raichuRecipientInPlayRoots++;
  if(generalRecipientPresent)audit.generalBombSourceRecipientRoots++;
  if(electrodePresent&&generalRecipientPresent){
    audit.generalBombSourceElectrodeRecipientCoPresentRoots++;
    if(screen.physicalDiscardEnergyCards===0)
      audit.generalBombZeroDiscardRoots++;
    else if(screen.physicalDiscardEnergyCards<5)
      audit.generalBombPartialOneToFourDiscardRoots++;
    else audit.generalBombFullFivePlusDiscardRoots++;
  }
  if(screen.generalBombNecessaryConditionsMet){
    audit.generalBombPhysicallyNecessaryRoots++;
    audit.generalBombPositiveRootIntentKinds[chosenIntent.kind]=
      (audit.generalBombPositiveRootIntentKinds[chosenIntent.kind]??0)+1;
  }
  if(electrodePresent&&recipientPresent){
    audit.lineCoPresentRoots++;
    if(screen.physicalDiscardEnergyCards===0)
      audit.lineWithZeroDiscardEnergyRoots++;
    else if(screen.physicalDiscardEnergyCards<5)
      audit.lineWithOneToFourDiscardEnergyRoots++;
    else audit.lineWithFivePlusDiscardEnergyRoots++;
  }
  if(screen.physicalNecessaryConditionsMet){
    audit.physicalNecessaryRoots++;
    audit.bySeat[view.actorSeat].physicalNecessaryRoots++;
    audit.positiveRootIntentKinds[chosenIntent.kind]=
      (audit.positiveRootIntentKinds[chosenIntent.kind]??0)+1;
    for(const clue of screen.visibleAbilitySuppressionClues)
      audit.publicLockClueCounts[clue]=
        (audit.publicLockClueCounts[clue]??0)+1;
  }
  if(chosenIntent.kind==='use-extra-energy-bomb')
    audit.sourceAbilityRootsActuallySelected++;
  if(electrodePresent||recipientPresent){
    if(audit.examples.length<audit.sampleLimit){
      audit.examples.push({
        seat:view.actorSeat,globalTurn:view.globalTurn,
        policyDecisionOrdinal:decisionOrdinal,
        chosenIntentKind:chosenIntent.kind,
        electrodePositions:screen.electrodePositions,
        raichuPositions:screen.raichuPositions,
        generalBombSourceRecipientPositions:
          screen.generalBombSourceRecipientPositions,
        generalBombNecessaryConditionsMet:
          screen.generalBombNecessaryConditionsMet,
        physicalDiscardEnergyCards:screen.physicalDiscardEnergyCards,
        maxPhysicalCardsTransferable:screen.maxPhysicalCardsTransferable,
        physicalNecessaryConditionsMet:screen.physicalNecessaryConditionsMet,
        visibleAbilitySuppressionClues:screen.visibleAbilitySuppressionClues,
        paperLegality:'UNVERIFIED',
        nativeAbilityAcceptance:'NOT_OBSERVED_BY_READONLY_CHECK'
      });
    }else audit.samplesTruncated++;
  }
  return screen;
}
module.exports={VERSION,SAMPLE_LIMIT,newElectrodeOwnerCensus,
  recordElectrodeOwnerCensus};
