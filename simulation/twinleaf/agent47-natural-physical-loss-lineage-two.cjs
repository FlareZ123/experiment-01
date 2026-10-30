'use strict';
const assert=require('node:assert/strict');
const {registration}=require('./agent47-rank20-apex-natural-audit.cjs');
const {initializeCards,runMatch}=require('./headless.cjs');
const {withActorHandDiscard}=require('./agent47-actor-hand-discard.cjs');
const {withMinimumAttachEnergySelection}=
 require('./agent47-minimum-attach-energy-hook.cjs');
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

const CASES=Object.freeze([
 {opponentRank:11,seed:1847000101,sourceSeat:1,originalAnomalyOrdinal:52},
 {opponentRank:11,seed:1847000103,sourceSeat:1,originalAnomalyOrdinal:98}
]);

/**
 * Purely observational root-lineage reproduction, selected retrospectively
 * after the full fixed 24-deal physical-60 census. Two pre-identified cases
 * only; never use these as an unbiased error rate or competitive sample.
 */
function runOne(c,byRank){
 const source=byRank.get(20).cardIds,other=byRank.get(11).cardIds;
 const req={
  deckA:other,deckB:source,
  seed:c.seed,maxActions:160,
  doubleDragonRecovery:true,strictPromptValidation:true,
  isolatePolicyRandomness:true,captureDecisionTrace:true,
  captureInitialFullPhysicalDeal:true,
  captureInitialSourceDealFingerprintSeat:1,
  capturePhysicalZoneIntegrity:true,
  label:'agent47-observation-only-native-physical-loss-lineage-'+c.seed
 };
 const fixed=withMinimumAttachEnergySelection(()=>
   withActorHandDiscard(()=>runMatch(req),{},{
    apexPayloadDiscard:false
   }));
 const game=fixed.result.result,first=game.physicalZoneIntegrity.firstSettledRootAnomaly;
 assert.ok(first,'Previously observed physical-60 failure must reproduce');
 assert.equal(first.actionOrdinal,c.originalAnomalyOrdinal);
 assert.deepEqual(first.ownership.canonicalCounts,[60,59]);
 const failingRoot=game.rootActionLedger.find(r=>
  r.actionOrdinal===first.actionOrdinal-1);
 assert.equal(failingRoot?.action,'ResolvePromptAction');
 const origin=game.rootActionLedger.find(r=>
  r.actionOrdinal===failingRoot.initiatingRootActionOrdinal);
 const priorWindow=game.rootActionLedger.filter(r=>
  r.actionOrdinal>=failingRoot.actionOrdinal-10&&
  r.actionOrdinal<=failingRoot.actionOrdinal+2);
 const outgoing=game.attackDeclarationTrace.filter(a=>
  (a.actionOrdinal??-1)>=failingRoot.actionOrdinal-12&&
  (a.actionOrdinal??-1)<=failingRoot.actionOrdinal+2);
 return {
  case:c,originalPhysicalDealHash:
   game.initialFullPhysicalDealFingerprint?.digestSha256??null,
  firstAnomaly:first,attackOriginRoot:origin??null,
  rootAtFailure:failingRoot,rootWindow:priorWindow,
  attackLogWindow:outgoing,
  nativeSettledRoots:game.physicalZoneIntegrity.settledRootsChecked,
  nativeAnomalousRoots:game.physicalZoneIntegrity.settledRootsWithAnomaly,
  botMinimumCorrectionProposals:fixed.audit.proposedCorrections,
  gameFinished:game.finished,
  qualifiedGame:false
 };
}

function main(){
 initializeCards();
 const {byRank}=registration();
 const rows=CASES.map(c=>runOne(c,byRank));
 return{
  schema:'agent47-natural-source20-first-59-card-native-root-lineage-2-v1',
  pinnedTwinleaf:PIN,
  sampledCasesAfterFull24Results:true,sourcePrintRank:20,
  cases:rows,competitiveQualifiedGames:0,
  caveat:'Retrospective exact reproduction of two selected losses only. The full 24-cell denominator is independently archived; initiatingRootActionOrdinal is native observation not absolute causal proof without ruling out concurrent effects or prompt/turn sequencing differences.'
 };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={CASES,runOne,main};
