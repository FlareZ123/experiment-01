'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runMatch}=require('./headless.cjs');

const SOURCE_PAIRS=Object.freeze([
  {sourceRank:2,rankA:2,rankB:1,seed:20261021},
  {sourceRank:2,rankA:1,rankB:2,seed:20261023}
]);
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Extract source-played Guzma & Hala mode selections from a genuine
 * post-dispatch decision trace. An intervening unrelated choice is recorded
 * as unresolved rather than automatically attributed to the Supporter.
 * @param {object[]} trace Post-choice live Store decisions.
 * @param {0|1} seat Physical owner of the published G&H deck.
 * @returns {object[]}
 */
function sourceGuzmaChoices(trace,seat) {
  assert.ok(seat===0||seat===1);
  const playIndices=trace.map((row,index)=>({row,index})).filter(({row})=>
    row.playerSlot===seat &&
    row.action==='PlayCardAction' && row.card==='Guzma & Hala');
  return playIndices.map(({row,index})=>{
    const after=trace.slice(index+1).find(next=>
      next.actionOrdinal > row.actionOrdinal && (
        (next.playerSlot===seat && next.action==='ResolvePromptAction') ||
        (next.playerSlot===seat && next.action==='PlayCardAction') ||
        next.turnBefore!==row.turnBefore
      ));
    const modal=after?.playerSlot===seat &&
      after.turnBefore===row.turnBefore &&
      after.action==='ResolvePromptAction' &&
      after.optionSelection?.promptKind==='SelectOptionPrompt' ?
      after:null;
    return {
      supporterOrdinal:row.actionOrdinal,turn:row.turnBefore,
      nextObservedRootOrdinal:after?.actionOrdinal??null,
      selectedOption:modal?modal.optionSelection.selectedOption:null,
      nativeOptionObserved:Boolean(modal),
      modeResultIsNull:modal?modal.optionSelection.selectedOption===null:null,
      modeText:modal?modal.optionSelection.selectedText:null
    };
  });
}

/**
 * Native source-60 matched policy contrast, retaining all failed and capped
 * histories. No wins from these unqualified bots count as competitive evidence.
 *
 * @param {{maxActions?:number}} [config]
 * @returns {object}
 */
function runSourceExposure({maxActions=260}={}){
  assert.ok(Number.isSafeInteger(maxActions)&&maxActions>=1);
  const raw=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const byRank=new Map(raw.decks.map(deck=>[deck.rank,deck]));
  const attempts=[];
  for(const sample of SOURCE_PAIRS) {
    const deckA=byRank.get(sample.rankA);
    const deckB=byRank.get(sample.rankB);
    assert.ok(deckA?.playableUnderEngine&&deckB?.playableUnderEngine,
      'Published rank1/rank2 exact source input must resolve');
    const sourceSeat=sample.rankA===sample.sourceRank?0:1;
    const rows=[false,true].map(mandatoryOptionFallback=>{
      try{
        const game=runMatch({
          deckA:deckA.cardIds,deckB:deckB.cardIds,seed:sample.seed,
          maxActions,label:'agent24-real-source-mandatory-option-'+
            sample.seed+'-'+String(mandatoryOptionFallback),
          strictPromptValidation:true,supporterDecisionCorrection:true,
          isolatePolicyRandomness:true,captureDecisionTrace:true,
          mandatoryOptionFallback
        });
        const trace=game.decisionTrace||[];
        const options=trace.filter(event=>event.optionSelection).map(event=>({
          ordinal:event.actionOrdinal,turn:event.turnBefore,
          actorSeat:event.playerSlot,
          result:event.optionSelection.selectedOption,
          message:event.optionSelection.message
        }));
        return {
          mandatoryOptionFallback,
          status:game.finished?'engine-terminal':'bounded-or-incomplete',
          actions:game.actions,turns:game.turns,
          engineFinished:game.finished,
          engineWinnerUnqualified:game.winner,
          engineDeckHashes:game.deckHashes,
          actualFirstTurnSlot:game.firstTurnSlot,
          verifiedByDrawLog:game.verifiedByDrawLog,
          policy:game.policy,
          rootActionLedgerSha256:digest(game.rootActionLedger),
          sourcePlayedGuzmaChoices:sourceGuzmaChoices(trace,sourceSeat),
          allObservedOptions:options,
          observedNullOptions:options.filter(row=>row.result===null).length,
          qualifiesForCompetitiveInference:false
        };
      }catch(error){
        return {mandatoryOptionFallback,status:'engine-error',
          error:String(error?.stack||error),
          qualifiesForCompetitiveInference:false};
      }
    });
    attempts.push({
      sample,sourceSeat,arms:rows,
      sameResolvedDeckIds:JSON.stringify(deckA.cardIds)===
        JSON.stringify(byRank.get(sample.rankA).cardIds) &&
        JSON.stringify(deckB.cardIds)===
        JSON.stringify(byRank.get(sample.rankB).cardIds),
      sameFirstTurn:rows.every(row=>row.verifiedByDrawLog) &&
        rows[0].actualFirstTurnSlot===rows[1].actualFirstTurnSlot,
      sameDeckHashes:rows[0].engineDeckHashes&&rows[1].engineDeckHashes?
        JSON.stringify(rows[0].engineDeckHashes)===
          JSON.stringify(rows[1].engineDeckHashes):false
    });
  }
  return {
    schema:'agent24-genuine-source-mandatory-modal-exposure-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourcePairs:SOURCE_PAIRS,
    sourceOpponents:[1,2],
    maxActions,attempts,
    attemptedArms:attempts.reduce((sum,attempt)=>sum+attempt.arms.length,0),
    competitiveQualifiedGames:0,
    conclusionRule:'Actual accepted source Supporter plus following option is required to attribute a canceled mode. No source opportunity is a valid negative result.',
    caveat:'Untimed bot-policy source-dealt diagnostic. Same input prints, physical seats and seeds cannot guarantee equal downstream draws following different choices; source rank2 competence is unqualified.'
  };
}

if(require.main===module) {
  process.stdout.write(JSON.stringify(runSourceExposure(),null,2)+'\n');
}
module.exports={SOURCE_PAIRS,sourceGuzmaChoices,runSourceExposure};
