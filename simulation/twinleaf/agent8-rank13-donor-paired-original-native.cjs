'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {observeRank13VstarOpportunity}=
  require('./agent8-rank13-vstar-owner-opportunity.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('../evaluation/agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=
  require('./agent34-actor-only-root-policy.cjs');
const {source13QuickBallActorAdapters}=
  require('./agent8-rank13-donor-actor-adapters.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION_PATH=path.join(ROOT,
  'results/aichi-2026/registrations/agent8-rank13-donor-native-paired-20261102.json');
const MANIFEST_PATH=path.join(ROOT,'results/aichi-2026/full-decklists.json');
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/** @returns {{registration:object,byRank:Map<number,object>}} */
function registration(){
  const registered=JSON.parse(fs.readFileSync(REGISTRATION_PATH,'utf8'));
  assert.equal(registered.schema,
    'agent8-rank13-regidrago-quickball-donor-native-paired-original-v1');
  assert.equal(registered.enginePin,PIN);
  assert.equal(registered.trialMatrix.length,8);
  const manifest=resolveManifestFile(MANIFEST_PATH,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const byRank=new Map(manifest.decks.map(deck=>[deck.rank,deck]));
  for(const rank of [1,13]){
    const deck=byRank.get(rank);
    assert.ok(deck?.playableUnderEngine,'Source not engine-mapped: '+rank);
    assert.equal(deck.cardIds.length,60);
  }
  const seen=new Set();
  for(const trial of registered.trialMatrix){
    assert.ok(trial.sourceSeat===0||trial.sourceSeat===1);
    assert.ok(Number.isSafeInteger(trial.seed)&&trial.seed>=0&&
      trial.seed<=0xffffffff);
    assert.ok(!seen.has(trial.seed),'Registered seed repeated');
    seen.add(trial.seed);
  }
  return {registered,byRank};
}

/**
 * Both arms receive exactly the same identical print-only owner prompt
 * selectors and canonical actor composition. Only the root donor offer
 * changes; the source rank13 physical seat alone may receive it.
 *
 * @param {{sourceSeat:0|1,seed:number}} trial
 * @param {Map<number,object>} byRank
 * @param {boolean} donorRootEnabled
 * @returns {object}
 */
function executeOne(trial,byRank,donorRootEnabled,naturalEvolutionEnabled=false){
  const source=byRank.get(13).cardIds,opponent=byRank.get(1).cardIds;
  const sourceSeat=trial.sourceSeat;
  const request={
    deckA:sourceSeat===0?source:opponent,
    deckB:sourceSeat===1?source:opponent,
    seed:trial.seed,maxActions:160,
    doubleDragonRecovery:true,strictPromptValidation:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    capturePhysicalZoneIntegrity:true,captureOriginalOwnerIntegrity:true,
    captureInitialSourceDealFingerprintSeat:sourceSeat,
    captureInitialFullPhysicalDeal:true,
    label:'agent8-original-rank13-donor-'+
      trial.seed+'-'+sourceSeat+'-'+Number(donorRootEnabled)
  };
  const {Stage}=require(path.join(ROOT,
    'vendor/twinleaf/ptcg-server/output/game/store/card/card-types'));
  const ownerVstarObservations=[];
  const ownerVstarKeys=new Set();
  const observedRoot=(state,seat)=>{
    const actor=actorObservation(state,seat);
    if(seat===sourceSeat){
      const root=observeRank13VstarOpportunity(actor,Stage);
      if(root.heldVstarCount>0||root.inPlayRegidragoVCount>0){
        const key=JSON.stringify(root);
        if(!ownerVstarKeys.has(key)){
          ownerVstarKeys.add(key);
          if(ownerVstarObservations.length<100)
            ownerVstarObservations.push(root);
        }
      }
    }
    return actor;
  };
  const adapters={
    root:work=>withActorOnlyRootPolicy(work,{ 
      observe:observedRoot,
      regidragoDonorQuickBallRoot:donorRootEnabled,
      regidragoDonorQuickBallOwnerSeat:sourceSeat,
      naturalEvolutionRoot:naturalEvolutionEnabled
    }),
    ...source13QuickBallActorAdapters(sourceSeat)
  };
  try{
    const actual=withCanonicalActorOnlyPolicy(()=>runMatch(request),
      adapters,{ownerSingleSearch:true,actorHandDiscard:true});
    const game=actual.result,components=actual.audit.detailedComponentAudits;
    assert.equal(game.seed,trial.seed);
    assert.equal(game.engine,'twinleafgg/'+PIN);
    assert.equal(game.verifiedByDrawLog,true);
    const root=components.root,payment=components.handDiscard;
    const search=components.ownerSearch;
    const trace=game.decisionTrace??[];
    const opponentRootActions=trace.filter(row=>
      row.playerSlot!==sourceSeat&&
      ['PlayCardAction','AttackAction','PassTurnAction'].includes(row.action));
    const sourceAttacks=trace.filter(row=>
      row.playerSlot===sourceSeat&&row.action==='AttackAction');
    const donorTurns=root.ownerRootIntents.filter(row=>
      row.seat===sourceSeat&&row.intent?.source==='rank13-dragon-donor')
      .map(row=>row.globalTurn);
    const donorTurn=donorTurns.length>0?Math.min(...donorTurns):null;
    const postDonorOpponentRoots=donorTurn===null?[]:
      opponentRootActions.filter(row=>row.turnBefore>donorTurn);
    const postDonorSourceAttacks=donorTurn===null?[]:
      sourceAttacks.filter(row=>row.turnBefore>donorTurn);
    const publicAcceptedActions=trace.filter(row=>
      ['PlayCardAction','AttackAction','RetreatAction',
        'PassTurnAction','UseStadiumAction'].includes(row.action))
      .map(row=>({actionOrdinal:row.actionOrdinal,
        turn:row.turnBefore,seat:row.playerSlot,
        action:row.action,card:row.card??null}));
    const sourceAttackDetails=(game.attackTrace??[])
      .filter(row=>row.seat===sourceSeat)
      .map(row=>({turn:row.turn,attacker:row.activePokemon,
        attack:row.attack,prizesBefore:row.prizeCountBefore,
        prizesAfter:row.prizeCountAfter}));
    const digest=createHash('sha256').update(JSON.stringify(
      game.decisionTrace??[])).digest('hex');
    return{
      status:'native-returned',donorRootEnabled,naturalEvolutionEnabled,
      actualFirstSeat:game.firstTurnSlot,
      gameFinished:game.finished===true,
      nativeActionCount:game.actions,
      turns:game.turns,
      sourceDealSha256:
        game.initialSourceDealFingerprint?.digestSha256??null,
      fullPhysicalDealSha256:
        game.initialFullPhysicalDealFingerprint?.digestSha256??null,
      gameDecisionTraceSha256:digest,
      publicAcceptedActions,
      sourceAttackDetails,
      physicalCustody:game.physicalZoneIntegrity?{
        observedRoots:game.physicalZoneIntegrity.rootActionsChecked,
        abnormalRootActions:game.physicalZoneIntegrity.actionsWithAnomaly,
        abnormalSettledRoots:game.physicalZoneIntegrity.settledRootsWithAnomaly,
        firstSettledAnomaly:game.physicalZoneIntegrity.firstSettledRootAnomaly?{
          actionOrdinal:game.physicalZoneIntegrity.firstSettledRootAnomaly.actionOrdinal,
          turn:game.physicalZoneIntegrity.firstSettledRootAnomaly.turn,
          action:game.physicalZoneIntegrity.firstSettledRootAnomaly.actionType
        }:null
      }:null,
      sourceCopiedAttackSelections:(components.chooseAttack?.selections??[])
        .filter(choice=>choice.seat===sourceSeat),
      sourceOwnerVstarObservations:ownerVstarObservations,
      sourceOwnerEligibleVstarRootTurns:[...new Set(ownerVstarObservations
        .filter(row=>row.ordinaryVstarRootLegal).map(row=>row.turn))],
      deckHashes:game.deckHashes,
      winner:game.finished?game.winner:null,
      endReason:game.endReason,
      prizesRemaining:game.prizesRemaining,
      root:{
        totalActorRoots:root.selectedRootDecisions,
        acceptedActorRoots:root.acceptedActorRoots,
        rejectedActorRoots:root.rejectedActorRoots,
        donorIntents:root.regidragoDonorQuickBallIntentCount,
        donorNativeAccepted:root.regidragoDonorQuickBallNativeAccepted,
        donorNativeRejected:root.regidragoDonorQuickBallNativeRejected,
        donorIntentsSample:root.ownerRootIntents.filter(row=>
          row.intent?.source==='rank13-dragon-donor').slice(0,8),
        donorNativeAcceptanceSample:root.nativeRootAcceptances.filter(row=>
          row.intent?.source==='rank13-dragon-donor').map(row=>({
            seat:row.seat,turn:row.globalTurn,
            kind:row.kind,accepted:row.accepted,
            nativePhysicalEffect:row.nativePhysicalEffect,
            publicZonesChanged:row.publicZonesChanged
          })).slice(0,8)
      },
      payment:{
        nativeAccepted:payment.accepted,
        sourceDonorPaymentProposals:payment.sourceDonorPaymentProposals,
        nativeUnqualifiedFallbacks:payment.nativeFallbacks
      },
      search:{
        nativeAccepted:search.accepted,
        sourceRegidragoSearchProposals:search.sourceRegidragoSearchProposals,
        nativeUnqualifiedFallbacks:search.nativeFallbacks
      },
      sourceAttacks:sourceAttacks.map(row=>({
        turn:row.turnBefore,
        action:row.action,
        initiatingRootActionOrdinal:row.initiatingRootActionOrdinal??null
      })).slice(0,8),
      opponentFollowUp:opponentRootActions.map(row=>({
        turn:row.turnBefore,action:row.action,
        card:row.card??null
      })).slice(0,8),
      sourceAttackCount:sourceAttacks.length,
      sourceNativeEvolutionAcceptances:root.nativeRootAcceptances.filter(row=>
        row.seat===sourceSeat&&row.kind==='evolve-pokemon'&&row.accepted)
        .map(row=>({turn:row.globalTurn,printing:row.intent?.printing??null,
          nativePhysicalEffect:row.nativePhysicalEffect})),
      opponentRootCount:opponentRootActions.length,
      postDonorContinuation:{
        firstDonorTurn:donorTurn,
        followingOpponentAcceptedRootCount:postDonorOpponentRoots.length,
        firstOpponentAcceptedRoot:postDonorOpponentRoots[0]?{
          turn:postDonorOpponentRoots[0].turnBefore,
          action:postDonorOpponentRoots[0].action,
          card:postDonorOpponentRoots[0].card??null
        }:null,
        laterSourceAttackDeclarations:postDonorSourceAttacks.length
      },
      competitiveGameQualified:false
    };
  }catch(error){
    return{status:'native-aborted',donorRootEnabled,naturalEvolutionEnabled,
      error:String(error?.stack??error).slice(0,1100),
      censored:true,competitiveGameQualified:false};
  }
}

/** Run all independently registered source and seat attempts without omissions. */
function main(){
  initializeCards();
  const {registered,byRank}=registration();
  const rows=registered.trialMatrix.map(trial=>{
    const control=executeOne(trial,byRank,false);
    const treatment=executeOne(trial,byRank,true);
    const matched=control.status==='native-returned'&&
      treatment.status==='native-returned'&&
      control.sourceDealSha256!==null&&
      control.sourceDealSha256===treatment.sourceDealSha256&&
      control.fullPhysicalDealSha256!==null&&
      control.fullPhysicalDealSha256===treatment.fullPhysicalDealSha256;
    const left=control.publicAcceptedActions??[];
    const right=treatment.publicAcceptedActions??[];
    const discrepancy=Array.from({length:Math.max(left.length,right.length)},
      (_,i)=>i).find(i=>JSON.stringify(left[i]??null)!==
        JSON.stringify(right[i]??null));
    const firstPublicActionDifference=discrepancy===undefined?null:{
      actionIndex:discrepancy,
      control:left[discrepancy]??null,
      treatment:right[discrepancy]??null
    };
    return {trial,control,treatment,
      matchedInitialSourceAndFullPhysicalDeal:matched,
      firstPublicActionDifference,
      competitiveQualifiedGames:0};
  });
  const counts={
    registeredSourceDeals:rows.length,
    nativeGameAttempts:rows.length*2,
    bothNativeReturned:rows.filter(row=>
      row.control.status==='native-returned'&&
      row.treatment.status==='native-returned').length,
    initialDealPairsVerified:rows.filter(row=>
      row.matchedInitialSourceAndFullPhysicalDeal===true).length,
    nativeAbortArms:rows.reduce((n,row)=>
      n+(row.control.status==='native-aborted'?1:0)+
      (row.treatment.status==='native-aborted'?1:0),0),
    treatmentDonorIntents:rows.reduce((n,row)=>
      n+(row.treatment.root?.donorIntents??0),0),
    treatmentDonorNativeAccepted:rows.reduce((n,row)=>
      n+(row.treatment.root?.donorNativeAccepted??0),0),
    donorPaymentProposalsBothArms:rows.reduce((n,row)=>
      n+(row.control.payment?.sourceDonorPaymentProposals?.length??0)+
      (row.treatment.payment?.sourceDonorPaymentProposals?.length??0),0),
    donorSearchProposalsBothArms:rows.reduce((n,row)=>
      n+(row.control.search?.sourceRegidragoSearchProposals?.length??0)+
      (row.treatment.search?.sourceRegidragoSearchProposals?.length??0),0)
  };
  return {schema:registered.schema,sourceRank:13,opponentRank:1,
    exactlyOriginalSourceSixties:true,enginePin:PIN,
    maxActions:160,
    experimentRegistration:
      'results/aichi-2026/registrations/agent8-rank13-donor-native-paired-20261102.json',
    precommittedBeforeOutcomes:true,
    isolatedDifference:'source13 donor Quick Ball owner-root offer only',
    bothArmsShareSourceScopedDonorPaymentAndSearchPrompts:true,
    counts,rows,competitiveQualifiedGames:0,
    caveat:'Native seeded original-60 development games with simplified and generic-fallback actor policy. No paper tournament clock or strong opponent policy. Outcomes do not qualify for a competitive win rate.'};
}
/**
 * Exclusive temp-write and atomic rename for a single CI-owned report.
 * @param {object} report
 * @param {string} filename
 */
function writeRegisteredReport(report,filename){
  const lock=filename+'.lock',temporary=filename+'.'+process.pid+'.tmp';
  const descriptor=fs.openSync(lock,'wx');
  try{
    fs.writeFileSync(temporary,JSON.stringify(report,null,2)+'\n',{
      flag:'wx',encoding:'utf8'
    });
    fs.renameSync(temporary,filename);
  }finally{
    if(fs.existsSync(temporary))fs.unlinkSync(temporary);
    fs.closeSync(descriptor);
    fs.unlinkSync(lock);
  }
}
if(require.main===module){
  const report=main();
  if(process.env.AGENT8_RANK13_RESULT_JSON)
    writeRegisteredReport(report,process.env.AGENT8_RANK13_RESULT_JSON);
  console.log('AGENT8_RANK13_DONOR_NATIVE_PAIRED_SUMMARY',
    JSON.stringify({schema:report.schema,counts:report.counts}));
  if(!process.env.AGENT8_RANK13_RESULT_JSON)
    process.stdout.write(JSON.stringify(report,null,2)+'\n');
}
module.exports={registration,executeOne,main,writeRegisteredReport};
