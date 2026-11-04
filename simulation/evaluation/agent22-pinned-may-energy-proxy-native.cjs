'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {
  SOURCE_BLOB_SHA,loadPinnedSource,auditMay2026SourcePrints
}=require('./agent22-aichi-source-print-crosswalk.cjs');
const {sameTranscribedRow}=
  require('./agent22-source-provenance-receipt.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {writeAtomicLocked}=require('./agent49-pinned-source-print-census.cjs');
const {EnergyType}=
  require('../../vendor/twinleaf/ptcg-server/output/game/store/card/card-types');

const VERSION='agent22-pinned-may2026-energy-proxy-native-id-audit-v1';
const OUTPUT=path.resolve(process.cwd(),'agent22-native-energy-print-proxy.json');

/**
 * Link every post-event artwork annotation in the *original* pinned May field
 * to a real runtime resolver substitution and native CardManager printing.
 * This proves catalog identity and Basic Energy classification only.
 *
 * @param {object} source Immutable original manifest.
 * @param {object} plan Existing actual planAichi result.
 * @param {(fullName:string)=>object|null} lookup Actual pinned manager.
 * @returns {object}
 */
function auditPinnedEnergyProxies(source,plan,lookup) {
  assert.equal(typeof lookup,'function');
  assert.ok(Array.isArray(plan?.opponents));
  const chronology=auditMay2026SourcePrints(source);
  assert.equal(chronology.sourceGitBlobSha,SOURCE_BLOB_SHA);
  assert.equal(plan.engineRevision,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const results=[];
  for(const entry of chronology.entries) {
    const native=plan.opponents.find(row=>row.rank===entry.rank);
    assert.ok(native && native.status==='ready',
      'Original rank unresolved in native plan: '+entry.rank);
    const found=(native.substitutions??[]).filter(row=>
      sameTranscribedRow(entry,row));
    assert.equal(found.length,1,'Missing or duplicate original art alias');
    const substitution=found[0];
    assert.equal(substitution.reason,'same-set-basic-energy-number-mismatch');
    const actual=lookup(substitution.resolvedId);
    assert.ok(actual,'Resolved native card ID missing: '+substitution.resolvedId);
    assert.equal(actual.fullName,substitution.resolvedId);
    assert.equal(actual.name,entry.name,'Resolved native Energy type changed');
    assert.equal(actual.set,entry.preEventRepresentative.set);
    assert.equal(String(Number(actual.setNumber)),
      entry.preEventRepresentative.number,
      'Runtime basic-energy art number does not match pre-event proxy');
    assert.equal(actual.energyType,EnergyType.BASIC,
      'Resolved native card must actually be Basic Energy');
    results.push({
      rank:entry.rank,name:entry.name,copies:entry.count,
      archivedArtwork:entry.transcribedPrinting,
      historicalPhysicalArtwork:'unknown',
      documentedPreEventRepresentative:entry.preEventRepresentative,
      nativeId:actual.fullName,
      actualNativePrinting:{
        name:actual.name,set:actual.set,number:String(actual.setNumber)
      },
      actualNativeEnergyType:'BASIC',
      resolverReason:substitution.reason,
      paperEffectCertified:false
    });
  }
  const count=results.reduce((n,row)=>n+row.copies,0);
  assert.equal(results.length,35);
  assert.equal(count,120);
  assert.equal(new Set(results.map(x=>x.rank)).size,22);
  return {
    schema:VERSION,
    pinnedVendorRevision:plan.engineRevision,
    originalSourceGitBlobSha:SOURCE_BLOB_SHA,
    crosswalkRevision:chronology.crosswalkSha256,
    validatedNativeRows:results.length,
    validatedNativeCopies:count,
    validatedSourceRanks:22,
    allPublishedRanksEngineResolved:
      plan.opponents.filter(x=>x.status==='ready').length===29,
    historicalArtKnown:false,
    basicEnergyCatalogClassVerified:true,
    runtimePrintedIdVerified:true,
    nativeGameplaySemanticsCertified:false,
    paperGameplaySemanticsCertified:false,
    competitivelyQualifiedGames:0,
    entries:results
  };
}

/** Audit actual pinned runtime and persist the complete result atomically. */
function run(){
  const source=loadPinnedSource();
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const manager=initializeCards();
  const result=auditPinnedEnergyProxies(source,plan,
    fullName=>manager.getCardByName(fullName));
  writeAtomicLocked(OUTPUT,JSON.stringify(result,null,2)+'\n');
  console.log('AGENT22_PINNED_MAY_ENERGY_PROXY',JSON.stringify({
    schema:result.schema,source:result.originalSourceGitBlobSha,
    engine:result.pinnedVendorRevision,
    crosswalk:result.crosswalkRevision,
    rows:result.validatedNativeRows,copies:result.validatedNativeCopies,
    ranks:result.validatedSourceRanks,
    runtimePrintedIdVerified:result.runtimePrintedIdVerified,
    basicEnergyCatalogClassVerified:result.basicEnergyCatalogClassVerified,
    nativeGameplaySemanticsCertified:result.nativeGameplaySemanticsCertified,
    paperGameplaySemanticsCertified:result.paperGameplaySemanticsCertified
  }));
  return result;
}
if(require.main===module)run();
module.exports={VERSION,OUTPUT,auditPinnedEnergyProxies,run};
