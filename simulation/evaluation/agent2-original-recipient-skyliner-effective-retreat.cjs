'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
const {withCanonicalActorOnlyPolicy}=require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withNativePaperSupporterDiscipline}=require('../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withSameTargetAttachEnergySelection}=require('../twinleaf/same-target-attach-energy-hook.cjs');
const {withBilateralMultiBasicPaidRetreat}=require('../twinleaf/agent2-bilateral-multi-basic-retreat-bot.cjs');
const {actorObservation}=require('../twinleaf/actor-observation-contract.cjs');
const FROZEN=[[3565472974,0,"fe2a2f8d189c3c98db8a315e37051106b70309cee9fc572faef0d2cf39d5fa7f","df6e3f0db56316667a09d285b0f4a09b5cf3d955e113b1e2364c14b9f243a222","6962589458ad2b03bd3344f139cd7fa31bc6e62be6e932d7ace75f81eafb7652"],[3565472974,1,"c2b4019e4fd9db4d0facb714b429abe59ff7ef0bbaa21aba0cb98fdb5fa4e148","b1a840820c97a30f51698973a43d48b1ea48553f5f2166bd9eae183959f4b197","577d2b00f6a53e1fc8aeeba138ab5b20a753567fa48678706005d7375c4e34e3"],[130758722,0,"5236177955b9393c59f1fd5b88403e4afcfca36b0545e0fd0ce2c818508def5f","e07b723019a4bbb593b5cfac9567ff580027f5b0ab14ddccdc91a7e5974e6dc3","d77f412eede618e90e0e3e99d50042bc6bc35a7a7d1d2db791976f1ef262b289"],[130758722,1,"a5c35dae2b66b2a5163e94745c1c0aaef1312d61504b7c43586fe9b0c3f8c893","fffd32fb8d9ba760bc505e94b08b21083044c127da9be2835072feaaec593f29","2a3ef6496b970ec11234b84eb5b2df1c96d99dc4fb138f591ba610eaf9df5889"],[3792360798,0,"02bb2b2e4b28d1cfc9e030e70c38f389fa37948e8c3dceb34472133f4753582a","37ed042b42966fd5c2232d28d1e458131e0ba9e0febf14cb3ad2961710c70c46","f41dea697fa43e85a6278e8522692c1ca0cc0c11e1ee2b10b2c007e193640f0c"],[3792360798,1,"b577aad657950cdbbd02f11f1c43fb593354a7e2aa2ae10b749aecb0abdef0da","e1cac398b33852faae99b88c69082055ba47acd685e8bb0a7b6059b6efc57143","c14ff4a164c9c72a4d8348f25e022305baf97c60996417d2db40ed5ec6797224"],[1654918696,0,"9d7c93ada82caf2f0d02e79d4d4f9601b5eee88f918be7711cd56aecab9609cd","cf4bcb1ac20b9219841330074d85214afa2a3c744af1e12f0ec2946e5f168754","35c53f15fa7a3d0b97bfccfaec16968ac574880a6349d000eb086fa5a691948f"],[1654918696,1,"6119a9838d2af7fb932db8971c1e9ece50d11fde6dca5278625773405400ac18","1834d0a276140edf1f7d95fd5e32313672372ce19d018b3f9b7b39d3b276636e","418c15f2c88ffc900816668764adedc76a2e02de340c16ea2d9329a0357f136e"]];
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * Native effect-only cost calculation at genuine pre-Pass State.
 * @param {object} state Actual Store State.
 * @param {0|1} seat Acting physical seat.
 * @returns {object} Detached, wholly public per-Pass receipt.
 */
function checkCostAtPass(state,seat){
  const view=actorObservation(state,seat),active=view.ownPublic.active;
  if(!active)return {seat,turn:view.globalTurn,active:null,skipped:'no-active'};
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(output,'game/store/store'));
  const {CheckRetreatCostEffect}=require(path.join(output,
    'game/store/effects/check-effects'));
  const before=JSON.stringify(view);
  const observer=new Store({onStateChange(){}});
  observer.state=state;
  const effect=new CheckRetreatCostEffect(state.players[seat]);
  observer.reduceEffect(state,effect);
  assert.equal(JSON.stringify(actorObservation(state,seat)),before,
    'Native cost check mutated public actor observation');
  return {
    seat,turn:view.globalTurn,active:active.printing,
    activeAttached:active.energies,activeTools:active.tools,
    printedRetreat:active.printed.retreatCost,
    effectiveRetreat:effect.cost,
    ownSkyliner:(view.ownPublic.bench??[]).filter(x=>
      x?.abilities?.includes('Skyliner')).map(x=>x.printing),
    ownStadium:view.ownPublic.stadium,
    opponentStadium:view.opponentPublic.stadium,
    opponentActive:view.opponentPublic.active?.printing??null,
    opponentBench:(view.opponentPublic.bench??[]).map(x=>x?.printing??null),
    publicOwnRestrictions:view.ownPublic.publicTurnRestrictions,
    publicOpponentRestrictions:view.opponentPublic.publicTurnRestrictions,
    unchangedView:true
  };
}
/** @returns {object} All eight previously frozen unchanged controls. */
function run(){
  initializeCards();
  const cards=originals(),rows=[];
  const vars=['AGENT8_ACTOR_QUICK_BALL_DEV',
    'AGENT41_OWNER_TERMINAL_ARBITRATION_DEV'];
  const saved=vars.map(k=>[k,process.env[k]]);
  try {
    for(const [key] of saved)process.env[key]='false';
    for(const [seed,rank3Seat,full,source,ledger] of FROZEN){
      const receipts=[];let audit=null;
      const deckA=rank3Seat===0?cards.source:cards.candidate;
      const deckB=rank3Seat===0?cards.candidate:cards.source;
      try {
        const guarded=withNativePaperSupporterDiscipline(()=>
          withCanonicalActorOnlyPolicy(()=>{
            const probe=withBilateralMultiBasicPaidRetreat(()=>
              withSameTargetAttachEnergySelection(()=>runMatch({
                deckA,deckB,seed,maxActions:520,
                label:'agent2-skyliner-pass-'+seed+'-'+rank3Seat,
                strictPromptValidation:true,
                mandatoryOptionFallback:true,enforceSelectOptionLegality:true,
                enforceVisiblePlayLockBothSeats:true,
                captureInitialFullPhysicalDeal:true,
                captureInitialSourceDealFingerprintSeat:rank3Seat,
                captureDecisionTrace:true,capturePublicAttackTransitions:true,
                captureNativeAbortEvidence:true,captureFinalPublicBoard:true
              })).result,{
                observe:(state,seat)=>{
                  receipts.push(checkCostAtPass(state,seat));
                  return actorObservation(state,seat);
                },
                observeFirstTurnPassOnly:true,choose:()=>null
              });
            audit=probe.audit;return probe.result;
          },{root:work=>withActorOnlyRootPolicy(work,{
            publicContextSpecialEnergy:true,specialEnergyRoot:true,
            energyRecipientFrontier:true
          })},{ownerSingleSearch:true,genericFallbackAttribution:true})
        );
        const game=guarded.result.result,roots=game.rootActionLedger??[];
        const passes=roots.filter(x=>x.action==='PassTurnAction');
        const passSeats=[0,1].map(seat=>passes.filter(x=>
          x.playerSlot===seat).length);
        const actualFull=game.initialFullPhysicalDealFingerprint
          ?.digestSha256??null;
        const actualSource=game.initialSourceDealFingerprint
          ?.digestSha256??null;
        const actualLedger=hash(roots);
        const match=game.finished===true&&actualFull===full&&
          actualSource===source&&actualLedger===ledger&&
          receipts.length===passes.length&&
          JSON.stringify(audit?.originalPassesBySeat)===
            JSON.stringify(passSeats);
        rows.push({seed,rank3Seat,rank1Seat:1-rank3Seat,
          status:match?'exact-reference-reproduced':'unresolved',
          nativeWinner:game.winner,actualFull,actualSource,
          actualLedger,expectedFull:full,expectedSource:source,
          expectedLedger:ledger,passSeats,passes:passes.length,
          receipts,qualifiedGames:0});
      }catch(error){
        rows.push({seed,rank3Seat,status:'native-error',
          error:String(error?.stack??error).slice(0,5000),
          attemptedPasses:receipts.length,qualifiedGames:0});
      }
    }
    const all=rows.flatMap(r=>(r.receipts??[]).map(x=>({...x,
      seed:r.seed,rank3Seat:r.rank3Seat,
      rank1Seat:r.rank1Seat})));
    const d=all.filter(x=>x.active==='Dialga-GX UPR');
    return {version:'agent2-skyliner-original-eight-native-v1',
      pinnedTwinleaf:PIN,allEightReproduced:rows.length===8&&
        rows.every(r=>r.status==='exact-reference-reproduced'),
      originalPasses:all.length,dialgaPasses:d.length,
      dialgaSkyliner:d.filter(x=>x.ownSkyliner.length>0).length,
      dialgaSkylinerFree:d.filter(x=>
        x.ownSkyliner.length>0&&x.effectiveRetreat.length===0).length,
      rows,qualifiedGames:0};
  }finally{
    for(const [key,value] of saved){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}
if(require.main===module){
  const x=run();process.stdout.write(JSON.stringify(x)+'\n');
  if(!x.allEightReproduced||x.originalPasses!==358)process.exitCode=1;
}
module.exports={FROZEN,checkCostAtPass,run};
