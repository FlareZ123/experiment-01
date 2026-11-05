'use strict';

const {createHash}=require('node:crypto');
const registryDefault=require('../../results/aichi-2026/registrations/agent18-original-source-fork-overlap-registry-v1.json');
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Check each curated historical intervention against the independently
 * downloaded steward's exact original v5 native archive. The archive proves
 * pretreatment custody and existence of the accepted original Pass only.
 * Prior intervention Store effects remain attributable to their separate
 * published CI artifacts, not to this v5 original control.
 *
 * @param {object} archive Original v5 public action tape archive.
 * @param {object} [registry] Curated versioned native fork index.
 * @returns {object} One status per known fork, including any bad entries.
 */
function validateOriginalSourceForkRoots(archive,registry=registryDefault){
  const rows=Array.isArray(archive?.attempts)?archive.attempts:[];
  const out=(registry?.entries??[]).map(entry=>{
    const base={key:entry.key,sourceRegistration:entry.sourceRegistration,
      originalSourcePassRootOrdinal:entry.sourcePassRootOrdinal,
      custody:'UNVERIFIED',competitiveGamesQualified:0};
    const candidates=rows.filter(x=>x.id===entry.sourceRegistration);
    if(candidates.length!==1)
      return {...base,reason:'MISSING_OR_DUPLICATE_ORIGINAL_SOURCE_ARM'};
    const row=candidates[0];
    const tape=row.publicRootActions;
    if(!Array.isArray(tape)||row.publicRootActionsTruncated!==false||
       row.publicRootLedgerDigestConsistent!==true||
       row.publicRootActionCount!==tape.length||
       hash(tape)!==row.publicRootLedgerSha256Computed||
       hash(tape)!==row.publicRootLedgerSha256Reported)
      return {...base,reason:'INCOMPLETE_OR_BAD_ORIGINAL_NATIVE_LEDGER'};
    if(row.originalSourceSeat!==entry.sourceSeat||
       row.fullPhysicalDealFingerprint!==entry.fullPhysicalDealSha256||
       row.sourceDealFingerprint!==entry.sourceDealSha256)
      return {...base,reason:'SOURCE_SEAT_OR_PHYSICAL_DEAL_MISMATCH'};
    const ordinal=entry.sourcePassRootOrdinal;
    const root=Number.isSafeInteger(ordinal)&&ordinal>=0?tape[ordinal]:null;
    if(root?.action!=='PassTurnAction'||
       root?.playerSlot!==entry.sourceSeat||
       root?.turnBefore!==entry.sourceTurn)
      return {...base,reason:'ROOT_NOT_GENUINE_SOURCE_OWNER_PASS'};
    if(hash(tape.slice(0,ordinal))!==entry.preRootSha256)
      return {...base,reason:'PRETREATMENT_ACCEPTED_ROOT_PREFIX_MISMATCH'};
    return {...base,custody:'VERIFIED_ORIGINAL_PRETREATMENT_ROOT',
      reason:null,rootNativeAction:root.action,sourceSeat:entry.sourceSeat,
      sourceTurn:entry.sourceTurn};
  });
  return {schema:'agent18-original-source-fork-registry-control-custody-v1',
    expectedEntries:(registry?.entries??[]).length,verifiedEntries:out.filter(x=>
      x.custody==='VERIFIED_ORIGINAL_PRETREATMENT_ROOT').length,
    archiveAttemptCount:rows.length,allIndexedOriginalPassesVerified:
      out.length>0&&out.every(x=>x.custody==='VERIFIED_ORIGINAL_PRETREATMENT_ROOT'),
    previouslyTestedEffectsIndependentlyReverified:false,
    competitiveGamesQualified:0,entries:out};
}

module.exports={validateOriginalSourceForkRoots};
