'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runMatch}=require('./headless.cjs');

const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SAMPLES=Object.freeze([
  {sourceRank:6,rankA:6,rankB:1,seed:20624001},
  {sourceRank:6,rankA:1,rankB:6,seed:20624002},
  {sourceRank:24,rankA:24,rankB:1,seed:20624003},
  {sourceRank:24,rankA:1,rankB:24,seed:20624004}
]);
/** @param {unknown} obj */
const sha=obj=>createHash('sha256').update(JSON.stringify(obj)).digest('hex');

/**
 * Attribute C&C mode only when the same owner answers a native immediately
 * following SelectOptionPrompt before another play or turn transition.
 * This is a post-Store observation; never substitute a speculative prompt.
 * @param {object[]} trace
 * @param {0|1} seat
 * @returns {object[]}
 */
function sourceCynthiaChoices(trace,seat){
  assert.ok(seat===0||seat===1);
  return trace.map((event,index)=>({event,index})).filter(({event})=>
    event.action==='PlayCardAction' &&
    event.playerSlot===seat && event.card==='Cynthia & Caitlin'
  ).map(({event,index})=>{
    const next=trace.slice(index+1).find(row=>
      row.actionOrdinal>event.actionOrdinal && (
        row.turnBefore!==event.turnBefore ||
        (row.playerSlot===seat && (
          row.action==='ResolvePromptAction' || row.action==='PlayCardAction'
        ))
      ));
    const mode=next && next.turnBefore===event.turnBefore &&
      next.playerSlot===seat && next.action==='ResolvePromptAction' &&
      next.optionSelection?.promptKind==='SelectOptionPrompt'?next:null;
    return {
      playRoot:event.actionOrdinal,
      playTurn:event.turnBefore,
      nextRoot:next?.actionOrdinal??null,
      nativeModeObserved:Boolean(mode),
      choice:mode?mode.optionSelection.selectedOption:null,
      wasNull:mode?mode.optionSelection.selectedOption===null:null,
      offeredModeText:mode?.optionSelection.selectedText??null
    };
  });
}

/** Real exact-source bounded contrasts; zero game outcome qualification. */
function runSourceCynthiaExposure({maxActions=240}={}){
  assert.ok(Number.isSafeInteger(maxActions)&&maxActions>0);
  const raw=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const byRank=new Map(raw.decks.map(deck=>[deck.rank,deck]));
  const attempts=SAMPLES.map(sample=>{
    const a=byRank.get(sample.rankA),b=byRank.get(sample.rankB);
    assert.equal(a?.cardIds?.length,60);
    assert.equal(b?.cardIds?.length,60);
    const sourceSeat=sample.rankA===sample.sourceRank?0:1;
    const arms=[false,true].map(printedCynthiaCaitlinRecovery=>{
      try{
        const game=runMatch({
          deckA:a.cardIds,deckB:b.cardIds,seed:sample.seed,maxActions,
          label:'agent24-native-cynthia-'+sample.sourceRank+'-'+
            sample.seed+'-'+printedCynthiaCaitlinRecovery,
          strictPromptValidation:true,enforceSelectOptionLegality:true,
          supporterDecisionCorrection:true,isolatePolicyRandomness:true,
          captureDecisionTrace:true,mandatoryOptionFallback:true,
          printedCynthiaCaitlinRecovery,
          enforcePrintedCynthiaRecovery:printedCynthiaCaitlinRecovery
        });
        const trace=game.decisionTrace||[];
        return {
          corrected:printedCynthiaCaitlinRecovery,
          status:game.finished?'engine-terminal':'censored',
          actions:game.actions,turns:game.turns,prizesRemaining:game.prizesRemaining,
          engineWinnerUnqualified:game.winner,
          firstTurnSlot:game.firstTurnSlot,verifiedByDrawLog:game.verifiedByDrawLog,
          deckHashes:game.deckHashes,rootLedgerSha256:sha(game.rootActionLedger),
          policy:game.policy,
          sourceCynthiaChoices:sourceCynthiaChoices(trace,sourceSeat),
          allNativeModeNulls:trace.filter(row=>
            row.optionSelection?.selectedOption===null).length,
          competitivelyQualified:false
        };
      }catch(error){
        return {corrected:printedCynthiaCaitlinRecovery,status:'engine-error',
          error:String(error?.stack||error),competitivelyQualified:false};
      }
    });
    return {
      sample,sourceSeat,arms,
      sameStartingDeckHashes:arms.every(x=>x.deckHashes)&&
        sha(arms[0].deckHashes)===sha(arms[1].deckHashes),
      samePhysicalFirstTurn:arms.every(x=>x.verifiedByDrawLog)&&
        arms[0].firstTurnSlot===arms[1].firstTurnSlot
    };
  });
  return {
    schema:'agent24-native-source-cynthia-opportunity-census-v1',
    enginePin:ENGINE_PIN,
    attemptedArms:attempts.length*2,maxActions,attempts,
    sourcePrinting:'Cynthia & Caitlin CEC',
    qualifier:'All outcomes are bounded untimed bot results, not competitive games',
    competitiveQualifiedGames:0
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(runSourceCynthiaExposure(),null,2)+'\n');
module.exports={ENGINE_PIN,SAMPLES,sourceCynthiaChoices,runSourceCynthiaExposure};
