'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const packet=JSON.parse(fs.readFileSync(
  'analysis-input/agent6-path-pressure-original14.json','utf8'));
assert.equal(packet.schema,
  'agent6-path-pressure-stadium-counter-original14-native-ab-v1');
const index=packet.treatmentFullNative.rows.findIndex(row=>
  row.trial?.id==='21:8010:A:champion-reference');
assert.ok(index>=0);
const a=packet.controlFullNative.rows[index];
const b=packet.treatmentFullNative.rows[index];
const audit=b.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
assert.equal(a.trial.id,b.trial.id);
const comparable=entry=>({
  index:entry.actionOrdinal,turnBefore:entry.turnBefore,turnAfter:entry.turnAfter,
  seat:entry.playerSlot,action:entry.action,
  card:entry.card??null,attack:entry.attack??null,
  ability:entry.ability??null
});
const A=a.rootActionLedger??[];
const B=b.rootActionLedger??[];
const firstDifference=Array.from({length:Math.min(A.length,B.length)},(_,i)=>i)
  .find(i=>JSON.stringify(comparable(A[i]))!==JSON.stringify(comparable(B[i])));
const excerpt=all=>all.filter((entry,i)=>
  firstDifference!==undefined&&i>=firstDifference-4&&i<=firstDifference+14)
  .map(comparable);
const receipt=audit?.nativeRootJoinReceipts;
const relevant=(receipt??[]).filter(row=>
  JSON.stringify(row).includes('play-path-underworld-stadium-counter')||
  JSON.stringify(row).includes('Sky Field'));
const summary={
  id:a.trial.id,physicalDealIdentical:
    JSON.stringify(a.fullPhysicalDealFingerprint)===
    JSON.stringify(b.fullPhysicalDealFingerprint),
  firstDifference:firstDifference??null,
  nativeControl:{winner:a.winner,finished:a.finished,
    actionCount:a.actionCount},
  nativeTreatment:{winner:b.winner,finished:b.finished,
    actionCount:b.actionCount},
  counterSelected:audit?.pathUnderworldStadiumCounterSelected??null,
  physicalCertifications:audit?.nativePhysicalConfirmedByIntent??null,
  nativeAcceptedByIntent:audit?.nativeRootAcceptances??null,
  controlAroundDifference:excerpt(A),
  treatmentAroundDifference:excerpt(B),
  stadiumRootWitnesses:relevant.slice(0,5),
  relevantReceiptKeys:receipt?.[0]?Object.keys(receipt[0]):[],
  selectedIntentCount:audit?.typedIntentCounts?.['play-path-underworld-stadium-counter']??null,
  rootCounts:{control:A.length,treatment:B.length}
};
process.stdout.write('AGENT6_PATH_RECOVERY_CAUSAL '+JSON.stringify(summary)+'\n');
