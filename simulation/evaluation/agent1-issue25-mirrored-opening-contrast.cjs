'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const VERSION='agent1-issue25-eight-arm-mirrored-protected-opening-contrast-v1';
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const BASE_ENTRY=
  'simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs';
const VARIANT_ENTRY=
  'simulation/evaluation/agent1-issue25-protected-opening-v7.cjs';

/**
 * Compare two actually returned receipts under the same preregistered eight
 * rank×source-seat and seed IDs. No retrospective exclusion or imputation.
 * Initial physical-deal parity is independently checked from real Store data.
 *
 * @param {object} baseline Real native v6 public receipt
 * @param {object} variant Real native v7 public receipt
 * @returns {object}
 */
function compareOpeningReceipts(baseline,variant){
  assert.equal(baseline.actuallyExecutingManifest?.policyEntryPoint,
    BASE_ENTRY);
  assert.equal(variant.actuallyExecutingManifest?.policyEntryPoint,
    VARIANT_ENTRY);
  assert.equal(baseline.actuallyExecutingManifest?.developmentTrialCount,8);
  assert.equal(variant.actuallyExecutingManifest?.developmentTrialCount,8);
  const ids=baseline.registration.expectedIds;
  assert.equal(ids.length,8);
  assert.equal(new Set(ids).size,8);
  assert.deepEqual(variant.registration.expectedIds,ids,
    'Baseline and variant must use identical preregistered seeds and IDs');
  const ownMap=(rows)=>{
    const map=new Map();
    for(const row of rows){
      assert.ok(typeof row.id==='string');
      assert.ok(!map.has(row.id),'duplicate attempted native ID');
      map.set(row.id,row);
    }
    assert.equal(map.size,8);
    return map;
  };
  const a=ownMap(baseline.attempts),b=ownMap(variant.attempts);
  assert.deepEqual([...a.keys()].sort(),[...ids].sort());
  assert.deepEqual([...b.keys()].sort(),[...ids].sort());
  const opening=variant.observedSelectedOpening??null;
  const matchOrdinalAttributionIsAvailable=opening?.stores===8&&
    Array.isArray(opening?.events);
  const rows=ids.map((id,index)=>{
    const base=a.get(id),challenger=b.get(id);
    const sourceA=base.sourceDealFingerprint??null;
    const sourceB=challenger.sourceDealFingerprint??null;
    const fullA=base.fullPhysicalDealFingerprint??null;
    const fullB=challenger.fullPhysicalDealFingerprint??null;
    const actualSeatA=base.originalSourceSeat??
      base.nativeAbortProvenance?.sourceSeat??null;
    const actualSeatB=challenger.originalSourceSeat??
      challenger.nativeAbortProvenance?.sourceSeat??null;
    const sourceDealMatch=sourceA!==null&&sourceB!==null?
      sourceA===sourceB:null;
    const fullPhysicalDealMatch=fullA!==null&&fullB!==null?
      fullA===fullB:null;
    const actualSourceSeatMatch=(actualSeatA===0||actualSeatA===1)&&
      (actualSeatB===0||actualSeatB===1)?
      actualSeatA===actualSeatB:null;
    const firstPlayerMatch=
      base.actualFirstPlayer!==null&&challenger.actualFirstPlayer!==null?
        base.actualFirstPlayer===challenger.actualFirstPlayer:null;
    const openingEvents=matchOrdinalAttributionIsAvailable?
      opening.events.filter(event=>event.nativeStoreOrdinal===index+1)
        .map(event=>({
          seat:event.seat,kind:event.kind,
          preservedEntryPrintings:event.preservedEntryPrintings??[],
          nativeValidSelections:event.nativeValidSelections??[],
          physicalPlacement:event.physicalPlacement??null
        })):null;
    return {
      id,sourceRank:Number(id.split(':')[0]),
      actualSourceSeatA:actualSeatA,actualSourceSeatB:actualSeatB,
      sourceDealMatch,fullPhysicalDealMatch,
      actualSourceSeatMatch,firstPlayerMatch,
      baselineStatus:base.status??null,
      protectedStatus:challenger.status??null,
      baselineNativeRoots:base.nativeRootActionCount??null,
      protectedNativeRoots:challenger.nativeRootActionCount??null,
      baselineFinished:base.finished??null,
      protectedFinished:challenger.finished??null,
      nativeStoreOpeningEvents:openingEvents
    };
  });
  const matched=(name)=>rows.filter(row=>row[name]===true).length;
  const distinct=(name)=>rows.filter(row=>row[name]===false).length;
  const missing=(name)=>rows.filter(row=>row[name]===null).length;
  return {
    schema:VERSION,
    policyEntries:{baseline:BASE_ENTRY,variant:VARIANT_ENTRY},
    actualRepositoryCommits:{
      baseline:baseline.actuallyExecutingManifest.observedRepositoryGitCommit??null,
      variant:variant.actuallyExecutingManifest.observedRepositoryGitCommit??null
    },
    eightPreregisteredOriginalRankSeatIDs:ids,
    nativeReceiptSourceHashes:{
      baseline:sha256(Buffer.from(JSON.stringify(baseline))),
      variant:sha256(Buffer.from(JSON.stringify(variant)))
    },
    matchedRows:rows,
    descriptiveOnly: {
      openingChosenNativeStores:opening?.stores??null,
      openingNativeAccepted:opening?.initialAccepted??null,
      openingProtectedSupportRetained:
        opening?.allEligibleProtectedSupportsRetained??null,
      openingMissingPhysicalPlacements:
        opening?.missingPhysicalPlacements??null,
      openingEventsAttributedToEachTrialByOrdinal:
        matchOrdinalAttributionIsAvailable
    },
    gates:{
      sameRegisteredEightTrialIDs:true,
      sameOriginalSourceFingerprints:{
        matches:matched('sourceDealMatch'),
        mismatches:distinct('sourceDealMatch'),
        unobserved:missing('sourceDealMatch')
      },
      sameFullPhysicalInitialDeals:{
        matches:matched('fullPhysicalDealMatch'),
        mismatches:distinct('fullPhysicalDealMatch'),
        unobserved:missing('fullPhysicalDealMatch')
      },
      sameActualSourceSeat:{
        matches:matched('actualSourceSeatMatch'),
        mismatches:distinct('actualSourceSeatMatch'),
        unobserved:missing('actualSourceSeatMatch')
      },
      sameFirstPlayer:{
        matches:matched('firstPlayerMatch'),
        mismatches:distinct('firstPlayerMatch'),
        unobserved:missing('firstPlayerMatch')
      },
      allEightPhysicalDealingMatched:
        rows.every(row=>row.sourceDealMatch===true&&
          row.fullPhysicalDealMatch===true),
      gameOutcomesCompetitivelyQualified:false,
      empiricalCompetitiveWinRateComparison:'UNRESOLVED',
      releaseQualified:false,
      overall:'FAIL-comparative-development-only'
    }
  };
}

/**
 * Exclusive lock and atomic JSON/SHA sidecar, no half-written public results.
 * @param {object} contrasted
 * @param {string} directory
 */
function writeContrastReceipt(contrasted,directory){
  const body=Buffer.from(JSON.stringify(contrasted,null,2)+'\n');
  assert.ok(body.length<=8*1024*1024);
  fs.mkdirSync(directory,{recursive:true});
  const lock=path.join(directory,'.agent1-mirrored-opening-contrast.lock');
  const fd=fs.openSync(lock,'wx');
  const file=path.join(directory,'issue25-mirrored-v6-v7-contrast.json');
  const digestFile=path.join(directory,'issue25-mirrored-v6-v7-contrast.sha256');
  const temp=file+'.'+process.pid+'.tmp';
  const digestTemp=digestFile+'.'+process.pid+'.tmp';
  const digest=sha256(body);
  try{
    fs.writeFileSync(temp,body,{flag:'wx'});
    fs.renameSync(temp,file);
    fs.writeFileSync(digestTemp,
      digest+'  issue25-mirrored-v6-v7-contrast.json\n',{flag:'wx'});
    fs.renameSync(digestTemp,digestFile);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    if(fs.existsSync(digestTemp))fs.unlinkSync(digestTemp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return {file,sha256:digest,bytes:body.length};
}

module.exports={VERSION,compareOpeningReceipts,writeContrastReceipt};
