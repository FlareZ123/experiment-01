'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runMatch}=require('./headless.cjs');
const {SOURCE_PAIRS,sourceGuzmaChoices}=
  require('./agent24-mandatory-source-exposure.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(OUTPUT,name));
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Intercept only the first real source owner's noncancelable G&H native option
 * prompt, after the generic bot has already chosen the Supporter and returned
 * its default null prompt action. Neither pre-prompt setup nor speculative
 * Supporter evaluation gets the more capable global resolver.
 *
 * @template T
 * @param {0|1} sourceSeat
 * @param {boolean} changeMode
 * @param {()=>T} execute
 * @returns {{result:T,audit:object}}
 */
function withFirstLiveGuzmaMode0(sourceSeat,changeMode,execute){
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.equal(typeof changeMode,'boolean');
  assert.equal(typeof execute,'function');
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const sourceId=sourceSeat===0?101:202;
  let firstObserved=null;
  let changed=0;
  SimpleTacticsAi.prototype.decodeNextAction=function(state){
    const action=original.call(this,state);
    if(this.client?.id!==sourceId||firstObserved)return action;
    const prompt=state.prompts.find(p=>
      p.result===undefined && p.playerId===sourceId &&
      p.constructor.name==='SelectOptionPrompt' &&
      p.options.allowCancel===false &&
      p.values.some(value=>String(value).includes('Stadium')));
    if(!prompt || !(action instanceof ResolvePromptAction) ||
        action.id!==prompt.id || action.result!==null)return action;
    firstObserved={
      turn:state.turn,promptMessage:prompt.message??null,
      defaultValue:prompt.options.defaultValue??null,
      offeredValues:prompt.values.slice(),
      originallySelected:null,
      originalActionClass:action.constructor.name
    };
    if(!changeMode)return action;
    changed=1;
    return new ResolvePromptAction(prompt.id,0);
  };
  try{
    const result=execute();
    return {result,audit:{
      sourceSeat,changeMode,
      firstObserved,correctedNativeDecisions:changed,
      scope:'First real rank2 source G&H mode resolution only; no generic speculative option upgrade'
    }};
  }finally{
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

/**
 * Two authentic both-physical-seat rank2 games, each replayed from the
 * identical seed and unchanged generic pre-commit source bot. Only one native
 * modal return is replaced in the intervention arm.
 *
 * @param {{maxActions?:number}} [config]
 * @returns {object}
 */
function runNativeModalFork({maxActions=260}={}){
  const raw=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const byRank=new Map(raw.decks.map(deck=>[deck.rank,deck]));
  const attempts=SOURCE_PAIRS.map(sample=>{
    const sourceSeat=sample.rankA===sample.sourceRank?0:1;
    const deckA=byRank.get(sample.rankA)?.cardIds;
    const deckB=byRank.get(sample.rankB)?.cardIds;
    assert.equal(deckA?.length,60);
    assert.equal(deckB?.length,60);
    const rawArms=[false,true].map(changeMode=>{
      try {
        const observed=withFirstLiveGuzmaMode0(sourceSeat,changeMode,()=>
          runMatch({
            deckA,deckB,seed:sample.seed,maxActions,
            label:'agent24-native-live-mode0-'+sample.seed+'-'+changeMode,
            strictPromptValidation:true,supporterDecisionCorrection:true,
            isolatePolicyRandomness:true,captureDecisionTrace:true
          }));
        const game=observed.result;
        return {changeMode,audit:observed.audit,
          engineStatus:game.finished?'engine-terminal':'censored',
          actions:game.actions,turns:game.turns,
          verifiedByDrawLog:game.verifiedByDrawLog,
          firstTurnSlot:game.firstTurnSlot,
          deckHashes:game.deckHashes,
          rootActionLedgerSha256:sha(game.rootActionLedger),
          nativeGuzmaChoices:sourceGuzmaChoices(game.decisionTrace,sourceSeat),
          ledger:game.rootActionLedger,
          competitiveQualifiedGame:false
        };
      }catch(error){
        return {changeMode,engineStatus:'engine-error',
          error:String(error?.stack||error),competitiveQualifiedGame:false};
      }
    });
    const [control,corrected]=rawArms;
    const firstOriginal=control.nativeGuzmaChoices?.[0]??null;
    const firstCorrected=corrected.nativeGuzmaChoices?.[0]??null;
    const ordinal=firstOriginal?.nextObservedRootOrdinal??null;
    const before=arm=>ordinal===null?null:
      arm.ledger?.filter(root=>root.actionOrdinal<ordinal)??null;
    const sameInput=control.deckHashes&&corrected.deckHashes&&
      JSON.stringify(control.deckHashes)===JSON.stringify(corrected.deckHashes);
    const sameActualFirst=control.verifiedByDrawLog &&
      corrected.verifiedByDrawLog &&
      control.firstTurnSlot===corrected.firstTurnSlot;
    const sameRootPrefix=before(control)&&before(corrected)?
      sha(before(control))===sha(before(corrected)):false;
    const strictMatchedNativeFork=Boolean(sameInput&&sameActualFirst&&
      sameRootPrefix&&firstOriginal?.nativeOptionObserved&&
      firstCorrected?.nativeOptionObserved&&
      firstOriginal.nextObservedRootOrdinal===
        firstCorrected.nextObservedRootOrdinal&&
      firstOriginal.modeResultIsNull===true&&
      firstCorrected.selectedOption===0&&
      corrected.audit?.correctedNativeDecisions===1);
    return {
      sample,sourceSeat,sameInput,sameActualFirst,sameRootPrefix,
      firstOriginal,firstCorrected,
      controlFirstObserved:control.audit?.firstObserved??null,
      interventionFirstObserved:corrected.audit?.firstObserved??null,
      strictMatchedNativeFork,
      arms:rawArms.map(({ledger,...visible})=>visible)
    };
  });
  return {
    schema:'agent24-same-preprompt-native-gh-null-to-zero-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    maxActions,attempts,
    strictMatchedNativeForks:attempts.filter(x=>x.strictMatchedNativeFork).length,
    competitiveQualifiedGames:0,
    note:'Only the first source native modal response is changed, after the original generic bot committed G&H. Each matching prefix is independently checked. No complete-game or human strength inference.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runNativeModalFork(),null,2)+'\n');
module.exports={withFirstLiveGuzmaMode0,runNativeModalFork};
