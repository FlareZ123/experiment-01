'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');
const {withCanonicalActorOnlyPolicy} =
  require('../evaluation/agent7-canonical-actor-composition.cjs');
const {withNativeCampingGearAfterPass} =
  require('./agent12-native-campinggear-after-pass.cjs');
const {attestNativeTurnClosureLineage} =
  require('../evaluation/agent12-native-turn-closure-lineage.cjs');

const registration = require('../../results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json');
const protocol = require('../../results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json');
const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SOURCE_SEAT=1;
const REPLAY_ID='6:0:A:champion-reference';
const SEED=registration.seeds['6'].A[0];

/**
 * Small same-deal development control vs owner-only nonattack search action.
 * It uses the original source seed, exact source and reference 60s, and only
 * 50 accepted native actions; it is NOT a new prospective trial and does not
 * claim a replay identical to the original 260-root canonical scout.
 *
 * @returns {object} Both real-Store arms with all errors retained.
 */
function main(){
  assert.equal(SEED,1460221882);
  assert.equal(registration.enginePin,ENGINE_PIN);
  const prepared=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  const source=prepared.opponents.find(o=>o.rank===6);
  assert.equal(prepared.candidate.cards.length,60);
  assert.equal(source.cards.length,60);
  const request={deckA:prepared.candidate.cards,deckB:source.cards,
    seed:SEED,maxActions:50,
    ...protocol.frozenFlags,
    captureInitialSourceDealFingerprintSeat:SOURCE_SEAT,
    captureInitialFullPhysicalDeal:true,
    captureFinalPublicBoard:true,
    label:'agent12-retrospective-source-held-gear-native-'+REPLAY_ID};
  function execute(treatment){
    const run=()=>runMatch(request);
    const originalPolicy=()=>withCanonicalActorOnlyPolicy(
      treatment?
        ()=>withNativeCampingGearAfterPass(run,{sourceSeat:SOURCE_SEAT}):
        run,
      {},{ownerSingleSearch:true,genericFallbackAttribution:true,
        actorHandDiscard:true,actorChoosePokemon:true});
    try{
      const res=originalPolicy();
      const offered=treatment?res.result.audit:null;
      const game=treatment?res.result.result:res.result;
      const lineage=attestNativeTurnClosureLineage(game.rootActionLedger);
      const receipt={status:'completed-native-development',
        firstTurnSeat:game.firstTurnSlot,
        verifiedFirstTurn:game.verifiedByDrawLog,
        actions:game.actions,finished:game.finished,
        resultMarker:game.winner,rootCount:game.rootActionLedger.length,
        sourceDealFingerprint:game.initialSourceDealFingerprint?.digestSha256??null,
        fullPhysicalDealFingerprint:game.initialFullPhysicalDealFingerprint?.digestSha256??null,
        sourceFirstRoots:game.rootActionLedger.filter(x=>
          x.playerSlot===SOURCE_SEAT&&x.turnBefore===1&&
          x.action!=='ResolvePromptAction')
          .map(x=>({ordinal:x.actionOrdinal,action:x.action,
            card:x.card??null})),
        sourceFirstTerminal:lineage.closures.find(x=>
          x.turnBefore===1&&x.actorSeat===SOURCE_SEAT)??null,
        terminalPromptTypeCounts:lineage.counts.promptTerminalTypes,
        gearAudit:offered,qualifiedForCompetitiveInference:false};
      return receipt;
    }catch(e){
      return {status:'native-development-error',message:String(e?.message||e),
        stack:String(e?.stack||''),qualifiedForCompetitiveInference:false};
    }
  }
  const baseline=execute(false),withGear=execute(true);
  const bothPhysicalSame=baseline.status==='completed-native-development'&&
    withGear.status==='completed-native-development'&&
    baseline.sourceDealFingerprint===withGear.sourceDealFingerprint&&
    baseline.fullPhysicalDealFingerprint===withGear.fullPhysicalDealFingerprint;
  const report={schema:'agent12-original-rank6-gear-pass-native-v1',
    sourceTrial:REPLAY_ID,sourceSeed:SEED,sourceSeat:SOURCE_SEAT,
    enginePin:ENGINE_PIN,candidateDeck:'original rank1 published 60',
    sourceDeck:'original rank6 published 60',
    originalScoutReplayedExactly:false,retrospective:true,
    bothPhysicalSame,baseline,withGear,
    improvementInGameWinRateEstablished:false,
    competitiveQualifiedGames:0};
  if(baseline.status==='completed-native-development'&&
     withGear.status==='completed-native-development'){
    assert.equal(bothPhysicalSame,true,
      'The treatment changed initial physical source/opponent deal');
  }
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report;
}
if(require.main===module)main();
module.exports={main};
