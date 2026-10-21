'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runMatch}=require('./headless.cjs');
const {SAMPLES,sourceCynthiaChoices,ENGINE_PIN}=
  require('./agent24-cynthia-source-exposure.cjs');
const {isPrintedCynthiaCaitlinRecovery}=
  require('./cynthia-caitlin-required-recovery.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName */
const engine=moduleName=>require(path.join(output,moduleName));
/** @param {unknown} value */
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Replace only the source owner's first genuine C&C null prompt action.
 * Keep pre-prompt bot proposals and speculative scores byte-for-byte identical.
 * @template T
 * @param {0|1} sourceSeat
 * @param {boolean} correctFirst
 * @param {()=>T} execute
 * @returns {{result:T,audit:object}}
 */
function withFirstNativeCynthiaMode0(sourceSeat,correctFirst,execute){
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.equal(typeof execute,'function');
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const old=SimpleTacticsAi.prototype.decodeNextAction;
  const sourcePlayerId=sourceSeat===0?101:202;
  let observed=null,changed=0;
  SimpleTacticsAi.prototype.decodeNextAction=function(state){
    const action=old.call(this,state);
    if(observed||this.client?.id!==sourcePlayerId)return action;
    const prompt=state.prompts.find(p=>
      p.result===undefined &&
      p.playerId===sourcePlayerId &&
      isPrintedCynthiaCaitlinRecovery(p));
    if(!prompt||!(action instanceof ResolvePromptAction)||
       action.id!==prompt.id||action.result!==null)return action;
    observed={
      globalTurn:state.turn,
      promptId:prompt.id,
      originalChoice:null,
      allowCancelMetadata:prompt.options?.allowCancel,
      sourcePrinting:prompt.sourceCard?.fullName,
      values:prompt.values.slice()
    };
    if(!correctFirst)return action;
    changed=1;
    return new ResolvePromptAction(prompt.id,0);
  };
  try{
    const result=execute();
    return {result,audit:{sourceSeat,correctFirst,observed,changed,
      interceptScope:'first genuine source-held C&C null after actual Store committed Supporter'}};
  }finally{
    SimpleTacticsAi.prototype.decodeNextAction=old;
  }
}

/** Four frozen authentic source lists, eight arms, including absent opportunities. */
function runSourceCynthiaSameState({maxActions=240}={}){
  const raw=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const ranks=new Map(raw.decks.map(d=>[d.rank,d]));
  const attempts=SAMPLES.map(sample=>{
    const sourceSeat=sample.rankA===sample.sourceRank?0:1;
    const deckA=ranks.get(sample.rankA).cardIds;
    const deckB=ranks.get(sample.rankB).cardIds;
    const arms=[false,true].map(correctFirst=>{
      try{
        const out=withFirstNativeCynthiaMode0(sourceSeat,correctFirst,()=>
          runMatch({
            deckA,deckB,seed:sample.seed,maxActions,
            label:'agent24-first-native-cynthia-'+sample.seed+'-'+correctFirst,
            strictPromptValidation:true,enforceSelectOptionLegality:true,
            supporterDecisionCorrection:true,isolatePolicyRandomness:true,
            captureDecisionTrace:true,mandatoryOptionFallback:true
          }));
        const game=out.result;
        return {
          correctFirst,audit:out.audit,
          status:game.finished?'engine-terminal':'censored',
          actions:game.actions,turns:game.turns,
          prizesRemaining:game.prizesRemaining,
          engineWinnerUnqualified:game.winner,
          deckHashes:game.deckHashes,
          firstTurnSlot:game.firstTurnSlot,
          verifiedByDrawLog:game.verifiedByDrawLog,
          rootLedgerSha256:sha(game.rootActionLedger),
          nativeCynthiaChoices:sourceCynthiaChoices(game.decisionTrace||[],sourceSeat),
          ledger:game.rootActionLedger,
          competitivelyQualified:false
        };
      }catch(error){
        return {correctFirst,status:'engine-error',
          error:String(error?.stack||error),competitivelyQualified:false};
      }
    });
    const [control,corrected]=arms;
    const beforeChoice=control.nativeCynthiaChoices?.find(x=>x.nativeModeObserved);
    const correctedChoice=corrected.nativeCynthiaChoices?.find(x=>x.nativeModeObserved);
    const beforeRoot=beforeChoice?.nextRoot;
    const prefix=arm=>beforeRoot==null?null:arm.ledger?.filter(
      event=>event.actionOrdinal<beforeRoot);
    const sameDecks=Boolean(control.deckHashes&&corrected.deckHashes)&&
      sha(control.deckHashes)===sha(corrected.deckHashes);
    const sameFirst=Boolean(control.verifiedByDrawLog&&corrected.verifiedByDrawLog)&&
      control.firstTurnSlot===corrected.firstTurnSlot;
    const sameHistory=Boolean(prefix(control)&&prefix(corrected))&&
      sha(prefix(control))===sha(prefix(corrected));
    const genuineMatchedFork=Boolean(
      beforeChoice&&correctedChoice&&sameDecks&&sameFirst&&sameHistory&&
      beforeChoice.nextRoot===correctedChoice.nextRoot&&
      beforeChoice.wasNull===true&&correctedChoice.choice===0&&
      corrected.audit?.changed===1
    );
    const noOpportunityInEither=Boolean(
      control.audit?.observed===null && corrected.audit?.observed===null &&
      sameDecks && sameFirst &&
      control.rootLedgerSha256===corrected.rootLedgerSha256
    );
    return {
      sample,sourceSeat,sameDecks,sameFirst,sameHistory,
      firstControlMode:beforeChoice??null,
      firstCorrectedMode:correctedChoice??null,
      genuineMatchedFork,noOpportunityInEither,
      arms:arms.map(({ledger,...record})=>record)
    };
  });
  return {
    schema:'agent24-source-cynthia-first-native-null-to-mode0-v1',
    enginePin:ENGINE_PIN,maxActions,attempts,
    realMatchedFirstModes:attempts.filter(a=>a.genuineMatchedFork).length,
    strictNoOpportunityControls:attempts.filter(a=>a.noOpportunityInEither).length,
    competitiveQualifiedGames:0,
    warning:'One changed genuine source-owned prompt after byte-identical preprompt ledgers; no inferred match win rates, paper timing or competent play.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runSourceCynthiaSameState(),null,2)+'\n');
module.exports={withFirstNativeCynthiaMode0,runSourceCynthiaSameState};
