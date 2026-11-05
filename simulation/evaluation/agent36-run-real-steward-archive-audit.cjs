'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {inspect}=require('./agent46-issue25-steward-archive-audit.cjs');

const ROOT=path.resolve(__dirname,'../..');
const CASES=Object.freeze([
  Object.freeze({
    cohort:'v4',dir:'v4',
    bytes:140169,
    expectedSha256:'4301660d49f7308c2910b665d17a547f6f8ed7c189d8b8d2e7a669983d37386e'
  }),
  Object.freeze({
    cohort:'v5',dir:'v5',
    bytes:147651,
    expectedSha256:'22eacafb175bcc1ee365eeea3189c703c256f5555a8118dd68c988edda44cc17'
  })
]);

/**
 * Independently consume the exact immutable v4/v5 native artifacts downloaded
 * from their historical CI runs, with no new game simulation.
 * @param {string} [root] Existing checkout root.
 * @returns {object[]} Authenticated eight-arm read-only source-root censuses.
 */
function auditExisting(root=ROOT){
  return CASES.map(frozen=>{
    const prefix='issue25-steward-'+frozen.cohort;
    const dir=path.join(root,'archives',frozen.dir);
    const bytes=fs.readFileSync(path.join(dir,prefix+'.json'));
    const sidecar=fs.readFileSync(path.join(dir,prefix+'.sha256'),'utf8');
    assert.equal(bytes.length,frozen.bytes,'Published file-size witness drift: '+prefix);
    const found=inspect(bytes,sidecar,frozen.cohort);
    assert.equal(found.digest,frozen.expectedSha256,
      'Published historical native CI SHA-256 witness drift: '+prefix);
    assert.equal(found.integrity,'PASS-bounded-file-and-root-custody',
      prefix+': '+JSON.stringify(found.failures));
    assert.equal(found.registeredAttempts,8,prefix+': wrong original 8');
    assert.equal(found.returnedAttempts,8,prefix+': missing actual attempt');
    assert.equal(found.sourceAttackRoots,0,
      prefix+': selected historical source attack denominator changed');
    assert.equal(found.competitiveGamesQualified,0);
    return {
      cohort:frozen.cohort,
      authenticity:'published-CI-byte-digest-and-native-row-ledger-audited',
      archiveSha256:found.digest,
      nativeSourcePassRoots:found.sourcePassRoots,
      nativeSourceAttackRoots:found.sourceAttackRoots,
      nativeSourceNonPromptNonPassRoots:found.sourceNonPromptNonPassRoots,
      promptRootsBothSeats:found.bothSeatPromptRoots,
      dispositions:found.attempts.map(x=>({
        id:x.id,sourceSeat:x.sourceSeat,
        nativeRootCount:x.rootCount,disposition:x.disposition,
        sourcePassRoots:x.sourcePasses,
        sourceAttackRoots:x.sourceAttackRoots
      })),
      warnings:found.warnings,
      sourceOwnerOpportunityProven:false,
      matchedGameResultsQualified:0
    };
  });
}

if(require.main===module){
  process.stdout.write(JSON.stringify({
    schema:'agent36-steward-v4-v5-frozen-artifact-independent-custody-v1',
    actualArchivedSourceRuns:auditExisting(),
    qualification:'development-only',
    qualifiedCompetitiveGames:0
  })+'\n');
}

module.exports={CASES,auditExisting};
