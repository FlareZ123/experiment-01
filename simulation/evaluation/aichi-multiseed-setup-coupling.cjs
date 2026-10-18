'use strict';

const path=require('node:path');
const {createHash}=require('node:crypto');
const {loadCampaignInputs}=require('./aichi-campaign-runner.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {prepareCandidateInputOrder}=require('./aichi-candidate-input-order.cjs');
const {captureSetupOnly}=require('./aichi-setup-only-capture.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {Store}=require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/game/store/store'));

/** @param {unknown} value */
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** @param {string[]} a @param {string[]} b */
function multisetOverlap(a,b){
  const counts=new Map();
  for(const item of a)counts.set(item,(counts.get(item)||0)+1);
  let n=0;
  for(const item of b){
    if((counts.get(item)||0)>0){
      counts.set(item,counts.get(item)-1);
      n++;
    }
  }
  return n;
}

/** @param {object} setup @param {number} slot */
function observedSeat(setup,slot){
  if(!setup || setup.turn!==1 || setup.seats?.length!==2){
    return null;
  }
  const s=setup.seats[slot];
  return {
    exposed:[...s.hand,...s.active,...s.bench.flat()],
    prizes:s.prizes.flat(),
    firstTurn:setup.firstTurnSlot===slot,
    opponentDigest:digest(setup.seats[1-slot]),
    totalPrivatePostSetupCopies:s.hand.length+s.active.length+
      s.bench.reduce((n,bench)=>n+bench.length,0)
  };
}

/**
 * Independent v3 seeds, paper-source 60s, real pinned Twinleaf setup. The
 * synthetic stop at first game turn prevents normal attacking decisions and
 * provides zero actual game outcomes.
 * @param {{ranks?:number[],repeats?:number}} [options]
 * @returns {object}
 */
function sampleSourceCoupling(options={}){
  const ranks=options.ranks||[6,8,10];
  const repeats=options.repeats??4;
  if(!Array.isArray(ranks)||!ranks.length||new Set(ranks).size!==ranks.length||
     ranks.some(rank=>!Number.isInteger(rank)||rank<1||rank>32)||
     !Number.isInteger(repeats)||repeats<1||repeats>20){
    throw RangeError('Invalid bounded physical-deal sample');
  }
  const inputs=loadCampaignInputs();
  const reference=inputs.candidates.find(c=>c.referenceOnly===true);
  if(!reference)throw Error('No nominated source reference');
  const candidates=[reference,...['hood-shield-v1','temple-v1'].map(id=>
    inputs.candidates.find(c=>c.id===id))];
  if(candidates.some(c=>!c))throw Error('Candidate input inventory missing');
  const plans=new Map(candidates.map(candidate=>[
    candidate.id,planAichi({label:candidate.id,cards:candidate.cards},{
      allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true
    })
  ]));
  const sourceOpponents=new Map(
    plans.get(reference.id).opponents.filter(row=>ranks.includes(row.rank))
      .map(row=>[row.rank,row])
  );
  for(const rank of ranks){
    const opponent=sourceOpponents.get(rank);
    if(opponent?.status!=='ready'||opponent.cards?.length!==60){
      throw Error('Unresolved exact opponent rank '+rank);
    }
  }
  const samples=[];
  const contrasts=[];
  for(const rank of ranks){
    const opponent=sourceOpponents.get(rank);
    for(let repeat=0;repeat<repeats;repeat++){
      const seeds=deriveSlotSeeds(20261016,'pilot',rank,repeat);
      for(const physicalSlot of ['A','B']){
        const candidateSeat=physicalSlot==='A'?0:1;
        const seed=seeds[physicalSlot];
        const local=[];
        for(const candidate of candidates){
          const plan=plans.get(candidate.id);
          const protocols=candidate.referenceOnly?
            ['source-row-order-v1'] :
            ['source-row-order-v1','reference-aligned-v1'];
          for(const protocol of protocols){
            const ordered=prepareCandidateInputOrder(
              reference.cards,candidate.cards,plan.candidate.cards,protocol);
            const request={
              deckA:candidateSeat===0?ordered.engineIds:opponent.cards,
              deckB:candidateSeat===1?ordered.engineIds:opponent.cards,
              seed,maxActions:150,
              strictPromptValidation:true,isolatePolicyRandomness:true
            };
            let capture;
            let error=null;
            try{
              capture=captureSetupOnly(Store,()=>runMatch(request));
            }catch(failure){
              error=String(failure?.message||failure);
            }
            const observation=observedSeat(capture?.setupZones,candidateSeat);
            const sample={
              rank,repeat,seed,physicalSlot,candidateId:candidate.id,
              inputOrderProtocol:protocol,
              printedMatchingPositions:ordered.matchingPositionsAfter,
              sourcePrintingCopies:ordered.sharedCopies,
              inputDeckHash:ordered.executedInputHash,
              actualPostSetup:observation,
              stoppedAtFirstTurn:capture?.stoppedAtFirstTurn===true,
              error
            };
            local.push(sample);
            samples.push(sample);
          }
        }
        const baseline=local.find(row=>row.candidateId===reference.id);
        for(const id of ['hood-shield-v1','temple-v1']){
          const native=local.find(row=>row.candidateId===id &&
            row.inputOrderProtocol==='source-row-order-v1');
          const aligned=local.find(row=>row.candidateId===id &&
            row.inputOrderProtocol==='reference-aligned-v1');
          const available=baseline.actualPostSetup&&native.actualPostSetup&&
            aligned.actualPostSetup;
          const exposedNative=available?
            multisetOverlap(baseline.actualPostSetup.exposed,native.actualPostSetup.exposed):null;
          const exposedAligned=available?
            multisetOverlap(baseline.actualPostSetup.exposed,aligned.actualPostSetup.exposed):null;
          const prizesNative=available?
            multisetOverlap(baseline.actualPostSetup.prizes,native.actualPostSetup.prizes):null;
          const prizesAligned=available?
            multisetOverlap(baseline.actualPostSetup.prizes,aligned.actualPostSetup.prizes):null;
          contrasts.push({
            rank,repeat,seed,physicalSlot,candidateId:id,
            complete:!!available,
            matchesPhysicalTurn:available?
              baseline.actualPostSetup.firstTurn===native.actualPostSetup.firstTurn &&
              native.actualPostSetup.firstTurn===aligned.actualPostSetup.firstTurn:null,
            opponentZoneSameNativeAligned:available?
              native.actualPostSetup.opponentDigest===
                aligned.actualPostSetup.opponentDigest:null,
            exposedNative,exposedAligned,prizesNative,prizesAligned,
            exposedDifference:available?exposedAligned-exposedNative:null,
            prizeDifference:available?prizesAligned-prizesNative:null
          });
        }
      }
    }
  }
  // A syntactically successful CI run with zero captured Store setups is
  // misleading evidence. Require every predeclared source arm to reach turn 1.
  const failed=samples.filter(row=>row.error || !row.stoppedAtFirstTurn ||
    !row.actualPostSetup);
  if(failed.length){
    const example=failed[0];
    throw new Error('Source setup-coupling capture failed in '+failed.length+'/'+
      samples.length+' arms; first: rank='+example.rank+
      ' repeat='+example.repeat+' seat='+example.physicalSlot+
      ' candidate='+example.candidateId+
      ' error='+(example.error||'missing post-setup snapshot'));
  }
  const summary=[];
  for(const rank of ranks){
    for(const candidateId of ['hood-shield-v1','temple-v1']){
      const rows=contrasts.filter(row=>row.rank===rank&&row.candidateId===candidateId);
      const valid=rows.filter(row=>row.complete);
      const sum=key=>valid.reduce((n,row)=>n+row[key],0);
      summary.push({
        rank,candidateId,samples:rows.length,valid:valid.length,
        meanExposedDelta:valid.length?sum('exposedDifference')/valid.length:null,
        meanPrizeDelta:valid.length?sum('prizeDifference')/valid.length:null,
        exposedImproved:valid.filter(row=>row.exposedDifference>0).length,
        exposedTied:valid.filter(row=>row.exposedDifference===0).length,
        exposedWorsened:valid.filter(row=>row.exposedDifference<0).length,
        prizeImproved:valid.filter(row=>row.prizeDifference>0).length,
        prizeTied:valid.filter(row=>row.prizeDifference===0).length,
        prizeWorsened:valid.filter(row=>row.prizeDifference<0).length,
        physicalTurnMatched:valid.filter(row=>row.matchesPhysicalTurn).length,
        opponentZonesIdentical:valid.filter(row=>row.opponentZoneSameNativeAligned).length
      });
    }
  }
  return {
    schema:'aichi-actual-source-postsetup-paired-sampler-v1',
    researchRevision:process.env.GITHUB_SHA||null,
    engineRevision:plans.get(reference.id).engineRevision,
    sourceFieldCount:inputs.source.decks.length,
    sourceAndCandidate60Unchanged:true,
    ranks,repeats,
    seedProtocol:'decorrelated-slots-v3',
    status:'initial-setup-only-not-games',
    qualifiedCompetitiveGames:0,
    stopsBeforeNormalTurnDecisions:true,
    assumptions:'Actual Store post-setup snapshots, optional mulligan draws and K0 hidden Prize knowledge never given to bots. Samples are fixed-seed diagnostics; not independent competitive games.',
    summary,contrasts,samples
  };
}

if(require.main===module){
  const result=sampleSourceCoupling();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  process.stderr.write(JSON.stringify({
    schema:result.schema,ranks:result.ranks,repeats:result.repeats,
    capturedSetups:result.samples.filter(row=>row.stoppedAtFirstTurn).length,
    setupErrors:result.samples.filter(row=>row.error).map(row=>({
      rank:row.rank,repeat:row.repeat,candidateId:row.candidateId,
      protocol:row.inputOrderProtocol,error:row.error
    })),
    summary:result.summary
  })+'\n');
}

module.exports={sampleSourceCoupling,multisetOverlap,observedSeat};
