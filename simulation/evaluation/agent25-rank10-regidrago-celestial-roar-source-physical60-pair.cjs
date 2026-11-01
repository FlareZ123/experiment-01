'use strict';
const assert=require('node:assert/strict');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {toPrintedManifest}=require('./agent25-dhelmise-v2-native-three-lock-smoke.cjs');
const {withCorrectedHnsDiscardAbilityCount}=require(
  '../twinleaf/agent25-hns-discard-ability-lock-paper-hook.cjs');
const {withCorrectedCelestialRoarCustody,VERSION,PIN}=require(
  '../twinleaf/agent25-regidrago-v-celestial-roar-card-custody-hook.cjs');
const base=require('../../results/als/registrations/agent25-dhelmise-v2-native-three-lock-smoke-20261101.json');
const prereg=require('../../results/als/registrations/agent25-rank10-regidrago-celestial-roar-custody-hook-20261101.json');

/** Exact source rank10 and exact candidate seat1 frozen same-source world. */
function study(){
  assert.equal(prereg.enginePin,PIN);
  assert.equal(prereg.seed,base.seedsByRank[10]);
  const prepared=planAichi({label:'agent25-Regidrago-source-Celestial-Roar-physical-custody',player:'Agent25-exact-v2',archetype:'HNS',cards:toPrintedManifest()},base.options);
  const source=prepared.opponents.find(x=>x.rank===10);
  assert.ok(source?.status==='ready');
  assert.ok(prepared.candidate.cards?.length===60);
  const records=[];
  for(const donorCompressor of [false,true]){
    for(const fixedCelestialRoar of [false,true]){
      const mode=(donorCompressor?'owner-compressor':'standard-policy')+'/'+
        (fixedCelestialRoar?'fixed-Celestial-Roar':'pinned-original');
      const request={
        deckA:source.cards,deckB:prepared.candidate.cards,
        seed:prereg.seed,maxActions:prereg.maximumRootActions,
        label:prereg.version+':'+mode,
        ...base.options,capturePublicAttackTransitions:true,
        captureDecisionTrace:true,captureStartingBoard:true,
        ...(donorCompressor?{dhelmiseDonorCompressorSeat:1}:{})
      };
      try{
        const hns=withCorrectedHnsDiscardAbilityCount(()=>{
          if(fixedCelestialRoar)
            return withCorrectedCelestialRoarCustody(()=>runMatch(request));
          return {result:runMatch(request),audit:null};
        });
        const run=hns.result;
        const game=run.result;
        records.push({mode,donorCompressor,fixedCelestialRoar,
          status:game.finished?'untimed-native-terminal':'120-native-root-cap',
          nativeActions:game.actions,turns:game.turns,
          sourceNativeWinner:game.winner,
          prizesRemaining:game.prizesRemaining,
          physicalZoneIntegrity:game.physicalZoneIntegrity,
          correctionAudit:run.audit,
          hnsAudit:hns.audit,
          originalNativeCardOrderedSha:prepared.candidateNativeOrderedSha256,
          startingBoard:game.initialBoardAtFirstTurn??null,
          attackDeclarations:game.attackDeclarationTrace?.filter(e=>
            e.attackName==='Celestial Roar'||e.attackName==='Vengeful Anchor')??[],
          firstPublicAttackTransitions:(game.publicAttackTransitions??[])
            .filter(e=>e.declarations?.some(a=>a.attackName==='Celestial Roar'))
            .slice(0,3),
          rootRelevantWindows:(game.rootActionLedger??[])
            .filter(x=>x.attack==='Celestial Roar'||x.pendingPrompt==='AttachEnergyPrompt')
            .slice(0,20),competitiveQualified:false});
      }catch(error){
        records.push({mode,donorCompressor,fixedCelestialRoar,
          status:'native-exception',code:error.code??null,
          message:String(error.message||error),
          rootPhysicalWitness:error.physicalConservationWitness??null,
          competitiveQualified:false});
      }
    }
  }
  assert.equal(records.length,4);
  return {version:prereg.version,pin:PIN,hookVersion:VERSION,
    sourceRank:10,candidateSeat:1,seed:prereg.seed,
    fixedBothPrinted60s:true,records,
    originallyRegisteredPhysicalGateEnabled:true,
    syntheticGame:false,competitiveQualifiedGames:0};
}
module.exports={study};
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
