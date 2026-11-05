'use strict';

const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withNativePaperSupporterDiscipline}=
  require('../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withSameTargetAttachEnergySelection}=
  require('../twinleaf/same-target-attach-energy-hook.cjs');
const {withRank3SourceGuzmaReply}=
  require('../twinleaf/agent2-rank3-owned-guzma-reply.cjs');
const {withOwnedBunnelbySecondBurrow}=
  require('./agent2-rank3-original-omega-burrow-aba.cjs');
const {withRank1HeldGuzmaCounterplay}=
  require('./agent2-rank1-original-guzma-counterplay-aba.cjs');

const SEED=290134;
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const FULL='e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb';
const SOURCE='ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Registered same-original-deal source-versus-source policy arms.
 * The Omega arm differs solely by accepting a second Burrow prompt after a
 * genuine already-declared Bunnelby Burrow, both source-owned decisions.
 *
 * @param {string} arm
 * @param {object} cards Exact original converted 60s.
 * @returns {object} Native Store outcomes, including aborts and caps.
 */
function runArm(arm,cards){
  const withOmega=arm==='source-guzma+omega';
  let sourceAudit=null,rank1Audit=null,omegaAudit=null;
  try{
    const guarded=withNativePaperSupporterDiscipline(()=>
      withCanonicalActorOnlyPolicy(()=>{
        const rank1=withRank1HeldGuzmaCounterplay(()=>{
          const source=withRank3SourceGuzmaReply(()=>{
            const exec=()=>withSameTargetAttachEnergySelection(()=>
              runMatch({
                deckA:cards.source,deckB:cards.candidate,seed:SEED,
                maxActions:520,
                label:'agent2-source-guzma-omega-'+arm,
                strictPromptValidation:true,mandatoryOptionFallback:true,
                enforceSelectOptionLegality:true,
                enforceVisiblePlayLockBothSeats:true,
                captureInitialFullPhysicalDeal:true,
                captureInitialSourceDealFingerprintSeat:0,
                captureDecisionTrace:true,
                capturePublicAttackTransitions:true,
                captureNativeAbortEvidence:true,
                captureFinalPublicBoard:true
              })).result;
            if(!withOmega)return exec();
            const omega=withOwnedBunnelbySecondBurrow(exec);
            omegaAudit=omega.audit;
            return omega.result;
          });
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
    const attacks=game.attackDeclarationTrace;
    return {arm,status:game.finished?'native-terminal':'native-cap',
      initialFullDeal:game.initialFullPhysicalDealFingerprint?.digestSha256,
      initialSourceDeal:game.initialSourceDealFingerprint?.digestSha256,
      winner:game.winner,turns:game.turns,actions:game.actions,
      rootLedgerSha256:digest(roots),
      ownerGuzmaRoots:roots.filter(x=>x.playerSlot===0&&
        x.action==='PlayCardAction'&&x.card==='Guzma'),
      rank1GuzmaRoots:roots.filter(x=>x.playerSlot===1&&
        x.action==='PlayCardAction'&&x.card==='Guzma'),
      sourceBurrowTurns:attacks.filter(x=>x.playerSlot===0&&
        x.attackName==='Burrow').map(x=>x.turnBefore),
      rank1Attacks:attacks.filter(x=>x.playerSlot===1)
        .map(x=>({turn:x.turnBefore,name:x.attackName})),
      sourceAudit,rank1Audit,omegaAudit,
      terminal:game.terminalTransition?.after??null,
      competitivelyQualified:false};
  }catch(error){
    return {arm,status:'native-error',
      message:String(error?.stack??error).slice(0,3500),
      competitivelyQualified:false};
  }
}

/** @returns {object} Closed registered A/B/A physical experiment. */
function run(){
  initializeCards();
  const cards=originals();
  const env=new Map([
    ['AGENT8_ACTOR_QUICK_BALL_DEV',process.env.AGENT8_ACTOR_QUICK_BALL_DEV],
    ['AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',
      process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV]
  ]);
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='false';
    const arms=['source-guzma','source-guzma+omega',
      'source-guzma-repeat'].map(x=>runArm(x,cards));
    const [a,b,again]=arms;
    const unchangedPhysical=arms.every(row=>row.status!=='native-error'&&
      row.initialFullDeal===FULL&&row.initialSourceDeal===SOURCE);
    const repeat=unchangedPhysical&&a.status===again.status&&
      a.winner===again.winner&&a.turns===again.turns&&
      a.actions===again.actions&&a.rootLedgerSha256===again.rootLedgerSha256;
    const sourceGuzmas=arms.every(row=>row.ownerGuzmaRoots?.length===1&&
      row.sourceAudit?.opposingChoices===1&&row.sourceAudit?.ownChoices===1);
    const omegaConfirmed=b.omegaAudit?.acceptedOmegaConfirmPrompts>0&&
      b.omegaAudit?.chosenSecondBurrowPrompts>0;
    return {
      schema:'agent2-source-guzma-second-burrow-aba-v1',
      seed:SEED,nativePin:PIN,registeredArms:arms.map(x=>x.arm),
      checks:{unchangedPhysical,repeat,sourceGuzmas,omegaConfirmed},
      checksPass:unchangedPhysical&&repeat&&sourceGuzmas&&omegaConfirmed,
      arms,competitivelyQualifiedGames:0,
      interpretation:'Single frozen original deal; second owner-only Omega prompt changes policy. All opponents remain unqualified.'};
  }finally{
    for(const [key,value] of env){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}
if(require.main===module){
  try{
    const result=run();
    process.stdout.write(JSON.stringify(result,null,2)+'\n');
    if(!result.checksPass)process.exitCode=1;
  }catch(e){
    process.stdout.write(JSON.stringify({status:'native-error',
      message:String(e?.stack??e).slice(0,3500),
      competitivelyQualifiedGames:0},null,2)+'\n');
    process.exitCode=1;
  }
}
module.exports={runArm,run};
