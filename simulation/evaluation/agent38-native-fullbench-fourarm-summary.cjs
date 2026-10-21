'use strict';

const {createHash} = require('node:crypto');

const VERSION='agent38-public-fullbench-native-fourarm-summary-v1';

/** @param {unknown} value @returns {string} */
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Summarize genuine Store public-action evidence without exposing hidden
 * hand/deck/Prize positions or restating an unqualified win claim.
 * @param {object} archive Canonical runner output.
 * @returns {object} Bounded projection suitable for archived CI log comparison.
 */
function summarizePublicFullBenchReplay(archive) {
  const rows=archive.rows.map(row=>{
    const roots=Array.isArray(row.rootActionLedger)?row.rootActionLedger:[];
    const prefix=n=>roots.filter(root=>root.actionOrdinal<=n);
    const focal=roots.filter(root=>
      Number.isSafeInteger(root.actionOrdinal)&&
      root.actionOrdinal>=244&&root.actionOrdinal<=249);
    return {
      trial:row.trial?.id??null,
      rank:row.trial?.rank??null,
      candidateId:row.trial?.candidateId??null,
      status:row.status??(row.finished?'engine-finished':'native-censored'),
      paperHookEnabled:row.paperFullBenchCallForFamilyOptIn??
        archive.paperFullBenchCallForFamilyOptIn,
      skippedSearches:row.paperFullBenchCallForFamilyAudit?.skippedSearches??null,
      sourceDealDigest:row.sourceDealFingerprint??null,
      verifiedFirstTurn:row.verifiedFirstTurn??null,
      physicalStarter:row.actualStarterSeat??null,
      actionCount:row.actionCount??null,
      rootActionCount:row.rootActionCount??roots.length,
      through245Sha256:roots.length?digest(prefix(245)):null,
      through246Sha256:roots.length?digest(prefix(246)):null,
      roots244to249:focal.map(root=>({
        ordinal:root.actionOrdinal,turn:root.turnBefore,
        playerSlot:root.playerSlot,action:root.action,
        attack:root.attack??null,card:root.card??null
      })),
      sourceAttackDeclarations:row.attackDeclarations?.source??null,
      candidateAttackDeclarations:row.attackDeclarations?.candidate??null,
      nativeFinished:row.finished??false,
      nativeEndReason:row.endReason??null,
      nativeWinner:row.finished?row.winner??null:null,
      finalPrizes:row.finalPrizes??null,
      errorHead:row.error?String(row.error).split('\n').slice(0,2).join(' | '):null,
      competitiveQualified:false
    };
  });
  return {version:VERSION,enginePin:archive.enginePin,
    allDevelopmentOnly:true,competitiveQualifiedGames:0,
    paperHookEnabled:archive.paperFullBenchCallForFamilyOptIn,
    attempted:archive.attempted,errors:archive.errors,
    rows};
}

if(require.main===module){
  const fs=require('node:fs');
  const path=require('node:path');
  const filename=path.resolve(process.cwd(),process.argv[2]||
    'agent7-canonical-actor-fourarm.json');
  process.stdout.write('AGENT38_NATIVE_FULLBENCH_PUBLIC_REPLAY '+
    JSON.stringify(summarizePublicFullBenchReplay(
      JSON.parse(fs.readFileSync(filename,'utf8'))))+'\n');
}

module.exports={VERSION,summarizePublicFullBenchReplay};
