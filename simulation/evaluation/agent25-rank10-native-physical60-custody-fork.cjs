'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {toPrintedManifest}=require('./agent25-dhelmise-v2-native-three-lock-smoke.cjs');
const {withCorrectedHnsDiscardAbilityCount,pin}=
  require('../twinleaf/agent25-hns-discard-ability-lock-paper-hook.cjs');
const frozen=require('../../results/als/registrations/agent25-dhelmise-v2-native-three-lock-smoke-20261101.json');
const fork=require('../../results/als/registrations/agent25-rank10-native-physical60-custody-fork-20261101.json');

/**
 * Return forensic data only from actual completed native Store roots. Continue
 * past the first failed physical-zone gate solely to locate the initiating
 * misplacement and gather its public context. No terminal qualifies.
 */
function study(){
  assert.equal(pin,fork.enginePin);
  assert.equal(fork.sourceRank,10);
  assert.equal(fork.candidateSeat,1);
  assert.equal(fork.seed,frozen.seedsByRank[10]);
  const root=path.resolve(__dirname,'../..');
  const roster=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  assert.ok(roster.decks.find(d=>d.rank===10));
  const prepared=planAichi({
    label:'agent25-rank10-custody-forensic-fixed60',player:'Agent25 challenger',
    archetype:'Dhelmise HNS',cards:toPrintedManifest()
  },frozen.options);
  assert.ok(prepared.candidate.cards?.length===60);
  const opponent=prepared.opponents.find(d=>d.rank===10);
  assert.equal(opponent?.status,'ready');
  const rows=[];
  for(const [name,donorCompressor] of
      [['baseline',false],['candidate-only-Dhelmise-Compressor',true]]){
    const request={
      deckA:opponent.cards,deckB:prepared.candidate.cards,
      seed:fork.seed,maxActions:fork.maxRootActions,
      label:fork.version+':'+name,
      ...frozen.options,
      ...fork.observationFlags,
      ...(donorCompressor?{dhelmiseDonorCompressorSeat:1}:{})
    };
    assert.equal(request.enforceSettledPhysicalZoneIntegrity,false);
    let record;
    try{
      const wrapped=withCorrectedHnsDiscardAbilityCount(()=>runMatch(request));
      const game=wrapped.result;
      const integrity=game.physicalZoneIntegrity;
      const first=integrity?.firstSettledRootAnomaly??null;
      const timeline=(game.rootActionLedger??[])
        .filter(row=>first&&Math.abs(row.actionOrdinal-first.actionOrdinal)<=9)
        .map(row=>({
          ordinal:row.actionOrdinal,turn:row.turnBefore,
          seat:row.playerSlot,action:row.action,
          card:row.card??null,attack:row.attack??null,
          pendingPrompt:row.pendingPrompt??null,
          initiatingActionOrdinal:row.initiatingActionOrdinal??null
        }));
      record={name,status:'native-completed-with-failed-physics-observation',
        turns:game.turns,rootActions:game.actions,finished:game.finished,
        untrustedNativeWinner:game.winner,
        firstConservationViolation:first,
        otherPhysicalAnomalies: {
          settledRootsChecked:integrity?.settledRootsChecked,
          settledRootsWithAnomaly:integrity?.settledRootsWithAnomaly,
          firstAnomaly:integrity?.firstAnomaly??null
        },rootTimelineAroundFirstSettledAnomaly:timeline,
        rootLedgerLength:game.rootActionLedger?.length??null,
        publicAttackTransitions:(game.publicAttackTransitions??[])
          .filter(e=>first&&Math.abs(e.actionOrdinal-first.actionOrdinal)<=9)
          .map(e=>({
            ordinal:e.actionOrdinal,turn:e.turnBefore,
            player:e.triggerPlayerSlot,attackNames:e.declarations,
            pending:e.promptPendingAfter,settled:e.settled!==null
          })),
        hnsHookAudit:wrapped.audit,
        competitiveQualified:false};
    }catch(error){
      record={name,status:'native-exception',
        code:error.code??null,error:String(error.stack||error),
        originalPhysicalWitness:error.physicalConservationWitness??null,
        competitiveQualified:false};
    }
    rows.push(record);
  }
  assert.equal(rows.length,2);
  return {version:fork.version,enginePin:pin,
    originalSourceRank:fork.sourceRank,
    candidateSeat:fork.candidateSeat,seed:fork.seed,
    candidateNativeOrderedSha256:prepared.candidateNativeOrderedSha256,
    records:rows,strictPhysicalGateDisabledForForensics:true,
    allNativeTerminalsInvalidAfterFirstSettledAnomaly:true,
    competitivelyQualifiedGames:0};
}
module.exports={study};
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
