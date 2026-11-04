'use strict';

const {createHash}=require('node:crypto');

const VERSION='agent10-issue25-independent-native-receipt-audit-v1';

/** @param {unknown} values @returns {'PASS'|'FAIL'|'UNRESOLVED'} */
function worstVerdict(values){
  if(values.includes('FAIL'))return 'FAIL';
  if(values.includes('UNRESOLVED'))return 'UNRESOLVED';
  return 'PASS';
}

/**
 * Every claimed attempt must appear once in all three independent receipt
 * arrays. Array lengths alone cannot certify identity or custody.
 * @param {string[]} registered
 * @param {string[]} returned
 * @param {string[]} recorded
 * @returns {object}
 */
function auditAttemptIdentity(registered,returned,recorded){
  const valid=[registered,returned,recorded].every(values=>
    Array.isArray(values)&&values.every(id=>
      typeof id==='string'&&id.length>0));
  if(!valid)return {verdict:'FAIL',reason:'malformed-identities'};
  const target=new Set(registered);
  const details=[returned,recorded].map(values=>({
    missing:registered.filter(id=>!values.includes(id)),
    unexpected:values.filter(id=>!target.has(id)),
    duplicates:values.filter((id,i)=>values.indexOf(id)!==i)
  }));
  const registeredDuplicates=registered.filter((id,i)=>
    registered.indexOf(id)!==i);
  const verdict=registeredDuplicates.length===0&&
    details.every(d=>d.missing.length===0&&d.unexpected.length===0&&
      d.duplicates.length===0)&&
    registered.length===returned.length&&returned.length===recorded.length?
    'PASS':'FAIL';
  return {verdict,registeredCount:registered.length,
    returnedCount:returned.length,receiptCount:recorded.length,
    registeredDuplicates,returned:details[0],recorded:details[1]};
}

/**
 * @param {object} row A single public attempt from a selected-native receipt.
 * @param {number} rootLimit Profile's actual action limit.
 * @returns {object}
 */
function auditRootLedger(row,rootLimit){
  const actions=row.publicRootActions;
  const expectedCount=row.nativeRootActionCount;
  const capturedCount=row.publicRootActionCount;
  const abortStatus=row.nativeAbortProvenance?.acceptedRootLedgerStatus??null;
  if(!Number.isInteger(rootLimit)||rootLimit<1||
     !Number.isInteger(expectedCount)||expectedCount<0||
     expectedCount>rootLimit)
    return {id:row.id,verdict:'FAIL',reason:'invalid-native-root-count',
      expectedCount,capturedCount,abortStatus};
  if(actions===null||actions===undefined){
    return {id:row.id,verdict:'UNRESOLVED',
      reason:'accepted-actions-absent-from-downloadable-receipt',
      expectedCount,capturedCount,abortStatus,
      originalAbortCustodyClaim:abortStatus};
  }
  if(!Array.isArray(actions)||!Number.isInteger(capturedCount))
    return {id:row.id,verdict:'FAIL',reason:'malformed-public-root-ledger',
      expectedCount,capturedCount,abortStatus};
  const ordinalChain=actions.every((a,i)=>
    Number.isInteger(a?.actionOrdinal)&&a.actionOrdinal===i);
  const truncated=row.publicRootActionsTruncated===true;
  const capturedLengthMatches=truncated?
    capturedCount>=actions.length:capturedCount===actions.length;
  const nativeCountMatches=capturedCount===expectedCount;
  const computedSha256=createHash('sha256')
    .update(JSON.stringify(actions)).digest('hex');
  const reported=row.publicRootLedgerSha256Reported??null;
  const hashCheck=reported===null?'UNRESOLVED':
    computedSha256===reported?'PASS':'FAIL';
  const base=ordinalChain&&capturedLengthMatches&&nativeCountMatches?
    'PASS':'FAIL';
  const verdict=worstVerdict([base,truncated?'UNRESOLVED':'PASS',hashCheck]);
  return {id:row.id,verdict,reason:verdict==='PASS'?
    'all-public-accepted-roots-and-hash-reproduced':
    'public-root-custody-incomplete-or-inconsistent',
    expectedCount,capturedCount,downloadedCount:actions.length,
    truncated,ordinalChain,capturedLengthMatches,nativeCountMatches,
    computedSha256,reportedSha256:reported,hashCheck,abortStatus};
}

/**
 * Compare source-only initial deal fingerprints across candidate contexts;
 * different contender 60s may produce different whole-game deal hashes.
 * @param {object[]} attempts
 * @returns {object}
 */
function auditSourceDealPairing(attempts){
  const groups=new Map();
  for(const row of attempts){
    const match=/^(\d+:\d+:[A-Za-z]+):/.exec(row.id??'');
    if(!match)return {verdict:'UNRESOLVED',reason:'trial-group-unknown'};
    if(!groups.has(match[1]))groups.set(match[1],[]);
    groups.get(match[1]).push(row);
  }
  const pairs=[...groups].map(([group,rows])=>{
    const digests=rows.map(row=>row.sourceDealFingerprint??null);
    const starters=rows.map(row=>row.actualStarterSeat??null);
    const fingerprintStatus=rows.length!==2||digests.some(d=>!d)?'UNRESOLVED':
      new Set(digests).size===1?'PASS':'FAIL';
    const starterStatus=rows.length!==2||starters.some(s=>s===null)?'UNRESOLVED':
      new Set(starters).size===1?'PASS':'FAIL';
    return {group,count:rows.length,fingerprintStatus,starterStatus,
      verdict:worstVerdict([fingerprintStatus,starterStatus]),
      sourceFingerprint:digests.every(d=>d===digests[0])?digests[0]:null};
  });
  return {verdict:worstVerdict(pairs.map(pair=>pair.verdict)),pairs};
}

/**
 * Re-audit an actual selected-policy artifact as an independent consumer.
 * Native progress remains developmental even when custody tests pass.
 * @param {object} receipt
 * @returns {object}
 */
function auditIssue25Receipt(receipt){
  const manifest=receipt.selectedExecutingManifest;
  const registration=receipt.registration;
  const attempts=receipt.attempts;
  if(!manifest||!registration||!Array.isArray(attempts))
    return {schema:VERSION,evidenceVerdict:'FAIL',reason:'malformed-receipt'};
  const identity=auditAttemptIdentity(registration.ids,
    registration.actualReturnedIds,attempts.map(a=>a.id));
  const rawIdentity=attempts.every(row=>row.actualRawTrialId===row.id);
  const rootLimit=manifest.nativeRootActionLimit;
  const ledgers=attempts.map(row=>auditRootLedger(row,rootLimit));
  const sourceDeals=auditSourceDealPairing(attempts);
  const rootCustody=worstVerdict(ledgers.map(l=>l.verdict));
  const declaredFullLedger=receipt.gate?.fullUntruncatedPublicRootLedger;
  const unsupportedFullLedgerClaim=declaredFullLedger==='PASS'&&
    rootCustody!=='PASS';
  const declaredHashGate=receipt.gate?.observedPublicRootLedgerDigest;
  const unsupportedHashClaim=declaredHashGate==='PASS'&&
    ledgers.some(l=>l.hashCheck!=='PASS');
  const abstainsFromCompetition=manifest.releaseQualified===false&&
    manifest.competitiveGamesQualified===0&&
    receipt.reportedCompetitiveGames===0&&
    receipt.gate?.overall==='FAIL-development-only';
  const contract=unsupportedFullLedgerClaim||unsupportedHashClaim||
    !abstainsFromCompetition||!rawIdentity?'FAIL':'PASS';
  return {
    schema:VERSION,receiptSchema:receipt.schema,
    manifestVersion:manifest.version,
    identity:{...identity,rawRowIdentityMatches:rawIdentity},
    sourceDeals,ledgers,rootCustody,contract,
    declaredFullLedger:declaredFullLedger??null,
    declaredHashGate:declaredHashGate??null,
    acceptedRootCustodyFromAbortClaimsIsIndependentOfArchive:true,
    evidenceVerdict:worstVerdict([
      identity.verdict,rawIdentity?'PASS':'FAIL',
      sourceDeals.verdict,rootCustody,contract
    ]),
    competitiveGameQualification:'FAIL-development-only',
    competitiveGamesAdmitted:0
  };
}

module.exports={VERSION,worstVerdict,auditAttemptIdentity,
  auditRootLedger,auditSourceDealPairing,auditIssue25Receipt};
