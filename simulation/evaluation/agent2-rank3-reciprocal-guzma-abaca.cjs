'use strict';
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
const {withCanonicalActorOnlyPolicy}=require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withNativePaperSupporterDiscipline}=require('../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withSameTargetAttachEnergySelection}=require('../twinleaf/same-target-attach-energy-hook.cjs');
const {withRank3SourceGuzmaReply}=require('../twinleaf/agent2-rank3-owned-guzma-reply.cjs');
const base=require('./agent2-rank1-original-guzma-counterplay-aba.cjs');
const FULL='e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb';
const SOURCE='ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a';

/** @returns {object} Original A/B/C/A and a reciprocal source-Guzma branch. */
function run(){
  initializeCards();
  const cards=originals();
  const prior=process.env.AGENT2_INCLUDE_VMAX_ABCA;
  let controls;
  try{
    process.env.AGENT2_INCLUDE_VMAX_ABCA='true';
    controls=base.run();
  }finally{
    if(prior===undefined)delete process.env.AGENT2_INCLUDE_VMAX_ABCA;
    else process.env.AGENT2_INCLUDE_VMAX_ABCA=prior;
  }
  const old=new Map([
    ['AGENT8_ACTOR_QUICK_BALL_DEV',process.env.AGENT8_ACTOR_QUICK_BALL_DEV],
    ['AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV]
  ]);
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='false';
    let sourceAudit=null,rank1Audit=null;
    const guarded=withNativePaperSupporterDiscipline(()=>
      withCanonicalActorOnlyPolicy(()=>{
        const rank1=base.withRank1HeldGuzmaCounterplay(()=>{
          const source=withRank3SourceGuzmaReply(()=>
            withSameTargetAttachEnergySelection(()=>runMatch({
              deckA:cards.source,deckB:cards.candidate,
              seed:290134,maxActions:520,
              label:'agent2-rank3-reciprocal-guzma-original-physical',
              strictPromptValidation:true,mandatoryOptionFallback:true,
              enforceSelectOptionLegality:true,
              enforceVisiblePlayLockBothSeats:true,
              captureInitialFullPhysicalDeal:true,
              captureInitialSourceDealFingerprintSeat:0,
              captureDecisionTrace:true,capturePublicAttackTransitions:true,
              captureNativeAbortEvidence:true,captureFinalPublicBoard:true
            })).result);
          sourceAudit=source.audit;
          return source.result;
        },{evolveVmax:true});
        rank1Audit=rank1.audit;
        return rank1.result;
      },{root:work=>withActorOnlyRootPolicy(work,{
        publicContextSpecialEnergy:true,specialEnergyRoot:true
      })},{ownerSingleSearch:true,genericFallbackAttribution:true})
    );
    const game=guarded.result.result;
    const roots=game.rootActionLedger;
    const a=game.attackDeclarationTrace;
    const ownGuzma=roots.filter(x=>x.playerSlot===0&&
      x.action==='PlayCardAction'&&x.card==='Guzma');
    const oppGuzma=roots.filter(x=>x.playerSlot===1&&
      x.action==='PlayCardAction'&&x.card==='Guzma');
    const checks={
      matchingFullPhysicalDeal:game.initialFullPhysicalDealFingerprint?.digestSha256===FULL,
      matchingSourceDeal:game.initialSourceDealFingerprint?.digestSha256===SOURCE,
      originalControlsRepeat:controls.controls.repeatedControlExactRootLedger,
      actualOpponentGuzma:oppGuzma.length===1,
      actualSourceGuzma:ownGuzma.length===1,
      sourceNativeBothPrompts:sourceAudit.ownChoices===1&&
        sourceAudit.opposingChoices===1
    };
    return {schema:'agent2-reciprocal-source-guzma-v1',
      seed:290134,nativePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      checks,checksPass:Object.values(checks).every(Boolean),
      existingArms:controls.arms.map(x=>({arm:x.arm,status:x.status,
        winner:x.winner,turns:x.turns,actions:x.actions,
        burrows:x.rank3ActualBurrowCount,filch:x.rank1FilchCount,
        rootLedgerSha256:x.rootLedgerSha256})),
      treatment:{finished:game.finished,winner:game.winner,
        turns:game.turns,actions:game.actions,
        fullDeal:game.initialFullPhysicalDealFingerprint?.digestSha256,
        sourceDeal:game.initialSourceDealFingerprint?.digestSha256,
        ownGuzma,oppGuzma,sourceAudit,rank1Audit,
        burrows:a.filter(x=>x.playerSlot===0&&x.attackName==='Burrow').length,
        opponentAttacks:a.filter(x=>x.playerSlot===1).map(x=>x.attackName),
        sourceActions:roots.filter(x=>x.playerSlot===0&&
          ['PlayCardAction','AttackAction','RetreatAction','PassTurnAction'].includes(x.action)),
        terminal:game.terminalTransition??null},
      competitivelyQualifiedGames:0};
  }finally{
    for(const [key,v] of old){
      if(v===undefined)delete process.env[key];
      else process.env[key]=v;
    }
  }
}
if(require.main===module){
  try{
    const result=run();
    process.stdout.write(JSON.stringify(result,null,2)+'\n');
    if(!result.checksPass)process.exitCode=1;
  }catch(error){
    process.stdout.write(JSON.stringify({status:'native-error',
      error:String(error?.stack??error).slice(0,3500),
      competitivelyQualifiedGames:0},null,2)+'\n');
    process.exitCode=1;
  }
}
module.exports={run};
