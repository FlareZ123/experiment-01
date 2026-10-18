'use strict';

const path=require('node:path');
const {createHash}=require('node:crypto');
const {loadCampaignInputs}=require('./aichi-campaign-runner.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {prepareCandidateInputOrder}=require('./aichi-candidate-input-order.cjs');
const {captureSourceSetup}=require('./aichi-setup-zone-capture.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {Store}=require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/game/store/store'));

/** @param {unknown} value @returns {string} */
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** @param {string[]} left @param {string[]} right @returns {number} */
function multisetOverlap(left,right){
  const counts=new Map();
  for(const item of left)counts.set(item,(counts.get(item)||0)+1);
  let common=0;
  for(const item of right){
    if((counts.get(item)||0)>0){
      common++;
      counts.set(item,counts.get(item)-1);
    }
  }
  return common;
}

/** @param {object} setup @param {number} slot */
function candidateSetup(setup,slot){
  if(!setup || setup.schema!=='pinned-root-postsetup-zones-v1' ||
      setup.seats?.length!==2 || ![0,1].includes(slot)){
    return null;
  }
  const seat=setup.seats[slot];
  return {
    hand:seat.hand,
    active:seat.active,
    bench:seat.bench,
    prizes:seat.prizes,
    deckRemaining:seat.deckRemaining,
    exposedPostSetupCopies:[
      ...seat.hand,...seat.active,...seat.bench.flat()
    ],
    prizeCopies:seat.prizes.flat()
  };
}

/**
 * Run a small, source-locked actual-Store initial-deal experiment. Historical
 * campaign schedules and source decks are unchanged. The bot is not observed
 * making competent decisions and game results are deliberately not scored.
 * @returns {object}
 */
function runInputOrderDealProbe(){
  const inputs=loadCampaignInputs();
  const reference=inputs.candidates.find(c=>c.referenceOnly===true);
  const challengerIds=['hood-shield-v1','temple-v1'];
  const selected=[reference,...challengerIds.map(id=>
    inputs.candidates.find(candidate=>candidate.id===id))];
  if(selected.some(value=>!value))throw Error('Frozen candidate not available');
  const prepared=new Map(selected.map(candidate=>[
    candidate.id,planAichi({label:candidate.id,cards:candidate.cards},{
      allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true
    })
  ]));
  const rank=6;
  const opponent=prepared.get(reference.id).opponents.find(x=>x.rank===rank);
  if(opponent?.status!=='ready'||opponent.cards?.length!==60){
    throw Error('Rank-6 exact opponent could not be resolved.');
  }
  const seeds=deriveSlotSeeds(20261016,'pilot',rank,0);
  const rows=[];
  for(const slot of ['A','B']){
    const candidateSeat=slot==='A'?0:1;
    for(const candidate of selected){
      const plan=prepared.get(candidate.id);
      if(plan.candidate.cards?.length!==60){
        throw Error('Candidate printing resolution failed: '+candidate.id);
      }
      const protocols=candidate.referenceOnly ?
        ['source-row-order-v1'] :
        ['source-row-order-v1','reference-aligned-v1'];
      for(const protocol of protocols){
        const ordering=prepareCandidateInputOrder(
          reference.cards,candidate.cards,plan.candidate.cards,protocol);
        const request={
          deckA:candidateSeat===0?ordering.engineIds:opponent.cards,
          deckB:candidateSeat===1?ordering.engineIds:opponent.cards,
          seed:seeds[slot],maxActions:100,
          label:['rank6',slot,candidate.id,protocol].join(':'),
          strictPromptValidation:true,isolatePolicyRandomness:true
        };
        const captured=captureSourceSetup(Store,()=>{
          try{return runMatch(request);}
          catch(error){return {error:String(error?.message||error)};}
        });
        const game=captured.game;
        const setup=candidateSetup(captured.setupZones,candidateSeat);
        rows.push({
          candidateId:candidate.id,physicalSeat:slot,seed:request.seed,
          inputOrderProtocol:protocol,sourcePrintDigest:
            digest(candidate.cards.map(row=>[row.name,row.count,row.printing])),
          opponentRank:rank,opponentEngineInputDigest:
            digest(opponent.cards),
          candidateOrderEvidence:{
            sharedCopies:ordering.sharedCopies,
            matchedSourcePositions:ordering.matchingPositionsBefore,
            matchedExecutedPositions:ordering.matchingPositionsAfter,
            originalInputHash:ordering.sourceInputHash,
            executedInputHash:ordering.executedInputHash,
            originalPrintingOrderHash:ordering.sourcePrintingOrderHash,
            executedPrintingOrderHash:ordering.executedPrintingOrderHash
          },
          actualFirstTurnSlot:captured.setupZones?.firstTurnSlot??null,
          candidateActuallyFirst:captured.setupZones ?
            captured.setupZones.firstTurnSlot===candidateSeat:null,
          firstTurnLogVerified:game.verifiedByDrawLog===true,
          setup,
          opponentPostSetup:captured.setupZones?.seats?.[1-candidateSeat]||null,
          engineStoppedWithError:game.error||null,
          diagnosticsOnly:true
        });
      }
    }
  }
  const comparisons=[];
  for(const slot of ['A','B']){
    const subset=rows.filter(row=>row.physicalSeat===slot);
    const baseline=subset.find(row=>row.candidateId===reference.id);
    for(const id of challengerIds){
      const source=subset.find(row=>row.candidateId===id&&
        row.inputOrderProtocol==='source-row-order-v1');
      const aligned=subset.find(row=>row.candidateId===id&&
        row.inputOrderProtocol==='reference-aligned-v1');
      comparisons.push({
        slot,candidateId:id,seed:seeds[slot],
        sourcePositionsMatched:source.candidateOrderEvidence.matchedExecutedPositions,
        alignedPositionsMatched:aligned.candidateOrderEvidence.matchedExecutedPositions,
        actualStartingOrderByArm:{
          reference:baseline.candidateActuallyFirst,
          source:source.candidateActuallyFirst,
          aligned:aligned.candidateActuallyFirst
        },
        postSetupOpponentZoneSameSourceVersusAligned:
          source.opponentPostSetup&&aligned.opponentPostSetup ?
            digest(source.opponentPostSetup)===digest(aligned.opponentPostSetup):null,
        postSetupCandidateCopyOverlapWithReference:{
          source:baseline.setup&&source.setup?
            multisetOverlap(baseline.setup.exposedPostSetupCopies,
              source.setup.exposedPostSetupCopies):null,
          aligned:baseline.setup&&aligned.setup?
            multisetOverlap(baseline.setup.exposedPostSetupCopies,
              aligned.setup.exposedPostSetupCopies):null
        },
        postSetupCandidatePrizeCopyOverlapWithReference:{
          source:baseline.setup&&source.setup?
            multisetOverlap(baseline.setup.prizeCopies,source.setup.prizeCopies):null,
          aligned:baseline.setup&&aligned.setup?
            multisetOverlap(baseline.setup.prizeCopies,aligned.setup.prizeCopies):null
        }
      });
    }
  }
  return {
    schema:'aichi-source-setup-input-order-probe-v1',
    researchRevision:process.env.GITHUB_SHA||null,
    engineRevision:prepared.get(reference.id).engineRevision,
    seedProtocol:'decorrelated-slots-v3',
    sourceFieldCount:inputs.source.decks.length,
    sourceInventoryChanged:false,
    gamesQualifiedForCompetitiveInference:0,
    gameOutcomesAnalyzed:false,
    purpose:'real Store initial-deal coupling and setup evidence only',
    note:'Post-setup zones may reflect mulligan bonus draws and Basic placement. Hidden Prize identities are researcher-only; never supplied to bot. Index matches do not guarantee identical opening hands or prizes.',
    rows,comparisons
  };
}

if(require.main===module){
  const evidence=runInputOrderDealProbe();
  process.stdout.write(JSON.stringify(evidence,null,2)+'\n');
  // Keep a short independently retrievable summary in the workflow log;
  // the full detached zone identities remain in its archived JSON artifact.
  process.stderr.write(JSON.stringify({
    schema:evidence.schema,sourceFieldCount:evidence.sourceFieldCount,
    setupsCaptured:evidence.rows.filter(row=>row.setup!==null).length,
    engineErrors:evidence.rows.filter(row=>row.engineStoppedWithError).map(row=>({
      candidateId:row.candidateId,slot:row.physicalSeat,
      protocol:row.inputOrderProtocol,error:row.engineStoppedWithError
    })),
    comparisons:evidence.comparisons
  })+'\n');
}

module.exports={runInputOrderDealProbe,multisetOverlap,candidateSetup};
